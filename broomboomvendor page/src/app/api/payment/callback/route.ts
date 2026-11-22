import { NextResponse } from "next/server";
import { getCashfreeOrder } from "@/lib/cashfree";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    let orderId =
      searchParams.get("order_id") ||
      searchParams.get("orderId") ||
      searchParams.get("cf_order_id");
    if (orderId === "{order_id}") {
      orderId = null;
    }

    const applicationId = searchParams.get("applicationId");
    const pkg = (searchParams.get("pkg") || "gold").toLowerCase();
    const queryName = searchParams.get("name") || "";
    const queryMobile = searchParams.get("mobile") || "";
    const queryCity = searchParams.get("city") || "";

    const type = searchParams.get("type");
    const ticketId = searchParams.get("ticketId");
    const isUpgrade =
      type === "upgrade" || (orderId ? orderId.startsWith("UPG_") : false);

    const fwdHost = request.headers.get("x-forwarded-host");
    const fwdProto = request.headers.get("x-forwarded-proto");
    const host = fwdHost || request.headers.get("host") || "localhost:3000";
    const protocol =
      fwdProto ||
      (host.includes("localhost") || host.includes("127.0.0.1")
        ? "http"
        : "https");
    const baseUrl = origin || `${protocol}://${host}`;

    // If orderId is missing, attempt to recover it from recent DB records
    if (!orderId && applicationId) {
      try {
        const recentSub = await prisma.vendorSubscription.findFirst({
          where: { applicationId },
          orderBy: { createdAt: "desc" },
        });
        if (recentSub?.orderId) {
          orderId = recentSub.orderId;
        }
      } catch {}
    }

    if (!orderId) {
      if (isUpgrade) {
        return NextResponse.redirect(
          new URL("/vendor/dashboard?upgrade=returned", baseUrl)
        );
      }
      return NextResponse.redirect(
        new URL(
          `/apply?package=${pkg}&applicationId=${encodeURIComponent(
            applicationId || ""
          )}&name=${encodeURIComponent(queryName)}&mobile=${encodeURIComponent(
            queryMobile
          )}&city=${encodeURIComponent(queryCity)}&payment_status=returned`,
          baseUrl
        )
      );
    }

    // Check order status directly with Cashfree
    const result = await getCashfreeOrder(orderId);

    if (!result.success || !result.data) {
      console.warn("[CALLBACK VERIFY FAILED]", result.error);
      if (isUpgrade) {
        return NextResponse.redirect(
          new URL(
            `/vendor/dashboard?upgrade=returned&order_id=${encodeURIComponent(
              orderId
            )}&ticketId=${encodeURIComponent(ticketId || "")}`,
            baseUrl
          )
        );
      }
      return NextResponse.redirect(
        new URL(
          `/apply?package=${pkg}&applicationId=${encodeURIComponent(
            applicationId || ""
          )}&name=${encodeURIComponent(queryName)}&mobile=${encodeURIComponent(
            queryMobile
          )}&city=${encodeURIComponent(queryCity)}&payment_status=returned&order_id=${encodeURIComponent(
            orderId
          )}`,
          baseUrl
        )
      );
    }

    const cfOrder = result.data;
    const rawStatus = (cfOrder.order_status || "").trim().toUpperCase();
    const isPaid = ["PAID", "SUCCESS"].includes(rawStatus);

    // Fetch existing subscription for this order to retrieve authoritative applicant data
    let existingSub = null;
    try {
      existingSub = await prisma.vendorSubscription.findFirst({
        where: { orderId: cfOrder.order_id },
      });
    } catch {}

    const targetAppId =
      applicationId ||
      existingSub?.applicationId ||
      (orderId.includes("_")
        ? orderId.split("_").slice(0, -1).join("-").replace(/_/g, "-")
        : null);

    const resolvedName =
      queryName || existingSub?.vendorName || "Valued Partner";
    const resolvedMobile = queryMobile || existingSub?.vendorMobile || "";
    const resolvedCity = queryCity || existingSub?.city || "";

    if (isPaid) {
      // -----------------------------------------------------------------
      // UPGRADE ORDER PAYMENT SUCCESS:
      // -----------------------------------------------------------------
      if (isUpgrade) {
        try {
          await prisma.planChangeTicket.updateMany({
            where: {
              OR: [
                ...(ticketId ? [{ ticketId }] : []),
                ...(targetAppId ? [{ applicationId: targetAppId }] : []),
                { paymentId: String(cfOrder.cf_order_id || cfOrder.order_id) },
              ],
            },
            data: {
              status: "PAYMENT_COMPLETED",
              paymentStatus: "PAID",
              paymentId: String(cfOrder.cf_order_id || cfOrder.order_id),
              paidAt: new Date(),
              adminNotes: `Upgrade payment of ₹${cfOrder.order_amount} verified via Cashfree (Order: ${orderId}, Ref: ${cfOrder.cf_order_id}). Sent to Admin HQ for approval.`,
            },
          });
        } catch (ticketErr) {
          console.warn("[CALLBACK UPGRADE TICKET UPDATE WARN]", ticketErr);
        }

        return NextResponse.redirect(
          new URL(
            `/vendor/dashboard?upgrade=success&order_id=${encodeURIComponent(
              orderId
            )}&ticketId=${encodeURIComponent(ticketId || "")}&plan=${encodeURIComponent(
              pkg
            )}&amount=${encodeURIComponent(cfOrder.order_amount || "")}`,
            baseUrl
          )
        );
      }

      // -----------------------------------------------------------------
      // INITIAL REGISTRATION PAYMENT SUCCESS:
      // -----------------------------------------------------------------
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
      if (targetAppId || existingSub?.vendorMobile || resolvedMobile) {
        try {
          const cleanMobile = (resolvedMobile || existingSub?.vendorMobile || "").replace(/\D/g, "").slice(-10);
          const leadOrFilters: any[] = [];
          if (targetAppId) {
            leadOrFilters.push(
              { applicationId: targetAppId },
              { applicationId: { contains: targetAppId, mode: "insensitive" as const } }
            );
          }
          if (cleanMobile) {
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
      // USER RETURNED OR CANCELLED / DROPPED:
      // If order is ACTIVE, USER_DROPPED, or CANCELLED, this is a normal return from gateway
      const isReturn = ["ACTIVE", "USER_DROPPED", "CANCELLED", "PENDING"].includes(rawStatus);
      const returnStatus = isReturn ? "returned" : "failed";

      if (isUpgrade) {
        return NextResponse.redirect(
          new URL(
            `/vendor/dashboard?upgrade=${returnStatus}&order_id=${encodeURIComponent(
              orderId
            )}&ticketId=${encodeURIComponent(ticketId || "")}`,
            baseUrl
          )
        );
      }

      return NextResponse.redirect(
        new URL(
          `/apply?package=${pkg}&applicationId=${encodeURIComponent(
            targetAppId || applicationId || ""
          )}&name=${encodeURIComponent(resolvedName)}&mobile=${encodeURIComponent(
            resolvedMobile
          )}&city=${encodeURIComponent(resolvedCity)}&payment_status=${returnStatus}&order_id=${encodeURIComponent(
            orderId
          )}`,
          baseUrl
        )
      );
    }
  } catch (error: any) {
    console.error("[CALLBACK EXCEPTION]", error);
    if (request.url.includes("type=upgrade")) {
      return NextResponse.redirect(new URL("/vendor/dashboard?upgrade=returned", request.url));
    }
    return NextResponse.redirect(new URL("/apply?payment_status=returned", request.url));
  }
}

export async function POST(request: Request) {
  return GET(request);
}
