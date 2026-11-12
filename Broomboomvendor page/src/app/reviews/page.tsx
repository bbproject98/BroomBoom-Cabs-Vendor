"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MessageSquarePlus,
  Search,
  Star,
  ArrowUpRight,
  MapPin,
  Clock,
  Phone,
  Mail,
  Smartphone,
  Plus,
  Minus,
  Calendar,
  IndianRupee,
  Car,
  Briefcase,
  Plane,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { VendorLoginModal } from "@/components/VendorLoginModal";
import { BrochureModal } from "@/components/BrochureModal";
import { FloatingCta } from "@/components/FloatingCta";

// --- TYPES & DATA ---
type ReviewCategory = "Drivers" | "On time" | "Clean & comfortable" | "Fares & value" | "Booking & support";

interface BroomBoomReviewItem {
  id: string;
  author: string;
  profileLabel: string;
  journeyType: "Airport Transfer" | "Outstation" | "Local Rentals" | "Vendor Fleet" | "Corporate";
  category: ReviewCategory;
  rating: number;
  avatarBg: string;
  text: string;
}

interface ExternalReview {
  id: string;
  author: string;
  platform: "Google Play" | "MouthShut" | "Tripadvisor";
  text: string;
  avatarBg: string;
}

const INITIAL_REVIEWS: BroomBoomReviewItem[] = [
  {
    id: "rev-1",
    author: "Anirban Mukherjee",
    profileLabel: "BroomBoom Kolkata",
    journeyType: "Vendor Fleet",
    category: "Fares & value",
    rating: 5,
    avatarBg: "bg-[#D97706]",
    text: "I recently partnered my 14 cabs with BroomBoom for Kolkata airport and corporate duties, and I had an excellent experience. Automated bank settlements arrive on time, and the Vendor Dashboard keeps all drivers scheduled smoothly with zero hassle.",
  },
  {
    id: "rev-2",
    author: "Rajeev Verma",
    profileLabel: "BroomBoom Delhi NCR",
    journeyType: "Outstation",
    category: "On time",
    rating: 5,
    avatarBg: "bg-[#EA580C]",
    text: "I have been using BroomBoom for Delhi to Jaipur, Agra, and Chandigarh outstation duties, and overall I had a very good experience. Pincode dispatch routing is simple, convenient, and hassle-free, keeping every cab occupied on return routes.",
  },
  {
    id: "rev-3",
    author: "Manisha Sharma",
    profileLabel: "BroomBoom Gurgaon",
    journeyType: "Airport Transfer",
    category: "Booking & support",
    rating: 5,
    avatarBg: "bg-[#9333EA]",
    text: "I have been using BroomBoom cab services for quite some time for early-morning airport pickups and family roundtrips. The booking process is simple and well coordinated, the cab always arrives right on schedule, and support team stays responsive.",
  },
  {
    id: "rev-4",
    author: "Mahesh Patil",
    profileLabel: "BroomBoom Pune",
    journeyType: "Vendor Fleet",
    category: "Fares & value",
    rating: 5,
    avatarBg: "bg-[#2563EB]",
    text: "I run two Ertigas on the Pune–Mumbai corridor with BroomBoom Vendor. Daily direct bank payout means I never run short of fuel money, and transparent commission slabs helped me scale my fleet earnings steadily every month.",
  },
  {
    id: "rev-5",
    author: "Nitin Sawant",
    profileLabel: "BroomBoom Mumbai",
    journeyType: "Corporate",
    category: "Clean & comfortable",
    rating: 5,
    avatarBg: "bg-[#059669]",
    text: "Switching our 10-cab South Mumbai and BKC fleet to BroomBoom's Platinum plan gave us 0% commission corporate bookings. Guests consistently appreciate clean commercial sedans, polite drivers, and punctual Mumbai Terminal 2 coordination.",
  }
];

const EXTERNAL_REVIEWS: ExternalReview[] = [
  {
    id: 'ext-1',
    author: 'Prem Jaiswal',
    platform: 'Google Play',
    text: 'App is really helpful for travelling. the booking is easy & the best is you can get reasonable price in it, cab drivers are good & you can get comfort with...',
    avatarBg: 'bg-slate-600'
  },
  {
    id: 'ext-2',
    author: 'Devendra Chaturvedi',
    platform: 'MouthShut',
    text: 'I recently used BroomBoom Cabs for my trip and they provide a best service with his experienced driver I feel a better experienced in the cab and cab is very...',
    avatarBg: 'bg-emerald-700'
  },
  {
    id: 'ext-3',
    author: 'Anamika M',
    platform: 'Tripadvisor',
    text: 'The experience with BroomBoom Cabs was good compared to other popular apps.Cab was clean,driver friendly and well-trained.Prices were also fine...',
    avatarBg: 'bg-blue-600'
  },
  {
    id: 'ext-4',
    author: 'Rahul Sharma',
    platform: 'Google Play',
    text: 'Very smooth interface. Booked an outstation cab within minutes. Driver was professional and the car was spotless.',
    avatarBg: 'bg-purple-600'
  },
  {
    id: 'ext-5',
    author: 'Priya Singh',
    platform: 'MouthShut',
    text: 'Good service overall. Customer support helped me modify my booking without extra charges. Will use again.',
    avatarBg: 'bg-pink-600'
  },
  {
    id: 'ext-6',
    author: 'Amit Kumar',
    platform: 'Tripadvisor',
    text: 'Reliable and punctual. Used them for an airport transfer and the driver was waiting exactly as described.',
    avatarBg: 'bg-indigo-600'
  }
];

const CLEAN_REVIEWS: BroomBoomReviewItem[] = INITIAL_REVIEWS.map((r) => ({
  ...r,
  journeyType: r.journeyType === ("Booking & support" as any) ? "Corporate" : r.journeyType,
}));

const CATEGORY_PILLS: ReviewCategory[] = ["Drivers", "On time", "Clean & comfortable", "Fares & value", "Booking & support"];

function GoogleBadgeIcon({ className = "w-6 h-6 shrink-0" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-label="Google Review">
      <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-8.97z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14c.95-2.85 3.6-4.96 6.72-4.96z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z" />
    </svg>
  );
}

/**
 * Drag-to-scroll hook.
 * - Desktop: click + drag anywhere on the track to scroll left → right (grab / grabbing cursor)
 * - Touch: native momentum scrolling is left untouched
 * - Exposes progress + visible range so the existing progress bars keep working
 */
function useDragScroll(gap = 20) {
  const ref = useRef<HTMLDivElement | null>(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0 });
  const movedRef = useRef(false);

  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [info, setInfo] = useState({ start: 0, end: 0, canPrev: false, canNext: false });

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const max = el.scrollWidth - el.clientWidth;
    const p = max <= 0 ? 0 : Math.round((el.scrollLeft / max) * 100);
    setProgress((prev) => (prev === p ? prev : p));

    const total = el.children.length;
    const firstChild = el.firstElementChild as HTMLElement | null;
    const step = firstChild && firstChild.offsetWidth > 0 ? firstChild.offsetWidth + gap : 0;
    const perView = step > 0 ? Math.max(1, Math.round((el.clientWidth + gap) / step)) : 1;
    const startIdx =
      step > 0 && total > 0
        ? Math.min(Math.max(0, total - perView), Math.round(el.scrollLeft / step))
        : 0;

    const nextInfo = {
      start: total === 0 ? 0 : startIdx + 1,
      end: total === 0 ? 0 : Math.min(startIdx + perView, total),
      canPrev: el.scrollLeft > 4,
      canNext: el.scrollLeft < max - 4,
    };

    setInfo((prev) =>
      prev.start === nextInfo.start &&
      prev.end === nextInfo.end &&
      prev.canPrev === nextInfo.canPrev &&
      prev.canNext === nextInfo.canNext
        ? prev
        : nextInfo
    );
  }, [gap]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", sync, { passive: true });
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    sync();
    return () => {
      el.removeEventListener("scroll", sync);
      ro.disconnect();
    };
  }, [sync]);

  // keep the range/progress in sync when filters change the children count
  useEffect(() => {
    sync();
  });

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse" || e.button !== 0) return;
    drag.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft };
    movedRef.current = false;
    setIsDragging(true);
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) movedRef.current = true;
    el.scrollLeft = drag.current.startScroll - dx;
  }, []);

  const endDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!drag.current.active) return;
    drag.current.active = false;
    setIsDragging(false);
    if (el) {
      try {
        if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    }
    requestAnimationFrame(() => {
      movedRef.current = false;
    });
  }, []);

  // swallow the click that follows a drag so "Show more" etc. don't fire accidentally
  const onClickCapture = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (movedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      movedRef.current = false;
    }
  }, []);

  const scrollByPage = useCallback((dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  }, []);

  const scrollToStart = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ left: 0, behavior: "smooth" });
  }, []);

  const handlers = useMemo(
    () => ({
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onClickCapture,
      onDragStart: (e: React.DragEvent<HTMLDivElement>) => e.preventDefault(),
    }),
    [onPointerDown, onPointerMove, endDrag, onClickCapture]
  );

  return useMemo(
    () => ({ ref, isDragging, progress, info, handlers, scrollByPage, scrollToStart }),
    [isDragging, progress, info, handlers, scrollByPage, scrollToStart]
  );
}

export default function ReviewsPage() {
  // Main Reviews State
  const [selectedCategory, setSelectedCategory] = useState<"All" | ReviewCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJourney, setSelectedJourney] = useState("All");
  const [selectedProfile, setSelectedProfile] = useState("All");
  const [sortBy, setSortBy] = useState<"detailed" | "highest" | "newest">("detailed");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [customReviews, setCustomReviews] = useState<BroomBoomReviewItem[]>([]);

  // Drag scroll tracks
  const reviewsScroll = useDragScroll(20); // gap-5
  const extScroll = useDragScroll(24); // gap-6

  // Backwards-compatible resets (scroll the track back to the first card)
  const setStartIndex = useCallback(
    (_: number) => {
      reviewsScroll.scrollToStart();
    },
    [reviewsScroll]
  );

  const setExtIndex = useCallback(
    (_: number) => {
      extScroll.scrollToStart();
    },
    [extScroll]
  );

  // External Reviews Filters
  const [extPlatform, setExtPlatform] = useState("All");

  // Form State
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [cityProfile, setCityProfile] = useState("BroomBoom Kolkata");
  const [reviewJourney, setReviewJourney] = useState<BroomBoomReviewItem["journeyType"]>("Vendor Fleet");
  const [reviewText, setReviewText] = useState("");
  const [submittedOk, setSubmittedOk] = useState(false);

  // Modals & FAQs
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isBrochureModalOpen, setIsBrochureModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState("gold");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleOpenLoginModal = (packageId: string = "gold") => {
    setSelectedPackage(packageId);
    setIsLoginModalOpen(true);
  };

  // Main Reviews Logic
  const allReviews = useMemo(() => [...customReviews, ...CLEAN_REVIEWS], [customReviews]);

  const categoryCounts = useMemo(() => {
    const map: Record<ReviewCategory, number> = { Drivers: 0, "On time": 0, "Clean & comfortable": 0, "Fares & value": 0, "Booking & support": 0 };
    for (const r of allReviews) { map[r.category] = (map[r.category] || 0) + 1; }
    return map;
  }, [allReviews]);

  const profileOptions = useMemo(() => Array.from(new Set(allReviews.map((r) => r.profileLabel))), [allReviews]);

  const filteredReviews = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = allReviews.filter((r) => {
      if (selectedCategory !== "All" && r.category !== selectedCategory) return false;
      if (selectedJourney !== "All" && r.journeyType !== selectedJourney) return false;
      if (selectedProfile !== "All" && r.profileLabel !== selectedProfile) return false;
      if (q && !r.author.toLowerCase().includes(q) && !r.profileLabel.toLowerCase().includes(q) && !r.text.toLowerCase().includes(q) && !r.journeyType.toLowerCase().includes(q)) return false;
      return true;
    });

    if (sortBy === "detailed") return [...list].sort((a, b) => b.text.length - a.text.length);
    if (sortBy === "highest") return [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [allReviews, selectedCategory, selectedJourney, selectedProfile, searchQuery, sortBy]);

  const toggleExpand = (id: string) => setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));

  // External Reviews Logic
  const filteredExternal = useMemo(() => {
    if (extPlatform === "All") return EXTERNAL_REVIEWS;
    return EXTERNAL_REVIEWS.filter(r => r.platform === extPlatform);
  }, [extPlatform]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !reviewText.trim()) return;

    const newItem: BroomBoomReviewItem = {
      id: `user-${Date.now()}`,
      author: authorName.trim(),
      profileLabel: cityProfile,
      journeyType: reviewJourney,
      category: "Booking & support",
      rating: 5,
      avatarBg: "bg-[#D97706]",
      text: reviewText.trim(),
    };

    setCustomReviews((prev) => [newItem, ...prev]);
    setSelectedCategory("All");
    setSelectedJourney("All");
    setSelectedProfile("All");
    setSearchQuery("");
    setStartIndex(0);
    setAuthorName("");
    setReviewText("");
    setShowWriteForm(false);
    setSubmittedOk(true);
    setTimeout(() => setSubmittedOk(false), 5000);
  };

  // Timeline routes (duplicated for seamless marquee)
  const routeItems = [
    { route: "Delhi to Mukteshwar", desc: "3-day family trip" },
    { route: "Amritsar to Gurdaspur", desc: "Smooth and on time" },
    { route: "Haridwar to Uttarakhand", desc: "Two friendly drivers" },
    { route: "Munnar to Rameshwaram", desc: "Booked 7 hours ahead" },
    { route: "Kanipakam to Tirupati", desc: "Polite and efficient" },
    { route: "Brahmapur to Nuagaon", desc: "A very new vehicle" },
  ];

  return (
    <div className="min-h-screen flex flex-col overflow-x-clip bg-[#F8FAFC] text-slate-900 selection:bg-yellow-400 selection:text-black font-sans">
      {/* ============ GLOBAL KEYFRAMES (effects only) ============ */}
      <style jsx global>{`
        @keyframes bb-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bb-fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bb-pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.55); }
          70% { box-shadow: 0 0 0 10px rgba(251, 191, 36, 0); }
          100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
        }
        @keyframes bb-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes bb-shine {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(220%) skewX(-12deg); }
        }
        @keyframes bb-twinkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.08); }
        }
        @keyframes bb-gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .bb-float { animation: bb-float 6s ease-in-out infinite; }
        .bb-enter { animation: bb-fade-up 0.55s ease-out backwards; }
        .bb-pulse-ring { animation: bb-pulse-ring 2.4s ease-out infinite; }
        .bb-marquee { animation: bb-marquee 42s linear infinite; }
        .bb-marquee:hover { animation-play-state: paused; }
        .bb-twinkle { animation: bb-twinkle 3s ease-in-out infinite; }
        .bb-gradient-underline {
          background-image: linear-gradient(90deg, #FBBF24 0%, #F59E0B 25%, #FBBF24 50%, #F59E0B 75%, #FBBF24 100%);
          background-size: 200% 100%;
          animation: bb-gradient-shift 5s ease-in-out infinite;
        }
        .bb-btn-shine { position: relative; overflow: hidden; }
        .bb-btn-shine::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 40%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.7), transparent);
          transform: translateX(-100%) skewX(-12deg);
          pointer-events: none;
        }
        .bb-btn-shine:hover::after { animation: bb-shine 0.9s ease-out; }
        .bb-card-shine {
          position: absolute;
          inset: 0;
          width: 45%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent);
          transform: translateX(-120%) skewX(-12deg);
          pointer-events: none;
          transition: none;
        }
        .group:hover .bb-card-shine { animation: bb-shine 0.9s ease-out; }
        .bb-card-glow { transition: box-shadow 0.35s ease, transform 0.35s ease; }
        .bb-card-glow:hover {
          box-shadow: 0 18px 40px -18px rgba(251, 191, 36, 0.55), 0 8px 20px -10px rgba(15, 23, 42, 0.18);
          transform: translateY(-4px);
        }
        @media (prefers-reduced-motion: reduce) {
          .bb-float, .bb-pulse-ring, .bb-marquee, .bb-twinkle, .bb-enter, .bb-gradient-underline,
          .bb-btn-shine:hover::after, .group:hover .bb-card-shine { animation: none !important; }
        }
      `}</style>

      <Navbar onOpenApplyModal={handleOpenLoginModal} onOpenBrochureModal={() => setIsBrochureModalOpen(true)} />

      <main className="flex-1 min-w-0 pb-24 md:pb-16 pt-0">
        
        {/* HERO SECTION */}
        <section className="bg-[#0A0A0A] text-white pt-16 pb-12 relative overflow-hidden">
          {/* ambient glow effects */}
          <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#FBBF24] opacity-[0.06] blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-[#FBBF24] opacity-[0.04] blur-3xl" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16 relative z-10">
            <div className="min-w-0">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-6 bb-enter">
                Every Journey <br />Has a Story.<br />
                <span className="text-[#FBBF24]">Here&apos;s What Our<br />Vendors Say.</span>
              </h1>
              <p className="text-slate-300 text-base sm:text-lg max-w-lg mb-8 leading-relaxed bb-enter" style={{ animationDelay: "80ms" }}>
                Explore vendor earning feedback about BroomBoom Cabs taxi booking services, from booking assistance and earning experiences in the city to profitable outstation journeys.
              </p>
              <div className="flex flex-wrap items-center gap-4 mb-10 bb-enter" style={{ animationDelay: "160ms" }}>
                <button
                  type="button"
                  onClick={() => handleOpenLoginModal("gold")}
                  className="bb-btn-shine bg-[#FBBF24] text-black px-6 py-3 rounded-xl font-bold tracking-wide hover:bg-yellow-500 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  JOIN NOW <ArrowUpRight className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => document.getElementById("reviews-list")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className="border border-slate-600 text-white px-6 py-3 rounded-xl font-bold tracking-wide hover:bg-slate-800 hover:border-slate-500 transition-colors cursor-pointer"
                >
                  EXPLORE VENDOR PARTNER REVIEWS
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm text-slate-300 mb-8 bb-enter" style={{ animationDelay: "240ms" }}>
                <div className="flex items-center gap-2"><MessageSquarePlus className="w-4 h-4 text-[#FBBF24] shrink-0" /> 81 featured Google reviews</div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#FBBF24] shrink-0" /> 6 city profiles on Google Maps</div>
                <div className="flex items-center gap-2"><Star className="w-4 h-4 text-[#FBBF24] shrink-0 bb-twinkle" /> <span className="underline decoration-slate-600 underline-offset-4">4.7 on Tripadvisor, 4.3 on Google Play</span></div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#FBBF24] shrink-0" /> 24x7 vendor support</div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300 pt-6 border-t border-slate-800 bb-enter" style={{ animationDelay: "320ms" }}>
                <span className="font-bold text-white">Reviews from</span>
                <GoogleBadgeIcon className="w-5 h-5 shrink-0" />
                <span className="text-slate-400">Copied word for word, each linked to the original.</span>
                <Link href="#reviews-list" className="text-blue-400 hover:underline">Read all on Google</Link>
              </div>
            </div>

            {/* Floating Vendor Review Card */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-[#FBBF24] blur-3xl opacity-10 rounded-full"></div>
              <div className="bb-float bg-white rounded-2xl p-6 shadow-2xl relative z-10 max-w-sm ml-auto border border-slate-200 hover:shadow-[0_25px_60px_-15px_rgba(251,191,36,0.45)] transition-shadow duration-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <GoogleBadgeIcon />
                    <span className="text-slate-500 text-sm font-medium">Vendor Review</span>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-[#FBBC04] text-[#FBBC04] bb-twinkle" style={{ animationDelay: `${i * 180}ms` }} />)}
                  </div>
                </div>
                <p className="text-slate-800 font-medium text-[15px] leading-relaxed mb-6">
                  &quot;Good experience with BroomBoom Vendor portal. Got a great earning opportunity through them, and the payment was received smoothly. Really appreciate the support and the business they provide to drivers like Us. 🙏&quot;
                </p>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#D97706] text-white flex items-center justify-center font-bold text-lg">V</div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Venkat Rao</h4>
                    <p className="text-xs text-slate-500">BroomBoom Vendor Hyderabad on Google Maps</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-600 font-medium cursor-pointer">
                  <GoogleBadgeIcon /> View on Google Maps
                </div>
              </div>
            </div>
          </div>

          {/* ROADS OUR VENDORS TRAVELLED TIMELINE — marquee effect */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-6 relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <span className="text-sm font-bold text-white">Roads our vendors travelled.</span>
              <span className="text-sm text-slate-400">Hover to pause · tap a trip to read the review.</span>
            </div>
            
            <div className="relative w-full overflow-hidden pb-6 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
              <div className="bb-marquee flex w-max items-start relative">
                {/* dashed connector spanning the whole moving track */}
                <div className="absolute top-3 left-8 right-8 border-t-2 border-dashed border-[#FBBF24]/50 z-0" />

                {/* original set */}
                {routeItems.map((item, idx) => (
                  <div key={`orig-${idx}`} className="w-[220px] shrink-0 relative z-10 flex flex-col items-center text-center px-3 group cursor-pointer">
                    <div className="w-6 h-6 rounded-full bg-[#0A0A0A] border-2 border-[#FBBF24] group-hover:bg-[#FBBF24] bb-pulse-ring transition-colors mb-4" />
                    <h4 className="text-sm font-bold text-white mb-1 group-hover:text-[#FBBF24] transition-colors">{item.route}</h4>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                ))}

                {/* duplicate set for seamless loop */}
                {routeItems.map((item, idx) => (
                  <div key={`dup-${idx}`} aria-hidden className="w-[220px] shrink-0 relative z-10 flex flex-col items-center text-center px-3 group cursor-pointer">
                    <div className="w-6 h-6 rounded-full bg-[#0A0A0A] border-2 border-[#FBBF24] group-hover:bg-[#FBBF24] bb-pulse-ring transition-colors mb-4" />
                    <h4 className="text-sm font-bold text-white mb-1 group-hover:text-[#FBBF24] transition-colors">{item.route}</h4>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* STICKY NAVIGATION BAR (Below Hero) */}
        <div className="bg-white border-b border-slate-200 sticky top-16 z-40 shadow-sm hidden md:block">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-8 overflow-x-auto hide-scrollbar h-14">
              {[
                { label: "Google reviews", href: "#reviews-list" },
                { label: "Other platforms", href: "#ratings" },
                { label: "What vendors mention", href: "#appreciate" },
                { label: "Vendor Earnings", href: "#earnings" },
                { label: "Partner Benefits", href: "#partner" },
                { label: "Services", href: "#services" },
                { label: "Popular routes", href: "#routes" },
                { label: "In the news", href: "#news" },
                { label: "Get help", href: "#help" },
                { label: "FAQs", href: "#faqs" },
              ].map((item, idx) => (
                <Link 
                  key={idx} 
                  href={item.href}
                  className="relative text-sm font-medium text-slate-600 hover:text-black whitespace-nowrap transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[#FBBF24] after:transition-all after:duration-300 hover:after:w-full"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* BROOMBOOM VENDOR SUCCESS STORIES IN THE NEWS */}
        <section id="news" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="md:w-1/3">
              <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-4 relative inline-block">
                BroomBoom Vendor Success Stories in the News
                <span className="block h-[3px] w-16 mt-3 rounded-full bb-gradient-underline" />
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Real experiences from our cab vendors and driver partners. Discover how BroomBoom connects vendors with booking opportunities, helps improve vehicle utilisation and creates earning opportunities across India.
              </p>
              <div className="bg-[#F8FAFC] border-l-4 border-[#FBBF24] p-4 mb-8 rounded-r-lg">
                <p className="text-slate-800 font-medium italic text-sm">
                  &quot;Your Cars. Your Business. More Earning Opportunities with BroomBoom.&quot;
                </p>
              </div>
              <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 border-b-2 border-[#FBBF24] pb-1 hover:text-slate-700">
                See all Vendor Success Stories Media Coverage <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="md:w-2/3 flex flex-col md:flex-row gap-6">
              {/* Featured Story Card */}
              <div className="bg-[#111111] text-white rounded-3xl p-8 flex-1 flex flex-col justify-between min-h-[300px] bb-card-glow">
                <div>
                  <span className="text-[#FBBF24] text-sm font-bold mb-3 block">Republic World</span>
                  <h3 className="text-xl font-bold leading-tight mb-4">
                    More Bookings, More Earning Opportunities
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-4">
                    Get access to customer bookings across multiple travel categories, including outstation, one-way, local rentals and airport transfers. Make your vehicles productive with more business opportunities.
                  </p>
                </div>
              </div>

              {/* Story List */}
              <div className="flex-1 flex flex-col justify-between divide-y divide-slate-200">
                {[
                  { source: "ANI", title: "Expand Your Business Beyond Your Local City", desc: "Connect with BroomBoom Vendor's pan-India booking network and explore trip opportunities across different cities, routes and travel destinations. Grow beyond your existing customer base." },
                  { source: "ABP Live", title: "Turn Your Available Cars into Revenue-Generating Assets", desc: "Whether you own one car or manage a fleet, BroomBoom vendor helps you explore booking opportunities according to your vehicle category and availability." },
                  { source: "Outlook India", title: "Every Completed Trip Brings Earning Potential", desc: "Complete accepted bookings, provide quality service and receive applicable vendor payments as per the agreed settlement terms. Build a consistent business relationship through reliable operations." },
                  { source: "ET Travel World", title: "From Individual Drivers to Large Fleet Operators", desc: "BroomBoom welcomes individual cab owners, travel agencies and fleet operators. Access a wider customer network and explore opportunities to grow your transportation business." }
                ].map((news, idx) => (
                  <div key={idx} className="py-3 group cursor-pointer">
                    <span className="text-[#D97706] text-xs font-bold block mb-1">{news.source}</span>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mb-1">{news.title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{news.desc}</p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 shrink-0 mt-1 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* RATED BY TRAVELLERS & EXTERNAL PLATFORMS CAROUSEL */}
        <section id="ratings" className="bg-[#0A0A0A] text-white py-20 relative overflow-hidden">
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-[#FBBF24] opacity-[0.03] blur-3xl" />
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 relative inline-block">
              BroomBoom Vendor Reviews
              <span className="block h-[3px] w-20 mt-3 rounded-full bb-gradient-underline" />
            </h2>
            <p className="text-slate-400 text-sm mb-10 max-w-xl">Filter by what BroomBoom Vendor driver partner online reviews, the kind of order earning they describe, or the Google profile the review was posted on.</p>
            
            {/* 3 Big Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-slate-800 relative overflow-hidden group bb-card-glow">
                <div className="bb-card-shine" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none"><path d="M3.2 1.2l13.2 8.1-3 3L3.2 1.2z" fill="#00C4FF"/><path d="M3.2 22.8L13.4 11.7l3 3L3.2 22.8z" fill="#00C4FF"/><path d="M21.6 11.8l-5.2-2.5-3.1 3.1 3.1 3.1 5.2-2.5c.8-.4.8-1.5 0-1.9z" fill="#FFD700"/></svg>
                    <span className="font-bold text-lg">Google Play</span>
                  </div>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-5xl font-bold text-[#FBBF24]">4.3</span>
                    <span className="text-slate-400 pb-2">out of 5</span>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(4)].map((_, i) => <Star key={i} className="w-4 h-4 fill-[#FBBF24] text-[#FBBF24] bb-twinkle" style={{ animationDelay: `${i * 180}ms` }} />)}
                    <Star className="w-4 h-4 text-slate-600" />
                  </div>
                  <p className="text-xs text-slate-400 mb-6">24.4K reviews, 1M+ downloads</p>
                  <Link href="#" className="text-sm font-bold underline underline-offset-4 hover:text-[#FBBF24]">See the app on Google Play</Link>
                </div>
              </div>

              <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-slate-800 relative overflow-hidden group bb-card-glow">
                <div className="bb-card-shine" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-6 h-6 rounded-full bg-[#34E0A1] flex items-center justify-center text-black font-bold text-xs">t</span>
                    <span className="font-bold text-lg">Tripadvisor</span>
                  </div>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-5xl font-bold text-[#FBBF24]">4.7</span>
                    <span className="text-slate-400 pb-2">out of 5</span>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-[#FBBF24] text-[#FBBF24] bb-twinkle" style={{ animationDelay: `${i * 180}ms` }} />)}
                  </div>
                  <p className="text-xs text-slate-400 mb-6">510 reviews</p>
                  <Link href="#" className="text-sm font-bold underline underline-offset-4 hover:text-[#FBBF24]">Read reviews on Tripadvisor</Link>
                </div>
              </div>

              <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-slate-800 relative overflow-hidden group bb-card-glow">
                <div className="bb-card-shine" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-bold text-lg">MouthShut</span>
                  </div>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-5xl font-bold text-[#FBBF24]">4.1</span>
                    <span className="text-slate-400 pb-2">out of 5</span>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(4)].map((_, i) => <Star key={i} className="w-4 h-4 fill-[#FBBF24] text-[#FBBF24] bb-twinkle" style={{ animationDelay: `${i * 180}ms` }} />)}
                    <Star className="w-4 h-4 text-slate-600" />
                  </div>
                  <p className="text-xs text-slate-400 mb-6">5,931 votes, 8.9K followers</p>
                  <Link href="#" className="text-sm font-bold underline underline-offset-4 hover:text-[#FBBF24]">Read reviews on MouthShut</Link>
                </div>
              </div>
            </div>

            {/* NEW EXTERNAL REVIEWS CAROUSEL */}
            <div className="mt-16">
              <p className="text-xs text-slate-400 mb-6">Ratings as shown on each platform on 28 October 2026.</p>
              
              <div className="flex flex-wrap gap-2 mb-8">
                {['All platforms', 'Tripadvisor', 'Google Play', 'MouthShut'].map((plat) => {
                  const isActive = extPlatform === plat || (plat === 'All platforms' && extPlatform === 'All');
                  const count = plat === 'All platforms' ? 42 : plat === 'Tripadvisor' ? 12 : plat === 'Google Play' ? 14 : 16;
                  
                  return (
                    <button 
                      key={plat}
                      onClick={() => { setExtPlatform(plat === 'All platforms' ? 'All' : plat); setExtIndex(0); }}
                      className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300 hover:scale-[1.03] ${isActive ? 'bg-[#FBBF24] text-black shadow-[0_6px_20px_-6px_rgba(251,191,36,0.6)]' : 'bg-[#1A1A1A] text-white border border-slate-700 hover:bg-slate-800'}`}
                    >
                      {plat === 'Tripadvisor' && <span className="w-4 h-4 rounded-full bg-[#34E0A1] text-black flex items-center justify-center text-[10px]">t</span>}
                      {plat === 'Google Play' && <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none"><path d="M3.2 1.2l13.2 8.1-3 3L3.2 1.2z" fill="#00C4FF"/><path d="M3.2 22.8L13.4 11.7l3 3L3.2 22.8z" fill="#00C4FF"/><path d="M21.6 11.8l-5.2-2.5-3.1 3.1 3.1 3.1 5.2-2.5c.8-.4.8-1.5 0-1.9z" fill="#FFD700"/></svg>}
                      {plat} 
                      <span className={`text-xs ${isActive ? 'opacity-70' : 'opacity-50'}`}>{count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Carousel Wrapper */}
              <div className="relative">
                <button 
                  onClick={() => extScroll.scrollByPage(-1)} 
                  disabled={!extScroll.info.canPrev}
                  className={`hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[#333] hover:bg-[#444] text-white rounded-full items-center justify-center transition-all ${!extScroll.info.canPrev ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div
                  ref={extScroll.ref}
                  {...extScroll.handlers}
                  className={`flex gap-6 overflow-x-auto overscroll-x-contain pb-2 hide-scrollbar ${
                    extScroll.isDragging
                      ? "cursor-grabbing select-none"
                      : "cursor-grab snap-x snap-mandatory"
                  }`}
                >
                  {filteredExternal.map((rev, idx) => (
                    <div
                      key={rev.id}
                      className="bb-enter group snap-start shrink-0 w-full md:w-[calc((100%-3rem)/3)] bg-white rounded-3xl p-6 flex flex-col justify-between min-h-[280px] relative overflow-hidden bb-card-glow"
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
                      <div className="bb-card-shine" />
                      <div className="relative">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full ${rev.avatarBg} text-white flex items-center justify-center text-xl font-bold ring-2 ring-white group-hover:ring-[#FBBF24]/60 transition-all`}>
                              {rev.author.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-base">{rev.author}</h4>
                              <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded mt-1">
                                {rev.platform} review
                              </span>
                            </div>
                          </div>
                          {rev.platform === 'Google Play' && <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none"><path d="M3.2 1.2l13.2 8.1-3 3L3.2 1.2z" fill="#00C4FF"/><path d="M3.2 22.8L13.4 11.7l3 3L3.2 22.8z" fill="#00C4FF"/><path d="M21.6 11.8l-5.2-2.5-3.1 3.1 3.1 3.1 5.2-2.5c.8-.4.8-1.5 0-1.9z" fill="#FFD700"/></svg>}
                          {rev.platform === 'Tripadvisor' && <span className="w-6 h-6 rounded-full bg-[#34E0A1] flex items-center justify-center text-black font-bold text-xs">t</span>}
                          {rev.platform === 'MouthShut' && <span className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold text-[10px]">MS</span>}
                        </div>
                        
                        <div className="flex gap-1 mb-4">
                          {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-[#FBBF24] text-[#FBBF24] bb-twinkle" style={{ animationDelay: `${i * 180}ms` }} />)}
                        </div>
                        
                        <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-4">
                          {rev.text}
                        </p>
                      </div>
                      
                      <div className="relative mt-4 pt-4 border-t border-slate-100">
                        <button className="text-sm font-bold text-slate-900 hover:text-blue-600 underline underline-offset-4 decoration-slate-300">
                          {rev.platform === 'Google Play' ? 'See the app on Google Play' : `Read this review on ${rev.platform}`}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => extScroll.scrollByPage(1)} 
                  disabled={!extScroll.info.canNext}
                  className={`hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[#333] hover:bg-[#444] text-white rounded-full items-center justify-center transition-all ${!extScroll.info.canNext ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Edge fades */}
                <div className={`pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#0A0A0A] to-transparent transition-opacity duration-300 ${extScroll.info.canPrev ? "opacity-100" : "opacity-0"}`} />
                <div className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#0A0A0A] to-transparent transition-opacity duration-300 ${extScroll.info.canNext ? "opacity-100" : "opacity-0"}`} />
              </div>
              
              {/* Progress Bar */}
              <div className="flex items-center gap-4 mt-8">
                <div className="h-1 flex-1 bg-[#333] rounded-full relative overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#FBBF24] via-[#F59E0B] to-[#FBBF24] rounded-full transition-all duration-300"
                    style={{ width: `${extScroll.progress}%`, backgroundSize: "200% 100%" }}
                  ></div>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {extScroll.info.start}–{extScroll.info.end} of {filteredExternal.length}
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* MAIN REVIEWS SECTION */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="mb-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">BroomBoom Cabs Customer Reviews</h2>
            <span className="block h-[3px] w-20 mx-auto rounded-full bb-gradient-underline mb-4" />
            <p className="text-slate-600">Filter by what customers mention, the kind of trip they describe, or the Google profile the review was posted on.</p>
          </div>

          {submittedOk && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-[bb-fade-up_0.4s_ease-out]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Your review has been added below!</span>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-full p-1 shadow-sm border border-slate-100">
                  <GoogleBadgeIcon />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Google Reviews</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{allReviews.length} featured reviews from BroomBoom Business Profiles on Google Maps, shown as posted</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("All"); setSelectedJourney("All"); setSelectedProfile("All"); setSearchQuery(""); setStartIndex(0);
                    document.getElementById("reviews-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="border border-slate-200 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
                >
                  View all on Google
                </button>
                <button
                  type="button"
                  onClick={() => setShowWriteForm((p) => !p)}
                  className="bg-blue-600 text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <MessageSquarePlus className="w-4 h-4" /> Write a review
                </button>
              </div>
            </div>
          </div>

          {showWriteForm && (
            <form onSubmit={handleSubmitReview} className="mb-6 bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm animate-[bb-fade-up_0.4s_ease-out]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">Share Your Review</span>
                <button type="button" onClick={() => setShowWriteForm(false)} className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer">Close</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input type="text" required value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Your Name" className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-slate-400 transition-colors" />
                <select value={cityProfile} onChange={(e) => setCityProfile(e.target.value)} className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-slate-400 transition-colors">
                  <option value="BroomBoom Kolkata">BroomBoom Kolkata</option>
                  <option value="BroomBoom Delhi NCR">BroomBoom Delhi NCR</option>
                  <option value="BroomBoom Mumbai">BroomBoom Mumbai</option>
                  <option value="BroomBoom Bangalore">BroomBoom Bangalore</option>
                  <option value="BroomBoom Pune">BroomBoom Pune</option>
                  <option value="BroomBoom Hyderabad">BroomBoom Hyderabad</option>
                </select>
                <select value={reviewJourney} onChange={(e) => setReviewJourney(e.target.value as any)} className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-slate-400 transition-colors">
                  <option value="Vendor Fleet">Vendor Fleet</option>
                  <option value="Airport Transfer">Airport Transfer</option>
                  <option value="Outstation">Outstation</option>
                  <option value="Local Rentals">Local Rentals</option>
                  <option value="Corporate">Corporate</option>
                </select>
              </div>
              <textarea required rows={3} value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Share your experience..." className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-slate-400 transition-colors" />
              <button type="submit" className="bb-btn-shine px-5 py-2 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold cursor-pointer">Post Review</button>
            </form>
          )}

          {/* Filters Box */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4 mb-8">
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => { setSelectedCategory("All"); setStartIndex(0); }} className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-300 hover:scale-[1.03] cursor-pointer ${selectedCategory === "All" ? "bg-[#111111] text-white shadow-md" : "bg-white text-slate-800 border border-slate-200 hover:border-slate-400"}`}>All reviews</button>
              {CATEGORY_PILLS.map((cat) => (
                <button key={cat} onClick={() => { setSelectedCategory(cat); setStartIndex(0); }} className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-300 hover:scale-[1.03] cursor-pointer ${selectedCategory === cat ? "bg-[#111111] text-white shadow-md" : "bg-white text-slate-800 border border-slate-200 hover:border-slate-400"}`}>
                  <span>{cat}</span>
                  <span className={`text-xs ${selectedCategory === cat ? "text-slate-300" : "text-slate-400"}`}>{categoryCounts[cat] || 0}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              <div className="lg:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setStartIndex(0); }} placeholder="Search, e.g. flight, BroomBoom, driver" className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors" />
              </div>
              <div className="lg:col-span-2">
                <select value={selectedJourney} onChange={(e) => { setSelectedJourney(e.target.value); setStartIndex(0); }} className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-slate-400 cursor-pointer transition-colors">
                  <option value="All">All journeys</option>
                  <option value="Airport Transfer">Airport Transfer</option>
                  <option value="Outstation">Outstation</option>
                  <option value="Local Rentals">Local Rentals</option>
                  <option value="Vendor Fleet">Vendor Fleet</option>
                  <option value="Corporate">Corporate</option>
                </select>
              </div>
              <div className="lg:col-span-2">
                <select value={selectedProfile} onChange={(e) => { setSelectedProfile(e.target.value); setStartIndex(0); }} className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-slate-400 cursor-pointer transition-colors">
                  <option value="All">All profiles</option>
                  {profileOptions.map((prof) => <option key={prof} value={prof}>{prof}</option>)}
                </select>
              </div>
              <div className="lg:col-span-3">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-slate-400 cursor-pointer transition-colors">
                  <option value="detailed">Most detailed first</option>
                  <option value="highest">Highest rated</option>
                  <option value="newest">Newest first</option>
                </select>
              </div>
            </div>
          </div>

          <div id="reviews-list" className="mb-4 text-[13px] text-slate-600 scroll-mt-24">
            Showing <span className="font-bold text-slate-900">{filteredReviews.length}</span> of <span className="font-bold text-slate-900">{allReviews.length}</span> reviews
          </div>

          {filteredReviews.length === 0 ? (
            <div className="rounded-3xl bg-[#F3F4F6] p-10 text-center animate-[bb-fade-up_0.4s_ease-out]">
              <p className="text-sm font-bold text-slate-800 mb-3">No matching reviews found for the current filters.</p>
              <button onClick={() => { setSelectedCategory("All"); setSelectedJourney("All"); setSelectedProfile("All"); setSearchQuery(""); setStartIndex(0); }} className="px-4 py-2 rounded-full bg-black text-white text-xs font-bold cursor-pointer hover:bg-slate-800 transition-colors">Reset Filters</button>
            </div>
          ) : (
            <div className="relative">
              <button onClick={() => reviewsScroll.scrollByPage(-1)} disabled={!reviewsScroll.info.canPrev} className={`hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md text-slate-700 absolute -left-5 top-1/2 -translate-y-1/2 z-10 transition-all ${!reviewsScroll.info.canPrev ? "opacity-0 pointer-events-none" : "cursor-pointer hover:bg-slate-50 hover:scale-105"}`}>
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div
                ref={reviewsScroll.ref}
                {...reviewsScroll.handlers}
                className={`flex gap-5 overflow-x-auto overscroll-x-contain pb-4 hide-scrollbar ${
                  reviewsScroll.isDragging
                    ? "cursor-grabbing select-none"
                    : "cursor-grab snap-x snap-mandatory"
                }`}
              >
                {filteredReviews.map((review, idx) => {
                  const initial = review.author.charAt(0).toUpperCase();
                  const isExpanded = Boolean(expandedIds[review.id]);
                  const hasLongBody = review.text.length > 145;

                  return (
                    <article
                      key={review.id}
                      className="bb-enter group snap-start shrink-0 w-full md:w-[calc((100%-2.5rem)/3)] rounded-3xl bg-white border border-slate-200 shadow-sm p-6 flex flex-col justify-between min-h-[245px] relative overflow-hidden bb-card-glow"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="bb-card-shine" />
                      <div className="relative">
                        <div className="flex items-start justify-between gap-3 mb-3.5">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-11 h-11 rounded-full ${review.avatarBg} text-white font-semibold text-base flex items-center justify-center shrink-0 ring-2 ring-transparent group-hover:ring-[#FBBF24]/70 transition-all`}>{initial}</div>
                            <div className="min-w-0">
                              <h2 className="text-[15px] font-semibold text-slate-900 truncate leading-tight">{review.author}</h2>
                              <p className="text-[12.5px] text-slate-500 truncate mt-0.5">{review.profileLabel}</p>
                            </div>
                          </div>
                          <GoogleBadgeIcon />
                        </div>
                        <div className="flex items-center gap-1.5 mb-3">
                          <div className="flex items-center gap-0.5">
                            {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-[#FBBC04] text-[#FBBC04] bb-twinkle" style={{ animationDelay: `${i * 180}ms` }} />)}
                          </div>
                          <BadgeCheck className="w-4 h-4 text-[#4285F4] fill-[#4285F4] stroke-white shrink-0" />
                        </div>
                        <p className={`text-[14px] text-slate-800 leading-relaxed ${!isExpanded && hasLongBody ? "line-clamp-4" : ""}`}>{review.text}</p>
                      </div>
                      {hasLongBody && (
                        <div className="relative mt-3">
                          <button onClick={() => toggleExpand(review.id)} className="text-[13.5px] font-medium text-slate-700 hover:text-slate-950 underline underline-offset-4 cursor-pointer">{isExpanded ? "Show less" : "Show more"}</button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>

              <button onClick={() => reviewsScroll.scrollByPage(1)} disabled={!reviewsScroll.info.canNext} className={`hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md text-slate-700 absolute -right-5 top-1/2 -translate-y-1/2 z-10 transition-all ${!reviewsScroll.info.canNext ? "opacity-0 pointer-events-none" : "cursor-pointer hover:bg-slate-50 hover:scale-105"}`}>
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Edge fades */}
              <div className={`pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#F8FAFC] to-transparent transition-opacity duration-300 ${reviewsScroll.info.canPrev ? "opacity-100" : "opacity-0"}`} />
              <div className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#F8FAFC] to-transparent transition-opacity duration-300 ${reviewsScroll.info.canNext ? "opacity-100" : "opacity-0"}`} />
            </div>
          )}

          {filteredReviews.length > 0 && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-[2px] flex-1 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#FBBF24] via-[#F59E0B] to-[#FBBF24] transition-all duration-300" style={{ width: `${reviewsScroll.progress}%`, backgroundSize: "200% 100%" }} />
                </div>
                <span className="text-xs font-medium text-slate-500 shrink-0">{reviewsScroll.info.start}–{reviewsScroll.info.end} of {filteredReviews.length}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Featured reviews are selected from BroomBoom&apos;s Google Business Profiles and verified vendor partner feedback across India.{" "}
                <Link href="/services" className="text-blue-600 hover:underline font-medium">Explore active vendor service hubs</Link>.
              </p>
            </div>
          )}
        </section>

        {/* ONLINE CAB ATTACHMENT - REPLACED JOURNEY TYPE */}
        <section id="partner" className="bg-[#F8FAFC] py-16 border-t border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Online Cab Attachment</h2>
            <p className="text-slate-600 text-sm mb-8 max-w-3xl leading-relaxed">
              Drivers / Vendor Partners / Taxi service providers can partner with BroomBoom to attach your car with the company and get business from the BroomBoom Vendor panel. It is as simple as just register yourself on the BroomBoom Vendor Web app, get verified and start work.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { 
                  icon: <Car className="w-5 h-5 text-[#D97706]" />,
                  title: "Outstation & Intercity Bookings", 
                  desc: "Trips like Delhi to Himachal, Mumbai to Mahabaleshwar and Munnar to Rameswaram with verified profitable earnings and incentives." 
                },
                { 
                  icon: <Clock className="w-5 h-5 text-[#D97706]" />,
                  title: "Flexible 24/7 Ride Orders", 
                  desc: "Bookings available pan India both day and night to ensure unstoppable earnings — more than 1 lakh+ earning per month." 
                },
                { 
                  icon: <Briefcase className="w-5 h-5 text-[#D97706]" />,
                  title: "Local Rentals & Corporate Bookings", 
                  desc: "Yearly high volume online corporate ride orders with professional drivers for corporate employees and office pick and drop facilities." 
                },
                { 
                  icon: <Plane className="w-5 h-5 text-[#D97706]" />,
                  title: "Easy Airport Booking", 
                  desc: "No need to sit behind with a car, register now and get Frequent high airport orders to outstation rides, all available only at BroomBoom Vendor panel with assured earnings." 
                }
              ].map((item, idx) => (
                <div key={idx} className="bb-enter group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden bb-card-glow" style={{ animationDelay: `${idx * 70}ms` }}>
                  <div className="bb-card-shine" />
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-6">{item.desc}</p>
                  </div>
                  <button onClick={() => handleOpenLoginModal("gold")} className="relative text-xs font-bold text-[#D97706] hover:underline text-left mt-auto w-fit">Partner Now</button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHAT CUSTOMERS APPRECIATE */}
        <section id="appreciate" className="bg-[#F8FAFC] py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">What Vendors Appreciate</h2>
            <p className="text-slate-600 text-sm mb-10">Ranked by how many of the 81 featured reviews mention each topic in their own words.</p>
            
            <div className="space-y-6">
              {[
                { icon: <Smartphone className="w-5 h-5 text-yellow-600" />, title: "Booking & support", count: 42, pct: "60%", quote: "They resolved my query quickly and professionally.", author: "Srinu Mo" },
                { icon: <Clock className="w-5 h-5 text-yellow-600" />, title: "Driver behaviour", count: 31, pct: "45%", quote: "Manoj, was very good at driving, punctual, soft spoken, made us very comfortable during the journey", author: "ashwini janakiram" },
                { icon: <BadgeCheck className="w-5 h-5 text-yellow-600" />, title: "Clean, comfortable cabs", count: 27, pct: "35%", quote: "To our surprise we got higher size car than was booked.", author: "Chandrakant Modi" }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 bg-transparent border-b border-slate-200 pb-6 last:border-0">
                  <div className="flex items-center gap-3 w-full md:w-1/4">
                    <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center shrink-0 transition-transform hover:scale-110 hover:rotate-3">{item.icon}</div>
                    <span className="font-bold text-slate-900 text-sm">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-1/4">
                    <div className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#FBBF24] via-[#F59E0B] to-[#FBBF24] rounded-full transition-all duration-700" style={{ width: item.pct, backgroundSize: "200% 100%" }}></div>
                    </div>
                    <span className="font-bold text-slate-900 text-sm">{item.count} <span className="text-xs text-slate-500 font-normal">reviews</span></span>
                  </div>
                  <div className="w-full md:w-2/4">
                    <p className="text-sm text-slate-700 italic mb-1">&quot;{item.quote}&quot;</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{item.author}</span>
                      <button className="text-[#D97706] font-bold hover:underline">Read these reviews</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* REAL EXPERIENCES FROM REAL EARNINGS (Previously Travel Tips) */}
        <section id="earnings" className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Real Experiences from Real Earnings.</h2>
            <p className="text-slate-600 text-sm mb-8">Insights and experiences from cab vendors and drivers who grow their business with BroomBoom.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { 
                  icon: <Briefcase className="w-5 h-5" />, 
                  title: "Get more booking opportunities", 
                  desc: "Connect with BroomBoom to receive cab booking opportunities for airport transfers, outstation trips, local rentals and tour packages. Turn your available vehicle time into earning opportunities.", 
                  quote: "Good experience with BroomBoom. Got a great earning opportunity through their bookings. Really appreciate the business and support they provide to drivers. 🙏", 
                  author: "Mahesh Bannurkar, BroomBoom Vendor Partner" 
                },
                { 
                  icon: <IndianRupee className="w-5 h-5" />, 
                  title: "Earn more with every completed trip", 
                  desc: "Accept suitable trips, provide reliable service and earn through your vehicle. BroomBoom connects vendors and drivers with customers looking for dependable cab services across India.", 
                  quote: "A great platform to get genuine trip opportunities and improve our daily earnings. Happy to receive business through BroomBoom.", 
                  author: "Bharat Devda, BroomBoom Driver Partner" 
                },
                { 
                  icon: <BadgeCheck className="w-5 h-5" />, 
                  title: "Transparent earnings and smooth settlements", 
                  desc: "Complete your assigned trips and receive your applicable earnings as per the agreed payment terms. Focus on driving while BroomBoom helps connect you with more customers and business opportunities.", 
                  quote: "The trip was completed successfully, and I received my earnings smoothly. Thank you, BroomBoom, for providing good business opportunities.", 
                  author: "Rakesh Karki, BroomBoom Vendor Partner" 
                },
                { 
                  icon: <Car className="w-5 h-5" />, 
                  title: "Get bookings across multiple categories", 
                  desc: "Receive business opportunities for airport transfers, outstation trips, local rentals and tour packages. Choose trips that match your vehicle category and availability.", 
                  quote: "BroomBoom helped me get good booking opportunities for my vehicle. The variety of trips gives me more chances to earn.", 
                  author: "Anand S., BroomBoom Cab Vendor" 
                },
                { 
                  icon: <Phone className="w-5 h-5" />, 
                  title: "Get support whenever you need it", 
                  desc: "Our vendor support team helps with booking coordination, trip-related queries, payment assistance and operational issues so you can focus on providing reliable service.", 
                  quote: "The BroomBoom team is supportive and responsive. Whenever I need help regarding a booking, their team guides me properly.", 
                  author: "Vikram R, BroomBoom Driver Partner" 
                },
                { 
                  icon: <ArrowUpRight className="w-5 h-5" />, 
                  title: "Turn every available trip into earning potential", 
                  desc: "Keep your vehicle active with BroomBoom booking opportunities. Complete trips, earn from your vehicle and grow your business through a wider customer network.", 
                  quote: "Good experience with BroomBoom. Got a great earning opportunity through their bookings. Really appreciate the business and support they provide to drivers. 🙏", 
                  author: "Santosh P., BroomBoom Cab Vendor" 
                }
              ].map((tip, idx) => (
                <div key={idx} className="bb-enter group border border-slate-200 rounded-2xl p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden" style={{ animationDelay: `${idx * 60}ms` }}>
                  <div className="bb-card-shine" />
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-[#111] text-white flex items-center justify-center mb-4 group-hover:bg-[#FBBF24] group-hover:text-black transition-colors duration-300 group-hover:rotate-3 group-hover:scale-110">{tip.icon}</div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{tip.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-6">{tip.desc}</p>
                  </div>
                  <div className="relative border-t border-slate-100 pt-4 mt-auto">
                    <p className="text-sm text-slate-700 italic mb-2">&quot;{tip.quote}&quot;</p>
                    <p className="text-xs text-blue-600 font-medium">{tip.author}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* POPULAR CAB ROUTES */}
        <section id="routes" className="bg-[#F8FAFC] py-16 border-t border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Popular Cab Routes</h2>
                <p className="text-slate-600 text-sm">Check fares and book on BroomBoom Cabs&apos; most travelled intercity routes.</p>
              </div>
              <Link href="#" className="text-sm font-bold text-slate-900 border-b-2 border-[#FBBF24] pb-1 hover:text-slate-700">All cities and routes</Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { from: "Delhi", to: "Agra", dist: "Fares", time: "& distance" },
                { from: "Delhi", to: "Jaipur", dist: "Fares", time: "& distance" },
                { from: "Delhi", to: "Haridwar", dist: "210 km", time: "approx. 5.5 hrs" },
                { from: "Delhi", to: "Manali", dist: "540 km", time: "approx. 12 hrs" },
                { from: "Mumbai", to: "Pune", dist: "Fares", time: "& distance" },
                { from: "Mumbai", to: "Shirdi", dist: "242 km", time: "approx. 4.8 hrs" },
                { from: "Bangalore", to: "Mysore", dist: "Fares", time: "& distance" },
                { from: "Bangalore", to: "Ooty", dist: "280 km", time: "approx. 6.5 hrs" },
                { from: "Chennai", to: "Pondicherry", dist: "Fares", time: "& distance" },
                { from: "Chennai", to: "Tirupati", dist: "Fares", time: "& distance" },
                { from: "Chandigarh", to: "Shimla", dist: "Fares", time: "& distance" },
                { from: "Jaipur", to: "Udaipur", dist: "Fares", time: "& distance" }
              ].map((route, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-200 flex justify-between items-center hover:shadow-lg hover:border-[#FBBF24]/60 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{route.from}</span>
                    <span className="text-slate-300 text-xs tracking-tighter">-------</span>
                    <MapPin className="w-4 h-4 text-[#FBBF24] fill-[#FBBF24] stroke-white group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-slate-900 text-sm">{route.to}</span>
                  </div>
                  <div className="text-right border-l border-slate-200 pl-4">
                    <p className="text-xs font-bold text-slate-900">{route.dist}</p>
                    <p className="text-[10px] text-slate-500">{route.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY PARTNER WITH BROOMBOOM? */}
        <section id="services" className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Why Partner with BroomBoom?</h2>
            <p className="text-slate-600 text-sm mb-10 max-w-3xl leading-relaxed">BroomBoom is an online cab booking platform connecting cab vendors, fleet owners and independent drivers with customer booking opportunities across India. From outstation journeys to airport transfers, local rentals and tour packages, we help our vendor partners access more business and grow their earnings.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {[
                { 
                  title: "Outstation Booking Opportunities", 
                  desc: "Get booking opportunities for intercity travel, one-way journeys and round trips. Connect your vehicles with customers looking for reliable outstation cab services across multiple routes in India.", 
                  linkText: "Explore outstation bookings →" 
                },
                { 
                  title: "One-way Trip Bookings", 
                  desc: "Generate business from one-way customer journeys without depending only on round-trip bookings. Get opportunities for routes where customers need a pickup from one city and a drop in another.", 
                  linkText: "Explore one-way bookings →" 
                },
                { 
                  title: "Local & Hourly Rental Bookings", 
                  desc: "Receive booking opportunities for local sightseeing, corporate travel, shopping, weddings and hourly rental requirements. Make better use of your vehicle availability with different rental packages.", 
                  linkText: "Explore local rental orders →" 
                },
                { 
                  title: "Airport Transfer Bookings", 
                  desc: "Get connected with customers requiring airport pickups and drops. Access business opportunities for early-morning, late-night and scheduled airport transfers, subject to your vehicle availability and service area.", 
                  linkText: "Explore airport booking opportunities →" 
                }
              ].map((feature, idx) => (
                <div key={idx} className="flex flex-col group">
                  <div className="w-8 h-1 bg-[#FBBF24] mb-6 group-hover:w-16 transition-all duration-500"></div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6 flex-1">{feature.desc}</p>
                  <Link href="#" className="text-sm font-bold text-slate-900 hover:text-blue-600 inline-flex items-center gap-1">
                    {feature.linkText}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faqs" className="bg-[#F8FAFC] py-16 border-t border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-slate-600 text-sm mb-8">Booking, fares and support, answered from BroomBoom Cabs&apos; own policies.</p>
              
              <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full bg-[#FBBF24]/20 text-[#D97706] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Still have a question? Call</p>
                  <a href="tel:+916289952418" className="text-sm font-bold text-slate-900 hover:underline">+91 6289952418, any time.</a>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2 space-y-2">
              {[
                { q: "Where can I read BroomBoom Cabs reviews?", a: "This page shows customer reviews posted on BroomBoom Cabs' Google Business Profiles, copied word for word, and each card links to the original review on Google Maps. You can read every review, including the most recent ones, directly on Google." },
                { q: "How do I book a BroomBoom Cabs taxi?", a: "You can book online through our website or mobile app by entering your pickup, drop, date, and time. Choose your cab type, review the fare breakdown, and confirm." },
                { q: "Which taxi services does BroomBoom Cabs offer?", a: "We offer outstation round trips, one-way drops, local hourly rentals, and airport transfers across India." },
                { q: "When will I get car and driver details?", a: "Driver and vehicle details are typically shared 2-4 hours prior to your scheduled pickup time via SMS and the app." },
                { q: "What is included in the fare?", a: "Fares generally include fuel, driver allowance, and GST. Tolls and state permits may vary depending on the route and the specific fare type chosen." },
                { q: "Can I book a cab at the last minute?", a: "Yes, you can book a cab up to 1 hour before your departure time, subject to availability." }
              ].map((faq, idx) => (
                <div key={idx} className="bg-transparent border-b border-slate-200 py-2">
                  <button 
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between py-4 text-left font-bold text-slate-900 hover:text-blue-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <div className={`w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0 transition-all duration-300 ${openFaq === idx ? "rotate-180 bg-[#FBBF24]/30" : ""}`}>
                      {openFaq === idx ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </button>
                  <div className={`grid transition-all duration-300 ease-out ${openFaq === idx ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden">
                      <div className="pb-4 text-sm text-slate-600 leading-relaxed pr-8">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* NEED HELP WITH BOOKING */}
        <section id="help" className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="bg-[#111111] rounded-3xl p-8 md:p-12 text-white grid grid-cols-1 md:grid-cols-3 gap-8 relative overflow-hidden">
              <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#FBBF24] opacity-10 blur-3xl" />
              <div className="md:col-span-1 relative">
                <h2 className="text-3xl font-bold mb-4">Need Help with a Booking?</h2>
                <p className="text-slate-400 text-sm leading-relaxed">BroomBoom Cabs&apos; customer support is available 24x7 to help with bookings and pickup issues.</p>
              </div>
              
              <div className="flex items-center gap-4 relative">
                <div className="w-12 h-12 rounded-full bg-[#FBBF24] text-black flex items-center justify-center shrink-0 hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Call 24x7 support</p>
                  <a href="tel:+916289952418" className="font-bold text-lg hover:text-[#FBBF24] transition-colors">+91 6289952418</a>
                </div>
              </div>
              
              <div className="flex items-center gap-4 relative">
                <div className="w-12 h-12 rounded-full bg-[#FBBF24] text-black flex items-center justify-center shrink-0 hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400 mb-1">Email us</p>
                  <a href="mailto:support@broomboomcabs.com" className="font-bold text-base md:text-lg hover:text-[#FBBF24] transition-colors whitespace-nowrap">support@broomboomcabs.com</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PLANNING TO JOIN BROOMBOOM VENDOR CTA */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
          <div className="bg-[#FBBF24] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border-b-4 border-black border-dashed relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,#000_1px,transparent_1px),radial-gradient(circle_at_80%_80%,#000_1px,transparent_1px)] [background-size:28px_28px]" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-3">Planning to Join<br />BroomBoom Vendor?</h2>
              <p className="text-black/80 text-sm md:text-base max-w-md">Explore BroomBoom Vendor services and find an online cab booking for your next trip earning.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 relative">
              <button type="button" onClick={() => handleOpenLoginModal("gold")} className="bb-btn-shine bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center cursor-pointer">
                Attach Your Cab <ArrowUpRight className="w-5 h-5" />
              </button>
              <a href="tel:+916289952418" className="bg-transparent border border-black text-black px-6 py-3 rounded-xl font-bold hover:bg-black/5 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center">
                <Phone className="w-4 h-4" /> Call +91 6289952418
              </a>
            </div>
          </div>
        </section>

      </main>

      <Footer onOpenApplyModal={handleOpenLoginModal} onOpenBrochureModal={() => setIsBrochureModalOpen(true)} />
      <FloatingCta onApplyClick={() => handleOpenLoginModal("gold")} />
      <VendorLoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} defaultPackage={selectedPackage} />
      <BrochureModal isOpen={isBrochureModalOpen} onClose={() => setIsBrochureModalOpen(false)} />
    </div>
  );
}