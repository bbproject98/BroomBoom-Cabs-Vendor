"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  FileText,
  PhoneCall,
  ShieldCheck,
  Rocket,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface JourneySectionProps {
  onOpenApplyModal?: (packageId?: string) => void;
}

export const JourneySection: React.FC<JourneySectionProps> = ({ onOpenApplyModal }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      stepNumber: "01",
      title: "Fill in the Vendor Form",
      subtitle: "Quick Online Application",
      description:
        "Submit your basic details and city preference online in under 2 minutes. No paperwork needed at this stage.",
      icon: <FileText className="w-6 h-6 text-amber-600" />,
      badge: "2 Mins",
    },
    {
      stepNumber: "02",
      title: "Connect with Business Manager",
      subtitle: "Profile & Viability Call",
      description:
        "Our dedicated Territory Expansion Manager calls you to evaluate location potential, customer demand, and fleet options.",
      icon: <PhoneCall className="w-6 h-6 text-amber-600" />,
      badge: "Within 24 Hrs",
    },
    {
      stepNumber: "03",
      title: "Territory & Package Finalization",
      subtitle: "Lock In Exclusive Rights",
      description:
        "Select your package (Silver, Gold, or Platinum) and sign the vendor partner agreement with protected territory.",
      icon: <ShieldCheck className="w-6 h-6 text-amber-600" />,
      badge: "Protected Zone",
    },
    {
      stepNumber: "04",
      title: "Launch & Start Earning",
      subtitle: "Complete Kit & Go Live",
      description:
        "Receive your POS booking portal, driver onboarding tools, official branding kit, staff training, and start earning daily!",
      icon: <Rocket className="w-6 h-6 text-amber-600" />,
      badge: "Ready in 7 Days",
    },
  ];

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, clientWidth } = scrollContainerRef.current;
    const firstChild = scrollContainerRef.current.children[0] as HTMLElement | undefined;
    const cardWidth = firstChild ? firstChild.offsetWidth + 16 : clientWidth * 0.76;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(index, 0), steps.length - 1));
  };

  const scrollToCard = (index: number) => {
    if (!scrollContainerRef.current) return;
    const children = scrollContainerRef.current.children;
    if (children[index]) {
      (children[index] as HTMLElement).scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
      setActiveIndex(index);
    }
  };

  const scrollNext = () => {
    const next = Math.min(activeIndex + 1, steps.length - 1);
    scrollToCard(next);
  };

  const scrollPrev = () => {
    const prev = Math.max(activeIndex - 1, 0);
    scrollToCard(prev);
  };

  return (
    <section id="journey" className="py-5 sm:py-6 bg-puja-cream text-slate-900 relative border-t border-amber-200/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-3 sm:mb-4">
          <div className="inline-flex items-center gap-1.5 bg-amber-100/70 border border-amber-300 text-amber-900 font-bold text-xs px-3 py-0.5 rounded-full uppercase tracking-wider mb-1 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Fast-Track Onboarding</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
            Begin Your <span className="text-yellow-gradient">Journey Now</span>
          </h2>
          <p className="mt-1 text-sm sm:text-base text-slate-600 leading-relaxed">
            Setting up your BroomBoom vendor partnership is smooth and structured. From application to launch in just 4 simple steps:
          </p>
        </div>

        {/* LAPTOP & DESKTOP: Clean 4-Column Grid with Step Flow */}
        <div className="hidden md:grid md:grid-cols-4 md:gap-4 lg:gap-5 max-w-6xl mx-auto items-stretch">
          {steps.map((item, idx) => (
            <div
              key={item.stepNumber}
              className="bg-white rounded-2xl border border-amber-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.06)] hover:shadow-xl hover:border-amber-400 p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 relative group"
            >
              <div>
                {/* Top Row: Icon + Step Badge */}
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/90 flex items-center justify-center shadow-2xs group-hover:scale-105 group-hover:bg-amber-100/60 transition-all text-amber-600">
                    {item.icon}
                  </div>
                  <span className="text-xs font-black text-amber-900 bg-amber-100 border border-amber-300/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Step {item.stepNumber}
                  </span>
                </div>

                {/* Subtitle Badge */}
                <span className="inline-block bg-amber-50/90 text-amber-900 text-[11px] font-extrabold px-2.5 py-0.5 rounded-md border border-amber-200/90 mb-2">
                  {item.badge}
                </span>

                {/* Step Title */}
                <h3 className="text-base font-black text-slate-950 leading-snug mb-1.5 group-hover:text-amber-900 transition-colors">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>

              {/* Bottom Step Progression Flow */}
              <div className="mt-4 pt-3 border-t border-amber-100/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">Phase {item.stepNumber}</span>
                {idx < steps.length - 1 ? (
                  <span className="text-amber-800 font-bold flex items-center gap-1">
                    Next Step &rarr;
                  </span>
                ) : (
                  <span className="text-emerald-700 font-black flex items-center gap-1">
                    Ready in 7 Days 🚀
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* MOBILE VIEW: Smooth Horizontal Swipe Carousel */}
        <div className="md:hidden">
          {/* Mobile Swipe Cue & Counter */}
          <div className="flex items-center justify-between px-1 mb-2.5 text-xs">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
              Onboarding Steps
            </span>
            <span className="bg-white border border-amber-200 text-slate-700 font-bold px-2.5 py-0.5 rounded-full text-[11px] flex items-center gap-1">
              <span>Step {activeIndex + 1} of {steps.length}</span>
              <span className="text-slate-400">•</span>
              <span className="text-amber-700">Swipe &rarr;</span>
            </span>
          </div>

          {/* Cards Carousel */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory gap-3 px-4 pb-3 -mx-4 no-scrollbar items-stretch"
          >
            {steps.map((item, idx) => (
              <div
                key={item.stepNumber}
                className={`w-[78vw] sm:w-[300px] shrink-0 snap-center bg-white rounded-2xl border ${
                  activeIndex === idx ? "border-amber-400 ring-2 ring-amber-400/20" : "border-amber-200/80"
                } p-4 flex flex-col justify-between shadow-sm transition-all duration-300`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-xs">
                      {item.icon}
                    </div>
                    <span className="text-xl font-black text-amber-600">
                      Step {item.stepNumber}
                    </span>
                  </div>

                  <span className="inline-block bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200/70 mb-1.5">
                    {item.badge}
                  </span>

                  <h3 className="text-sm font-bold text-slate-950 leading-snug mb-1">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Interactive Carousel Controls */}
          <div className="flex justify-center items-center gap-3 pt-2">
            <button
              onClick={scrollPrev}
              disabled={activeIndex === 0}
              className={`p-1.5 rounded-full border border-amber-200 bg-white shadow-sm transition-opacity ${
                activeIndex === 0 ? "opacity-30 cursor-not-allowed" : "opacity-90 active:scale-95"
              }`}
              aria-label="Previous step"
            >
              <ChevronLeft className="w-4 h-4 text-slate-800" />
            </button>

            <div className="flex items-center gap-1.5">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToCard(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    activeIndex === idx ? "w-5 h-1.5 bg-slate-950" : "w-1.5 h-1.5 bg-slate-300"
                  }`}
                  aria-label={`Go to step ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={scrollNext}
              disabled={activeIndex === steps.length - 1}
              className={`p-1.5 rounded-full border border-amber-200 bg-white shadow-sm transition-opacity ${
                activeIndex === steps.length - 1 ? "opacity-30 cursor-not-allowed" : "opacity-90 active:scale-95"
              }`}
              aria-label="Next step"
            >
              <ChevronRight className="w-4 h-4 text-slate-800" />
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 sm:mt-5 text-center">
          <button
            onClick={() => onOpenApplyModal?.("gold")}
            className="inline-flex items-center gap-2 bg-brand-yellow hover:bg-brand-yellow-hover text-black font-black text-sm px-8 py-2.5 rounded-xl shadow-md hover:shadow-yellow-glow transition-all transform active:scale-95 cursor-pointer"
          >
            <span>Start Your 4-Step Application &rarr;</span>
          </button>
        </div>
      </div>
    </section>
  );
};
