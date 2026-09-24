import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleOptions } from "@/lib/cors";
import { createCashfreeOrder, getCashfreeMode } from "@/lib/cashfree";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticketId, paymentMethod = "CASHFREE_UPI", simulate = false } = body;

    if (!ticketId) {
      return NextResponse.json(
        { success: false, error: "ticketId is required for payment" },
        { status: 400 }
      );
    }

    const ticket = await prisma.planChangeTicket.findUnique({
      where: { ticketId },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: `Ticket #${ticketId} not found.` },
        { status: 404 }
      );
    }

    if (ticket.status === "PAYMENT_COMPLETED" || ticket.status === "COMPLETED") {
      return NextResponse.json({
        success: true,
        message: "Payment is already completed for this ticket.",
        ticket,
      });
    }

    // Resolve non-zero amounts if ticket had legacy 0 amount
    const planKey = (ticket.requestedPlan || "silver").toLowerCase();
    const currKey = (ticket.currentPlan || "gold").toLowerCase();
    const getBase = (p: string) => (p === "silver" ? 10000 : p === "platinum" ? 50000 : 20000);
    const targetBase = getBase(planKey);
    const curBase = getBase(currKey);
    const defaultDiff = targetBase > curBase ? targetBase - curBase : targetBase;

    const resolvedBase =
      body.upgradeAmount && Number(body.upgradeAmount) > 0
        ? Number(body.upgradeAmount)
        : ticket.upgradeAmount && ticket.upgradeAmount > 0
        ? ticket.upgradeAmount
        : defaultDiff;

    const resolvedGw = Math.round(resolvedBase * 0.03);
    const resolvedGst = Math.round(resolvedBase * 0.05);

    const resolvedTotal =
      body.totalAmount && Number(body.totalAmount) > 0
        ? Number(body.totalAmount)
        : ticket.totalAmount && ticket.totalAmount > 0
        ? ticket.totalAmount
        : resolvedBase + resolvedGw + resolvedGst;

    // SIMULATED TEST PAYMENT (Direct completion)
    if (simulate) {
      const paidAt = new Date();
      const paymentId = `CF_SIM_${Date.now().toString().slice(-8)}`;
      const adminNotes = `Upgrade payment of ₹${resolvedTotal.toLocaleString(
        "en-IN"
      )} confirmed via ${paymentMethod} (${paymentId}). Ticket submitted to Admin HQ for approval and credential dispatch.`;

      await prisma.planChangeTicket.update({
        where: { ticketId },
        data: {
          status: "PAYMENT_COMPLETED",
          paymentStatus: "PAID",
          upgradeAmount: resolvedBase,
          gatewayFee: resolvedGw,
          gstAmount: resolvedGst,
          totalAmount: resolvedTotal,
          paymentId,
          paidAt,
          adminNotes,
        },
      });

      const updatedTicket = await prisma.planChangeTicket.findUnique({
        where: { ticketId },
      });

      return NextResponse.json({
        success: true,
        message: `Payment of ₹${resolvedTotal.toLocaleString(
          "en-IN"
        )} confirmed! Sent to Admin HQ for approval and credentials.`,
        ticket: updatedTicket,
      });
    }

    // CASHFREE LIVE / SANDBOX ORDER CREATION
    const origin =
      request.headers.get("origin") ||
      (request.headers.get("referer") ? new URL(request.headers.get("referer")!).origin : null);
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    const appUrl = origin || `${protocol}://${host}` || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const cleanTicket = ticket.ticketId.replace(/[^a-zA-Z0-9]/g, "_");
    const orderId = `UPG_${cleanTicket.slice(-12)}_${Date.now().toString().slice(-5)}`;
    const returnUrl = `${appUrl}/api/payment/callback?order_id={order_id}&ticketId=${encodeURIComponent(
      ticket.ticketId
    )}&applicationId=${encodeURIComponent(ticket.applicationId)}&action=ticket_upgrade`;

    const cfRes = await createCashfreeOrder({
      orderId,
      orderAmount: resolvedTotal,
      orderCurrency: "INR",
      customerId: (ticket.vendorMobile || "cust_vendor").replace(/[^0-9]/g, "") || "cust_vendor",
      customerName: ticket.vendorName.slice(0, 50),
      customerEmail: ticket.vendorEmail || "vendor@broomboom.com",
      customerPhone: ticket.vendorMobile,
      returnUrl,
      orderNote: `BroomBoom Plan Upgrade: ${currKey.toUpperCase()} to ${planKey.toUpperCase()} (Ticket #${ticket.ticketId})`,
      orderTags: {
        ticketId: ticket.ticketId,
        applicationId: ticket.applicationId,
        requestedPlan: planKey,
      },
      cartDetails: {
        cart_items: [
          {
            item_name: `Upgrade to ${planKey.toUpperCase()} Partner`,
            item_price: resolvedBase,
            item_quantity: 1,
          },
          {
            item_name: "Payment Gateway Fee (3%)",
            item_price: resolvedGw,
            item_quantity: 1,
          },
          {
            item_name: "Government GST (5%)",
            item_price: resolvedGst,
            item_quantity: 1,
          },
        ],
      },
    });

    if (!cfRes.success || !cfRes.data) {
      console.error("[CASHFREE TICKET ORDER ERROR]", cfRes.error);
      return NextResponse.json(
        {
          success: false,
          error: cfRes.error || "Failed to initialize Cashfree payment gateway session.",
        },
        { status: 500 }
      );
    }

    // Save order details to ticket
    await prisma.planChangeTicket.update({
      where: { ticketId },
      data: {
        status: "AWAITING_PAYMENT",
        upgradeAmount: resolvedBase,
        gatewayFee: resolvedGw,
        gstAmount: resolvedGst,
        totalAmount: resolvedTotal,
        paymentId: cfRes.data.orderId,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: cfRes.data.orderId,
      cfOrderId: cfRes.data.cfOrderId,
      paymentSessionId: cfRes.data.paymentSessionId,
      amount: resolvedTotal,
      mode: getCashfreeMode(),
      ticket: {
        ...ticket,
        upgradeAmount: resolvedBase,
        gatewayFee: resolvedGw,
        gstAmount: resolvedGst,
        totalAmount: resolvedTotal,
        paymentId: cfRes.data.orderId,
      },
    });
  } catch (error: any) {
    console.error("[TICKET PAYMENT ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process ticket payment" },
      { status: 500 }
    );
  }
}

