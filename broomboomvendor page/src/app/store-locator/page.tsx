"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, Phone, Search, Sparkles, ArrowRight, Clock, ShieldCheck } from "lucide-react";
import { FranchiseHub } from "@/types";

const FALLBACK_HUBS: FranchiseHub[] = [
  {
    id: "hub-1",
    city: "Kolkata",
    state: "West Bengal",
    type: "Regional Master Hub",
    tier: "Platinum",
    address: "Salt Lake Sector V, Near College More, Kolkata - 700091",
    phone: "8240765499-BROOM-BOOM",
    openHours: "9:00 AM - 8:00 PM",
    isActive: true,
  },
  {
    id: "hub-2",
    city: "Lucknow",
    state: "Uttar Pradesh",
    type: "District Fleet Hub",
    tier: "Gold",
    address: "Hazratganj Main Market, Near Metro Station, Lucknow - 226001",
    phone: "8240765499-BROOM-BOOM",
    openHours: "9:30 AM - 7:30 PM",
    isActive: true,
  },
  {
    id: "hub-3",
    city: "Jaipur",
    state: "Rajasthan",
    type: "District Fleet Hub",
    tier: "Gold",
    address: "MI Road, Commercial Hub, Jaipur - 302001",
    phone: "8240765499-BROOM-BOOM",
    openHours: "9:00 AM - 8:00 PM",
    isActive: true,
  },
  {
    id: "hub-4",
    city: "Patna",
    state: "Bihar",
    type: "Express Booking Kiosk",
    tier: "Silver",
    address: "Fraser Road, Near Railway Station Junction, Patna - 800001",
    phone: "8240765499-BROOM-BOOM",
    openHours: "8:00 AM - 9:00 PM",
    isActive: true,
  },
  {
    id: "hub-5",
    city: "Pune",
    state: "Maharashtra",
    type: "District Fleet Hub",
    tier: "Gold",
    address: "FC Road, Shivajinagar Commercial Complex, Pune - 411005",
    phone: "8240765499-BROOM-BOOM",
    openHours: "9:30 AM - 8:00 PM",
    isActive: true,
  },
  {
    id: "hub-6",
    city: "Varanasi",
    state: "Uttar Pradesh",
    type: "District Fleet Hub",
    tier: "Gold",
    address: "Cantt Road, Near Varanasi Junction, Varanasi - 221002",
    phone: "8240765499-BROOM-BOOM",
    openHours: "9:00 AM - 8:00 PM",
    isActive: true,
  },
];

export default function StoreLocatorPage() {
  const [hubs, setHubs] = useState<FranchiseHub[]>(FALLBACK_HUBS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("All");

  useEffect(() => {
    fetch("/api/hubs")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.hubs)) {
          setHubs(data.hubs);
        }
      })
      .catch((err) => {
        console.warn("Using fallback hub dataset:", err);
      });
  }, []);

  const filteredHubs = hubs.filter((h) => {
    const matchesTier = selectedTier === "All" || h.tier.toLowerCase() === selectedTier.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      h.city.toLowerCase().includes(q) ||
      h.state.toLowerCase().includes(q) ||
      h.address.toLowerCase().includes(q) ||
      h.tier.toLowerCase().includes(q);
    return matchesTier && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-puja-cream text-slate-900 selection:bg-brand-yellow selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200 py-3.5 px-4 sm:px-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-amber-400 shadow-sm">
              <Image src="/broomboom-logo.png" alt="BroomBoom Logo" fill className="object-cover" priority />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-950">
                  Broom<span className="text-amber-600">Boom</span>
                </span>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider border border-amber-200">
                  Store Locator
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Pan-India Vendor Network</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-amber-800 border border-slate-300 hover:border-amber-400 px-3.5 py-2 rounded-xl transition-all bg-white shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-14 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-2 bg-white border border-amber-300 text-amber-900 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>120+ Active City Hubs Across India</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
            Find a <span className="text-yellow-gradient">BroomBoom Vendor Hub</span> Near You
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Visit our operational district hubs and booking kiosks across India or apply to open one in your own city.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-sm max-w-4xl mx-auto space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by city, state, or address (e.g. Kolkata, Lucknow, MI Road)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
            />
          </div>

          {/* Tier Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {["All", "Platinum", "Gold", "Silver"].map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`text-xs font-bold px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                  selectedTier === tier
                    ? "bg-amber-400 text-slate-950 shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {tier} {tier !== "All" && "Tier"}
              </button>
            ))}
          </div>
        </div>

        {/* Hubs Grid */}
        {filteredHubs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-md mx-auto space-y-3">
            <MapPin className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-black text-slate-900 text-base">No Vendor Hubs Found</h3>
            <p className="text-xs text-slate-500">
              We couldn&apos;t find any operational hubs matching &quot;{searchQuery}&quot;. Be the first to launch an exclusive hub in this territory!
            </p>
            <Link
              href="/apply?package=gold"
              className="inline-block bg-brand-yellow hover:bg-brand-yellow-hover text-black text-xs font-black px-5 py-2 rounded-xl mt-2 transition-all shadow-sm"
            >
              Apply to Open in this City &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredHubs.map((hub) => (
              <div
                key={hub.id}
                className="bg-white rounded-2xl border border-amber-200 p-5 sm:p-6 shadow-sm hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 uppercase">
                      {hub.type}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {hub.tier} Partner
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-950 group-hover:text-amber-900 transition-colors">
                    {hub.city}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{hub.state}</p>

                  <div className="mt-4 space-y-2 text-xs text-slate-700">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">{hub.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-semibold">{hub.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-[11px]">Open: {hub.openHours}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Operational</span>
                  </span>
                  <Link
                    href={`/apply?package=${hub.tier.toLowerCase()}`}
                    className="text-amber-800 font-black hover:underline flex items-center gap-1"
                  >
                    Open in this City &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Call to Action Banner */}
        <div className="bg-white border-2 border-amber-400 rounded-3xl p-6 sm:p-8 text-center shadow-lg space-y-3">
          <h3 className="text-xl sm:text-2xl font-black text-slate-950">
            Want to Launch an Exclusive BroomBoom Hub in Your Territory?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Check district availability for 2026. Exclusive territory rights available with low initial investment and guaranteed ROI support.
          </p>
          <div className="pt-1">
            <Link
              href="/apply?package=gold"
              className="inline-flex items-center gap-2 bg-brand-yellow hover:bg-brand-yellow-hover text-black font-black text-xs sm:text-sm px-7 py-3 rounded-xl shadow-md transition-all"
            >
              <span>Apply for Vendor Partner in Your City</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
