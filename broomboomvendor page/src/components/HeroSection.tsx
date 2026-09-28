"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface HeroSectionProps {
  selectedPackage?: string;
  selectedTier?: string;
  onApplySuccess?: (data?: any) => void;
  onOpenApplyModal?: (packageId?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  selectedPackage = "gold",
  selectedTier = "gold",
  onOpenApplyModal,
}) => {
  const targetId = selectedPackage || selectedTier || "gold";

  return (
    <section className="relative w-full">
      <div
        onClick={() => onOpenApplyModal?.(targetId)}
        className="block relative cursor-pointer"
        title="Click to Apply for BroomBoom Vendor Partner"
      >
        {/* Laptop & Desktop View */}
        <div className="hidden md:block relative w-full">
          <Image
            src="/hero-banner-v2.png"
            alt="Let's Make Travel Dreams Come True Together! Become a Proud Broom Boom Cabs Vendor Partner Today"
            width={1920}
            height={600}
            className="w-full h-auto object-cover"
            priority
          />
        </div>

        {/* Mobile View: Text and JOIN NOW button positioned nicely in the middle/lower part of the image */}
        <div className="md:hidden relative w-full overflow-hidden bg-[#7dc3db] aspect-[920/616]">
          <Image
            src="/hero-banner-mobile-v2.png"
            alt="Let's Make Travel Dreams Come True Together! Become a Proud Broom Boom Cabs Vendor Partner Today"
            fill
            className="object-cover"
            priority
          />

          {/* Content container with balanced top padding to stay clear of the app banner */}
          <div className="absolute inset-0 flex flex-col items-center justify-between pt-16 sm:pt-20 pb-4 sm:pb-6 text-center px-4">
            <div>
              {/* Main Heading Text */}
              <span className="text-[12px] sm:text-sm font-serif italic text-slate-900 font-bold drop-shadow-[0_1px_3px_rgba(255,255,255,0.95)] tracking-wider">
                Let&apos;s Make
              </span>
              <h1 className="text-[19px] sm:text-[23px] font-serif font-black text-slate-950 tracking-tight leading-tight drop-shadow-[0_2px_4px_rgba(255,255,255,0.95)] max-w-[280px] sm:max-w-xs mx-auto mt-0.5">
                Travel Dreams Come True Together!
              </h1>
              <p className="text-[11px] sm:text-xs font-extrabold text-slate-900 mt-0.5 sm:mt-1 max-w-[290px] mx-auto drop-shadow-[0_1px_3px_rgba(255,255,255,0.95)] leading-tight">
                Become a Proud Broom Boom Cabs Franchise Owner Today
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