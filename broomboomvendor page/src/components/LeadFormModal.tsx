"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Mail, Sparkles, MessageCircle, ShieldCheck, Send } from "lucide-react";
import { fireConfetti } from "@/lib/confetti";

export interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPackage?: string;
  onSuccess?: (data: any) => void;
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({
  isOpen,
  onClose,
  defaultPackage = "gold",
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    state: "",
    city: "",
    preferredPackage: defaultPackage || "gold",
    investmentBudget: "₹20,000 (Gold Package - 50% OFF Exclusive Deal)",
    spaceStatus: "Owned commercial space ready",
    hasExperience: "Yes, currently in travel / taxi / logistics",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [applicationId, setApplicationId] = useState("");
  const [mailtoUrl, setMailtoUrl] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");

  useEffect(() => {
    if (defaultPackage) {
      setFormData((prev) => ({
        ...prev,
        preferredPackage: defaultPackage || "gold",
      }));
    }
  }, [defaultPackage]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.mobile || !formData.city || !formData.email) {
      alert("Please fill in Name, Phone, Email, and City.");
      return;
    }

    setIsSubmitting(true);
    let assignedId = `BB-VENDOR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          source: "modal_join_now",
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.applicationId) {
        assignedId = data.data.applicationId;
      }
    } catch (err) {
      console.warn("Backend submission fallback:", err);
    }

    setApplicationId(assignedId);

    // Format complete email summary for the sender's mobile email app
    const packageDisplayName =
      formData.preferredPackage === "silver"
        ? "SILVER PARTNER (Booking Kiosk — ₹10,000 • 50% OFF Exclusive Deal)"
        : formData.preferredPackage === "gold"
        ? "GOLD PARTNER (District Exclusive Hub — ₹20,000 • 50% OFF Exclusive Deal)"
        : formData.preferredPackage === "platinum"
        ? "PLATINUM PARTNER (Regional Master — ₹50,000 • 50% OFF Exclusive Deal)"
        : "CUSTOM VENDOR INQUIRY";

    const emailSubject = `Vendor Application [${assignedId}]: ${formData.fullName} - ${formData.city}`;
    const emailBody = `BROOMBOOM OFFICIAL VENDOR PARTNER APPLICATION
==================================================
APPLICATION REF NO: ${assignedId}
SUBMISSION DATE: ${new Date().toLocaleDateString("en-IN")}

APPLICANT INFORMATION:
- Full Name: ${formData.fullName}
- Mobile / WhatsApp: ${formData.mobile}
- Email: ${formData.email}

TERRITORY & LOCATION:
- Target City / District: ${formData.city}
- Target State: ${formData.state || "Not specified"}

VENDOR PACKAGE:
- Package Selected: ${packageDisplayName}
- Investment Budget: ${formData.investmentBudget}
- Space Readiness: ${formData.spaceStatus}
- Industry Experience: ${formData.hasExperience}

ADDITIONAL REMARKS:
${formData.message || "Ready to schedule territory viability call."}

==================================================
Submitted via BroomBoom Mobility Technologies Ltd.
Official Desk: vendor@broomboom.com | Toll-Free: 1800-BROOM-BOOM`;

    // Construct Mailto Link with CC to sender
    const mailto = `mailto:vendor@broomboom.com?cc=${encodeURIComponent(
      formData.email
    )}&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    // Construct WhatsApp Link
    const waText = `*New BroomBoom Vendor Application*\n\nRef: ${assignedId}\nName: ${formData.fullName}\nPhone: ${formData.mobile}\nCity: ${formData.city}, ${formData.state}\nPackage: ${formData.preferredPackage.toUpperCase()}\nBudget: ${formData.investmentBudget}`;
    const whatsapp = `https://api.whatsapp.com/send?phone=919876543210&text=${encodeURIComponent(waText)}`;

    setMailtoUrl(mailto);
    setWhatsappUrl(whatsapp);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);

      // Fire celebratory confetti
      fireConfetti({
        particleCount: 80,
        spread: 75,
        origin: { y: 0.5 },
      });

      // Automatically trigger the user's mobile mail app
      try {
        window.location.href = mailto;
      } catch (err) {}

      if (onSuccess) {
        onSuccess(formData);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border-2 border-amber-400 my-8 text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          /* Success Screen */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div>
              <span className="inline-block bg-emerald-100 text-emerald-800 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-2 border border-emerald-300">
                Application Registered &bull; {applicationId}
              </span>
              <h3 className="text-2xl font-black text-slate-950">
                Saved &amp; Sent Through Mobile Email!
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Thank you, <strong className="text-amber-900">{formData.fullName}</strong>. Your vendor application has been{" "}
              <strong className="text-slate-900">registered</strong>. An email draft with your full application details has been opened in your mobile email app.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 text-left space-y-2">
              <div className="flex items-center gap-1.5 font-black text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>What Happens Next?</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                1. Tap <strong>Open Mail App</strong> below if your mobile email did not open automatically.<br />
                2. Tap <strong>Send</strong> in your mail app — a copy is CC&apos;d directly to <strong>{formData.email}</strong>.<br />
                3. Our Territory Expansion Manager will call you on <strong>{formData.mobile}</strong> within 24 hours.
              </p>
            </div>

            {/* Mobile Actions */}
            <div className="pt-2 flex flex-col gap-2.5">
              <a
                href={mailtoUrl}
                className="w-full bg-brand-yellow hover:bg-brand-yellow-hover text-black font-black text-xs sm:text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Mail className="w-4 h-4" />
                <span>Open Mail App on Mobile &amp; Send</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send Copy via WhatsApp</span>
              </a>

              <button
                onClick={() => {
                  setIsSuccess(false);
                  onClose();
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 rounded-xl transition-all"
              >
                Done / Close Window
              </button>
            </div>
          </div>
        ) : (
          /* Application Form Section */
          <div>
            <div className="mb-4">
              <div className="inline-flex items-center gap-1.5 bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase mb-1.5">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Fast-Track Vendor Application</span>
              </div>
              <h3 className="text-2xl font-black text-slate-950 tracking-tight">
                Begin Your Vendor Journey
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Submit below to lock your preferred territory and receive your application confirmation.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-amber-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunil Agarwal"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>

              {/* Mobile and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile / WhatsApp <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* City and State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target City / District <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kolkata, Lucknow, Jaipur"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    placeholder="e.g. West Bengal, UP, Bihar"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* TIER SELECTION CARDS */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Preferred Vendor Tier
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {/* Silver Card */}
                  <div
                    onClick={() => setFormData({ ...formData, preferredPackage: "silver" })}
                    className={`cursor-pointer rounded-xl p-2.5 sm:p-3 text-center transition-all border-2 relative flex flex-col justify-center
                      ${
                        formData.preferredPackage === "silver"
                          ? "border-slate-500 shadow-md scale-[1.02]"
                          : "border-transparent opacity-80 hover:opacity-100"
                      } bg-gradient-to-br from-slate-200 to-slate-400`}
                  >
                    {formData.preferredPackage === "silver" && (
                      <Check className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-slate-800" />
                    )}
                    <span className="text-[10px] sm:text-xs font-black uppercase text-slate-800 tracking-wider">
                      Silver
                    </span>
                    <div className="mt-1 flex flex-col items-center text-slate-800">
                      <span className="text-[9px] font-bold line-through decoration-red-500 opacity-70 leading-none">
                        ₹20,000
                      </span>
                      <span className="text-[13px] sm:text-[15px] font-black leading-none mt-1">
                        ₹10,000
                      </span>
                    </div>
                  </div>

                  {/* Gold Card */}
                  <div
                    onClick={() => setFormData({ ...formData, preferredPackage: "gold" })}
                    className={`cursor-pointer rounded-xl p-2.5 sm:p-3 text-center transition-all border-2 relative flex flex-col justify-center
                      ${
                        formData.preferredPackage === "gold"
                          ? "border-amber-600 shadow-lg scale-[1.03]"
                          : "border-transparent opacity-80 hover:opacity-100"
                      } bg-gradient-to-br from-yellow-300 to-amber-500`}
                  >
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[8px] sm:text-[9px] px-2 py-0.5 rounded-full font-black uppercase shadow-sm whitespace-nowrap z-10">
                      ★ Most Popular
                    </div>
                    {formData.preferredPackage === "gold" && (
                      <Check className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-amber-950 z-10" />
                    )}
                    <span className="text-[10px] sm:text-xs font-black uppercase text-amber-950 tracking-wider mt-1 relative z-10">
                      Gold
                    </span>
                    <div className="mt-1 flex flex-col items-center text-amber-950 relative z-10">
                      <span className="text-[9px] font-bold line-through decoration-red-600 opacity-70 leading-none">
                        ₹40,000
                      </span>
                      <span className="text-[13px] sm:text-[15px] font-black leading-none mt-1">
                        ₹20,000
                      </span>
                    </div>
                  </div>

                  {/* Platinum Card */}
                  <div
                    onClick={() => setFormData({ ...formData, preferredPackage: "platinum" })}
                    className={`cursor-pointer rounded-xl p-2.5 sm:p-3 text-center transition-all border-2 relative flex flex-col justify-center
                      ${
                        formData.preferredPackage === "platinum"
                          ? "border-cyan-600 shadow-md scale-[1.02]"
                          : "border-transparent opacity-80 hover:opacity-100"
                      } bg-gradient-to-br from-cyan-200 to-teal-400`}
                  >
                    {formData.preferredPackage === "platinum" && (
                      <Check className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-cyan-950" />
                    )}
                    <span className="text-[10px] sm:text-xs font-black uppercase text-cyan-950 tracking-wider">
                      Platinum
                    </span>
                    <div className="mt-1 flex flex-col items-center text-cyan-950">
                      <span className="text-[9px] font-bold line-through decoration-red-500 opacity-70 leading-none">
                        ₹1,00,000
                      </span>
                      <span className="text-[13px] sm:text-[15px] font-black leading-none mt-1">
                        ₹50,000
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Budget and Space */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Investment Readiness
                  </label>
                  <select
                    value={formData.investmentBudget}
                    onChange={(e) => setFormData({ ...formData, investmentBudget: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                  >
                    <option value="₹10,000 (Silver Package - 50% OFF)">₹10,000 (Silver Partner • 50% OFF)</option>
                    <option value="₹20,000 (Gold Package - 50% OFF)">₹20,000 (Gold Partner • 50% OFF ★)</option>
                    <option value="₹50,000 (Platinum Package - 50% OFF)">₹50,000 (Platinum Master • 50% OFF)</option>
                    <option value="Above ₹50,000 (State Master)">Above ₹50,000 (State Master Operator)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Commercial Space
                  </label>
                  <select
                    value={formData.spaceStatus}
                    onChange={(e) => setFormData({ ...formData, spaceStatus: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                  >
                    <option value="Owned commercial space ready">Owned commercial space ready</option>
                    <option value="Rented shop/office ready">Rented shop/office ready</option>
                    <option value="Currently exploring location">Currently exploring location</option>
                    <option value="Operating from existing travel desk">Existing travel agency counter</option>
                  </select>
                </div>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Business / Travel Experience
                </label>
                <select
                  value={formData.hasExperience}
                  onChange={(e) => setFormData({ ...formData, hasExperience: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                >
                  <option value="Yes, currently in travel / taxi / logistics">Yes, in travel / taxi / fleet logistics</option>
                  <option value="Running another retail / trade franchise">Running another retail or trade franchise</option>
                  <option value="New entrepreneur eager to learn with HQ training">New entrepreneur (Need HQ training)</option>
                </select>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Questions or Remarks for HQ
                </label>
                <textarea
                  rows={2}
                  placeholder="Mention preferred PIN code or questions..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all resize-none"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-brand-yellow hover:bg-brand-yellow-hover text-black text-xs sm:text-sm font-black py-3 rounded-xl shadow-md flex items-center justify-center gap-2 group transition-all transform active:scale-95 disabled:opacity-75 cursor-pointer"
              >
                <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                <span>{isSubmitting ? "Submitting..." : "Submit Application & Open Mobile Email"}</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant confirmation &bull; Email copy to your mobile</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};