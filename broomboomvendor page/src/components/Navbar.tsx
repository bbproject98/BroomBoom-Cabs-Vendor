"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, MapPin, ArrowRight, Download } from "lucide-react";

interface NavbarProps {
  onOpenApplyModal?: (packageName?: string) => void;
  onOpenBrochureModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenApplyModal, onOpenBrochureModal }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white transition-all duration-300">
      {/* Main Navigation Bar – clean, matching franchise page */}
      <nav
        className={`w-full transition-all duration-300 ${
          scrolled ? "shadow-md" : "shadow-sm"
        }`}
      >
        {/* Desktop & Tablet Navigation (md and above) */}
        <div className="hidden md:flex items-center justify-between h-16 max-w-7xl mx-auto px-4 sm:px-6">
          {/* Brand Logo with "Vendor" label */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-brand-yellow shadow-sm group-hover:scale-105 transition-transform bg-white flex items-center justify-center p-0.5">
              <Image
                src="/broomboom-logo.png"
                alt="BroomBoom Vendor Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black tracking-tight text-brand-black">
                Broom<span className="text-brand-yellow-dark">Boom</span>
              </span>
              <span className="text-sm font-semibold text-slate-300">
                |
              </span>
              <span className="text-sm font-bold text-slate-700">
                Vendor
              </span>
            </div>
          </Link>

          {/* Desktop In-Page Navigation */}
          <div className="flex items-center gap-5 text-sm font-bold text-slate-700">
            <a href="#packages" className="hover:text-amber-800 transition-colors">
              Packages
            </a>
            <a href="#overview" className="hover:text-amber-800 transition-colors">
              Overview
            </a>
            <a href="#why-us" className="hover:text-amber-800 transition-colors">
              Why Us
            </a>
            <a href="#journey" className="hover:text-amber-800 transition-colors">
              Journey
            </a>
            <a href="#testimonials" className="hover:text-amber-800 transition-colors">
              Reviews
            </a>
            <a href="#faq" className="hover:text-amber-800 transition-colors">
              FAQs
            </a>
          </div>

          {/* Desktop Navigation CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new Event("trigger-pwa-install"));
                }
              }}
              className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-amber-800 border border-slate-300 hover:border-amber-400 px-3 py-2 rounded-xl transition-all cursor-pointer bg-white shadow-xs"
              title="Install BroomBoom App"
            >
              <Download className="w-3.5 h-3.5 text-amber-500" />
              <span>Install App</span>
            </button>
            <Link
              href="/store-locator"
              className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-brand-yellow-dark border border-slate-300 hover:border-brand-yellow-dark px-4 py-2.5 rounded-xl transition-all"
            >
              <MapPin className="w-4 h-4" />
              Store Locator
            </Link>
            <Link
              href="/apply?package=gold"
              className="bg-brand-yellow hover:bg-brand-yellow-hover text-black text-sm font-black px-6 py-2.5 rounded-xl shadow-md hover:shadow-yellow-glow transition-all flex items-center gap-2 group transform active:scale-95 cursor-pointer"
            >
              <span>JOIN NOW</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Mobile Navigation (under md): Exact 3-Part Layout Matching Reference Screenshot */}
        <div className="md:hidden flex items-center justify-between min-h-[56px] h-14 sm:h-16 py-2 px-3 sm:px-4">
          {/* 1. Left: Logo + BroomBoom | Vendor */}
          <Link href="/" className="flex items-center gap-1.5 shrink-0">
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-brand-yellow shadow-sm bg-white flex items-center justify-center p-0.5">
              <Image
                src="/broomboom-logo.png"
                alt="BroomBoom Vendor Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[14px] sm:text-[15px] font-black tracking-tight text-slate-950">
                Broom<span className="text-brand-yellow-dark">Boom</span>
              </span>
              <span className="text-xs text-slate-300 font-semibold">|</span>
              <span className="text-[11px] sm:text-xs font-bold text-slate-700">Vendor</span>
            </div>
          </Link>

          {/* 2. Center: Prominent JOIN NOW Pill Button */}
          <Link
            href="/apply?package=gold"
            className="bg-brand-yellow hover:bg-brand-yellow-hover text-slate-950 px-4 py-1.5 rounded-full shadow-[0_2px_8px_rgba(245,190,24,0.35)] flex flex-col items-center justify-center leading-none transform active:scale-95 transition-transform shrink-0 cursor-pointer"
          >
            <span className="text-[10px] font-black tracking-wider leading-none">JOIN</span>
            <span className="text-[10px] font-black tracking-wider leading-none mt-0.5">NOW</span>
          </Link>

          {/* 3. Right: INSTALL + STORE LOCATOR + Menu Toggle */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new Event("trigger-pwa-install"));
                }
              }}
              className="flex flex-col items-center justify-center p-1 rounded-lg text-amber-700 hover:text-amber-800 hover:bg-amber-50/80 transition-colors cursor-pointer"
              title="Install App"
              aria-label="Install App"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span className="text-[8px] font-black tracking-tighter leading-none mt-0.5">APP</span>
            </button>
            <Link
              href="/store-locator"
              className="flex flex-col items-center justify-center text-right leading-none text-slate-900 hover:text-amber-800 transition-colors font-black"
            >
              <span className="text-[9px] font-black tracking-tight leading-none">STORE</span>
              <span className="text-[9px] font-black tracking-tight leading-none mt-0.5">LOCATOR</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-800 hover:bg-slate-100 transition-colors ml-0.5"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3 shadow-xl animate-in slide-in-from-top duration-200">
            <a
              href="#packages"
              onClick={() => setMobileMenuOpen(false)}
              className="block font-semibold text-slate-800 hover:text-amber-800 py-1.5 border-b border-slate-100"
            >
              Packages
            </a>
            <a
              href="#overview"
              onClick={() => setMobileMenuOpen(false)}
              className="block font-semibold text-slate-800 hover:text-amber-800 py-1.5 border-b border-slate-100"
            >
              Overview
            </a>
            <a
              href="#why-us"
              onClick={() => setMobileMenuOpen(false)}
              className="block font-semibold text-slate-800 hover:text-amber-800 py-1.5 border-b border-slate-100"
            >
              Why BroomBoom
            </a>
            <a
              href="#journey"
              onClick={() => setMobileMenuOpen(false)}
              className="block font-semibold text-slate-800 hover:text-amber-800 py-1.5 border-b border-slate-100"
            >
              Begin Your Journey
            </a>
            <a
              href="#testimonials"
              onClick={() => setMobileMenuOpen(false)}
              className="block font-semibold text-slate-800 hover:text-amber-800 py-1.5 border-b border-slate-100"
            >
              Partner Stories & Reviews
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block font-semibold text-slate-800 hover:text-amber-800 py-1.5 border-b border-slate-100"
            >
              Frequently Asked Questions
            </a>
            <Link
              href="/store-locator"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 font-semibold text-slate-800 hover:text-brand-yellow-dark py-2 border-b border-slate-100"
            >
              <MapPin className="w-4 h-4" />
              Store Locator
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new Event("trigger-pwa-install"));
                }
              }}
              className="w-full text-center py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-xl font-black text-xs border border-amber-400/40 shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Install Vendor App</span>
            </button>
            <Link
              href="/apply?package=gold"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 bg-brand-yellow hover:bg-brand-yellow-hover text-black rounded-xl font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>JOIN NOW</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};
