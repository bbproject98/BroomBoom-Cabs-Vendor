"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { VendorLoginModal } from "@/components/VendorLoginModal";
import { BrochureModal } from "@/components/BrochureModal";
import { SERVICE_CITIES } from "@/data/serviceCities";

const PARTNER_HIGHLIGHTS = [
  "Silver Partner — Ward Kiosk, Airport & Station Transfers",
  "Gold Partner — District Exclusive, Outstation & Long Rentals",
  "Platinum Partner — Regional Master, 0% Commission Corporate Fleet",
];

export default function ServicesDirectoryPage() {
  const [isBrochureModalOpen, setIsBrochureModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>("gold");

  const handleOpenLoginModal = (packageId: string = "gold") => {
    setSelectedPackage(packageId);
    setIsLoginModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-puja-cream text-slate-900 selection:bg-brand-yellow selection:text-black font-sans">
      <Navbar
        onOpenApplyModal={handleOpenLoginModal}
        onOpenBrochureModal={() => setIsBrochureModalOpen(true)}
      />

      <main className="flex-1">
        {/* Header Hero */}
        <section className="relative overflow-hidden bg-puja-gradient-hero border-b border-amber-200/70 py-14 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider mb-5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>BroomBoom Vendor City Hubs</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-black tracking-tight mb-4">
              Explore Our Vendor Services Across India
            </h1>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 mb-8">
              Select your operating metro hub to view localized BroomBoom Cabs Vendor partner packages,
              territory benefits, and onboarding details for your city.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleOpenLoginModal("gold")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-yellow hover:bg-brand-yellow-hover text-brand-black font-bold text-sm shadow-yellow-glow transition-all"
              >
                <span>Join as a Vendor Partner</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-sm transition-all"
              >
                <span>Back to Main Overview</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 6 City Directory Grid */}
        <section className="py-14 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-black">
                  Active Service Cities ({SERVICE_CITIES.length})
                </h2>
                <p className="text-slate-600 mt-1 text-sm sm:text-base">
                  Choose any city below to open its dedicated BroomBoom Cabs Vendor landing page.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-lg">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Verified Pincode &amp; Plan-Wise Dispatch Live</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SERVICE_CITIES.map((city) => (
                <Link
                  key={city.slug}
                  href={`/${city.slug}`}
                  className="group flex flex-col justify-between rounded-2xl bg-white border border-slate-200 hover:border-brand-yellow p-6 shadow-card hover:shadow-card-hover transition-all duration-200"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="w-11 h-11 rounded-xl bg-puja-subtle border border-amber-200 flex items-center justify-center text-amber-600 group-hover:bg-brand-yellow group-hover:text-brand-black transition-colors">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                        <Building2 className="w-3 h-3" />
                        {city.state}
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-brand-black group-hover:text-amber-700 transition-colors">
                      {city.name}
                    </h3>
                    <p className="text-sm font-medium text-amber-700 mt-1 mb-4">
                      {city.hubTagline}
                    </p>

                    <ul className="space-y-2 border-t border-slate-100 pt-4 mb-6">
                      {PARTNER_HIGHLIGHTS.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-xs text-slate-600"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-sm font-bold text-brand-black">
                    <span>View {city.name} Vendor Page</span>
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-puja-subtle group-hover:bg-brand-yellow transition-colors">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer
        onOpenApplyModal={handleOpenLoginModal}
        onOpenBrochureModal={() => setIsBrochureModalOpen(true)}
      />

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
