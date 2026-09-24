"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WhyBroomBoomProps {
  onOpenApplyModal?: (packageId?: string) => void;
}

export const WhyBroomBoom: React.FC<WhyBroomBoomProps> = ({ onOpenApplyModal }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Exact 6 benefit cards matching franchise landing page
  const benefits = [
    {
      id: 1,
      title: "Attractive commission structure",
      image: "/images/benefit-commission.jpg",
    },
    {
      id: 2,
      title: "Best-in-class technical support",
      image: "/images/benefit-support.jpg",
    },
    {
      id: 3,
      title: "Branding and marketing assistance",
      image: "/images/benefit-branding.jpg",
    },
    {
      id: 4,
      title: "Regular training and access to market Insights",
      image: "/images/benefit-training.jpg",
    },
    {
      id: 5,
      title: "A dedicated relationship manager",
      image: "/images/benefit-manager.jpg",
    },
    {
      id: 6,
      title: "Dashboard for monitoring business",
      image: "/images/benefit-dashboard.jpg",
    },
  ];

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, clientWidth } = scrollContainerRef.current;
    const firstChild = scrollContainerRef.current.children[0] as HTMLElement | undefined;
    const cardWidth = firstChild ? firstChild.offsetWidth + 16 : clientWidth * 0.75;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(index, 0), benefits.length - 1));
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
    const next = Math.min(activeIndex + 1, benefits.length - 1);
    scrollToCard(next);
  };

  const scrollPrev = () => {
    const prev = Math.max(activeIndex - 1, 0);
    scrollToCard(prev);
  };

  return (
    <section id="why-us" className="pt-1 sm:pt-2 pb-5 sm:pb-6 bg-white text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-3 sm:mb-4">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
            What&apos;s in it For You?
          </h2>
          <p className="mt-1 text-sm sm:text-base text-slate-600 leading-relaxed">
            As a BroomBoom Vendor Partner, you get to partner with the industry leader, run a thriving business and enjoy amazing benefits like:
          </p>
        </div>

        {/* LAPTOP & DESKTOP: Clean 2x3 Benefit Grid with Full-bleed Images */}
        <div className="hidden md:grid md:grid-cols-2 md:gap-5 max-w-6xl mx-auto">
          {benefits.map((item) => (
            <div
              key={item.id}
              className="relative w-full h-64 lg:h-72 rounded-2xl overflow-hidden shadow-md group"
            >
              {/* Background Image */}
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                sizes="(max-width: 1024px) 50vw, 600px"
              />

              {/* Dark Gradient Overlay for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              {/* Text Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <h3 className="text-white font-bold text-base sm:text-xl leading-tight">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* MOBILE VIEW: Horizontal Swipe Carousel */}
        <div className="md:hidden">
          {/* Mobile Swipe Cue & Counter */}
          <div className="flex items-center justify-between px-1 mb-3 text-xs">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
              Partner Benefits
            </span>
            <span className="bg-amber-50 border border-amber-200 text-slate-700 font-bold px-2.5 py-0.5 rounded-full text-[11px] flex items-center gap-1">
              <span>{activeIndex + 1} of {benefits.length}</span>
              <span className="text-slate-400">•</span>
              <span className="text-amber-700">Swipe &rarr;</span>
            </span>
          </div>

          {/* Benefit Cards Carousel */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-4 pb-4 -mx-4 no-scrollbar items-stretch"
          >
            {benefits.map((item) => (
              <div
                key={item.id}
                className="relative w-[76vw] sm:w-[320px] h-64 sm:h-80 rounded-2xl overflow-hidden shadow-md shrink-0 snap-center"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="80vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white font-bold text-base leading-tight">
                    {item.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Interactive Carousel Dots & Navigation */}
          <div className="flex justify-center items-center gap-3 pt-3">
            <button
              onClick={scrollPrev}
              disabled={activeIndex === 0}
              className={`p-1.5 rounded-full border border-slate-200 bg-white shadow-sm transition-opacity ${
                activeIndex === 0 ? "opacity-30 cursor-not-allowed" : "opacity-90 active:scale-95"
              }`}
              aria-label="Previous benefit"
            >
              <ChevronLeft className="w-4 h-4 text-slate-800" />
            </button>

            <div className="flex items-center gap-1.5">
              {benefits.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToCard(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    activeIndex === idx ? "w-5 h-1.5 bg-slate-900" : "w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={scrollNext}
              disabled={activeIndex === benefits.length - 1}
              className={`p-1.5 rounded-full border border-slate-200 bg-white shadow-sm transition-opacity ${
                activeIndex === benefits.length - 1 ? "opacity-30 cursor-not-allowed" : "opacity-90 active:scale-95"
              }`}
              aria-label="Next benefit"
            >
              <ChevronRight className="w-4 h-4 text-slate-800" />
            </button>
          </div>
        </div>

        {/* Bottom Text & Flow Action */}
        <div className="mt-4 sm:mt-5 text-center max-w-4xl mx-auto">
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            With a pan-India presence, BroomBoom vendors are expanding and making a great impact across the travel & mobility industry.
            Come, be a part of this family.
          </p>

          <div className="mt-2.5 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3.5">
            <button
              onClick={() => onOpenApplyModal?.("gold")}
              className="bg-brand-yellow hover:bg-brand-yellow-hover text-black text-sm font-black px-8 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 transform active:scale-95 cursor-pointer"
            >
              <span>Apply for BroomBoom Vendor Partner &rarr;</span>
            </button>
            <a
              href="#faq"
              className="text-xs font-bold text-slate-600 hover:text-amber-800 underline py-1"
            >
              View Frequently Asked Questions &darr;
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
