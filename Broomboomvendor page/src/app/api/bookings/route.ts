import { NextResponse } from "next/server";
import { handleOptions, jsonResponse } from "@/lib/cors";
import {
  createBookingOrder,
  getAllBookings,
  acceptBookingOrder,
  rejectAndCascadeOrder,
  completeBookingOrder,
} from "@/lib/ordersService";
import { buildWalletClearancePayload } from "@/lib/walletService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function OPTIONS() {
  return handleOptions();
}

/**
 * GET /api/bookings
 * Returns live booking orders for BroomBoom User App Admin & Vendor Admin
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const planTier = searchParams.get("planTier") || undefined;
    const pickupZone = searchParams.get("pickupZone") || undefined;
    const pincode = searchParams.get("pincode") || undefined;
    const search = searchParams.get("search") || undefined;

    const bookings = await getAllBookings({ status, planTier, pickupZone, pincode, search });

    return jsonResponse({
      success: true,
      total: bookings.length,
      bookings,
    });
  } catch (error: any) {
    console.error("[API BOOKINGS GET ERROR]", error);
    return jsonResponse({ success: false, error: error.message || "Failed to fetch bookings" }, 500);
  }
}

/**
 * POST /api/bookings
 * Endpoint for BroomBoom User App & App Admin to place bookings
 * Automatically dispatches to the nearest vendor plan-wise (e.g. Airport -> Silver vendor)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.passengerName || !body.passengerPhone || !body.pickup || !body.drop) {
      return jsonResponse(
        {
          success: false,
          error: "passengerName, passengerPhone, pickup, and drop are required fields.",
        },
        400
      );
    }

    const booking = await createBookingOrder({
      passengerName: body.passengerName,
      passengerPhone: body.passengerPhone,
      passengerRating: body.passengerRating,
      pickup: body.pickup,
      pickupZone: body.pickupZone,
      pickupPincode: body.pickupPincode,
      drop: body.drop,
      dropZone: body.dropZone,
      dropPincode: body.dropPincode,
      distance: body.distance,
      duration: body.duration,
      vehicleCategory: body.vehicleCategory,
      planTier: body.planTier, // silver, gold, platinum
      bookingType: body.bookingType || body.serviceType,
      commissionRate: body.commissionRate !== undefined ? Number(body.commissionRate) : undefined,
      totalFare: Number(body.totalFare) || 500,
      vendorPayout: body.vendorPayout ? Number(body.vendorPayout) : undefined,
      paymentMethod: body.paymentMethod,
      source: body.source || "broomboom app",
      customVendorId: body.customVendorId,
      notes: body.notes,
    });

    return jsonResponse({
      success: true,
      message: `Booking created successfully! Dispatched to ${booking.assigned_vendor_name || "nearest regional vendor"}.`,
      booking,
    }, 201);
  } catch (error: any) {
    console.error("[API BOOKINGS POST ERROR]", error);
    return jsonResponse({ success: false, error: error.message || "Failed to create booking" }, 500);
  }
}

/**
 * PATCH /api/bookings
 * Accept, Reject (with Auto-Cascade), or Complete a booking
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, action, vendorId, driverInfo, reason } = body;

    if (!bookingId || !action) {
      return jsonResponse({ success: false, error: "bookingId and action are required." }, 400);
    }

    if (action === "accept") {
      const updated = await acceptBookingOrder(bookingId, vendorId || "VALUED_VENDOR", driverInfo);
      return jsonResponse({
        success: true,
        message: `Booking ${bookingId} accepted successfully!`,
        order: updated,
      });
    }

    if (action === "reject") {
      const result = await rejectAndCascadeOrder(
        bookingId,
        vendorId || "ANON_VENDOR",
        reason || "Vendor unavailable"
      );
      return jsonResponse(result);
    }

    if (action === "complete") {
      const completed = await completeBookingOrder(bookingId);
      return jsonResponse({
        success: true,
        message: `Booking ${bookingId} completed! Payout settled.`,
        order: completed,
      });
    }

    return jsonResponse({ success: false, error: `Invalid action: ${action}` }, 400);
  } catch (error: any) {
    const walletGatePayload = buildWalletClearancePayload(error);
    if (walletGatePayload) {
      return jsonResponse(walletGatePayload, 402);
    }
    console.error("[API BOOKINGS PATCH ERROR]", error);
    return jsonResponse({ success: false, error: error.message || "Failed to update booking" }, 500);
  }
}

