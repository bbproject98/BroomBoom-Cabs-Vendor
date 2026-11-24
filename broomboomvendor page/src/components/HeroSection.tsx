"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";

interface HeroSectionProps {
  selectedPackage?: string;
  selectedTier?: string;
  cityName?: string;
  onApplySuccess?: (data?: any) => void;
  onOpenApplyModal?: (packageId?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  selectedPackage = "gold",
  selectedTier = "gold",
  cityName,
  onOpenApplyModal,
}) => {
  const targetId = selectedPackage || selectedTier || "gold";

  const description = cityName
    ? `Become a Proud BroomBoom Cabs Vendor Owner in ${cityName} Today`
    : "Join BroomBoom as an individual cab vendor, fleet partner, travel agency or fleet operator. Register your commercial vehicles and explore local, outstation, airport and corporate booking opportunities across India.";

  const heading =cityName
  ? `Cab Vendor Registration in ${cityName} – Attach Your Car & Fleet with BroomBoom`
  : "Cab Vendor Registration in India – Attach Your Car & Fleet with BroomBoom";

  return (
    <section className="relative w-full">
      <div
        onClick={() => onOpenApplyModal?.(targetId)}
        className="block relative cursor-pointer group"
        title={
          cityName
            ? `Click to Apply for BroomBoom Vendor Partner in ${cityName}`
            : "Click to Apply for BroomBoom Vendor Partner"
        }
      >
        {/* ================= LAPTOP / DESKTOP ================= */}
        <div className="hidden md:block relative w-full">
          {cityName && (
            <div className="bg-slate-950 text-white border-b border-amber-400/40 py-2 px-4 text-center z-20 relative">
              <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs lg:text-sm font-bold tracking-wide">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  BroomBoom Vendor Partner Services in{" "}
                  <span className="text-amber-400 font-black uppercase">
                    {cityName}
                  </span>
                </span>
                <span className="hidden lg:inline text-slate-400">&bull;</span>
                <span className="hidden lg:inline text-xs text-slate-300 font-medium">
                  Dedicated {cityName} Territory Allocation &amp; Daily Fleet
                  Earnings
                </span>
              </div>
            </div>
          )}

          {/* Responsive Large Banner Height */}
          <div className="relative w-full h-[60vh] min-h-[480px] max-h-[700px] overflow-hidden bg-gradient-to-r from-[#ffd80d] via-[#fdf0c3] to-[#fecd04]">
            <Image
              src="/hero-banner.jpg"
              alt={
                cityName
                  ? `broomboom-cabs-vendor-partner-${cityName.toLowerCase().replace(/\s+/g, '-')}`
                  : "broomboom-cabs-vendor-partner"
              }
              fill
              sizes="100vw"
              quality={90}
              // Changed object position to focus higher up (showing the face)
              className="object-cover object-[75%_25%] transition-transform duration-700 group-hover:scale-105"
              priority
            />

            {/* Stronger gradient scrim on the left for better text contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#fdf0c3] via-[#fdf0c3]/80 to-transparent pointer-events-none w-full md:w-[60%]" />

            {/* HTML overlay — header & text on the LEFT */}
            <div className="absolute inset-0 flex flex-col justify-center items-start text-left px-8 sm:px-12 lg:px-16 xl:px-24 z-10 w-full max-w-[60%] lg:max-w-[55%]">
              {cityName && (
                <div className="inline-flex items-center gap-1.5 bg-slate-950 text-amber-400 border border-amber-400/60 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4 shadow-md">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{cityName} Vendor Partner</span>
                </div>
              )}

              <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] xl:text-5xl font-serif font-black text-slate-950 tracking-tight leading-[1.15] drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
                {heading}
              </h1>

              <p className="mt-4 sm:mt-5 text-sm lg:text-base font-medium text-slate-900 leading-relaxed drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] max-w-lg">
                {description}
              </p>

              <div className="mt-6 sm:mt-8 flex items-center gap-4">
                <span className="inline-flex items-center gap-2 bg-slate-950 group-hover:bg-slate-800 text-amber-400 font-black text-sm lg:text-base px-7 py-3.5 rounded-full shadow-xl border border-amber-400/40 transition-all active:scale-95">
                  <span>ATTACH YOUR FLEET</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5] transition-transform group-hover:translate-x-1" />
                </span>
                <span className="text-xs lg:text-sm font-black text-slate-900 uppercase tracking-wider hidden sm:inline-flex items-center gap-1.5 bg-white/40 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  <span className="text-amber-500 text-base leading-none">★</span> Instant Onboarding
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= MOBILE ================= */}
        <div className="md:hidden relative w-full h-[280px] xs:h-[320px] sm:h-[360px] overflow-hidden bg-gradient-to-r from-[#ffd80d] via-[#fdf0c3] to-[#fecd04]">
          <Image
            src="/hero-banner.jpg"
            alt={
              cityName
                ? `broomboom-cabs-vendor-partner-${cityName.toLowerCase().replace(/\s+/g, '-')}`
                : "broomboom-cabs-vendor-partner"
            }
            fill
            sizes="100vw"
            quality={90}
            // Adjusted mobile position to keep the face in frame
            className="object-cover object-[80%_20%]"
            priority
          />

          {/* Scrim for high mobile readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-300/90 via-amber-200/60 to-transparent pointer-events-none w-[85%]" />

          {/* HTML overlay — text left-aligned */}
          <div className="absolute inset-0 flex flex-col justify-center items-start text-left p-4 sm:p-6 z-10 max-w-[65%]">
            {cityName && (
              <div className="inline-flex items-center gap-1 bg-slate-950 text-amber-400 border border-amber-400/60 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-1.5 shadow-sm">
                <MapPin className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                <span>{cityName} Services</span>
              </div>
            )}

            <h1 className="text-[15px] sm:text-[18px] font-serif font-black text-slate-950 tracking-tight leading-[1.15] drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
              {heading}
            </h1>

            <p className="mt-1.5 text-[10px] sm:text-xs font-medium text-slate-900 leading-tight drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)] line-clamp-2">
              {description}
            </p>

            <div className="mt-2.5">
              <span className="inline-flex items-center gap-1 bg-slate-950 text-amber-400 font-black text-[10px] sm:text-[11px] px-3.5 py-1.5 rounded-full shadow-md border border-amber-400/40 active:scale-95 transition-all">
                <span>JOIN NOW</span>
                <ArrowRight className="w-3 h-3 stroke-[2.5]" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};