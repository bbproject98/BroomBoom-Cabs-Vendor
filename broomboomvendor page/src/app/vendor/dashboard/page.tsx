"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
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
  Wallet,
  Car,
  Award,
  History,
  HelpCircle,
  TrendingUp,
  DollarSign,
  Plus,
  Minus,
  CheckCircle,
  XCircle,
  Download,
  AlertTriangle,
  Play,
  Pause,
  Receipt,
  Navigation,
  Search,
  MessageCircle,
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

type MenuTab =
  | "overview"
  | "profile"
  | "subscription"
  | "orders"
  | "wallet"
  | "incentives"
  | "rides"
  | "support";

const UPGRADE_PACKAGES = [
  {
    id: "silver",
    name: "Silver Partner",
    subtitle: "Booking Kiosk",
    price: 5000,
    originalPrice: "₹20,000",
    scope: "Local Ward / Pin Code Hub",
    badge: "WARD KIOSK",
    features: [
      "Standard Ward Allocation",
      "BroomBoom Booking Dispatch Engine",
      "Daily Commission Settlements",
      "1-Year Franchise Operating License",
    ],
  },
  {
    id: "gold",
    name: "Gold Partner",
    subtitle: "District Exclusive Hub",
    price: 10000,
    originalPrice: "₹40,000",
    scope: "Exclusive District Hub",
    badge: "★ MOST POPULAR",
    features: [
      "Guaranteed District Territory Lock",
      "Priority Booking Dispatch Engine",
      "Daily Commission Settlements",
      "Dedicated Relationship Manager",
    ],
  },
  {
    id: "platinum",
    name: "Platinum Partner",
    subtitle: "Regional Master Hub",
    price: 20000,
    originalPrice: "₹1,00,000",
    scope: "State / Regional Master Territory",
    badge: "👑 REGIONAL MASTER",
    features: [
      "State / Regional Master Territory Rights",
      "0% Commission Tier (Maximum Margin)",
      "Sub-Franchise Onboarding Control",
      "VIP Expansion Director Support",
    ],
  },
];

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
  const [paymentMethod, setPaymentMethod] = useState("CASHFREE_UPI");
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);
  const [paidTicketResult, setPaidTicketResult] = useState<{
    ticketId: string;
    paymentId: string;
    amount: number;
    requestedPlan: string;
    requestedPlanName: string;
  } | null>(null);

  // Pay Now Ticket action state
  const [payingTicketId, setPayingTicketId] = useState<string | null>(null);
  const [isRedirectingToCashfree, setIsRedirectingToCashfree] = useState(false);
  const [dismissUpgradeBanner, setDismissUpgradeBanner] = useState(false);
  const [newCredentialsModal, setNewCredentialsModal] = useState<{
    userId: string;
    password: string;
    newPlan: string;
    newPlanName: string;
  } | null>(null);

  // 1. My Subscription (Validity & Recharge) state
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeTenure, setRechargeTenure] = useState<"1year" | "6months">("1year");
  const [isRecharging, setIsRecharging] = useState(false);
  const [rechargeSuccessNotice, setRechargeSuccessNotice] = useState<string | null>(null);
  const [customEndDate, setCustomEndDate] = useState<string | null>(null);

  // 2. Orders & Live Dispatch state
  const [ordersTab, setOrdersTab] = useState<"incoming" | "active" | "completed">("incoming");
  const [orderActionNotice, setOrderActionNotice] = useState<{ type: "success" | "info"; message: string } | null>(null);
  const [ordersList, setOrdersList] = useState([
    {
      id: "BB-ORD-9281",
      pickup: "Kolkata Netaji Subhash Chandra Bose Airport (Terminal 2, Gate 4)",
      drop: "Salt Lake Sector V, Godrej Waterside Tower",
      distance: "14.8 km",
      duration: "28 mins",
      vehicleCategory: "Sedan (Swift Dzire / Etios)",
      totalFare: 560,
      vendorPayout: 480,
      passengerName: "Souvik Mukherjee",
      passengerPhone: "+91 98301 44210",
      passengerRating: 4.9,
      status: "incoming",
      dispatchTime: "Just now (45s left to accept)",
      paymentMethod: "Online Paid (Cashfree UPI)",
    },
    {
      id: "BB-ORD-9284",
      pickup: "Howrah Railway Station (Cab Drop Point A)",
      drop: "Park Street Commercial Hub, Kolkata",
      distance: "6.2 km",
      duration: "18 mins",
      vehicleCategory: "SUV (Innova Crysta)",
      totalFare: 740,
      vendorPayout: 650,
      passengerName: "Priyanka Sengupta",
      passengerPhone: "+91 98740 11984",
      passengerRating: 4.8,
      status: "incoming",
      dispatchTime: "1 min ago (30s left to accept)",
      paymentMethod: "Cash on Trip Completion",
    },
    {
      id: "BB-ORD-9275",
      pickup: "New Town AA-II Eco Space Tech Park",
      drop: "Sealdah Railway Station Main Concourse",
      distance: "16.4 km",
      duration: "34 mins",
      vehicleCategory: "Sedan (Hyundai Aura)",
      totalFare: 520,
      vendorPayout: 440,
      passengerName: "Debashis Banerjee",
      passengerPhone: "+91 94331 87620",
      passengerRating: 4.9,
      status: "active",
      dispatchTime: "Accepted 8 mins ago",
      paymentMethod: "Online Paid (Cashfree UPI)",
      assignedDriver: {
        name: "Raju Karmakar",
        phone: "+91 91234 56780",
        vehicleNumber: "WB-02-AK-4921",
        liveStatus: "Passenger onboard, trip in transit (ETA 14 mins)",
        startOtp: "4921",
      },
    },
    {
      id: "BB-ORD-9260",
      pickup: "Ballygunge Circular Road",
      drop: "Kolkata Airport Terminal 1",
      distance: "21.5 km",
      duration: "42 mins",
      vehicleCategory: "Sedan (Toyota Etios)",
      totalFare: 680,
      vendorPayout: 590,
      passengerName: "Rohit Roy",
      passengerPhone: "+91 98310 99401",
      passengerRating: 5.0,
      status: "completed",
      dispatchTime: "Today, 10:15 AM",
      paymentMethod: "Cashfree UPI Settled",
      assignedDriver: {
        name: "Bikash Paul",
        phone: "+91 98305 11203",
        vehicleNumber: "WB-04-E-8832",
        liveStatus: "Trip Completed & Settled",
        startOtp: "8832",
      },
    },
    {
      id: "BB-ORD-9252",
      pickup: "Esplanade Metro Station Gate 2",
      drop: "Dum Dum Cantonment",
      distance: "13.1 km",
      duration: "31 mins",
      vehicleCategory: "Hatchback (WagonR)",
      totalFare: 380,
      vendorPayout: 320,
      passengerName: "Ananya Roy",
      passengerPhone: "+91 98744 22001",
      passengerRating: 4.7,
      status: "completed",
      dispatchTime: "Today, 08:40 AM",
      paymentMethod: "Cashfree UPI Settled",
      assignedDriver: {
        name: "Amitabh Sen",
        phone: "+91 94320 88710",
        vehicleNumber: "WB-01-B-3109",
        liveStatus: "Trip Completed & Settled",
        startOtp: "3109",
      },
    },
  ]);

  // 3. Wallet (Balance & Penalty Deduction Ledger) state
  const [walletBalance, setWalletBalance] = useState(2450);
  const [walletFilter, setWalletFilter] = useState<"all" | "penalty" | "earnings">("all");
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [addMoneyAmount, setAddMoneyAmount] = useState<number>(1000);
  const [isAddingMoney, setIsAddingMoney] = useState(false);
  const [walletNotice, setWalletNotice] = useState<string | null>(null);

  const [walletTransactions, setWalletTransactions] = useState([
    {
      id: "TXN-WAL-9941",
      type: "penalty",
      title: "Driver Cancellation Penalty Deducted",
      refBookingId: "BB-ORD-9190",
      reason: "Driver cancelled accepted booking #BB-ORD-9190 within 15-min pickup window",
      amount: -50,
      date: "Today, 11:35 AM",
      balanceAfter: 2450,
      badge: "PENALTY DEDUCTION",
      badgeColor: "bg-rose-100 text-rose-900 border-rose-300",
      driverInvolved: "Anil Mondal (WB-02-B-4412)",
    },
    {
      id: "TXN-WAL-9930",
      type: "credit",
      title: "Trip Commission Payout Credited",
      refBookingId: "BB-ORD-9260",
      reason: "Ballygunge to Kolkata Airport ride fare credit after platform commission",
      amount: 590,
      date: "Today, 10:20 AM",
      balanceAfter: 2500,
      badge: "TRIP SETTLEMENT",
      badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
    },
    {
      id: "TXN-WAL-9922",
      type: "credit",
      title: "Trip Commission Payout Credited",
      refBookingId: "BB-ORD-9252",
      reason: "Esplanade to Dum Dum ride fare credit after platform commission",
      amount: 320,
      date: "Today, 08:45 AM",
      balanceAfter: 1910,
      badge: "TRIP SETTLEMENT",
      badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
    },
    {
      id: "TXN-WAL-9891",
      type: "penalty",
      title: "Late Pickup Delay Penalty Deducted",
      refBookingId: "BB-ORD-9124",
      reason: "Driver reached pickup point 16 minutes after scheduled passenger ETA",
      amount: -30,
      date: "Yesterday, 06:15 PM",
      balanceAfter: 1590,
      badge: "DELAY PENALTY",
      badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
      driverInvolved: "Sunil Das (WB-06-M-8199)",
    },
    {
      id: "TXN-WAL-9870",
      type: "penalty",
      title: "Driver Cancellation Penalty Deducted",
      refBookingId: "BB-ORD-9080",
      reason: "Driver refused passenger trip due to destination preference after dispatch",
      amount: -50,
      date: "14 Oct 2026, 03:20 PM",
      balanceAfter: 1620,
      badge: "PENALTY DEDUCTION",
      badgeColor: "bg-rose-100 text-rose-900 border-rose-300",
      driverInvolved: "Prabir Ghosh (WB-03-P-1092)",
    },
    {
      id: "TXN-WAL-9844",
      type: "credit",
      title: "Cashfree UPI Wallet Recharge",
      refBookingId: "CF-WAL-84920",
      reason: "Instant online wallet top-up via UPI NetBanking",
      amount: 1000,
      date: "12 Oct 2026, 04:10 PM",
      balanceAfter: 1670,
      badge: "WALLET TOP-UP",
      badgeColor: "bg-blue-100 text-blue-900 border-blue-300",
    },
    {
      id: "TXN-WAL-9810",
      type: "credit",
      title: "Penalty Dispute Waiver Refund Credited",
      refBookingId: "BB-ORD-8940",
      reason: "Admin HQ approved penalty refund due to passenger cancellation mismatch",
      amount: 50,
      date: "10 Oct 2026, 01:45 PM",
      balanceAfter: 670,
      badge: "DISPUTE REFUND",
      badgeColor: "bg-teal-100 text-teal-900 border-teal-300",
    },
  ]);

  // 4. Incentives state
  const [incentivesList, setIncentivesList] = useState([
    {
      id: "INC-DAILY-PEAK",
      title: "Daily Peak Hour Rush Bonus",
      description: "Complete 5 peak-hour rides (8 AM - 11 AM & 5 PM - 8 PM)",
      target: 5,
      completed: 3,
      rewardAmount: 300,
      timeframe: "Daily (Resets midnight)",
      status: "in_progress",
      badge: "DAILY RUSH",
    },
    {
      id: "INC-WEEKEND-FLEET",
      title: "Weekend Fleet Bonanza",
      description: "Complete 25 rides across your assigned hub on Saturday & Sunday",
      target: 25,
      completed: 18,
      rewardAmount: 1500,
      timeframe: "Ends Sunday 11:59 PM",
      status: "in_progress",
      badge: "WEEKEND BONUS",
    },
    {
      id: "INC-ZERO-CANCEL",
      title: "Zero Cancellation Hero",
      description: "Maintain 7 consecutive days with 0 driver cancellation penalties",
      target: 7,
      completed: 6,
      rewardAmount: 1000,
      timeframe: "1 day remaining",
      status: "in_progress",
      badge: "RELIABILITY SHIELD",
    },
    {
      id: "INC-TERRITORY-STAR",
      title: "Monthly Territory Excellence Award",
      description: "Maintain above 95% booking acceptance rate in your franchise pin codes",
      target: 95,
      completed: 97,
      rewardAmount: 5000,
      timeframe: "Monthly Milestone",
      status: "claimable",
      badge: "TERRITORY STAR",
    },
  ]);

  // 5. Ride History state
  const [rideSearch, setRideSearch] = useState("");
  const [rideStatusFilter, setRideStatusFilter] = useState<"all" | "completed" | "cancelled">("all");
  const [selectedInvoiceRide, setSelectedInvoiceRide] = useState<any | null>(null);

  const [ridesHistoryList] = useState([
    {
      id: "BB-ORD-9260",
      date: "17 Oct 2026",
      time: "10:15 AM",
      pickup: "Ballygunge Circular Road, Kolkata",
      drop: "Kolkata Airport Terminal 1, Gate 2",
      distance: "21.5 km",
      duration: "42 mins",
      vehicleCategory: "Sedan (Toyota Etios)",
      vehicleNumber: "WB-04-E-8832",
      driverName: "Bikash Paul",
      driverPhone: "+91 98305 11203",
      passengerName: "Rohit Roy",
      passengerPhone: "+91 98310 99401",
      totalFare: 680,
      platformFee: 90,
      gst: 34,
      netPayout: 590,
      status: "completed",
      penaltyDeducted: 0,
      paymentMethod: "Cashfree UPI Online",
    },
    {
      id: "BB-ORD-9252",
      date: "17 Oct 2026",
      time: "08:40 AM",
      pickup: "Esplanade Metro Station Gate 2",
      drop: "Dum Dum Cantonment, Kolkata",
      distance: "13.1 km",
      duration: "31 mins",
      vehicleCategory: "Hatchback (WagonR)",
      vehicleNumber: "WB-01-B-3109",
      driverName: "Amitabh Sen",
      driverPhone: "+91 94320 88710",
      passengerName: "Ananya Roy",
      passengerPhone: "+91 98744 22001",
      totalFare: 380,
      platformFee: 60,
      gst: 19,
      netPayout: 320,
      status: "completed",
      penaltyDeducted: 0,
      paymentMethod: "Cashfree UPI Online",
    },
    {
      id: "BB-ORD-9190",
      date: "17 Oct 2026",
      time: "11:28 AM",
      pickup: "New Town City Centre II",
      drop: "Salt Lake Karunamoyee Bus Station",
      distance: "9.4 km",
      duration: "Cancelled after 8 mins",
      vehicleCategory: "Sedan (Swift Dzire)",
      vehicleNumber: "WB-02-B-4412",
      driverName: "Anil Mondal",
      driverPhone: "+91 98312 00192",
      passengerName: "Sneha Chatterjee",
      passengerPhone: "+91 98300 77123",
      totalFare: 0,
      platformFee: 0,
      gst: 0,
      netPayout: 0,
      status: "cancelled",
      penaltyDeducted: 50,
      penaltyReason: "Driver cancelled accepted ride within pickup window (-₹50 deducted from wallet)",
      paymentMethod: "N/A (Cancelled)",
    },
    {
      id: "BB-ORD-9124",
      date: "16 Oct 2026",
      time: "05:58 PM",
      pickup: "Gariahat Crossing, South Kolkata",
      drop: "Howrah Railway Station",
      distance: "12.8 km",
      duration: "48 mins (16 mins late pickup)",
      vehicleCategory: "SUV (Innova)",
      vehicleNumber: "WB-06-M-8199",
      driverName: "Sunil Das",
      driverPhone: "+91 98741 22390",
      passengerName: "Arindam Mukherjee",
      passengerPhone: "+91 94330 91823",
      totalFare: 550,
      platformFee: 70,
      gst: 28,
      netPayout: 450,
      status: "completed",
      penaltyDeducted: 30,
      penaltyReason: "Late pickup arrival penalty (-₹30 deducted from wallet)",
      paymentMethod: "Cash on Trip",
    },
    {
      id: "BB-ORD-9080",
      date: "14 Oct 2026",
      time: "03:15 PM",
      pickup: "Park Circus 7-Point Crossing",
      drop: "Barasat Duckbungalow More",
      distance: "24.0 km",
      duration: "Cancelled by driver",
      vehicleCategory: "Sedan (Etios)",
      vehicleNumber: "WB-03-P-1092",
      driverName: "Prabir Ghosh",
      driverPhone: "+91 98320 88201",
      passengerName: "Kunal Basu",
      passengerPhone: "+91 98319 44321",
      totalFare: 0,
      platformFee: 0,
      gst: 0,
      netPayout: 0,
      status: "cancelled",
      penaltyDeducted: 50,
      penaltyReason: "Driver destination refusal cancellation (-₹50 deducted from wallet)",
      paymentMethod: "N/A (Cancelled)",
    },
    {
      id: "BB-ORD-8940",
      date: "10 Oct 2026",
      time: "01:20 PM",
      pickup: "Kolkata Railway Station (Chitpur)",
      drop: "Alipore Zoo Main Gate",
      distance: "15.2 km",
      duration: "36 mins",
      vehicleCategory: "Sedan (Swift Dzire)",
      vehicleNumber: "WB-02-AK-4921",
      driverName: "Raju Karmakar",
      driverPhone: "+91 91234 56780",
      passengerName: "Tanushree Das",
      passengerPhone: "+91 98302 66789",
      totalFare: 490,
      platformFee: 65,
      gst: 24,
      netPayout: 425,
      status: "completed",
      penaltyDeducted: 0,
      paymentMethod: "Cashfree UPI Online",
    },
  ]);

  // 6. Support & Dispute state
  const [supportCategory, setSupportCategory] = useState("penalty_dispute");
  const [supportRefId, setSupportRefId] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportPriority, setSupportPriority] = useState<"normal" | "urgent">("normal");
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);
  const [supportSuccessNotice, setSupportSuccessNotice] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [supportTicketsList, setSupportTicketsList] = useState([
    {
      ticketId: "BB-SUPP-8921",
      category: "Wallet Penalty Dispute",
      refBookingId: "BB-ORD-9190",
      subject: "Dispute -₹50 penalty for cancelled trip BB-ORD-9190",
      status: "in_review",
      createdAt: "Today, 11:45 AM",
      adminNotes: "Investigating trip logs and passenger app interaction with HQ operations team.",
    },
    {
      ticketId: "BB-SUPP-8410",
      category: "Wallet Penalty Dispute",
      refBookingId: "BB-ORD-8940",
      subject: "Penalty waiver request for duplicate cancellation flag",
      status: "resolved",
      createdAt: "10 Oct 2026, 12:30 PM",
      adminNotes: "Waiver approved! +₹50 refund credited back to vendor wallet.",
    },
  ]);

  // Orders Action Handlers
  const handleAcceptOrder = (orderId: string) => {
    const updated = ordersList.map((ord) => {
      if (ord.id === orderId) {
        return {
          ...ord,
          status: "active",
          dispatchTime: "Accepted just now",
          assignedDriver: {
            name: "Raju Karmakar",
            phone: "+91 91234 56780",
            vehicleNumber: "WB-02-AK-4921",
            liveStatus: "Driver dispatched & en route to pickup (ETA 4 mins)",
            startOtp: "6814",
          },
        };
      }
      return ord;
    });
    setOrdersList(updated);
    setOrdersTab("active");
    setOrderActionNotice({
      type: "success",
      message: `Booking ${orderId} accepted successfully! Driver Raju Karmakar (WB-02-AK-4921) has been dispatched to passenger.`,
    });
    setTimeout(() => setOrderActionNotice(null), 6000);
  };

  const handleDeclineOrder = (orderId: string) => {
    setOrdersList((prev) => prev.filter((ord) => ord.id !== orderId));
    setOrderActionNotice({
      type: "info",
      message: `Booking ${orderId} was passed to the next available regional fleet partner.`,
    });
    setTimeout(() => setOrderActionNotice(null), 5000);
  };

  const handleCompleteOrder = (orderId: string) => {
    const ord = ordersList.find((o) => o.id === orderId);
    if (!ord) return;

    const payout = ord.vendorPayout || 440;
    setOrdersList((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "completed",
              dispatchTime: "Just completed",
              assignedDriver: {
                ...o.assignedDriver!,
                liveStatus: "Trip Completed & Net Payout Settled",
              },
            }
          : o
      )
    );

    // Credit payout to wallet
    setWalletBalance((prev) => prev + payout);
    setWalletTransactions((prev) => [
      {
        id: `TXN-WAL-${Math.floor(1000 + Math.random() * 9000)}`,
        type: "credit",
        title: "Trip Commission Payout Credited",
        refBookingId: orderId,
        reason: `${ord.pickup} to ${ord.drop} fare payout credited to wallet`,
        amount: payout,
        date: "Just now",
        balanceAfter: walletBalance + payout,
        badge: "TRIP SETTLEMENT",
        badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
      },
      ...prev,
    ]);

    setOrdersTab("completed");
    setOrderActionNotice({
      type: "success",
      message: `Trip ${orderId} marked completed! Net earnings of ₹${payout} credited to your wallet balance.`,
    });
    setTimeout(() => setOrderActionNotice(null), 6000);
  };

  // Wallet Top-up Handler
  const handleAddMoneySubmit = (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!addMoneyAmount || addMoneyAmount < 100) {
      alert("Please enter a valid top-up amount (minimum ₹100).");
      return;
    }

    setIsAddingMoney(true);
    setTimeout(() => {
      const newBal = walletBalance + Number(addMoneyAmount);
      setWalletBalance(newBal);
      setWalletTransactions((prev) => [
        {
          id: `TXN-WAL-${Math.floor(1000 + Math.random() * 9000)}`,
          type: "credit",
          title: "Cashfree UPI Wallet Top-up",
          refBookingId: `CF-WAL-${Math.floor(10000 + Math.random() * 90000)}`,
          reason: "Instant online wallet top-up via UPI NetBanking",
          amount: Number(addMoneyAmount),
          date: "Just now",
          balanceAfter: newBal,
          badge: "WALLET TOP-UP",
          badgeColor: "bg-blue-100 text-blue-900 border-blue-300",
        },
        ...prev,
      ]);
      setIsAddingMoney(false);
      setShowAddMoneyModal(false);
      setWalletNotice(`Wallet successfully recharged with ₹${Number(addMoneyAmount).toLocaleString("en-IN")} via Cashfree.`);
      setTimeout(() => setWalletNotice(null), 6000);
    }, 1200);
  };

  // Subscription License Recharge Handler
  const handleRechargeLicense = () => {
    setIsRecharging(true);
    setTimeout(() => {
      setIsRecharging(false);
      setShowRechargeModal(false);
      const extendedDate = "17 Oct 2027";
      setCustomEndDate(extendedDate);
      setRechargeSuccessNotice(
        `Franchise License renewed successfully! Operating license is now active and valid until ${extendedDate}.`
      );
      setTimeout(() => setRechargeSuccessNotice(null), 8000);
    }, 1400);
  };

  // Incentives Claim Handler
  const handleClaimIncentive = (incentiveId: string) => {
    const inc = incentivesList.find((i) => i.id === incentiveId);
    if (!inc) return;

    setIncentivesList((prev) =>
      prev.map((i) => (i.id === incentiveId ? { ...i, status: "claimed" } : i))
    );
    setWalletBalance((prev) => prev + inc.rewardAmount);
    setWalletTransactions((prev) => [
      {
        id: `TXN-WAL-${Math.floor(1000 + Math.random() * 9000)}`,
        type: "credit",
        title: `${inc.title} Credited`,
        refBookingId: inc.id,
        reason: `Milestone bonus reward credited directly to vendor wallet`,
        amount: inc.rewardAmount,
        date: "Just now",
        balanceAfter: walletBalance + inc.rewardAmount,
        badge: "INCENTIVE REWARD",
        badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
      },
      ...prev,
    ]);
    alert(`🎉 Milestone reward of ₹${inc.rewardAmount.toLocaleString("en-IN")} claimed and credited to your wallet!`);
  };

  // Support Submission Handler
  const handleSubmitSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) {
      alert("Please describe your query or dispute details.");
      return;
    }
    setIsSubmittingSupport(true);
    setTimeout(() => {
      const newTicketId = `BB-SUPP-${Math.floor(1000 + Math.random() * 9000)}`;
      const catLabel =
        supportCategory === "penalty_dispute"
          ? "Wallet Penalty Dispute"
          : supportCategory === "subscription_recharge"
          ? "Subscription & License Renewal"
          : supportCategory === "dispatch_order"
          ? "Order Dispatch & Assignment"
          : "Driver Onboarding & Fleet KYC";

      setSupportTicketsList((prev) => [
        {
          ticketId: newTicketId,
          category: catLabel,
          refBookingId: supportRefId || "N/A",
          subject: supportMessage.slice(0, 60) + (supportMessage.length > 60 ? "..." : ""),
          status: "in_review",
          createdAt: "Just now",
          adminNotes: "Ticket logged. BroomBoom Operations desk will review within 2 to 4 business hours.",
        },
        ...prev,
      ]);
      setIsSubmittingSupport(false);
      setSupportMessage("");
      setSupportRefId("");
      setSupportSuccessNotice(
        `Support Ticket #${newTicketId} created successfully. Our 24/7 Operations Desk has received your request.`
      );
      setTimeout(() => setSupportSuccessNotice(null), 8000);
    }, 1000);
  };

  // Initial tab from query param if present
  useEffect(() => {
    const tabParam = searchParams.get("tab") as MenuTab;
    if (
      tabParam &&
      [
        "overview",
        "profile",
        "subscription",
        "orders",
        "wallet",
        "incentives",
        "rides",
        "support",
      ].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Auto-switch to profile and refresh data if returning from Cashfree upgrade payment
  useEffect(() => {
    const upgradeStatus = searchParams.get("upgrade");
    if (upgradeStatus === "success") {
      setActiveTab("profile");
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

  const getTierBase = (tier: string) => {
    const t = (tier || "").toLowerCase();
    if (t === "silver") return 5000;
    if (t === "platinum") return 20000;
    return 10000; // gold
  };

  const getTierName = (tier: string) => {
    const t = (tier || "").toLowerCase();
    if (t === "silver") return "Silver Partner (Booking Kiosk)";
    if (t === "platinum") return "Platinum Partner (Regional Master Hub)";
    return "Gold Partner (District Exclusive Hub)";
  };

  const activeCurTier = (plan?.tier || sessionUser?.currentPlan || "gold").toLowerCase();
  const currentTierBase = getTierBase(activeCurTier);
  const targetTierBase = getTierBase(requestedPlan);
  const upgradeBaseAmount = Math.max(
    5000,
    targetTierBase > currentTierBase ? targetTierBase - currentTierBase : targetTierBase
  );
  const upgradeGwFee = Math.round(upgradeBaseAmount * 0.03);
  const upgradeGstAmount = Math.round(upgradeBaseAmount * 0.05);
  const upgradeTotalAmount = upgradeBaseAmount + upgradeGwFee + upgradeGstAmount;

  // Direct Cashfree Checkout Flow for Plan Upgrade
  const handleProceedToCashfree = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    setTicketError(null);
    setTicketSuccess(null);

    if (!requestedPlan) {
      setTicketError("Please choose a target plan to upgrade.");
      return;
    }

    if (activeCurTier === requestedPlan.toLowerCase()) {
      setTicketError(`You are already subscribed to the ${requestedPlan.toUpperCase()} plan.`);
      return;
    }

    setIsRedirectingToCashfree(true);
    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: profile?.applicationId || sessionUser?.applicationId,
          packageId: requestedPlan,
          currentPlan: activeCurTier,
          fullName: profile?.vendorName || sessionUser?.vendorName || "Valued Partner",
          mobile: profile?.vendorMobile || sessionUser?.vendorMobile,
          email: profile?.vendorEmail || sessionUser?.vendorEmail,
          city: profile?.city || "India",
          orderType: "upgrade",
          isUpgrade: true,
          reason:
            ticketReason.trim() ||
            `Partner requested upgrade from ${activeCurTier.toUpperCase()} to ${requestedPlan.toUpperCase()} plan.`,
        }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to initialize Cashfree payment order.");
      }

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
          if (launchCashfreeCheckout() || attempts >= 10) {
            clearInterval(interval);
            if (attempts >= 10) {
              setTicketError("Cashfree checkout could not be launched. Please retry or check browser settings.");
              setIsRedirectingToCashfree(false);
            }
          }
        }, 250);
      }
    } catch (err: any) {
      console.error("[CASHFREE UPGRADE ERROR]", err);
      setTicketError(err.message || "Failed to initiate Cashfree payment.");
      setIsRedirectingToCashfree(false);
    }
  };

  const handleRaiseTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketError(null);
    setTicketSuccess(null);

    if (!requestedPlan) {
      setTicketError("Please select the target plan.");
      return;
    }

    if (activeCurTier === requestedPlan.toLowerCase()) {
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
          currentPlan: activeCurTier,
          requestedPlan,
          reason: ticketReason || `Partner requested upgrade to ${requestedPlan.toUpperCase()} plan.`,
          payNow: true,
          paymentMethod,
          upgradeAmount: upgradeBaseAmount,
          gatewayFee: upgradeGwFee,
          gstAmount: upgradeGstAmount,
          totalAmount: upgradeTotalAmount,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to process plan upgrade payment.");
      }

      const confirmedTicketId = data.ticket?.ticketId || `TICK-BB-2026-${Date.now().toString().slice(-6)}`;
      const confirmedPaymentId =
        data.payment?.paymentId || data.ticket?.paymentId || `CF_UPG_${Date.now().toString().slice(-8)}`;

      setPaidTicketResult({
        ticketId: confirmedTicketId,
        paymentId: confirmedPaymentId,
        amount: upgradeTotalAmount,
        requestedPlan,
        requestedPlanName: getTierName(requestedPlan),
      });

      setTicketSuccess(
        `Payment of ₹${upgradeTotalAmount.toLocaleString(
          "en-IN"
        )} confirmed! Your upgrade request has been submitted to Admin HQ for approval.`
      );
      setTicketReason("");
      fetchDashboardData();
    } catch (err: any) {
      setTicketError(err.message || "Failed to process upgrade payment");
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

  const menuItems: {
    id: MenuTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    badgeClass?: string;
  }[] = [
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
      badgeClass: "bg-slate-900 text-amber-400",
    },
    {
      id: "subscription",
      label: "My Subscription",
      icon: <CreditCard className="w-4 h-4" />,
      badge: "ACTIVE",
      badgeClass: "bg-emerald-100 text-emerald-800 border border-emerald-300",
    },
    {
      id: "orders",
      label: "Orders",
      icon: <Car className="w-4 h-4" />,
      badge: `${ordersList.filter((o) => o.status === "incoming").length} LIVE`,
      badgeClass: "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse",
    },
    {
      id: "wallet",
      label: "Wallet",
      icon: <Wallet className="w-4 h-4" />,
      badge: `₹${walletBalance.toLocaleString("en-IN")}`,
      badgeClass: "bg-blue-100 text-blue-900 border border-blue-300",
    },
    {
      id: "incentives",
      label: "Incentives",
      icon: <Award className="w-4 h-4" />,
      badge: "BONUS",
      badgeClass: "bg-purple-100 text-purple-900 border border-purple-300",
    },
    {
      id: "rides",
      label: "Ride History",
      icon: <History className="w-4 h-4" />,
    },
    {
      id: "support",
      label: "Support",
      icon: <HelpCircle className="w-4 h-4" />,
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
                          ? "Awaiting Further Approval for New Plan from Admin"
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
                      tier === "silver" ? 5000 : tier === "platinum" ? 20000 : 10000;
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

                  {/* STAGE 3: PAYMENT COMPLETED -> AWAITING FURTHER APPROVAL FOR NEW PLAN FROM ADMIN */}
                  {isPaid && (
                    <div className="bg-purple-100/80 border border-purple-300 rounded-xl p-3.5 text-xs text-purple-950 space-y-1">
                      <div className="font-black flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-purple-700" />
                        <span>Payment Verified (₹{(t.totalAmount || 0).toLocaleString("en-IN")}) — Awaiting Further Approval for New Plan from Admin</span>
                      </div>
                      <p className="text-[11px] text-purple-900 leading-relaxed">
                        Your upgrade payment has been settled via Cashfree (Ref: {t.paymentId || "CF_UPG_PAID"}). Your request is awaiting further approval for the new plan from Admin HQ. Once approved, Admin will issue your new login credentials.
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

  // ==========================================
  // SECTION 1: MY SUBSCRIPTION & LICENSE RECHARGE
  // ==========================================
  const renderSubscriptionSection = () => {
    const formattedStartDate = plan?.startDate
      ? new Date(plan.startDate).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "15 Jan 2026";

    const formattedEndDate =
      customEndDate ||
      (plan?.endDate
        ? new Date(plan.endDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "14 Jan 2027");

    const daysRemaining = customEndDate ? 365 : 285;

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Recharge / Renewal Success Notice */}
        {rechargeSuccessNotice && (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 text-emerald-950 flex items-start gap-3 shadow-md animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-black text-emerald-950">Franchise Operating License Renewed!</h4>
              <p className="text-xs text-emerald-800 mt-0.5">{rechargeSuccessNotice}</p>
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 rounded-3xl p-6 sm:p-7 text-slate-950 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-950 text-amber-400 px-3 py-1 rounded-full">
              Territory License Management
            </span>
            <h2 className="text-2xl font-black tracking-tight">
              My Subscription &amp; Operating Validity
            </h2>
            <p className="text-xs font-semibold text-slate-900">
              Check remaining franchise license validity days, review territory authorization, and recharge your subscription when expired.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowRechargeModal(true)}
            className="bg-slate-950 hover:bg-slate-900 text-amber-400 font-black text-xs px-5 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>Recharge / Extend License</span>
          </button>
        </div>

        {/* Validity Time Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border ${tierColors.badge}`}>
                  ★ {currentTier.toUpperCase()} PARTNER
                </span>
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Active &amp; Valid ({daysRemaining} Days Left)
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-950 tracking-tight mt-2.5">
                {plan?.name || `${currentTier.toUpperCase()} Partner Franchise License`}
              </h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                Territory Scope: <strong className="text-slate-900 font-bold">{plan?.territoryScope || "Assigned District Territory"}</strong>
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Official License ID</span>
              <span className="font-mono text-xs font-black text-slate-950 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 block">
                {plan?.subscriptionId || "SUB-BB-2026-ACTIVE"}
              </span>
            </div>
          </div>

          {/* Validity Timeline & Remaining Countdown */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                Franchise License Validity Period
              </span>
              <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                {daysRemaining} Days Remaining
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (daysRemaining / 365) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>Start Date: {formattedStartDate}</span>
                <span className="text-amber-800 font-black">Renewal Due: {formattedEndDate}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block">Operating Status</span>
                <span className="text-sm font-black text-emerald-700 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Active Operating Rights
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block">Booking Dispatch Engine</span>
                <span className="text-sm font-black text-slate-900 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" /> Live Automated Dispatch
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block">Settlement Frequency</span>
                <span className="text-sm font-black text-slate-900 flex items-center gap-1 mt-0.5">
                  <CreditCard className="w-4 h-4 text-blue-600" /> Daily Wallet / UPI Payout
                </span>
              </div>
            </div>
          </div>

          {/* Recharge k liye prompt banner */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-5 border border-amber-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-black text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Recharge or Renew Operating License (If Expired)
              </h4>
              <p className="text-xs text-amber-900 leading-relaxed max-w-xl">
                Keep your franchise operating license current to avoid booking dispatch pauses. When your subscription expires, recharge with 1-Year or 6-Month renewal packages directly via Cashfree.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowRechargeModal(true)}
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Recharge License &rarr;
              </button>
              <button
                type="button"
                onClick={() => {
                  setRequestedPlan(activeCurTier === "silver" ? "gold" : "platinum");
                  setShowTicketModal(true);
                }}
                className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Upgrade Hub Tier
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // SECTION 2: ORDERS (LIVE DISPATCH & ACCEPTANCE)
  // ==========================================
  const renderOrdersSection = () => {
    const incomingOrders = ordersList.filter((o) => o.status === "incoming");
    const activeOrders = ordersList.filter((o) => o.status === "active");
    const completedOrders = ordersList.filter((o) => o.status === "completed");

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Notice alert */}
        {orderActionNotice && (
          <div
            className={`border-2 rounded-3xl p-5 shadow-md flex items-start gap-3 animate-in slide-in-from-top-2 ${
              orderActionNotice.type === "success"
                ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                : "bg-blue-50 border-blue-300 text-blue-950"
            }`}
          >
            <CheckCircle2
              className={`w-5 h-5 shrink-0 mt-0.5 ${
                orderActionNotice.type === "success" ? "text-emerald-600" : "text-blue-600"
              }`}
            />
            <div>
              <h4 className="text-sm font-black">
                {orderActionNotice.type === "success" ? "Order Action Successful" : "Order Status Updated"}
              </h4>
              <p className="text-xs mt-0.5 leading-relaxed">{orderActionNotice.message}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Booking Dispatch Engine Active
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Territory Orders &amp; Booking Dispatch
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Incoming passenger ride requests across your assigned franchise territory. Review route, fare, and vehicle type, then accept bookings to assign fleet drivers.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 p-2 rounded-2xl border border-slate-800 shrink-0">
            <div className="px-3 py-1 text-center">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Incoming</span>
              <span className="text-lg font-black text-amber-400">{incomingOrders.length}</span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="px-3 py-1 text-center">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Active</span>
              <span className="text-lg font-black text-emerald-400">{activeOrders.length}</span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="px-3 py-1 text-center">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Completed</span>
              <span className="text-lg font-black text-white">{completedOrders.length}</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
          <button
            type="button"
            onClick={() => setOrdersTab("incoming")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              ordersTab === "incoming"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>Incoming Requests</span>
            <span className="bg-slate-950 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full">
              {incomingOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setOrdersTab("active")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              ordersTab === "active"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>Active In-Progress</span>
            <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {activeOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setOrdersTab("completed")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              ordersTab === "completed"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>Completed Today</span>
            <span className="bg-slate-200 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded-full">
              {completedOrders.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Incoming Orders (Accept / Reject) */}
        {ordersTab === "incoming" && (
          <div className="space-y-4">
            {incomingOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm space-y-3">
                <Car className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-base font-black text-slate-900">No Pending Booking Requests</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  New passenger trip dispatches in your territory will ring here in real-time. Keep this screen open to accept bookings.
                </p>
              </div>
            ) : (
              incomingOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-6 border-2 border-amber-300 shadow-lg space-y-5 hover:border-amber-400 transition-all relative overflow-hidden"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-100 text-amber-950 font-mono font-black text-xs px-3 py-1 rounded-full border border-amber-300">
                        {order.id}
                      </span>
                      <span className="bg-blue-50 text-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                        {order.vehicleCategory}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1 animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                        {order.dispatchTime}
                      </span>
                    </div>
                  </div>

                  {/* Route & Passenger Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Route Details (7 cols) */}
                    <div className="md:col-span-7 space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center mt-1">
                          <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                          <div className="w-0.5 h-8 bg-slate-300 my-1" />
                          <span className="w-3 h-3 rounded-full bg-amber-500 ring-4 ring-amber-100" />
                        </div>
                        <div className="space-y-3 text-xs w-full">
                          <div>
                            <span className="text-[10px] font-bold text-emerald-800 uppercase block">Pickup Location</span>
                            <span className="font-extrabold text-slate-900 block">{order.pickup}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-amber-800 uppercase block">Drop Destination</span>
                            <span className="font-extrabold text-slate-900 block">{order.drop}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-bold text-slate-600 pt-2 border-t border-slate-200">
                        <span className="flex items-center gap-1">
                          <Navigation className="w-3.5 h-3.5 text-slate-400" /> Distance: {order.distance}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> Est. Time: {order.duration}
                        </span>
                      </div>
                    </div>

                    {/* Financials & Customer (5 cols) */}
                    <div className="md:col-span-5 space-y-3 flex flex-col justify-between">
                      <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 space-y-1.5">
                        <span className="text-[10px] font-black text-emerald-800 uppercase block">Vendor Net Payout</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-emerald-950">
                            ₹{order.vendorPayout}
                          </span>
                          <span className="text-xs text-slate-500 font-semibold">
                            (Total Fare: ₹{order.totalFare})
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-bold block">
                          Payment: {order.paymentMethod}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 px-1">
                        <span className="font-bold text-slate-900">{order.passengerName}</span>
                        <span className="text-slate-400 ml-2">★ {order.passengerRating} (Verified Passenger)</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Accept or Decline */}
                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleDeclineOrder(order.id)}
                      className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    >
                      Decline / Pass
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAcceptOrder(order.id)}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Accept Booking &amp; Dispatch</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Active In-Progress Rides */}
        {ordersTab === "active" && (
          <div className="space-y-4">
            {activeOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm space-y-2">
                <Car className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-base font-black text-slate-900">No Active Trips In Progress</h4>
                <p className="text-xs text-slate-500">
                  When you accept bookings from the Incoming tab, they appear here while in transit.
                </p>
              </div>
            ) : (
              activeOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-6 border-2 border-emerald-400 shadow-lg space-y-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-100 text-emerald-950 font-mono font-black text-xs px-3 py-1 rounded-full border border-emerald-300">
                        {order.id}
                      </span>
                      <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        In Transit
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Start OTP</span>
                      <span className="font-mono text-sm font-black text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {order.assignedDriver?.startOtp || "4921"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Route &amp; Destination</span>
                      <p className="font-bold text-slate-900">
                        <span className="text-emerald-700">From:</span> {order.pickup}
                      </p>
                      <p className="font-bold text-slate-900">
                        <span className="text-amber-700">To:</span> {order.drop}
                      </p>
                    </div>

                    <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-2">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase block">Assigned Fleet Driver</span>
                      <p className="font-black text-slate-900 text-sm">
                        {order.assignedDriver?.name} ({order.assignedDriver?.vehicleNumber})
                      </p>
                      <p className="text-slate-600 font-medium">Contact: {order.assignedDriver?.phone}</p>
                      <p className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {order.assignedDriver?.liveStatus}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <div className="text-xs">
                      <span className="text-slate-500">Net Vendor Payout to Credit: </span>
                      <strong className="text-emerald-950 font-black text-sm">₹{order.vendorPayout}</strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCompleteOrder(order.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Trip Completed &amp; Settle</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Completed Today */}
        {ordersTab === "completed" && (
          <div className="space-y-3">
            {completedOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900">{order.id}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                      Settled
                    </span>
                    <span className="text-slate-400 text-xs">• {order.dispatchTime}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
                    {order.pickup} &rarr; {order.drop}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Driver: {order.assignedDriver?.name} ({order.assignedDriver?.vehicleNumber})
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Net Vendor Payout</span>
                  <span className="text-base font-black text-emerald-900">+₹{order.vendorPayout}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ==========================================
  // SECTION 3: WALLET & PENALTY CANCELLATION LEDGER
  // ==========================================
  const renderWalletSection = () => {
    const filteredTxns = walletTransactions.filter((txn) => {
      if (walletFilter === "penalty") return txn.type === "penalty";
      if (walletFilter === "earnings") return txn.type === "credit";
      return true;
    });

    const totalPenalties = walletTransactions
      .filter((t) => t.type === "penalty")
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);

    const totalCredits = walletTransactions
      .filter((t) => t.type === "credit")
      .reduce((acc, t) => acc + t.amount, 0);

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Wallet Alert notice */}
        {walletNotice && (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 text-emerald-950 flex items-start gap-3 shadow-md animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-black text-emerald-950">Wallet Transaction Confirmed</h4>
              <p className="text-xs text-emerald-800 mt-0.5">{walletNotice}</p>
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-3 py-1 rounded-full">
              Operations Financial Ledger
            </span>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Franchise Wallet &amp; Penalty Deductions
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Track live wallet balance, trip commission credits, and auto-deducted driver cancellation penalties.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddMoneyModal(true)}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Money to Wallet</span>
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Available Balance</span>
              <Wallet className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-3xl font-black text-slate-950">
              ₹{walletBalance.toLocaleString("en-IN")}
            </div>
            <span className="text-[11px] text-emerald-700 font-bold block">
              ● Active (Dispatch threshold: min ₹500)
            </span>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-rose-200 shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 uppercase">Penalty Deductions</span>
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div className="text-3xl font-black text-rose-700">
              -₹{totalPenalties.toLocaleString("en-IN")}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              Driver cancellations &amp; delay penalties
            </span>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 uppercase">Total Settled Credits</span>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-emerald-950">
              +₹{totalCredits.toLocaleString("en-IN")}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              Net ride earnings &amp; top-up credits
            </span>
          </div>
        </div>

        {/* MANDATORY PENALTY POLICY CALLOUT (As requested by user) */}
        <div className="bg-rose-50/90 border-2 border-rose-300 rounded-3xl p-6 text-rose-950 space-y-3 shadow-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <h4 className="text-sm font-black uppercase tracking-wider text-rose-950">
              Driver Cancellation Penalty Policy (Auto-Deducted from this Wallet)
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-white/80 p-3.5 rounded-2xl border border-rose-200 space-y-1">
              <span className="font-black text-rose-900 block flex items-center gap-1.5">
                <Minus className="w-3.5 h-3.5 text-rose-600" /> -₹50.00 Driver Cancellation Penalty
              </span>
              <p className="text-slate-700 leading-relaxed">
                If an assigned driver cancels a booking after acceptance or refuses duty within the pickup window, <strong>₹50 is auto-deducted directly from this wallet</strong> to safeguard customer SLA.
              </p>
            </div>

            <div className="bg-white/80 p-3.5 rounded-2xl border border-rose-200 space-y-1">
              <span className="font-black text-rose-900 block flex items-center gap-1.5">
                <Minus className="w-3.5 h-3.5 text-amber-600" /> -₹30.00 Late Pickup Delay Penalty
              </span>
              <p className="text-slate-700 leading-relaxed">
                Delays exceeding 10 minutes past the promised customer pickup ETA result in an automatic <strong>-₹30 delay deduction</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-rose-200 text-xs">
            <span className="text-rose-900 font-semibold">
              Believe a penalty was charged in error?
            </span>
            <button
              type="button"
              onClick={() => {
                setSupportCategory("penalty_dispute");
                setActiveTab("support");
              }}
              className="text-rose-700 hover:text-rose-950 font-black underline cursor-pointer"
            >
              Dispute a Penalty Deduction &rarr;
            </button>
          </div>
        </div>

        {/* Ledger Filter Tabs & Table */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-600" />
              Wallet Transaction History
            </h3>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setWalletFilter("all")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  walletFilter === "all" ? "bg-white text-slate-950 shadow-xs font-black" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({walletTransactions.length})
              </button>
              <button
                type="button"
                onClick={() => setWalletFilter("penalty")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  walletFilter === "penalty" ? "bg-rose-50 text-rose-900 font-black shadow-xs" : "text-slate-600 hover:text-rose-700"
                }`}
              >
                Penalties Only (-)
              </button>
              <button
                type="button"
                onClick={() => setWalletFilter("earnings")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  walletFilter === "earnings" ? "bg-emerald-50 text-emerald-900 font-black shadow-xs" : "text-slate-600 hover:text-emerald-700"
                }`}
              >
                Credits Only (+)
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredTxns.map((txn) => {
              const isPenalty = txn.type === "penalty";
              return (
                <div key={txn.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isPenalty ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {isPenalty ? <AlertTriangle className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black text-slate-950">{txn.title}</span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${txn.badgeColor}`}>
                          {txn.badge}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">Ref: {txn.refBookingId}</span>
                      </div>
                      <p className="text-xs text-slate-600">{txn.reason}</p>
                      {txn.driverInvolved && (
                        <p className="text-[11px] text-rose-800 font-bold">
                          Driver: {txn.driverInvolved}
                        </p>
                      )}
                      <span className="text-[10px] text-slate-400 font-medium block">{txn.date}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-lg font-black block ${
                        isPenalty ? "text-rose-600" : "text-emerald-700"
                      }`}
                    >
                      {isPenalty ? `-₹${Math.abs(txn.amount)}` : `+₹${txn.amount}`}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Bal: ₹{txn.balanceAfter.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // SECTION 4: INCENTIVES & MILESTONES
  // ==========================================
  const renderIncentivesSection = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 rounded-3xl p-6 sm:p-7 text-slate-950 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-950 text-amber-400 px-3 py-1 rounded-full">
              Fleet Rewards &amp; Performance
            </span>
            <h2 className="text-2xl font-black tracking-tight">
              Partner Performance Incentives
            </h2>
            <p className="text-xs font-semibold text-slate-900">
              Meet target ride milestones, maintain peak-hour dispatch readiness, and earn direct cash bonuses into your wallet.
            </p>
          </div>

          <div className="bg-slate-950 text-white p-3.5 rounded-2xl shadow-md shrink-0 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Earned This Month</span>
            <span className="text-xl font-black text-amber-400">₹6,800</span>
          </div>
        </div>

        {/* Milestone Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {incentivesList.map((inc) => {
            const pct = Math.min(100, Math.round((inc.completed / inc.target) * 100));
            const isClaimable = inc.status === "claimable";
            const isClaimed = inc.status === "claimed";

            return (
              <div
                key={inc.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="bg-amber-100 text-amber-950 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-300 uppercase">
                      {inc.badge}
                    </span>
                    <span className="text-base font-black text-emerald-800">
                      ₹{inc.rewardAmount.toLocaleString("en-IN")} Bonus
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-black text-slate-950">{inc.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{inc.description}</p>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600">Progress: {inc.completed} / {inc.target}</span>
                      <span className="text-amber-800 font-black">{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium block">{inc.timeframe}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  {isClaimable ? (
                    <button
                      type="button"
                      onClick={() => handleClaimIncentive(inc.id)}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Claim ₹{inc.rewardAmount} Bonus Now &rarr;</span>
                    </button>
                  ) : isClaimed ? (
                    <div className="w-full py-2 text-center text-xs font-black text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200">
                      ✓ Reward Claimed &amp; Credited to Wallet
                    </div>
                  ) : (
                    <div className="w-full py-2 text-center text-xs font-bold text-slate-500 bg-slate-100 rounded-xl">
                      Milestone In Progress
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ==========================================
  // SECTION 5: RIDE HISTORY & INVOICES
  // ==========================================
  const renderRideHistorySection = () => {
    const filteredRides = ridesHistoryList.filter((ride) => {
      const matchesSearch =
        ride.id.toLowerCase().includes(rideSearch.toLowerCase()) ||
        ride.passengerName.toLowerCase().includes(rideSearch.toLowerCase()) ||
        ride.driverName.toLowerCase().includes(rideSearch.toLowerCase()) ||
        ride.pickup.toLowerCase().includes(rideSearch.toLowerCase()) ||
        ride.drop.toLowerCase().includes(rideSearch.toLowerCase());

      if (!matchesSearch) return false;
      if (rideStatusFilter === "completed") return ride.status === "completed";
      if (rideStatusFilter === "cancelled") return ride.status === "cancelled";
      return true;
    });

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-3 py-1 rounded-full">
              Trip Records &amp; Invoices
            </span>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Territory Ride History
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Audit past completed trips, route fares, driver assignments, and cancelled trips with penalty notes.
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Booking ID, Passenger, Driver, or Location..."
              value={rideSearch}
              onChange={(e) => setRideSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-400 font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0 text-xs font-bold">
            <button
              type="button"
              onClick={() => setRideStatusFilter("all")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                rideStatusFilter === "all" ? "bg-slate-950 text-white font-black" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Rides
            </button>
            <button
              type="button"
              onClick={() => setRideStatusFilter("completed")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                rideStatusFilter === "completed" ? "bg-emerald-600 text-white font-black" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Completed
            </button>
            <button
              type="button"
              onClick={() => setRideStatusFilter("cancelled")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                rideStatusFilter === "cancelled" ? "bg-rose-600 text-white font-black" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Cancelled (Penalties)
            </button>
          </div>
        </div>

        {/* Ride Cards List */}
        <div className="space-y-4">
          {filteredRides.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 text-slate-500 text-xs">
              No matching rides found for &ldquo;{rideSearch}&rdquo;.
            </div>
          ) : (
            filteredRides.map((ride) => {
              const isCancelled = ride.status === "cancelled";

              return (
                <div
                  key={ride.id}
                  className={`bg-white rounded-3xl p-6 border shadow-sm space-y-4 transition-all ${
                    isCancelled ? "border-rose-200 hover:border-rose-300" : "border-slate-200 hover:border-amber-300"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-slate-950 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {ride.id}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                          isCancelled
                            ? "bg-rose-100 text-rose-800 border border-rose-300"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        }`}
                      >
                        {isCancelled ? "Cancelled by Driver" : "Trip Completed"}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 font-medium">
                      {ride.date} • {ride.time}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                    <div className="md:col-span-7 space-y-2">
                      <div className="text-slate-800">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase block">Pickup</span>
                        <strong className="text-slate-900">{ride.pickup}</strong>
                      </div>
                      <div className="text-slate-800">
                        <span className="text-[10px] font-bold text-amber-800 uppercase block">Drop</span>
                        <strong className="text-slate-900">{ride.drop}</strong>
                      </div>
                      <div className="text-[11px] text-slate-500 pt-1">
                        Driver: <strong>{ride.driverName}</strong> ({ride.vehicleNumber}) • Passenger: <strong>{ride.passengerName}</strong>
                      </div>
                    </div>

                    <div className="md:col-span-5 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 flex flex-col justify-between">
                      {isCancelled ? (
                        <div className="space-y-1">
                          <span className="text-[10px] text-rose-700 font-bold uppercase block">Cancellation Penalty</span>
                          <span className="text-2xl font-black text-rose-600 block">
                            -₹{ride.penaltyDeducted}.00
                          </span>
                          <p className="text-[11px] text-rose-900 font-semibold">{ride.penaltyReason}</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>Total Trip Fare:</span>
                            <span className="font-bold text-slate-800">₹{ride.totalFare}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>Platform Fee &amp; GST:</span>
                            <span className="font-bold text-slate-800">-₹{ride.platformFee + ride.gst}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-black text-emerald-950 pt-1 border-t border-slate-200">
                            <span>Net Vendor Margin:</span>
                            <span className="text-lg text-emerald-800">₹{ride.netPayout}</span>
                          </div>
                        </div>
                      )}

                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setSelectedInvoiceRide(ride)}
                          className="text-xs font-bold text-amber-800 hover:text-amber-950 bg-amber-100/80 hover:bg-amber-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>View Invoice Slip</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // ==========================================
  // SECTION 6: SUPPORT & DISPUTE DESK
  // ==========================================
  const renderSupportSection = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Support success notice */}
        {supportSuccessNotice && (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 text-emerald-950 flex items-start gap-3 shadow-md animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-black text-emerald-950">Support Ticket Registered!</h4>
              <p className="text-xs text-emerald-800 mt-0.5">{supportSuccessNotice}</p>
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-3 py-1 rounded-full">
              24/7 Franchise Desk
            </span>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Operations Helpdesk &amp; Dispute Resolution
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Dispute penalty deductions, report subscription renewal queries, or get urgent assistance for driver assignments.
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <a
              href="tel:18002706600"
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>1800-BROOM-BOOM</span>
            </a>
            <a
              href="https://wa.me/918002706600"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20BD5A] text-white font-black text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Operations</span>
            </a>
          </div>
        </div>

        {/* Raise a Support Ticket Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-600" />
              Raise a Support or Dispute Request
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select the relevant category below. Penalty dispute refunds are reviewed and credited within 2 to 4 hours.
            </p>
          </div>

          <form onSubmit={handleSubmitSupport} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Issue Category</label>
                <select
                  value={supportCategory}
                  onChange={(e) => setSupportCategory(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-400 cursor-pointer"
                >
                  <option value="penalty_dispute">Wallet Penalty Deduction Dispute (Refund Request)</option>
                  <option value="subscription_recharge">Subscription &amp; License Renewal / Recharge</option>
                  <option value="dispatch_order">Order Dispatch &amp; Territory Assignment</option>
                  <option value="driver_kyc">Driver Onboarding &amp; Fleet KYC</option>
                  <option value="tech_issue">Technical Portal Issue</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Booking or Ref ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. BB-ORD-9190 or SUB-BB-2026"
                  value={supportRefId}
                  onChange={(e) => setSupportRefId(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-hidden focus:border-amber-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Detailed Description / Dispute Reason</label>
              <textarea
                rows={3}
                placeholder="Explain the circumstance (e.g., driver cancelled because customer changed pickup destination without notice, please refund -₹50 penalty)..."
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-amber-400 resize-none"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600">Priority:</span>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    checked={supportPriority === "normal"}
                    onChange={() => setSupportPriority("normal")}
                  />
                  <span>Normal</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-rose-700 font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    checked={supportPriority === "urgent"}
                    onChange={() => setSupportPriority("urgent")}
                  />
                  <span>Urgent (Dispatch Impacted)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmittingSupport}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-6 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingSupport ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Support Ticket</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Recent Tickets Log */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
          <h3 className="text-base font-black text-slate-950">Recent Support &amp; Dispute Tickets</h3>
          <div className="divide-y divide-slate-100">
            {supportTicketsList.map((st) => (
              <div key={st.ticketId} className="py-3.5 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded">
                      {st.ticketId}
                    </span>
                    <span className="text-xs font-black text-slate-800">{st.category}</span>
                    <span className="text-[10px] text-slate-400">Ref: {st.refBookingId}</span>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                      st.status === "resolved"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-amber-100 text-amber-900 border border-amber-300"
                    }`}
                  >
                    {st.status === "resolved" ? "Resolved" : "In Review"}
                  </span>
                </div>

                <p className="text-xs text-slate-600">{st.subject}</p>
                <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] text-slate-600 border border-slate-200 flex items-start gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Admin Note:</strong> {st.adminNotes}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-3">
          <h3 className="text-base font-black text-slate-950">Frequently Asked Questions</h3>
          <div className="space-y-2 text-xs">
            {[
              {
                q: "Why was a -₹50 penalty deducted from my wallet?",
                a: "A -₹50 penalty is deducted whenever an assigned fleet driver cancels an accepted booking within the customer pickup window or refuses customer pickup without valid reason. If this occurred due to passenger no-show, please submit a Dispute Ticket above for a full waiver refund.",
              },
              {
                q: "How do I recharge my franchise operating license when it expires?",
                a: "Go to the 'My Subscription' tab and click 'Recharge / Extend License'. You can choose a 1-Year or 6-Month extension and pay via Cashfree UPI or NetBanking.",
              },
              {
                q: "How do I accept incoming bookings in the Orders tab?",
                a: "In the 'Orders' tab under 'Incoming Requests', review the trip route and payout. Click 'Accept Booking & Dispatch' within 45 seconds to secure the booking and assign a driver from your fleet.",
              },
            ].map((faq, i) => (
              <div key={i} className="border border-slate-200 rounded-2xl p-4 space-y-1">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                  className="w-full flex items-center justify-between text-left font-black text-slate-900 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${openFaqIndex === i ? "rotate-90 text-amber-600" : "text-slate-400"}`}
                  />
                </button>
                {openFaqIndex === i && (
                  <p className="text-slate-600 pt-2 leading-relaxed text-[11px] border-t border-slate-100">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/90 text-slate-900 font-sans selection:bg-amber-200 selection:text-black">
      <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" strategy="lazyOnload" />

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
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400 shadow-sm bg-white flex items-center justify-center p-0.5">
                <Image src="/broomboom-logo.png" alt="BroomBoom Logo" fill className="object-contain" priority />
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

        {/* Mobile Horizontal Menu Bar */}
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
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 shadow-xs font-black"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${
                      isSelected ? "bg-slate-950 text-amber-400" : item.badgeClass || "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Layout: Menu Bar + Dynamic Section Panel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT MENU BAR / SIDEBAR (3 cols) */}
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
                                : item.badgeClass || "bg-slate-200 text-slate-700"
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

              {/* Dedicated Sidebar Logout Button */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Logout Account</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-rose-400" />
                </button>
              </div>
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
                  href="tel:18002706600"
                  className="bg-white hover:bg-amber-100 text-slate-900 border border-amber-300 text-center py-2 rounded-xl font-bold text-[11px] transition-colors"
                >
                  1800-BROOM-BOOM
                </a>
                <a
                  href="https://wa.me/918002706600"
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
            {/* Top Upgrade Status Banners */}
            {searchParams.get("upgrade") === "success" && !dismissUpgradeBanner && (
              <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border-2 border-purple-400 mb-6 space-y-4 relative overflow-hidden animate-in fade-in slide-in-from-top-3 duration-300">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 bg-purple-500/30 text-purple-200 border border-purple-400 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      Awaiting Further Approval for New Plan from Admin
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Payment Successful! Awaiting Further Approval for New Plan from Admin
                    </h2>
                    <p className="text-xs sm:text-sm text-purple-200 leading-relaxed max-w-2xl">
                      Your payment of{" "}
                      <strong>
                        ₹{Number(searchParams.get("amount") || 0) > 0 ? Number(searchParams.get("amount")).toLocaleString("en-IN") : searchParams.get("amount") || upgradeTotalAmount.toLocaleString("en-IN")}
                      </strong>{" "}
                      for upgrading to the{" "}
                      <strong className="uppercase">{searchParams.get("plan") || requestedPlan} Partner</strong> plan has been confirmed via Cashfree. Your request is now <strong>awaiting further approval for your new plan from Admin HQ</strong>. Once approved, your new credentials will be issued.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDismissUpgradeBanner(true)}
                    className="text-purple-300 hover:text-white p-1 rounded-lg text-sm font-bold cursor-pointer"
                    title="Dismiss notification"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                  {searchParams.get("order_id") && (
                    <span className="bg-purple-900/60 px-3 py-1 rounded-xl border border-purple-700/60 text-purple-200 font-mono">
                      Order: {searchParams.get("order_id")}
                    </span>
                  )}
                  {searchParams.get("ticketId") && (
                    <span className="bg-purple-900/60 px-3 py-1 rounded-xl border border-purple-700/60 text-amber-300 font-mono font-bold">
                      Ticket #{searchParams.get("ticketId")}
                    </span>
                  )}
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-xl font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Cashfree Payment Settled
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("profile")}
                    className="ml-auto text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                  >
                    View Status in Profile Tickets &rarr;
                  </button>
                </div>
              </div>
            )}

            {searchParams.get("upgrade") === "failed" && !dismissUpgradeBanner && (
              <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-5 mb-6 text-rose-950 flex items-start justify-between gap-4 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-black">Upgrade Payment Not Completed</h4>
                    <p className="text-xs text-rose-800 mt-0.5">
                      The transaction was cancelled or could not be verified by Cashfree. You can retry your plan upgrade anytime.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDismissUpgradeBanner(true)}
                  className="text-rose-500 hover:text-rose-800 text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}
            
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

                {/* Territory Upgrade Banner (for Silver or Gold partners) */}
                {activeCurTier !== "platinum" && (
                  <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 max-w-xl">
                      <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                        <Sparkles className="w-3 h-3" />
                        Franchise Territory Upgrade
                      </div>
                      <h3 className="text-xl font-black tracking-tight text-white">
                        Upgrade Your Plan: Switch to{" "}
                        {activeCurTier === "silver"
                          ? "Gold Partner (Exclusive District Hub)"
                          : "Platinum Partner (Regional Master Hub)"}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Pay the upgrade fee difference, secure guaranteed territory rights, and submit your request directly to Admin HQ for approval.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setPaidTicketResult(null);
                        setTicketError(null);
                        setTicketSuccess(null);
                        setRequestedPlan(activeCurTier === "silver" ? "gold" : "platinum");
                        setShowTicketModal(true);
                      }}
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto shrink-0"
                    >
                      <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                      <span>Upgrade Plan &amp; Pay</span>
                    </button>
                  </div>
                )}
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
                        {profile?.vendorEmail || sessionUser.vendorEmail || "vendor@broomboom.com"}
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

            {/* ADDITIONAL VENDOR OPERATIONAL SECTIONS */}
            {activeTab === "subscription" && renderSubscriptionSection()}
            {activeTab === "orders" && renderOrdersSection()}
            {activeTab === "wallet" && renderWalletSection()}
            {activeTab === "incentives" && renderIncentivesSection()}
            {activeTab === "rides" && renderRideHistorySection()}
            {activeTab === "support" && renderSupportSection()}
          </section>
        </div>
      </div>

      {/* MODAL 1: UPGRADE FRANCHISE PLAN & PAY MODAL */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-amber-200 space-y-6 animate-in fade-in zoom-in-95 duration-200 my-8 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-300 mb-1.5">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Franchise Territory Upgrade
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-amber-600" />
                  Request Plan Upgrade
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Choose a franchise plan below. When you choose a plan, the <strong>Pay Now</strong> option will appear below to complete your payment via Cashfree and submit your request for Admin approval.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowTicketModal(false);
                  setPaidTicketResult(null);
                  setTicketError(null);
                  setTicketSuccess(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {ticketError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs font-semibold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{ticketError}</span>
              </div>
            )}

            {/* 1. VISUAL PLAN CARDS DISPLAY */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  1. Choose Target Upgrade Plan
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Current: <strong className="uppercase text-slate-900 font-black">{activeCurTier}</strong> Partner
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {UPGRADE_PACKAGES.map((pkg) => {
                  const isCurrent = activeCurTier === pkg.id;
                  const isSelected = requestedPlan === pkg.id;

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => {
                        if (!isCurrent) {
                          setRequestedPlan(pkg.id);
                          setTicketError(null);
                        }
                      }}
                      className={`relative rounded-2xl p-5 border-2 transition-all flex flex-col justify-between ${
                        isCurrent
                          ? "bg-slate-100/80 border-slate-300 opacity-75 cursor-not-allowed"
                          : isSelected
                          ? "bg-amber-50/80 border-amber-500 ring-2 ring-amber-400 shadow-md cursor-pointer"
                          : "bg-white border-slate-200 hover:border-amber-300 hover:shadow-sm cursor-pointer"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              isCurrent
                                ? "bg-slate-200 text-slate-700 border-slate-300"
                                : isSelected
                                ? "bg-amber-400 text-slate-950 border-amber-500 font-black"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            {isCurrent ? "CURRENT ACTIVE PLAN" : pkg.badge}
                          </span>
                          {isSelected && !isCurrent && (
                            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="text-base font-black text-slate-950">{pkg.name}</h4>
                          <p className="text-[11px] font-semibold text-slate-500">{pkg.subtitle}</p>
                        </div>

                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-950">
                              ₹{pkg.price.toLocaleString("en-IN")}
                            </span>
                            <span className="text-xs text-slate-400 line-through font-semibold">
                              {pkg.originalPrice}
                            </span>
                          </div>
                          <span className="text-[10px] text-amber-700 font-extrabold uppercase block mt-0.5">
                            Scope: {pkg.scope}
                          </span>
                        </div>

                        <ul className="space-y-1.5 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
                          {pkg.features.map((feat, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-4 mt-3 border-t border-slate-200/60">
                        {isCurrent ? (
                          <div className="w-full py-2 px-3 text-center text-[11px] font-black text-slate-600 bg-slate-200/80 rounded-xl">
                            Current Active Plan
                          </div>
                        ) : isSelected ? (
                          <div className="w-full py-2 px-3 text-center text-[11px] font-black text-slate-950 bg-amber-400 rounded-xl shadow-xs flex items-center justify-center gap-1.5">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Plan Selected</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="w-full py-2 px-3 text-center text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-amber-100 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
                          >
                            Choose This Plan &rarr;
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. BOTTOM "PAY NOW" OPTION - REVEALS WHEN A PLAN IS CHOSEN */}
            {requestedPlan && requestedPlan !== activeCurTier ? (
              <div className="bg-gradient-to-br from-amber-50/80 via-yellow-50/40 to-slate-50 rounded-2xl p-5 border-2 border-amber-300 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/70 pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">
                      2. Upgrade Breakdown &amp; Cashfree Checkout
                    </span>
                    <h4 className="text-sm sm:text-base font-black text-slate-950 mt-1">
                      Upgrading: <span className="uppercase text-slate-600">{activeCurTier} Partner</span> &rarr;{" "}
                      <span className="uppercase text-amber-700 font-black">{requestedPlan} Partner</span>
                    </h4>
                  </div>
                  <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300 self-start sm:self-auto">
                    Cashfree Gateway Ready
                  </span>
                </div>

                {/* Financial Charges Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-white/90 p-4 rounded-xl border border-amber-200/70 shadow-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Base Upgrade Difference:</span>
                    <span className="font-extrabold text-slate-950 text-sm">
                      ₹{upgradeBaseAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Gateway Fee (3%):</span>
                    <span className="font-bold text-slate-800 text-sm">
                      ₹{upgradeGwFee.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Govt GST (5%):</span>
                    <span className="font-bold text-slate-800 text-sm">
                      ₹{upgradeGstAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="bg-amber-100/90 p-2 rounded-lg border border-amber-300">
                    <span className="text-[10px] text-amber-950 font-black block">Total Payable Now:</span>
                    <span className="font-black text-amber-950 text-sm sm:text-base">
                      ₹{upgradeTotalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Reason / Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Upgrade Note / Reason (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder={`e.g. Upgrading from ${activeCurTier} to ${requestedPlan} Partner for territory exclusivity`}
                    value={ticketReason}
                    onChange={(e) => setTicketReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Security & Cashfree Gateway Notice */}
                <div className="flex items-center gap-2 text-[11px] text-slate-600 bg-white/80 p-2.5 rounded-xl border border-slate-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Clicking <strong>Pay Now</strong> will securely redirect you to the <strong>Cashfree Payment Gateway</strong> (UPI, QR, NetBanking, Cards). After payment is completed, you will be redirected back here, and your request will be awaiting further approval for the new plan from Admin HQ.
                  </span>
                </div>

                {/* PAY NOW BUTTON */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowTicketModal(false)}
                    className="w-full sm:w-auto px-5 py-3 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer order-2 sm:order-1"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleProceedToCashfree}
                    disabled={isRedirectingToCashfree}
                    className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 order-1 sm:order-2"
                  >
                    {isRedirectingToCashfree ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Redirecting to Cashfree Payment Gateway...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>
                          Pay Now (₹{upgradeTotalAmount.toLocaleString("en-IN")}) &amp; Proceed to Cashfree
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-xs text-slate-500">
                Please choose a plan above to view the <strong>Pay Now</strong> option and proceed to Cashfree.
              </div>
            )}
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

      {/* MODAL 2: RECHARGE / EXTEND FRANCHISE LICENSE MODAL */}
      {showRechargeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-amber-200 space-y-6 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-950 px-2.5 py-0.5 rounded-full border border-amber-300">
                  Franchise License Renewal
                </span>
                <h3 className="text-xl font-black text-slate-950 mt-1 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-amber-600" />
                  Recharge Operating License
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRechargeModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Renew your <strong>{currentTier.toUpperCase()} Partner</strong> franchise license to keep automated order dispatch active and territory exclusivity protected.
            </p>

            <div className="space-y-3">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                Select Renewal Tenure
              </label>

              <div
                onClick={() => setRechargeTenure("1year")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  rechargeTenure === "1year"
                    ? "bg-amber-50/80 border-amber-500 shadow-xs ring-1 ring-amber-400"
                    : "bg-white border-slate-200 hover:border-amber-300"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-950">1-Year License Extension</span>
                    <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded uppercase">
                      10% Partner Concession
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">Full 365-day territory operating rights &amp; dispatch priority</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-slate-950 block">₹9,000</span>
                  <span className="text-[10px] text-slate-400 line-through">₹10,000</span>
                </div>
              </div>

              <div
                onClick={() => setRechargeTenure("6months")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  rechargeTenure === "6months"
                    ? "bg-amber-50/80 border-amber-500 shadow-xs ring-1 ring-amber-400"
                    : "bg-white border-slate-200 hover:border-amber-300"
                }`}
              >
                <div className="space-y-1">
                  <span className="text-xs font-black text-slate-950 block">6-Month License Extension</span>
                  <p className="text-[11px] text-slate-500">180-day territory operating rights</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-slate-950 block">₹4,800</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block">Payment Method:</span>
              <p>Instant UPI / NetBanking Settlement via Cashfree Payment Gateway.</p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleRechargeLicense}
                disabled={isRecharging}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isRecharging ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing License Renewal...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>
                      Pay &amp; Recharge ({rechargeTenure === "1year" ? "₹9,000" : "₹4,800"})
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD MONEY TO WALLET MODAL */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-amber-200 space-y-6 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-950 px-2.5 py-0.5 rounded-full border border-blue-300">
                  Wallet Recharge
                </span>
                <h3 className="text-xl font-black text-slate-950 mt-1 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-amber-600" />
                  Add Money to Wallet
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMoneyModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Maintain minimum ₹500 balance to keep your live trip dispatch engine active and cover automated cancellation penalty deductions.
            </p>

            <div className="space-y-3">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                Select Amount
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[500, 1000, 2000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAddMoneyAmount(amt)}
                    className={`py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      addMoneyAmount === amt
                        ? "bg-amber-400 text-slate-950 shadow-xs border-2 border-amber-500"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                    }`}
                  >
                    ₹{amt.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>

              <div className="pt-1">
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Or Enter Custom Amount (₹)</label>
                <input
                  type="number"
                  min="100"
                  step="50"
                  value={addMoneyAmount}
                  onChange={(e) => setAddMoneyAmount(Number(e.target.value))}
                  className="w-full p-3 text-sm font-black text-slate-950 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-400"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
              <span>Current Available Balance:</span>
              <strong className="text-slate-900 font-black">₹{walletBalance.toLocaleString("en-IN")}</strong>
            </div>

            <button
              type="button"
              onClick={() => handleAddMoneySubmit()}
              disabled={isAddingMoney}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isAddingMoney ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Cashfree UPI Top-up...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Pay &amp; Top-Up ₹{Number(addMoneyAmount).toLocaleString("en-IN")}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: RIDE INVOICE SLIP MODAL */}
      {selectedInvoiceRide && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-base font-black text-slate-950 tracking-tight">
                  Broom<span className="text-amber-600">Boom</span> Cabs
                </span>
                <p className="text-[10px] text-slate-500 font-semibold">
                  BroomBoom Transportation Services Private Limited
                </p>
                <p className="text-[10px] text-slate-400 font-mono">GSTIN: 19AAACB1234F1Z5</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInvoiceRide(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Booking ID:</span>
                <span className="font-mono font-black text-slate-950">{selectedInvoiceRide.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Date &amp; Time:</span>
                <span className="font-bold text-slate-800">
                  {selectedInvoiceRide.date} • {selectedInvoiceRide.time}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Vehicle Category:</span>
                <span className="font-bold text-slate-800">
                  {selectedInvoiceRide.vehicleCategory} ({selectedInvoiceRide.vehicleNumber || "Fleet Assigned"})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Assigned Driver:</span>
                <span className="font-bold text-slate-800">{selectedInvoiceRide.driverName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Passenger:</span>
                <span className="font-bold text-slate-800">{selectedInvoiceRide.passengerName}</span>
              </div>
            </div>

            <div className="text-xs space-y-1.5 border-t border-slate-100 pt-3">
              <p className="text-slate-700">
                <strong className="text-emerald-700">Pickup:</strong> {selectedInvoiceRide.pickup}
              </p>
              <p className="text-slate-700">
                <strong className="text-amber-700">Drop:</strong> {selectedInvoiceRide.drop}
              </p>
            </div>

            {/* Financials Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <div className="bg-slate-100 px-4 py-2 font-bold text-slate-700 flex justify-between">
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div className="divide-y divide-slate-100 p-4 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Trip Fare (Distance &amp; Base)</span>
                  <span>₹{selectedInvoiceRide.totalFare}</span>
                </div>
                <div className="flex justify-between text-slate-600 pt-1">
                  <span>Platform Commission Fee</span>
                  <span>-₹{selectedInvoiceRide.platformFee}</span>
                </div>
                <div className="flex justify-between text-slate-600 pt-1">
                  <span>Govt GST (5%)</span>
                  <span>-₹{selectedInvoiceRide.gst}</span>
                </div>
                {selectedInvoiceRide.penaltyDeducted > 0 && (
                  <div className="flex justify-between text-rose-700 font-bold pt-1">
                    <span>Driver Cancellation Penalty Deducted</span>
                    <span>-₹{selectedInvoiceRide.penaltyDeducted}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-slate-950 text-sm pt-2 border-t border-slate-200">
                  <span>Net Vendor Share</span>
                  <span className="text-emerald-700">₹{selectedInvoiceRide.netPayout}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">Payment: {selectedInvoiceRide.paymentMethod}</span>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") window.print();
                }}
                className="bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 py-6 border-t border-slate-200 mt-12">
        © {new Date().getFullYear()} BroomBoom Transportation Services Private Limited. All rights reserved.
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