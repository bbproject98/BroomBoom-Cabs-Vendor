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
    const isPaid = ["PAID", "paid", "SUCCESS", "success"].includes(
      (cfOrder.order_status || "").trim()
    );

    // Fetch existing subscription for this order to retrieve authoritative applicant data
    const existingSub = await prisma.vendorSubscription.findFirst({
      where: { orderId: cfOrder.order_id },
    });

    const targetAppId =
      applicationId ||
      existingSub?.applicationId ||
      (orderId.includes("_") ? orderId.split("_").slice(0, -1).join("-").replace(/_/g, "-") : null);

    if (isPaid) {
      // PAYMENT SUCCESSFUL:
      // Update database subscription status to active & PAID
      try {
        await prisma.vendorSubscription.updateMany({
          where: { orderId: cfOrder.order_id },
          data: {
            status: "active",
            paymentStatus: "PAID",
            cfOrderId: cfOrder.cf_order_id,
            paidAt: new Date(),
            adminNotes: `Cashfree payment verified as PAID at ${new Date().toISOString()} | Amount: ₹${cfOrder.order_amount}`,
          },
        });
      } catch (subErr) {
        console.warn("[CALLBACK DB SUB UPDATE WARN]", subErr);
      }

      // Update database lead record to payment_completed
      if (targetAppId || existingSub?.vendorMobile) {
        try {
          const leadOrFilters: any[] = [];
          if (targetAppId) {
            leadOrFilters.push(
              { applicationId: targetAppId },
              { applicationId: { contains: targetAppId, mode: "insensitive" as const } }
            );
          }
          if (existingSub?.vendorMobile) {
            const cleanMobile = existingSub.vendorMobile.replace(/\D/g, "").slice(-10);
            leadOrFilters.push(
              { mobile: cleanMobile },
              { mobile: `0${cleanMobile}` },
              { mobile: `+91${cleanMobile}` },
              { mobile: { endsWith: cleanMobile } }
            );
          }

          if (leadOrFilters.length > 0) {
            await prisma.vendorLead.updateMany({
              where: { OR: leadOrFilters },
              data: {
                status: "payment_completed",
                adminNotes: `Cashfree Order: ${orderId} | Status: PAID | Amount: ₹${cfOrder.order_amount}`,
              },
            });
          }
        } catch (dbErr) {
          console.warn("[CALLBACK DB LEAD UPDATE WARN]", dbErr);
        }
      }

      const resolvedAppId =
        targetAppId || existingSub?.applicationId || applicationId || `BB-${orderId.slice(-6)}`;

      // REDIRECT TO THANK-YOU PAGE WITH VERIFIED STATUS
      return NextResponse.redirect(
        new URL(
          `/thank-you?order_id=${encodeURIComponent(orderId)}&applicationId=${encodeURIComponent(
            resolvedAppId
          )}&pkg=${pkg}&status=success`,
          baseUrl
        )
      );
    } else {
      // PAYMENT PENDING / FAILED / USER_DROPPED:
      console.log(
        `[PAYMENT NOT SUCCESSFUL] Order: ${orderId}, Status: ${cfOrder.order_status}. Redirecting back to /apply.`
      );
      const failureStatus = (cfOrder.order_status || "failed").toLowerCase();
      return NextResponse.redirect(
        new URL(
          `/apply?package=${pkg}&applicationId=${encodeURIComponent(
            targetAppId || applicationId || ""
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
