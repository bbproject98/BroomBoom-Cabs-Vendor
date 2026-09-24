"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Send,
  Sparkles,
  Check,
  AlertCircle,
  Loader2,
  Lock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Star,
  Users,
  TrendingUp,
  Headphones,
  Building2,
  BadgeCheck,
  Award,
  Quote,
  HelpCircle,
  Zap,
} from "lucide-react";
import { FRANCHISE_PACKAGES } from "@/data/franchiseData";
import { fireConfetti } from "@/lib/confetti";

function ApplyFormContent() {
  const searchParams = useSearchParams();
  const packageParam = searchParams.get("package") || "gold";
  const paymentStatusParam = searchParams.get("payment_status");
  const appIdParam = searchParams.get("applicationId");

  const initialPackage = ["silver", "gold", "platinum"].includes(packageParam) ? packageParam : "gold";
  const [selectedPackage, setSelectedPackage] = useState<string>(initialPackage);

  const getPackageDefaults = (pkgId: string) => {
    switch (pkgId) {
      case "silver":
        return {
          investmentBudget: "₹10,000 (Silver Partner - 50% OFF Exclusive Deal)",
          carpetArea: "100 - 150 sq.ft (Ideal for Silver Kiosk)",
        };
      case "platinum":
        return {
          investmentBudget: "₹50,000 (Platinum Package - 50% OFF Exclusive Deal)",
          carpetArea: "800 - 1,200 sq.ft (Ideal for Platinum Master)",
        };
      case "gold":
      default:
        return {
          investmentBudget: "₹20,000 (Gold Package - 50% OFF Exclusive Deal)",
          carpetArea: "300 - 500 sq.ft (Ideal for Gold Hub)",
        };
    }
  };

  const initialDefaults = getPackageDefaults(initialPackage);

  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    alternatePhone: "",
    email: "",
    state: "",
    city: "",
    pincode: "",
    proposedAddress: "",
    spaceStatus: "Owned commercial space ready",
    carpetArea: initialDefaults.carpetArea,
    investmentBudget: initialDefaults.investmentBudget,
    financeRequired: "Self-Funded / Ready Capital",
    loanAssistance: "No (Self-Funded)",
    currentProfession: "",
    hasExperience: "Yes, currently in travel / taxi / logistics",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isFailedOrPending = Boolean(
    paymentStatusParam &&
      ["pending", "failed", "cancelled", "user_dropped", "error"].includes(paymentStatusParam.toLowerCase())
  );
  const [isSuccess, setIsSuccess] = useState(isFailedOrPending);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(
    paymentStatusParam === "pending"
      ? "Payment Pending: Your transaction was not completed or is still pending. Please click 'Pay Now' below to complete your payment and confirm your territory."
      : isFailedOrPending
      ? "Payment Incomplete / Failed: Your payment could not be completed. Please click 'Pay Now' below to retry and secure your territory."
      : null
  );
  const [applicationId, setApplicationId] = useState(appIdParam || "");
  const [formError, setFormError] = useState<string | null>(null);

  const currentPkgDetails =
    FRANCHISE_PACKAGES.find((p) => p.id === selectedPackage) || FRANCHISE_PACKAGES[1];

  // Helper to dynamically set pricing for each tier
  const getPrices = (id: string) => {
    switch (id) {
      case "silver":
        return { original: "₹20,000", discounted: "₹10,000", numPrice: 10000, save: "₹10,000" };
      case "gold":
        return { original: "₹40,000", discounted: "₹20,000", numPrice: 20000, save: "₹20,000" };
      case "platinum":
        return { original: "₹1,00,000", discounted: "₹50,000", numPrice: 50000, save: "₹50,000" };
      default:
        return { original: "₹20,000", discounted: "₹10,000", numPrice: 10000, save: "₹10,000" };
    }
  };

  // Helper to get dynamic theme colors based on selected package
  const getCheckoutTheme = (id: string) => {
    switch (id) {
      case "silver":
        return {
          pageBg: "bg-[#f8fafc]",
          bg: "bg-gradient-to-br from-slate-100 via-gray-200 to-slate-300", // Bright Silver
          border: "border-slate-300",
          accentText: "text-slate-700",
          priceBoxBg: "bg-white/95",
          priceBoxBorder: "border-slate-300",
          saveBadge: "bg-slate-800 text-white",
          button: "bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-white",
          checkIcon: "text-slate-600",
          trustText: "text-slate-700",
          glow: "shadow-[0_20px_50px_rgba(148,163,184,0.5)]",
          cardGlow: "from-slate-400 via-gray-300 to-slate-400",
        };
      case "platinum":
        return {
          pageBg: "bg-[#ecfeff]",
          bg: "bg-gradient-to-br from-cyan-100 via-blue-100 to-cyan-200", // Bright Platinum
          border: "border-cyan-300",
          accentText: "text-cyan-800",
          priceBoxBg: "bg-white/95",
          priceBoxBorder: "border-cyan-300",
          saveBadge: "bg-cyan-800 text-white",
          button: "bg-gradient-to-r from-cyan-600 to-cyan-800 hover:from-cyan-700 hover:to-cyan-900 text-white",
          checkIcon: "text-cyan-600",
          trustText: "text-cyan-900",
          glow: "shadow-[0_20px_50px_rgba(6,182,212,0.5)]",
          cardGlow: "from-cyan-400 via-teal-300 to-cyan-400",
        };
      case "gold":
      default:
        return {
          pageBg: "bg-[#fffbeb]",
          bg: "bg-gradient-to-br from-yellow-100 via-amber-200 to-yellow-300", // Bright Gold
          border: "border-amber-300",
          accentText: "text-amber-800",
          priceBoxBg: "bg-white/95",
          priceBoxBorder: "border-amber-300",
          saveBadge: "bg-emerald-600 text-white",
          button: "bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-500 hover:via-yellow-600 hover:to-amber-600 text-black",
          checkIcon: "text-amber-600",
          trustText: "text-amber-900",
          glow: "shadow-[0_20px_50px_rgba(245,158,11,0.6)]",
          cardGlow: "from-yellow-400 via-amber-300 to-yellow-400",
        };
    }
  };

  const theme = getCheckoutTheme(selectedPackage);

  const handlePayNow = async () => {
    setIsPaying(true);
    setPaymentError(null);
    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: applicationId || `BB-VENDOR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          packageId: selectedPackage,
          fullName: formData.fullName || "Partner",
          mobile: formData.mobile,
          email: formData.email,
          city: formData.city,
        }),
      });

      const orderData = await res.json();
      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to initialize payment session");
      }

      // Launch Cashfree Checkout redirect with all charges included
      const launchCashfreeCheckout = () => {
        if (typeof window !== "undefined" && (window as any).Cashfree && orderData.paymentSessionId) {
          const cashfree = (window as any).Cashfree({ mode: orderData.mode || "sandbox" });
          cashfree.checkout({
            paymentSessionId: orderData.paymentSessionId,
            redirectTarget: "_self",
          });
          return true;
        }
        return false;
      };

      if (!launchCashfreeCheckout()) {
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (launchCashfreeCheckout() || attempts >= 8) {
            clearInterval(interval);
            if (attempts >= 8) {
              window.location.href = `/thank-you?order_id=${encodeURIComponent(
                orderData.orderId
              )}&applicationId=${encodeURIComponent(
                applicationId || orderData.orderId
              )}`;
            }
          }
        }, 250);
      }
    } catch (err: any) {
      console.error("[PAYMENT ERROR]", err);
      setPaymentError(err.message || "Payment gateway connection error. Please retry or contact support.");
      setIsPaying(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setFormError(null);

    if (!formData.fullName.trim()) {
      setFormError("Please enter your Full Name.");
      return;
    }
    if (!formData.mobile.trim()) {
      setFormError("Please enter your Mobile / WhatsApp number.");
      return;
    }
    if (!formData.email.trim()) {
      setFormError("Please enter your Email address.");
      return;
    }
    if (!formData.city.trim()) {
      setFormError("Please enter your target City or District.");
      return;
    }
    if (!formData.state.trim()) {
      setFormError("Please enter your State (e.g. West Bengal, Bihar, UP).");
      return;
    }

    setIsSubmitting(true);

    let assignedId = `BB-VENDOR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const defs = getPackageDefaults(selectedPackage);
    let finalBudget = formData.investmentBudget;
    if (
      !finalBudget ||
      (selectedPackage === "silver" && finalBudget.includes("Gold")) ||
      (selectedPackage === "platinum" && finalBudget.includes("Gold")) ||
      (selectedPackage === "gold" && finalBudget.includes("Silver"))
    ) {
      finalBudget = defs.investmentBudget;
    }

    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          preferredPackage: selectedPackage,
          packageName: currentPkgDetails.name,
          investmentBudget: finalBudget,
          source: "apply_page",
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.applicationId) {
        assignedId = data.data.applicationId;
      }
    } catch (err) {
      console.warn("Backend submission fallback:", err);
    }

    setApplicationId(assignedId);
    setIsSubmitting(false);
    setIsSuccess(true);
    fireConfetti();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-amber-200 selection:text-black font-sans">
      <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" strategy="lazyOnload" />
      
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-amber-200/50 py-3.5 px-4 sm:px-8 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-amber-400 shadow-md group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/broomboom-logo.png"
                alt="BroomBoom Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-950">
                  Broom<span className="text-amber-600">Boom</span>
                </span>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider border border-amber-200">
                  Vendor
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Official Application Portal
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <a
              href="tel:18002706600"
              className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-amber-800 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>1800-BROOM-BOOM</span>
            </a>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-amber-800 border border-slate-300 hover:border-amber-400 px-3.5 py-2 rounded-xl transition-all bg-white hover:shadow-md"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main>
        {isSuccess ? (
          /* FULL LANDING PAGE STRUCTURE - DYNAMIC BACKGROUND */
          <div className={`relative min-h-[90vh] overflow-hidden ${theme.pageBg}`}>
            
            {/* Ambient Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-amber-400/20 rounded-full blur-[120px] animate-pulse pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-yellow-500/20 rounded-full blur-[150px] animate-pulse delay-1000 pointer-events-none" />
            <div className="absolute top-[20%] right-[10%] w-[30vw] h-[30vw] bg-orange-300/10 rounded-full blur-[100px] pointer-events-none" />
            
            {/* Subtle Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            {/* SECTION 1 & 2: TOP SPLIT LAYOUT (Hero Left, Package Right) */}
            <section className="relative z-10 pt-12 pb-16 px-4 sm:px-6">
              <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
                
                {/* LEFT COLUMN: Hero / Congratulations - SMALLER TEXT */}
                <div className="flex flex-col justify-center h-full space-y-6 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-amber-200 text-amber-900 text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-[0_4px_20px_rgba(245,158,11,0.15)] self-center lg:self-start hover:scale-105 transition-transform cursor-default">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Same package selected earlier
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                    Congratulations! <span className="inline-block animate-bounce text-2xl sm:text-3xl">🎉</span>
                  </h1>
                  
                  <h2 className="text-base sm:text-lg font-bold text-slate-700 leading-snug">
                    You have successfully selected the <br className="hidden sm:block" />
                    <span className={`${theme.accentText} font-black text-xl sm:text-2xl block mt-1.5 bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-yellow-500`}>
                      {currentPkgDetails.name} Subscription
                    </span>
                  </h2>
                  
                  <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto lg:mx-0 leading-relaxed">
                    Complete the payment to secure your territory and unlock all exclusive partner benefits. Your journey to market leadership starts here.
                  </p>

                  {/* Active Highlight List - Smaller padding and gap */}
                  <div className="space-y-3 pt-3 max-w-md mx-auto lg:mx-0 text-left w-full">
                    <div className="group flex items-center gap-3 bg-white/60 backdrop-blur-md p-3 rounded-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)] hover:-translate-y-1 transition-all duration-300">
                      <div className="p-2 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg shadow-inner group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 drop-shadow-sm" />
                      </div>
                      <span className="font-bold text-slate-800 text-xs sm:text-sm tracking-wide">Instant Territory Locking</span>
                    </div>
                    <div className="group flex items-center gap-3 bg-white/60 backdrop-blur-md p-3 rounded-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)] hover:-translate-y-1 transition-all duration-300">
                      <div className="p-2 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg shadow-inner group-hover:scale-110 transition-transform">
                        <Zap className="w-4 h-4 text-amber-600 drop-shadow-sm" />
                      </div>
                      <span className="font-bold text-slate-800 text-xs sm:text-sm tracking-wide">Fast-Track Onboarding</span>
                    </div>
                    <div className="group flex items-center gap-3 bg-white/60 backdrop-blur-md p-3 rounded-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] hover:-translate-y-1 transition-all duration-300">
                      <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg shadow-inner group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-4 h-4 text-blue-600 drop-shadow-sm" />
                      </div>
                      <span className="font-bold text-slate-800 text-xs sm:text-sm tracking-wide">Secure Payment Gateway</span>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Package & Pay Now - SMALLER CARD SIZE */}
                <div className="relative h-full flex flex-col justify-center perspective-1000 w-full max-w-md mx-auto lg:max-w-none">
                  
                  {/* Animated Glow Border behind the card */}
                  <div className={`absolute -inset-1 bg-gradient-to-r ${theme.cardGlow} rounded-[2.5rem] blur-xl opacity-60 group-hover:opacity-80 transition duration-1000 animate-tilt`}></div>
                  
                  <div className={`relative ${theme.bg} backdrop-blur-2xl border border-white/60 rounded-[2rem] p-6 shadow-2xl ${theme.glow} transform transition-all duration-500 hover:scale-[1.01] hover:-translate-y-1`}>
                    
                    {/* Top Row: Badges (Left and Center) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                      <div className="flex gap-2">
                        <span className="bg-gradient-to-r from-rose-500 to-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-md shadow-rose-500/30">
                          50% OFF
                        </span>
                        <span className="bg-white/90 backdrop-blur-sm text-slate-900 border border-slate-200 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
                          EXCLUSIVE DEAL
                        </span>
                      </div>
                      {selectedPackage === "gold" && (
                        <div className="bg-slate-900 text-amber-400 border border-amber-500/50 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.4)] flex items-center gap-1.5 animate-pulse">
                          <Star className="w-3 h-3 fill-amber-400" />
                          MOST POPULAR
                        </div>
                      )}
                    </div>

                    {/* Header: Name on left, Price on right, aligned on the same line */}
                    <div className="flex items-start justify-between gap-4 mb-6">
                        {/* Package Name & Tagline on the LEFT */}
                        <div className="flex-1 pr-4">
                            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight drop-shadow-sm leading-tight">
                                {currentPkgDetails.name}
                            </h2>
                            <p className={`text-[10px] sm:text-xs font-bold ${theme.accentText} mt-1.5 leading-snug`}>
                                {currentPkgDetails.tagline}
                            </p>
                        </div>

                        {/* Price block on the RIGHT */}
                        <div className="flex flex-col items-end shrink-0 text-right">
                            <span className="text-[11px] font-black text-rose-500 line-through decoration-rose-500/50 decoration-2 leading-none">
                                {getPrices(selectedPackage).original}
                            </span>
                            <span className="text-3xl font-black text-slate-950 leading-none tracking-tighter drop-shadow-md mt-1">
                                {getPrices(selectedPackage).discounted}
                            </span>
                            <span className="text-[9px] font-bold text-emerald-700 bg-white/80 px-1.5 py-0.5 rounded mt-2 border border-emerald-200 shadow-sm">
                                You Save {getPrices(selectedPackage).save}
                            </span>
                        </div>
                    </div>

                    {/* Inclusions Summary */}
                    <div className="mb-6 bg-white/80 backdrop-blur-md rounded-xl p-4 border border-white/90 shadow-sm">
                      <h4 className="text-[11px] font-black uppercase text-slate-950 tracking-wider mb-3 flex items-center gap-2">
                        <BadgeCheck className="w-3.5 h-3.5 text-amber-600" />
                        Package Benefits:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {currentPkgDetails.features.map((item: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-700 font-semibold group">
                            <CheckCircle2 className={`w-3.5 h-3.5 ${theme.checkIcon} shrink-0 mt-0.5 group-hover:scale-110 transition-transform`} />
                            <span className="leading-snug">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Error Notification */}
                    {paymentError && (
                      <div className="mb-4 p-3 bg-rose-50/90 backdrop-blur-sm border border-rose-200 rounded-xl text-rose-900 text-[11px] font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 shadow-sm">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <div>{paymentError}</div>
                      </div>
                    )}

                    {/* Pay Now Button - Highly Highlighted but slightly smaller */}
                    <div className={`space-y-3 pt-4 border-t ${theme.border} border-opacity-50`}>
                      <button
                        type="button"
                        onClick={handlePayNow}
                        disabled={isPaying}
                        className={`relative w-full py-4 px-6 ${theme.button} font-black text-lg rounded-xl shadow-[0_10px_40px_-10px_rgba(245,158,11,0.8)] hover:shadow-[0_15px_50px_-10px_rgba(245,158,11,1)] transition-all duration-300 flex items-center justify-center gap-2.5 group cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed transform active:scale-[0.97] overflow-hidden border border-white/20`}
                      >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                        
                        {isPaying ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Connecting to Cashfree...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span className="drop-shadow-sm">
                              Pay Now ({getPrices(selectedPackage).discounted})
                            </span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                          </>
                        )}
                      </button>

                      <div className={`flex flex-wrap items-center justify-center gap-2 text-[10px] ${theme.trustText} font-bold pt-1`}>
                        <span className="flex items-center gap-1 bg-white/60 px-2 py-1 rounded-md shadow-sm">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Instant verification
                        </span>
                        <span className="flex items-center gap-1 bg-white/60 px-2 py-1 rounded-md shadow-sm">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Zero hidden charges
                        </span>
                        <span className="flex items-center gap-1 bg-white/60 px-2 py-1 rounded-md shadow-sm">
                          <Lock className="w-3.5 h-3.5 text-emerald-600" />
                          256-Bit SSL Encrypted
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 2.5: RATINGS & VENDOR TRUST BREAKDOWN */}
            <section className="relative z-10 py-16 px-4 bg-[#fdfcf5] border-t border-amber-100">
              <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-1.5 bg-amber-100/80 text-amber-900 border border-amber-300 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-5 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    Factual Ratings & Vendor Trust Breakdown
                  </div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                    Trusted by <span className="text-amber-600">Over 500+</span> Fleet Partners Across Bengal
                  </h2>
                  <p className="text-slate-600 mt-4 max-w-2xl mx-auto text-sm sm:text-base">
                    Real performance ratings aggregated from our active vendor network, Google Play Store (Partner App), and B2B travel directories.
                  </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card 1: Google Play Store - Vendor App */}
                  <div className="bg-white rounded-3xl p-6 border-2 border-amber-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-full hover:border-amber-400 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center p-2 shadow-sm border border-slate-100">
                          <svg viewBox="0 0 1024 1024" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg"><path fill="#3bccff" d="M38.163 11.236L38.11 966.38a42.927 42.927 0 0019.577 36.192l.142.083c7.585 4.316 16.516 6.702 25.867 6.702 7.794 0 15.295-1.745 22.183-4.912l.186-.091L523.518 786.11l-246.33-246.33-239.025 239.02l-.004-767.561.004-.002L277.188 450.25l246.33-246.33L105.772 19.349h-.001A42.84 42.84 0 0083.585 14.43c-9.28 0-18.143 2.348-25.688 6.595l-.147.085a42.977 42.977 0 00-19.587 36.312v-.002z"/><path fill="#ea4335" d="M523.518 786.11l216.568-125.045 106.669-61.583a42.859 42.859 0 0021.282-37.135 42.859 42.859 0 00-21.282-37.135l-106.669-61.583L523.518 338.583l-246.33 246.33z"/><path fill="#fbbc04" d="M523.518 786.11L277.188 539.78 38.163 966.38z"/><path fill="#34a853" d="M523.518 338.583L277.188 584.913 38.163 11.236z"/></svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 leading-tight text-sm">Google Play Store</h3>
                          <p className="text-[11px] text-slate-500">BroomBoom Partner & Pilot App</p>
                        </div>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">Verified App</span>
                    </div>
                    
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-4xl font-black text-slate-900">4.6</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4].map((i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0% 100%)" }} />
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium ml-1">(5,000+ Downloads)</span>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed mb-6 flex-grow">
                      Highly rated by fleet owners for transparent daily settlements, zero hidden commissions, and seamless driver allocation.
                    </p>

                    <div className="pt-4 border-t border-slate-100 flex items-start gap-2 mt-auto">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-xs font-semibold text-emerald-700">100% Transparent Payout System</span>
                    </div>
                  </div>

                  {/* Card 2: Justdial - B2B Directory */}
                  <div className="bg-white rounded-3xl p-6 border-2 border-amber-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-full hover:border-amber-400 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#f0f6ff] rounded-full flex items-center justify-center p-2 shadow-sm border border-blue-100 overflow-hidden">
                           <div className="bg-[#1156a6] text-white font-black text-[10px] w-full h-full flex items-center justify-center rounded uppercase tracking-tighter">jd</div>
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 leading-tight text-sm">Justdial</h3>
                          <p className="text-[11px] text-slate-500">B2B Travel Partner Directory</p>
                        </div>
                      </div>
                      <span className="bg-amber-100/80 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
                        4.8 <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Top Vendor
                      </span>
                    </div>
                    
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-4xl font-black text-slate-900">4.8</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium ml-1">(300+ Fleet Reviews)</span>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed mb-6 flex-grow">
                      Consistently ranked as the most reliable aggregator by local taxi unions, corporate travel agencies, and independent fleet operators in Kolkata.
                    </p>

                    <div className="pt-4 border-t border-slate-100 flex items-start gap-2 mt-auto">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-xs font-semibold text-emerald-700">Dedicated Account Manager Support</span>
                    </div>
                  </div>

                  {/* Card 3: Local Fleet Association */}
                  <div className="bg-white rounded-3xl p-6 border-2 border-amber-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-full hover:border-amber-400 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center shadow-sm border border-indigo-100">
                          <Users className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 leading-tight text-sm">Local Fleet Network</h3>
                          <p className="text-[11px] text-slate-500">Bengal Taxi & Transport Union</p>
                        </div>
                      </div>
                      <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200">Recommended</span>
                    </div>
                    
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-4xl font-black text-slate-900">4.9</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium ml-1">(1,000+ Active Members)</span>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed mb-6 flex-grow">
                      Recognized for providing guaranteed daily corporate rides, lucrative outstation bookings, and dedicated airport transfer duties to partner vehicles.
                    </p>

                    <div className="pt-4 border-t border-slate-100 flex items-start gap-2 mt-auto">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-xs font-semibold text-emerald-700">Consistent Daily Booking Volume</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 3: BENEFITS TEXT AND IMAGES */}
              <section className="relative z-10 py-20 px-4 bg-white/80 backdrop-blur-xl border-y border-amber-100">
  <div className="max-w-7xl mx-auto">
    <div className="text-center mb-16">
      <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
        Exclusive Partner Benefits
      </h2>
      <p className="text-xl text-slate-600 mt-4 max-w-2xl mx-auto">
        Everything you need to scale your fleet business successfully with BroomBoom.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {/* Benefit 1 - Amber UI */}
      <div className="bg-gradient-to-br from-amber-50 via-white to-white rounded-3xl p-6 border border-amber-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(245,158,11,0.25)] hover:-translate-y-2 transition-all duration-500 flex flex-col items-start group">
        <div className="w-full h-40 rounded-2xl overflow-hidden mb-5 border border-amber-200 relative">
          <img
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600&h=300"
            alt="High ROI Dashboard"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-amber-500/30 via-amber-500/5 to-transparent" />
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-amber-100 rounded-xl group-hover:bg-amber-200 transition-colors">
            <TrendingUp className="w-6 h-6 text-amber-700" />
          </div>
          <h3 className="text-xl font-bold text-amber-900">High ROI</h3>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          Earn up to 15% commission on every ride with our exclusive vendor dashboard and volume rebates.
        </p>
      </div>

      {/* Benefit 2 - Blue UI */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-white rounded-3xl p-6 border border-blue-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(59,130,246,0.25)] hover:-translate-y-2 transition-all duration-500 flex flex-col items-start group">
        <div className="w-full h-40 rounded-2xl overflow-hidden mb-5 border border-blue-200 relative">
          <img
            src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=600&h=300"
            alt="Dedicated Support"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-500/30 via-blue-500/5 to-transparent" />
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
            <Headphones className="w-6 h-6 text-blue-700" />
          </div>
          <h3 className="text-xl font-bold text-blue-900">Account Manager</h3>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          Get a dedicated Account Relationship Manager (ARM) to help you with daily operations and settlements.
        </p>
      </div>

      {/* Benefit 3 - Emerald UI */}
      <div className="bg-gradient-to-br from-emerald-50 via-white to-white rounded-3xl p-6 border border-emerald-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.25)] hover:-translate-y-2 transition-all duration-500 flex flex-col items-start group">
        <div className="w-full h-40 rounded-2xl overflow-hidden mb-5 border border-emerald-200 relative">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=600&h=300"
            alt="Marketing Support"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/30 via-emerald-500/5 to-transparent" />
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors">
            <Users className="w-6 h-6 text-emerald-700" />
          </div>
          <h3 className="text-xl font-bold text-emerald-900">Driver Onboarding</h3>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          We handle driver recruitment, verification, and offline inspection so you can focus on growing.
        </p>
      </div>

      {/* Benefit 4 - Violet UI */}
      <div className="bg-gradient-to-br from-violet-50 via-white to-white rounded-3xl p-6 border border-violet-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(139,92,246,0.25)] hover:-translate-y-2 transition-all duration-500 flex flex-col items-start group">
        <div className="w-full h-40 rounded-2xl overflow-hidden mb-5 border border-violet-200 relative">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600&h=300"
            alt="Branding Kit"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-violet-500/30 via-violet-500/5 to-transparent" />
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-violet-100 rounded-xl group-hover:bg-violet-200 transition-colors">
            <Building2 className="w-6 h-6 text-violet-700" />
          </div>
          <h3 className="text-xl font-bold text-violet-900">Office Branding</h3>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          Receive a complete office branding kit and digital marketing ad budget to establish your presence.
        </p>
      </div>
    </div>
  </div>
</section>

            {/* SECTION 4: TESTIMONIALS OF VENDORS */}
            <section className="relative z-10 py-20 px-4">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                  <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md text-amber-900 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-amber-200 shadow-sm">
                    <Award className="w-4 h-4" /> Success Stories
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Trusted by Our Vendors</h2>
                  <p className="text-xl text-slate-600 mt-4">Hear from partners who are already growing with BroomBoom.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Testimonial 1 */}
                  <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/60 flex flex-col sm:flex-row gap-6 items-start relative hover:shadow-[0_20px_50px_rgba(245,158,11,0.15)] hover:-translate-y-1 transition-all duration-500">
                    <Quote className="absolute top-6 right-6 w-12 h-12 text-amber-100" />
                    <img 
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150&h=150" 
                      alt="Rajesh Kumar" 
                      className="w-20 h-20 rounded-full object-cover shrink-0 border-4 border-white shadow-lg"
                    />
                    <div>
                      <div className="flex gap-1 mb-3">
                        {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                      </div>
                      <p className="text-slate-700 italic leading-relaxed mb-4 text-sm">"Joining BroomBoom was the best decision for my fleet business. The Gold package gave me the edge I needed to secure corporate contracts."</p>
                      <div>
                        <div className="font-bold text-slate-900">Rajesh Kumar</div>
                        <div className="text-xs text-amber-600 font-bold bg-amber-50 inline-block px-2 py-1 rounded mt-1">Gold Partner, Kolkata</div>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial 2 */}
                  <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/60 flex flex-col sm:flex-row gap-6 items-start relative hover:shadow-[0_20px_50px_rgba(245,158,11,0.15)] hover:-translate-y-1 transition-all duration-500">
                    <Quote className="absolute top-6 right-6 w-12 h-12 text-amber-100" />
                    <img 
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150" 
                      alt="Amit Singh" 
                      className="w-20 h-20 rounded-full object-cover shrink-0 border-4 border-white shadow-lg"
                    />
                    <div>
                      <div className="flex gap-1 mb-3">
                        {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                      </div>
                      <p className="text-slate-700 italic leading-relaxed mb-4 text-sm">"The dedicated support team and driver onboarding assistance are incredible. I was able to expand my operations to 3 cities within 6 months."</p>
                      <div>
                        <div className="font-bold text-slate-900">Amit Singh</div>
                        <div className="text-xs text-amber-600 font-bold bg-amber-50 inline-block px-2 py-1 rounded mt-1">Platinum Master, Lucknow</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 5: FAQs */}
            <section className="relative z-10 py-20 px-4 bg-white/80 backdrop-blur-xl border-t border-amber-100">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h2>
                  <p className="text-xl text-slate-600 mt-4">Got questions? We have answers.</p>
                </div>
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-3">
                      <HelpCircle className="w-6 h-6 text-amber-500 shrink-0" />
                      When will I get my dashboard access?
                    </h3>
                    <p className="text-slate-600 mt-3 leading-relaxed pl-9 text-sm">Immediately after payment verification, our team will send your login credentials via email within 24 hours.</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-3">
                      <HelpCircle className="w-6 h-6 text-amber-500 shrink-0" />
                      How is the territory exclusivity maintained?
                    </h3>
                    <p className="text-slate-600 mt-3 leading-relaxed pl-9 text-sm">Once you select a package, your specific city/district is locked in our system. No other vendor will be assigned that territory.</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-3">
                      <HelpCircle className="w-6 h-6 text-amber-500 shrink-0" />
                      Is the fee refundable?
                    </h3>
                    <p className="text-slate-600 mt-3 leading-relaxed pl-9 text-sm">Yes, the territory license fee is fully refundable within 7 days if you decide not to proceed after reviewing the onboarding materials.</p>
                  </div>
                </div>
              </div>
            </section>

          </div>
        ) : (
          /* Main Application Form */
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
            {/* Title Banner */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 bg-white border border-amber-300 text-amber-900 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                Territory Exclusivity Application 2026-27
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950">
                Apply for Your <span className="text-yellow-gradient">BroomBoom Vendor Partner</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
                Fill in the details below to register your territory interest. Your completed application will be dispatched directly to our Senior Expansion Director for fast-track evaluation.
              </p>
            </div>

            {/* STEP 1: Select Package */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brand-yellow text-black font-black text-xs flex items-center justify-center">
                    1
                  </span>
                  Select Vendor Package
                </h3>
                <span className="text-xs text-amber-800 font-bold">Click card to select</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {FRANCHISE_PACKAGES.map((pkg) => {
                  const isSelected = selectedPackage === pkg.id;
                  const prices = getPrices(pkg.id);
                  
                  let cardStyles = "cursor-pointer rounded-3xl p-6 border-2 transition-all relative ";
                  if (pkg.id === "silver") {
                    cardStyles += isSelected
                      ? "bg-gradient-to-br from-slate-100 to-slate-300 border-slate-500 shadow-xl ring-4 ring-slate-400/20 scale-[1.02]"
                      : "bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 hover:border-slate-400 opacity-90 hover:opacity-100";
                  } else if (pkg.id === "platinum") {
                    cardStyles += isSelected
                      ? "bg-gradient-to-br from-cyan-50 to-cyan-200 border-cyan-500 shadow-xl ring-4 ring-cyan-400/20 scale-[1.02]"
                      : "bg-gradient-to-br from-slate-50 to-cyan-50 border-cyan-200 hover:border-cyan-400 opacity-90 hover:opacity-100";
                  } else {
                    cardStyles += isSelected
                      ? "bg-gradient-to-br from-yellow-200 to-amber-400 border-amber-600 shadow-xl ring-4 ring-amber-500/30 scale-[1.02]"
                      : "bg-gradient-to-br from-yellow-50 to-amber-100 border-amber-200 hover:border-amber-400 opacity-90 hover:opacity-100";
                  }

                  let checkStyles = "w-6 h-6 rounded-full border-2 flex items-center justify-center ";
                  if (isSelected) {
                    if (pkg.id === "silver") checkStyles += "bg-slate-600 border-slate-600 text-white";
                    else if (pkg.id === "platinum") checkStyles += "bg-cyan-600 border-cyan-600 text-white";
                    else checkStyles += "bg-amber-600 border-amber-600 text-white";
                  } else {
                    checkStyles += "border-slate-300 bg-white/70";
                  }

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => {
                        setSelectedPackage(pkg.id);
                        const defs = getPackageDefaults(pkg.id);
                        setFormData((prev) => ({
                          ...prev,
                          investmentBudget: defs.investmentBudget,
                          carpetArea: defs.carpetArea,
                        }));
                      }}
                      className={cardStyles}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-4 right-6 bg-brand-yellow text-black text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider border-2 border-amber-400 shadow-md">
                          ★ Most Popular
                        </div>
                      )}

                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-emerald-600 text-white text-[11px] font-black px-2.5 py-1 rounded-md uppercase tracking-wide shadow-sm">
                          {pkg.discountTag || "50% OFF"}
                        </span>
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-black px-2.5 py-1 rounded-md uppercase tracking-wide shadow-sm">
                          {pkg.dealTag || "Exclusive Deal"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xl font-black text-slate-950">{pkg.name}</h4>
                        <div className={checkStyles}>
                          {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-1 mt-3 mb-2">
                        <span className="text-sm font-bold text-slate-500/80 line-through decoration-rose-500 decoration-2 leading-none">
                          {prices.original}
                        </span>
                        <span className="text-4xl font-black text-amber-900 leading-none">
                          {prices.discounted}
                        </span>
                      </div>

                      {pkg.savings && (
                        <div className="mt-3">
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-1 rounded border border-emerald-300/50">
                            {pkg.savings}
                          </span>
                        </div>
                      )}

                      <p className="text-sm text-slate-700 font-medium mt-4">{pkg.tagline}</p>

                      <div className="mt-5 pt-4 border-t border-slate-900/10 text-xs space-y-2 text-slate-800">
                        <div className="flex justify-between">
                          <span>Space:</span>
                          <span className="font-bold">{pkg.spaceRequired}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Commission:</span>
                          <span className="font-bold text-emerald-700">{pkg.commissionSlab}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form Container */}
            <form
              action="javascript:void(0)"
              method="POST"
              onSubmit={handleSubmit}
              className="bg-white border border-amber-200 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8"
            >
              {/* STEP 2: Personal & Contact Information */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-6 h-6 rounded-full bg-brand-yellow text-black font-black text-xs flex items-center justify-center">
                    2
                  </span>
                  Applicant &amp; Contact Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Full Name <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Arvind Sharma"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Mobile / WhatsApp Number <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Address <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Alternate Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. Landline / Office number"
                      value={formData.alternatePhone}
                      onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* STEP 3: Territory & Location */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-6 h-6 rounded-full bg-brand-yellow text-black font-black text-xs flex items-center justify-center">
                    3
                  </span>
                  Proposed City &amp; Territory
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      State <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. West Bengal, Bihar, UP"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      City / District <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kolkata, Asansol, Siliguri"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Postal PIN Code <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 700001"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Proposed Office / Kiosk Location / Market Area
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Main High Street near Railway Station, Shop No 12, Commercial Market"
                    value={formData.proposedAddress}
                    onChange={(e) => setFormData({ ...formData, proposedAddress: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-sm"
                  />
                </div>
              </div>

              {/* STEP 4: Store Space & Investment Readiness */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-6 h-6 rounded-full bg-brand-yellow text-black font-black text-xs flex items-center justify-center">
                    4
                  </span>
                  Commercial Space &amp; Investment Readiness
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Commercial Space Availability
                    </label>
                    <select
                      value={formData.spaceStatus}
                      onChange={(e) => setFormData({ ...formData, spaceStatus: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 text-sm"
                    >
                      <option value="Owned commercial space ready">Owned commercial space ready</option>
                      <option value="Rented commercial shop/office ready">Rented commercial shop/office ready</option>
                      <option value="Currently finalizing location / exploring rental">Currently exploring location</option>
                      <option value="Operating from existing travel/retail counter">Operating from existing travel agency counter</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Estimated Carpet Area (sq.ft)
                    </label>
                    <select
                      value={formData.carpetArea}
                      onChange={(e) => setFormData({ ...formData, carpetArea: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 text-sm"
                    >
                      <option value="100 - 150 sq.ft (Ideal for Silver Kiosk)">100 - 150 sq.ft (Ideal for Silver Kiosk)</option>
                      <option value="300 - 500 sq.ft (Ideal for Gold Hub)">300 - 500 sq.ft (Ideal for Gold Hub)</option>
                      <option value="800 - 1,200 sq.ft (Ideal for Platinum Master)">800 - 1,200 sq.ft (Ideal for Platinum Master)</option>
                      <option value="Above 1,200 sq.ft">Above 1,200 sq.ft</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Ready Investment Capital
                    </label>
                    <select
                      value={formData.investmentBudget}
                      onChange={(e) => setFormData({ ...formData, investmentBudget: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 text-sm"
                    >
                      <option value="₹10,000 (Silver Partner - 50% OFF Exclusive Deal)">₹10,000 (Silver Partner • 50% OFF Exclusive Deal)</option>
                      <option value="₹20,000 (Gold Package - 50% OFF Exclusive Deal)">₹20,000 (Gold Partner • 50% OFF Exclusive Deal ★)</option>
                      <option value="₹50,000 (Platinum Package - 50% OFF Exclusive Deal)">₹50,000 (Platinum Master • 50% OFF Exclusive Deal)</option>
                      <option value="Above ₹50,000 (State Master Operator)">Above ₹50,000 (State Master Operator)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Travel / Cab / Logistics Experience
                    </label>
                    <select
                      value={formData.hasExperience}
                      onChange={(e) => setFormData({ ...formData, hasExperience: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 text-sm"
                    >
                      <option value="Yes, currently in travel / taxi / logistics">Yes, currently in travel / cab business</option>
                      <option value="Running another retail / business franchise">Running another business/retail franchise</option>
                      <option value="New entrepreneur eager to learn with HQ training">New entrepreneur (Need training)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Current Profession / Business Background
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Travel Agent, Fleet Operator, Retail Business Owner, Corporate Professional"
                    value={formData.currentProfession}
                    onChange={(e) => setFormData({ ...formData, currentProfession: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-sm"
                  />
                </div>

                {/* Financing & Loan Desk Support */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                      <span>Financing / Capital Readiness</span>
                      <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Finance Lead</span>
                    </label>
                    <select
                      value={formData.financeRequired}
                      onChange={(e) => setFormData({ ...formData, financeRequired: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 text-sm"
                    >
                      <option value="Self-Funded / Ready Capital">Self-Funded (100% Ready Capital)</option>
                      <option value="Require Bank Loan Assistance">Require Bank Loan Assistance (HQ Project Report)</option>
                      <option value="Require NBFC / Loan Partner">Require NBFC Loan Partner (Up to 50% Funding)</option>
                      <option value="Govt Scheme / Subsidies (PMEGP / Mudra)">Govt Scheme / Subsidies (PMEGP / Mudra Loan)</option>
                      <option value="Exploring Financing Options">Exploring Financing Options</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                      <span>BroomBoom Loan Desk Support?</span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Pre-Approval</span>
                    </label>
                    <select
                      value={formData.loanAssistance}
                      onChange={(e) => setFormData({ ...formData, loanAssistance: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 text-sm"
                    >
                      <option value="No (Self-Funded)">No — Fully Self-Funded (No loan needed)</option>
                      <option value="Yes (Need Bank Loan Assistance)">Yes — Need Project Report &amp; Bank Tie-up Guidance</option>
                      <option value="Yes (Need NBFC Quick Approval)">Yes — Need NBFC Fast-Track Loan Support</option>
                      <option value="Need Advisory Discussion">Need Advisory Call with Finance Lead Officer</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* STEP 5: Comments & Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Questions or Additional Requirements for HQ
                </label>
                <textarea
                  rows={3}
                  placeholder="Mention any specific areas, questions on driver onboarding, or questions about expected launch timeline..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-sm resize-none"
                />
              </div>

              {/* Error Notification Banner */}
              {formError && (
                <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-900 text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="w-8 h-8 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-rose-950">Action Required</div>
                    <div className="font-medium text-rose-800">{formError}</div>
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 bg-brand-yellow hover:bg-brand-yellow-hover text-black font-black text-base rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 group disabled:opacity-75 cursor-pointer transform active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving Application to Database...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      <span>
                        Submit &amp; Apply for {currentPkgDetails.name} (Save &amp; Email)
                      </span>
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-slate-500">
                  🔒 Data is securely registered in the BroomBoom Territory Operations Portal.
                </p>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800 relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-2xl font-black tracking-tight text-white">
              Broom<span className="text-amber-500">Boom</span>
            </span>
          </div>
          <p className="text-sm mb-2">© {new Date().getFullYear()} BroomBoom Mobility Technologies Ltd. All rights reserved.</p>
          <p className="text-sm">For urgent vendor partner inquiries: <span className="font-bold text-amber-500">1800-BROOM-BOOM</span> | <span className="font-bold text-amber-500">vendor@broomboom.com</span></p>
        </div>
      </footer>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800 font-bold text-lg animate-pulse">Loading application form...</div>}>
      <ApplyFormContent />
    </Suspense>
  );
}