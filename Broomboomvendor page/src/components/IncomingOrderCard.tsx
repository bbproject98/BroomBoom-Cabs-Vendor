"use client";

import React from "react";
import { MapPin, Lock, Calendar, Clock } from "lucide-react";

export interface IncomingOrderCardData {
  id: string;
  bookingId?: string;
  pickup: string;
  pickupZone?: string;
  pickupPincode?: string;
  drop: string;
  dropZone?: string;
  dropPincode?: string;
  distance?: string;
  duration?: string;
  vehicleCategory?: string;
  planTier?: string;
  bookingType?: string;
  bookingTypeLabel?: string;
  totalFare: number;
  vendorPayout: number;
  commissionRate?: number;
  passengerName?: string;
  passengerRating?: number;
  dispatchTime?: string;
  paymentMethod?: string;
  source?: string;
  createdAt?: string;
}

interface IncomingOrderCardProps {
  order: IncomingOrderCardData;
  vendorPincode?: string;
  walletLocked?: boolean;
  onOpenDetails: (order: IncomingOrderCardData, mode: "confirm" | "price") => void;
}

function getTripDescription(order: IncomingOrderCardData): string {
  const fromCity = (order.pickupZone || order.pickup.split(",")[0] || order.pickup).trim();
  const toCity = (order.dropZone || order.drop.split(",")[0] || order.drop).trim();
  const typeText = order.bookingType?.toLowerCase().includes("round")
    ? "Outstation (Round Trip)"
    : order.bookingTypeLabel || "Outstation (One Way Drop)";
  return `${fromCity} -> ${toCity}, ${typeText} for ${order.vehicleCategory || "Sedan / Dzire or similar"}`;
}

function formatPickupSchedule(order: IncomingOrderCardData): {
  dateText: string;
  timeText: string;
} {
  if (order.createdAt) {
    const dt = new Date(order.createdAt);
    if (!Number.isNaN(dt.getTime())) {
      const dateText = dt.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const timeText = dt.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return { dateText, timeText };
    }
  }
  return {
    dateText: order.dispatchTime || "Immediate",
    timeText: "Now",
  };
}

export default function IncomingOrderCard({
  order,
  vendorPincode,
  walletLocked = false,
  onOpenDetails,
}: IncomingOrderCardProps) {
  const displayId = order.bookingId || order.id;
  const listedAmount = Math.round(Number(order.vendorPayout || order.totalFare || 0));
  const isAirportTrip =
    order.pickup.toLowerCase().includes("airport") ||
    order.drop.toLowerCase().includes("airport");
  const scheduleLabel = formatPickupSchedule(order);
  const pickupWithPin = order.pickupPincode
    ? `${order.pickup} (PIN ${order.pickupPincode})`
    : order.pickup;

  return (
    <div
      onClick={() => onOpenDetails(order, "confirm")}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenDetails(order, "confirm");
        }
      }}
      className="bg-white border border-slate-300 rounded-xl shadow-sm hover:shadow-md hover:border-blue-400 transition-all overflow-hidden cursor-pointer text-left"
    >
      {/* Top Booking Header Strip matching reference layout */}
      <div className="bg-slate-100/95 border-b border-slate-300 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-black text-slate-950 text-xs sm:text-sm tracking-wide uppercase">
            BOOKING : {displayId}
          </span>
          {order.pickupPincode && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-950 px-2 py-0.5 rounded border border-amber-300">
              <MapPin className="w-3 h-3 text-amber-700" />
              PIN {order.pickupPincode}
              {vendorPincode && order.pickupPincode === vendorPincode ? " • Match" : ""}
            </span>
          )}
          {order.planTier && (
            <span className="text-[10px] font-extrabold uppercase bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-300">
              {order.planTier}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(order, "confirm");
          }}
          className="text-xs font-semibold text-slate-600 hover:text-blue-700 underline underline-offset-2 cursor-pointer"
        >
          More Details
        </button>
      </div>

      {/* 2-Column Bordered Table matching reference layout */}
      <div className="divide-y divide-slate-300 text-xs sm:text-[13px]">
        {/* Row 1: Trip */}
        <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr]">
          <div className="bg-slate-50/70 px-3.5 py-2.5 border-r border-slate-300 font-semibold text-slate-700 flex items-center">
            Trip
          </div>
          <div className="px-3.5 py-2.5 font-bold text-slate-900 leading-snug">
            {getTripDescription(order)}
          </div>
        </div>

        {/* Row 2: My cost */}
        <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr]">
          <div className="bg-slate-50/70 px-3.5 py-2.5 border-r border-slate-300 font-semibold text-slate-700 flex items-center">
            My cost
          </div>
          <div className="px-3.5 py-2.5 space-y-1 text-slate-800 leading-relaxed">
            {isAirportTrip && (
              <p className="font-bold text-rose-800">
                Mandatory Airport Entry Charges Included
              </p>
            )}
            <p>
              Base Fare <strong className="text-slate-950 font-black">₹{listedAmount}</strong> for{" "}
              <strong className="text-slate-950 font-bold">{order.duration || "Trip"}</strong> and{" "}
              <strong className="text-slate-950 font-bold">{order.distance || "Standard Km"}</strong>{" "}
              limit
            </p>
            <p className="text-[11px] sm:text-xs">
              <span className="font-bold text-emerald-700">
                {order.planTier?.toLowerCase() === "platinum" ? "Included:" : "Not Included:"}
              </span>{" "}
              Toll / State tax, Night Allowance, Parking{" "}
              <span className="text-slate-500 font-medium">
                ({order.paymentMethod || "UPI / Cash"})
              </span>
            </p>
          </div>
        </div>

        {/* Row 3: Pickup / Drop */}
        <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr]">
          <div className="bg-slate-50/70 px-3.5 py-2.5 border-r border-slate-300 font-semibold text-slate-700 flex items-center">
            Pickup/Drop
          </div>
          <div className="px-3.5 py-2.5 leading-snug space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-emerald-800 font-black text-xs sm:text-sm">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>{scheduleLabel.dateText}</span>
              </span>
              <span className="text-slate-400">@</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>{scheduleLabel.timeText}</span>
              </span>
            </div>
            <div>
              <span className="text-slate-600 font-medium">at</span>{" "}
              <span className="font-bold text-slate-900">{pickupWithPin}</span>{" "}
              <span className="text-slate-600 font-medium">drop to</span>{" "}
              <span className="font-bold text-slate-900">[{order.drop}]</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar matching CONFIRM @amount & GIVE YOUR PRICE */}
      <div className="px-4 py-3 bg-white border-t border-slate-300 flex flex-wrap items-center justify-center sm:justify-between gap-2.5">
        <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">
          Passenger: <strong className="text-slate-800">{order.passengerName || "Verified Customer"}</strong> ★{" "}
          {order.passengerRating ?? 4.9} • Tap card to review Booking Response Details
        </span>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(order, "confirm");
            }}
            className={`px-4 py-2 rounded font-black text-xs uppercase tracking-wide text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
              walletLocked
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-[#1e7e34] hover:bg-[#19692c]"
            }`}
          >
            {walletLocked && <Lock className="w-3.5 h-3.5" />}
            <span>CONFIRM @₹{listedAmount}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(order, "price");
            }}
            className="bg-[#0b5ed7] hover:bg-[#094db3] text-white font-black text-xs uppercase tracking-wide px-4 py-2 rounded shadow-xs transition-colors cursor-pointer"
          >
            GIVE YOUR PRICE
          </button>
        </div>
      </div>
    </div>
  );
}
