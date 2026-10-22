"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  MapPin,
  Calendar,
  Car,
  User,
  Phone,
  Printer,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Home,
  CreditCard,
} from "lucide-react";

interface BookingData {
  bookingId?: string;
  customerName?: string;
  customerMobile?: string;
  customerEmail?: string;
  serviceType?: string;
  pickupAddress?: string;
  dropAddress?: string;
  pickupDate?: string;
  pickupTime?: string;
  vehicleCategory?: string;
  status?: string;
  fare?: number;
  advance?: number;
  dueFare?: number;
  paidAmount?: number;
  paymentStatus?: string;
  paymentMethod?: string;
  orderId?: string;
}

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>("UNKNOWN");
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const orderId = searchParams?.get("order_id") || "";
  let bookingId = searchParams?.get("booking_id") || "";

  // If booking_id isn't in query but order_id is in format BB_<bookingId>_<timestamp>
  if (!bookingId && orderId && orderId.startsWith("BB_")) {
    const parts = orderId.split("_");
    if (parts.length >= 2) {
      bookingId = parts[1];
    }
  }

  const applicationId = searchParams?.get("applicationId");

  useEffect(() => {
    // If this was actually a vendor signup payment, redirect to vendor thank-you
    if (applicationId && !bookingId) {
      router.replace(
        `/thank-you?${searchParams ? searchParams.toString() : ""}`
      );
      return;
    }

    if (!bookingId && !orderId) {
      setLoading(false);
      setError("No booking or order reference found in this payment callback.");
      return;
    }

    const fetchPaymentAndBooking = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Query user backend for payment status (Port 5004)
        const targetBookingId = bookingId || orderId;
        const res = await fetch(
          `http://localhost:5004/api/payment/status/${targetBookingId}`
        );

        if (res.ok) {
          const data = await res.json();
          const pStatus = (data.paymentStatus || "PENDING").toUpperCase();
          setPaymentStatus(pStatus);

          if (data.booking) {
            setBooking(data.booking);
          } else {
            setBooking({
              bookingId: data.bookingId || bookingId,
              paymentStatus: pStatus,
              paidAmount: data.paidAmount,
              fare: data.fare,
              advance: data.advance,
              dueFare: data.dueFare,
              paymentMethod: data.paymentMethod,
              orderId: orderId,
            });
          }

          if (pStatus === "SUCCESS") {
            try {
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
                colors: ["#F59E0B", "#10B981", "#EAB308", "#3B82F6"],
              });
            } catch (err) {
              // ignore canvas confetti errors
            }
          }
        } else {
          // Fallback: try fetching from bookings list if status endpoint didn't find it directly
          const bookingsRes = await fetch("http://localhost:5004/api/bookings");
          if (bookingsRes.ok) {
            const allBookings: any[] = await bookingsRes.json();
            const found = allBookings.find(
              (b) =>
                b.bookingId === bookingId ||
                b.cashfreeOrderId === orderId ||
                b.id === bookingId
            );

            if (found) {
              const pStatus = (found.paymentStatus || "PENDING").toUpperCase();
              setPaymentStatus(pStatus);
              setBooking({
                bookingId: found.bookingId,
                customerName: found.customerName,
                customerMobile: found.customerMobile,
                customerEmail: found.customerEmail,
                serviceType: found.serviceType,
                pickupAddress: found.pickupAddress,
                dropAddress: found.dropAddress,
                pickupDate: found.pickupDate,
                pickupTime: found.pickupTime,
                vehicleCategory: found.vehicleCategory,
                status: found.status,
                fare: found.fare,
                advance: found.advance,
                dueFare: found.dueFare,
                paidAmount: found.paidAmount,
                paymentStatus: pStatus,
                paymentMethod: found.paymentMethod,
                orderId: found.cashfreeOrderId || orderId,
              });

              if (pStatus === "SUCCESS") {
                try {
                  confetti({
                    particleCount: 80,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ["#F59E0B", "#10B981", "#EAB308", "#3B82F6"],
                  });
                } catch (_) {}
              }
            } else {
              setPaymentStatus("PENDING");
              setBooking({
                bookingId: bookingId,
                orderId: orderId,
              });
            }
          } else {
            setError("Could not retrieve booking details from backend.");
          }
        }
      } catch (e: any) {
        console.error("Error fetching payment result:", e);
        setError("Network error connecting to booking server: " + e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentAndBooking();
  }, [bookingId, orderId, applicationId, searchParams, router]);

  const handleCopy = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const isSuccess = paymentStatus === "SUCCESS";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-800">
          Verifying Payment Status...
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          Connecting with BroomBoom server and Cashfree
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-slate-800 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Bar */}
      <header className="max-w-2xl mx-auto w-full flex items-center justify-between pb-4 border-b border-amber-200">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-md">
            <Car className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-amber-600">
              BroomBoom
            </span>
            <span className="ml-1 text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md">
              CABS
            </span>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-amber-600 transition"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="max-w-xl mx-auto w-full my-6">
        {isSuccess ? (
          /* ================= SUCCESS THANK YOU CARD ================= */
          <div className="bg-white rounded-3xl shadow-xl border border-amber-200 overflow-hidden">
            {/* Top Badge Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 sm:p-8 text-center text-white relative">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center mb-4 ring-8 ring-white/10 shadow-lg">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Booking Confirmed!
              </h1>
              <p className="text-emerald-100 text-sm mt-1">
                Thank you for choosing BroomBoom Cabs. Your ride is booked!
              </p>

              {/* Booking ID badge */}
              <div className="mt-5 inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
                <span className="text-xs uppercase tracking-wider text-emerald-100 font-medium">
                  Booking ID:
                </span>
                <span className="font-mono font-bold text-white text-base">
                  {booking?.bookingId || bookingId || "CONFIRMED"}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(booking?.bookingId || bookingId || "")
                  }
                  className="p-1 hover:bg-white/20 rounded-md transition"
                  title="Copy Booking ID"
                >
                  {copiedId ? (
                    <Check className="w-4 h-4 text-emerald-200" />
                  ) : (
                    <Copy className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Trip Route Card */}
              {(booking?.pickupAddress || booking?.dropAddress) && (
                <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200/80">
                  <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>Trip Details</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0 ring-4 ring-emerald-100" />
                      <div>
                        <div className="text-xs text-slate-400 font-medium">
                          Pickup Location
                        </div>
                        <div className="text-sm font-semibold text-slate-800 capitalize">
                          {booking.pickupAddress}
                        </div>
                      </div>
                    </div>

                    <div className="ml-1 pl-4 border-l-2 border-dashed border-amber-300 py-1">
                      <div className="text-xs text-amber-700 font-medium">
                        {booking.serviceType || "Outstation Trip"} •{" "}
                        {booking.vehicleCategory || "Cab"}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 shrink-0 ring-4 ring-rose-100" />
                      <div>
                        <div className="text-xs text-slate-400 font-medium">
                          Drop Location
                        </div>
                        <div className="text-sm font-semibold text-slate-800 capitalize">
                          {booking.dropAddress}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule & Passenger Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pickup Schedule</span>
                  </div>
                  <div className="font-semibold text-sm text-slate-800">
                    {booking?.pickupDate || "Scheduled Date"}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {booking?.pickupTime || "Scheduled Time"}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
                    <User className="w-3.5 h-3.5 text-amber-600" />
                    <span>Passenger</span>
                  </div>
                  <div className="font-semibold text-sm text-slate-800 capitalize">
                    {booking?.customerName || "Customer"}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    {booking?.customerMobile || ""}
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                <div className="flex items-center justify-between pb-3 border-b border-amber-200/70">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold uppercase text-amber-900 tracking-wider">
                      Payment Summary
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Advance Paid
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Estimated Total Fare</span>
                    <span className="font-semibold text-slate-900">
                      ₹{Number(booking?.fare || 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-emerald-700 font-semibold">
                    <span>Advance Paid Online</span>
                    <span className="text-base font-bold">
                      ₹
                      {Number(
                        booking?.paidAmount || booking?.advance || 0
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-amber-200/70 flex justify-between items-center">
                    <span className="font-bold text-slate-900">
                      Balance Due to Driver
                    </span>
                    <span className="font-extrabold text-amber-900 text-base">
                      ₹{Number(booking?.dueFare || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-amber-800/80 bg-white/70 p-2 rounded-lg">
                  * Balance amount to be paid directly to the pilot via cash or UPI
                  upon trip completion. Toll & parking charges extra if applicable.
                </div>
              </div>

              {/* Important Info Card */}
              <div className="flex items-start gap-3 p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 text-xs text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Next Steps:</span> Driver &
                  Cab details will be allocated and sent to your registered
                  mobile number via SMS prior to pickup time.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>

                <Link
                  href="/"
                  className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl transition shadow-md hover:shadow-lg active:scale-98"
                >
                  <span>Return to Home</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* ================= PENDING / FAILED CARD ================= */
          <div className="bg-white rounded-3xl shadow-xl border border-amber-200 p-6 sm:p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 mx-auto flex items-center justify-center mb-4 ring-8 ring-amber-50">
              <Clock className="w-9 h-9 text-amber-600" />
            </div>

            <h1 className="text-2xl font-black text-slate-800">
              Payment Pending / Incomplete
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
              Your booking reference is{" "}
              <span className="font-mono font-bold text-amber-700">
                {booking?.bookingId || bookingId || orderId}
              </span>
              . We haven't received a successful confirmation from the payment
              gateway yet.
            </p>

            {booking?.fare && (
              <div className="my-6 p-4 bg-amber-50 rounded-2xl border border-amber-200 max-w-sm mx-auto text-left">
                <div className="flex justify-between text-sm py-1">
                  <span className="text-slate-600">Total Fare:</span>
                  <span className="font-bold">₹{booking.fare}</span>
                </div>
                <div className="flex justify-between text-sm py-1">
                  <span className="text-slate-600">Advance Payable:</span>
                  <span className="font-bold text-amber-700">
                    ₹{booking.advance || booking.paidAmount || 0}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl transition shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Refresh Status</span>
              </button>

              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition"
              >
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 py-4">
        Need assistance? Call BroomBoom 24x7 Support at{" "}
        <span className="font-semibold text-slate-600">+91 85839 92978</span>
      </footer>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}
