import { NextResponse } from "next/server";
import { handleOptions, jsonResponse } from "@/lib/cors";
import {
  getVendorOrders,
  acceptBookingOrder,
  rejectAndCascadeOrder,
  completeBookingOrder,
  cleanPincode,
} from "@/lib/ordersService";
import { buildWalletClearancePayload } from "@/lib/walletService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function OPTIONS() {
  return handleOptions();
}

/**
 * GET /api/vendor/orders
 * Returns live bookings allocated to this vendor or matching their plan tier and territory pincode
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendorId") || searchParams.get("applicationId") || undefined;
    const planTier = searchParams.get("planTier") || undefined;
    const city = searchParams.get("city") || undefined;
    const pincode = searchParams.get("pincode") || undefined;

    const orders = await getVendorOrders(vendorId, planTier, city, pincode);

    return jsonResponse({
      success: true,
      total: orders.length,
      orders,
    });
  } catch (error: any) {
    console.error("[API VENDOR ORDERS GET ERROR]", error);
    return jsonResponse(
      { success: false, error: error.message || "Failed to fetch vendor orders" },
      500
    );
  }
}

/**
 * POST /api/vendor/orders
 * Handles Vendor accepting, declining (triggering cascade to next same-tier partner), or completing a ride
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, bookingId, vendorId, reason, driverInfo, proposedPrice } = body;

    if (!bookingId || !action) {
      return jsonResponse(
        { success: false, error: "bookingId and action ('accept' | 'reject' | 'complete') are required." },
        400
      );
    }

    if (action === "accept") {
      const mergedDriverInfo = {
        ...(driverInfo || {}),
        ...(proposedPrice && Number(proposedPrice) > 0
          ? { proposedPrice: Number(proposedPrice) }
          : {}),
      };
      const accepted = await acceptBookingOrder(bookingId, vendorId || "VENDOR", mergedDriverInfo);
      if (!accepted) {
        return jsonResponse({ success: false, error: "Order not found or could not be accepted." }, 404);
      }
      return jsonResponse({
        success: true,
        action: "accept",
        message: `Booking ${bookingId} accepted successfully! Driver dispatched.`,
        order: accepted,
        wallet: accepted.walletState || null,
      });
    }

    if (action === "reject") {
      // STRICT PLAN-WISE CASCADING:
      // If a Gold planner rejects, automatically route to the next Gold planner in that PIN territory
      const cascadeResult = await rejectAndCascadeOrder(
        bookingId,
        vendorId || "CURRENT_VENDOR",
        reason || "Vendor unavailable / declined ride"
      );

      return jsonResponse({
        success: true,
        action: "reject",
        cascaded: cascadeResult.cascaded,
        nextVendor: cascadeResult.nextVendor,
        message: cascadeResult.message,
        order: cascadeResult.order,
      });
    }

    if (action === "complete") {
      const completed = await completeBookingOrder(bookingId);
      if (!completed) {
        return jsonResponse({ success: false, error: "Order not found or could not be completed." }, 404);
      }
      return jsonResponse({
        success: true,
        action: "complete",
        message: `Booking ${bookingId} completed and payout settled to wallet!`,
        order: completed,
      });
    }

    return jsonResponse({ success: false, error: `Invalid action '${action}'. Expected 'accept', 'reject', or 'complete'.` }, 400);
  } catch (error: any) {
    const walletGatePayload = buildWalletClearancePayload(error);
    if (walletGatePayload) {
      return jsonResponse(walletGatePayload, 402);
    }
    console.error("[API VENDOR ORDERS POST ERROR]", error);
    return jsonResponse(
      { success: false, error: error.message || "Failed to process order action" },
      500
    );
  }
}

