import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleOptions } from "@/lib/cors";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticketId, paymentMethod = "CASHFREE_UPI" } = body;

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

    if (ticket.status !== "AWAITING_PAYMENT" && ticket.status !== "PENDING") {
      if (ticket.status === "PAYMENT_COMPLETED" || ticket.status === "COMPLETED") {
        return NextResponse.json({
          success: true,
          message: "Payment is already completed for this ticket.",
          ticket,
        });
      }
      return NextResponse.json(
        {
          success: false,
          error: `Cannot pay for ticket in status "${ticket.status}". Must be approved by Admin first.`,
        },
        { status: 400 }
      );
    }

    // Resolve non-zero amounts if ticket had legacy 0 amount
    const planKey = (ticket.requestedPlan || "silver").toLowerCase();
    const currKey = (ticket.currentPlan || "gold").toLowerCase();
    const getBase = (p: string) => (p === "silver" ? 5000 : p === "platinum" ? 20000 : 10000);
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

    const paidAt = new Date();
    const paymentId = `CF_UPG_${Date.now().toString().slice(-8)}`;
    const adminNotes = `Upgrade payment of ₹${resolvedTotal.toLocaleString(
      "en-IN"
    )} completed by vendor via ${paymentMethod} (Ref: ${paymentId}). Awaiting Admin HQ to generate and issue new password.`;

    try {
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
    } catch (updateErr) {
      // Fallback: direct raw SQL update handles database columns directly even if Prisma client validator was locked during dev
      await prisma.$executeRaw`
        UPDATE plan_change_tickets
        SET 
          status = 'PAYMENT_COMPLETED',
          payment_status = 'PAID',
          upgrade_amount = ${resolvedBase},
          gateway_fee = ${resolvedGw},
          gst_amount = ${resolvedGst},
          total_amount = ${resolvedTotal},
          payment_id = ${paymentId},
          paid_at = ${paidAt},
          admin_notes = ${adminNotes},
          updated_at = ${new Date()}
        WHERE ticket_id = ${ticketId} OR id = ${ticket.id}
      `;
    }

    const updatedTicket = await prisma.planChangeTicket.findUnique({
      where: { ticketId },
    });

    return NextResponse.json({
      success: true,
      message: `Payment of ₹${resolvedTotal.toLocaleString(
        "en-IN"
      )} confirmed! Confirmation has been sent to Admin HQ. Admin will now generate and dispatch your new User ID and Password.`,
      ticket: updatedTicket,
    });
  } catch (error: any) {
    console.error("[TICKET PAYMENT ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process ticket payment" },
      { status: 500 }
    );
  }
}
