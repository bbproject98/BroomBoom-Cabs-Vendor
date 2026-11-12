"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BellRing,
  CheckCircle2,
  Download,
  IndianRupee,
  MapPin,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

interface AppDownloadSectionProps {
  cityName?: string;
}

export const AppDownloadSection: React.FC<AppDownloadSectionProps> = ({
  cityName,
}) => {
  const triggerInstallPrompt = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("trigger-pwa-install"));
    }
  };

  return (
    <section
      id="download-app"
      className="py-8 sm:py-10 bg-white border-t border-amber-200/80 text-slate-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white border border-amber-400/40 shadow-2xl p-6 sm:p-10">
          {/* Subtle Ambient Yellow Glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-amber-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-yellow-500/10 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Copy & Install CTAs */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full">
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span>BroomBoom Vendor Mobile App</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Download the{" "}
                <span className="text-brand-yellow">BroomBoom Vendor App</span>{" "}
                {cityName ? `for ${cityName}` : "Today"}
              </h2>

              <p className="text-xs sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                {cityName
                  ? `Manage your ${cityName} cabs on the move. Receive instant pincode-wise customer booking alerts, accept Silver/Gold/Platinum rides, track drivers, and view automated daily bank payouts directly from your phone.`
                  : "Manage your attached fleet on the move. Receive instant pincode-wise booking alerts, accept Silver, Gold, or Platinum plan rides, assign drivers in 1 tap, and track daily automated payouts."}
              </p>

              {/* Feature Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Instant Booking Popups &amp; Accept/Reject</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Plan-Wise &amp; Pincode Dispatch Routing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Live Daily Bank Settlement &amp; Ledger</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Works on Android, Chrome &amp; iOS Safari</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={triggerInstallPrompt}
                  className="inline-flex items-center gap-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs sm:text-sm px-6 py-3 rounded-xl shadow-[0_6px_24px_rgba(251,191,36,0.35)] active:scale-95 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Install Vendor App Now</span>
                </button>

                <Link
                  href="/vendor/login"
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 hover:border-amber-400/60 font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Open Vendor Portal</span>
                </Link>
              </div>
            </div>

            {/* Right Interactive Phone Preview Card */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-sm rounded-3xl bg-slate-900/95 border border-slate-700/80 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-amber-400 bg-white p-0.5 shrink-0">
                      <Image
                        src="/broomboom-logo.png"
                        alt="BroomBoom Vendor App Icon"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-black text-white flex items-center gap-1.5">
                        <span>BroomBoom Vendor</span>
                        <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded leading-none">
                          PWA
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-400 font-semibold">
                        Ready for Android &amp; iOS
                      </div>
                    </div>
                  </div>
                  <BellRing className="w-5 h-5 text-amber-400 shrink-0" />
                </div>

                {/* Mock Live Order Alert inside App Preview */}
                <div className="rounded-2xl bg-slate-950 border border-amber-400/40 p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                    <span className="text-amber-400">New Dispatch Request</span>
                    <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      {cityName || "Kolkata"} Zone
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      {cityName ? `${cityName} Airport` : "NSCBI Airport"} &rarr; Business Hub
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Silver / Platinum Plan Match</span>
                    <span className="inline-flex items-center font-black text-emerald-400">
                      <IndianRupee className="w-3 h-3" />
                      Instant Settlement
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-center text-xs">
                  <div className="rounded-xl bg-slate-950/70 border border-slate-800 py-2.5 px-2">
                    <div className="text-base font-black text-amber-400">1-Tap</div>
                    <div className="text-[10px] text-slate-400 font-semibold">
                      Home Screen Install
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-950/70 border border-slate-800 py-2.5 px-2">
                    <div className="text-base font-black text-emerald-400">24/7</div>
                    <div className="text-[10px] text-slate-400 font-semibold">
                      Real-Time Alerts
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
