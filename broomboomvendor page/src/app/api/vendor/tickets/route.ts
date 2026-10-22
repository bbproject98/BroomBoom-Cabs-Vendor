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

function getTierBaseAmount(tier: string) {
  const t = (tier || "").toLowerCase();
  if (t === "silver") return 5000;
  if (t === "platinum") return 20000;
  return 10000; // gold
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
      payNow = false,
      paymentMethod = "CASHFREE_UPI",
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

    const curBase = getTierBaseAmount(currentPlan);
    const reqBase = getTierBaseAmount(requestedPlan);
    const defaultDiff = reqBase > curBase ? reqBase - curBase : reqBase;

    const resolvedBase =
      body.upgradeAmount && Number(body.upgradeAmount) > 0
        ? Number(body.upgradeAmount)
        : defaultDiff;
    const resolvedGw =
      body.gatewayFee && Number(body.gatewayFee) > 0
        ? Number(body.gatewayFee)
        : Math.round(resolvedBase * 0.03);
    const resolvedGst =
      body.gstAmount && Number(body.gstAmount) > 0
        ? Number(body.gstAmount)
        : Math.round(resolvedBase * 0.05);
    const resolvedTotal =
      body.totalAmount && Number(body.totalAmount) > 0
        ? Number(body.totalAmount)
        : resolvedBase + resolvedGw + resolvedGst;

    const ticketId = `TICK-BB-2026-${Date.now().toString().slice(-6)}`;
    const isPaid = Boolean(payNow);
    const paymentId = isPaid
      ? body.paymentId || `CF_UPG_${Date.now().toString().slice(-8)}`
      : null;
    const paidAt = isPaid ? new Date() : null;

    const adminNotes = isPaid
      ? `Upgrade payment of ₹${resolvedTotal.toLocaleString(
          "en-IN"
        )} completed by vendor via ${paymentMethod} (Ref: ${paymentId}). Sent to Admin HQ for review and credential issuance.`
      : `Vendor requested upgrade from ${currentPlan.toUpperCase()} to ${requestedPlan.toUpperCase()}. Pending payment/Admin approval.`;

    let ticket: any;
    try {
      ticket = await prisma.planChangeTicket.create({
        data: {
          ticketId,
          applicationId,
          vendorName,
          vendorMobile,
          vendorEmail,
          currentPlan: currentPlan.toLowerCase(),
          requestedPlan: requestedPlan.toLowerCase(),
          reason: reason.trim(),
          status: isPaid ? "PAYMENT_COMPLETED" : "PENDING",
          paymentStatus: isPaid ? "PAID" : "UNPAID",
          upgradeAmount: resolvedBase,
          gatewayFee: resolvedGw,
          gstAmount: resolvedGst,
          totalAmount: resolvedTotal,
          paymentId,
          paidAt,
          adminNotes,
        },
      });
    } catch (createErr) {
      console.warn("[PRISMA CREATE TICKET WARN - USING RAW SQL]", createErr);
      const uuid = (await import("crypto")).randomUUID();
      const now = new Date();
      await prisma.$executeRaw`
        INSERT INTO plan_change_tickets (
          id, ticket_id, application_id, vendor_name, vendor_mobile, vendor_email,
          current_plan, requested_plan, reason, status, payment_status,
          upgrade_amount, gateway_fee, gst_amount, total_amount,
          payment_id, paid_at, admin_notes, created_at, updated_at
        ) VALUES (
          ${uuid}, ${ticketId}, ${applicationId}, ${vendorName}, ${vendorMobile}, ${vendorEmail},
          ${currentPlan.toLowerCase()}, ${requestedPlan.toLowerCase()}, ${reason.trim()},
          ${isPaid ? "PAYMENT_COMPLETED" : "PENDING"}, ${isPaid ? "PAID" : "UNPAID"},
          ${resolvedBase}, ${resolvedGw}, ${resolvedGst}, ${resolvedTotal},
          ${paymentId}, ${paidAt}, ${adminNotes}, ${now}, ${now}
        )
      `;
      ticket = await prisma.planChangeTicket.findUnique({
        where: { ticketId },
      });
    }

    // Annotate lead if exists
    try {
      await prisma.vendorLead.updateMany({
        where: { applicationId },
        data: {
          adminNotes: isPaid
            ? `Ticket #${ticketId} paid (₹${resolvedTotal.toLocaleString(
                "en-IN"
              )}). Plan upgrade to ${requestedPlan.toUpperCase()} awaiting Admin HQ approval.`
            : `Ticket #${ticketId} raised: Plan change from ${currentPlan} to ${requestedPlan}.`,
        },
      });
    } catch (e) {}

    const successMessage = isPaid
      ? `Payment of ₹${resolvedTotal.toLocaleString(
          "en-IN"
        )} successful! Your upgrade request to ${requestedPlan.toUpperCase()} has been submitted to Admin HQ for approval.`
      : `Plan change ticket #${ticketId} submitted. Pending payment and Admin review.`;

    return NextResponse.json({
      success: true,
      message: successMessage,
      ticket,
      payment: isPaid
        ? {
            paymentId,
            paidAt,
            amount: resolvedTotal,
            method: paymentMethod,
            status: "PAID",
          }
        : null,
    });
  } catch (error: any) {
    console.error("[RAISE TICKET ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to raise ticket" },
      { status: 500 }
    );
  }
}

