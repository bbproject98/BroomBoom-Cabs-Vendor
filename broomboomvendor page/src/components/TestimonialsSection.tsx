"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { TESTIMONIALS } from "@/data/vendorData";
import {
  Star,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
} from "lucide-react";

interface TestimonialsSectionProps {
  onOpenApplyModal?: (packageId?: string) => void;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ onOpenApplyModal }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, clientWidth } = scrollContainerRef.current;
    const firstChild = scrollContainerRef.current.children[0] as HTMLElement | undefined;
    const cardWidth = firstChild ? firstChild.offsetWidth + 16 : clientWidth * 0.8;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(index, 0), TESTIMONIALS.length - 1));
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
    const next = Math.min(activeIndex + 1, TESTIMONIALS.length - 1);
    scrollToCard(next);
  };

  const scrollPrev = () => {
    const prev = Math.max(activeIndex - 1, 0);
    scrollToCard(prev);
  };

  return (
    <section
      id="testimonials"
      className="py-5 sm:py-6 bg-puja-cream text-slate-900 relative border-t border-amber-200/70"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-3 sm:mb-4">
          <div className="inline-flex items-center gap-1.5 bg-amber-100/70 border border-amber-300 text-amber-900 font-bold text-xs px-3 py-0.5 rounded-full uppercase tracking-wider mb-1 shadow-xs">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Real Partner Stories</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
            Words from our <span className="text-yellow-gradient">Vendor Partners</span>
          </h2>
          <p className="mt-1 text-sm sm:text-base text-slate-600 leading-relaxed">
            Discover how entrepreneurs across India achieved financial freedom, built thriving local businesses, and expanded with BroomBoom.
          </p>
        </div>

        {/* LAPTOP & DESKTOP: Clean 3-Column Grid */}
        <div className="hidden md:grid md:grid-cols-3 md:gap-5 lg:gap-6 max-w-6xl mx-auto items-stretch">
          {TESTIMONIALS.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-amber-200/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-[0_4px_25px_rgba(0,0,0,0.06)] hover:shadow-2xl hover:border-amber-400 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div>
                {/* Header: Avatar, Name, Location & Verified Badge */}
                <div className="flex items-center gap-3.5 mb-3.5">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-300 shrink-0 shadow-2xs">
                    <Image
                      src={item.avatar}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-black text-slate-950 text-sm truncate">
                        {item.name}
                      </h3>
                      <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium truncate">
                      {item.city}, {item.state}
                    </p>
                    <span className="inline-block text-[10px] font-bold text-amber-900 bg-amber-100/90 border border-amber-300/80 px-2 py-0.5 rounded mt-0.5">
                      {item.tier}
                    </span>
                  </div>
                </div>

                {/* Rating Stars & Revenue Highlight */}
                <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-amber-100/80">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200/90 px-2.5 py-0.5 rounded-md">
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                    <span>{item.monthlyRevenue}</span>
                  </div>
                </div>

                {/* Quote Text */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              {/* Tenure Footer */}
              <div className="mt-4 pt-3 border-t border-amber-100/80 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-medium">Active Partner:</span>
                <span className="font-black text-slate-900">{item.monthsActive} Months</span>
              </div>
            </div>
          ))}
        </div>

        {/* MOBILE VIEW: Smooth Horizontal Swipe Carousel */}
        <div className="md:hidden">
          {/* Mobile Swipe Cue & Counter */}
          <div className="flex items-center justify-between px-1 mb-2.5 text-xs">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
              Partner Reviews
            </span>
            <span className="bg-amber-50 border border-amber-200 text-slate-700 font-bold px-2.5 py-0.5 rounded-full text-[11px] flex items-center gap-1">
              <span>Review {activeIndex + 1} of {TESTIMONIALS.length}</span>
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
            {TESTIMONIALS.map((item, idx) => (
              <div
                key={item.id}
                className={`w-[82vw] sm:w-[320px] shrink-0 snap-center bg-puja-cream/70 rounded-2xl border ${
                  activeIndex === idx ? "border-amber-400 ring-2 ring-amber-400/20" : "border-amber-200/80"
                } p-4 flex flex-col justify-between shadow-sm transition-all duration-300`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-amber-300 shrink-0">
                      <Image
                        src={item.avatar}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <h3 className="font-black text-slate-950 text-xs truncate">
                          {item.name}
                        </h3>
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {item.city}, {item.state}
                      </p>
                      <span className="inline-block text-[9px] font-bold text-amber-800 bg-amber-100/70 px-1.5 py-0.2 rounded mt-0.5">
                        {item.tier}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-100 text-xs">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.2 rounded">
                      {item.monthlyRevenue}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-amber-100/60 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Tenure:</span>
                  <span className="font-bold text-slate-800">{item.monthsActive} Months</span>
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
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4 text-slate-800" />
            </button>

            <div className="flex items-center gap-1.5">
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToCard(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    activeIndex === idx ? "w-5 h-1.5 bg-slate-950" : "w-1.5 h-1.5 bg-slate-300"
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={scrollNext}
              disabled={activeIndex === TESTIMONIALS.length - 1}
              className={`p-1.5 rounded-full border border-amber-200 bg-white shadow-sm transition-opacity ${
                activeIndex === TESTIMONIALS.length - 1 ? "opacity-30 cursor-not-allowed" : "opacity-90 active:scale-95"
              }`}
              aria-label="Next testimonial"
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
            <span>Join Our Successful Partner Network &rarr;</span>
          </button>
        </div>
      </div>
    </section>
  );
};
