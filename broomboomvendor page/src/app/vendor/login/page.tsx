"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Sparkles,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

function VendorLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appIdParam = searchParams.get("appId") || "";

  const [username, setUsername] = useState(appIdParam || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (appIdParam && !username) {
      setUsername(appIdParam);
    }
  }, [appIdParam, username]);

  const handleFillDemo = (customId?: string, customPass?: string) => {
    setUsername(customId || "vendor@broomboom.com");
    setPassword(customPass || "broomboom2026");
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!username.trim()) {
      setError("Please enter your User ID, Mobile number, or Application ID.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/vendor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Login failed. Please check your credentials.");
      }

      // Store vendor session locally
      if (typeof window !== "undefined") {
        localStorage.setItem("bb_vendor_session", JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem("bb_vendor_token", data.token);
        }
      }

      setSuccessMsg("Authentication successful! Redirecting to Vendor Dashboard...");
      setTimeout(() => {
        router.push("/vendor/dashboard");
      }, 700);
    } catch (err: any) {
      setError(err.message || "Unable to connect to server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/70 via-slate-50 to-amber-100/40 text-slate-900 flex flex-col justify-between py-8 px-4 sm:px-6 relative overflow-hidden font-sans">
      {/* Background ambient blurs */}
      <div className="absolute top-[-15%] left-[-10%] w-[45vw] h-[45vw] bg-amber-400/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[45vw] h-[45vw] bg-yellow-500/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between z-10 mb-6">
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
                Partner Portal
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Vendor Operations HQ</p>
          </div>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-amber-800 border border-slate-300 hover:border-amber-400 px-3.5 py-2 rounded-xl transition-all bg-white/80 backdrop-blur-sm shadow-sm hover:shadow"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Login Card */}
      <main className="max-w-md w-full mx-auto z-10 my-auto">
        <div className="bg-white/90 backdrop-blur-xl border border-amber-200/80 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-amber-900/5 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 mb-2">
              <Lock className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Vendor Partner Login
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Access your franchise territory dashboard, active plan details, and onboarding review status.
            </p>
          </div>

          {/* If arriving with an Application ID parameter */}
          {appIdParam && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-black text-emerald-950">Application Detected</div>
                <div className="text-emerald-800 text-[11px] mt-0.5">
                  Application ID: <strong className="font-mono font-bold text-emerald-950">{appIdParam}</strong>
                </div>
                <div className="text-emerald-700 text-[10px] mt-0.5">
                  Enter your credentials dispatched via Email &amp; WhatsApp to continue.
                </div>
              </div>
            </div>
          )}

          {/* Optional Demo Credentials Helper */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs">
            <div className="text-[11px]">
              <span className="font-extrabold text-amber-950 block flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Testing Demo Account?
              </span>
              <span className="font-mono text-slate-600 text-[10px]">vendor@broomboom.com</span>
            </div>
            <button
              type="button"
              onClick={() => handleFillDemo("vendor@broomboom.com", "broomboom2026")}
              className="text-[11px] font-bold text-amber-950 bg-amber-200/80 hover:bg-amber-300 border border-amber-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              Auto Fill Demo
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                User ID / Mobile Number / Application ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. vendor@broomboom.com or 9876543210"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Password</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  (Default: <code className="font-mono text-amber-800 font-bold">broomboom2026</code>)
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-slate-50/80 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Partner Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Vendor Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Trust footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit SSL Encrypted Partner Gateway</span>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Need partner onboarding assistance? Call HQ at{" "}
          <a href="tel:18002706600" className="font-bold text-amber-700 hover:underline">
            1800-BROOM-BOOM
          </a>
        </p>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 py-4 z-10">
        © {new Date().getFullYear()} BroomBoom Mobility Technologies Ltd. All rights reserved.
      </footer>
    </div>
  );
}

export default function VendorLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-700 font-bold">
          Loading login portal...
        </div>
      }
    >
      <VendorLoginForm />
    </Suspense>
  );
}

