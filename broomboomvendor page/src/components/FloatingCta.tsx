"use client";

import React from "react";
import Link from "next/link";
import { Phone, ArrowRight } from "lucide-react";

interface FloatingCtaProps {
  onApplyClick?: () => void;
}

export const FloatingCta: React.FC<FloatingCtaProps> = ({ onApplyClick }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-2 pb-[calc(0.55rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_25px_rgba(0,0,0,0.4)]">
      <div className="flex items-center gap-2 max-w-md mx-auto">
        {/* 1. Direct Call Action Button */}
        <a
          href="tel:+916289952418"
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 border border-slate-700/80 bg-slate-900/90 hover:bg-slate-800 rounded-xl text-xs font-black text-slate-100 hover:text-white transition-all active:scale-95 shrink-0 shadow-sm"
          title="Direct Phone Call to BroomBoom Vendor Desk"
        >
          <Phone className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
          <span>Call</span>
        </a>

        {/* 2. Direct WhatsApp (WP) Action Button */}
        <a
          href="https://wa.me/916289952418?text=Hello%20BroomBoom%20Team%2C%20I%20am%20interested%20in%20joining%20as%20a%20BroomBoom%20Vendor%20Partner."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 border border-emerald-500/50 bg-emerald-950/80 hover:bg-emerald-900/90 rounded-xl text-xs font-black text-emerald-300 hover:text-white transition-all active:scale-95 shrink-0 shadow-sm"
          title="Connect directly on WhatsApp"
        >
          {/* WhatsApp SVG Icon */}
          <svg className="w-3.5 h-3.5 fill-emerald-400 shrink-0" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
          <span>WhatsApp</span>
        </a>

        {/* 3. Apply for Vendor Button */}
        <Link
          href="/apply?package=gold"
          onClick={onApplyClick}
          className="flex-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-slate-950 py-2.5 px-3 rounded-xl text-xs font-black shadow-[0_2px_12px_rgba(245,158,11,0.4)] flex items-center justify-center gap-1.5 transition-all transform active:scale-95 cursor-pointer"
        >
          <span>Apply for Vendor</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </Link>
      </div>
    </div>
  );
};
