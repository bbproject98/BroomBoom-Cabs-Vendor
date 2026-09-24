"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-puja-cream flex flex-col items-center justify-center p-6 text-center text-slate-900">
      <div className="max-w-md bg-white border border-amber-300 rounded-3xl p-8 shadow-xl space-y-4">
        <h2 className="text-4xl font-black text-slate-950">404</h2>
        <p className="text-base font-bold text-slate-800">Page Not Found</p>
        <p className="text-xs text-slate-500">
          The requested vendor partner page could not be located.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-brand-yellow hover:bg-brand-yellow-hover text-black font-black text-xs px-6 py-2.5 rounded-xl shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Vendor Overview</span>
        </Link>
      </div>
    </div>
  );
}

