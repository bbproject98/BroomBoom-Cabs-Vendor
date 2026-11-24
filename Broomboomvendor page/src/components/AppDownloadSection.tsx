"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Download,
  Smartphone,
  UserPlus,
} from "lucide-react";

export const AppDownloadSection: React.FC = () => {
  const triggerInstallPrompt = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("trigger-pwa-install"));
    }
  };

  return (
    <section
      id="download-app"
      className="py-6 sm:py-8 bg-white border-t border-amber-200/80 text-slate-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white border border-amber-400/30 shadow-2xl p-5 sm:p-8">
          {/* Ambient Glows */}
          <div className="pointer-events-none absolute -top-32 -right-32 w-80 h-80 rounded-full bg-amber-500/20 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-yellow-600/10 blur-[100px]" />

          <div className="relative z-10 space-y-5">
            {/* Top Content */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700/50 backdrop-blur-md text-amber-300 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                <Smartphone className="w-3 h-3 text-amber-400" />
                <span>Cab Vendor Partner Program</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                Grow Your Cab Business with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500">
                  BroomBoom Vendor
                </span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Register your commercial cars or fleet to connect with customers
                for outstation, local, and airport transfers across India. Manage
                your entire business from one smart platform.
              </p>

              {/* Compact Feature Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-3 pt-2">
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] sm:text-xs text-slate-300 font-medium leading-tight">
                    <strong className="text-white">Instant Alerts</strong>
                    <br />
                    Manage requests
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] sm:text-xs text-slate-300 font-medium leading-tight">
                    <strong className="text-white">Attach Fleet</strong>
                    <br />
                    Sedans, SUVs, Tempos
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] sm:text-xs text-slate-300 font-medium leading-tight">
                    <strong className="text-white">Plans</strong>
                    <br />
                    Silver, Gold, Platinum
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] sm:text-xs text-slate-300 font-medium leading-tight">
                    <strong className="text-white">Pincode Dispatch</strong>
                    <br />
                    Location-based routing
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] sm:text-xs text-slate-300 font-medium leading-tight">
                    <strong className="text-white">Dashboard</strong>
                    <br />
                    Track payments
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] sm:text-xs text-slate-300 font-medium leading-tight">
                    <strong className="text-white">Growth</strong>
                    <br />
                    Local & Outstation
                  </span>
                </div>
              </div>
            </div>

            {/* Documents Required - In Between */}
            <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur-sm p-4 sm:p-5">
              <h2 className="text-lg sm:text-xl font-black tracking-tight leading-tight text-white mb-3 sm:mb-4">
                Documents Required for Taxi Vendor Registration
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <div className="rounded-xl border border-slate-700/60 bg-slate-950/40 p-3">
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    Aadhaar and PAN Card
                  </h3>
                </div>

                <div className="rounded-xl border border-slate-700/60 bg-slate-950/40 p-3">
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    Commercial Vehicle RC
                  </h3>
                </div>

                <div className="rounded-xl border border-slate-700/60 bg-slate-950/40 p-3">
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    Driving License and Driver Documents
                  </h3>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/vendor/register"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-[0_4px_20px_rgba(251,191,36,0.3)] active:scale-95 transition-all"
              >
                <UserPlus className="w-4 h-4 stroke-[2.5]" />
                <span>Register as a Cab Vendor</span>
              </Link>

              <button
                type="button"
                onClick={triggerInstallPrompt}
                className="inline-flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 text-white border border-slate-700 hover:border-amber-400/50 backdrop-blur-sm font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Install Vendor Web App</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};