"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Mail, MapPin, ShieldCheck } from "lucide-react";
import { SERVICE_CITIES } from "@/data/serviceCities";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";

const FULL_ADDRESS =
  "Majhi Enclave, 7, T.C.Mukherjee St, Kali Tala, Bangur Park, Rishra, West Bengal, 712248";

interface FooterProps {
  onOpenApplyModal?: (pkgId?: string) => void;
  onOpenBrochureModal?: () => void;
  cityName?: string;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenApplyModal,
  cityName,
}) => {
  const pathname = usePathname();
  const cityQuery = cityName ? `&city=${encodeURIComponent(cityName)}` : "";
  const isLandingOrCityPage =
    pathname === "/" ||
    pathname?.startsWith("/services/") ||
    SERVICE_CITIES.some((c) => pathname === `/${c.slug}`);
  const sectionHref = (hash: string) =>
    isLandingOrCityPage ? hash : `/${hash}`;

  return (
    <footer className="w-full bg-brand-black-pure text-slate-300 pt-8 sm:pt-10 pb-16 md:pb-10 border-t border-brand-black-border text-xs sm:text-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* ── Main Grid ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-4 gap-y-6 lg:gap-8 pb-6 border-b border-brand-black-border items-start">
          {/* Brand — full width on mobile */}
          <div className="col-span-2 lg:col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-brand-yellow shadow-yellow-glow shrink-0 bg-white flex items-center justify-center p-0.5">
                <Image
                  src="/logo.png"
                  alt="BroomBoom Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex items-center flex-wrap gap-x-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Broom<span className="text-brand-yellow">Boom</span>
                </span>
                <span className="bg-brand-yellow text-black text-[10px] font-black px-1.5 py-0.5 rounded uppercase">
                  Vendor
                </span>
              </div>
            </Link>

            <p className="text-[11px] sm:text-xs text-slate-400 max-w-md leading-relaxed">
              BroomBoom is India&apos;s rapidly expanding mobility, cab
              aggregation, and outstation travel ecosystem. Empowering local
              vendors with cutting-edge tech, protected territories, and high
              daily revenues.
            </p>

            <div className="flex items-start sm:items-center gap-2 text-[11px] sm:text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-brand-yellow shrink-0 mt-0.5 sm:mt-0" />
              <span>Government Recognized &amp; Startup India Certified</span>
            </div>
          </div>

          {/* Packages — half width on mobile */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider">
              3 Vendor Packages
            </h4>
            <ul className="space-y-2 text-[11px] sm:text-xs">
              <li>
                <Link
                  href={`/apply?package=silver${cityQuery}`}
                  className="hover:text-brand-yellow text-slate-400 transition-colors block"
                >
                  Silver Partner
                  <span className="hidden sm:inline">
                    {" "}
                    (Express Booking Kiosk)
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href={`/apply?package=gold${cityQuery}`}
                  className="hover:text-brand-yellow font-bold text-brand-yellow transition-colors block"
                >
                  Gold Partner{" "}
                  <span className="hidden sm:inline">
                    (District Exclusive Hub){" "}
                  </span>
                  ★
                </Link>
              </li>
              <li>
                <Link
                  href={`/apply?package=platinum${cityQuery}`}
                  className="hover:text-brand-yellow text-slate-400 transition-colors block"
                >
                  Platinum Partner
                  <span className="hidden sm:inline">
                    {" "}
                    (Regional Master Hub)
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links — half width on mobile */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onOpenApplyModal?.("gold")}
                  className="hover:text-brand-yellow text-white font-bold transition-colors block text-left cursor-pointer"
                >
                  Online Vendor Application &rarr;
                </button>
              </li>
              <li>
                <Link
                  href="/vendor/login"
                  className="hover:text-brand-yellow text-amber-400 font-bold transition-colors block"
                >
                  Vendor Partner Login &rarr;
                </Link>
              </li>
              <li>
                <a
                  href={sectionHref("#packages")}
                  className="hover:text-brand-yellow transition-colors"
                >
                  Vendor Packages
                </a>
              </li>
              <li>
                <a
                  href={sectionHref("#overview")}
                  className="hover:text-brand-yellow transition-colors"
                >
                  Vendor Overview
                </a>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-brand-yellow transition-colors"
                >
                  Vendor Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/reviews"
                  className="hover:text-brand-yellow transition-colors"
                >
                  Partner Reviews
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="hover:text-brand-yellow transition-colors"
                >
                  Support Center
                </Link>
              </li>
              <li>
                <a
                  href={sectionHref("#faq")}
                  className="hover:text-brand-yellow transition-colors"
                >
                  Vendor FAQs
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    window.dispatchEvent(new Event("trigger-pwa-install"))
                  }
                  className="hover:text-brand-yellow text-brand-yellow font-bold transition-colors block text-left cursor-pointer"
                >
                  Download Vendor App &rarr;
                </button>
              </li>
            </ul>
          </div>

          {/* Helpdesk — full width on mobile, horizontal layout */}
          <div className="col-span-2 lg:col-span-1 space-y-3">
            <h4 className="text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider">
              Vendor Helpdesk
            </h4>
            <div className="flex flex-wrap lg:flex-col gap-x-4 gap-y-2 lg:gap-y-2.5 text-[11px] sm:text-xs text-slate-400">
              <a
                href="tel:6289952418"
                className="flex items-center gap-1.5 hover:text-brand-yellow transition-colors"
              >
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-yellow shrink-0" />
                <span>6289952418</span>
              </a>
              <a
                href="mailto:support@broomboomcabs.com"
                className="flex items-center gap-1.5 hover:text-brand-yellow transition-colors"
              >
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-yellow shrink-0" />
                <span>support@broomboomcabs.com</span>
              </a>
              <div className="flex items-start gap-1.5 w-full lg:w-auto">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-yellow shrink-0 mt-0.5" />
                <span className="leading-snug">{FULL_ADDRESS}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Service Cities ──────────────────────────────────────── */}
        <div className="py-3.5 border-b border-brand-black-border">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-x-4">
            <span className="text-white font-bold uppercase tracking-wider text-[10px] sm:text-[11px] shrink-0">
              Service Cities:
            </span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] sm:text-xs">
              {SERVICE_CITIES.map((city) => {
                const isActiveCity =
                  cityName?.toLowerCase() === city.name.toLowerCase();
                return (
                  <Link
                    key={city.slug}
                    href={`/${city.slug}`}
                    className={`transition-colors ${
                      isActiveCity
                        ? "text-brand-yellow font-black underline underline-offset-4"
                        : "text-slate-400 hover:text-brand-yellow"
                    }`}
                  >
                    {city.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Copyright ───────────────────────────────────────────── */}
        <div className="pt-4 sm:pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 text-[10px] sm:text-[11px] text-slate-500">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} BroomBoom Transportation Services
            Private Limited. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-slate-400">
            <a
              href="https://www.broomboomcabs.com/privacy-policy"
              className="hover:text-brand-yellow transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>
            <span>•</span>
            <a
              href="https://www.broomboomcabs.com/pilot-terms"
              className="hover:text-brand-yellow transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms &amp; Conditions
            </a>
          </div>
        </div>
      </div>
      <PwaInstallPrompt />
    </footer>
  );
};