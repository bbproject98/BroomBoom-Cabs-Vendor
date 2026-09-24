"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Compass,
  Check,
  Sparkles,
  Zap,
  Tag,
  ShieldCheck,
} from "lucide-react";
import { VENDOR_PACKAGES } from "@/data/vendorData";

interface PackagesSectionProps {
  onSelectPackage?: (pkgId: string) => void;
  onSelectTier?: (tierId: string) => void;
}

export const PackagesSection: React.FC<PackagesSectionProps> = ({
  onSelectPackage,
  onSelectTier,
}) => {
  const [trendsActiveIndex, setTrendsActiveIndex] = useState(0);
  const trendsScrollRef = useRef<HTMLDivElement>(null);

  const handleSelect = (id: string) => {
    onSelectPackage?.(id);
    onSelectTier?.(id);
  };

  // Helper to dynamically set pricing for each tier
  const getPrices = (id: string) => {
    switch (id) {
      case "silver":
        return { original: "₹20,000", discounted: "₹10,000" };
      case "gold":
        return { original: "₹40,000", discounted: "₹20,000" };
      case "platinum":
        return { original: "₹1,00,000", discounted: "₹50,000" };
      default:
        return { original: "₹20,000", discounted: "₹10,000" };
    }
  };

  // ============================================================
  // FULL TIER COLOR THEMES — the ENTIRE card is silver/gold/platinum
  // ============================================================
  const getTierStyle = (id: string) => {
    switch (id) {
      case "gold":
        return {
          card:
            "bg-gradient-to-b from-amber-200 via-yellow-100 to-amber-300 " +
            "border-[2.5px] border-amber-500 " +
            "shadow-[0_18px_50px_rgba(245,158,11,0.45)] " +
            "ring-4 ring-amber-400/25 lg:-translate-y-2.5",
          accentBar: "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500",
          headerBg:
            "bg-gradient-to-br from-amber-300/70 via-amber-200/60 to-yellow-200/70 border-amber-400/60",
          bodyBg: "bg-amber-50/50",
          titleColor: "text-amber-950",
          subtitleColor: "text-amber-800",
          priceColor: "text-amber-900",
          strikeColor: "text-amber-700/60",
          featureText: "text-amber-950/90",
          divider: "border-amber-400/50",
          labelColor: "text-amber-700",
          checkBg: "bg-amber-500 text-white",
          fleetPill: "bg-amber-900/10 text-amber-900 border-amber-400/40",
          badgeDeal:
            "bg-gradient-to-r from-amber-600 to-yellow-500 text-white border-amber-500",
          button:
            "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 " +
            "hover:from-amber-600 hover:via-yellow-600 hover:to-amber-600 " +
            "text-amber-950 shadow-[0_6px_20px_rgba(245,158,11,0.5)]",
          glow: "before:bg-amber-400/30",
        };
      case "platinum":
        return {
          card:
            "bg-gradient-to-b from-cyan-100 via-slate-50 to-blue-200 " +
            "border-[2.5px] border-cyan-400 " +
            "shadow-[0_18px_50px_rgba(6,182,212,0.35)] " +
            "ring-4 ring-cyan-300/25 hover:-translate-y-1.5",
          accentBar: "bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500",
          headerBg:
            "bg-gradient-to-br from-cyan-200/70 via-sky-100/60 to-blue-100/70 border-cyan-300/60",
          bodyBg: "bg-slate-50/60",
          titleColor: "text-slate-900",
          subtitleColor: "text-cyan-800",
          priceColor: "text-cyan-900",
          strikeColor: "text-slate-500/70",
          featureText: "text-slate-800",
          divider: "border-cyan-300/60",
          labelColor: "text-cyan-700",
          checkBg: "bg-cyan-600 text-white",
          fleetPill: "bg-cyan-900/10 text-cyan-900 border-cyan-400/40",
          badgeDeal:
            "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400",
          button:
            "bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700 " +
            "hover:from-cyan-700 hover:via-sky-700 hover:to-blue-800 " +
            "text-white shadow-[0_6px_20px_rgba(6,182,212,0.45)]",
          glow: "before:bg-cyan-400/25",
        };
      case "silver":
      default:
        return {
          card:
            "bg-gradient-to-b from-slate-200 via-white to-slate-300 " +
            "border-[2.5px] border-slate-400 " +
            "shadow-[0_18px_50px_rgba(100,116,139,0.35)] " +
            "ring-4 ring-slate-300/25 hover:-translate-y-1.5",
          accentBar: "bg-gradient-to-r from-slate-400 via-slate-200 to-slate-500",
          headerBg:
            "bg-gradient-to-br from-slate-300/60 via-slate-100/60 to-slate-200/60 border-slate-300/70",
          bodyBg: "bg-white/50",
          titleColor: "text-slate-900",
          subtitleColor: "text-slate-600",
          priceColor: "text-slate-900",
          strikeColor: "text-slate-400/70",
          featureText: "text-slate-800",
          divider: "border-slate-300/70",
          labelColor: "text-slate-500",
          checkBg: "bg-slate-600 text-white",
          fleetPill: "bg-slate-900/10 text-slate-800 border-slate-400/40",
          badgeDeal:
            "bg-gradient-to-r from-slate-500 to-slate-700 text-white border-slate-400",
          button:
            "bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 " +
            "hover:from-slate-700 hover:via-slate-800 hover:to-slate-900 " +
            "text-white shadow-[0_6px_20px_rgba(71,85,105,0.45)]",
          glow: "before:bg-slate-400/25",
        };
    }
  };

  const trendCards = [
    {
      id: "silver",
      tag: "DOMESTIC TRAVEL BOOM",
      image: "/images/travel-tajmahal.jpg",
      alt: "Taj Mahal - Indian Tourism & Travel Sector",
      headline: "21% Year-on-Year Growth of the Indian Tourism & Travel Sector",
    },
    {
      id: "gold",
      tag: "OUTBOUND VACATIONS",
      image: "/images/travel-roadtrip.jpg",
      alt: "Road trip travel - Domestic tourist growth",
      headline:
        "1.8 crore+ Indians holidayed abroad during 2022. 11.05% growth in domestic tourist visits",
    },
    {
      id: "platinum",
      tag: "HOLIDAY PACKAGES SURGE",
      image: "/images/travel-airport.jpg",
      alt: "Airport traveler - Holiday packages revenue",
      headline:
        "US$ 8.3 billion revenue projected for Holiday Packages business",
    },
  ];

  // ============================================================
  // BOTTOM MARQUEE ITEMS — left-to-right ticker
  // ============================================================
  const marqueeItems = [
    "21% YoY Growth in Indian Tourism & Travel",
    "1.8 crore+ Indians holidayed abroad in 2022",
    "11.05% growth in domestic tourist visits",
    "US$ 8.3 billion projected Holiday Packages revenue",
    "Flat 50% OFF on all Vendor Partner Packages",
    "Instant verification • Zero hidden charges",
    "Lock your territory before it's gone",
  ];

  const handleTrendsScroll = () => {
    if (!trendsScrollRef.current) return;
    const { scrollLeft, clientWidth } = trendsScrollRef.current;
    const firstChild = trendsScrollRef.current.children[0] as HTMLElement | undefined;
    const cardWidth = firstChild ? firstChild.offsetWidth + 14 : clientWidth * 0.72;
    const index = Math.round(scrollLeft / cardWidth);
    setTrendsActiveIndex(Math.min(Math.max(index, 0), trendCards.length - 1));
  };

  const scrollToTrendCard = (index: number) => {
    if (!trendsScrollRef.current) return;
    const children = trendsScrollRef.current.children;
    if (children[index]) {
      (children[index] as HTMLElement).scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
      setTrendsActiveIndex(index);
    }
  };

  return (
    <section
      id="packages"
      className="py-8 sm:py-10 bg-gradient-to-b from-[#FAF8F5] via-puja-cream to-[#FDFBF7] text-slate-900 relative"
    >
      {/* Marquee keyframes — safe to keep here (React hoists / renders inline) */}
      <style>{`
        @keyframes marqueeLTR {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        .animate-marquee-ltr {
          animation: marqueeLTR 34s linear infinite;
          will-change: transform;
        }
        .marquee-group:hover .animate-marquee-ltr {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee-ltr { animation: none; }
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* ========================================================================= */}
        {/* TOP SECTION: VENDOR PACKAGES PRICING CARDS                                */}
        {/* ========================================================================= */}
        <div className="text-center max-w-2xl mx-auto mb-7">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-400 text-amber-950 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wide mb-2.5">
            <Sparkles className="w-3 h-3 text-amber-600 animate-pulse" />
            <span>Limited Time Offer &bull; Flat 50% OFF On All Packages</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-[2rem] font-black text-slate-950 tracking-tight leading-tight">
            Choose Your <span className="text-amber-600">Vendor Partner Package</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-xl mx-auto">
            Attach your commercial vehicles or establish a dedicated regional booking hub.
            Lock in your territory with our exclusive discounted onboarding deals!
          </p>
        </div>

        {/* 3 Packages Grid / Mobile Horizontal Carousel */}
        <div className="grid grid-flow-col auto-cols-[88vw] sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 items-stretch mb-12 pt-2 overflow-x-auto sm:overflow-visible snap-x snap-mandatory sm:snap-none px-4 -mx-4 sm:mx-0 sm:px-0 pb-6 sm:pb-0 no-scrollbar">
          {VENDOR_PACKAGES.map((pkg) => {
            const t = getTierStyle(pkg.id);
            const isGold = pkg.id === "gold";
            const prices = getPrices(pkg.id); // Get our updated pricing based on ID

            return (
              <div
                key={pkg.id}
                className={`relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 snap-center sm:snap-align-none ${t.card}`}
              >
                {/* Metallic Accent Ribbon at very top */}
                <div className={`h-1.5 w-full ${t.accentBar}`} />

                {/* Most Popular Banner for Gold Tier */}
                {isGold && (
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-amber-950 text-[9.5px] font-black px-3.5 py-1 rounded-b-xl uppercase tracking-wider shadow-md border-x border-b border-amber-500 flex items-center gap-1 z-20 whitespace-nowrap">
                    <Sparkles className="w-2.5 h-2.5 text-amber-950 fill-amber-950" />
                    <span>★ Most Popular Hub</span>
                  </div>
                )}

                {/* Card Header */}
                <div
                  className={`px-4 pb-3.5 border-b ${isGold ? "pt-8" : "pt-5"} ${t.headerBg}`}
                >
                  {/* Badges Row */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                    <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[9.5px] font-black px-2 py-0.5 rounded uppercase tracking-wide shadow-sm">
                      <Tag className="w-2.5 h-2.5 stroke-[2.5]" />
                      {pkg.discountTag}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 text-[9.5px] font-black px-2 py-0.5 rounded uppercase tracking-wide border shadow-sm ${t.badgeDeal}`}
                    >
                      <Zap className="w-2.5 h-2.5" />
                      {pkg.dealTag}
                    </span>
                  </div>

                  {/* Fleet Size */}
                  <span
                    className={`inline-block text-[9.5px] font-extrabold px-1.5 py-0.5 rounded border ${t.fleetPill}`}
                  >
                    {pkg.fleetSize}
                  </span>

                  {/* Tier Name */}
                  <h3
                    className={`text-lg font-black tracking-tight leading-none mt-2 ${t.titleColor}`}
                  >
                    {pkg.name}
                  </h3>
                  <p
                    className={`text-[10.5px] font-semibold mt-1 leading-tight ${t.subtitleColor}`}
                  >
                    {pkg.subtitle}
                  </p>

                  {/* Pricing (Stacked "up down" layout) */}
                  <div className={`mt-3 pt-3 border-t ${t.divider}`}>
                    <div className="flex flex-col items-start gap-0.5">
                      <span
                        className={`text-[13px] font-bold line-through decoration-red-500 decoration-2 ${t.strikeColor}`}
                      >
                        {prices.original}
                      </span>
                      <span
                        className={`text-4xl font-black tracking-tight leading-none ${t.priceColor}`}
                      >
                        {prices.discounted}
                      </span>
                    </div>

                    <span className="inline-block mt-2.5 bg-emerald-600 text-white text-[9.5px] font-black px-2 py-0.5 rounded shadow-sm">
                      {pkg.savings} with current offer
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div
                  className={`px-4 py-3.5 flex-1 flex flex-col justify-between gap-3.5 ${t.bodyBg}`}
                >
                  <div>
                    <p
                      className={`text-[11px] mb-2.5 leading-snug line-clamp-2 ${t.featureText}`}
                    >
                      {pkg.description}
                    </p>

                    <div
                      className={`text-[9.5px] font-extrabold uppercase tracking-wider mb-1.5 ${t.labelColor}`}
                    >
                      Inclusions:
                    </div>
                    <ul className="space-y-1.5">
                      {pkg.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className={`flex items-start gap-2 text-[11px] font-semibold leading-snug ${t.featureText}`}
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 mt-[1px] shadow-sm ${t.checkBg}`}
                          >
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action */}
                  <div>
                    <button
                      onClick={() => handleSelect(pkg.id)}
                      className={`w-full py-2.5 px-3 rounded-lg font-black text-xs flex items-center justify-center gap-1.5 transition-all transform active:scale-95 cursor-pointer ${t.button}`}
                    >
                      <span>Apply for {pkg.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <p className="text-[9px] text-center text-slate-600 mt-1.5 flex items-center justify-center gap-1">
                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                      <span>Instant verification &bull; Zero hidden charges</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* SECONDARY: MARKET TRENDS PHOTO CAROUSEL                                  */}
        {/* ========================================================================= */}
        <div className="pt-6 border-t border-amber-200/70">
          <div className="text-center max-w-2xl mx-auto mb-5">
            <h3 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight">
              Indians are travelling the world like never before!
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-600 mt-1">
              Capitalize on the massive boom in Indian domestic tourism and outstation cab travel.
            </p>
          </div>

          {/* Desktop 3-Column Trend Photos */}
          <div className="hidden md:grid md:grid-cols-3 md:gap-5 max-w-4xl mx-auto items-stretch">
            {trendCards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleSelect(card.id)}
                className="flex flex-col group h-full cursor-pointer"
              >
                <div className="bg-white rounded-xl border border-amber-200/80 shadow-[0_3px_16px_rgba(0,0,0,0.06)] hover:shadow-xl hover:border-amber-400 p-3.5 flex flex-col h-full transition-all duration-300 hover:-translate-y-1">
                  <div className="relative w-full h-36 sm:h-40 overflow-hidden rounded-lg mb-2.5 bg-slate-100 shrink-0">
                    <Image
                      src={card.image}
                      alt={card.alt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      sizes="33vw"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-start">
                    <h4 className="text-[13px] font-bold text-slate-950 leading-snug">
                      {card.headline}
                    </h4>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Swipeable Trend Carousel */}
          <div className="md:hidden">
            <div className="flex items-center justify-between px-1 mb-2 text-[11px]">
              <span className="flex items-center gap-1.5 font-black text-amber-900">
                <Compass className="w-3 h-3 text-amber-600 animate-spin-slow" />
                <span>Market Growth Trends</span>
              </span>
              <span className="bg-white border border-amber-200 text-slate-700 font-bold px-2 py-0.5 rounded-full shadow-xs text-[10px] flex items-center gap-1">
                <span>
                  Card {trendsActiveIndex + 1} of {trendCards.length}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-amber-700">Swipe &rarr;</span>
              </span>
            </div>

            <div
              ref={trendsScrollRef}
              onScroll={handleTrendsScroll}
              className="grid grid-flow-col auto-cols-[72vw] sm:auto-cols-[260px] gap-3.5 overflow-x-auto snap-x snap-mandatory px-4 pb-4 -mx-4 items-stretch no-scrollbar"
            >
              {trendCards.map((card, idx) => (
                <div
                  key={card.id}
                  onClick={() => handleSelect(card.id)}
                  className="flex flex-col group h-full shrink-0 snap-center cursor-pointer"
                >
                  <div
                    className={`bg-white rounded-xl border ${
                      trendsActiveIndex === idx
                        ? "border-amber-400 ring-2 ring-amber-400/20"
                        : "border-amber-200/70"
                    } shadow-[0_3px_16px_rgba(0,0,0,0.06)] p-3 flex flex-col h-full transition-all duration-300`}
                  >
                    <div className="relative w-full h-32 overflow-hidden rounded-lg mb-2 bg-slate-100 shrink-0">
                      <Image
                        src={card.image}
                        alt={card.alt}
                        fill
                        className="object-cover"
                        sizes="72vw"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-start min-h-[40px]">
                      <h4 className="text-[11.5px] font-bold text-slate-950 leading-snug">
                        {card.headline}
                      </h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel Dots */}
            <div className="flex justify-center items-center gap-2 pt-1">
              {trendCards.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToTrendCard(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    trendsActiveIndex === idx
                      ? "w-6 h-1.5 bg-slate-950"
                      : "w-2 h-1.5 bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Bottom Call to Action */}
          <div className="mt-6 text-center max-w-xl mx-auto space-y-2">
            <p className="text-[11px] sm:text-xs text-slate-700 font-medium">
              Ready to take advantage of this massive mobility opportunity?
            </p>
            <button
              onClick={() => handleSelect("gold")}
              className="inline-flex items-center gap-2 bg-brand-yellow hover:bg-brand-yellow-hover text-black font-black text-xs sm:text-sm px-6 py-2.5 rounded-lg shadow-sm hover:shadow-yellow-glow transition-all transform active:scale-95 cursor-pointer"
            >
              <span>Apply for Vendor Partner Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM MARQUEE: continuous LEFT ➜ RIGHT scrolling ticker                  */}
      {/* ========================================================================= */}
      <div className="marquee-group relative mt-9 overflow-hidden border-y border-amber-200/70 bg-gradient-to-r from-amber-50 via-white to-amber-50 py-3 select-none">
        {/* Edge fade masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-20 bg-gradient-to-r from-[#FAF8F5] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-20 bg-gradient-to-l from-[#FDFBF7] to-transparent z-10" />

        <div className="flex w-max animate-marquee-ltr">
          {/* Two identical groups = seamless loop */}
          {[0, 1].map((group) => (
            <div
              key={group}
              className="flex shrink-0 items-center gap-8 pr-8"
              aria-hidden={group === 1}
            >
              {marqueeItems.map((item, i) => (
                <span
                  key={`${group}-${i}`}
                  className="flex shrink-0 items-center gap-2 whitespace-nowrap text-[11px] sm:text-xs font-bold text-slate-700"
                >
                  <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>{item}</span>
                  <span className="ml-6 h-1 w-1 rounded-full bg-amber-400 shrink-0" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};