import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleOptions } from "@/lib/cors";
import { createCashfreeOrder, getCashfreeMode } from "@/lib/cashfree";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get("applicationId");
    const mobile = searchParams.get("mobile");

    if (!applicationId && !mobile) {
      return NextResponse.json(
        { success: false, error: "applicationId or mobile query parameter required" },
        { status: 400 }
      );
    }

    const tickets = await prisma.planChangeTicket.findMany({
      where: applicationId
        ? { applicationId }
        : { vendorMobile: mobile || "" },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, tickets });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      applicationId = "BB-VENDOR-2026",
      vendorName = "Valued Partner",
      vendorMobile = "9999999999",
      vendorEmail = "vendor@broomboom.com",
      currentPlan = "silver",
      requestedPlan = "gold",
      reason = "Requesting plan change / tier upgrade",
      initiatePayment = false,
    } = body;

    if (!requestedPlan) {
      return NextResponse.json(
        { success: false, error: "Please select the requested new plan." },
        { status: 400 }
      );
    }

    if (currentPlan.toLowerCase() === requestedPlan.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: `You are already on the ${requestedPlan.toUpperCase()} plan.` },
        { status: 400 }
      );
    }

    // Single-step fee calculation:
    // Silver: 10,000 | Gold: 20,000 | Platinum: 50,000
    const getBaseAmount = (p: string) => {
      const key = p.toLowerCase();
      return key === "silver" ? 10000 : key === "platinum" ? 50000 : 20000;
    };

    const targetBase = getBaseAmount(requestedPlan);
    const curBase = getBaseAmount(currentPlan);
    let upgradeAmount = targetBase > curBase ? targetBase - curBase : targetBase;
    if (upgradeAmount <= 0) upgradeAmount = targetBase;

    const gatewayFee = Math.round(upgradeAmount * 0.03); // 3%
    const gstAmount = Math.round(upgradeAmount * 0.05);   // 5%
    const totalAmount = upgradeAmount + gatewayFee + gstAmount;

    const ticketId = `TICK-BB-2026-${Date.now().toString().slice(-6)}`;
    const cleanAppId = applicationId.replace(/[^a-zA-Z0-9]/g, "_");
    const cfOrderId = `UPG_${cleanAppId.slice(0, 15)}_${Date.now().toString().slice(-6)}`;

    let cashfreeData: any = null;

    // If direct payment initiation requested in 1-step
    if (initiatePayment) {
      const origin =
        request.headers.get("origin") ||
        (request.headers.get("referer") ? new URL(request.headers.get("referer")!).origin : null);
      const host = request.headers.get("host") || "localhost:3000";
      const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
      const appUrl = origin || `${protocol}://${host}` || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const returnUrl = `${appUrl}/api/payment/callback?order_id={order_id}&ticketId=${encodeURIComponent(
        ticketId
      )}&applicationId=${encodeURIComponent(applicationId)}&action=ticket_upgrade`;

      const cfResult = await createCashfreeOrder({
        orderId: cfOrderId,
        orderAmount: totalAmount,
        orderCurrency: "INR",
        customerId: (vendorMobile || "cust_vendor").replace(/[^0-9]/g, "") || "cust_vendor",
        customerName: vendorName.slice(0, 50),
        customerEmail: vendorEmail || "vendor@broomboom.com",
        customerPhone: vendorMobile,
        returnUrl,
        orderNote: `Plan Upgrade to ${requestedPlan.toUpperCase()} (Ticket #${ticketId}) | ₹${totalAmount}`,
      });

      if (cfResult.success && cfResult.data) {
        cashfreeData = {
          orderId: cfResult.data.orderId,
          cfOrderId: cfResult.data.cfOrderId,
          paymentSessionId: cfResult.data.paymentSessionId,
          mode: getCashfreeMode(),
        };
      }
    }

    const ticket = await prisma.planChangeTicket.create({
      data: {
        ticketId,
        applicationId,
        vendorName,
        vendorMobile,
        vendorEmail,
        currentPlan: currentPlan.toLowerCase(),
        requestedPlan: requestedPlan.toLowerCase(),
        reason: reason.trim(),
        status: "AWAITING_PAYMENT", // 1-step flow: Immediately ready for Pay Now!
        upgradeAmount,
        gatewayFee,
        gstAmount,
        totalAmount,
        paymentStatus: "UNPAID",
        paymentId: cashfreeData?.orderId || null,
        adminNotes: `Upgrade from ${currentPlan.toUpperCase()} to ${requestedPlan.toUpperCase()} requested. Total fee: ₹${totalAmount.toLocaleString(
          "en-IN"
        )} (Base: ₹${upgradeAmount} + 3% GW: ₹${gatewayFee} + 5% GST: ₹${gstAmount}). Pay Now enabled.`,
      },
    });

    // Annotate lead if exists
    try {
      await prisma.vendorLead.updateMany({
        where: { applicationId },
        data: {
          adminNotes: `Ticket ${ticketId} raised: Plan upgrade from ${currentPlan} to ${requestedPlan} (Payable: ₹${totalAmount}).`,
        },
      });
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: `Plan upgrade ticket #${ticketId} created. Please complete payment via Cashfree to send the request to Admin for new credentials.`,
      ticket,
      cashfree: cashfreeData,
    });
  } catch (error: any) {
    console.error("[RAISE TICKET ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to raise ticket" },
      { status: 500 }
    );
  }
}


