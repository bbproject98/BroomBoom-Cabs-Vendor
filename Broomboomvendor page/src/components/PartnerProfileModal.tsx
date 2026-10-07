"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  ShieldCheck,
  Phone,
  KeyRound,
  CheckCircle2,
  Clock,
  ArrowRight,
  User,
  MapPin,
  CreditCard,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
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

export interface PartnerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PartnerProfileModal: React.FC<PartnerProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
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

  // Password visibility & copy feedback
  const [showPassword, setShowPassword] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Resend Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Sync with localStorage on open if already verified
  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
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
    }
  }, [isOpen]);

  if (!isOpen) return null;

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

      // Cache verified session locally
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "bb_verified_partner_profile",
          JSON.stringify({
            profile: data.profile,
            plan: data.plan,
            adminValidation: data.adminValidation,
          })
        );
        // Also inform the in-page section to update
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
    const newStatus =
      adminValidation.status === "APPROVED" ? "IN_PROCESS" : "APPROVED";

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
        const isAppr = newStatus === "APPROVED";
        const updated = {
          ...adminValidation,
          status: newStatus as "IN_PROCESS" | "APPROVED",
          isAdminValidated: isAppr,
          badgeLabel: isAppr
            ? "APPROVED & ACTIVE"
            : "IN PROCESS (Awaiting Admin Validation)",
          title: isAppr
            ? "Territory License Approved & Exclusivity Active"
            : "Application Under Final Admin Validation",
          description: isAppr
            ? "Congratulations! Your profile has been validated by Admin HQ. Your territorial exclusivity and partner license are approved."
            : "Your payment is confirmed. Admin HQ Operations is currently validating your commercial documentation and territory demarcation. Turnaround: 24 to 48 hours.",
          step: isAppr ? 4 : 3,
        };
        setAdminValidation(updated);

        if (typeof window !== "undefined") {
          localStorage.setItem(
            "bb_verified_partner_profile",
            JSON.stringify({ profile, plan, adminValidation: updated })
          );
          window.dispatchEvent(
            new CustomEvent("partner-profile-verified", {
              detail: { profile, plan, adminValidation: updated },
            })
          );
        }
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl border-2 border-amber-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Gradient Bar */}
        <div className="h-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-50/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-950 leading-tight">
                Partner Profile &amp; Plan Status
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {isVerified
                  ? "Verified Application & License Overview"
                  : "Validate your mobile number to view your profile"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* ========================================================= */}
          {/* PHASE 1: MOBILE & OTP VALIDATION                         */}
          {/* ========================================================= */}
          {!isVerified && (
            <div className="max-w-md mx-auto space-y-4 py-2">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-amber-200">
                  <KeyRound className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h4 className="text-base font-black text-slate-950">
                  {otpSent ? "Verify 6-Digit OTP Code" : "Enter Mobile to View Profile"}
                </h4>
                <p className="text-xs text-slate-500">
                  {otpSent
                    ? `Enter the code sent to +91 ${mobile}`
                    : "Enter your 10-digit registered phone number to open your application profile."}
                </p>
              </div>

              {/* Error notice */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success notice */}
              {successNotice && !error && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successNotice}</span>
                </div>
              )}

              {/* Simulated SMS Alert Box */}
              {otpSent && simulatedSmsOtp && (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-100/70 border-2 border-dashed border-amber-400 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-black text-amber-950">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                      Simulated SMS Notification
                    </span>
                    <span className="text-[10px] bg-amber-200 px-1.5 py-0.5 rounded font-mono">
                      Just Now
                    </span>
                  </div>
                  <div className="text-xs text-slate-800 font-medium">
                    Your BroomBoom verification code is{" "}
                    <span className="font-mono font-black text-amber-900 text-sm bg-white px-2 py-0.5 rounded border border-amber-300">
                      {simulatedSmsOtp}
                    </span>
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

              {/* Mobile Input Form */}
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
                        onChange={(e) =>
                          setMobile(e.target.value.replace(/\D/g, ""))
                        }
                        className="w-full pl-20 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-sm tracking-wider focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Quick test numbers */}
                  <div className="pt-1 text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold text-slate-600">Quick Test:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setMobile("8583992978");
                        handleSendOtp("8583992978");
                      }}
                      className="bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 px-2 py-0.5 rounded text-[10.5px] font-mono cursor-pointer transition-colors"
                    >
                      8583992978 (Partha Sarkar)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobile("9876543210");
                        handleSendOtp("9876543210");
                      }}
                      className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-2 py-0.5 rounded text-[10.5px] font-mono cursor-pointer transition-colors"
                    >
                      9876543210 (Demo)
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingOtp || mobile.length !== 10}
                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
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
                /* OTP Verification Form */
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
                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
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

          {/* ========================================================= */}
          {/* PHASE 2: VERIFIED PARTNER PROFILE & PLAN STATUS           */}
          {/* ========================================================= */}
          {isVerified && profile && plan && adminValidation && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Partner Header Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-xs">
                    {profile.vendorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-slate-950">
                        {profile.vendorName}
                      </h4>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 border border-amber-300">
                        {plan.tier}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      <span>
                        {profile.city}, {profile.state} (+91 {profile.vendorMobile})
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  className="text-xs font-bold text-slate-600 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>

              {/* Status Condition Card (Requested by User) */}
              <div
                className={`p-4 rounded-2xl border-2 space-y-3 ${
                  adminValidation.isAdminValidated
                    ? "bg-emerald-50/70 border-emerald-400"
                    : "bg-amber-50/70 border-amber-400"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Plan Status Condition
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      adminValidation.isAdminValidated
                        ? "bg-emerald-600 text-white animate-pulse"
                        : "bg-amber-500 text-slate-950 animate-pulse"
                    }`}
                  >
                    {adminValidation.isAdminValidated ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                    <span>{adminValidation.badgeLabel}</span>
                  </span>
                </div>

                <div>
                  <h5 className="text-sm font-black text-slate-950">
                    {adminValidation.title}
                  </h5>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {adminValidation.description}
                  </p>
                </div>

                {/* Thank You Page Link (Requested by User) */}
                <div className="pt-2">
                  <Link
                    href={adminValidation.thankYouUrl}
                    onClick={onClose}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Open Official Thank You &amp; Login Page</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Admin Mode Switcher for Quick Testing */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    disabled={isTogglingStatus}
                    onClick={handleToggleAdminStatus}
                    className="text-[10px] font-bold text-amber-800 hover:underline bg-white border border-amber-300 px-2.5 py-1 rounded-full cursor-pointer"
                  >
                    {isTogglingStatus
                      ? "Switching..."
                      : adminValidation.isAdminValidated
                      ? "Admin Test Mode: Switch to [IN PROCESS ⏳]"
                      : "Admin Test Mode: Switch to [APPROVED ✓]"}
                  </button>
                </div>
              </div>

              {/* Vendor Credentials Security & Delivery Notice */}
              <div className="bg-slate-950 text-white rounded-2xl p-4 space-y-3 border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-black uppercase text-emerald-400">
                      Credentials Security &amp; Delivery
                    </span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
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
                      ? "Sent via WhatsApp & Email"
                      : "Dispatches Upon Approval"}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-start gap-2">
                      <MessageCircle className="w-3.5 h-3.5 text-[#25D366] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-200 block text-[11.5px]">
                          WhatsApp Notification
                        </span>
                        <p className="text-[10.5px] text-slate-400 mt-0.5 leading-relaxed">
                          {adminValidation.isAdminValidated
                            ? `User ID & Password have been securely delivered to +91 ${profile.vendorMobile} on WhatsApp.`
                            : `Your login ID & Password will be delivered to +91 ${profile.vendorMobile} on WhatsApp upon Admin validation.`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-start gap-2">
                      <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-200 block text-[11.5px]">
                          Email Delivery
                        </span>
                        <p className="text-[10.5px] text-slate-400 mt-0.5 leading-relaxed">
                          {adminValidation.isAdminValidated
                            ? `Portal access details have been sent to ${profile.vendorEmail}.`
                            : `Official documentation & credentials will be emailed to ${profile.vendorEmail} once approved.`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    🔒 Confidentially protected: Passwords are sent exclusively to your private WhatsApp and Email.
                  </p>
                </div>

                {adminValidation.isAdminValidated ? (
                  <Link
                    href={adminValidation.credentials.loginUrl}
                    onClick={onClose}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Proceed to Vendor Login</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <a
                    href={`https://wa.me/916289952418?text=${encodeURIComponent(
                      `Hi BroomBoom Desk, checking approval status for Application ID: ${profile.applicationId}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    <span>Inquire Status on WhatsApp</span>
                  </a>
                )}
              </div>

              {/* In-page jump link */}
              <div className="text-center pt-1">
                <a
                  href="#profile"
                  onClick={onClose}
                  className="text-xs font-bold text-amber-700 hover:underline"
                >
                  View Full Details on Landing Page Section &rarr;
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

