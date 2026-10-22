import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleOptions } from "@/lib/cors";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function OPTIONS() {
  return handleOptions();
}

// -------------------------------------------------------------
// GET: LIST ALL VENDORS (ONLINE & MANUAL OFFLINE PARTNERS)
// -------------------------------------------------------------
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") || "").trim().toLowerCase();
    const filter = searchParams.get("filter") || "ALL";

    // 1. Fetch subscriptions & leads
    const subscriptions = await prisma.vendorSubscription.findMany({
      orderBy: { createdAt: "desc" },
    });

    const leads = await prisma.vendorLead.findMany({
      orderBy: { createdAt: "desc" },
    });

    // 2. Index leads by applicationId and mobile
    const leadMap = new Map<string, any>();
    leads.forEach((l) => {
      if (l.applicationId) leadMap.set(l.applicationId.toLowerCase(), l);
      const cleanM = l.mobile.replace(/\D/g, "").slice(-10);
      if (cleanM) leadMap.set(`m_${cleanM}`, l);
    });

    // 3. Track processed applicationIds and mobiles
    const seenAppIds = new Set<string>();
    const seenMobiles = new Set<string>();

    const mergedList: any[] = [];

    // First process all subscriptions
    for (const sub of subscriptions) {
      const cleanMobile = (sub.vendorMobile || "").replace(/\D/g, "").slice(-10);
      const appId = sub.applicationId || `BB-VENDOR-2026-${cleanMobile.slice(-4)}`;
      seenAppIds.add(appId.toLowerCase());
      if (cleanMobile) seenMobiles.add(cleanMobile);

      const matchedLead =
        leadMap.get(appId.toLowerCase()) ||
        (cleanMobile ? leadMap.get(`m_${cleanMobile}`) : null);

      const rawTier = (sub.planTier || matchedLead?.preferredPackage || "").toLowerCase();
      const isUnassigned =
        !rawTier ||
        rawTier === "unassigned" ||
        rawTier === "null" ||
        !["silver", "gold", "platinum"].includes(rawTier);

      const isApproved =
        sub.status === "approved" ||
        matchedLead?.status === "approved";

      const isPaid =
        ["paid", "active", "success"].includes((sub.paymentStatus || "").toLowerCase()) ||
        ["payment_completed", "approved"].includes((matchedLead?.status || "").toLowerCase());

      mergedList.push({
        id: sub.id,
        applicationId: appId,
        vendorName: sub.vendorName || matchedLead?.fullName || "Valued Partner",
        vendorMobile: cleanMobile || sub.vendorMobile,
        vendorEmail: sub.vendorEmail || matchedLead?.email || "",
        city: sub.city || matchedLead?.city || "",
        state: sub.state || matchedLead?.state || "",
        planTier: isUnassigned ? "unassigned" : rawTier,
        planName: sub.planName || (isUnassigned ? "Pending Admin Allocation" : `${rawTier.toUpperCase()} Partner`),
        baseAmount: sub.baseAmount || 0,
        totalAmount: sub.totalAmount || 0,
        paymentStatus: isPaid ? "PAID" : sub.paymentStatus || "PENDING",
        status: isApproved ? "approved" : "pending",
        orderId: sub.orderId,
        source: sub.orderId.startsWith("MANUAL_") ? "manual_offline" : "portal_online",
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
      });
    }

    // Next add leads that don't have subscriptions yet
    for (const lead of leads) {
      const cleanMobile = (lead.mobile || "").replace(/\D/g, "").slice(-10);
      const appId = lead.applicationId || `BB-VENDOR-2026-${cleanMobile.slice(-4)}`;

      if (seenAppIds.has(appId.toLowerCase()) || (cleanMobile && seenMobiles.has(cleanMobile))) {
        continue;
      }

      seenAppIds.add(appId.toLowerCase());
      if (cleanMobile) seenMobiles.add(cleanMobile);

      const rawTier = (lead.preferredPackage || "").toLowerCase();
      const isUnassigned =
        !rawTier ||
        rawTier === "unassigned" ||
        rawTier === "null" ||
        !["silver", "gold", "platinum"].includes(rawTier);

      const isApproved = lead.status === "approved";
      const isPaid = lead.status === "payment_completed" || lead.status === "approved";

      mergedList.push({
        id: lead.id,
        applicationId: appId,
        vendorName: lead.fullName || "Valued Partner",
        vendorMobile: cleanMobile || lead.mobile,
        vendorEmail: lead.email || "",
        city: lead.city || "",
        state: lead.state || "",
        planTier: isUnassigned ? "unassigned" : rawTier,
        planName: lead.packageName || (isUnassigned ? "Pending Admin Allocation" : `${rawTier.toUpperCase()} Partner`),
        baseAmount: 0,
        totalAmount: 0,
        paymentStatus: isPaid ? "PAID" : "PENDING",
        status: isApproved ? "approved" : "pending",
        orderId: `LEAD_${cleanMobile.slice(-4)}`,
        source: lead.status === "manual_onboarding" ? "manual_offline" : "portal_lead",
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
      });
    }

    // Filter by search query
    let filtered = mergedList;
    if (search) {
      filtered = filtered.filter(
        (v) =>
          v.applicationId.toLowerCase().includes(search) ||
          v.vendorName.toLowerCase().includes(search) ||
          v.vendorMobile.includes(search) ||
          v.city.toLowerCase().includes(search) ||
          v.state.toLowerCase().includes(search)
      );
    }

    // Filter by category
    if (filter === "UNASSIGNED") {
      filtered = filtered.filter(
        (v) => v.planTier === "unassigned" || v.vendorName === "Valued Partner"
      );
    } else if (filter === "GOLD") {
      filtered = filtered.filter((v) => v.planTier === "gold");
    } else if (filter === "SILVER") {
      filtered = filtered.filter((v) => v.planTier === "silver");
    } else if (filter === "PLATINUM") {
      filtered = filtered.filter((v) => v.planTier === "platinum");
    } else if (filter === "APPROVED") {
      filtered = filtered.filter((v) => v.status === "approved");
    } else if (filter === "PENDING") {
      filtered = filtered.filter((v) => v.status !== "approved");
    }

    const stats = {
      total: mergedList.length,
      unassigned: mergedList.filter(
        (v) => v.planTier === "unassigned" || v.vendorName === "Valued Partner"
      ).length,
      gold: mergedList.filter((v) => v.planTier === "gold").length,
      silver: mergedList.filter((v) => v.planTier === "silver").length,
      platinum: mergedList.filter((v) => v.planTier === "platinum").length,
      approved: mergedList.filter((v) => v.status === "approved").length,
      paid: mergedList.filter((v) => v.paymentStatus === "PAID").length,
    };

    return NextResponse.json({
      success: true,
      count: filtered.length,
      stats,
      vendors: filtered,
    });
  } catch (error: any) {
    console.error("[ADMIN VENDORS GET ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to list vendors" },
      { status: 500 }
    );
  }
}

// -------------------------------------------------------------
// POST / PATCH: MANUALLY EDIT VENDOR DETAILS
// -------------------------------------------------------------
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      applicationId,
      vendorMobile,
      vendorName,
      vendorEmail = "",
      city = "",
      state = "",
      planTier = "gold",
      paymentStatus = "PAID",
      status = "pending",
    } = body;

    if (!applicationId && !vendorMobile) {
      return NextResponse.json(
        { success: false, error: "applicationId or vendorMobile is required." },
        { status: 400 }
      );
    }

    const cleanMobile = vendorMobile
      ? vendorMobile.replace(/\D/g, "").slice(-10)
      : "";

    // Normalize plan tier
    const normTier = (planTier || "unassigned").trim().toLowerCase();
    const hasValidTier = ["silver", "gold", "platinum"].includes(normTier);

    const baseAmount =
      normTier === "silver"
        ? 5000
        : normTier === "platinum"
        ? 20000
        : normTier === "gold"
        ? 10000
        : 0;

    const gatewayFee = Math.round(baseAmount * 0.03);
    const gstAmount = Math.round(baseAmount * 0.05);
    const totalAmount = baseAmount + gatewayFee + gstAmount;

    const planName =
      normTier === "silver"
        ? "Silver Partner (Booking Kiosk)"
        : normTier === "platinum"
        ? "Platinum Partner (Regional Master Hub)"
        : normTier === "gold"
        ? "Gold Partner (District Exclusive Hub)"
        : "Pending Admin Allocation";

    const isApproved = status === "approved";
    const subPaymentStatus = paymentStatus.toUpperCase();

    // 1. Update or create VendorSubscription
    let subscription = await prisma.vendorSubscription.findFirst({
      where: {
        OR: [
          ...(applicationId ? [{ applicationId }] : []),
          ...(cleanMobile
            ? [
                { vendorMobile: cleanMobile },
                { vendorMobile: `0${cleanMobile}` },
                { vendorMobile: `91${cleanMobile}` },
                { vendorMobile: `+91${cleanMobile}` },
                { vendorMobile: { endsWith: cleanMobile } },
              ]
            : []),
        ],
      },
    });

    if (subscription) {
      subscription = await prisma.vendorSubscription.update({
        where: { id: subscription.id },
        data: {
          vendorName: vendorName || subscription.vendorName,
          vendorMobile: cleanMobile || subscription.vendorMobile,
          vendorEmail: vendorEmail || subscription.vendorEmail,
          city: city || subscription.city,
          state: state || subscription.state,
          planTier: hasValidTier ? normTier : "",
          planName: planName,
          baseAmount: baseAmount,
          gatewayFee: gatewayFee,
          gstAmount: gstAmount,
          totalAmount: totalAmount,
          paymentStatus: subPaymentStatus,
          status: isApproved ? "approved" : "pending",
        },
      });
    } else {
      const generatedAppId = applicationId || `BB-VENDOR-2026-${cleanMobile.slice(-4)}`;
      subscription = await prisma.vendorSubscription.create({
        data: {
          subscriptionId: `SUB-BB-2026-${cleanMobile.slice(-4)}-${Date.now().toString().slice(-4)}`,
          applicationId: generatedAppId,
          vendorName: vendorName || "Valued Partner",
          vendorMobile: cleanMobile,
          vendorEmail: vendorEmail,
          city: city,
          state: state,
          planTier: hasValidTier ? normTier : "",
          planName: planName,
          baseAmount: baseAmount,
          gatewayFee: gatewayFee,
          gstAmount: gstAmount,
          totalAmount: totalAmount,
          orderId: `MANUAL_BB_${cleanMobile.slice(-4)}_${Date.now().toString().slice(-4)}`,
          paymentStatus: subPaymentStatus,
          status: isApproved ? "approved" : "pending",
        },
      });
    }

    // 2. Update or create VendorLead
    const targetAppId = subscription.applicationId;
    let lead = await prisma.vendorLead.findFirst({
      where: {
        OR: [
          { applicationId: targetAppId },
          ...(cleanMobile
            ? [
                { mobile: cleanMobile },
                { mobile: `0${cleanMobile}` },
                { mobile: `91${cleanMobile}` },
                { mobile: `+91${cleanMobile}` },
                { mobile: { endsWith: cleanMobile } },
              ]
            : []),
        ],
      },
    });

    if (lead) {
      await prisma.vendorLead.update({
        where: { id: lead.id },
        data: {
          fullName: vendorName || lead.fullName,
          mobile: cleanMobile || lead.mobile,
          email: vendorEmail || lead.email,
          city: city || lead.city,
          state: state || lead.state,
          preferredPackage: hasValidTier ? normTier : "",
          packageName: planName,
          status: isApproved
            ? "approved"
            : subPaymentStatus === "PAID"
            ? "payment_completed"
            : "pending",
        },
      });
    } else {
      await prisma.vendorLead.create({
        data: {
          applicationId: targetAppId,
          fullName: vendorName || "Valued Partner",
          mobile: cleanMobile,
          email: vendorEmail,
          city: city || "Kolkata",
          state: state || "West Bengal",
          preferredPackage: hasValidTier ? normTier : "",
          packageName: planName,
          status: isApproved ? "approved" : "payment_completed",
        },
      });
    }

    // 3. Update or create VendorUser credentials
    let user = await prisma.vendorUser.findFirst({
      where: {
        OR: [
          { applicationId: targetAppId },
          ...(cleanMobile ? [{ vendorMobile: cleanMobile }] : []),
        ],
      },
    });

    if (user) {
      await prisma.vendorUser.update({
        where: { id: user.id },
        data: {
          vendorName: vendorName || user.vendorName,
          vendorMobile: cleanMobile || user.vendorMobile,
          vendorEmail: vendorEmail || user.vendorEmail,
          currentPlan: hasValidTier ? normTier : "",
        },
      });
    } else {
      await prisma.vendorUser.create({
        data: {
          userId: targetAppId,
          password: "broomboom2026",
          applicationId: targetAppId,
          vendorName: vendorName || "Valued Partner",
          vendorMobile: cleanMobile,
          vendorEmail: vendorEmail,
          currentPlan: hasValidTier ? normTier : "",
          isActive: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Vendor details for ${vendorName || "Valued Partner"} (${targetAppId}) updated successfully!`,
      vendor: {
        applicationId: targetAppId,
        vendorName: vendorName || subscription.vendorName,
        vendorMobile: cleanMobile || subscription.vendorMobile,
        planTier: hasValidTier ? normTier : "unassigned",
        planName,
        paymentStatus: subPaymentStatus,
        status: isApproved ? "approved" : "pending",
      },
    });
  } catch (error: any) {
    console.error("[ADMIN VENDORS UPDATE ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update vendor" },
      { status: 500 }
    );
  }
}

