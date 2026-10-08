import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin, ShieldCheck } from "lucide-react";

interface FooterProps {
  onOpenApplyModal?: (pkgId?: string) => void;
  onOpenBrochureModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenApplyModal, onOpenBrochureModal }) => {
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
                  href="/apply?package=silver"
                  className="hover:text-brand-yellow text-slate-400 transition-colors block text-left cursor-pointer"
                >
                  Silver Partner (₹5,000 • 75% OFF)
                </Link>
              </li>
              <li>
                <Link
                  href="/apply?package=gold"
                  className="hover:text-brand-yellow font-bold text-brand-yellow transition-colors block text-left cursor-pointer"
                >
                  Gold Partner (₹10,000 • 75% OFF) ★
                </Link>
              </li>
              <li>
                <Link
                  href="/apply?package=platinum"
                  className="hover:text-brand-yellow text-slate-400 transition-colors block text-left cursor-pointer"
                >
                  Platinum Partner (₹20,000 • 80% OFF • 0% Comm.)
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
                <a href="/#packages" className="hover:text-brand-yellow transition-colors">
                  Vendor Packages
                </a>
              </li>
              <li>
                <a href="#overview" className="hover:text-brand-yellow transition-colors">
                  Vendor Overview
                </a>
              </li>
              <li>
                <a href="#why-us" className="hover:text-brand-yellow transition-colors">
                  Why BroomBoom
                </a>
              </li>
              <li>
                <a href="#journey" className="hover:text-brand-yellow transition-colors">
                  Begin Your Journey
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-brand-yellow transition-colors">
                  Partner Stories
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-brand-yellow transition-colors">
                  Vendor FAQs
                </a>
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
                <span>India</span>
              </div>
            </div>
          </div>
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
    </footer>
  );
};