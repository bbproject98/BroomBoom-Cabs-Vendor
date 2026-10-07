"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isPaymentDone = localStorage.getItem("bb_partner_payment_done") === "true";
      const thankYouUrl = localStorage.getItem("bb_partner_thankyou_url");
      const cached = localStorage.getItem("bb_verified_partner_profile");

      if (isPaymentDone) {
        router.replace(thankYouUrl || "/thank-you?status=success&from=profile");
        return;
      }

      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (
            parsed.isPaid ||
            parsed.userStatus === "PAID_UNDER_PROCESS" ||
            parsed.userStatus === "APPROVED" ||
            (parsed.redirectUrl && parsed.redirectUrl.includes("/thank-you"))
          ) {
            const targetUrl =
              thankYouUrl ||
              parsed.redirectUrl ||
              `/thank-you?applicationId=${encodeURIComponent(
                parsed.profile?.applicationId || ""
              )}&status=success&from=profile`;
            router.replace(targetUrl);
            return;
          }

          if (parsed.profile?.applicationId || parsed.redirectUrl) {
            const targetUrl =
              parsed.redirectUrl ||
              `/apply?package=${encodeURIComponent(
                parsed.plan?.tier || "gold"
              )}&applicationId=${encodeURIComponent(
                parsed.profile?.applicationId || ""
              )}&step=confirm&from=profile`;
            router.replace(targetUrl);
            return;
          }
        } catch {}
      }

      router.replace("/");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white p-6">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-300">
          Redirecting to your partner profile...
        </span>
      </div>
    </div>
  );
}
