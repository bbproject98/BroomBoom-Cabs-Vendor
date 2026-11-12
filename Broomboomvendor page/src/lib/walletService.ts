import prisma from "@/lib/prisma";

export const MAX_UNSETTLED_BOOKINGS = 2;

export interface WalletTransactionRecord {
  id: string;
  vendorId: string;
  type: "penalty" | "credit" | "booking_due" | "settlement";
  title: string;
  refBookingId: string;
  reason: string;
  amount: number;
  date: string;
  balanceAfter: number;
  badge: string;
  badgeColor: string;
  driverInvolved?: string;
}

export interface VendorWalletState {
  vendorId: string;
  balance: number;
  unsettledBookingsCount: number;
  maxUnsettledBookings: number;
  remainingFreeBookings: number;
  amountDueToZero: number;
  mustPayToZero: boolean;
  totalSettled: number;
  transactions: WalletTransactionRecord[];
}

export class WalletClearanceRequiredError extends Error {
  code = "WALLET_CLEARANCE_REQUIRED";
  balance: number;
  unsettledBookingsCount: number;
  amountDueToZero: number;

  constructor(balance: number, unsettledBookingsCount: number) {
    const due = Math.max(0, Math.round(Math.abs(Math.min(0, balance))));
    super(
      `Wallet clearance required: ${unsettledBookingsCount}/${MAX_UNSETTLED_BOOKINGS} bookings used. Pay ₹${due} to maintain ₹0 wallet balance before accepting the next booking.`
    );
    this.balance = balance;
    this.unsettledBookingsCount = unsettledBookingsCount;
    this.amountDueToZero = due;
  }
}

export function buildWalletClearancePayload(error: any) {
  if (!error || error.code !== "WALLET_CLEARANCE_REQUIRED") {
    return null;
  }
  return {
    success: false,
    code: "WALLET_CLEARANCE_REQUIRED",
    error: error.message,
    wallet: {
      balance: Number(error.balance || 0),
      unsettledBookingsCount: Number(error.unsettledBookingsCount || MAX_UNSETTLED_BOOKINGS),
      maxUnsettledBookings: MAX_UNSETTLED_BOOKINGS,
      amountDueToZero: Number(error.amountDueToZero || 0),
      mustPayToZero: true,
    },
  };
}

let walletTablesInitialized = false;

export async function ensureWalletTables(): Promise<void> {
  if (walletTablesInitialized) return;
  try {
    await prisma.$queryRawUnsafe(`
      CREATE TABLE IF NOT EXISTS vendor_wallets (
        vendor_id TEXT PRIMARY KEY,
        balance NUMERIC DEFAULT 0,
        unsettled_bookings_count INTEGER DEFAULT 0,
        total_settled NUMERIC DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await prisma.$queryRawUnsafe(`
      CREATE TABLE IF NOT EXISTS vendor_booking_wallet_ledger (
        id TEXT PRIMARY KEY,
        vendor_id TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        ref_booking_id TEXT,
        reason TEXT,
        amount NUMERIC NOT NULL,
        balance_after NUMERIC NOT NULL,
        badge TEXT,
        driver_involved TEXT,
        payment_method TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await prisma.$queryRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_vendor_booking_wallet_ledger_vendor
      ON vendor_booking_wallet_ledger(vendor_id, created_at DESC);
    `);

    walletTablesInitialized = true;
  } catch (err) {
    console.warn("[WALLET TABLES INIT WARN]", err);
  }
}

/**
 * Computes the per-booking advance / dispatch charge debited to the vendor wallet.
 * Falls back to 5% (min ₹50) when payout equals totalFare (e.g., 0% tier) so every
 * accepted booking accurately tracks the 2-booking -> maintain ₹0 settlement cycle.
 */
export function calculateBookingAdvanceFee(totalFare: number, vendorPayout: number): number {
  const fare = Number(totalFare) || 0;
  const payout = Number(vendorPayout) || 0;
  const diff = Math.round(fare - payout);
  if (diff > 0) return diff;
  if (fare <= 0) return 0;
  return Math.max(50, Math.round(fare * 0.05));
}

function getBadgeStyle(type: string): string {
  switch (type) {
    case "booking_due":
      return "bg-amber-100 text-amber-900 border-amber-300";
    case "settlement":
      return "bg-emerald-100 text-emerald-900 border-emerald-300";
    case "penalty":
      return "bg-rose-100 text-rose-900 border-rose-300";
    default:
      return "bg-blue-100 text-blue-900 border-blue-300";
  }
}

function formatTxnRow(row: any): WalletTransactionRecord {
  const type = (row.type || "credit") as WalletTransactionRecord["type"];
  return {
    id: row.id,
    vendorId: row.vendor_id,
    type,
    title: row.title,
    refBookingId: row.ref_booking_id || "-",
    reason: row.reason || "",
    amount: Math.round(Number(row.amount || 0)),
    date: row.created_at
      ? new Date(row.created_at).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Just now",
    balanceAfter: Math.round(Number(row.balance_after || 0)),
    badge: row.badge || type.toUpperCase(),
    badgeColor: getBadgeStyle(type),
    driverInvolved: row.driver_involved || undefined,
  };
}

async function ensureVendorWalletRow(vendorId: string): Promise<{
  balance: number;
  unsettledBookingsCount: number;
  totalSettled: number;
}> {
  await ensureWalletTables();
  const normalizedId = vendorId.trim() || "VENDOR";

  await prisma.$queryRawUnsafe(
    `INSERT INTO vendor_wallets (vendor_id, balance, unsettled_bookings_count, total_settled)
     VALUES ($1, 0, 0, 0)
     ON CONFLICT (vendor_id) DO NOTHING;`,
    normalizedId
  );

  const rows: any = await prisma.$queryRawUnsafe(
    `SELECT balance, unsettled_bookings_count, total_settled FROM vendor_wallets WHERE vendor_id = $1 LIMIT 1;`,
    normalizedId
  );

  const row = rows[0] || { balance: 0, unsettled_bookings_count: 0, total_settled: 0 };
  return {
    balance: Math.round(Number(row.balance || 0)),
    unsettledBookingsCount: Number(row.unsettled_bookings_count || 0),
    totalSettled: Math.round(Number(row.total_settled || 0)),
  };
}

export async function getVendorWalletState(vendorId: string): Promise<VendorWalletState> {
  const normalizedId = vendorId.trim() || "VENDOR";
  const wallet = await ensureVendorWalletRow(normalizedId);

  const txnRows: any = await prisma.$queryRawUnsafe(
    `SELECT * FROM vendor_booking_wallet_ledger WHERE vendor_id = $1 ORDER BY created_at DESC LIMIT 50;`,
    normalizedId
  );

  const amountDueToZero = wallet.balance < 0 ? Math.abs(wallet.balance) : 0;
  const mustPayToZero =
    wallet.unsettledBookingsCount >= MAX_UNSETTLED_BOOKINGS && wallet.balance < 0;

  return {
    vendorId: normalizedId,
    balance: wallet.balance,
    unsettledBookingsCount: wallet.unsettledBookingsCount,
    maxUnsettledBookings: MAX_UNSETTLED_BOOKINGS,
    remainingFreeBookings: Math.max(0, MAX_UNSETTLED_BOOKINGS - wallet.unsettledBookingsCount),
    amountDueToZero,
    mustPayToZero,
    totalSettled: wallet.totalSettled,
    transactions: (txnRows || []).map(formatTxnRow),
  };
}

/**
 * Verifies the vendor has not hit the 2-booking unsettled lock, then records
 * the booking advance debit. Balances stay <= 0 until paid back to ₹0.
 */
export async function recordBookingDebitOnAccept(params: {
  vendorId: string;
  bookingId: string;
  totalFare: number;
  vendorPayout: number;
  routeSummary: string;
  driverLabel?: string;
}): Promise<VendorWalletState> {
  const normalizedId = params.vendorId.trim() || "VENDOR";
  const wallet = await ensureVendorWalletRow(normalizedId);

  if (wallet.unsettledBookingsCount >= MAX_UNSETTLED_BOOKINGS && wallet.balance < 0) {
    throw new WalletClearanceRequiredError(wallet.balance, wallet.unsettledBookingsCount);
  }

  const fee = calculateBookingAdvanceFee(params.totalFare, params.vendorPayout);
  const newBalance = wallet.balance - fee;
  const newUnsettledCount =
    newBalance < 0 ? wallet.unsettledBookingsCount + 1 : 0;

  await prisma.$queryRawUnsafe(
    `UPDATE vendor_wallets
     SET balance = $2,
         unsettled_bookings_count = $3,
         updated_at = NOW()
     WHERE vendor_id = $1;`,
    normalizedId,
    newBalance,
    newUnsettledCount
  );

  if (fee > 0) {
    const txnId = `TXN-BK-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    await prisma.$queryRawUnsafe(
      `INSERT INTO vendor_booking_wallet_ledger (
        id, vendor_id, type, title, ref_booking_id, reason, amount, balance_after, badge, driver_involved
      ) VALUES ($1, $2, 'booking_due', $3, $4, $5, $6, $7, $8, $9);`,
      txnId,
      normalizedId,
      `Booking Advance Link Due (#${params.bookingId})`,
      params.bookingId,
      `Advance due for ${params.routeSummary} (${newUnsettledCount}/${MAX_UNSETTLED_BOOKINGS} bookings before ₹0 settlement)`,
      -fee,
      newBalance,
      `BOOKING ${newUnsettledCount}/${MAX_UNSETTLED_BOOKINGS}`,
      params.driverLabel || null
    );
  }

  return getVendorWalletState(normalizedId);
}

/**
 * Credits a driver/vendor payment toward maintaining the ₹0 wallet baseline.
 * Resets unsettled_bookings_count to 0 once balance reaches >= 0.
 */
export async function settleVendorWalletPayment(params: {
  vendorId: string;
  amount: number;
  paymentRef?: string;
  method?: string;
}): Promise<VendorWalletState> {
  const normalizedId = params.vendorId.trim() || "VENDOR";
  const wallet = await ensureVendorWalletRow(normalizedId);
  const payAmount = Math.round(Number(params.amount || 0));

  if (!payAmount || payAmount <= 0) {
    throw new Error("Payment amount must be greater than ₹0");
  }

  const newBalance = wallet.balance + payAmount;
  const clearedToZero = newBalance >= 0;
  const newUnsettledCount = clearedToZero ? 0 : wallet.unsettledBookingsCount;
  const newTotalSettled = wallet.totalSettled + payAmount;

  await prisma.$queryRawUnsafe(
    `UPDATE vendor_wallets
     SET balance = $2,
         unsettled_bookings_count = $3,
         total_settled = $4,
         updated_at = NOW()
     WHERE vendor_id = $1;`,
    normalizedId,
    newBalance,
    newUnsettledCount,
    newTotalSettled
  );

  const ref = params.paymentRef || `SET-ZERO-${Date.now().toString().slice(-6)}`;
  const txnId = `TXN-SET-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
  const methodLabel = params.method || "UPI / Payment Link";

  await prisma.$queryRawUnsafe(
    `INSERT INTO vendor_booking_wallet_ledger (
      id, vendor_id, type, title, ref_booking_id, reason, amount, balance_after, badge, payment_method
    ) VALUES ($1, $2, 'settlement', $3, $4, $5, $6, $7, $8, $9);`,
    txnId,
    normalizedId,
    clearedToZero ? "Wallet Settled to ₹0 Baseline" : "Partial Wallet Due Payment",
    ref,
    clearedToZero
      ? `Driver/vendor paid ₹${payAmount} via ${methodLabel} to maintain ₹0 wallet for upcoming bookings.`
      : `Partial payment of ₹${payAmount} via ${methodLabel} applied toward due balance.`,
    payAmount,
    newBalance,
    clearedToZero ? "MAINTAINED ₹0" : "PARTIAL PAYMENT",
    methodLabel
  );

  return getVendorWalletState(normalizedId);
}
