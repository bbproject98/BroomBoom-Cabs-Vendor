"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock,
  Headphones,
  HelpCircle,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { VendorLoginModal } from "@/components/VendorLoginModal";
import { BrochureModal } from "@/components/BrochureModal";
import { FloatingCta } from "@/components/FloatingCta";
import { FALLBACK_HUBS, FAQ_ITEMS } from "@/data/vendorData";
import { SERVICE_CITIES } from "@/data/serviceCities";

const SUPPORT_TOPICS = [
  "KYC & Document Verification",
  "Booking Dispatch & Pincode Allocation",
  "Payouts & Bank Settlements",
  "Plan Upgrade (Silver / Gold / Platinum)",
  "Vendor Portal & App Support",
] as const;

export default function SupportPage() {
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Kolkata");
  const [preferredPackage, setPreferredPackage] = useState("gold");
  const [topic, setTopic] = useState<string>(SUPPORT_TOPICS[0]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [ticketRef, setTicketRef] = useState<string | null>(null);

  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isBrochureModalOpen, setIsBrochureModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState("gold");

  const handleOpenLoginModal = (packageId: string = "gold") => {
    setSelectedPackage(packageId);
    setIsLoginModalOpen(true);
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const digits = mobile.replace(/\D/g, "").slice(-10);
    if (!fullName.trim() || digits.length !== 10 || !message.trim()) {
      setSubmitError(
        "Please enter your full name, a valid 10-digit mobile number, and describe your query."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const refId = `BB-SUP-${Math.floor(100000 + Math.random() * 900000)}`;
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: refId,
          fullName: fullName.trim(),
          mobile: digits,
          email: email.trim() || undefined,
          city,
          preferredPackage,
          source: "support_page",
          message: `[Support: ${topic}] ${message.trim()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Unable to submit support request.");
      }

      setTicketRef(data.lead?.applicationId || refId);
      setFullName("");
      setMobile("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong. Please call our helpline.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-puja-cream text-slate-900 selection:bg-brand-yellow selection:text-black font-sans">
      <Navbar
        onOpenApplyModal={handleOpenLoginModal}
        onOpenBrochureModal={() => setIsBrochureModalOpen(true)}
      />

      <main className="flex-1 pb-20 md:pb-10">
        {/* Hero Header */}
        <section className="relative overflow-hidden bg-puja-gradient-hero border-b border-amber-200/70 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
              <Headphones className="w-3.5 h-3.5 text-amber-700" />
              <span>24/7 Vendor Partner Helpdesk</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight mb-4">
              BroomBoom Vendor <span className="text-yellow-gradient">Support Center</span>
            </h1>
            <p className="max-w-2xl mx-auto text-sm sm:text-lg text-slate-600 mb-8">
              Need help with vehicle attachment, pincode dispatch allocation, automated bank payouts, or Silver/Gold/Platinum plan upgrades? Reach our dedicated relationship desk anytime.
            </p>

            {/* 4 Quick Support Channels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
              <a
                href="tel:+916289952418"
                className="bg-white rounded-2xl border border-amber-200 hover:border-brand-yellow p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                    <Phone className="w-5 h-5" />
                  </div>
                  <h2 className="text-sm font-black text-slate-950">Vendor Hotline</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Direct voice desk for urgent trip or payout queries
                  </p>
                </div>
                <span className="mt-4 text-sm font-black text-amber-800 inline-flex items-center gap-1">
                  +91 6289952418 <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </a>

              <a
                href="https://wa.me/916289952418?text=Hello%20BroomBoom%20Vendor%20Support%2C%20I%20need%20assistance%20with%20my%20vendor%20account."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-2xl border border-emerald-200 hover:border-emerald-400 p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <h2 className="text-sm font-black text-slate-950">WhatsApp Desk</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Share RC docs or booking screenshots quickly
                  </p>
                </div>
                <span className="mt-4 text-sm font-black text-emerald-700 inline-flex items-center gap-1">
                  Chat on WhatsApp <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </a>

              <a
                href="mailto:support@broomboomcabs.com"
                className="bg-white rounded-2xl border border-amber-200 hover:border-brand-yellow p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-3">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h2 className="text-sm font-black text-slate-950">Partner Email</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    GST invoices, fleet agreements &amp; escalation mail
                  </p>
                </div>
                <span className="mt-4 text-xs sm:text-sm font-black text-slate-900 break-all inline-flex items-center gap-1">
                  support@broomboomcabs.com
                </span>
              </a>

              <Link
                href="/vendor/login"
                className="bg-slate-950 text-white rounded-2xl border border-amber-400/50 hover:border-amber-400 p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between text-left"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center mb-3">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h2 className="text-sm font-black text-white">
                    Vendor Partner Portal
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Sign in to view dashboard, plan tier &amp; status
                  </p>
                </div>
                <span className="mt-4 text-sm font-black text-amber-400 inline-flex items-center gap-1">
                  Open Vendor Login <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* Main Two-Column Section: Callback Ticket Form + Regional Hubs */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Raise Support Request Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-amber-200 p-6 sm:p-8 shadow-card">
            <div className="mb-6">
              <span className="inline-block bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mb-2">
                Submit a Request
              </span>
              <h2 className="text-2xl font-black text-slate-950">
                Raise a Support Ticket or Request Callback
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Our Territory Relationship Team responds within 30 business minutes during active dispatch hours.
              </p>
            </div>

            {ticketRef && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                <div className="flex items-center gap-2 font-black text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Support Request Logged ({ticketRef})</span>
                </div>
                <p className="text-xs text-emerald-800">
                  Our Partner Support Desk has received your ticket and will call you back shortly on your registered number.
                </p>
              </div>
            )}

            {submitError && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Name <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Mobile Number <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    value={mobile}
                    onChange={(e) =>
                      setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    placeholder="10-digit mobile number"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Operating City
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-amber-500"
                  >
                    {SERVICE_CITIES.map((c) => (
                      <option key={c.slug} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                    <option value="Other City">Other City</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Partner Plan
                  </label>
                  <select
                    value={preferredPackage}
                    onChange={(e) => setPreferredPackage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="silver">Silver Partner</option>
                    <option value="gold">Gold Partner</option>
                    <option value="platinum">Platinum Partner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Support Topic
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-amber-500"
                >
                  {SUPPORT_TOPICS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  How can we help you? <span className="text-amber-600">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Include your Application ID, cab count, pincode, or booking ID for faster resolution..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-yellow hover:bg-brand-yellow-hover disabled:opacity-60 text-slate-950 font-black text-sm px-7 py-3 rounded-xl shadow-yellow-glow cursor-pointer transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? "Submitting Request..." : "Submit Support Request"}</span>
              </button>
            </form>
          </div>

          {/* Regional Hub Offices */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-950 text-white rounded-3xl border border-amber-400/40 p-6">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider mb-1">
                <Building2 className="w-4 h-4" />
                <span>Regional Verification Desks</span>
              </div>
              <h2 className="text-xl font-black mb-2">
                Walk-In Fleet Inspection Hubs
              </h2>
              <p className="text-xs text-slate-300 mb-4">
                Prefer in-person onboarding or branding kit pickup? Visit our regional partner offices below.
              </p>

              <div className="space-y-3 max-h-[430px] overflow-y-auto pr-1">
                {FALLBACK_HUBS.map((hub) => (
                  <div
                    key={hub.id}
                    className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-black text-white">
                        {hub.city}, {hub.state}
                      </span>
                      <span className="text-[10px] font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                        {hub.tier}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{hub.address}</span>
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {hub.openHours}
                      </span>
                      <a
                        href="tel:+916289952418"
                        className="text-amber-400 font-bold hover:underline"
                      >
                        6289952418
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQs Strip */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 bg-white border border-amber-300 text-amber-900 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Quick Support FAQs</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
              Common Vendor Help Questions
            </h2>
          </div>

          <div className="space-y-2.5">
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div
                  key={faq.question}
                  className="bg-white rounded-2xl border border-amber-200 overflow-hidden shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full text-left px-5 py-3.5 flex items-center justify-between gap-3 font-bold text-slate-900 text-sm sm:text-base hover:text-amber-800 cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${
                        isOpen ? "rotate-180 text-amber-600" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-amber-100 bg-amber-50/20">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer
        onOpenApplyModal={handleOpenLoginModal}
        onOpenBrochureModal={() => setIsBrochureModalOpen(true)}
      />

      <FloatingCta onApplyClick={() => handleOpenLoginModal("gold")} />

      <VendorLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        defaultPackage={selectedPackage}
      />

      <BrochureModal
        isOpen={isBrochureModalOpen}
        onClose={() => setIsBrochureModalOpen(false)}
      />
    </div>
  );
}
