"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Download, X, Share2, PlusSquare, Monitor, Smartphone } from "lucide-react";

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showDesktopGuideModal, setShowDesktopGuideModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      setShowBanner(false);
      return;
    }

    // Register Service Worker for PWA (production and non-localhost only)
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.endsWith(".local");

      if (isLocalhost || process.env.NODE_ENV !== "production") {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
        if ("caches" in window) {
          caches.keys().then((keys) => {
            keys.forEach((key) => caches.delete(key));
          });
        }
      } else {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("PWA Service Worker registered:", reg.scope))
          .catch((err) => console.log("PWA SW registration failed:", err));
      }
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).deferredPrompt = e;
      const dismissed =
        sessionStorage.getItem("bb_pwa_banner_dismissed") === "1";
      // Only surface floating prompt automatically on mobile viewports
      if (!dismissed && window.innerWidth < 768) {
        setShowBanner(true);
      }
    };

    const handleCustomTrigger = async () => {
      const promptEvent = (window as any).deferredPrompt;
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
        setShowDesktopGuideModal(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("trigger-pwa-install", handleCustomTrigger);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("trigger-pwa-install", handleCustomTrigger);
    };
  }, []);

  const handleDismissBanner = () => {
    setShowBanner(false);
    try {
      sessionStorage.setItem("bb_pwa_banner_dismissed", "1");
    } catch {}
  };

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
      setShowDesktopGuideModal(true);
    }
  };

  if (isInstalled) return null;

  return (
    <>
      {/* Mobile-only unobtrusive install banner shown only when installable prompt fires */}
      {showBanner && (
        <div className="md:hidden fixed bottom-[72px] left-3 right-3 z-30 flex justify-center pointer-events-none">
          <div className="pointer-events-auto w-full max-w-md bg-slate-950/95 backdrop-blur-md border border-amber-400/50 rounded-2xl p-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.45)] flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-amber-400 bg-white flex items-center justify-center p-0.5 shrink-0 shadow-sm">
                <Image
                  src="/broomboom-vendor-logo.png"
                  alt="BroomBoom Vendor App"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-left min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white truncate">
                    BroomBoom Vendor
                  </span>
                  <span className="bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded leading-none shrink-0">
                    APP
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 font-medium leading-tight mt-0.5 truncate">
                  Install for 1-tap orders &amp; alerts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Install</span>
              </button>
              <button
                type="button"
                onClick={handleDismissBanner}
                aria-label="Dismiss install app banner"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Instructions Modal */}
      {showIOSModal && (
        <div
          className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowIOSModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full text-white shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400 bg-white flex items-center justify-center p-0.5">
                  <Image
                    src="/broomboom-vendor-logo.png"
                    alt="BroomBoom"
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-black">Install BroomBoom App</h3>
                  <p className="text-xs text-slate-400">
                    Install on your iPhone / iPad
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-3 p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                <Share2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  1. Tap the <strong>Share</strong> button in Safari.
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
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-brand-yellow hover:bg-brand-yellow-hover text-black font-black text-xs rounded-xl shadow-md cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Desktop / Browser Install Guide Modal */}
      {showDesktopGuideModal && (
        <div
          className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowDesktopGuideModal(false)}
        >
          <div
            className="bg-slate-900 border border-amber-400/50 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-amber-400 bg-white flex items-center justify-center p-0.5">
                  <Image
                    src="/broomboom-vendor-logo.png"
                    alt="BroomBoom Vendor"
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-black">
                    Install BroomBoom Vendor App
                  </h3>
                  <p className="text-xs text-slate-400">
                    1-Tap Chrome, Edge &amp; Android App
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDesktopGuideModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-3 p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                <Monitor className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Chrome / Edge (Desktop):</strong> Click the{" "}
                  <strong>Install</strong> icon in the address bar or open browser
                  menu (&vellip;) &rarr; <strong>Install BroomBoom Vendor</strong>.
                </span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                <Smartphone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Android Chrome:</strong> Open menu (&vellip;) &rarr;{" "}
                  <strong>Add to Home screen / Install app</strong> for instant
                  booking dispatch access.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDesktopGuideModal(false)}
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
