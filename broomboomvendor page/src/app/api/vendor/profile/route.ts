import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleOptions } from "@/lib/cors";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get("appId") || searchParams.get("applicationId");
    const orderId = searchParams.get("orderId") || searchParams.get("order_id");
    const userId = searchParams.get("userId") || searchParams.get("username");
    const mobile = searchParams.get("mobile");

    if (!appId && !userId && !mobile && !orderId) {
      return NextResponse.json(
        { success: false, error: "Identifier (appId, orderId, userId, or mobile) required." },
        { status: 400 }
      );
    }

    const cleanedMobile = mobile ? mobile.replace(/\D/g, "").slice(-10) : "";
    const subMobileFilter = cleanedMobile
      ? {
          OR: [
            { vendorMobile: cleanedMobile },
            { vendorMobile: `0${cleanedMobile}` },
            { vendorMobile: `91${cleanedMobile}` },
            { vendorMobile: `+91${cleanedMobile}` },
            { vendorMobile: { endsWith: cleanedMobile } },
          ],
        }
      : null;

    const leadMobileFilter = cleanedMobile
      ? {
          OR: [
            { mobile: cleanedMobile },
            { mobile: `0${cleanedMobile}` },
            { mobile: `91${cleanedMobile}` },
            { mobile: `+91${cleanedMobile}` },
            { mobile: { endsWith: cleanedMobile } },
          ],
        }
      : null;

    // 1. Fetch user record (ordered by newest first)
    let user = userId
      ? await prisma.vendorUser.findFirst({
          where: { userId: { equals: userId, mode: "insensitive" as const } },
          orderBy: { createdAt: "desc" },
        })
      : null;

    if (!user && appId) {
      user = await prisma.vendorUser.findFirst({
        where: { applicationId: { equals: appId, mode: "insensitive" as const } },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!user && subMobileFilter) {
      user = await prisma.vendorUser.findFirst({
        where: subMobileFilter,
        orderBy: { createdAt: "desc" },
      });
    }

    let targetAppId = appId || user?.applicationId || "";
    const targetMobile = cleanedMobile || user?.vendorMobile || "";

    // 2. Fetch Subscription details
    let subscription = null;

    // A. By orderId if provided
    if (orderId) {
      subscription = await prisma.vendorSubscription.findFirst({
        where: { orderId },
        orderBy: { createdAt: "desc" },
      });
    }

    // B. Prioritize PAID subscription by targetAppId
    if (!subscription && targetAppId) {
      subscription = await prisma.vendorSubscription.findFirst({
        where: {
          applicationId: targetAppId,
          paymentStatus: { in: ["PAID", "paid", "SUCCESS", "success"] },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // C. Fallback to any subscription by targetAppId
    if (!subscription && targetAppId) {
      subscription = await prisma.vendorSubscription.findFirst({
        where: { applicationId: targetAppId },
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      });
    }

    // D. Prioritize PAID subscription by mobile
    if (!subscription && subMobileFilter) {
      subscription = await prisma.vendorSubscription.findFirst({
        where: {
          ...subMobileFilter,
          paymentStatus: { in: ["PAID", "paid", "SUCCESS", "success"] },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // E. Fallback to any subscription by mobile
    if (!subscription && subMobileFilter) {
      subscription = await prisma.vendorSubscription.findFirst({
        where: subMobileFilter,
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      });
    }

    if (subscription?.applicationId && !targetAppId) {
      targetAppId = subscription.applicationId;
    }

    // 3. Fetch Lead record
    let lead = null;

    // Prioritize paid lead by targetAppId
    if (targetAppId) {
      lead = await prisma.vendorLead.findFirst({
        where: {
          applicationId: targetAppId,
          status: { in: ["payment_completed", "approved"] },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // Fallback to any lead by targetAppId
    if (!lead && targetAppId) {
      lead = await prisma.vendorLead.findFirst({
        where: { applicationId: targetAppId },
        orderBy: { createdAt: "desc" },
      });
    }

    // Prioritize paid lead by mobile
    if (!lead && leadMobileFilter) {
      lead = await prisma.vendorLead.findFirst({
        where: {
          ...leadMobileFilter,
          status: { in: ["payment_completed", "approved"] },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // Fallback to any lead by mobile
    if (!lead && leadMobileFilter) {
      lead = await prisma.vendorLead.findFirst({
        where: leadMobileFilter,
        orderBy: { createdAt: "desc" },
      });
    }

    if (!targetAppId && lead?.applicationId) {
      targetAppId = lead.applicationId;
    }

    // 4. Determine Payment & Approval State
    const isPaid = Boolean(
      (subscription &&
        ["paid", "active", "success"].includes(
          (subscription.paymentStatus || "").toLowerCase()
        )) ||
      (lead &&
        ["payment_completed", "approved"].includes(
          (lead.status || "").toLowerCase()
        ))
    );

    const isApproved = Boolean(
      lead?.status === "approved" || subscription?.status === "approved"
    );

    const userStatus: "APPROVED" | "PAID_UNDER_PROCESS" | "UNPAID_PENDING_PAYMENT" =
      isApproved
        ? "APPROVED"
        : isPaid
        ? "PAID_UNDER_PROCESS"
        : "UNPAID_PENDING_PAYMENT";

    // 5. Fetch Tickets raised specifically for this application/mobile
    const tickets = await prisma.planChangeTicket.findMany({
      where: {
        ...(targetAppId ? { applicationId: targetAppId } : subMobileFilter ? subMobileFilter : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    // 6. Active Plan Details
    const currentPlan = (
      subscription?.planTier ||
      user?.currentPlan ||
      lead?.preferredPackage ||
      "gold"
    ).toLowerCase();

    // Synchronize vendor user currentPlan if it differs from verified active subscription
    if (user && subscription && user.currentPlan.toLowerCase() !== subscription.planTier.toLowerCase()) {
      try {
        await prisma.vendorUser.update({
          where: { id: user.id },
          data: { currentPlan: subscription.planTier.toLowerCase() },
        });
      } catch (syncErr) {
        console.warn("[PROFILE SYNC WARN]", syncErr);
      }
    }

    const planDetails = {
      tier: currentPlan,
      name:
        currentPlan === "silver"
          ? "Silver Partner (Booking Kiosk)"
          : currentPlan === "platinum"
          ? "Platinum Partner (Regional Master Hub)"
          : "Gold Partner (District Exclusive Hub)",
      baseAmount: subscription?.baseAmount || (currentPlan === "silver" ? 5000 : currentPlan === "platinum" ? 20000 : 10000),
      gatewayFee: subscription?.gatewayFee || (currentPlan === "silver" ? 150 : currentPlan === "platinum" ? 600 : 300),
      gstAmount: subscription?.gstAmount || (currentPlan === "silver" ? 250 : currentPlan === "platinum" ? 1000 : 500),
      totalAmount: subscription?.totalAmount || (currentPlan === "silver" ? 5400 : currentPlan === "platinum" ? 21600 : 10800),
      territoryScope: subscription?.territoryScope || (currentPlan === "silver" ? "Local Ward / Pin Code Hub" : currentPlan === "platinum" ? "State / Regional Master Territory" : "Exclusive District Hub"),
      hasExclusivity: subscription ? subscription.hasExclusivity : currentPlan !== "silver",
      paymentStatus: isPaid ? "PAID" : subscription?.paymentStatus || "PENDING",
      subscriptionId: subscription?.subscriptionId || "SUB-BB-2026-ACTIVE",
      orderId: subscription?.orderId || orderId || "BB-ORDER-VERIFIED",
      startDate: subscription?.startDate || new Date(),
      endDate: subscription?.endDate || null,
      status: subscription?.status || (isPaid ? "active" : "pending"),
    };

    const reviewStage = isApproved
      ? "approved"
      : lead?.status === "rejected"
      ? "rejected"
      : "reviewing";

    const redirectUrl = isPaid
      ? `/thank-you?applicationId=${encodeURIComponent(
          targetAppId
        )}&status=success&from=profile`
      : `/apply?package=${encodeURIComponent(
          currentPlan
        )}&applicationId=${encodeURIComponent(
          targetAppId
        )}&step=confirm&from=profile`;

    return NextResponse.json({
      success: true,
      isPaid,
      isApproved,
      isAdminApproved: isApproved,
      userStatus,
      redirectUrl,
      profile: {
        vendorName: subscription?.vendorName || user?.vendorName || lead?.fullName || "Valued Partner",
        vendorMobile: subscription?.vendorMobile || user?.vendorMobile || lead?.mobile || targetMobile || "",
        vendorEmail: subscription?.vendorEmail || user?.vendorEmail || lead?.email || "",
        city: subscription?.city || lead?.city || "",
        state: subscription?.state || lead?.state || "",
        applicationId: targetAppId || subscription?.applicationId || user?.applicationId || "",
        spaceStatus: lead?.spaceStatus || "Owned commercial space ready",
        carpetArea: lead?.carpetArea || (currentPlan === "platinum" ? "1000+ sq.ft (Regional Master Hub)" : currentPlan === "gold" ? "300 - 500 sq.ft (District Hub)" : "150 - 300 sq.ft (Local Hub)"),
        currentProfession: lead?.currentProfession || "Fleet Operations / Logistics Entrepreneur",
        appliedAt: subscription?.createdAt || lead?.createdAt || new Date(),
      },
      plan: planDetails,
      review: {
        status: reviewStage, // reviewing, approved, rejected
        title:
          reviewStage === "approved"
            ? "Territory License Approved & Exclusivity Active"
            : reviewStage === "rejected"
            ? "Application Rejected by HQ Operations"
            : "Application Under Final Territory Review",
        description:
          reviewStage === "approved"
            ? "Your vendor territory license has been approved by Admin HQ! Territory exclusivity is active and all dashboard facilities are live."
            : reviewStage === "rejected"
            ? "Your application could not be approved at this time. Please contact Admin Operations for assistance."
            : "HQ Operations is verifying your proposed territory exclusivity and commercial documents. Review time: 24 to 48 hours.",
        step: reviewStage === "approved" ? 3 : 2, // 1: Applied, 2: Under Review, 3: Approved
      },
      tickets,
    });
  } catch (error: any) {
    console.error("[VENDOR PROFILE ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch vendor profile" },
      { status: 500 }
    );
  }
}
