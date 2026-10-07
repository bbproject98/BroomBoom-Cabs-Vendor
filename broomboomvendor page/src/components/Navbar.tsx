"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  MapPin,
  ArrowRight,
  Download,
  User,
  LogOut,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { PartnerOtpModal } from "@/components/PartnerOtpModal";

interface NavbarProps {
  onOpenApplyModal?: (packageName?: string) => void;
  onOpenBrochureModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenApplyModal,
  onOpenBrochureModal,
}) => {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isPartnerVerified, setIsPartnerVerified] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [partnerProfile, setPartnerProfile] = useState<{
    name?: string;
    mobile?: string;
    planTier?: string;
    applicationId?: string;
  } | null>(null);

  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync verified partner state and profile details from localStorage
  const syncPartnerSession = () => {
    if (typeof window !== "undefined") {
      const isPaidDone =
        localStorage.getItem("bb_partner_payment_done") === "true";
      const cached = localStorage.getItem("bb_verified_partner_profile");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (
            parsed.isPaid ||
            parsed.userStatus === "PAID_UNDER_PROCESS" ||
            parsed.userStatus === "APPROVED" ||
            parsed.profile?.vendorMobile ||
            parsed.profile?.applicationId ||
            isPaidDone
          ) {
            setIsPartnerVerified(true);
            setPartnerProfile({
              name: parsed.profile?.vendorName || "Valued Partner",
              mobile: parsed.profile?.vendorMobile || "",
              planTier: parsed.plan?.name || "Active Partner",
              applicationId: parsed.profile?.applicationId || "",
            });
            return;
          }
        } catch {}
      }
      if (isPaidDone) {
        setIsPartnerVerified(true);
        setPartnerProfile({
          name: "Valued Partner",
          planTier: "Confirmed Partner Plan",
        });
        return;
      }
      setIsPartnerVerified(false);
      setPartnerProfile(null);
    }
  };

  useEffect(() => {
    syncPartnerSession();

    const handleVerified = () => syncPartnerSession();
    const handleLogoutEvent = () => {
      setIsPartnerVerified(false);
      setPartnerProfile(null);
      setProfileDropdownOpen(false);
    };
    const handleTriggerOtp = () => {
      setIsOtpModalOpen(true);
    };

    window.addEventListener("partner-profile-verified", handleVerified);
    window.addEventListener("partner-profile-logout", handleLogoutEvent);
    window.addEventListener("trigger-open-profile-otp", handleTriggerOtp);
    return () => {
      window.removeEventListener("partner-profile-verified", handleVerified);
      window.removeEventListener("partner-profile-logout", handleLogoutEvent);
      window.removeEventListener("trigger-open-profile-otp", handleTriggerOtp);
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    };
    if (profileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownOpen]);

  const handleProfileClick = () => {
    if (isPartnerVerified) {
      setProfileDropdownOpen((prev) => !prev);
    } else {
      setIsOtpModalOpen(true);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("bb_verified_partner_profile");
      localStorage.removeItem("bb_partner_payment_done");
      localStorage.removeItem("bb_partner_thankyou_url");
      localStorage.removeItem("bb_partner_paid_appid");
      window.dispatchEvent(new Event("partner-profile-logout"));
    }
    setIsPartnerVerified(false);
    setPartnerProfile(null);
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    if (typeof window !== "undefined" && window.location.pathname.includes("/thank-you")) {
      router.push("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white transition-all duration-300">
      {/* Main Navigation Bar */}
      <nav
        className={`w-full transition-all duration-300 ${
          scrolled ? "shadow-md" : "shadow-sm"
        }`}
      >
        {/* ========================================================================= */}
        {/* 1. LAPTOP & DESKTOP NAVIGATION (lg: 1024px and above)                     */}
        {/* ========================================================================= */}
        <div className="hidden lg:flex items-center justify-between h-16 max-w-7xl mx-auto px-4 sm:px-6 gap-2">
          {/* Brand Logo with "Vendor" badge */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="relative w-9 h-9 xl:w-10 xl:h-10 rounded-full overflow-hidden border-2 border-brand-yellow shadow-sm group-hover:scale-105 transition-transform bg-white flex items-center justify-center p-0.5">
              <Image
                src="/broomboom-logo.png"
                alt="BroomBoom Vendor Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex items-baseline gap-1 xl:gap-1.5">
              <span className="text-lg xl:text-xl font-black tracking-tight text-slate-950">
                Broom<span className="text-brand-yellow-dark">Boom</span>
              </span>
              <span className="text-xs font-semibold text-slate-300">|</span>
              <span className="text-[10px] xl:text-xs font-bold text-slate-700">Vendor</span>
            </div>
          </Link>

          {/* Desktop In-Page Navigation Links */}
          <div className="flex items-center gap-2 xl:gap-4 text-[11px] xl:text-xs font-bold text-slate-700 whitespace-nowrap">
            <a
              href="/#packages"
              className="hover:text-amber-800 transition-colors py-1"
            >
              Packages
            </a>
            <a
              href="/#overview"
              className="hover:text-amber-800 transition-colors py-1"
            >
              Overview
            </a>
            <a
              href="/#why-us"
              className="hover:text-amber-800 transition-colors py-1"
            >
              Why Us
            </a>
            <a
              href="/#journey"
              className="hover:text-amber-800 transition-colors py-1"
            >
              Journey
            </a>
            <a
              href="/#testimonials"
              className="hover:text-amber-800 transition-colors py-1"
            >
              Reviews
            </a>
            <a
              href="/#faq"
              className="hover:text-amber-800 transition-colors py-1"
            >
              FAQs
            </a>
          </div>

          {/* Desktop Right Action Buttons */}
          <div className="flex items-center gap-1.5 xl:gap-2 shrink-0">
            {/* Install App Button (Visible on wide laptop screens) */}
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new Event("trigger-pwa-install"));
                }
              }}
              className="hidden xl:flex items-center gap-1.5 text-[11px] xl:text-xs font-bold text-slate-700 hover:text-amber-800 border border-slate-300 hover:border-amber-400 px-2.5 py-1.5 xl:px-3 xl:py-2 rounded-xl transition-all cursor-pointer bg-white shadow-xs whitespace-nowrap"
              title="Install BroomBoom App"
            >
              <Download className="w-3.5 h-3.5 text-amber-500" />
              <span>Install App</span>
            </button>

            {/* Store Locator Link */}
            <Link
              href="/store-locator"
              className="flex items-center gap-1.5 text-[11px] xl:text-xs font-semibold text-slate-700 hover:text-brand-yellow-dark border border-slate-300 hover:border-brand-yellow-dark px-2.5 py-1.5 xl:px-3 xl:py-2 rounded-xl transition-all whitespace-nowrap"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>Store Locator</span>
            </Link>

            {/* Primary JOIN NOW CTA */}
            <Link
              href="/apply?package=gold"
              className="bg-brand-yellow hover:bg-brand-yellow-hover text-black text-[11px] xl:text-xs font-black px-3 py-1.5 xl:px-4 xl:py-2 rounded-xl shadow-md hover:shadow-yellow-glow transition-all flex items-center gap-1.5 group transform active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <span>JOIN NOW</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Track Application & Partner Profile with Logout Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                type="button"
                onClick={handleProfileClick}
                className="relative flex items-center gap-1.5 bg-slate-950 hover:bg-slate-900 text-amber-400 border border-amber-400/80 hover:border-amber-400 px-2 py-1.5 xl:px-3 xl:py-2 rounded-xl shadow-sm hover:shadow-md transition-all transform active:scale-95 cursor-pointer group shrink-0 whitespace-nowrap"
                title={isPartnerVerified ? "My Profile & Account Options" : "Validate Mobile to Track Application"}
                aria-label="Track Application & Partner Profile"
              >
                <div className="relative">
                  <User className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span
                    className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ring-2 ring-slate-950 ${
                      isPartnerVerified ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                    }`}
                  />
                </div>
                <span className="text-[11px] xl:text-xs font-black uppercase tracking-wider text-slate-100 hidden xl:inline">
                  {isPartnerVerified ? "My Profile" : "Track Profile"}
                </span>
                {isPartnerVerified && (
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-amber-400 transition-transform hidden xl:inline ${
                      profileDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>

              {/* Desktop Profile Dropdown with Logout */}
              {isPartnerVerified && profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-amber-300 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="bg-amber-50/80 rounded-xl p-3 border border-amber-200/80 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-black text-sm shrink-0 border border-amber-400/40">
                        {partnerProfile?.name ? partnerProfile.name.charAt(0).toUpperCase() : "P"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-black text-slate-950 truncate">
                          {partnerProfile?.name || "Valued Partner"}
                        </h4>
                        <p className="text-[11px] text-amber-900 font-bold truncate">
                          {partnerProfile?.planTier || "Active Partner Plan"}
                        </p>
                        {partnerProfile?.applicationId && (
                          <span className="text-[10px] text-slate-500 font-mono block">
                            Ref: {partnerProfile.applicationId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/thank-you?from=profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold text-slate-800 hover:text-slate-950 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>View Plan &amp; Thank You Page</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Log Out Profile</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. MOBILE & TABLET NAVIGATION (Below lg: < 1024px)                       */}
        {/* ========================================================================= */}
        <div className="lg:hidden flex items-center justify-between min-h-[56px] h-14 sm:h-16 py-2 px-3 sm:px-5">
          {/* Brand Logo with "Vendor" badge */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-brand-yellow shadow-sm bg-white flex items-center justify-center p-0.5">
              <Image
                src="/broomboom-logo.png"
                alt="BroomBoom Vendor Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-950">
                Broom<span className="text-brand-yellow-dark">Boom</span>
              </span>
              <span className="text-xs text-slate-300 font-semibold">|</span>
              <span className="text-[11px] sm:text-xs font-bold text-slate-700">Vendor</span>
            </div>
          </Link>

          {/* Right Action Group: JOIN NOW + Profile Tracker Icon + Hamburger Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Primary JOIN NOW Button */}
            <Link
              href="/apply?package=gold"
              className="bg-brand-yellow hover:bg-brand-yellow-hover text-slate-950 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-xs text-xs font-black tracking-wide flex items-center gap-1 transform active:scale-95 transition-transform cursor-pointer"
            >
              <span>JOIN NOW</span>
              <ArrowRight className="w-3 h-3" />
            </Link>

            {/* Partner Profile Tracker Icon Button (Placed AFTER JOIN NOW) */}
            <button
              type="button"
              onClick={() => {
                if (isPartnerVerified) {
                  setMobileMenuOpen((prev) => !prev);
                } else {
                  setIsOtpModalOpen(true);
                }
              }}
              className="w-9 h-9 rounded-xl bg-slate-950 hover:bg-slate-900 border border-amber-400/80 text-amber-400 flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-all relative shrink-0"
              title={isPartnerVerified ? "My Profile & Account Options" : "Validate Mobile to Track Application"}
              aria-label="Track Application & Partner Profile"
            >
              <User className="w-4 h-4 text-amber-400" />
              <span
                className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ring-1 ring-slate-950 ${
                  isPartnerVerified ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                }`}
              />
            </button>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 rounded-xl text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors border border-slate-200 cursor-pointer shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. MOBILE DROPDOWN DRAWER (Clean, Spacious, Tap-Friendly)                 */}
        {/* ========================================================================= */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3 shadow-2xl animate-in slide-in-from-top duration-200 max-h-[calc(100vh-64px)] overflow-y-auto">
            {/* Prominent Track Application & Profile Card */}
            {isPartnerVerified ? (
              <div className="bg-gradient-to-r from-amber-100/90 via-amber-50 to-yellow-100/80 rounded-2xl border border-amber-300 p-3.5 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center border border-amber-400/50 shadow-xs shrink-0 font-black text-xs">
                      {partnerProfile?.name ? partnerProfile.name.charAt(0).toUpperCase() : "P"}
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-950 block">
                        {partnerProfile?.name || "My Partner Profile"}
                      </span>
                      <span className="text-[11px] text-amber-900 font-bold block">
                        {partnerProfile?.planTier || "Active Partner Plan"}
                      </span>
                      {partnerProfile?.applicationId && (
                        <span className="text-[10px] text-slate-500 font-mono block">
                          Ref: {partnerProfile.applicationId}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 border border-emerald-300 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    ACTIVE
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-200/80">
                  <Link
                    href="/thank-you?from=profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-950 text-amber-400 text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-transform"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>View Plan</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-colors cursor-pointer active:scale-95"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsOtpModalOpen(true);
                }}
                className="w-full flex items-center justify-between font-black text-amber-950 bg-gradient-to-r from-amber-100/90 via-amber-50 to-yellow-100/80 hover:from-amber-100 hover:to-yellow-100 px-4 py-3 rounded-2xl border border-amber-300 shadow-xs transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center border border-amber-400/50 shadow-xs shrink-0">
                    <User className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-xs font-black block text-slate-950">
                      Track Application &amp; Partner Profile
                    </span>
                    <span className="text-[10.5px] text-amber-800 font-semibold block mt-0.5">
                      Check territory status &amp; OTP validation
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-800" />
              </button>
            )}

            {/* Navigation Section Links */}
            <div className="space-y-1 pt-1">
              <a
                href="/#packages"
                onClick={() => setMobileMenuOpen(false)}
                className="block font-semibold text-slate-800 hover:text-amber-800 py-2 border-b border-slate-100 text-sm"
              >
                Vendor Packages (Silver, Gold, Platinum)
              </a>
              <a
                href="/#overview"
                onClick={() => setMobileMenuOpen(false)}
                className="block font-semibold text-slate-800 hover:text-amber-800 py-2 border-b border-slate-100 text-sm"
              >
                Vendor Overview &amp; Services
              </a>
              <a
                href="/#why-us"
                onClick={() => setMobileMenuOpen(false)}
                className="block font-semibold text-slate-800 hover:text-amber-800 py-2 border-b border-slate-100 text-sm"
              >
                Why BroomBoom
              </a>
              <a
                href="/#journey"
                onClick={() => setMobileMenuOpen(false)}
                className="block font-semibold text-slate-800 hover:text-amber-800 py-2 border-b border-slate-100 text-sm"
              >
                Begin Your Journey
              </a>
              <a
                href="/#testimonials"
                onClick={() => setMobileMenuOpen(false)}
                className="block font-semibold text-slate-800 hover:text-amber-800 py-2 border-b border-slate-100 text-sm"
              >
                Partner Stories &amp; Reviews
              </a>
              <a
                href="/#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="block font-semibold text-slate-800 hover:text-amber-800 py-2 border-b border-slate-100 text-sm"
              >
                Frequently Asked Questions
              </a>
            </div>

            {/* Secondary Action Links: Store Locator & App Install */}
            <div className="pt-2 space-y-2">
              <Link
                href="/store-locator"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 font-bold text-slate-800 hover:text-brand-yellow-dark p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
              >
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>Store &amp; Fleet Hub Locator</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("trigger-pwa-install"));
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-xl font-black text-xs border border-amber-400/40 shadow-xs cursor-pointer transition-all"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Install BroomBoom Vendor App</span>
              </button>
            </div>

            {/* Primary Full-Width JOIN NOW Button */}
            <div className="pt-2">
              <Link
                href="/apply?package=gold"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 bg-brand-yellow hover:bg-brand-yellow-hover text-black rounded-xl font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>JOIN NOW AS A PARTNER</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Partner Identity Verification & OTP Modal */}
      <PartnerOtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
      />
    </header>
  );
};