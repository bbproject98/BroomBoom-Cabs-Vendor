"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Mail, MapPin, ShieldCheck } from "lucide-react";
import { SERVICE_CITIES } from "@/data/serviceCities";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";

interface FooterProps {
  onOpenApplyModal?: (pkgId?: string) => void;
  onOpenBrochureModal: () => void;
  cityName?: string;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenApplyModal,
  onOpenBrochureModal,
  cityName,
}) => {
  const pathname = usePathname();
  const cityQuery = cityName ? `&city=${encodeURIComponent(cityName)}` : "";
  const isLandingOrCityPage =
    pathname === "/" || pathname?.startsWith("/services/");
  const sectionHref = (hash: string) =>
    isLandingOrCityPage ? hash : `/${hash}`;
  return (
    <footer className="bg-brand-black-pure text-slate-300 pt-8 sm:pt-10 pb-16 md:pb-10 border-t border-brand-black-border text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 lg:gap-6 pb-6 border-b border-brand-black-border">
          {/* Col 1: Brand Info with Logo */}
          <div className="lg:col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-brand-yellow shadow-yellow-glow shrink-0 bg-white flex items-center justify-center p-0.5">
                <Image
                  src="/broomboom-logo.png"
                  alt="BroomBoom Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-white">
                  Broom<span className="text-brand-yellow">Boom</span>
                </span>
                <span className="ml-2 bg-brand-yellow text-black text-[10px] font-black px-1.5 py-0.5 rounded uppercase">
                  Vendor
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              BroomBoom is India&apos;s rapidly expanding mobility, cab aggregation, and outstation travel ecosystem. Empowering local vendors with cutting-edge tech, protected territories, and high daily revenues.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-brand-yellow" />
              <span>Government Recognized &amp; Startup India Certified</span>
            </div>
          </div>

          {/* Col 2: The 3 Packages */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              3 Vendor Packages
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href={`/apply?package=silver${cityQuery}`}
                  className="hover:text-brand-yellow text-slate-400 transition-colors block text-left cursor-pointer"
                >
                  Silver Partner (Express Booking Kiosk)
                </Link>
              </li>
              <li>
                <Link
                  href={`/apply?package=gold${cityQuery}`}
                  className="hover:text-brand-yellow font-bold text-brand-yellow transition-colors block text-left cursor-pointer"
                >
                  Gold Partner (District Exclusive Hub) ★
                </Link>
              </li>
              <li>
                <Link
                  href={`/apply?package=platinum${cityQuery}`}
                  className="hover:text-brand-yellow text-slate-400 transition-colors block text-left cursor-pointer"
                >
                  Platinum Partner (Regional Master Hub)
                </Link>
              </li>
              <li className="pt-1">
                <button
                  onClick={onOpenBrochureModal}
                  className="text-brand-yellow font-bold hover:underline cursor-pointer"
                >
                  Download Prospectus PDF
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onOpenApplyModal?.("gold")}
                  className="hover:text-brand-yellow text-white font-bold transition-colors block text-left cursor-pointer"
                >
                  Online Vendor Application &rarr;
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new Event("trigger-open-profile-otp"));
                  }}
                  className="hover:text-brand-yellow text-amber-400 font-bold transition-colors block text-left cursor-pointer"
                >
                  My Profile &amp; Plan Status &rarr;
                </button>
              </li>
              <li>
                <a href={sectionHref("#packages")} className="hover:text-brand-yellow transition-colors">
                  Vendor Packages
                </a>
              </li>
              <li>
                <a href={sectionHref("#overview")} className="hover:text-brand-yellow transition-colors">
                  Vendor Overview
                </a>
              </li>
              <li>
                <Link href="/blog" className="hover:text-brand-yellow transition-colors">
                  Vendor Blog &amp; Playbooks
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-brand-yellow transition-colors">
                  Partner Reviews
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-brand-yellow transition-colors">
                  Vendor Support Center
                </Link>
              </li>
              <li>
                <a href={sectionHref("#faq")} className="hover:text-brand-yellow transition-colors">
                  Vendor FAQs
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new Event("trigger-pwa-install"))}
                  className="hover:text-brand-yellow text-brand-yellow font-bold transition-colors block text-left cursor-pointer"
                >
                  Download Vendor App &rarr;
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Helpline */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Vendor Helpdesk</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <a
                href="tel:62899524182706600"
                className="flex items-center gap-2 hover:text-brand-yellow transition-colors"
              >
                <Phone className="w-4 h-4 text-brand-yellow shrink-0" />
                <span>6289952418</span>
              </a>
              <a
                href="mailto:support@broomboomcabs.com"
                className="flex items-center gap-2 hover:text-brand-yellow transition-colors"
              >
                <Mail className="w-4 h-4 text-brand-yellow shrink-0" />
                <span>support@broomboomcabs.com</span>
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-yellow shrink-0 mt-0.5" />
                <span>{cityName ? `${cityName}, India` : "India"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Service Cities Directory Bar */}
        <div className="py-3.5 border-b border-brand-black-border flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          <span className="text-white font-bold uppercase tracking-wider text-[11px]">
            Service Cities:
          </span>
          {SERVICE_CITIES.map((city) => {
            const isActiveCity =
              cityName?.toLowerCase() === city.name.toLowerCase();
            return (
              <Link
                key={city.slug}
                href={`/services/${city.slug}`}
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

        {/* Disclaimer & Copyright */}
        <div className="pt-4 sm:pt-5 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>
            © {new Date().getFullYear()} BroomBoom Transportation Services Private Limited. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
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
            <span>•</span>
            <span className="hover:text-brand-yellow cursor-pointer">Disclaimers</span>
          </div>
        </div>

        <div className="mt-2.5 text-[10px] text-slate-600 text-center md:text-left">
          *Disclaimer: Revenue projections, returns, and timelines shown on this portal are estimates calculated using standard market averages and are subject to location viability, seasonal travel demand, and local operational execution.
        </div>
      </div>
      <PwaInstallPrompt />
    </footer>
  );
};