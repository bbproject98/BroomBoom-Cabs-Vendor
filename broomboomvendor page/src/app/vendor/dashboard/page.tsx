"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  ArrowRight,
  LogOut,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  Calendar,
  Layers,
  FileText,
  BadgeCheck,
  ArrowUpRight,
  Send,
  Loader2,
  RefreshCw,
  KeyRound,
  Check,
  LayoutDashboard,
  CreditCard,
  ClipboardCheck,
  Ticket as TicketIcon,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

interface PlanDetails {
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
  startDate: string;
  endDate: string | null;
  status: string;
}

interface VendorProfile {
  vendorName: string;
  vendorMobile: string;
  vendorEmail: string;
  city: string;
  state: string;
  applicationId: string;
  spaceStatus: string;
  carpetArea: string;
  currentProfession: string;
  appliedAt: string;
}

interface ReviewStatus {
  status: string;
  title: string;
  description: string;
  step: number;
}

interface Ticket {
  id: string;
  ticketId: string;
  applicationId: string;
  currentPlan: string;
  requestedPlan: string;
  reason: string;
  status: string;
  adminNotes?: string;
  upgradeAmount?: number;
  gatewayFee?: number;
  gstAmount?: number;
  totalAmount?: number;
  paymentStatus?: string;
  paymentId?: string;
  paidAt?: string;
  newUserId?: string;
  newPassword?: string;
  approvedAt?: string;
  createdAt: string;
}

type MenuTab = "overview" | "profile";

function VendorDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<MenuTab>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [sessionUser, setSessionUser] = useState<any>(null);
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [plan, setPlan] = useState<PlanDetails | null>(null);
  const [review, setReview] = useState<ReviewStatus | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Raise Ticket Modal state
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [requestedPlan, setRequestedPlan] = useState("gold");
  const [ticketReason, setTicketReason] = useState("");
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);

  // Pay Now Ticket action state
  const [payingTicketId, setPayingTicketId] = useState<string | null>(null);
  const [newCredentialsModal, setNewCredentialsModal] = useState<{
    userId: string;
    password: string;
    newPlan: string;
    newPlanName: string;
  } | null>(null);

  // Initial tab from query param if present
  useEffect(() => {
    const tabParam = searchParams.get("tab") as MenuTab;
    if (tabParam && ["overview", "profile"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Check login session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("bb_vendor_session");
      if (!stored) {
        router.replace("/vendor/login");
        return;
      }
      try {
        const user = JSON.parse(stored);
        setSessionUser(user);
      } catch {
        router.replace("/vendor/login");
      }
    }
  }, [router]);

  // Fetch full live profile & tickets
  const fetchDashboardData = useCallback(async () => {
    if (!sessionUser) return;
    try {
      setRefreshing(true);
      const res = await fetch(
        `/api/vendor/profile?appId=${encodeURIComponent(
          sessionUser.applicationId || ""
        )}&userId=${encodeURIComponent(
          sessionUser.userId || ""
        )}&mobile=${encodeURIComponent(sessionUser.vendorMobile || "")}`
      );
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        setPlan(data.plan);
        setReview(data.review);
        setTickets(data.tickets || []);

        // Self-heal and sync sessionUser in state & localStorage if plan tier or applicationId differs
        if (
          data.plan &&
          (sessionUser.currentPlan?.toLowerCase() !== data.plan.tier?.toLowerCase() ||
            (data.profile?.applicationId && sessionUser.applicationId !== data.profile.applicationId))
        ) {
          const updated = {
            ...sessionUser,
            currentPlan: data.plan.tier,
            applicationId: data.profile?.applicationId || sessionUser.applicationId,
            vendorName: data.profile?.vendorName || sessionUser.vendorName,
          };
          setSessionUser(updated);
          if (typeof window !== "undefined") {
            localStorage.setItem("bb_vendor_session", JSON.stringify(updated));
          }
        }
      }
    } catch (err) {
      console.error("[FETCH DASHBOARD DATA ERROR]", err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [sessionUser]);

  useEffect(() => {
    if (sessionUser) {
      fetchDashboardData();
    }
  }, [sessionUser, fetchDashboardData]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("bb_vendor_session");
      localStorage.removeItem("bb_vendor_token");
    }
    router.replace("/vendor/login");
  };

  const handleRaiseTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketError(null);
    setTicketSuccess(null);

    if (!requestedPlan) {
      setTicketError("Please select the target plan.");
      return;
    }

    if (plan?.tier.toLowerCase() === requestedPlan.toLowerCase()) {
      setTicketError(`You are already subscribed to the ${requestedPlan.toUpperCase()} plan.`);
      return;
    }

    setIsSubmittingTicket(true);
    try {
      const res = await fetch("/api/vendor/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: profile?.applicationId || sessionUser.applicationId,
          vendorName: profile?.vendorName || sessionUser.vendorName,
          vendorMobile: profile?.vendorMobile || sessionUser.vendorMobile,
          vendorEmail: profile?.vendorEmail || sessionUser.vendorEmail,
          currentPlan: plan?.tier || sessionUser.currentPlan || "silver",
          requestedPlan,
          reason: ticketReason || `Partner requested upgrade to ${requestedPlan.toUpperCase()} plan.`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit plan change ticket.");
      }

      setTicketSuccess(
        `Ticket #${data.ticket.ticketId} created! Admin will review your plan change request.`
      );
      setTicketReason("");
      fetchDashboardData();
      setTimeout(() => {
        setShowTicketModal(false);
        setTicketSuccess(null);
      }, 8240765499);
    } catch (err: any) {
      setTicketError(err.message || "Failed to submit ticket");
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  // Vendor Pay Now action for approved plan change ticket
  const handlePayTicketUpgrade = async (ticket: Ticket) => {
    setPayingTicketId(ticket.ticketId);
    try {
      const res = await fetch("/api/vendor/tickets/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: ticket.ticketId,
          paymentMethod: "CASHFREE_UPI",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to process payment");
      }

      alert(
        data.message ||
          `Payment of ₹${(ticket.totalAmount || 0).toLocaleString(
            "en-IN"
          )} confirmed! Admin HQ has been notified to generate and dispatch your new login credentials.`
      );

      fetchDashboardData();
    } catch (err: any) {
      alert(`Payment error: ${err.message}`);
    } finally {
      setPayingTicketId(null);
    }
  };

  if (isLoading || !sessionUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="text-slate-600 font-bold text-sm">Loading Vendor Partner Portal...</p>
      </div>
    );
  }

  const currentTier = (plan?.tier || sessionUser.currentPlan || "gold").toLowerCase();
  const isSilver = currentTier === "silver";
  const isPlatinum = currentTier === "platinum";
  const isGold = !isSilver && !isPlatinum;

  const tierColors = isSilver
    ? {
        badge: "bg-slate-200 text-slate-800 border-slate-300",
        border: "border-slate-300",
        accent: "text-slate-700",
        cardBg: "from-slate-50 to-slate-100",
      }
    : isPlatinum
    ? {
        badge: "bg-cyan-100 text-cyan-900 border-cyan-300",
        border: "border-cyan-300",
        accent: "text-cyan-700",
        cardBg: "from-cyan-50/60 to-emerald-50/40",
      }
    : {
        badge: "bg-amber-100 text-amber-950 border-amber-300",
        border: "border-amber-300",
        accent: "text-amber-700",
        cardBg: "from-amber-50/80 to-yellow-50/40",
      };

  // ONLY Dashboard Overview and Profile Details in Menu Bar (Removed Plan, Review Status, Tickets)
  const menuItems: { id: MenuTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: "overview",
      label: "Dashboard Overview",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: "profile",
      label: "Profile Details",
      icon: <User className="w-4 h-4" />,
      badge: currentTier.toUpperCase(),
    },
  ];

  // Reusable sub-component: Active Plan Card
  const renderActivePlanCard = () => (
    <div
      className={`bg-gradient-to-br ${tierColors.cardBg} rounded-3xl p-6 sm:p-8 border-2 ${tierColors.border} shadow-lg space-y-6 relative overflow-hidden`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900/10 pb-4">
        <div>
          <span
            className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border shadow-xs ${tierColors.badge}`}
          >
            ★ {currentTier.toUpperCase()} PARTNER
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mt-2">
            {plan?.name || "Gold Partner (District Exclusive Hub)"}
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            <span>Territory Scope: </span>
            <strong className="text-slate-900 font-black">{plan?.territoryScope}</strong>
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Subscription ID</span>
          <span className="font-mono text-xs font-black text-slate-950">
            {plan?.subscriptionId || "SUB-BB-2026-ACTIVE"}
          </span>
        </div>
      </div>

      {/* Financial Charges Card Breakdown */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-700">Financial Payment Breakdown (Cashfree)</span>
          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Settled &amp; Paid
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 font-semibold block">Base Plan Price</span>
            <span className="font-black text-slate-950 text-sm">
              ₹{plan?.baseAmount.toLocaleString("en-IN")}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-semibold block">Gateway Fee (3%)</span>
            <span className="font-bold text-slate-700 text-sm">
              ₹{plan?.gatewayFee.toLocaleString("en-IN")}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-semibold block">Govt GST (5%)</span>
            <span className="font-bold text-slate-700 text-sm">
              ₹{plan?.gstAmount.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="bg-amber-100/80 p-2 rounded-xl border border-amber-200">
            <span className="text-[10px] text-amber-900 font-black block">Total Paid</span>
            <span className="font-black text-amber-950 text-sm sm:text-base">
              ₹{plan?.totalAmount.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Territory Exclusivity & Privileges */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-1.5">
          <BadgeCheck className="w-4 h-4 text-emerald-600" />
          Franchise Privileges &amp; Operational Features:
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 bg-white/80 p-3 rounded-xl border border-white/60 font-semibold text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {plan?.hasExclusivity ? "Guaranteed District Territory Lock" : "Standard Ward Territory Allocation"}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-white/80 p-3 rounded-xl border border-white/60 font-semibold text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>BroomBoom Booking Dispatch Engine</span>
          </div>

          <div className="flex items-center gap-2 bg-white/80 p-3 rounded-xl border border-white/60 font-semibold text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Direct Commission Settlements (Daily)</span>
          </div>

          <div className="flex items-center gap-2 bg-white/80 p-3 rounded-xl border border-white/60 font-semibold text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>1-Year Active Operating License</span>
          </div>
        </div>
      </div>

      {/* Action to Upgrade */}
      <div className="pt-4 border-t border-slate-900/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-600 font-medium">
          Want to change or upgrade your territory plan?
        </div>
        <button
          type="button"
          onClick={() => {
            setRequestedPlan(isSilver ? "gold" : isGold ? "platinum" : "silver");
            setShowTicketModal(true);
          }}
          className="bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
          <span>Request Plan Upgrade</span>
        </button>
      </div>
    </div>
  );

  // Reusable sub-component: Review Status Stepper
  const renderReviewStatusSection = () => {
    const isReviewApproved = review?.status === "approved";

    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            {isReviewApproved ? (
              <span className="bg-emerald-100 text-emerald-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Review Status: Approved &amp; Active
              </span>
            ) : (
              <span className="bg-amber-100 text-amber-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border border-amber-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                Review Status: In Review
              </span>
            )}
          </div>
          <h3 className="text-xl font-black text-slate-950 flex items-center gap-2 mt-1">
            <ClipboardCheck className={`w-5 h-5 ${isReviewApproved ? "text-emerald-600" : "text-amber-600"}`} />
            Application &amp; Territory Review Status
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Live tracking of your BroomBoom vendor onboarding and territory validation.
          </p>
        </div>

        <div className="space-y-4">
          {/* Step 1 */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-black text-emerald-950">Step 1: Application Registered</div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Application #{profile?.applicationId} has been successfully recorded in PostgreSQL. All applicant and commercial space details are locked.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-black text-emerald-950">Step 2: Payment Verified via Cashfree</div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Total payment of ₹{plan?.totalAmount.toLocaleString("en-IN") || "21,600"} settled and verified. Order ID: {plan?.orderId}.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          {isReviewApproved ? (
            <div className="bg-emerald-50/80 border border-emerald-300 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-black text-emerald-950 flex items-center gap-2">
                  <span>Step 3: {review?.title || "Territory License Approved & Exclusivity Active"}</span>
                  <span className="bg-emerald-200 text-emerald-950 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Approved
                  </span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  {review?.description ||
                    "Your vendor territory license has been approved by Admin HQ! Territory exclusivity is active and all dashboard facilities are live."}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs animate-pulse">
                <Clock className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-black text-amber-950 flex items-center gap-2">
                  <span>Step 3: {review?.title || "Under Review by Operations HQ"}</span>
                  <span className="bg-amber-200 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    In Review
                  </span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  {review?.description ||
                    "HQ Operations is validating your commercial carpet area & territory exclusivity. Estimated completion: 24 to 48 hours."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Reusable sub-component: Plan Change Tickets Section
  const renderTicketsSection = () => (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-xl font-black text-slate-950 flex items-center gap-2">
            <TicketIcon className="w-5 h-5 text-amber-600" />
            Plan Change &amp; Support Tickets
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit requests to change your plan (e.g. Silver to Gold). Once approved by Admin, you receive new credentials and your new plan activates.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setRequestedPlan(isSilver ? "gold" : isGold ? "platinum" : "silver");
            setShowTicketModal(true);
          }}
          className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <span>+ Raise Plan Change Ticket</span>
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">No Tickets Raised Yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            If you want to upgrade or change your franchise plan (e.g. Silver to Gold), click the button above to submit a ticket.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((t) => {
            const isPending = t.status === "PENDING";
            const isAwaitingPay = t.status === "AWAITING_PAYMENT";
            const isPaid = t.status === "PAYMENT_COMPLETED";
            const isCompleted = t.status === "COMPLETED" || t.status === "APPROVED";
            const isRejected = t.status === "REJECTED";

            return (
              <div
                key={t.id}
                className={`rounded-2xl p-5 sm:p-6 border transition-all ${
                  isPaid
                    ? "bg-purple-50/70 border-purple-300 shadow-sm"
                    : isAwaitingPay
                    ? "bg-blue-50/70 border-blue-300 shadow-sm"
                    : isCompleted
                    ? "bg-emerald-50/70 border-emerald-300"
                    : isRejected
                    ? "bg-rose-50/70 border-rose-300"
                    : "bg-amber-50/70 border-amber-300"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <code className="font-mono font-black text-xs bg-white px-2.5 py-0.5 rounded border border-slate-200 text-slate-900 shadow-2xs">
                        #{t.ticketId}
                      </code>
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                          isPaid
                            ? "bg-purple-100 text-purple-950 border-purple-300"
                            : isAwaitingPay
                            ? "bg-blue-100 text-blue-950 border-blue-300 animate-pulse"
                            : isCompleted
                            ? "bg-emerald-100 text-emerald-950 border-emerald-300"
                            : isRejected
                            ? "bg-rose-100 text-rose-950 border-rose-300"
                            : "bg-amber-100 text-amber-950 border-amber-300"
                        }`}
                      >
                        {isPaid
                          ? "Payment Verified — Awaiting HQ Credentials"
                          : isAwaitingPay
                          ? "Approved by Admin — Payment Required"
                          : isCompleted
                          ? "Plan Upgrade Completed & Active"
                          : isRejected
                          ? "Request Rejected"
                          : "Pending Admin Approval"}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-sm font-black text-slate-950">
                    Requested Tier Change:{" "}
                    <span className="uppercase text-slate-600">{t.currentPlan}</span>{" "}
                    &rarr;{" "}
                    <span className="uppercase text-amber-700 underline font-black">
                      {t.requestedPlan}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    <strong>Reason:</strong> {t.reason}
                  </p>

                  {t.adminNotes && (
                    <div className="text-xs text-slate-700 bg-white/90 p-2.5 rounded-xl border border-slate-200">
                      <strong>HQ Admin Notes:</strong> {t.adminNotes}
                    </div>
                  )}

                  {/* STAGE 1: PENDING ADMIN APPROVAL */}
                  {isPending && (
                    <div className="text-xs text-amber-900 bg-amber-100/70 p-3 rounded-xl border border-amber-200 flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <strong>Under Admin Review:</strong> Your plan change request is being evaluated by Admin HQ. Once approved from the Admin Panel, the Pay Now option will appear here to complete the tier upgrade.
                      </div>
                    </div>
                  )}

                  {/* STAGE 2: ADMIN APPROVED -> PAY NOW BUTTON */}
                  {isAwaitingPay && (() => {
                    const getTierBase = (tier: string) =>
                      tier === "silver" ? 10000 : tier === "platinum" ? 50000 : 20000;
                    const reqBase = getTierBase((t.requestedPlan || "silver").toLowerCase());
                    const curBase = getTierBase((t.currentPlan || "gold").toLowerCase());
                    const defUpgrade = reqBase > curBase ? reqBase - curBase : reqBase;

                    const effectiveBase =
                      t.upgradeAmount && t.upgradeAmount > 0 ? t.upgradeAmount : defUpgrade;
                    const effectiveGw =
                      t.gatewayFee && t.gatewayFee > 0 ? t.gatewayFee : Math.round(effectiveBase * 0.03);
                    const effectiveGst =
                      t.gstAmount && t.gstAmount > 0 ? t.gstAmount : Math.round(effectiveBase * 0.05);
                    const effectiveTotal =
                      t.totalAmount && t.totalAmount > 0
                        ? t.totalAmount
                        : effectiveBase + effectiveGw + effectiveGst;

                    return (
                      <div className="bg-white p-4 rounded-2xl border border-blue-300 shadow-xs space-y-3 mt-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-blue-600" />
                              <span>Upgrade Approved by Admin! Please Pay Upgrade Fee:</span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5">
                              Click Pay Now to complete payment. Once paid, Admin HQ will generate your new credentials.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handlePayTicketUpgrade({
                                ...t,
                                upgradeAmount: effectiveBase,
                                gatewayFee: effectiveGw,
                                gstAmount: effectiveGst,
                                totalAmount: effectiveTotal,
                              })
                            }
                            disabled={payingTicketId === t.ticketId}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0 disabled:opacity-50"
                          >
                            {payingTicketId === t.ticketId ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Processing...</span>
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4" />
                                <span>Pay Now (₹{effectiveTotal.toLocaleString("en-IN")})</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                          <div>
                            <span className="text-slate-500 font-bold block">Base Difference</span>
                            <span className="font-extrabold text-slate-800">
                              ₹{effectiveBase.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-bold block">Gateway Fee (3%)</span>
                            <span className="font-bold text-slate-700">
                              ₹{effectiveGw.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-bold block">Govt GST (5%)</span>
                            <span className="font-bold text-slate-700">
                              ₹{effectiveGst.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="bg-blue-50/80 p-1.5 rounded-lg border border-blue-200">
                            <span className="text-blue-900 font-bold block">Total Payable</span>
                            <span className="font-black text-blue-950 text-sm">
                              ₹{effectiveTotal.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* STAGE 3: PAYMENT COMPLETED -> WAITING FOR HQ CREDENTIALS */}
                  {isPaid && (
                    <div className="bg-purple-100/80 border border-purple-300 rounded-xl p-3.5 text-xs text-purple-950 space-y-1">
                      <div className="font-black flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-purple-700" />
                        <span>Payment Verified (₹{(t.totalAmount || 0).toLocaleString("en-IN")}) — Sent to Admin HQ</span>
                      </div>
                      <p className="text-[11px] text-purple-900 leading-relaxed">
                        Your payment has been settled (Ref: {t.paymentId || "CF_UPG_PAID"}). Confirmation has been sent to Admin HQ. Admin will now generate your new login credentials and dispatch them to your email / WhatsApp.
                      </p>
                    </div>
                  )}

                  {/* STAGE 4: COMPLETED -> NEW CREDENTIALS DISPLAY */}
                  {isCompleted && t.newUserId && (
                    <div className="bg-emerald-100/90 border border-emerald-300 rounded-xl p-3.5 space-y-2 mt-2">
                      <div className="text-xs text-emerald-950 font-bold flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-emerald-700" />
                        <span>
                          New Credentials: User ID: <code className="font-mono font-black text-emerald-900">{t.newUserId}</code> | Password: <code className="font-mono font-black text-emerald-900">{t.newPassword}</code>
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-emerald-800 pt-1 border-t border-emerald-200">
                        <span>Dispatched via Email &amp; WhatsApp.</span>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="font-black text-emerald-950 underline hover:text-emerald-800 cursor-pointer"
                        >
                          Login with new credentials &rarr;
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/90 text-slate-900 font-sans selection:bg-amber-200 selection:text-black">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-amber-200/60 py-3 px-4 sm:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/vendor/dashboard" className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400 shadow-sm">
                <Image src="/broomboom-logo.png" alt="BroomBoom Logo" fill className="object-cover" priority />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tight text-slate-950">
                    Broom<span className="text-amber-600">Boom</span>
                  </span>
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider border border-amber-200">
                    Vendor Portal
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Partner Operating System</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-amber-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span>Sync</span>
            </button>

            <div className="text-right hidden sm:block">
              <div className="text-xs font-extrabold text-slate-900">
                {profile?.vendorName || sessionUser.vendorName || "Valued Partner"}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {sessionUser.userId}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Menu Bar (Clean: Only Overview & Profile Details) */}
        <div className="lg:hidden mt-3 pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {menuItems.map((item) => {
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 shadow-xs font-black"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Layout: Menu Bar + Dynamic Section Panel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT MENU BAR / SIDEBAR (3 cols) - Clean with ONLY Overview & Profile Details */}
          <aside
            className={`lg:col-span-3 ${
              mobileMenuOpen ? "block" : "hidden lg:block"
            } space-y-4`}
          >
            <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-2">
              <div className="px-3 py-2 text-[11px] font-black uppercase tracking-wider text-slate-400">
                Menu Navigation
              </div>

              <nav className="space-y-1.5">
                {menuItems.map((item) => {
                  const isSelected = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer text-left ${
                        isSelected
                          ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-sm font-black"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isSelected ? "text-slate-950" : "text-slate-500"}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {item.badge && (
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                              isSelected
                                ? "bg-slate-950 text-amber-400"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight
                          className={`w-3.5 h-3.5 transition-transform ${
                            isSelected ? "translate-x-0.5 text-slate-950" : "text-slate-400"
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick HQ Support Info Box */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-3xl p-4 border border-amber-200 space-y-2.5 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-extrabold text-amber-950">HQ Operations Desk</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Need territory changes or urgent onboarding assistance?
              </p>
              <div className="pt-1 flex flex-col gap-1.5">
                <a
                  href="tel:82407654992706600"
                  className="bg-white hover:bg-amber-100 text-slate-900 border border-amber-300 text-center py-2 rounded-xl font-bold text-[11px] transition-colors"
                >
                  8240765499-BROOM-BOOM
                </a>
                <a
                  href="https://wa.me/982407654992706600"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#20BD5A] text-white text-center py-2 rounded-xl font-bold text-[11px] transition-colors"
                >
                  WhatsApp HQ
                </a>
              </div>
            </div>
          </aside>

          {/* RIGHT CONTENT PANEL (9 cols) */}
          <section className="lg:col-span-9 min-h-[500px]">
            
            {/* 1. OVERVIEW SECTION (Clean Front Page with Welcome Card only) */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Welcome Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-200/30 to-transparent rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 space-y-3">
                    <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-950 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider border border-amber-300">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Franchise Partner Portal
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                      Welcome, {profile?.vendorName || sessionUser.vendorName}! 👋
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                      All your franchise information is organized inside <strong>Profile Details</strong>. Click on the card below or select Profile Details in the menu to view all details.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PROFILE DETAILS SECTION (Showing ALL DETAILS in one place) */}
            {activeTab === "profile" && (
              <div className="space-y-8">
                {/* Header banner */}
                <div className="bg-gradient-to-r from-amber-500 to-yellow-400 rounded-3xl p-6 sm:p-7 text-slate-950 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-slate-950 text-amber-400 px-3 py-1 rounded-full">
                      Master Profile Details
                    </span>
                    <h2 className="text-2xl font-black tracking-tight">
                      Complete Franchise Details: {profile?.vendorName || sessionUser.vendorName}
                    </h2>
                    <p className="text-xs font-semibold text-slate-900">
                      All your personal contact, Active Plan ({currentTier.toUpperCase()}), Review Status ({review?.status === "approved" ? "Approved & Active" : "In Review"}), and Plan Change Tickets.
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab("overview")}
                    className="bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all self-start sm:self-auto cursor-pointer"
                  >
                    &larr; Back to Overview
                  </button>
                </div>

                {/* 2A: Partner Personal & Contact Information */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-950 flex items-center gap-2">
                        <User className="w-5 h-5 text-amber-600" />
                        1. Personal &amp; Contact Information
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Your registered franchise identity and territory contact parameters.
                      </p>
                    </div>
                    <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Partner
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                      <span className="text-slate-500 font-medium block">Applicant Full Name</span>
                      <span className="text-base font-black text-slate-950 block">
                        {profile?.vendorName || sessionUser.vendorName}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> Mobile / WhatsApp Number
                      </span>
                      <span className="text-sm font-bold text-slate-900 block">
                        +91 {profile?.vendorMobile || sessionUser.vendorMobile}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> Registered Email Address
                      </span>
                      <span className="text-sm font-bold text-slate-900 block truncate">
                        {profile?.vendorEmail || sessionUser.vendorEmail || "support@broomboomcabs.com"}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> Assigned City &amp; State
                      </span>
                      <span className="text-sm font-black text-amber-900 block">
                        {profile?.city || sessionUser.city}, {profile?.state || sessionUser.state || "India"}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" /> Commercial Showroom Carpet Area
                      </span>
                      <span className="text-sm font-bold text-slate-800 block">
                        {profile?.carpetArea || "300 - 500 sq.ft (District Hub)"}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> Official Application ID
                      </span>
                      <code className="font-mono font-black text-sm text-slate-950 block">
                        {profile?.applicationId || sessionUser.applicationId}
                      </code>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <KeyRound className="w-3.5 h-3.5 text-slate-400" /> Vendor Portal Login User ID
                      </span>
                      <code className="font-mono font-black text-sm text-amber-900 block">
                        {sessionUser.userId}
                      </code>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                      <span className="text-slate-500 font-medium block">Current Profession Background</span>
                      <span className="text-sm font-bold text-slate-800 block">
                        {profile?.currentProfession || "Fleet Operations / Retail Logistics"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2B: Active Plan Details (GOLD) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                      2
                    </span>
                    <h3 className="text-base font-black text-slate-900">Active Plan Details ({currentTier.toUpperCase()})</h3>
                  </div>
                  {renderActivePlanCard()}
                </div>

                {/* 2C: Review Status (In Review) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <span className="w-6 h-6 rounded-full bg-blue-500 text-white font-black text-xs flex items-center justify-center">
                      3
                    </span>
                    <h3 className="text-base font-black text-slate-900">
                      Review Status ({review?.status === "approved" ? "Approved & Active" : "In Review"})
                    </h3>
                  </div>
                  {renderReviewStatusSection()}
                </div>

                {/* 2D: Plan Change & Tickets */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <span className="w-6 h-6 rounded-full bg-purple-500 text-white font-black text-xs flex items-center justify-center">
                      4
                    </span>
                    <h3 className="text-base font-black text-slate-900">Plan Change &amp; Tickets</h3>
                  </div>
                  {renderTicketsSection()}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* MODAL 1: RAISE PLAN CHANGE TICKET */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-amber-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-950">Raise Plan Change Ticket</h3>
                <p className="text-xs text-slate-500">Request tier upgrade or plan change</p>
              </div>
              <button
                type="button"
                onClick={() => setShowTicketModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {ticketError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{ticketError}</span>
              </div>
            )}

            {ticketSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{ticketSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRaiseTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Current Subscribed Plan</label>
                <input
                  type="text"
                  disabled
                  value={`${currentTier.toUpperCase()} Partner (${plan?.name || "Active Plan"})`}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-slate-700 text-xs font-semibold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Requested Target Plan <span className="text-amber-600">*</span>
                </label>
                <select
                  value={requestedPlan}
                  onChange={(e) => setRequestedPlan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="silver">Silver Partner (Booking Kiosk — ₹10,000)</option>
                  <option value="gold">Gold Partner (District Exclusive Hub — ₹20,000 ★)</option>
                  <option value="platinum">Platinum Partner (Regional Master Hub — ₹50,000)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason / Showroom Details for HQ <span className="text-amber-600">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. We have secured a prime 450 sq.ft commercial showroom in Kolkata and wish to upgrade from Silver to Gold District Exclusivity."
                  value={ticketReason}
                  onChange={(e) => setTicketReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTicketModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTicket}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingTicket ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting Ticket...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Plan Change Ticket</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: NEW CREDENTIALS GENERATED AFTER ADMIN APPROVAL */}
      {newCredentialsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-2 border-emerald-300 space-y-5 animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-950">Plan Change Approved! 🎉</h3>
              <p className="text-xs text-slate-600">
                HQ Admin has confirmed your plan upgrade to{" "}
                <span className="font-extrabold text-emerald-800 uppercase">
                  {newCredentialsModal.newPlan} Partner
                </span>
                . Your new credentials have been generated and dispatched via Email &amp; WhatsApp.
              </p>
            </div>

            {/* Credential Box */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2.5 text-left">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                  Your New Login Credentials
                </span>
                <span className="text-[9px] font-extrabold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  Active
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">New User ID</span>
                  <code className="font-mono font-bold text-slate-950 text-sm bg-white px-2 py-1 rounded border border-emerald-200 block">
                    {newCredentialsModal.userId}
                  </code>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">New Password</span>
                  <code className="font-mono font-bold text-slate-950 text-sm bg-white px-2 py-1 rounded border border-emerald-200 block">
                    {newCredentialsModal.password}
                  </code>
                </div>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setNewCredentialsModal(null);
                  setActiveTab("profile");
                  fetchDashboardData();
                }}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
              >
                View Profile with New {newCredentialsModal.newPlan.toUpperCase()} Plan
              </button>

              <button
                type="button"
                onClick={() => {
                  setNewCredentialsModal(null);
                  handleLogout();
                }}
                className="w-full py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Sign Out &amp; Log In with New Credentials
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 py-6 border-t border-slate-200 mt-12">
        © {new Date().getFullYear()} BroomBoom Mobility Technologies Ltd. All rights reserved.
      </footer>
    </div>
  );
}

export default function VendorDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-700 font-bold">
          Loading dashboard...
        </div>
      }
    >
      <VendorDashboardContent />
    </Suspense>
  );
}