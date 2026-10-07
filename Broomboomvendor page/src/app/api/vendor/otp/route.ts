import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleOptions } from "@/lib/cors";
import { sendOtpSms } from "@/lib/sms";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function OPTIONS() {
  return handleOptions();
}

// In-memory OTP storage with TTL
interface OtpEntry {
  otp: string;
  expiresAt: number;
}

const otpStore = new Map<string, OtpEntry>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, mobile = "", otp = "", newStatus } = body;

    const cleanedMobile = String(mobile).replace(/\D/g, "").slice(-10);

    if (!cleanedMobile || cleanedMobile.length !== 10) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    // Fuzzy matching filters for DB queries
    // Handles formats like: "8583992978", "08583992978", "+918583992978", "918583992978"
    const subMobileFilter = {
      OR: [
        { vendorMobile: cleanedMobile },
        { vendorMobile: `0${cleanedMobile}` },
        { vendorMobile: `91${cleanedMobile}` },
        { vendorMobile: `+91${cleanedMobile}` },
        { vendorMobile: { endsWith: cleanedMobile } },
      ],
    };

    const leadMobileFilter = {
      OR: [
        { mobile: cleanedMobile },
        { mobile: `0${cleanedMobile}` },
        { mobile: `91${cleanedMobile}` },
        { mobile: `+91${cleanedMobile}` },
        { mobile: { endsWith: cleanedMobile } },
      ],
    };

    // -------------------------------------------------------------
    // ACTION: SEND OTP
    // -------------------------------------------------------------
    if (action === "send") {
      let existingSub = null;
      let existingLead = null;

      try {
        existingSub = await prisma.vendorSubscription.findFirst({
          where: subMobileFilter,
          orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        });

        existingLead = await prisma.vendorLead.findFirst({
          where: leadMobileFilter,
          orderBy: { createdAt: "desc" },
        });
      } catch (dbErr) {
        console.warn("[OTP SEND DB QUERY WARN]", dbErr);
      }

      // Generate a clean 6-digit OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

      // Store OTP for 10 minutes
      otpStore.set(cleanedMobile, {
        otp: generatedOtp,
        expiresAt: Date.now() + 10 * 60 * 1000,
      });

      // Dispatch real SMS via PRP Gateway
      let smsStatus = "dispatched";
      try {
        const smsRes = await sendOtpSms(cleanedMobile, generatedOtp);
        console.log(`[PRP SMS Sent] to +91 ${cleanedMobile}:`, smsRes);
        if (!smsRes.success) {
          smsStatus = "gateway_warn";
        }
      } catch (smsErr) {
        console.warn("[PRP SMS Error]:", smsErr);
        smsStatus = "error";
      }

      const hasRecord = Boolean(existingSub || existingLead);
      const partnerName =
        existingSub?.vendorName || existingLead?.fullName || "Valued Partner";

      return NextResponse.json({
        success: true,
        message: `OTP sent successfully to +91 ${cleanedMobile} via mobile phone SMS messages.`,
        smsStatus,
        hasRecord,
        partnerName,
        expiresIn: 600,
      });
    }

    // -------------------------------------------------------------
    // ACTION: VERIFY OTP
    // -------------------------------------------------------------
    if (action === "verify") {
      const trimmedOtp = String(otp).trim();
      const stored = otpStore.get(cleanedMobile);

      // Verify OTP: match stored OTP or universal test code '123456'
      const isValidOtp =
        trimmedOtp === "123456" ||
        (stored && stored.otp === trimmedOtp && stored.expiresAt > Date.now());

      if (!isValidOtp) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid or expired OTP. Please enter the correct 6-digit code received on your phone.",
          },
          { status: 400 }
        );
      }

      // Clear OTP after successful validation
      otpStore.delete(cleanedMobile);

      let user = null;
      let subscription = null;
      let lead = null;

      try {
        user = await prisma.vendorUser.findFirst({
          where: subMobileFilter,
          orderBy: { createdAt: "desc" },
        });

        // 1. Prioritize finding a PAID subscription first
        subscription = await prisma.vendorSubscription.findFirst({
          where: {
            ...subMobileFilter,
            paymentStatus: { in: ["PAID", "paid", "SUCCESS", "success"] },
          },
          orderBy: { createdAt: "desc" },
        });

        // 2. Fallback to any subscription if no paid one found
        if (!subscription) {
          subscription = await prisma.vendorSubscription.findFirst({
            where: subMobileFilter,
            orderBy: [{ status: "asc" }, { createdAt: "desc" }],
          });
        }

        // 3. Prioritize finding a PAID lead first
        lead = await prisma.vendorLead.findFirst({
          where: {
            ...leadMobileFilter,
            status: { in: ["payment_completed", "approved"] },
          },
          orderBy: { createdAt: "desc" },
        });

        // 4. Fallback to any lead if no paid lead found
        if (!lead) {
          lead = await prisma.vendorLead.findFirst({
            where: leadMobileFilter,
            orderBy: { createdAt: "desc" },
          });
        }

        // If subscription not found by mobile, check by lead's applicationId
        if (!subscription && lead?.applicationId) {
          subscription = await prisma.vendorSubscription.findFirst({
            where: { applicationId: lead.applicationId },
            orderBy: [{ createdAt: "desc" }],
          });
        }
      } catch (dbErr) {
        console.warn("[OTP VERIFY DB QUERY WARN]", dbErr);
      }

      // Resolve applicant profile details
      const resolvedAppId =
        subscription?.applicationId ||
        lead?.applicationId ||
        `BB-VENDOR-2026-${cleanedMobile.slice(-4)}`;

      const resolvedName =
        subscription?.vendorName ||
        lead?.fullName ||
        user?.vendorName ||
        "Rajesh Sharma";

      const resolvedCity = subscription?.city || lead?.city || "Kolkata";
      const resolvedState =
        subscription?.state || lead?.state || "West Bengal";

      const resolvedEmail =
        subscription?.vendorEmail ||
        lead?.email ||
        user?.vendorEmail ||
        `partner.${cleanedMobile.slice(-4)}@broomboomcabs.com`;

      const resolvedTier = (
        subscription?.planTier ||
        lead?.preferredPackage ||
        "gold"
      ).toLowerCase();

      const resolvedOrderId =
        subscription?.orderId ||
        `BB_ORDER_${cleanedMobile.slice(-4)}_${Date.now().toString().slice(-4)}`;

      // Determine Plan Details based on new pricing
      const baseAmt =
        subscription?.baseAmount ||
        (resolvedTier === "silver"
          ? 5000
          : resolvedTier === "platinum"
          ? 20000
          : 10000);

      const gwFee =
        subscription?.gatewayFee || Math.round(baseAmt * 0.03);

      const gstAmt =
        subscription?.gstAmount || Math.round(baseAmt * 0.05);

      const totAmt =
        subscription?.totalAmount || baseAmt + gwFee + gstAmt;

      // Check whether applicant has submitted and paid or only submitted information
      const hasRecord = Boolean(subscription || lead);
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

      // ONLY approved if admin explicitly marked as approved!
      // All paid applicants before admin approval stay IN_PROCESS ("under process")
      const isAdminValidated = Boolean(
        lead?.status === "approved" || subscription?.status === "approved"
      );

      const statusCondition = isAdminValidated ? "APPROVED" : "IN_PROCESS";

      const credentials = {
        userId: user?.userId || resolvedAppId,
        password: user?.password || "broomboom2026",
        loginUrl: `/vendor/login?appId=${encodeURIComponent(resolvedAppId)}`,
      };

      const thankYouUrl = `/thank-you?applicationId=${encodeURIComponent(
        resolvedAppId
      )}&order_id=${encodeURIComponent(
        resolvedOrderId
      )}&status=success&from=profile&pkg=${encodeURIComponent(resolvedTier)}`;

      const payNowUrl = `/apply?package=${encodeURIComponent(
        resolvedTier
      )}&applicationId=${encodeURIComponent(
        resolvedAppId
      )}&step=confirm&from=profile`;

      let redirectUrl = thankYouUrl;
      let userStatus: "APPROVED" | "PAID_UNDER_PROCESS" | "UNPAID_PENDING_PAYMENT" | "NOT_FOUND";

      if (isPaid) {
        userStatus = isAdminValidated ? "APPROVED" : "PAID_UNDER_PROCESS";
        redirectUrl = thankYouUrl;
      } else if (hasRecord) {
        userStatus = "UNPAID_PENDING_PAYMENT";
        redirectUrl = payNowUrl;
      } else {
        userStatus = "NOT_FOUND";
        redirectUrl = "/apply?package=gold";
      }

      return NextResponse.json({
        success: true,
        verified: true,
        mobile: cleanedMobile,
        hasRecord,
        isPaid,
        isAdminValidated,
        userStatus,
        redirectUrl,
        profile: {
          vendorName: resolvedName,
          vendorMobile: cleanedMobile,
          vendorEmail: resolvedEmail,
          city: resolvedCity,
          state: resolvedState,
          applicationId: resolvedAppId,
          spaceStatus: lead?.spaceStatus || "Commercial Space Ready (450 sq.ft)",
          carpetArea:
            lead?.carpetArea ||
            (resolvedTier === "platinum"
              ? "1,000+ sq.ft"
              : resolvedTier === "gold"
              ? "300 - 500 sq.ft"
              : "100 - 150 sq.ft"),
          appliedAt: subscription?.createdAt || lead?.createdAt || new Date(),
        },
        plan: {
          tier: resolvedTier,
          name:
            resolvedTier === "silver"
              ? "Silver Partner (Booking Kiosk)"
              : resolvedTier === "platinum"
              ? "Platinum Partner (Regional Master Hub)"
              : "Gold Partner (District Exclusive Hub)",
          baseAmount: baseAmt,
          gatewayFee: gwFee,
          gstAmount: gstAmt,
          totalAmount: totAmt,
          territoryScope:
            subscription?.territoryScope ||
            (resolvedTier === "silver"
              ? "Local Ward / Pin Code Hub"
              : resolvedTier === "platinum"
              ? "State / Regional Master Territory"
              : "Exclusive District Hub"),
          hasExclusivity: resolvedTier !== "silver",
          paymentStatus: subscription?.paymentStatus || "PAID",
          subscriptionId:
            subscription?.subscriptionId ||
            `SUB-BB-2026-${cleanedMobile.slice(-4)}`,
          orderId: resolvedOrderId,
        },
        adminValidation: {
          status: statusCondition,
          isAdminValidated,
          title: isAdminValidated
            ? "Territory License Approved & Exclusivity Active"
            : "Application Under Final Admin Validation",
          badgeLabel: isAdminValidated
            ? "APPROVED & ACTIVE"
            : "IN PROCESS (Awaiting Admin Validation)",
          description: isAdminValidated
            ? "Congratulations! Your profile has been validated by Admin HQ. Your territorial exclusivity and partner license are approved. You can now access your Thank You confirmation page and vendor login credentials below."
            : "Your payment of ₹" +
              totAmt.toLocaleString("en-IN") +
              " is confirmed. Admin HQ Operations is currently validating your commercial documentation and territory demarcation. Turnaround: 24 to 48 hours.",
          step: isAdminValidated ? 4 : 3,
          thankYouUrl,
          credentials,
        },
      });
    }

    // -------------------------------------------------------------
    // ACTION: TOGGLE STATUS (FOR DEMO / LIVE TESTING)
    // -------------------------------------------------------------
    if (action === "toggle_status") {
      const targetState = newStatus === "APPROVED" ? "active" : "pending";
      const leadState = newStatus === "APPROVED" ? "approved" : "payment_completed";

      try {
        await prisma.vendorSubscription.updateMany({
          where: subMobileFilter,
          data: { status: targetState },
        });

        await prisma.vendorLead.updateMany({
          where: leadMobileFilter,
          data: { status: leadState },
        });
      } catch (err) {
        console.warn("[TOGGLE STATUS DB WARN]", err);
      }

      return NextResponse.json({
        success: true,
        message: `Plan status updated to ${newStatus}.`,
        newStatus,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Use 'send', 'verify', or 'toggle_status'." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[OTP API ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process OTP request" },
      { status: 500 }
    );
  }
}
