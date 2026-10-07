"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  MessageCircle,
  Home,
  LogIn,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Clock,
  LogOut,
} from "lucide-react";

/* Deterministic floating particles (safe for SSR) */
const PARTICLES = Array.from({ length: 14 }).map((_, i) => ({
  left: (i * 7.3 + 4) % 100,
  size: (i % 3) + 2,
  delay: (i * 1.7) % 14,
  duration: 12 + (i % 5) * 3,
  color: i % 2 === 0 ? "rgba(16,185,129,0.75)" : "rgba(251,191,36,0.7)",
}));

export default function ThankYouPage() {
  const router = useRouter();
  const [canShow, setCanShow] = useState(true);
  const [applicationId, setApplicationId] = useState("");
  const [partnerName, setPartnerName] = useState("Valued Partner");
  const [planTier, setPlanTier] = useState("Gold Partner");
  const [planDetails, setPlanDetails] = useState<any>(null);
  const [orderReference, setOrderReference] = useState("");
  const [copiedId, setCopiedId] = useState(false);
  const [isAdminApproved, setIsAdminApproved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const orderId = params.get("order_id");
      if (orderId) setOrderReference(orderId);
      const appIdParam = params.get("applicationId") || "";
      const pkg = (params.get("pkg") || "gold").toLowerCase();
      const statusParam = params.get("status");
      const fromParam = params.get("from");

      const resolvedAppId =
        appIdParam || (orderId ? `BB-${orderId.slice(-6)}` : "BB-VENDOR-2026");
      setApplicationId(resolvedAppId);

      // Save initial paid session to localStorage immediately so returning home will always recognize paid state
      const initialRedirectUrl = `/thank-you?applicationId=${encodeURIComponent(
        resolvedAppId
      )}&status=success&from=profile`;
      localStorage.setItem("bb_partner_payment_done", "true");
      localStorage.setItem("bb_partner_paid_appid", resolvedAppId);
      localStorage.setItem("bb_partner_thankyou_url", initialRedirectUrl);

      const initialSession = {
        profile: {
          vendorName: "Valued Partner",
          vendorMobile: "",
          vendorEmail: "",
          applicationId: resolvedAppId,
        },
        plan: {
          tier: pkg,
          name: `${pkg.charAt(0).toUpperCase() + pkg.slice(1)} Partner`,
        },
        isPaid: true,
        isAdminValidated: false,
        userStatus: "PAID_UNDER_PROCESS",
        redirectUrl: initialRedirectUrl,
      };
      localStorage.setItem(
        "bb_verified_partner_profile",
        JSON.stringify(initialSession)
      );
      window.dispatchEvent(
        new CustomEvent("partner-profile-verified", { detail: initialSession })
      );

      // Fetch profile details if available
      const profileQuery = orderId
        ? `/api/vendor/profile?appId=${encodeURIComponent(
            resolvedAppId
          )}&orderId=${encodeURIComponent(orderId)}`
        : `/api/vendor/profile?appId=${encodeURIComponent(resolvedAppId)}`;

      fetch(profileQuery)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.profile) {
            const vName = data.profile.vendorName || "Valued Partner";
            const vTier = data.plan?.name || "Gold Partner";
            const vMobile = data.profile.vendorMobile || "";
            const vEmail = data.profile.vendorEmail || "";
            const vAppId = data.profile.applicationId || resolvedAppId;
            setPartnerName(vName);
            if (data.plan?.name) setPlanTier(vTier);
            if (vAppId) setApplicationId(vAppId);
            if (data.plan) {
              setPlanDetails(data.plan);
              if (data.plan.orderId && !orderId) {
                setOrderReference(data.plan.orderId);
              }
            }

            const isAppr = Boolean(
              data.isApproved ||
                data.isAdminApproved ||
                data.review?.status === "approved" ||
                data.plan?.status === "approved"
            );
            setIsAdminApproved(isAppr);

            const finalRedirectUrl = `/thank-you?applicationId=${encodeURIComponent(
              vAppId
            )}&status=success&from=profile`;
            localStorage.setItem("bb_partner_payment_done", "true");
            localStorage.setItem("bb_partner_paid_appid", vAppId);
            localStorage.setItem("bb_partner_thankyou_url", finalRedirectUrl);

            // Update full verified session in localStorage
            const updatedSession = {
              profile: {
                vendorName: vName,
                vendorMobile: vMobile,
                vendorEmail: vEmail,
                applicationId: vAppId,
              },
              plan: {
                tier: pkg,
                name: vTier,
              },
              isPaid: true,
              isAdminValidated: isAppr,
              userStatus: isAppr ? "APPROVED" : "PAID_UNDER_PROCESS",
              redirectUrl: finalRedirectUrl,
            };
            localStorage.setItem(
              "bb_verified_partner_profile",
              JSON.stringify(updatedSession)
            );
            window.dispatchEvent(
              new CustomEvent("partner-profile-verified", {
                detail: updatedSession,
              })
            );
          }
        })
        .catch(() => {});

      // Check cached localStorage session
      const cached = localStorage.getItem("bb_verified_partner_profile");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.isAdminValidated === true) {
            setIsAdminApproved(true);
          } else if (parsed.isAdminValidated === false) {
            setIsAdminApproved(false);
          }
        } catch {}
      }

      // If navigated from profile or validated success, keep page active
      if (fromParam === "profile" || statusParam === "success") {
        setCanShow(true);
        if (orderId) {
          fetch(
            `/api/payment/verify?order_id=${encodeURIComponent(orderId)}${
              appIdParam
                ? `&applicationId=${encodeURIComponent(appIdParam)}`
                : ""
            }`
          ).catch(() => {});
        }
        return;
      }

      // If order_id is present without verified success, verify with server
      if (orderId) {
        fetch(
          `/api/payment/verify?order_id=${encodeURIComponent(orderId)}${
            appIdParam ? `&applicationId=${encodeURIComponent(appIdParam)}` : ""
          }`
        )
          .then((res) => res.json())
          .then((data) => {
            if (!data.success || !data.isPaid) {
              setCanShow(false);
              const failureStatus = (data.orderStatus || "failed").toLowerCase();
              router.replace(
                `/apply?package=${pkg}&applicationId=${encodeURIComponent(
                  data.applicationId || appIdParam || ""
                )}&payment_status=${failureStatus}&order_id=${encodeURIComponent(
                  orderId
                )}`
              );
            } else if (data.applicationId) {
              setApplicationId(data.applicationId);
            }
          })
          .catch(() => {
            setCanShow(false);
            router.replace(`/apply?package=${pkg}`);
          });
      }
    }
  }, [router]);

  const handleCopy = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
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
    router.push("/");
  };

  if (!canShow) {
    return null;
  }

  const steps = [
    { label: "Applied", done: true, active: false },
    { label: "Paid", done: true, active: false },
    { label: "Review", done: isAdminApproved, active: !isAdminApproved },
    { label: "Login", done: isAdminApproved, active: false },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050b12] flex items-center justify-center px-4 py-8">
      {/* ================= ANIMATED BACKGROUND ================= */}
      <style>{`
        @keyframes auroraFloat {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          33%      { transform: translate3d(50px, -35px, 0) scale(1.12); }
          66%      { transform: translate3d(-35px, 25px, 0) scale(0.94); }
        }
        @keyframes gridPan {
          from { background-position: 0 0; }
          to   { background-position: 60px 60px; }
        }
        @keyframes floatUp {
          0%   { transform: translateY(0) scale(0.8); opacity: 0; }
          10%  { opacity: 0.9; }
          90%  { opacity: 0.9; }
          100% { transform: translateY(-115vh) scale(1.2); opacity: 0; }
        }
        @keyframes borderFlow {
          0%   { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Base radial gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(125%_125%_at_50%_-10%,#0b2b2b_0%,#050b12_55%,#03060a_100%)]" />

        {/* Aurora blobs */}
        <div className="absolute -top-40 -left-32 h-[34rem] w-[34rem] rounded-full bg-emerald-500/25 blur-[130px] animate-[auroraFloat_18s_ease-in-out_infinite]" />
        <div className="absolute -bottom-52 -right-32 h-[36rem] w-[36rem] rounded-full bg-amber-400/20 blur-[140px] animate-[auroraFloat_22s_ease-in-out_infinite_reverse]" />
        <div className="absolute top-1/3 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-teal-400/15 blur-[120px] animate-[auroraFloat_26s_ease-in-out_infinite]" />

        {/* Moving grid */}
        <div
          className="absolute inset-0 opacity-[0.14] animate-[gridPan_14s_linear_infinite]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(16,185,129,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,185,129,0.35) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage:
              "radial-gradient(ellipse 80% 70% at 50% 40%, #000 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 70% at 50% 40%, #000 40%, transparent 100%)",
          }}
        />

        {/* Floating particles */}
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="absolute bottom-[-10vh] rounded-full"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.color,
              boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
              animation: `floatUp ${p.duration}s linear ${p.delay}s infinite`,
            }}
          />
        ))}

        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.7)_100%)]" />
      </div>

      {/* ================= CARD ================= */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md">
        {/* Top Header with Home & Logout */}
        <div className="flex items-center justify-between mb-2.5 px-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-amber-400 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home Overview</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-400/30 rounded-xl text-xs font-bold backdrop-blur-md transition-all cursor-pointer shadow-xs active:scale-95"
            title="Log out from this verified session"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Log Out Profile</span>
          </button>
        </div>

        <div className="rounded-[24px] p-[1.5px] bg-[linear-gradient(120deg,#f59e0b,#10b981,#06b6d4,#f59e0b)] bg-[length:300%_300%] animate-[borderFlow_9s_linear_infinite] shadow-[0_24px_70px_-25px_rgba(16,185,129,0.65)]">
          <div className="rounded-[22px] bg-white/95 backdrop-blur-xl p-4 sm:p-5 text-center space-y-3.5">
            {/* Success Icon */}
            <div className="relative w-14 h-14 mx-auto">
              <div className="absolute inset-0 rounded-2xl bg-emerald-400/30 animate-ping" />
              <div className="relative w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/40 ring-4 ring-emerald-100 transition-transform duration-500 hover:rotate-6 hover:scale-105">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-300">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Application &amp; Payment Confirmed</span>
              </span>
              <h1 className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-amber-600 to-emerald-600 bg-clip-text text-transparent">
                Welcome, {partnerName}!
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed">
                Your vendor application for{" "}
                <span className="font-bold text-slate-900">{planTier}</span> is
                confirmed. Your territory license and operations account are
                ready.
              </p>
            </div>

            {/* Application Ref */}
            <div className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg text-[11px] font-mono font-bold text-slate-800">
              <span>Application Ref:</span>
              <span className="font-black text-slate-950">{applicationId}</span>
              <button
                type="button"
                onClick={() => handleCopy(applicationId)}
                className="text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
                title="Copy ID"
              >
                {copiedId ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>

            {/* Live Progress Timeline */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
              <div className="flex items-start justify-between gap-1">
                {steps.map((s, i) => (
                  <React.Fragment key={s.label}>
                    <div className="flex w-12 shrink-0 flex-col items-center gap-1">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black transition-all ${
                          s.done
                            ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/40"
                            : s.active
                            ? "bg-amber-100 text-amber-700 ring-2 ring-amber-300"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {s.done ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : s.active ? (
                          <Clock className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          i + 1
                        )}
                      </div>
                      <span className="text-[8px] font-bold uppercase tracking-wide text-slate-500">
                        {s.label}
                      </span>
                    </div>

                    {i < steps.length - 1 && (
                      <div
                        className={`mt-3.5 h-[2px] flex-1 rounded-full ${
                          s.done ? "bg-emerald-400" : "bg-slate-200"
                        }`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Plan Status Condition Card */}
            <div
              className={`p-3 sm:p-3.5 rounded-xl border-2 text-left space-y-2 shadow-sm transition-colors ${
                isAdminApproved
                  ? "bg-emerald-50/90 border-emerald-400"
                  : "bg-amber-50/95 border-amber-300"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    isAdminApproved
                      ? "bg-emerald-200 text-emerald-950 border-emerald-300"
                      : "bg-amber-200 text-amber-950 border-amber-300"
                  }`}
                >
                  {isAdminApproved
                    ? "Status: Approved & Active"
                    : "Plan Status: Under Process"}
                </span>
                <span
                  className={`text-[9px] sm:text-[10px] font-bold flex items-center gap-1 ${
                    isAdminApproved ? "text-emerald-800" : "text-amber-800"
                  }`}
                >
                  {isAdminApproved ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Admin HQ Approved</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                      <span>Awaiting Admin Validation</span>
                    </>
                  )}
                </span>
              </div>

              <div>
                <h3 className="text-xs font-black text-slate-950">
                  {isAdminApproved
                    ? "Territory License Approved & Exclusivity Active"
                    : "Your Profile & Chosen Plan is Under Process"}
                </h3>
                <p className="text-[10px] text-slate-600 mt-0.5 leading-relaxed">
                  {isAdminApproved
                    ? `Congratulations! Admin HQ has verified and approved your commercial documentation and territory license for ${planTier}. Your vendor login credentials have been dispatched to your WhatsApp and Email.`
                    : `Your payment has been received and confirmed. Admin HQ Operations is currently validating your commercial documentation and territory demarcation for ${planTier}. Turnaround: 24 to 48 hours.`}
                </p>
              </div>
            </div>

            {/* Primary CTA — Vendor Login */}
            <Link
              href={`/vendor/login?appId=${encodeURIComponent(applicationId)}`}
              className="w-full py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-[11px] sm:text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-md hover:shadow-xl hover:shadow-amber-500/30 transition-all transform active:scale-95 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Proceed to Vendor Login Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Support */}
            <div className="flex flex-col gap-2 pt-0.5">
              <a
                href="https://wa.me/916289952418?text=Hi%20BroomBoom%20HQ%2C%20I%20have%20completed%20my%20vendor%20application."
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-[11px] sm:text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:shadow-green-500/20"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current relative z-10" />
                <span className="relative z-10">
                  Connect with Desk on WhatsApp
                </span>
              </a>

              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 pt-2 border-t border-slate-100">
                <Link
                  href="/"
                  className="text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1 font-bold"
                >
                  <Home className="w-3 h-3" />
                  <span>Back to Home</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2 py-1 rounded-md transition-colors flex items-center gap-1 font-bold cursor-pointer"
                  title="Log out from this partner session"
                >
                  <LogOut className="w-3 h-3 text-rose-500" />
                  <span>Log Out Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}