import { NextResponse } from "next/server";
import { getCashfreeOrder } from "@/lib/cashfree";
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
    const orderId = searchParams.get("order_id");
    const applicationId = searchParams.get("applicationId");

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "order_id query parameter is required" },
        { status: 400 }
      );
    }

    const result = await getCashfreeOrder(orderId);

    if (!result.success || !result.data) {
      return NextResponse.json(
        { success: false, error: result.error || "Order not found on Cashfree" },
        { status: 404 }
      );
    }

    const cfOrder = result.data;
    const isPaid = cfOrder.order_status === "PAID";

    // Update database lead record
    let updatedLead: any = null;
    const targetAppId = applicationId || (orderId.includes("_") ? orderId.split("_")[0] : null);

    if (targetAppId) {
      try {
        const matchingLead = await prisma.vendorLead.findFirst({
          where: {
            OR: [
              { applicationId: targetAppId },
              { applicationId: { contains: targetAppId, mode: "insensitive" } },
            ],
          },
        });

        if (matchingLead) {
          updatedLead = await prisma.vendorLead.update({
            where: { id: matchingLead.id },
            data: {
              status: isPaid ? "payment_completed" : "payment_pending",
              adminNotes: `Cashfree Order: ${orderId} | Status: ${cfOrder.order_status} | Amount: ₹${cfOrder.order_amount}`,
            },
          });
          console.log(`[DB UPDATED] VendorLead ${matchingLead.applicationId} status set to ${isPaid ? "payment_completed" : "payment_pending"}`);
        }
      } catch (dbErr) {
        console.warn("[DB UPDATE SKIP]", dbErr);
      }
    }

    // Update or Upsert VendorSubscription in PostgreSQL
    let subscription: any = null;
    try {
      const existingSub = await prisma.vendorSubscription.findFirst({
        where: {
          OR: [
            { orderId: cfOrder.order_id },
            ...(targetAppId ? [{ applicationId: targetAppId }] : []),
          ],
        },
      });

      if (existingSub) {
        subscription = await prisma.vendorSubscription.update({
          where: { id: existingSub.id },
          data: {
            status: isPaid ? "active" : "pending",
            paymentStatus: cfOrder.order_status,
            cfOrderId: cfOrder.cf_order_id,
            paidAt: isPaid ? new Date() : existingSub.paidAt,
            adminNotes: `Verified via Cashfree API: Status ${cfOrder.order_status} at ${new Date().toISOString()}`,
          },
        });
        console.log(`[DB SUBSCRIPTION UPDATED] Sub ID: ${subscription.subscriptionId}, Status: ${subscription.status}, PaymentStatus: ${subscription.paymentStatus}`);
      } else {
        // Fallback: Create subscription entry if one didn't exist
        const pkgKey = (cfOrder.order_tags?.package || "gold").toLowerCase();
        const baseAmt = parseFloat(cfOrder.order_tags?.base_amount || "0") || (pkgKey === "silver" ? 10000 : pkgKey === "platinum" ? 50000 : 20000);
        const gwFee = parseFloat(cfOrder.order_tags?.gateway_fee_3_percent || "0") || Math.round(baseAmt * 0.03);
        const gstAmt = parseFloat(cfOrder.order_tags?.gst_5_percent || "0") || Math.round(baseAmt * 0.05);
        const totAmt = parseFloat(String(cfOrder.order_amount)) || (baseAmt + gwFee + gstAmt);

        const subId = `SUB-BB-2026-${Date.now().toString().slice(-6)}`;
        const oneYear = new Date();
        oneYear.setFullYear(oneYear.getFullYear() + 1);

        subscription = await prisma.vendorSubscription.create({
          data: {
            subscriptionId: subId,
            applicationId: targetAppId || updatedLead?.applicationId || "BB-VENDOR",
            vendorName: updatedLead?.fullName || cfOrder.customer_details?.customer_name || "Valued Partner",
            vendorMobile: updatedLead?.mobile || cfOrder.customer_details?.customer_phone || "9999999999",
            vendorEmail: updatedLead?.email || cfOrder.customer_details?.customer_email || null,
            city: updatedLead?.city || "India",
            state: updatedLead?.state || null,
            planTier: pkgKey,
            planName:
              pkgKey === "silver"
                ? "Silver Partner (Booking Kiosk)"
                : pkgKey === "platinum"
                ? "Platinum Partner (Regional Master Hub)"
                : "Gold Partner (District Exclusive Hub)",
            territoryScope:
              pkgKey === "silver"
                ? "Local Ward / Pin Code Hub"
                : pkgKey === "gold"
                ? "Exclusive District Zone"
                : "State / Regional Master Territory",
            hasExclusivity: pkgKey !== "silver",
            orderId: cfOrder.order_id,
            cfOrderId: cfOrder.cf_order_id,
            paymentStatus: cfOrder.order_status,
            status: isPaid ? "active" : "pending",
            baseAmount: baseAmt,
            gatewayFee: gwFee,
            gstAmount: gstAmt,
            totalAmount: totAmt,
            paidAt: isPaid ? new Date() : null,
            endDate: oneYear,
            adminNotes: `Created on Cashfree verification. Status: ${cfOrder.order_status}`,
          },
        });
        console.log(`[DB SUBSCRIPTION CREATED] Sub ID: ${subscription.subscriptionId}`);
      }
    } catch (subErr) {
      console.error("[DB SUBSCRIPTION VERIFY ERROR]", subErr);
    }

    return NextResponse.json({
      success: true,
      orderId: cfOrder.order_id,
      cfOrderId: cfOrder.cf_order_id,
      orderStatus: cfOrder.order_status,
      orderAmount: cfOrder.order_amount,
      orderCurrency: cfOrder.order_currency,
      customerDetails: cfOrder.customer_details,
      createdAt: cfOrder.created_at,
      isPaid,
      applicationId: updatedLead?.applicationId || targetAppId,
      subscription,
    });
  } catch (err: any) {
    console.error("[API ERROR /api/payment/verify]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

