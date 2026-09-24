import { NextResponse } from "next/server";
import { getCashfreeOrder } from "@/lib/cashfree";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const orderId = searchParams.get("order_id");
    const applicationId = searchParams.get("applicationId");
    const pkg = (searchParams.get("pkg") || "gold").toLowerCase();

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    const baseUrl = origin || `${protocol}://${host}`;

    if (!orderId) {
      // No order ID -> redirect back to apply page
      return NextResponse.redirect(new URL(`/apply?package=${pkg}`, baseUrl));
    }

    // Check order status directly with Cashfree
    const result = await getCashfreeOrder(orderId);

    if (!result.success || !result.data) {
      console.warn("[CALLBACK VERIFY FAILED]", result.error);
      return NextResponse.redirect(
        new URL(
          `/apply?package=${pkg}&applicationId=${encodeURIComponent(
            applicationId || ""
          )}&payment_status=failed&order_id=${encodeURIComponent(orderId)}`,
          baseUrl
        )
      );
    }

    const cfOrder = result.data;
    const isPaid = cfOrder.order_status === "PAID";
    const targetAppId = applicationId || (orderId.includes("_") ? orderId.split("_")[0] : null);

    if (isPaid) {
      // PAYMENT SUCCESSFUL:
      // Update database lead & subscription status
      if (targetAppId) {
        try {
          await prisma.vendorLead.updateMany({
            where: {
              OR: [
                { applicationId: targetAppId },
                { applicationId: { contains: targetAppId, mode: "insensitive" } },
              ],
            },
            data: {
              status: "payment_completed",
              adminNotes: `Cashfree Order: ${orderId} | Status: PAID | Amount: ₹${cfOrder.order_amount}`,
            },
          });
        } catch (dbErr) {
          console.warn("[CALLBACK DB LEAD UPDATE WARN]", dbErr);
        }
      }

      try {
        await prisma.vendorSubscription.updateMany({
          where: { orderId: cfOrder.order_id },
          data: {
            status: "active",
            paymentStatus: "PAID",
            cfOrderId: cfOrder.cf_order_id,
            paidAt: new Date(),
            adminNotes: `Cashfree payment verified as PAID at ${new Date().toISOString()}`,
          },
        });
      } catch (subErr) {
        console.warn("[CALLBACK DB SUB UPDATE WARN]", subErr);
      }

      // REDIRECT ONLY IF PAYMENT SUCCESS TO THANK-YOU PAGE
      return NextResponse.redirect(
        new URL(
          `/thank-you?order_id=${encodeURIComponent(orderId)}&applicationId=${encodeURIComponent(
            applicationId || ""
          )}&pkg=${pkg}&status=success`,
          baseUrl
        )
      );
    } else {
      // PAYMENT PENDING / FAILED / USER_DROPPED:
      // DO NOT REDIRECT TO THANK-YOU PAGE!
      // Redirect directly back to the previous page (/apply)
      console.log(
        `[PAYMENT NOT SUCCESSFUL] Order: ${orderId}, Status: ${cfOrder.order_status}. Redirecting directly back to /apply.`
      );
      const failureStatus = (cfOrder.order_status || "failed").toLowerCase();
      return NextResponse.redirect(
        new URL(
          `/apply?package=${pkg}&applicationId=${encodeURIComponent(
            applicationId || targetAppId || ""
          )}&payment_status=${failureStatus}&order_id=${encodeURIComponent(orderId)}`,
          baseUrl
        )
      );
    }
  } catch (error: any) {
    console.error("[CALLBACK EXCEPTION]", error);
    return NextResponse.redirect(new URL("/apply?payment_status=error", request.url));
  }
}

