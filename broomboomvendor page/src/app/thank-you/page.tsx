"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, MessageCircle, Home, Mail, LogIn, KeyRound } from "lucide-react";

export default function ThankYouPage() {
  const router = useRouter();
  const [canShow, setCanShow] = useState(true);
  const [applicationId, setApplicationId] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const orderId = params.get("order_id");
      const appIdParam = params.get("applicationId") || "";
      const pkg = (params.get("pkg") || "gold").toLowerCase();
      const statusParam = params.get("status");

      if (appIdParam) {
        setApplicationId(appIdParam);
      }

      // If already validated as success by callback, update in background
      if (orderId && statusParam === "success") {
        fetch(
          `/api/payment/verify?order_id=${encodeURIComponent(orderId)}${
            appIdParam ? `&applicationId=${encodeURIComponent(appIdParam)}` : ""
          }`
        ).catch(() => {});
        return;
      }

      // If order_id is present without verified success, check with server
      if (orderId) {
        fetch(
          `/api/payment/verify?order_id=${encodeURIComponent(orderId)}${
            appIdParam ? `&applicationId=${encodeURIComponent(appIdParam)}` : ""
          }`
        )
          .then((res) => res.json())
          .then((data) => {
            if (!data.success || !data.isPaid) {
              // PAYMENT NOT SUCCESSFUL: DO NOT SHOW THANK YOU PAGE, REDIRECT TO PREVIOUS PAGE
              setCanShow(false);
              const failureStatus = (data.orderStatus || "failed").toLowerCase();
              router.replace(
                `/apply?package=${pkg}&applicationId=${encodeURIComponent(
                  data.applicationId || appIdParam || ""
                )}&payment_status=${failureStatus}&order_id=${encodeURIComponent(orderId)}`
              );
            } else if (data.applicationId) {
              setApplicationId(data.applicationId);
            }
          })
          .catch(() => {
            setCanShow(false);
            router.replace(`/apply?package=${pkg}`);
          });
      }
    }
  }, [router]);

  if (!canShow) {
    return null;
  }
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-amber-50 via-white to-emerald-50 flex items-center justify-center px-4 py-12">
      {/* Floating background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-amber-200/40 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-100/30 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md bg-white/85 backdrop-blur-md rounded-3xl border-2 border-emerald-300/60 shadow-xl p-8 sm:p-10 text-center space-y-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-emerald-400/80">
        {/* Success Icon with pulse ring */}
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 rounded-3xl bg-emerald-400/30 animate-ping" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-500/40 ring-8 ring-emerald-100 transition-transform duration-500 hover:rotate-6 hover:scale-105">
            <CheckCircle2 className="w-14 h-14 stroke-[2.5]" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight bg-gradient-to-r from-amber-600 to-emerald-600 bg-clip-text text-transparent">
            Thank You!
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Your vendor application and payment have been confirmed successfully.
          </p>
        </div>

        {/* Email & WhatsApp credentials notice */}
        <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 text-center space-y-2 shadow-sm">
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-emerald-900">
            <KeyRound className="w-4 h-4 text-emerald-600" />
            <span>Login Credentials Dispatched</span>
          </div>
          <p className="text-xs text-emerald-700 leading-relaxed">
            Your User ID &amp; Password have been sent to your registered Email &amp; WhatsApp. Log in below to view your plan details and track your application review.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-1">
          {/* PRIMARY: Vendor Partner Login Button */}
          <Link
            href={applicationId ? `/vendor/login?appId=${encodeURIComponent(applicationId)}` : "/vendor/login"}
            className="group relative flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-base px-6 py-4 rounded-2xl shadow-lg shadow-amber-500/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-amber-500/40 overflow-hidden cursor-pointer"
          >
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700" />
            <LogIn className="w-5 h-5 text-slate-950 group-hover:scale-110 transition-transform" />
            <span className="relative z-10">Vendor Partner Login</span>
          </Link>

          <a
            href="https://wa.me/982407654992706600?text=Hi%20BroomBoom%20HQ%2C%20I%20have%20completed%20my%20vendor%20application."
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md hover:shadow-green-500/20 overflow-hidden"
          >
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700" />
            <MessageCircle className="w-4 h-4 fill-current relative z-10 group-hover:scale-110 transition-transform" />
            <span className="relative z-10">Connect on WhatsApp</span>
          </a>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 py-1.5 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}