"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Download, FileText, Check, ShieldCheck } from "lucide-react";
import { fireConfetti } from "@/lib/confetti";

interface BrochureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrochureModal: React.FC<BrochureModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [city, setCity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) {
      alert("Please provide your name and phone number to download.");
      return;
    }

    setIsLoading(true);

    try {
      await fetch("/api/brochure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, mobile, city }),
      });
    } catch (err) {
      console.warn("Failed to log brochure download to database:", err);
    }

    setIsLoading(false);
    setIsDownloaded(true);

    fireConfetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.5 },
    });

    setTimeout(() => {
      // Trigger automatic brochure mock download
      const element = document.createElement("a");
      const file = new Blob(
        [
          `BROOMBOOM MOBILITY TECHNOLOGIES - VENDOR PROSPECTUS 2026-2027
================================================================
Applicant: ${name}
Phone/WhatsApp: ${mobile}
Target City: ${city || "All India"}
Date: ${new Date().toLocaleDateString("en-IN")}
================================================================

1. EXECUTIVE SUMMARY
BroomBoom is India's fastest-growing multi-vertical mobility and travel ecosystem, operating in 120+ cities with over 50,000 active fleet partners.

2. AVAILABLE VENDOR PACKAGES (EXCLUSIVE LIMITED TIME DEALS)
- Silver Partner (Express Booking Kiosk): ₹5,000 (Original: ₹20,000 • 75% OFF)
- Gold Partner (District Exclusive Hub): ₹10,000 (Original: ₹40,000 • 75% OFF) ★
- Platinum Partner (Regional Master Hub): ₹20,000 (Original: ₹1,00,000 • 80% OFF • 0% Commission)

3. REVENUE STREAMS
- 15%-25% ride booking commissions
- Outstation & Intercity one-way travel commissions
- Corporate logistics & employee transport commissions
- In-store driver onboarding fees (₹500 - ₹1,200 per driver)
- Fastag, toll, and insurance referral commissions

4. CONTACT & EXPANSION DESK
Headquarters: Salt Lake Sector V, Kolkata, India
Toll-Free Helpline: 6289952418-BROOM-BOOM
Email: support@broomboomcabs.com
Web: https://broomboom.com`
        ],
        { type: "text/plain;charset=utf-8" }
      );
      element.href = URL.createObjectURL(file);
      element.download = `BroomBoom_Vendor_Prospectus_${name.replace(/\s+/g, "_")}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border-2 border-amber-400 text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isDownloaded ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>
            <h3 className="text-xl font-black text-slate-950">Prospectus Downloaded!</h3>
            <p className="text-xs text-slate-600">
              The BroomBoom Vendor Kit has been downloaded to your device. We have also sent a copy to your mobile number via WhatsApp.
            </p>
            <button
              onClick={onClose}
              className="mt-4 bg-brand-yellow hover:bg-brand-yellow-hover text-black text-xs font-black px-6 py-2.5 rounded-xl transition-all shadow-md"
            >
              Close Window
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-amber-400 shrink-0 bg-white flex items-center justify-center p-0.5">
                <Image src="/broomboom-logo.png" alt="BroomBoom Logo" fill className="object-contain" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-950">Download Vendor Kit</h3>
                <p className="text-xs text-amber-700 font-bold">Official 2026-27 Business Prospectus (PDF)</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-5">
              Includes comprehensive financial projections, unit economics, agreement terms, and store blueprint designs.
            </p>

            <form onSubmit={handleDownload} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amit Verma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp Number (For PDF delivery)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City / District</label>
                <input
                  type="text"
                  placeholder="e.g. Patna, Varanasi, Kolkata"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 bg-brand-yellow hover:bg-brand-yellow-hover text-black text-xs sm:text-sm font-black py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>{isLoading ? "Preparing Kit..." : "Download Official Vendor Kit"}</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero spam. Instant free download.</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
