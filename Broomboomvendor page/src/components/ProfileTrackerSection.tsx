"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Phone,
  KeyRound,
  CheckCircle2,
  Clock,
  ArrowRight,
  User,
  MapPin,
  FileText,
  CreditCard,
  Building,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Mail,
  MessageCircle,
  LogIn,
  Eye,
  EyeOff,
  RefreshCw,
  LogOut,
} from "lucide-react";

interface ProfileData {
  vendorName: string;
  vendorMobile: string;
  vendorEmail: string;
  city: string;
  state: string;
  applicationId: string;
  spaceStatus: string;
  carpetArea: string;
  appliedAt: string | Date;
}

interface PlanData {
  tier: string;
  name: string;
  baseAmount: number;
  gatewayFee: number;
  gstAmount: number;
  totalAmount: number;
  territoryScope: string;
  hasExclusivity: boolean;
  paymentStatus: string;
  subscriptionId: string;
  orderId: string;
}

interface AdminValidationData {
  status: "IN_PROCESS" | "APPROVED";
  isAdminValidated: boolean;
  title: string;
  badgeLabel: string;
  description: string;
  step: number;
  thankYouUrl: string;
  credentials: {
    userId: string;
    password: string;
    loginUrl: string;
  };
}

export const ProfileTrackerSection: React.FC = () => {
  const [mobile, setMobile] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [simulatedSmsOtp, setSimulatedSmsOtp] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Profile data once verified
  const [isVerified, setIsVerified] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [adminValidation, setAdminValidation] = useState<AdminValidationData | null>(null);

  // Credentials visibility & copy state
  const [showPassword, setShowPassword] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Timer countdown & localStorage sync
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Load verified session from localStorage and listen for updates
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("bb_verified_partner_profile");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.profile && parsed.plan && parsed.adminValidation) {
            setProfile(parsed.profile);
            setPlan(parsed.plan);
            setAdminValidation(parsed.adminValidation);
            setIsVerified(true);
          }
        } catch {}
      }

      const handleVerifiedEvent = (e: any) => {
        if (e.detail) {
          setProfile(e.detail.profile);
          setPlan(e.detail.plan);
          setAdminValidation(e.detail.adminValidation);
          setIsVerified(true);
        }
      };

      const handleLogoutEvent = () => {
        setIsVerified(false);
        setProfile(null);
        setPlan(null);
        setAdminValidation(null);
        setOtpSent(false);
        setOtp("");
      };

      const handleOpenProfileOtp = () => {
        const el = document.getElementById("profile");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          const inp = el.querySelector("input");
          if (inp) {
            setTimeout(() => inp.focus(), 500);
          }
        }
      };

      window.addEventListener("partner-profile-verified", handleVerifiedEvent);
      window.addEventListener("partner-profile-logout", handleLogoutEvent);
      window.addEventListener("trigger-open-profile-otp", handleOpenProfileOtp);

      return () => {
        window.removeEventListener("partner-profile-verified", handleVerifiedEvent);
        window.removeEventListener("partner-profile-logout", handleLogoutEvent);
        window.removeEventListener("trigger-open-profile-otp", handleOpenProfileOtp);
      };
    }
  }, []);

  const handleSendOtp = async (targetMobile?: string) => {
    const num = (targetMobile || mobile).replace(/\D/g, "").slice(-10);
    if (!num || num.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setError(null);
    setIsSendingOtp(true);

    try {
      const res = await fetch("/api/vendor/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", mobile: num }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send OTP.");
      }

      setOtpSent(true);
      setSimulatedSmsOtp(data.otp);
      setSuccessNotice(`OTP sent successfully to +91 ${num}!`);
      setResendTimer(30);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const num = mobile.replace(/\D/g, "").slice(-10);
    if (!otp.trim()) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }

    setError(null);
    setIsVerifyingOtp(true);

    try {
      const res = await fetch("/api/vendor/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          mobile: num,
          otp: otp.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "OTP verification failed.");
      }

      setProfile(data.profile);
      setPlan(data.plan);
      setAdminValidation(data.adminValidation);
      setIsVerified(true);
      setSuccessNotice("Mobile verified successfully! Welcome to your partner profile.");

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "bb_verified_partner_profile",
          JSON.stringify({
            profile: data.profile,
            plan: data.plan,
            adminValidation: data.adminValidation,
          })
        );
        window.dispatchEvent(
          new CustomEvent("partner-profile-verified", {
            detail: {
              profile: data.profile,
              plan: data.plan,
              adminValidation: data.adminValidation,
            },
          })
        );
      }
    } catch (err: any) {
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleToggleAdminStatus = async () => {
    if (!profile?.vendorMobile || !adminValidation) return;
    setIsTogglingStatus(true);
    const newStatus = adminValidation.status === "APPROVED" ? "IN_PROCESS" : "APPROVED";

    try {
      const res = await fetch("/api/vendor/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_status",
          mobile: profile.vendorMobile,
          newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Toggle locally
        const isAppr = newStatus === "APPROVED";
        setAdminValidation({
          ...adminValidation,
          status: newStatus,
          isAdminValidated: isAppr,
          badgeLabel: isAppr
            ? "APPROVED & ACTIVE"
            : "IN PROCESS (Awaiting Admin Validation)",
          title: isAppr
            ? "Territory License Approved & Exclusivity Active"
            : "Application Under Final Admin Validation",
          description: isAppr
            ? "Congratulations! Your profile has been validated by Admin HQ. Your territorial exclusivity and partner license are approved. You can now access your Thank You confirmation page and vendor login credentials below."
            : "Your payment is confirmed. Admin HQ Operations is currently validating your commercial documentation and territory demarcation. Turnaround: 24 to 48 hours.",
          step: isAppr ? 4 : 3,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleCopy = (text: string, type: "id" | "pass") => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (type === "id") {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
      } else {
        setCopiedPass(true);
        setTimeout(() => setCopiedPass(false), 2000);
      }
    }
  };

  const handleReset = () => {
    setIsVerified(false);
    setProfile(null);
    setPlan(null);
    setAdminValidation(null);
    setOtpSent(false);
    setOtp("");
    setSimulatedSmsOtp(null);
    setError(null);
    setSuccessNotice(null);

    if (typeof window !== "undefined") {
      localStorage.removeItem("bb_verified_partner_profile");
      window.dispatchEvent(new Event("partner-profile-logout"));
    }
  };

  const getTierColors = (tier: string = "gold") => {
    switch (tier.toLowerCase()) {
      case "silver":
        return {
          pill: "bg-slate-200 text-slate-800 border-slate-300",
          accent: "text-slate-800",
          cardGlow: "from-slate-100 to-slate-200",
          badge: "bg-slate-800 text-white",
        };
      case "platinum":
        return {
          pill: "bg-cyan-100 text-cyan-900 border-cyan-300",
          accent: "text-cyan-800",
          cardGlow: "from-cyan-50 to-teal-100",
          badge: "bg-teal-700 text-white",
        };
      case "gold":
      default:
        return {
          pill: "bg-amber-100 text-amber-900 border-amber-300",
          accent: "text-amber-800",
          cardGlow: "from-amber-50 to-yellow-100",
          badge: "bg-amber-600 text-white",
        };
    }
  };

  const tierColors = getTierColors(plan?.tier);

  return (
    <section
      id="profile"
      className="py-12 sm:py-16 bg-gradient-to-b from-[#FDFBF7] via-white to-amber-50/40 text-slate-900 relative border-t border-amber-200/60 scroll-mt-14"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-400 text-amber-950 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wide mb-2.5 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Partner Verification &amp; Profile Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight leading-tight">
            Track Application &amp;{" "}
            <span className="text-amber-600">Partner Profile</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-xl mx-auto leading-relaxed">
            Validate your registered mobile number via OTP to check your real-time payment confirmation, territory license, and Admin validation status.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* PHASE 1: MOBILE & OTP VALIDATION CARD                                     */}
        {/* ========================================================================= */}
        {!isVerified && (
          <div className="max-w-md mx-auto bg-white rounded-3xl border-2 border-amber-300/80 shadow-xl p-6 sm:p-8 space-y-5 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500" />

            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-xs border border-amber-200">
                <KeyRound className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-lg font-black text-slate-950">
                {otpSent ? "Verify 6-Digit OTP Code" : "Enter Mobile to View Profile"}
              </h3>
              <p className="text-xs text-slate-500">
                {otpSent
                  ? `Enter the verification code sent to +91 ${mobile}`
                  : "We will send a one-time verification password to confirm your identity."}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {successNotice && !error && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successNotice}</span>
              </div>
            )}

            {/* Simulated SMS Alert Box (On-Screen Mock for Instant Testing) */}
            {otpSent && simulatedSmsOtp && (
              <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100 border-2 border-dashed border-amber-400 rounded-2xl p-3.5 space-y-2 shadow-sm animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between text-[11px] font-black text-amber-950">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    Simulated SMS Notification
                  </span>
                  <span className="text-[10px] bg-amber-200/80 px-1.5 py-0.5 rounded font-mono">
                    Just Now
                  </span>
                </div>
                <div className="text-xs text-slate-800 font-medium">
                  Your BroomBoom verification code is{" "}
                  <span className="font-mono font-black text-amber-900 text-sm tracking-wider bg-white px-2 py-0.5 rounded border border-amber-300 shadow-xs">
                    {simulatedSmsOtp}
                  </span>
                  . Valid for 10 minutes.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOtp(simulatedSmsOtp);
                    setError(null);
                  }}
                  className="w-full text-center text-xs font-black text-amber-950 bg-amber-400/80 hover:bg-amber-400 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Click to Auto-Fill Code ({simulatedSmsOtp})
                </button>
              </div>
            )}

            {/* Mobile Form */}
            {!otpSent ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendOtp();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Registered Mobile Number <span className="text-amber-600">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-xs sm:text-sm">
                      <Phone className="w-4 h-4 text-slate-400 mr-1.5" />
                      <span>+91</span>
                      <span className="text-slate-300 ml-1.5">|</span>
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      placeholder="98765 43210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                      className="w-full pl-20 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-sm tracking-wider focus:outline-none focus:border-amber-500 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                </div>

                {/* Demo Quick Pick Helpers */}
                <div className="pt-1 text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-slate-600">Quick Test:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMobile("9876543210");
                      handleSendOtp("9876543210");
                    }}
                    className="bg-slate-100 hover:bg-amber-100 border border-slate-200 hover:border-amber-300 text-slate-700 px-2 py-0.5 rounded text-[10.5px] font-mono cursor-pointer transition-colors"
                  >
                    9876543210 (Demo Partner)
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSendingOtp || mobile.length !== 10}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-sm rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSendingOtp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Verification OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* OTP Input Form */
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerifyOtp();
                }}
                className="space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Enter 6-Digit OTP
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp("");
                        setError(null);
                      }}
                      className="text-[11px] font-bold text-amber-700 hover:underline cursor-pointer"
                    >
                      Change Number
                    </button>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    autoFocus
                    placeholder="e.g. 123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center py-3 bg-slate-50 border-2 border-amber-300 rounded-xl text-slate-900 font-mono font-black text-xl tracking-[0.5em] focus:outline-none focus:border-amber-500 focus:bg-white transition-all shadow-inner"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Didn&apos;t receive code?</span>
                  {resendTimer > 0 ? (
                    <span className="font-semibold text-slate-400">
                      Resend in {resendTimer}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      className="font-bold text-amber-700 hover:underline cursor-pointer"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingOtp || otp.length !== 6}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
                >
                  {isVerifyingOtp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying OTP...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify OTP &amp; View Profile</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* PHASE 2: VERIFIED PARTNER PROFILE & PLAN STATUS CARD                     */}
        {/* ========================================================================= */}
        {isVerified && profile && plan && adminValidation && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Top Toolbar: Logout / Check Another Number */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-amber-200/80 rounded-2xl px-5 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 text-xs font-black px-2.5 py-1 rounded-full border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Mobile Authenticated (+91 {profile.vendorMobile})
                </span>
              </div>
              <button
                onClick={handleReset}
                className="text-xs font-bold text-slate-600 hover:text-rose-600 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Check Another Mobile Number</span>
              </button>
            </div>

            {/* Profile Grid: Main Details & Plan Status Condition */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ------------------------------------------------------------- */}
              {/* COLUMN 1 & 2: PARTNER DETAILS & PLAN SPECIFICATION            */}
              {/* ------------------------------------------------------------- */}
              <div className="lg:col-span-2 space-y-6">
                {/* 1. Partner Identity Card */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-amber-500/20">
                        {profile.vendorName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black text-slate-950">
                            {profile.vendorName}
                          </h3>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${tierColors.pill}`}>
                            {plan.tier}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>
                            {profile.city}, {profile.state}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Application Ref ID
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs sm:text-sm font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {profile.applicationId}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(profile.applicationId, "id")}
                          className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 cursor-pointer transition-colors"
                          title="Copy Application ID"
                        >
                          {copiedId ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Contact & Space Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Mobile / WhatsApp
                      </span>
                      <span className="font-bold text-slate-900">+91 {profile.vendorMobile}</span>
                    </div>

                    <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Registered Email
                      </span>
                      <span className="font-bold text-slate-900 truncate block">
                        {profile.vendorEmail || "Not provided"}
                      </span>
                    </div>

                    <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Commercial Space Status
                      </span>
                      <span className="font-bold text-slate-900">{profile.spaceStatus}</span>
                    </div>

                    <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Territory / Carpet Area
                      </span>
                      <span className="font-bold text-slate-900">{profile.carpetArea}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Package & Payment Overview Card */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="text-sm font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-amber-600" />
                      Plan &amp; Payment Overview
                    </h4>
                    <span className="text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {plan.paymentStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50/50 p-3.5 rounded-2xl border border-amber-200/80">
                      <span className="text-[10px] font-bold text-amber-900/70 uppercase tracking-wider block">
                        Selected Plan
                      </span>
                      <span className="text-sm font-black text-slate-950 mt-1 block">
                        {plan.name}
                      </span>
                      <span className="text-[10px] text-amber-800 font-bold block mt-0.5">
                        {plan.territoryScope}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Total Amount Paid
                      </span>
                      <span className="text-base font-black text-slate-950 mt-1 block">
                        ₹{plan.totalAmount.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                        Base ₹{plan.baseAmount.toLocaleString("en-IN")} + GST + GW
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Order &amp; Subscription ID
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900 mt-1 block truncate">
                        {plan.subscriptionId}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5 truncate">
                        {plan.orderId}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* COLUMN 3: CONDITION OF PLAN STATUS & ADMIN VALIDATION          */}
              {/* ------------------------------------------------------------- */}
              <div className="space-y-6">
                {/* Condition of Plan Status Card */}
                <div
                  className={`rounded-3xl border-2 p-6 sm:p-7 space-y-5 shadow-lg relative overflow-hidden ${
                    adminValidation.isAdminValidated
                      ? "bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-emerald-400 shadow-emerald-500/10"
                      : "bg-gradient-to-br from-amber-50 via-yellow-50 to-white border-amber-400 shadow-amber-500/10"
                  }`}
                >
                  {/* Top Status Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Plan Status Condition
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-xs ${
                        adminValidation.isAdminValidated
                          ? "bg-emerald-600 text-white animate-pulse"
                          : "bg-amber-500 text-slate-950 animate-pulse"
                      }`}
                    >
                      {adminValidation.isAdminValidated ? (
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                      )}
                      <span>{adminValidation.badgeLabel}</span>
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h4 className="text-lg font-black text-slate-950 leading-tight">
                      {adminValidation.title}
                    </h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {adminValidation.description}
                    </p>
                  </div>

                  {/* 4-Step Validation Timeline */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Verification Progress
                    </span>

                    <div className="space-y-2">
                      {/* Step 1: Application Form */}
                      <div className="flex items-center gap-2.5 text-xs font-bold text-slate-900">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span>1. Application Form Submitted</span>
                      </div>

                      {/* Step 2: Payment Confirmed */}
                      <div className="flex items-center gap-2.5 text-xs font-bold text-slate-900">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span>2. Package Payment Confirmed (Paid)</span>
                      </div>

                      {/* Step 3: Admin Validation */}
                      <div
                        className={`flex items-center gap-2.5 text-xs font-bold ${
                          adminValidation.isAdminValidated
                            ? "text-slate-900"
                            : "text-amber-900"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white ${
                            adminValidation.isAdminValidated
                              ? "bg-emerald-500"
                              : "bg-amber-500 animate-pulse"
                          }`}
                        >
                          {adminValidation.isAdminValidated ? (
                            <Check className="w-3 h-3 stroke-[3]" />
                          ) : (
                            <Clock className="w-3 h-3 stroke-[3]" />
                          )}
                        </div>
                        <span>
                          3. Admin Exclusivity Validation{" "}
                          {adminValidation.isAdminValidated
                            ? "(Validated ✓)"
                            : "(In Process ⏳)"}
                        </span>
                      </div>

                      {/* Step 4: Live Portal Activation */}
                      <div
                        className={`flex items-center gap-2.5 text-xs font-bold ${
                          adminValidation.isAdminValidated
                            ? "text-slate-900"
                            : "text-slate-400"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                            adminValidation.isAdminValidated
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-200 text-slate-400"
                          }`}
                        >
                          {adminValidation.isAdminValidated ? (
                            <Check className="w-3 h-3 stroke-[3]" />
                          ) : (
                            <span className="text-[10px]">4</span>
                          )}
                        </div>
                        <span>4. Vendor Live Portal Activation</span>
                      </div>
                    </div>
                  </div>

                  {/* --------------------------------------------------------- */}
                  {/* THANK YOU PAGE LINK (REQUESTED BY USER)                   */}
                  {/* --------------------------------------------------------- */}
                  <div className="pt-3 border-t border-slate-200/80 space-y-2">
                    <Link
                      href={adminValidation.thankYouUrl}
                      className="w-full group relative flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-xs sm:text-sm px-4 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer text-center"
                    >
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>View Official Thank You &amp; Login Page</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <p className="text-[10px] text-center text-slate-500">
                      Access your official confirmation certificate, login credentials &amp; password tools.
                    </p>
                  </div>

                  {/* Simulation Switcher (Convenient for User Testing) */}
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      disabled={isTogglingStatus}
                      onClick={handleToggleAdminStatus}
                      className="text-[10px] font-bold text-amber-800 hover:underline bg-amber-100/70 hover:bg-amber-200/80 border border-amber-300 px-3 py-1 rounded-full cursor-pointer transition-colors"
                      title="Toggle status to test both In-Process and Approved conditions"
                    >
                      {isTogglingStatus
                        ? "Switching..."
                        : adminValidation.isAdminValidated
                        ? "Admin Test Mode: Switch to [IN PROCESS ⏳]"
                        : "Admin Test Mode: Switch to [APPROVED ✓]"}
                    </button>
                  </div>
                </div>

                {/* 3. Vendor Credentials Dispatch Card (Sent via WhatsApp & Email upon Approval) */}
                <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-4 shadow-xl border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                        Credentials Security &amp; Delivery
                      </span>
                    </div>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 ${
                        adminValidation.isAdminValidated
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          adminValidation.isAdminValidated
                            ? "bg-emerald-400 animate-pulse"
                            : "bg-amber-400 animate-pulse"
                        }`}
                      />
                      {adminValidation.isAdminValidated
                        ? "Dispatched to WhatsApp & Email"
                        : "Dispatches Upon Approval"}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
                      <div className="flex items-start gap-2.5">
                        <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-100 block text-xs">
                            Dispatched via WhatsApp
                          </span>
                          <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                            {adminValidation.isAdminValidated
                              ? `Login User ID and Password have been securely sent to +91 ${profile.vendorMobile} via WhatsApp.`
                              : `Login credentials will be sent to +91 ${profile.vendorMobile} on WhatsApp upon Admin verification.`}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
                      <div className="flex items-start gap-2.5">
                        <Mail className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-100 block text-xs">
                            Dispatched via Email
                          </span>
                          <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                            {adminValidation.isAdminValidated
                              ? `Portal agreement and login credentials have been sent to ${profile.vendorEmail}.`
                              : `Official welcome pack will be emailed to ${profile.vendorEmail} upon final approval.`}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10.5px] text-slate-400 leading-relaxed pt-1">
                      🔒 For account security, confidential passwords are never displayed on public screens.
                    </p>
                  </div>

                  {adminValidation.isAdminValidated ? (
                    <Link
                      href={adminValidation.credentials.loginUrl}
                      className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer shadow-md"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Proceed to Vendor Login</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <a
                      href={`https://wa.me/916289952418?text=${encodeURIComponent(
                        `Hi BroomBoom Desk, checking approval status for Application ID: ${profile.applicationId}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>Inquire Status on WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

