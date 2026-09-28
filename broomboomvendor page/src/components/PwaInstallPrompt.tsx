"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Download, X, Share2, PlusSquare } from "lucide-react";

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(true);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already running as standalone PWA
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      setShowBanner(false);
      return;
    }

    // Register Service Worker for PWA
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("PWA Service Worker registered:", reg.scope))
        .catch((err) => console.log("PWA SW registration failed:", err));
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // Listen for beforeinstallprompt event (Android / Chromium / Desktop Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).deferredPrompt = e;
      setShowBanner(true);
    };

    // Listen for custom trigger from any button across the app
    const handleCustomTrigger = async () => {
      const promptEvent = deferredPrompt || (window as any).deferredPrompt;
      if (promptEvent) {
        promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult.outcome === "accepted") {
          setIsInstalled(true);
          setShowBanner(false);
        }
        setDeferredPrompt(null);
        (window as any).deferredPrompt = null;
      } else if (isAppleDevice) {
        setShowIOSModal(true);
      } else {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("trigger-pwa-install", handleCustomTrigger);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("trigger-pwa-install", handleCustomTrigger);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || (window as any).deferredPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      const choiceResult = await promptEvent.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsInstalled(true);
        setShowBanner(false);
      }
      setDeferredPrompt(null);
      (window as any).deferredPrompt = null;
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      alert("To install the BroomBoom Vendor App: Click the Install icon (⊕) in your browser address bar or menu (⋮) -> 'Install BroomBoom Vendor'.");
    }
  };

  if (isInstalled) return null;

  return (
    <>
      {/* Universal Install Banner for Mobile, Tablet, Laptop, and Desktop */}
      {showBanner && (
        <div className="fixed top-14 sm:top-16 md:top-20 left-0 right-0 z-50 px-3 sm:px-4 py-2 flex justify-center animate-in slide-in-from-top-2 duration-300 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-lg md:max-w-xl bg-slate-950/95 backdrop-blur-md border border-amber-400/40 rounded-2xl p-2.5 sm:px-4 sm:py-3 shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-amber-400 bg-white flex items-center justify-center p-0.5 shrink-0 shadow-sm">
                <Image
                  src="/broomboom-logo.png"
                  alt="BroomBoom Vendor App"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-xs sm:text-sm font-black text-white">BroomBoom Vendor</span>
                  <span className="bg-amber-400 text-black text-[9px] sm:text-[10px] font-black px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded">APP</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-300 font-medium leading-tight mt-0.5">
                  Install for 1-tap orders &amp; fleet control
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleInstallClick}
                className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-slate-950 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-sm hover:shadow-yellow-glow active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                <span>Install</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400 bg-white flex items-center justify-center p-0.5">
                  <Image src="/broomboom-logo.png" alt="BroomBoom" fill className="object-contain" />
                </div>
                <div>
                  <h3 className="text-sm font-black">Install BroomBoom App</h3>
                  <p className="text-xs text-slate-400">Install on your iPhone / iPad</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-3 p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                <Share2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  1. Tap the <strong>Share</strong> button at the bottom of Safari.
                </span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                <PlusSquare className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  2. Scroll down and tap <strong>Add to Home Screen</strong>.
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-brand-yellow hover:bg-brand-yellow-hover text-black font-black text-xs rounded-xl shadow-md cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
