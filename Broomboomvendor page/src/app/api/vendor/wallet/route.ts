import { NextResponse } from "next/server";
import {
  getVendorWalletState,
  settleVendorWalletPayment,
} from "@/lib/walletService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/vendor/wallet?vendorId=...
 * Returns the vendor's persistent ₹0-baseline wallet state, unsettled booking count (0-2),
 * due amount required to maintain ₹0, and full transaction ledger.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendorId") || "";

    if (!vendorId.trim()) {
      return NextResponse.json(
        { success: false, error: "vendorId query parameter is required" },
        { status: 400 }
      );
    }

    const wallet = await getVendorWalletState(vendorId);
    return NextResponse.json({ success: true, wallet });
  } catch (error: any) {
    console.error("[GET /api/vendor/wallet ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load vendor wallet" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/vendor/wallet
 * Settles outstanding dues to restore ₹0 balance (clearing the 2-booking lock)
 * or processes an advance top-up.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action = "pay_due", vendorId, amount, paymentRef, method } = body;

    if (!vendorId || !String(vendorId).trim()) {
      return NextResponse.json(
        { success: false, error: "vendorId is required" },
        { status: 400 }
      );
    }

    const current = await getVendorWalletState(String(vendorId));

    if (action === "pay_due" || action === "topup" || action === "settle_zero") {
      const targetAmount =
        amount !== undefined && amount !== null && Number(amount) > 0
          ? Math.round(Number(amount))
          : current.amountDueToZero;

      if (!targetAmount || targetAmount <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Wallet is already at ₹0 or above. No due payment required.",
          },
          { status: 400 }
        );
      }

      if (current.mustPayToZero && targetAmount < current.amountDueToZero) {
        return NextResponse.json(
          {
            success: false,
            error: `Minimum payment of ₹${current.amountDueToZero} is required to bring your wallet back to ₹0 and unlock the next booking.`,
          },
          { status: 400 }
        );
      }

      const wallet = await settleVendorWalletPayment({
        vendorId: String(vendorId),
        amount: targetAmount,
        paymentRef: paymentRef ? String(paymentRef) : undefined,
        method: method ? String(method) : "UPI Payment Link",
      });

      return NextResponse.json({
        success: true,
        wallet,
        message:
          wallet.balance >= 0
            ? `Payment of ₹${targetAmount} received! Wallet restored to ₹${wallet.balance} (${wallet.unsettledBookingsCount}/2 bookings unsettled). Ready for next booking!`
            : `Partial payment of ₹${targetAmount} received. Remaining due to reach ₹0: ₹${wallet.amountDueToZero}.`,
      });
    }

    return NextResponse.json(
      { success: false, error: `Unknown wallet action: ${action}` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[POST /api/vendor/wallet ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process wallet settlement" },
      { status: 500 }
    );
  }
}
