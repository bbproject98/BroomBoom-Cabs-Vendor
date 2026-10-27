"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  User,
  Phone,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Check,
  Zap,
} from "lucide-react";

export interface VendorLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPackage?: string;
}

export const VendorLoginModal: React.FC<VendorLoginModalProps> = ({
  isOpen,
  onClose,
  defaultPackage = "gold",
}) => {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(defaultPackage || "gold");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultPackage) {
      setSelectedPackage(defaultPackage);
    }
  }, [defaultPackage]);

  // Pre-fill from localStorage if previously entered
  useEffect(() => {
    if (isOpen) {
      setError(null);
      try {
        const saved = localStorage.getItem("bb_lead_prefill");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.fullName && !fullName) setFullName(parsed.fullName);
          if (parsed.mobile && !mobile) setMobile(parsed.mobile);
        }
      } catch (e) {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = fullName.trim();
    const cleanMobile = mobile.replace(/\D/g, "").slice(-10);
    const cleanCity = "Kolkata";

    if (!cleanName || cleanName.length < 2) {
      setError("Please enter your full legal or business name.");
      return;
    }

    if (!cleanMobile || cleanMobile.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsSubmitting(true);

    let assignedAppId = `BB-VENDOR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      // 1. Submit lead to database so it shows up in Admin Vendor Leads immediately
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: cleanName,
          mobile: cleanMobile,
          city: cleanCity,
          preferredPackage: selectedPackage,
          source: "modal_join_now",
          status: "new",
        }),
      });

      const data = await res.json();
      if (data.success && (data.data?.applicationId || data.lead?.applicationId)) {
        assignedAppId = data.data?.applicationId || data.lead?.applicationId;
      }
    } catch (err) {
      console.warn("[LEAD SUBMIT FALLBACK]", err);
    }

    // 2. Save to localStorage for instant prefill on the apply form
    try {
      localStorage.setItem(
        "bb_lead_prefill",
        JSON.stringify({
          fullName: cleanName,
          mobile: cleanMobile,
          preferredPackage: selectedPackage,
          applicationId: assignedAppId,
        })
      );
    } catch (e) {}

    // 3. Close modal and redirect to full application form page
    setIsSubmitting(false);
    onClose();

    router.push(
      `/apply?package=${encodeURIComponent(selectedPackage)}&name=${encodeURIComponent(
        cleanName
      )}&mobile=${encodeURIComponent(cleanMobile)}&applicationId=${encodeURIComponent(assignedAppId)}`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative border-2 border-amber-400 my-8 text-slate-900 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center pb-4 border-b border-slate-100">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-400/80 text-amber-950 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wide mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>Fast-Track Partner Login</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Join BroomBoom Vendor Partner
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
            Enter your details below to initiate your application and unlock your regional vendor franchise portal.
          </p>
        </div>

        {/* Package Selector Pills */}
        <div className="my-4">
          <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
            Select Your Package Tier:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedPackage("silver")}
              className={`p-2 rounded-xl text-center border-2 transition-all cursor-pointer ${
                selectedPackage === "silver"
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              <div className="text-[11px] font-black">Silver</div>
              <div className="text-[9px] opacity-80 font-bold truncate">Ward Kiosk</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPackage("gold")}
              className={`p-2 rounded-xl text-center border-2 transition-all relative cursor-pointer ${
                selectedPackage === "gold"
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-amber-500 shadow-md font-black ring-2 ring-amber-400/30"
                  : "bg-amber-50/60 hover:bg-amber-100/80 text-amber-900 border-amber-200"
              }`}
            >
              <span className="absolute -top-1.5 right-1 bg-amber-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase">
                ★ Hub
              </span>
              <div className="text-[11px] font-black">Gold</div>
              <div className="text-[9px] opacity-90 font-bold truncate">District Hub</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPackage("platinum")}
              className={`p-2 rounded-xl text-center border-2 transition-all cursor-pointer ${
                selectedPackage === "platinum"
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-500 shadow-sm"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              <div className="text-[11px] font-black">Platinum</div>
              <div className="text-[9px] opacity-80 font-bold truncate">Master Hub</div>
            </button>
          </div>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mb-3.5 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1">
              Full Legal Name <span className="text-amber-600">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Chandra Sharma"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs font-bold focus:border-amber-500 focus:outline-hidden transition-colors"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1">
              Mobile Number <span className="text-amber-600">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs font-black text-slate-500 border-r border-slate-300 pr-2">
                +91
              </span>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="9876543210"
                maxLength={10}
                required
                className="w-full pl-14 pr-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs font-bold font-mono focus:border-amber-500 focus:outline-hidden transition-colors"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Used for your vendor login credentials &amp; SMS OTP authentication.
            </p>
          </div>

          {/* Assurance info */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-2.5 flex items-start gap-2 text-[10.5px] text-emerald-900 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Your contact will be instantly registered in the <strong>Admin Vendor Leads</strong> desk.
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-[0_4px_16px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registering &amp; Opening Application...</span>
              </>
            ) : (
              <>
                <span>Continue to Application Form</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </button>
        </form>

        <p className="text-[10px] text-center text-slate-400 mt-3 flex items-center justify-center gap-1">
          <Check className="w-3 h-3 text-emerald-600" />
          <span>Official BroomBoom Partner Program • Zero Spam Guarantee</span>
        </p>
      </div>
    </div>
  );
};

