"use client";

import React, { useState, useRef } from "react";
import {
  Crown,
  User,
  ClipboardList,
  CreditCard,
  Rocket,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface JourneySectionProps {
  onOpenApplyModal?: (packageId?: string) => void;
  cityName?: string;
}

export const JourneySection: React.FC<JourneySectionProps> = ({
  onOpenApplyModal,
  cityName,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      stepNumber: "01",
      title: "Select Your Vendor Plan",
      badge: "Flexible Plans",
      description:
        "Select your preferred Silver, Gold, or Platinum vendor partnership plan according to your business requirements.",
      icon: <Crown className="w-6 h-6 text-amber-600 group-hover:text-amber-500 transition-colors" />,
    },
    {
      stepNumber: "02",
      title: "Submit Your Contact Details",
      badge: "Quick Start",
      description:
        "Click on Join Now, enter your Full Name and Mobile Number, and seamlessly continue to the application form.",
      icon: <User className="w-6 h-6 text-amber-600 group-hover:text-amber-500 transition-colors" />,
    },
    {
      stepNumber: "03",
      title: "Upload Business and Vehicle Documents",
      badge: "Detailed Profile",
      description:
        "Fill in your contact details, proposed city/territory, commercial space availability, business background, and investment readiness.",
      icon: <ClipboardList className="w-6 h-6 text-amber-600 group-hover:text-amber-500 transition-colors" />,
    },
    {
      stepNumber: "04",
      title: "Complete payment & Verification",
      badge: "Secure Payment",
      description:
        "Review and submit your application, then complete the applicable plan payment to register for your selected area.",
      icon: <CreditCard className="w-6 h-6 text-amber-600 group-hover:text-amber-500 transition-colors" />,
    },
    {
      stepNumber: "05",
      title: "Access Your Vendor Dashboard",
      badge: "Go Live",
      description:
        "Receive your Vendor login credentials. Log in to manage your profile, receive booking notifications, and accept requests.",
      icon: <Rocket className="w-6 h-6 text-amber-600 group-hover:text-amber-500 transition-colors" />,
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
    <section
      id="journey"
      className="py-8 sm:py-12 bg-[#FFFBF2] text-slate-900 relative border-t border-amber-200/70 overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-orange-200/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 bg-amber-100/80 border border-amber-300 text-amber-900 font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider mb-3 shadow-sm hover:shadow-md transition-shadow">
            <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>Fast-Track Onboarding</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            How to Register as a Cab Vendor with {" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-600">
              {cityName ? ` BroomBoom in ${cityName}` : "BroomBoom"} 
            </span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto font-medium">
            {cityName
              ? `Start your ${cityName} BroomBoom vendor journey in just 5 simple steps!`
              : "Start your BroomBoom vendor journey in just 5 simple steps!"}
          </p>
        </div>

        {/* LAPTOP & DESKTOP: Responsive 5-Column Grid with Beautiful Hover Effects */}
        <div className="hidden lg:grid lg:grid-cols-5 lg:gap-4 xl:gap-5 max-w-7xl mx-auto items-stretch relative">
          {/* Connecting Line (Desktop) */}
          <div className="absolute top-[60px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-amber-300 to-transparent z-0 hidden lg:block" />

          {steps.map((item, idx) => (
            <div
              key={item.stepNumber}
              className="bg-white/90 backdrop-blur-sm rounded-2xl border border-amber-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_40px_rgba(217,119,6,0.15)] hover:border-amber-400 p-5 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 relative group z-10"
            >
              <div>
                {/* Top Row: Icon + Step Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-black text-amber-900 bg-amber-100/50 border border-amber-300/60 px-2.5 py-1 rounded-full uppercase tracking-wider group-hover:bg-amber-400 group-hover:text-white transition-colors duration-300">
                    Step {item.stepNumber}
                  </span>
                </div>

                {/* Subtitle Badge */}
                <span className="inline-block bg-amber-50 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded border border-amber-200/70 mb-2 uppercase tracking-wide">
                  {item.badge}
                </span>

                {/* Step Title */}
                <h3 className="text-[15px] font-black text-slate-950 leading-snug mb-2 group-hover:text-amber-700 transition-colors">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-[11.5px] text-slate-600 leading-relaxed font-medium">
                  {item.description}
                </p>
              </div>

              {/* Bottom Step Progression Flow */}
              <div className="mt-4 pt-3 border-t border-amber-100/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-bold">Phase {item.stepNumber}</span>
                {idx < steps.length - 1 ? (
                  <span className="text-amber-600 font-extrabold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Next &rarr;
                  </span>
                ) : (
                  <span className="text-emerald-600 font-black flex items-center gap-1">
                    Go Live 🚀
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* MOBILE & TABLET: Smooth Horizontal Swipe Carousel */}
        <div className="lg:hidden">
          {/* Mobile Swipe Cue & Counter */}
          <div className="flex items-center justify-between px-2 mb-3 text-xs">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> 5-Step Process
            </span>
            <span className="bg-white border border-amber-200 text-slate-700 font-bold px-3 py-1 rounded-full text-[11px] flex items-center gap-1 shadow-sm">
              <span>Step {activeIndex + 1} of {steps.length}</span>
              <span className="text-slate-300">|</span>
              <span className="text-amber-600 animate-pulse">Swipe &rarr;</span>
            </span>
          </div>

          {/* Cards Carousel */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-4 pb-6 -mx-4 no-scrollbar items-stretch"
          >
            {steps.map((item, idx) => (
              <div
                key={item.stepNumber}
                className={`w-[85vw] sm:w-[320px] shrink-0 snap-center bg-white rounded-2xl border ${
                  activeIndex === idx
                    ? "border-amber-400 ring-4 ring-amber-400/10 shadow-lg"
                    : "border-amber-200/80 shadow-sm"
                } p-5 flex flex-col justify-between transition-all duration-300`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-sm">
                      {item.icon}
                    </div>
                    <span className="text-2xl font-black text-amber-200/80 tracking-tighter">
                      {item.stepNumber}
                    </span>
                  </div>

                  <span className="inline-block bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200/70 mb-2 uppercase tracking-wide">
                    {item.badge}
                  </span>

                  <h3 className="text-base font-bold text-slate-950 leading-snug mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-amber-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Phase {item.stepNumber}</span>
                  {idx < steps.length - 1 ? (
                    <span className="text-amber-700 font-bold flex items-center gap-1">
                      Next Step &rarr;
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-black">
                      Ready to Earn 🚀
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Interactive Carousel Controls */}
          <div className="flex justify-center items-center gap-4 pt-2">
            <button
              onClick={scrollPrev}
              disabled={activeIndex === 0}
              className={`p-2 rounded-full border border-amber-200 bg-white shadow-sm transition-all ${
                activeIndex === 0
                  ? "opacity-30 cursor-not-allowed"
                  : "opacity-100 hover:bg-amber-50 hover:scale-105 active:scale-95"
              }`}
              aria-label="Previous step"
            >
              <ChevronLeft className="w-5 h-5 text-slate-800" />
            </button>

            <div className="flex items-center gap-2">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToCard(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    activeIndex === idx
                      ? "w-6 h-2 bg-amber-500 shadow-sm"
                      : "w-2 h-2 bg-slate-300 hover:bg-amber-300"
                  }`}
                  aria-label={`Go to step ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={scrollNext}
              disabled={activeIndex === steps.length - 1}
              className={`p-2 rounded-full border border-amber-200 bg-white shadow-sm transition-all ${
                activeIndex === steps.length - 1
                  ? "opacity-30 cursor-not-allowed"
                  : "opacity-100 hover:bg-amber-50 hover:scale-105 active:scale-95"
              }`}
              aria-label="Next step"
            >
              <ChevronRight className="w-5 h-5 text-slate-800" />
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 sm:mt-12 text-center relative z-10">
          <button
            onClick={() => onOpenApplyModal?.("gold")}
            className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-black font-black text-sm sm:text-base px-8 py-3.5 sm:px-10 sm:py-4 rounded-xl shadow-[0_8px_30px_rgba(245,158,11,0.3)] hover:shadow-[0_8px_40px_rgba(245,158,11,0.5)] transition-all duration-300 transform hover:-translate-y-1 active:scale-95 overflow-hidden"
          >
            {/* Button Shine Effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            <span className="relative z-10">Start Your 5-Step Application</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="mt-3 text-xs text-slate-500 font-medium">
            Your Journey Starts Here – Join BroomBoom Vendor and Grow Your Cab Business!
          </p>
        </div>
      </div>
    </section>
  );
};