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
  UserPlus,
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
      className="py-6 sm:py-8 bg-white border-t border-amber-200/80 text-slate-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white border border-amber-400/30 shadow-2xl p-5 sm:p-8">
          
          {/* Ambient Glows */}
          <div className="pointer-events-none absolute -top-32 -right-32 w-80 h-80 rounded-full bg-amber-500/20 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-yellow-600/10 blur-[100px]" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4">
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
                Register your commercial cars or fleet to connect with customers for outstation, local, and airport transfers across India. Manage your entire business from one smart platform.
              </p>

              {/* Compact Feature Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-3 pt-2">
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] sm:text-xs text-slate-300 font-medium leading-tight"><strong className="text-white">Instant Alerts</strong><br/>Manage requests</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] sm:text-xs text-slate-300 font-medium leading-tight"><strong className="text-white">Attach Fleet</strong><br/>Sedans, SUVs, Tempos</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] sm:text-xs text-slate-300 font-medium leading-tight"><strong className="text-white">Plans</strong><br/>Silver, Gold, Platinum</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] sm:text-xs text-slate-300 font-medium leading-tight"><strong className="text-white">Pincode Dispatch</strong><br/>Location-based routing</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] sm:text-xs text-slate-300 font-medium leading-tight"><strong className="text-white">Dashboard</strong><br/>Track payments</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] sm:text-xs text-slate-300 font-medium leading-tight"><strong className="text-white">Growth</strong><br/>Local & Outstation</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
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

            {/* Right Phone Preview */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-[300px] rounded-[1.5rem] bg-slate-900/90 border border-slate-700/60 p-4 shadow-2xl backdrop-blur-xl space-y-3 relative group">
                
                {/* Hover Glow for Phone */}
                <div className="absolute inset-0 bg-gradient-to-b from-amber-400/0 via-amber-400/0 to-amber-400/5 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-amber-400/50 bg-white p-0.5 shrink-0">
                      <Image
                        src="/broomboom-vendor-logo.png"
                        alt="BroomBoom Vendor"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-white flex items-center gap-1.5">
                        <span>BroomBoom Vendor</span>
                        <span className="bg-amber-400 text-slate-950 text-[8px] font-black px-1 py-0.5 rounded leading-none">
                          PWA
                        </span>
                      </div>
                      <div className="text-[10px] text-emerald-400 font-semibold">
                        Ready for Android & iOS
                      </div>
                    </div>
                  </div>
                  <BellRing className="w-4 h-4 text-amber-400 shrink-0" />
                </div>

                <div className="rounded-xl bg-slate-950 border border-amber-400/20 p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider">
                    <span className="text-amber-400">New Request</span>
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                      {cityName || "Kolkata"} Zone
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-white flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">
                      {cityName ? `${cityName} Airport` : "NSCBI Airport"} &rarr; Business Hub
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>Silver / Platinum Match</span>
                    <span className="inline-flex items-center font-bold text-emerald-400">
                      <IndianRupee className="w-2.5 h-2.5" />
                      Instant Settlement
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-slate-950/50 border border-slate-800/60 py-2 px-1">
                    <div className="text-sm font-black text-amber-400">1-Tap</div>
                    <div className="text-[9px] text-slate-500 font-semibold uppercase">
                      Install
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-950/50 border border-slate-800/60 py-2 px-1">
                    <div className="text-sm font-black text-emerald-400">24/7</div>
                    <div className="text-[9px] text-slate-500 font-semibold uppercase">
                      Alerts
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