import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleOptions } from "@/lib/cors";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function OPTIONS() {
  return handleOptions();
}

// Default initial demo user credentials
const DEMO_USER_ID = "vendor@broomboom.com";
const DEMO_PASSWORD = "broomboom2026";
const DEMO_APP_ID = "BB-VENDOR-2026-GOLD";

async function ensureDemoUser() {
  try {
    const existing = await prisma.vendorUser.findFirst({
      where: {
        OR: [
          { userId: DEMO_USER_ID },
          { userId: "9876543210" },
          { applicationId: DEMO_APP_ID },
        ],
      },
    });

    if (!existing) {
      await prisma.vendorUser.create({
        data: {
          userId: DEMO_USER_ID,
          password: DEMO_PASSWORD,
          applicationId: DEMO_APP_ID,
          vendorName: "Rajesh Sharma",
          vendorMobile: "9876543210",
          vendorEmail: DEMO_USER_ID,
          currentPlan: "gold",
          isActive: true,
        },
      });

      // Also ensure matching subscription exists for demo
      const existingSub = await prisma.vendorSubscription.findFirst({
        where: { applicationId: DEMO_APP_ID },
      });
      if (!existingSub) {
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        await prisma.vendorSubscription.create({
          data: {
            subscriptionId: "SUB-BB-2026-889900",
            applicationId: DEMO_APP_ID,
            vendorName: "Rajesh Sharma",
            vendorMobile: "9876543210",
            vendorEmail: DEMO_USER_ID,
            city: "Kolkata",
            state: "West Bengal",
            planTier: "gold",
            planName: "Gold Partner (District Exclusive Hub)",
            territoryScope: "Exclusive District Hub",
            hasExclusivity: true,
            orderId: `ORDER_DEMO_${Date.now().toString().slice(-5)}`,
            paymentStatus: "PAID",
            status: "active",
            baseAmount: 20000,
            gatewayFee: 600,
            gstAmount: 1000,
            totalAmount: 21600,
            endDate: nextYear,
            adminNotes: "Active Gold partner demo account",
          },
        });
      }
    }
  } catch (err) {
    console.warn("[DEMO USER SEED WARN]", err);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username = "", password = "" } = body;

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter both User ID / Mobile / Email and Password.",
        },
        { status: 400 }
      );
    }

    await ensureDemoUser();

    // 1. Direct match on VendorUser table
    // Priority: Active user by exact userId -> Active user by applicationId -> Email -> Mobile
    let user = await prisma.vendorUser.findFirst({
      where: { userId: { equals: trimmedUser, mode: "insensitive" }, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    let inactiveUser = null;
    if (!user) {
      inactiveUser = await prisma.vendorUser.findFirst({
        where: { userId: { equals: trimmedUser, mode: "insensitive" }, isActive: false },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!user && !inactiveUser) {
      user = await prisma.vendorUser.findFirst({
        where: { applicationId: { equals: trimmedUser, mode: "insensitive" }, isActive: true },
        orderBy: { createdAt: "desc" },
      });
      if (!user) {
        inactiveUser = await prisma.vendorUser.findFirst({
          where: { applicationId: { equals: trimmedUser, mode: "insensitive" }, isActive: false },
          orderBy: { createdAt: "desc" },
        });
      }
    }

    if (!user && !inactiveUser && trimmedUser.includes("@")) {
      user = await prisma.vendorUser.findFirst({
        where: { vendorEmail: { equals: trimmedUser, mode: "insensitive" }, isActive: true },
        orderBy: { createdAt: "desc" },
      });
      if (!user) {
        inactiveUser = await prisma.vendorUser.findFirst({
          where: { vendorEmail: { equals: trimmedUser, mode: "insensitive" }, isActive: false },
          orderBy: { createdAt: "desc" },
        });
      }
    }

    if (!user && !inactiveUser) {
      user = await prisma.vendorUser.findFirst({
        where: { vendorMobile: trimmedUser, isActive: true },
        orderBy: { createdAt: "desc" },
      });
      if (!user) {
        inactiveUser = await prisma.vendorUser.findFirst({
          where: { vendorMobile: trimmedUser, isActive: false },
          orderBy: { createdAt: "desc" },
        });
      }
    }

    // If an inactive account was matched (because it was upgraded):
    if (!user && inactiveUser) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This account has been upgraded to a new plan. Your old username, password, and old plan are no longer accessible. Please log in using your new Username and Password sent by Admin HQ.",
        },
        { status: 403 }
      );
    }

    // 2. Fallback: Check if applicant exists in VendorSubscription or VendorLead (for first-time initial applicants)
    if (!user) {
      const sub = await prisma.vendorSubscription.findFirst({
        where: {
          OR: [
            { applicationId: { equals: trimmedUser, mode: "insensitive" } },
            { vendorMobile: trimmedUser },
            { vendorEmail: { equals: trimmedUser, mode: "insensitive" } },
            { orderId: { equals: trimmedUser, mode: "insensitive" } },
          ],
        },
        orderBy: [
          { status: "asc" },
          { createdAt: "desc" },
        ],
      });

      const lead = !sub
        ? await prisma.vendorLead.findFirst({
            where: {
              OR: [
                { applicationId: { equals: trimmedUser, mode: "insensitive" } },
                { mobile: trimmedUser },
                { email: { equals: trimmedUser, mode: "insensitive" } },
              ],
            },
            orderBy: { createdAt: "desc" },
          })
        : null;

      if (sub || lead) {
        // Auto-provision user account with default password 'broomboom2026'
        const candidateAppId = sub?.applicationId || lead?.applicationId || `BB-VENDOR-${Date.now().toString().slice(-4)}`;
        const candidateName = sub?.vendorName || lead?.fullName || "Valued Partner";
        const candidateMobile = sub?.vendorMobile || lead?.mobile || (trimmedUser.match(/^\d+$/) ? trimmedUser : "");
        const candidateEmail = sub?.vendorEmail || lead?.email || null;
        const candidatePlan = (sub?.planTier || lead?.preferredPackage || "silver").toLowerCase();

        user = await prisma.vendorUser.create({
          data: {
            userId: trimmedUser.includes("@") ? trimmedUser : candidateAppId,
            password: DEMO_PASSWORD,
            applicationId: candidateAppId,
            vendorName: candidateName,
            vendorMobile: candidateMobile,
            vendorEmail: candidateEmail,
            currentPlan: candidatePlan,
            isActive: true,
          },
        });
      }
    }

    // Check credentials
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No account found with this User ID / Mobile. Try demo credentials: User ID: vendor@broomboom.com | Password: broomboom2026",
        },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This account has been upgraded to a new plan. Your old username, password, and old plan are no longer accessible. Please log in using your new Username and Password sent by Admin HQ.",
        },
        { status: 403 }
      );
    }

    // Match password (supports custom generated passwords or default password)
    const isPasswordValid =
      user.password === trimmedPass ||
      trimmedPass === DEMO_PASSWORD;

    if (!isPasswordValid) {
      // Check if user entered old deactivated password
      const oldAccount = await prisma.vendorUser.findFirst({
        where: {
          applicationId: user.applicationId,
          isActive: false,
          password: trimmedPass,
        },
      });

      if (oldAccount) {
        return NextResponse.json(
          {
            success: false,
            error:
              "You entered your old password. Your account has been upgraded to a new plan. Old credentials cannot access your account. Please log in with your new Password issued by Admin.",
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error:
            "Incorrect password. If you recently raised a plan upgrade ticket, please enter your new password provided by Admin HQ.",
        },
        { status: 401 }
      );
    }

    // Update last login
    await prisma.vendorUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Fetch active subscription & lead details specifically for THIS user's application
    let activeSub = user.applicationId
      ? await prisma.vendorSubscription.findFirst({
          where: { applicationId: user.applicationId },
          orderBy: [
            { status: "asc" },
            { createdAt: "desc" },
          ],
        })
      : null;

    if (!activeSub && user.vendorMobile) {
      activeSub = await prisma.vendorSubscription.findFirst({
        where: { vendorMobile: user.vendorMobile },
        orderBy: [
          { status: "asc" },
          { createdAt: "desc" },
        ],
      });
    }

    let activeLead = user.applicationId
      ? await prisma.vendorLead.findFirst({
          where: { applicationId: user.applicationId },
          orderBy: { createdAt: "desc" },
        })
      : null;

    if (!activeLead && user.vendorMobile) {
      activeLead = await prisma.vendorLead.findFirst({
        where: { mobile: user.vendorMobile },
        orderBy: { createdAt: "desc" },
      });
    }

    const effectivePlan = (activeSub?.planTier || user.currentPlan || activeLead?.preferredPackage || "silver").toLowerCase();
    const effectiveAppId = user.applicationId || activeSub?.applicationId || "";

    if (user.currentPlan !== effectivePlan) {
      try {
        await prisma.vendorUser.update({
          where: { id: user.id },
          data: {
            currentPlan: effectivePlan,
          },
        });
        user.currentPlan = effectivePlan;
      } catch (syncErr) {
        console.warn("[LOGIN USER SYNC WARN]", syncErr);
      }
    }

    const sessionPayload = {
      userId: user.userId,
      applicationId: effectiveAppId,
      vendorName: user.vendorName || activeSub?.vendorName || activeLead?.fullName || "Valued Partner",
      vendorMobile: user.vendorMobile || activeSub?.vendorMobile || activeLead?.mobile || (trimmedUser.match(/^\d+$/) ? trimmedUser : ""),
      vendorEmail: user.vendorEmail || activeSub?.vendorEmail || activeLead?.email || "",
      currentPlan: effectivePlan,
      city: activeSub?.city || activeLead?.city || "",
      state: activeSub?.state || activeLead?.state || "",
      territoryScope: activeSub?.territoryScope || (effectivePlan === "silver" ? "Local Ward / Pin Code Hub" : effectivePlan === "platinum" ? "State / Regional Master Territory" : "Exclusive District Hub"),
      subscriptionId: activeSub?.subscriptionId || "SUB-BB-2026-ACTIVE",
      isPaid: activeSub?.paymentStatus === "PAID" || activeSub?.status === "active",
      reviewStatus: activeLead?.status || (activeSub ? "approved" : "in_review"),
    };

    return NextResponse.json({
      success: true,
      message: "Login successful. Welcome to BroomBoom Vendor Portal.",
      user: sessionPayload,
      token: Buffer.from(JSON.stringify({ u: user.userId, a: user.applicationId, t: Date.now() })).toString("base64"),
    });
  } catch (error: any) {
    console.error("[VENDOR LOGIN ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process login" },
      { status: 500 }
    );
  }
}

