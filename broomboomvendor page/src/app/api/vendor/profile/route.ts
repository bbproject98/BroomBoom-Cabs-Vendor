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
    const userId = searchParams.get("userId") || searchParams.get("username");
    const mobile = searchParams.get("mobile");

    if (!appId && !userId && !mobile) {
      return NextResponse.json(
        { success: false, error: "Identifier (appId or userId or mobile) required." },
        { status: 400 }
      );
    }

    // 1. Fetch user record (ordered by newest first)
    // Strict priority: userId -> appId -> mobile to prevent bleed
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

    if (!user && mobile) {
      user = await prisma.vendorUser.findFirst({
        where: { vendorMobile: mobile },
        orderBy: { createdAt: "desc" },
      });
    }

    let targetAppId = appId || user?.applicationId || "";
    const targetMobile = mobile || user?.vendorMobile || "";

    // 2. Fetch Subscription details (strictly prioritize targetAppId if known)
    let subscription = targetAppId
      ? await prisma.vendorSubscription.findFirst({
          where: { applicationId: targetAppId },
          orderBy: [
            { status: "asc" }, // 'active' comes before 'pending'
            { createdAt: "desc" },
          ],
        })
      : null;

    if (!subscription && targetMobile) {
      subscription = await prisma.vendorSubscription.findFirst({
        where: { vendorMobile: targetMobile },
        orderBy: [
          { status: "asc" },
          { createdAt: "desc" },
        ],
      });
    }

    if (subscription?.applicationId && !targetAppId) {
      targetAppId = subscription.applicationId;
    }

    // 3. Fetch Lead record (strictly prioritize targetAppId if known)
    let lead = targetAppId
      ? await prisma.vendorLead.findFirst({
          where: { applicationId: targetAppId },
          orderBy: { createdAt: "desc" },
        })
      : null;

    if (!lead && targetMobile) {
      lead = await prisma.vendorLead.findFirst({
        where: { mobile: targetMobile },
        orderBy: { createdAt: "desc" },
      });
    }

    // 4. Fetch Tickets raised specifically for THIS application
    // Isolate by applicationId to avoid leaking tickets from older/different test applications
    const tickets = await prisma.planChangeTicket.findMany({
      where: {
        ...(targetAppId ? { applicationId: targetAppId } : { vendorMobile: targetMobile }),
      },
      orderBy: { createdAt: "desc" },
    });

    // Determine current active plan:
    // Subscription plan tier is the primary source of truth (what was paid and verified)
    const currentPlan = (
      subscription?.planTier ||
      user?.currentPlan ||
      lead?.preferredPackage ||
      "silver"
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
      paymentStatus: subscription?.paymentStatus || "PAID",
      subscriptionId: subscription?.subscriptionId || "SUB-BB-2026-ACTIVE",
      orderId: subscription?.orderId || "BB-ORDER-VERIFIED",
      startDate: subscription?.startDate || new Date(),
      endDate: subscription?.endDate || null,
      status: subscription?.status || "active",
    };

    const isApproved =
      lead?.status === "approved" ||
      subscription?.status === "active";

    const reviewStage = isApproved
      ? "approved"
      : lead?.status === "rejected"
      ? "rejected"
      : "reviewing";

    return NextResponse.json({
      success: true,
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
