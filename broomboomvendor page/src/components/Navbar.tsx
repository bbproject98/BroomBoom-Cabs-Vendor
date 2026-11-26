"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  X,
  MapPin,
  ArrowRight,
  User,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { SERVICE_CITIES } from "@/data/serviceCities";

interface NavbarProps {
  onOpenApplyModal?: (packageName?: string) => void;
  onOpenBrochureModal?: () => void;
  cityName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenApplyModal,
  onOpenBrochureModal,
  cityName,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(
    Boolean(pathname?.startsWith("/services"))
  );
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [isPartnerVerified, setIsPartnerVerified] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [partnerProfile, setPartnerProfile] = useState<{
    name?: string;
    mobile?: string;
    planTier?: string;
    applicationId?: string;
  } | null>(null);

  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const servicesDropdownRef = useRef<HTMLDivElement>(null);

  const handleJoinNowClick = () => {
    setMobileMenuOpen(false);
    if (onOpenApplyModal) {
      onOpenApplyModal("gold");
    } else {
      const cityQuery = cityName ? `&city=${encodeURIComponent(cityName)}` : "";
      router.push(`/apply?package=gold${cityQuery}`);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

    window.addEventListener("partner-profile-verified", handleVerified);
    window.addEventListener("partner-profile-logout", handleLogoutEvent);
    return () => {
      window.removeEventListener("partner-profile-verified", handleVerified);
      window.removeEventListener("partner-profile-logout", handleLogoutEvent);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
      if (
        servicesDropdownRef.current &&
        !servicesDropdownRef.current.contains(e.target as Node)
      ) {
        setServicesDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setProfileDropdownOpen(false);
        setServicesDropdownOpen(false);
      }
    };
    if (profileDropdownOpen || servicesDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileDropdownOpen, servicesDropdownOpen]);

  useEffect(() => {
    setServicesDropdownOpen(false);
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleProfileClick = () => {
    if (isPartnerVerified) setProfileDropdownOpen((p) => !p);
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
    if (
      typeof window !== "undefined" &&
      window.location.pathname.includes("/thank-you")
    ) {
      router.push("/");
    }
  };

  // Shared style tokens
  const navLinkBase =
    "relative px-3 py-2 text-[11px] xl:text-xs font-bold rounded-lg transition-all duration-200 whitespace-nowrap";
  const navLinkIdle =
    "text-slate-700 hover:text-amber-800 hover:bg-amber-50/80";
  const navLinkActive = "text-amber-800 bg-amber-50/90";

  return (
    <header
      className={`sticky top-0 z-[60] w-full transition-all duration-300 border-b ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-amber-200/70 shadow-[0_8px_30px_rgba(15,23,42,0.08)]"
          : "bg-white/98 backdrop-blur-md border-transparent shadow-[0_1px_0_rgba(15,23,42,0.04)]"
      }`}
    >
      <nav className="w-full transition-all duration-300">
        {/* ========================================================================= */}
        {/* 1. DESKTOP NAVIGATION                                                     */}
        {/* ========================================================================= */}
        <div
          className={`hidden lg:flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 gap-3 transition-all duration-300 ${
            scrolled ? "h-14" : "h-16"
          }`}
        >
          {/* Brand logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative w-10 h-10 rounded-full p-[2px] bg-gradient-to-br from-brand-yellow via-amber-300 to-brand-yellow-dark shadow-md group-hover:shadow-lg group-hover:shadow-amber-300/40 transition-all duration-300 group-hover:scale-105">
              <div className="relative w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center p-0.5">
                <Image
                  src="/logo.png"
                  alt="broomboom-cabs-logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg xl:text-xl font-black tracking-tight text-slate-950">
                BroomBoom <span className="text-brand-yellow-dark"> Cabs</span>
              </span>
              <span className="text-xs font-light text-slate-300">|</span>
              <span className="text-[10px] xl:text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Vendor
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1 xl:gap-1.5 whitespace-nowrap">
            <Link
              href="/"
              className={`${navLinkBase} ${
                pathname === "/" ? navLinkActive : navLinkIdle
              }`}
            >
              Home
            </Link>

            {/* Services dropdown */}
            <div
              className="relative"
              ref={servicesDropdownRef}
              onMouseEnter={() => setServicesDropdownOpen(true)}
              onMouseLeave={() => setServicesDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setServicesDropdownOpen((p) => !p)}
                aria-expanded={servicesDropdownOpen}
                aria-haspopup="true"
                className={`${navLinkBase} flex items-center gap-1.5 cursor-pointer ${
                  pathname?.startsWith("/services")
                    ? navLinkActive
                    : navLinkIdle
                }`}
              >
                <span>Services</span>
                {cityName && (
                  <span className="hidden xl:inline-flex items-center bg-gradient-to-r from-amber-400 to-brand-yellow text-amber-950 border border-amber-500/30 text-[10px] font-black px-2 py-0.5 rounded-full leading-none shadow-sm">
                    {cityName}
                  </span>
                )}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    servicesDropdownOpen
                      ? "rotate-180 text-amber-700"
                      : "text-slate-400"
                  }`}
                />
              </button>

              {servicesDropdownOpen && (
                <div className="absolute left-0 top-full pt-3 w-72 z-[70] animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="bg-white rounded-2xl border border-amber-200 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.25)] overflow-hidden">
                    {/* header */}
                    <div className="px-3.5 py-2.5 bg-gradient-to-r from-amber-50 to-yellow-50/60 border-b border-amber-100 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-amber-600" />
                        Service Cities
                      </span>
                      <span className="text-[10px] font-bold text-amber-700/70 bg-white px-2 py-0.5 rounded-full border border-amber-200/70">
                        {SERVICE_CITIES.length} Hubs
                      </span>
                    </div>

                    <div className="p-1.5 space-y-0.5">
                      {SERVICE_CITIES.map((city) => {
                        const isActiveCity =
                          pathname === `/${city.slug}` ||
                          pathname === `/services/${city.slug}` ||
                          cityName?.toLowerCase() === city.name.toLowerCase();
                        return (
                          <Link
                            key={city.slug}
                            href={`/${city.slug}`}
                            onClick={() => setServicesDropdownOpen(false)}
                            className={`group/item flex items-center justify-between px-2.5 py-2 rounded-xl transition-all duration-150 ${
                              isActiveCity
                                ? "bg-amber-50 border border-amber-300/80"
                                : "hover:bg-amber-50/70"
                            }`}
                          >
                            <span className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0 transition-colors ${
                                  isActiveCity
                                    ? "bg-amber-400 text-amber-950"
                                    : "bg-slate-100 text-slate-500 group-hover/item:bg-amber-200/70 group-hover/item:text-amber-800"
                                }`}
                              >
                                <MapPin className="w-3.5 h-3.5" />
                              </span>
                              <span className="truncate">
                                <span className="text-xs font-extrabold block leading-tight text-slate-900">
                                  {city.name}
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium block leading-tight">
                                  {city.state}
                                </span>
                              </span>
                            </span>
                            {isActiveCity ? (
                              <span className="text-[9px] font-black uppercase bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded tracking-wide">
                                Active
                              </span>
                            ) : (
                              <ArrowRight className="w-3 h-3 text-slate-300 group-hover/item:text-amber-600 group-hover/item:translate-x-0.5 transition-all" />
                            )}
                          </Link>
                        );
                      })}
                    </div>

                    <div className="p-1.5 border-t border-slate-100">
                      <Link
                        href="/services"
                        onClick={() => setServicesDropdownOpen(false)}
                        className="flex items-center justify-between px-3 py-2 text-[11px] font-black text-amber-800 hover:bg-amber-50 rounded-xl transition-colors"
                      >
                        <span>View All Service Cities</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/blog"
              className={`${navLinkBase} ${
                pathname?.startsWith("/blog") ? navLinkActive : navLinkIdle
              }`}
            >
              Blog
            </Link>
            <Link
              href="/reviews"
              className={`${navLinkBase} ${
                pathname?.startsWith("/reviews") || pathname === "/review"
                  ? navLinkActive
                  : navLinkIdle
              }`}
            >
              Reviews
            </Link>
            <Link
              href="/support"
              className={`${navLinkBase} ${
                pathname?.startsWith("/support") ? navLinkActive : navLinkIdle
              }`}
            >
              Support
            </Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* JOIN NOW */}
            <button
              type="button"
              onClick={handleJoinNowClick}
              className="group relative overflow-hidden bg-gradient-to-br from-brand-yellow via-brand-yellow to-brand-yellow-hover hover:from-brand-yellow-hover hover:to-brand-yellow-dark text-slate-950 text-[11px] xl:text-xs font-black px-4 py-2 rounded-xl shadow-[0_4px_14px_rgba(251,191,36,0.35)] hover:shadow-[0_6px_20px_rgba(251,191,36,0.5)] transition-all flex items-center gap-1.5 transform active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <span className="relative z-10">JOIN NOW</span>
              <ArrowRight className="relative z-10 w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </button>

            {/* Verified Partner Profile */}
            {isPartnerVerified && (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  type="button"
                  onClick={handleProfileClick}
                  className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-slate-950 to-slate-800 hover:from-slate-900 hover:to-slate-700 text-amber-400 border border-amber-400/60 hover:border-amber-400 rounded-xl shadow-sm hover:shadow-md hover:shadow-amber-400/20 transition-all transform active:scale-95 cursor-pointer group"
                  title="My Profile & Account Options"
                  aria-label="Partner Profile"
                >
                  <User className="w-4 h-4 xl:w-5 xl:h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white bg-emerald-400 animate-pulse" />
                </button>

                {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2.5 w-72 z-[70] animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="bg-white rounded-2xl border border-amber-200 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.25)] overflow-hidden">
                    <div className="bg-gradient-to-br from-amber-50 via-yellow-50/60 to-amber-50/40 p-3.5 border-b border-amber-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-950 to-slate-800 text-amber-400 flex items-center justify-center font-black text-sm shrink-0 border border-amber-400/40 shadow-sm">
                          {partnerProfile?.name
                            ? partnerProfile.name.charAt(0).toUpperCase()
                            : "P"}
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

                    <div className="p-1.5 space-y-0.5">
                      <Link
                        href="/thank-you?from=profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="group/item flex items-center justify-between w-full px-3 py-2.5 text-xs font-bold text-slate-800 hover:text-slate-950 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>View Plan &amp; Thank You Page</span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover/item:text-amber-700 group-hover/item:translate-x-0.5 transition-all" />
                      </Link>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Log Out Profile</span>
                      </button>
                    </div>
                  </div>
                </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. MOBILE / TABLET BAR                                                    */}
        {/* ========================================================================= */}
        <div
          className={`lg:hidden flex items-center justify-between gap-1.5 px-2.5 sm:px-5 transition-all duration-300 ${
            scrolled ? "h-14" : "h-16"
          }`}
        >
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink-0">
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full p-[2px] bg-gradient-to-br from-brand-yellow via-amber-300 to-brand-yellow-dark shadow-sm shrink-0">
              <div className="relative w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center p-0.5">
                <Image
                  src="/logo.png"
                  alt="broomboom-cabs-logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <div className="flex items-baseline gap-1 whitespace-nowrap">
              <span className="text-sm sm:text-lg font-black tracking-tight text-slate-950">
                BroomBoom<span className="text-brand-yellow-dark"> Cabs</span>
              </span>
              <span className="text-xs text-slate-300 font-light">|</span>
              <span className="text-[9.5px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Vendor
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleJoinNowClick}
              className="bg-gradient-to-br from-brand-yellow to-brand-yellow-hover hover:from-brand-yellow-hover hover:to-brand-yellow-dark text-slate-950 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-sm text-[10.5px] sm:text-xs font-black tracking-wide flex items-center gap-1 transform active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>JOIN NOW</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            {isPartnerVerified && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen((p) => !p)}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-950 to-slate-800 border border-amber-400/70 text-amber-400 flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-all relative shrink-0"
                title="My Profile & Account Options"
                aria-label="Partner Profile"
              >
                <User className="w-4 h-4 text-amber-400" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full ring-2 ring-white bg-emerald-400 animate-pulse" />
              </button>
            )}

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
        {/* 3. MOBILE DRAWER                                                          */}
        {/* ========================================================================= */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white/98 backdrop-blur-lg border-t border-slate-200 px-4 py-4 space-y-3 shadow-2xl animate-in slide-in-from-top duration-200 max-h-[calc(100vh-64px)] overflow-y-auto">
            {isPartnerVerified && (
              <div className="bg-gradient-to-br from-amber-100/90 via-amber-50 to-yellow-100/70 rounded-2xl border border-amber-300 p-3.5 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-950 to-slate-800 text-amber-400 flex items-center justify-center border border-amber-400/50 shadow-sm shrink-0 font-black text-xs">
                      {partnerProfile?.name
                        ? partnerProfile.name.charAt(0).toUpperCase()
                        : "P"}
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
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-br from-slate-950 to-slate-800 text-amber-400 text-xs font-bold rounded-xl shadow-sm active:scale-95 transition-transform"
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
            )}

            {/* Nav links */}
            <div className="space-y-1 pt-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 pt-1 pb-1">
                Navigate
              </p>

              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block font-semibold text-slate-800 hover:text-amber-800 hover:bg-amber-50/60 rounded-lg px-3 py-2.5 text-sm transition-colors"
              >
                Home
              </Link>

              <div className="rounded-lg">
                <button
                  type="button"
                  onClick={() => setMobileServicesOpen((p) => !p)}
                  className="w-full flex items-center justify-between px-3 py-2.5 font-semibold text-slate-800 hover:text-amber-800 hover:bg-amber-50/60 rounded-lg text-sm cursor-pointer transition-colors"
                  aria-expanded={mobileServicesOpen}
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-600" />
                    <span>Services</span>
                    {cityName && (
                      <span className="inline-flex items-center text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 leading-none rounded-full">
                        {cityName}
                      </span>
                    )}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                      mobileServicesOpen ? "rotate-180 text-amber-700" : ""
                    }`}
                  />
                </button>

                {mobileServicesOpen && (
                  <div className="mt-1.5 mb-2 px-1 grid grid-cols-2 gap-1.5">
                    {SERVICE_CITIES.map((city) => {
                      const isActiveCity =
                        pathname === `/${city.slug}` ||
                        pathname === `/services/${city.slug}` ||
                        cityName?.toLowerCase() === city.name.toLowerCase();
                      return (
                        <Link
                          key={city.slug}
                          href={`/${city.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-bold transition-colors ${
                            isActiveCity
                              ? "bg-amber-50 border-amber-400 text-amber-950 shadow-sm"
                              : "bg-slate-50 border-slate-200 text-slate-800 hover:border-amber-300 hover:bg-amber-50/50"
                          }`}
                        >
                          <MapPin
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isActiveCity ? "text-amber-600" : "text-slate-400"
                            }`}
                          />
                          <span className="truncate">{city.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              <Link
                href="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className={`block font-semibold rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  pathname?.startsWith("/blog")
                    ? "text-amber-800 bg-amber-50/90 font-bold"
                    : "text-slate-800 hover:text-amber-800 hover:bg-amber-50/60"
                }`}
              >
                Blog
              </Link>
              <Link
                href="/reviews"
                onClick={() => setMobileMenuOpen(false)}
                className={`block font-semibold rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  pathname?.startsWith("/reviews") || pathname === "/review"
                    ? "text-amber-800 bg-amber-50/90 font-bold"
                    : "text-slate-800 hover:text-amber-800 hover:bg-amber-50/60"
                }`}
              >
                Reviews
              </Link>
              <Link
                href="/support"
                onClick={() => setMobileMenuOpen(false)}
                className={`block font-semibold rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  pathname?.startsWith("/support")
                    ? "text-amber-800 bg-amber-50/90 font-bold"
                    : "text-slate-800 hover:text-amber-800 hover:bg-amber-50/60"
                }`}
              >
                Support
              </Link>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleJoinNowClick}
                className="w-full py-3 bg-gradient-to-br from-brand-yellow via-brand-yellow to-brand-yellow-hover hover:from-brand-yellow-hover hover:to-brand-yellow-dark text-black rounded-xl font-black text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>JOIN NOW AS A PARTNER</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};