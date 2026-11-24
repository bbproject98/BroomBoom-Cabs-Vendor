"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, MapPin, Building2, Globe2 } from "lucide-react";

interface NetworkCityCard {
  slug: string;
  heading: string;
  cityLabel: string;
  state: string;
  hubTagline: string;
}

const NETWORK_CITIES: NetworkCityCard[] = [
  {
    slug: "kolkata",
    heading: "Cab Vendor Registration in Kolkata",
    cityLabel: "Kolkata",
    state: "West Bengal",
    hubTagline: "Eastern India Fleet & Airport Hub",
  },
  {
    slug: "delhi",
    heading: "Cab Vendor Registration in Delhi NCR",
    cityLabel: "Delhi NCR",
    state: "Delhi / Noida / Gurugram",
    hubTagline: "Capital Region & IGI Airport Hub",
  },
  {
    slug: "mumbai",
    heading: "Cab Vendor Registration in Mumbai",
    cityLabel: "Mumbai",
    state: "Maharashtra",
    hubTagline: "Western Metro & Corporate Fleet Hub",
  },
  {
    slug: "pune",
    heading: "Cab Vendor Registration in Pune",
    cityLabel: "Pune",
    state: "Maharashtra",
    hubTagline: "Expressway & Outstation Travel Hub",
  },
  {
    slug: "bangalore",
    heading: "Cab Vendor Registration in Bangalore",
    cityLabel: "Bangalore",
    state: "Karnataka",
    hubTagline: "Tech Corridor & KIA Airport Hub",
  },
  {
    slug: "hyderabad",
    heading: "Cab Vendor Registration in Hyderabad",
    cityLabel: "Hyderabad",
    state: "Telangana",
    hubTagline: "HITEC City & RGIA Airport Hub",
  },
];

interface VendorNetworkSectionProps {
  cityName?: string;
  onOpenApplyModal?: (packageId?: string) => void;
}

export const VendorNetworkSection: React.FC<VendorNetworkSectionProps> = ({
  cityName,
  onOpenApplyModal,
}) => {
  const router = useRouter();

  const handleRegisterClick = () => {
    if (onOpenApplyModal) {
      onOpenApplyModal("gold");
    } else {
      const cityQuery = cityName ? `&city=${encodeURIComponent(cityName)}` : "";
      router.push(`/apply?package=gold${cityQuery}`);
    }
  };
  return (
    <section
      id="vendor-network"
      className="py-14 sm:py-20 bg-white border-t border-slate-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-xs font-extrabold uppercase tracking-wider mb-3">
            <Globe2 className="w-3.5 h-3.5 text-amber-700" />
            <span>Pan-India Service Hubs</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
            BroomBoom Vendor Partner Network Across India
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Attach your commercial cabs, sedans, SUVs, and tempo travellers in India&apos;s highest-demand
            mobility corridors. Select your city below to view local service plans and register as a partner.
          </p>
        </div>

        {/* 6 City Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {NETWORK_CITIES.map((city) => {
            const isCurrentCity =
              cityName &&
              city.cityLabel.toLowerCase().includes(cityName.trim().toLowerCase());

            return (
              <Link
                key={city.slug}
                href={`/${city.slug}`}
                className={`group relative flex flex-col rounded-3xl p-6 border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                  isCurrentCity
                    ? "bg-amber-50/70 border-amber-400 shadow-md ring-2 ring-amber-400/30"
                    : "bg-slate-50/70 hover:bg-white border-slate-200 hover:border-amber-400 shadow-sm"
                }`}
              >
                {/* Top Row: Location Badge & State */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-amber-400 text-[11px] font-black uppercase tracking-wider">
                    <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{city.cityLabel}</span>
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {city.state}
                  </span>
                </div>

                {/* H3 City Heading */}
                <h3 className="text-lg sm:text-xl font-black text-slate-950 group-hover:text-amber-700 transition-colors leading-snug">
                  {city.heading}
                </h3>

                {/* Hub Tagline */}
                <p className="mt-1.5 text-xs font-bold text-amber-700 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{city.hubTagline}</span>
                </p>
              </Link>
            );
          })}
        </div>

        {/* CTA H3 Headings */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <button
            type="button"
            onClick={handleRegisterClick}
            className="group inline-flex items-center gap-2 px-6 sm:px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md transition-all cursor-pointer"
          >
            <h3 className="text-base sm:text-lg font-black tracking-tight">
              Register as a Cab Vendor Today
            </h3>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <Link
            href="/#packages"
            className="group inline-flex items-center gap-2 px-6 sm:px-8 py-4 rounded-2xl bg-slate-950 hover:bg-slate-800 text-amber-400 shadow-md transition-all"
          >
            <h3 className="text-base sm:text-lg font-black tracking-tight">
              Explore Vendor Partner Plans
            </h3>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};