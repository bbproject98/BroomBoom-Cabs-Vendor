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
    const status = searchParams.get("status");

    const tickets = await prisma.planChangeTicket.findMany({
      where: status && status !== "ALL" ? { status: status.toUpperCase() } : {},
      orderBy: { createdAt: "desc" },
    });

    const allTickets = await prisma.planChangeTicket.findMany();
    const stats = {
      total: allTickets.length,
      pending: allTickets.filter((t: any) => t.status === "PENDING").length,
      awaitingPayment: allTickets.filter((t: any) => t.status === "AWAITING_PAYMENT").length,
      paymentCompleted: allTickets.filter((t: any) => t.status === "PAYMENT_COMPLETED").length,
      completed: allTickets.filter((t: any) => t.status === "COMPLETED" || t.status === "APPROVED").length,
      rejected: allTickets.filter((t: any) => t.status === "REJECTED").length,
    };

    return NextResponse.json({ success: true, count: tickets.length, stats, tickets });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to list tickets" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      ticketId,
      action = "approve",
      adminNotes = "",
      customPassword = "",
      customUserId = "",
    } = body;

    if (!ticketId) {
      return NextResponse.json(
        { success: false, error: "ticketId is required" },
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

    // -------------------------------------------------------------
    // ACTION: REJECT
    // -------------------------------------------------------------
    if (action === "reject") {
      const updated = await prisma.planChangeTicket.update({
        where: { ticketId },
        data: {
          status: "REJECTED",
          adminNotes: adminNotes || "Plan change request rejected by HQ Operations.",
        },
      });
      return NextResponse.json({
        success: true,
        message: "Ticket rejected.",
        ticket: updated,
      });
    }

    // -------------------------------------------------------------
    // ACTION 1: APPROVE REQUEST (Admin Panel -> Awaiting Payment)
    // -------------------------------------------------------------
    // In this step, admin approves the requested tier and sets upgrade amount.
    // The ticket transitions to AWAITING_PAYMENT, so the vendor dashboard shows "Pay Now".
    if (action === "approve" || action === "approve_plan" || action === "approve_request") {
      if (ticket.status === "COMPLETED" || ticket.status === "APPROVED") {
        return NextResponse.json({
          success: true,
          message: "Ticket is already completed and active.",
          ticket,
        });
      }

      const currPlanKey = (ticket.currentPlan || "silver").toLowerCase();
      const newPlanKey = (ticket.requestedPlan || "gold").toLowerCase();

      const getBaseAmount = (tier: string) =>
        tier === "silver" ? 5000 : tier === "platinum" ? 20000 : 10000;

      const currBase = getBaseAmount(currPlanKey);
      const newBase = getBaseAmount(newPlanKey);

      // Price calculation:
      // If Admin specified a custom upgrade amount in request, use it.
      // Otherwise, if upgrade (newBase > currBase), use the difference (newBase - currBase).
      // If switching/downgrading (newBase <= currBase), use target plan's base amount (newBase), NEVER 0!
      let upgradeAmount: number;
      if (body.upgradeAmount !== undefined && body.upgradeAmount !== null && body.upgradeAmount !== "") {
        upgradeAmount = Math.max(0, Number(body.upgradeAmount));
      } else {
        upgradeAmount = newBase > currBase ? (newBase - currBase) : newBase;
      }

      // Safeguard: Ensure upgrade fee is never 0
      if (upgradeAmount <= 0) {
        upgradeAmount = newBase;
      }

      const gatewayFee = Math.round(upgradeAmount * 0.03);
      const gstAmount = Math.round(upgradeAmount * 0.05);
      const totalAmount = upgradeAmount + gatewayFee + gstAmount;

      const newPlanName =
        newPlanKey === "silver"
          ? "Silver Partner (Booking Kiosk)"
          : newPlanKey === "platinum"
          ? "Platinum Partner (Regional Master Hub)"
          : "Gold Partner (District Exclusive Hub)";

      const notes =
        adminNotes ||
        `Approved by Admin HQ. Upgrade to ${newPlanName} confirmed. Upgrade fee: ₹${totalAmount.toLocaleString(
          "en-IN"
        )} payable by vendor.`;

      try {
        await prisma.planChangeTicket.update({
          where: { ticketId },
          data: {
            status: "AWAITING_PAYMENT",
            paymentStatus: "UNPAID",
            upgradeAmount,
            gatewayFee,
            gstAmount,
            totalAmount,
            approvedAt: new Date(),
            adminNotes: notes,
          },
        });
      } catch (err) {
        await prisma.$executeRaw`
          UPDATE plan_change_tickets
          SET 
            status = 'AWAITING_PAYMENT',
            payment_status = 'UNPAID',
            upgrade_amount = ${upgradeAmount},
            gateway_fee = ${gatewayFee},
            gst_amount = ${gstAmount},
            total_amount = ${totalAmount},
            approved_at = ${new Date()},
            admin_notes = ${notes},
            updated_at = ${new Date()}
          WHERE ticket_id = ${ticketId} OR id = ${ticket.id}
        `;
      }

      const updatedTicket = await prisma.planChangeTicket.findUnique({
        where: { ticketId },
      });

      return NextResponse.json({
        success: true,
        message: `Ticket #${ticketId} approved! Vendor dashboard is now enabled with the Pay Now button.`,
        ticket: updatedTicket,
      });
    }

    // -------------------------------------------------------------
    // ACTION 2: GENERATE & ISSUE CREDENTIALS (Admin Panel -> Completed)
    // -------------------------------------------------------------
    // In this step, after vendor clicks Pay Now and completes payment,
    // Admin HQ reviews payment confirmation and generates new credentials.
    if (action === "generate_credentials" || action === "issue_credentials") {
      const newPlanKey = (ticket.requestedPlan || "gold").toLowerCase();
      const newPlanName =
        newPlanKey === "silver"
          ? "Silver Partner (Booking Kiosk)"
          : newPlanKey === "platinum"
          ? "Platinum Partner (Regional Master Hub)"
          : "Gold Partner (District Exclusive Hub)";

      const newScope =
        newPlanKey === "silver"
          ? "Local Ward / Pin Code Hub"
          : newPlanKey === "platinum"
          ? "State / Regional Master Territory"
          : "Exclusive District Hub";

      const uniqueSuffix = ticket.ticketId.slice(-4);
      const generatedUserId = customUserId || ticket.newUserId || `BB-${newPlanKey.toUpperCase()}-${uniqueSuffix}`;
      const generatedPassword = customPassword || ticket.newPassword || `BroomBoom@${newPlanKey.toUpperCase()}2026`;

      const newBaseAmount = newPlanKey === "silver" ? 5000 : newPlanKey === "platinum" ? 20000 : 10000;
      const newGatewayFee = Math.round(newBaseAmount * 0.03);
      const newGstAmount = Math.round(newBaseAmount * 0.05);
      const newTotalAmount = newBaseAmount + newGatewayFee + newGstAmount;

      const credNotes =
        adminNotes ||
        `Payment verified. Plan upgraded to ${newPlanName}. New credentials issued by Admin HQ and dispatched to partner.`;

      // 1. Update ticket in DB
      try {
        await prisma.planChangeTicket.update({
          where: { ticketId },
          data: {
            status: "COMPLETED",
            paymentStatus: "PAID",
            newUserId: generatedUserId,
            newPassword: generatedPassword,
            adminNotes: credNotes,
          },
        });
      } catch (err) {
        await prisma.$executeRaw`
          UPDATE plan_change_tickets
          SET 
            status = 'COMPLETED',
            payment_status = 'PAID',
            new_user_id = ${generatedUserId},
            new_password = ${generatedPassword},
            admin_notes = ${credNotes},
            updated_at = ${new Date()}
          WHERE ticket_id = ${ticketId} OR id = ${ticket.id}
        `;
      }

      const updatedTicket = await prisma.planChangeTicket.findUnique({
        where: { ticketId },
      });

      // 2. Update VendorUser records
      try {
        const existingUser = await prisma.vendorUser.findFirst({
          where: { applicationId: ticket.applicationId },
          orderBy: { createdAt: "desc" },
        });

        if (existingUser) {
          await prisma.vendorUser.update({
            where: { id: existingUser.id },
            data: {
              currentPlan: newPlanKey,
              password: generatedPassword,
            },
          });
        }

        // Upsert direct login account for generatedUserId
        await prisma.vendorUser.upsert({
          where: { userId: generatedUserId },
          update: {
            password: generatedPassword,
            currentPlan: newPlanKey,
            applicationId: ticket.applicationId,
            vendorName: ticket.vendorName,
            vendorMobile: ticket.vendorMobile,
            vendorEmail: ticket.vendorEmail,
            isActive: true,
          },
          create: {
            userId: generatedUserId,
            password: generatedPassword,
            applicationId: ticket.applicationId,
            vendorName: ticket.vendorName,
            vendorMobile: ticket.vendorMobile,
            vendorEmail: ticket.vendorEmail,
            currentPlan: newPlanKey,
            isActive: true,
          },
        });
      } catch (uErr) {
        console.warn("[ADMIN ISSUE CREDENTIALS USER UPDATE WARN]", uErr);
      }

      // 3. Update VendorSubscription in PostgreSQL (scoped to ticket applicationId)
      try {
        await prisma.vendorSubscription.updateMany({
          where: { applicationId: ticket.applicationId },
          data: {
            planTier: newPlanKey,
            planName: newPlanName,
            territoryScope: newScope,
            hasExclusivity: newPlanKey !== "silver",
            baseAmount: newBaseAmount,
            gatewayFee: newGatewayFee,
            gstAmount: newGstAmount,
            totalAmount: newTotalAmount,
            adminNotes: `Plan upgraded via Ticket #${ticketId} to ${newPlanName}. Payment verified and new credentials issued on ${new Date().toISOString()}`,
          },
        });
      } catch (sErr) {
        console.warn("[ADMIN ISSUE CREDENTIALS SUB UPDATE WARN]", sErr);
      }

      // 4. Update VendorLead in PostgreSQL (scoped to ticket applicationId)
      try {
        await prisma.vendorLead.updateMany({
          where: { applicationId: ticket.applicationId },
          data: {
            preferredPackage: newPlanKey,
            packageName: newPlanName,
            status: "approved",
            adminNotes: `Application approved with upgraded plan ${newPlanName} (Ticket #${ticketId}).`,
          },
        });
      } catch (lErr) {
        console.warn("[ADMIN ISSUE CREDENTIALS LEAD UPDATE WARN]", lErr);
      }

      return NextResponse.json({
        success: true,
        message: `New credentials issued! User ID: ${generatedUserId} | Password: ${generatedPassword}. Plan ${newPlanName} is now active.`,
        ticket: updatedTicket,
        newCredentials: {
          userId: generatedUserId,
          password: generatedPassword,
          newPlan: newPlanKey,
          newPlanName,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: `Invalid action "${action}". Supported: approve, generate_credentials, reject.` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[ADMIN TICKETS ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process ticket request" },
      { status: 500 }
    );
  }
}
