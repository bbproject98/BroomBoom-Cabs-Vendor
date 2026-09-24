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

    const ticketId = `TICK-BB-2026-${Date.now().toString().slice(-6)}`;

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
        status: "PENDING",
        adminNotes: `Vendor requested upgrade from ${currentPlan.toUpperCase()} to ${requestedPlan.toUpperCase()}. Pending Admin approval.`,
      },
    });

    // Annotate lead if exists
    try {
      await prisma.vendorLead.updateMany({
        where: { applicationId },
        data: {
          adminNotes: `Ticket ${ticketId} raised: Plan change from ${currentPlan} to ${requestedPlan}.`,
        },
      });
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: `Plan change ticket #${ticketId} submitted successfully. Admin HQ will review and confirm.`,
      ticket,
    });
  } catch (error: any) {
    console.error("[RAISE TICKET ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to raise ticket" },
      { status: 500 }
    );
  }
}

