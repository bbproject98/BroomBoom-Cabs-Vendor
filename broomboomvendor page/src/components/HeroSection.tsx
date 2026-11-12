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

  return (
    <section className="relative w-full">
      <div
        onClick={() => onOpenApplyModal?.(targetId)}
        className="block relative cursor-pointer"
        title={
          cityName
            ? `Click to Apply for BroomBoom Vendor Partner in ${cityName}`
            : "Click to Apply for BroomBoom Vendor Partner"
        }
      >
        {/* Laptop & Desktop View */}
        <div className="hidden md:block relative w-full">
          {cityName && (
            <div className="bg-slate-950 text-white border-b border-amber-400/40 py-2 px-4 text-center">
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
                  Dedicated {cityName} Territory Allocation &amp; Daily Fleet Earnings
                </span>
              </div>
            </div>
          )}

          <Image
            src="/hero-banner-v2.png"
            alt={
              cityName
                ? `Let's Make Travel Dreams Come True Together in ${cityName}! Become a Proud Broom Boom Cabs Vendor Partner Today`
                : "Let's Make Travel Dreams Come True Together! Become a Proud Broom Boom Cabs Vendor Partner Today"
            }
            width={1024}
            height={331}
            className="w-full h-auto object-cover"
            priority
          />
        </div>

        {/* Mobile View: Text and JOIN NOW button positioned nicely in the middle/lower part of the image */}
        <div className="md:hidden relative w-full overflow-hidden bg-[#7dc3db] aspect-[920/616]">
          <Image
            src="/hero-banner-mobile-v2.png"
            alt={
              cityName
                ? `Let's Make Travel Dreams Come True Together in ${cityName}! Become a Proud Broom Boom Cabs Vendor Partner Today`
                : "Let's Make Travel Dreams Come True Together! Become a Proud Broom Boom Cabs Vendor Partner Today"
            }
            fill
            className="object-cover"
            priority
          />

          {/* Content container with balanced top padding to stay clear of the app banner */}
          <div className="absolute inset-0 flex flex-col items-center justify-between pt-14 sm:pt-20 pb-4 sm:pb-6 text-center px-4">
            <div>
              {cityName && (
                <div className="inline-flex items-center gap-1 bg-slate-950/90 text-amber-400 border border-amber-400/60 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-1 shadow-sm">
                  <MapPin className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                  <span>{cityName} Services</span>
                </div>
              )}
              {/* Main Heading Text */}
              <span className="block text-[12px] sm:text-sm font-serif italic text-slate-900 font-bold drop-shadow-[0_1px_3px_rgba(255,255,255,0.95)] tracking-wider">
                Let&apos;s Make
              </span>
              <h1 className="text-[19px] sm:text-[23px] font-serif font-black text-slate-950 tracking-tight leading-tight drop-shadow-[0_2px_4px_rgba(255,255,255,0.95)] max-w-[280px] sm:max-w-xs mx-auto mt-0.5">
                Travel Dreams Come True Together!
              </h1>
              <p className="text-[11px] sm:text-xs font-extrabold text-slate-900 mt-0.5 sm:mt-1 max-w-[290px] mx-auto drop-shadow-[0_1px_3px_rgba(255,255,255,0.95)] leading-tight">
                {cityName
                  ? `Become a Proud BroomBoom Cabs Vendor Owner in ${cityName} Today`
                  : "Become a Proud BroomBoom Cabs Vendor Owner Today"}
              </p>
            </div>

            {/* JOIN NOW Button placed right in the middle/lower image area */}
            <div className="mt-2">
              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm px-7 sm:px-8 py-2 sm:py-2.5 rounded-full shadow-[0_4px_22px_rgba(245,158,11,0.65)] border-2 border-white ring-2 ring-amber-400/60 hover:brightness-105 active:scale-95 transition-all">
                <span>JOIN NOW</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};