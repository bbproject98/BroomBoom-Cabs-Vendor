"use client";

import React from "react";
import Link from "next/link";
import { Phone, ArrowRight } from "lucide-react";

interface FloatingCtaProps {
  onApplyClick?: () => void;
}

export const FloatingCta: React.FC<FloatingCtaProps> = ({ onApplyClick }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-2.5 pb-[calc(0.65rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_25px_rgba(0,0,0,0.4)]">
      <div className="flex items-center gap-2 max-w-md mx-auto">
        <a
          href="tel:62899524182706600"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-slate-700 bg-slate-900/90 rounded-xl text-xs font-bold text-slate-200 hover:text-white transition-colors active:scale-95"
        >
          <Phone className="w-3.5 h-3.5 text-brand-yellow" />
          <span>Call 6289952418-BROOM</span>
        </a>

        <Link
          href="/apply?package=gold"
          className="flex-[1.8] bg-brand-yellow hover:bg-brand-yellow-hover text-black py-2.5 px-4 rounded-xl text-xs font-black shadow-yellow-glow flex items-center justify-center gap-1.5 transition-all transform active:scale-95 cursor-pointer"
        >
          <span>Apply for Vendor</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

