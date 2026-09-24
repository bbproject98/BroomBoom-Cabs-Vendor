"use client";

import React, { useState, useRef } from "react";
import {
  Palmtree,
  Globe,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const VendorOverview: React.FC = () => {
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const featureScrollRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      icon: <Palmtree className="w-12 h-12 text-white stroke-[1.5]" />,
      title: "Plan end-to-end",
      highlight: "RIDES & TRAVEL",
    },
    {
      icon: <Globe className="w-12 h-12 text-white stroke-[1.5]" />,
      title: "Build a Strong",
      highlight: "MOBILITY COMMUNITY",
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-white stroke-[1.5]" />,
      title: "Ensure Continuous",
      highlight: "BUSINESS GROWTH",
    },
  ];

  const handleFeatureScroll = () => {
    if (!featureScrollRef.current) return;
    const { scrollLeft, clientWidth } = featureScrollRef.current;
    const firstChild = featureScrollRef.current.children[0] as HTMLElement | undefined;
    const cardWidth = firstChild ? firstChild.offsetWidth + 16 : clientWidth * 0.74;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveFeatureIndex(Math.min(Math.max(index, 0), features.length - 1));
  };

  const scrollToFeature = (index: number) => {
    if (!featureScrollRef.current) return;
    const children = featureScrollRef.current.children;
    if (children[index]) {
      (children[index] as HTMLElement).scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
      setActiveFeatureIndex(index);
    }
  };

  const scrollFeatureNext = () => {
    const next = Math.min(activeFeatureIndex + 1, features.length - 1);
    scrollToFeature(next);
  };

  const scrollFeaturePrev = () => {
    const prev = Math.max(activeFeatureIndex - 1, 0);
    scrollToFeature(prev);
  };

  return (
    <section id="overview" className="relative overflow-hidden bg-slate-950 pt-6 sm:pt-7 pb-4 sm:pb-5 text-white">
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-radial-pattern opacity-10 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* === TOP SECTION: What a Vendor Does === */}
        <div className="text-center mb-3 sm:mb-4">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-950/60 border border-amber-800 px-3.5 py-0.5 rounded-full inline-block mb-1">
            Partnership Ecosystem
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Wondering What a <span className="text-brand-yellow">BroomBoom Vendor</span> Does?
          </h2>
          <p className="mt-1 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            As our authorized vendor partner, you power mobility and earn daily recurring revenues from customer rides, driver onboarding, and corporate bookings.
          </p>
        </div>

        {/* LAPTOP & DESKTOP: Clean 3-Column Pillar Grid */}
        <div className="hidden md:grid md:grid-cols-3 md:gap-5 max-w-5xl mx-auto mb-3.5 sm:mb-4 items-stretch">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-slate-900/90 border border-amber-500/20 rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center text-center backdrop-blur-sm shadow-xl hover:border-amber-400/50 hover:bg-slate-900 transition-all duration-300 group"
            >
              <div className="mb-3 p-3 rounded-2xl bg-amber-500/10 text-amber-400 group-hover:scale-105 transition-transform">
                {feature.icon}
              </div>
              <p className="text-sm sm:text-base font-medium text-slate-300">
                {feature.title} <br />
                <span className="text-lg sm:text-xl font-black text-amber-400 tracking-wide mt-1 block">
                  {feature.highlight}
                </span>
              </p>
            </div>
          ))}
        </div>

        {/* MOBILE VIEW: Horizontal Swipe Carousel */}
        <div className="md:hidden">
          {/* Mobile Swipe Cue & Counter */}
          <div className="flex items-center justify-between px-1 mb-3 text-xs">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              Territory Pillars
            </span>
            <span className="bg-slate-900 border border-amber-500/30 text-slate-300 font-bold px-2.5 py-0.5 rounded-full text-[11px] flex items-center gap-1">
              <span>Pillar {activeFeatureIndex + 1} of {features.length}</span>
              <span className="text-slate-500">•</span>
              <span className="text-amber-400">Swipe &rarr;</span>
            </span>
          </div>

          {/* Feature Cards Carousel */}
          <div
            ref={featureScrollRef}
            onScroll={handleFeatureScroll}
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-4 pb-4 -mx-4 mb-3 no-scrollbar items-stretch"
          >
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="w-[74vw] sm:w-[280px] shrink-0 snap-center bg-slate-900/90 border border-amber-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center backdrop-blur-sm shadow-xl"
              >
                <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/10 text-amber-400">
                  {feature.icon}
                </div>
                <p className="text-sm font-medium text-slate-300">
                  {feature.title} <br />
                  <span className="text-lg font-black text-amber-400 tracking-wide mt-1 block">
                    {feature.highlight}
                  </span>
                </p>
              </div>
            ))}
          </div>

          {/* Mobile Interactive Carousel Controls */}
          <div className="flex justify-center items-center gap-3 mb-3.5 sm:mb-4">
            <button
              onClick={scrollFeaturePrev}
              disabled={activeFeatureIndex === 0}
              className={`p-1.5 rounded-full border border-slate-700 bg-slate-900 text-slate-300 shadow-sm transition-opacity ${
                activeFeatureIndex === 0 ? "opacity-30 cursor-not-allowed" : "opacity-90 active:scale-95"
              }`}
              aria-label="Previous pillar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {features.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToFeature(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    activeFeatureIndex === idx
                      ? "w-6 h-1.5 bg-amber-400"
                      : "w-2 h-1.5 bg-slate-700 hover:bg-slate-600"
                  }`}
                  aria-label={`Go to feature ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={scrollFeatureNext}
              disabled={activeFeatureIndex === features.length - 1}
              className={`p-1.5 rounded-full border border-slate-700 bg-slate-900 text-slate-300 shadow-sm transition-opacity ${
                activeFeatureIndex === features.length - 1 ? "opacity-30 cursor-not-allowed" : "opacity-90 active:scale-95"
              }`}
              aria-label="Next pillar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Vision Narrative */}
        <div className="max-w-4xl mx-auto text-center mb-3.5 sm:mb-4">
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
            BroomBoom stands for trust, transparency, and assurance. In an era of booming on-demand travel, you bring a localized human touch to passenger bookings, fleet management, and driver empowerment across India!
          </p>
        </div>

        {/* Dotted Divider */}
        <div className="w-full max-w-4xl mx-auto border-t border-dashed border-amber-400/30 mb-3 sm:mb-4" />

        {/* === Products & Services Heading leading directly into the white card below === */}
        <div className="text-center pt-0 pb-1 sm:pb-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-950/60 border border-amber-800 px-3 py-0.5 rounded-full inline-block mb-1">
            Ecosystem Verticals
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Our Products &amp; <span className="text-brand-yellow">Services</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl mx-auto">
            Comprehensive travel &amp; mobility verticals powering every vendor partner
          </p>
        </div>
      </div>
    </section>
  );
};
