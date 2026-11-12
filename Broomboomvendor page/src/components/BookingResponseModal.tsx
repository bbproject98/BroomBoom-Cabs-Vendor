"use client";

import React, { useState, useEffect } from "react";
import { Loader2, AlertTriangle, Wallet, CheckCircle2, X, Calendar, Clock, MapPin } from "lucide-react";
import type { IncomingOrderCardData } from "./IncomingOrderCard";

export interface WalletGateSummary {
  balance: number;
  unsettledBookingsCount: number;
  maxUnsettledBookings: number;
  amountDueToZero: number;
  mustPayToZero: boolean;
}

interface BookingResponseModalProps {
  order: IncomingOrderCardData | null;
  initialMode: "confirm" | "price";
  wallet: WalletGateSummary;
  onClose: () => void;
  onConfirmAccept: (bookingId: string, proposedPrice?: number) => Promise<void>;
  onDecline: (bookingId: string) => Promise<void>;
  onOpenPayToZero: (dueAmount: number) => void;
}

function computeAdvanceAmount(order: IncomingOrderCardData): number {
  const fare = Number(order.totalFare || 0);
  const payout = Number(order.vendorPayout || 0);
  const diff = Math.round(fare - payout);
  if (diff > 0) return diff;
  if (fare <= 0) return 0;
  return Math.max(50, Math.round(fare * 0.05));
}

function formatDateTimeLabels(order: IncomingOrderCardData) {
  const baseDate = order.createdAt ? new Date(order.createdAt) : new Date();
  const validDate = !Number.isNaN(baseDate.getTime()) ? baseDate : new Date();
  const reporting = new Date(validDate.getTime() + 60 * 60 * 1000);

  const fmtTimeOnly = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  const fmtShortDate = (d: Date) =>
    d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });

  const pickupDateStr = validDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const pickupTimeStr = fmtTimeOnly(validDate);
  const pickupLocationStr = `${order.pickup}${
    order.pickupPincode ? ` (PIN ${order.pickupPincode})` : ""
  }`;

  return {
    pickupDateStr,
    pickupTimeStr,
    pickupLocationStr,
    assignmentTimeStr: fmtTimeOnly(validDate),
    assignmentDateStr: fmtShortDate(validDate),
    reportingTimeStr: fmtTimeOnly(reporting),
    reportingDateStr: fmtShortDate(reporting),
  };
}

export default function BookingResponseModal({
  order,
  initialMode,
  wallet,
  onClose,
  onConfirmAccept,
  onDecline,
  onOpenPayToZero,
}: BookingResponseModalProps) {
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [agreePayment, setAgreePayment] = useState(true);
  const [agreeCngCarrier, setAgreeCngCarrier] = useState(true);
  const [showCustomPrice, setShowCustomPrice] = useState(initialMode === "price");
  const [customPrice, setCustomPrice] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  useEffect(() => {
    if (order) {
      setShowCustomPrice(initialMode === "price");
      setCustomPrice(String(Math.round(order.vendorPayout || order.totalFare || 0)));
      setAgreeTerms(true);
      setAgreePayment(true);
      setAgreeCngCarrier(true);
    }
  }, [order, initialMode]);

  if (!order) return null;

  const displayId = order.bookingId || order.id;
  const advanceAmount = computeAdvanceAmount(order);
  const times = formatDateTimeLabels(order);
  const fromCity = (order.pickupZone || order.pickup.split(",")[0] || order.pickup).trim();
  const toCity = (order.dropZone || order.drop.split(",")[0] || order.drop).trim();
  const tripSummary = `${fromCity} -> ${toCity}, ${order.bookingTypeLabel || "Outstation"} for ${order.vehicleCategory || "Sedan / Dzire or similar"}`;
  const allChecked = agreeTerms && agreePayment && agreeCngCarrier;
  const listedPrice = Math.round(Number(order.vendorPayout || order.totalFare || 0));
  const parsedQuote = Number(customPrice);
  const effectivePrice =
    showCustomPrice && parsedQuote > 0 ? Math.round(parsedQuote) : listedPrice;

  const handleConfirmClick = async () => {
    if (wallet.mustPayToZero) {
      onOpenPayToZero(wallet.amountDueToZero);
      return;
    }
    if (!allChecked) return;
    setIsSubmitting(true);
    try {
      await onConfirmAccept(
        order.id,
        showCustomPrice && parsedQuote > 0 ? Math.round(parsedQuote) : undefined
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeclineClick = async () => {
    setIsDeclining(true);
    try {
      await onDecline(order.id);
    } finally {
      setIsDeclining(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-slate-400 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Solid Blue Title Header matching Screenshot 2 */}
        <div className="bg-[#105796] text-white px-4 py-3 flex items-center justify-between">
          <span className="w-6" aria-hidden="true" />
          <h3 className="text-sm sm:text-base font-bold tracking-tight text-center">
            Booking Response Details #{displayId}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking details"
            className="text-white/85 hover:text-white p-1 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 sm:p-4 space-y-3 text-xs sm:text-[13px] max-h-[84vh] overflow-y-auto">
          {/* Wallet ₹0 / 2-Booking Settlement Lock Banner */}
          {wallet.mustPayToZero ? (
            <div className="bg-rose-50 border-2 border-rose-400 rounded-lg p-3 space-y-2 text-rose-950">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-black text-rose-900">
                    2/2 Bookings Reached — Maintain ₹0 Wallet Before Next Booking
                  </p>
                  <p className="text-[11px] text-rose-800 leading-relaxed">
                    Your current wallet balance is{" "}
                    <strong className="font-black">-₹{wallet.amountDueToZero}</strong> after 2
                    accepted bookings. Pay{" "}
                    <strong className="font-black">₹{wallet.amountDueToZero}</strong> to restore ₹0
                    and unlock booking <strong>#{displayId}</strong>.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenPayToZero(wallet.amountDueToZero)}
                className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Pay ₹{wallet.amountDueToZero} Now to Maintain ₹0</span>
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-[#105796]" />
                Wallet:{" "}
                <strong
                  className={
                    wallet.balance < 0 ? "text-amber-700 font-black" : "text-emerald-700 font-black"
                  }
                >
                  {wallet.balance < 0
                    ? `-₹${Math.abs(wallet.balance)}`
                    : `₹${wallet.balance}`}
                </strong>
              </span>
              <span className="font-bold text-slate-700">
                Settlement Cycle:{" "}
                <strong className="text-slate-950">
                  {wallet.unsettledBookingsCount}/{wallet.maxUnsettledBookings} bookings
                </strong>{" "}
                before ₹0 clearance
              </span>
            </div>
          )}

          {/* 5-Row Booking Specification Table */}
          <div className="border border-slate-300 divide-y divide-slate-300">
            <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[145px_1fr]">
              <div className="px-3 py-2.5 font-semibold text-slate-800 border-r border-slate-300 bg-slate-50/70">
                Trip
              </div>
              <div className="px-3 py-2.5 font-bold text-slate-950">{tripSummary}</div>
            </div>

            <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[145px_1fr]">
              <div className="px-3 py-2.5 font-semibold text-slate-800 border-r border-slate-300 bg-slate-50/70">
                Pickup Date &amp; Time
              </div>
              <div className="px-3 py-2.5 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-[#105796] font-extrabold text-xs">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>{times.pickupDateStr}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold text-xs">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{times.pickupTimeStr}</span>
                  </span>
                </div>
                <div className="flex items-start gap-1.5 font-bold text-slate-900 leading-snug">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span>{times.pickupLocationStr}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[145px_1fr]">
              <div className="px-3 py-2.5 font-semibold text-slate-800 border-r border-slate-300 bg-slate-50/70">
                Drop Location
              </div>
              <div className="px-3 py-2.5 font-bold text-[#105796]">
                {order.drop}
                {order.dropPincode ? ` (PIN ${order.dropPincode})` : ""}
              </div>
            </div>

            <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[145px_1fr]">
              <div className="px-3 py-2.5 font-semibold text-slate-800 border-r border-slate-300 bg-slate-50/70">
                Driver Assignment Time
              </div>
              <div className="px-3 py-2.5 font-bold text-slate-950 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-slate-900">
                  <Clock className="w-3.5 h-3.5 text-[#105796] shrink-0" />
                  <span>{times.assignmentTimeStr}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-slate-600 text-xs font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{times.assignmentDateStr}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[145px_1fr]">
              <div className="px-3 py-2.5 font-semibold text-slate-800 border-r border-slate-300 bg-slate-50/70">
                Reporting Time
              </div>
              <div className="px-3 py-2.5 font-bold text-slate-950 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-slate-900">
                  <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>{times.reportingTimeStr}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-slate-600 text-xs font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{times.reportingDateStr}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Checkbox 1: BroomBoom Cabs T&C */}
          <label className="flex items-start gap-2.5 border border-slate-300 p-2.5 bg-slate-50/50 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#105796] shrink-0 cursor-pointer"
            />
            <span className="text-slate-900 leading-snug">
              I&apos;m interested in this trip and will comply with all the terms and conditions of{" "}
              <strong className="font-bold">BroomBoom Cabs</strong>.
            </span>
          </label>

          {/* Amber Section: Advance Payment Link */}
          <div className="border border-slate-400 overflow-hidden">
            <div className="bg-[#ddb36a] text-slate-950 font-black text-center py-2 text-sm border-b border-slate-400">
              Advance Payment Link
            </div>
            <div className="grid grid-cols-[1fr_92px] border-b border-slate-300 bg-white">
              <div className="p-3 font-bold text-slate-950 flex items-center">
                Advance Amount Needs To Be Paid Via Payment Link
              </div>
              <div className="p-3 font-black text-sm text-slate-950 border-l border-slate-300 flex items-center justify-center">
                ₹{advanceAmount}
              </div>
            </div>
            <label className="flex items-start gap-2.5 p-2.5 bg-white cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreePayment}
                onChange={(e) => setAgreePayment(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#105796] shrink-0 cursor-pointer"
              />
              <span className="text-slate-900 leading-snug">
                I will make the payment as soon as the booking is assigned to me.{" "}
                <strong className="font-black">
                  If I don&apos;t pay on time, I understand that I may be penalized up to{" "}
                  <span className="text-rose-600">₹500</span>.
                </strong>
              </span>
            </label>
          </div>

          {/* Pink/Rose Section: CNG / Vehicle Requirement */}
          <div className="border border-slate-400 overflow-hidden">
            <div className="bg-[#f2cfd7] text-slate-950 font-black text-center py-2 text-sm border-b border-slate-400">
              CNG / Vehicle Requirement
            </div>
            <div className="p-2.5 text-slate-800 leading-snug border-b border-slate-300 bg-white">
              CNG / CNG + Petrol vehicles must have a luggage carrier installed to be assigned to
              bookings. Without a luggage carrier, the vehicle cannot be assigned to a booking.
            </div>
            <label className="flex items-start gap-2.5 p-2.5 bg-white cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeCngCarrier}
                onChange={(e) => setAgreeCngCarrier(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#105796] shrink-0 cursor-pointer"
              />
              <span className="text-slate-900 leading-snug">
                I acknowledge that my CNG/CNG+Petrol vehicle has a luggage carrier installed and is
                eligible for assignment.
              </span>
            </label>
          </div>

          {/* Give Your Price Optional Bid Box */}
          <div className="border border-blue-200 bg-blue-50/70 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-blue-950">
                Quote / Trip Fare Confirmation ({showCustomPrice ? "Your Custom Price" : "Listed Cost"})
              </span>
              <button
                type="button"
                onClick={() => setShowCustomPrice((prev) => !prev)}
                className="text-[11px] font-black text-[#0b5ed7] hover:underline cursor-pointer"
              >
                {showCustomPrice ? `Use Listed ₹${listedPrice}` : "Change / Give Your Price"}
              </button>
            </div>

            {showCustomPrice && (
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-700 text-sm">₹</span>
                <input
                  type="number"
                  min={100}
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="Enter your quote amount"
                  className="w-full px-3 py-1.5 text-sm font-black text-slate-950 bg-white border border-blue-300 rounded focus:outline-hidden focus:border-[#0b5ed7]"
                />
              </div>
            )}
          </div>

          {!allChecked && !wallet.mustPayToZero && (
            <p className="text-[11px] text-rose-700 font-bold text-center">
              Please tick all 3 acknowledgement checkboxes above to confirm this booking.
            </p>
          )}

          {/* Action Footer */}
          <div className="pt-1 flex flex-col sm:flex-row items-center gap-2">
            <button
              type="button"
              onClick={handleDeclineClick}
              disabled={isDeclining || isSubmitting}
              className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 font-bold text-xs rounded transition-colors cursor-pointer disabled:opacity-50"
            >
              {isDeclining ? "Cascading..." : "Decline / Pass"}
            </button>

            <button
              type="button"
              onClick={handleConfirmClick}
              disabled={isSubmitting || (!wallet.mustPayToZero && !allChecked)}
              className={`w-full sm:flex-1 py-2.5 px-4 rounded font-black text-xs uppercase tracking-wide text-white shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                wallet.mustPayToZero
                  ? "bg-rose-600 hover:bg-rose-700"
                  : showCustomPrice
                  ? "bg-[#0b5ed7] hover:bg-[#094db3]"
                  : "bg-[#1e7e34] hover:bg-[#19692c]"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Assigning Booking...</span>
                </>
              ) : wallet.mustPayToZero ? (
                <>
                  <Wallet className="w-4 h-4" />
                  <span>Pay ₹{wallet.amountDueToZero} to Maintain ₹0</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {showCustomPrice
                      ? `CONFIRM WITH QUOTE @₹${effectivePrice}`
                      : `CONFIRM BOOKING @₹${effectivePrice}`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
