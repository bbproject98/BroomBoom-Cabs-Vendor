"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  ShieldCheck,
  Phone,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  MessageSquare,
} from "lucide-react";

export interface PartnerOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PartnerOtpModal: React.FC<PartnerOtpModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();

  const [mobile, setMobile] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Initialize modal state on open
  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      setOtpSent(false);
      setOtp("");
      setError(null);
      setSuccessNotice(null);
      try {
        const cached = localStorage.getItem("bb_verified_partner_profile");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.profile?.vendorMobile && !mobile) {
            setMobile(parsed.profile.vendorMobile.replace(/\D/g, "").slice(-10));
          }
        }
      } catch {}
    }
  }, [isOpen]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  if (!isOpen) return null;

  // 1. Send OTP via SMS to Mobile Phone
  const handleSendOtp = async (targetMobile?: string) => {
    const num = (targetMobile || mobile).replace(/\D/g, "").slice(-10);
    if (!num || num.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setError(null);
    setSuccessNotice(null);
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
      setSuccessNotice(`OTP sent successfully to +91 ${num} via SMS. Please check your mobile messages.`);
      setResendTimer(30);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // 2. Verify OTP & Redirect to Thank You Page (if paid) or Confirmation Page (if unpaid)
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
        throw new Error(data.error || "OTP verification failed. Please enter the correct code.");
      }

      const targetUrl =
        data.redirectUrl ||
        (data.isPaid
          ? `/thank-you?applicationId=${encodeURIComponent(
              data.profile?.applicationId || ""
            )}&status=success&from=profile`
          : `/apply?package=${encodeURIComponent(
              data.plan?.tier || "gold"
            )}&applicationId=${encodeURIComponent(
              data.profile?.applicationId || ""
            )}&step=confirm&from=profile`);

      // Store verified profile in localStorage
      if (typeof window !== "undefined") {
        if (data.isPaid) {
          localStorage.setItem("bb_partner_payment_done", "true");
          localStorage.setItem("bb_partner_thankyou_url", targetUrl);
        } else {
          localStorage.removeItem("bb_partner_payment_done");
          localStorage.removeItem("bb_partner_thankyou_url");
        }

        localStorage.setItem(
          "bb_verified_partner_profile",
          JSON.stringify({
            profile: data.profile,
            plan: data.plan,
            adminValidation: data.adminValidation,
            isPaid: Boolean(data.isPaid),
            isAdminValidated: data.isAdminValidated,
            userStatus: data.userStatus,
            redirectUrl: targetUrl,
          })
        );
        window.dispatchEvent(
          new CustomEvent("partner-profile-verified", {
            detail: {
              profile: data.profile,
              plan: data.plan,
              adminValidation: data.adminValidation,
              isPaid: Boolean(data.isPaid),
              isAdminValidated: data.isAdminValidated,
              userStatus: data.userStatus,
              redirectUrl: targetUrl,
            },
          })
        );
      }

      if (data.isPaid) {
        setSuccessNotice(
          "✅ OTP Verified! Payment Confirmed. Redirecting to your Thank You page..."
        );
      } else if (data.hasRecord) {
        setSuccessNotice(
          "✅ OTP Verified! Application found. Redirecting to confirmation page..."
        );
      } else {
        setSuccessNotice(
          "✅ Mobile verified! Redirecting to application form..."
        );
      }

      // Smooth automatic transition
      setTimeout(() => {
        onClose();
        router.push(targetUrl);
      }, 700);
    } catch (err: any) {
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl border-2 border-amber-300 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Gradient Bar */}
        <div className="h-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-amber-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-950 leading-tight">
                Partner Profile Login &amp; OTP
              </h3>
              <p className="text-[11px] text-slate-600 font-medium">
                Validate via SMS OTP to access your Profile &amp; Plan page
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

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-amber-200 shadow-xs">
              {otpSent ? (
                <KeyRound className="w-6 h-6 stroke-[2.2]" />
              ) : (
                <Phone className="w-6 h-6 stroke-[2.2]" />
              )}
            </div>
            <h4 className="text-base font-black text-slate-950">
              {otpSent ? "Enter 6-Digit SMS OTP" : "Login with Mobile Number"}
            </h4>
            <p className="text-xs text-slate-600">
              {otpSent
                ? `Enter the verification code sent to +91 ${mobile}`
                : "An OTP will be sent to your mobile phone SMS messages."}
            </p>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Notice */}
          {successNotice && !error && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Real SMS Delivery Notice */}
          {otpSent && (
            <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-3.5 space-y-1.5 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-950">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                <span>SMS Dispatched to +91 {mobile}</span>
              </div>
              <p className="text-[11.5px] text-slate-600">
                Please check your mobile phone messages inbox for the 6-digit OTP code sent by BroomBoom Cabs (BBCABS).
              </p>
            </div>
          )}

          {/* STEP 1: Mobile Input Form */}
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
                    autoFocus
                    placeholder="98765 43210"
                    value={mobile}
                    onChange={(e) =>
                      setMobile(e.target.value.replace(/\D/g, ""))
                    }
                    className="w-full pl-20 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-sm tracking-wider focus:outline-none focus:border-amber-500 focus:bg-white transition-all shadow-xs"
                  />
                </div>
              </div>


              <button
                type="submit"
                disabled={isSendingOtp || mobile.length !== 10}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
              >
                {isSendingOtp ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending OTP to Mobile Phone...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4" />
                    <span>Send OTP via SMS</span>
                    <ArrowRight className="w-4 h-4 ml-0.5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: OTP Verification Form */
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
                    Enter 6-Digit OTP from SMS
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
                <span>Didn&apos;t receive SMS?</span>
                {resendTimer > 0 ? (
                  <span className="font-semibold text-slate-400">
                    Resend code in {resendTimer}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    className="font-bold text-amber-700 hover:underline cursor-pointer"
                  >
                    Resend OTP SMS
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isVerifyingOtp || otp.length !== 6}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
              >
                {isVerifyingOtp ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify OTP &amp; Open Thank You Page</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
