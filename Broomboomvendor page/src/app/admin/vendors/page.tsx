"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Smartphone,
  Car,
  Globe,
  Shuffle,
  Radio,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  ArrowRight,
  User,
  Phone,
  Mail,
  Layers,
  FileText,
  BadgeCheck,
  RefreshCw,
  ExternalLink,
  Search,
  Edit,
  X,
  MapPin,
  Check,
  Users,
  AlertTriangle,
  CreditCard,
  Ticket as TicketIcon,
} from "lucide-react";


interface AdminBookingOrder {
  id: string;
  bookingId: string;
  pickup: string;
  pickupZone?: string;
  drop: string;
  dropZone?: string;
  distance: string;
  duration: string;
  vehicleCategory: string;
  planTier: string;
  bookingType?: string;
  totalFare: number;
  vendorPayout: number;
  passengerName: string;
  passengerPhone: string;
  passengerRating?: number;
  status: "incoming" | "active" | "completed" | "pending_admin_reassign";
  source: "broomboom_app" | "broomboom_web" | string;
  assignedVendorId?: string;
  assignedVendorName?: string;
  assignedVendorMobile?: string;
  rejectedVendorIds?: string[];
  notes?: string;
  dispatchTime?: string;
  createdAt?: string;
  assignedDriver?: {
    name: string;
    phone: string;
    vehicleNumber: string;
    liveStatus: string;
    startOtp: string;
  };
}

interface Vendor {
  id: string;
  applicationId: string;
  vendorName: string;
  vendorMobile: string;
  vendorEmail?: string;
  city?: string;
  state?: string;
  planTier: string; // 'silver' | 'gold' | 'platinum' | 'unassigned'
  planName: string;
  baseAmount: number;
  totalAmount: number;
  paymentStatus: string; // 'PAID' | 'PENDING'
  status: string; // 'approved' | 'pending'
  orderId?: string;
  source: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  unassigned: number;
  gold: number;
  silver: number;
  platinum: number;
  approved: number;
  paid: number;
}


function getBookingTypeBadge(bookingType?: string, planTier?: string) {
  const t = (bookingType || "").toLowerCase().trim();
  if (t === "airport_transfer") return { label: "✈️ Airport Transfer", color: "bg-blue-50 text-blue-900 border-blue-300" };
  if (t === "station_transfer") return { label: "🚆 Station Transfer", color: "bg-indigo-50 text-indigo-900 border-indigo-300" };
  if (t === "rental_1hr_10km") return { label: "⏱️ Rental: 1h / 10km", color: "bg-slate-100 text-slate-900 border-slate-300" };
  if (t === "rental_3hr_30km") return { label: "⏱️ Rental: 3h / 30km", color: "bg-slate-100 text-slate-900 border-slate-300" };
  if (t === "rental_5hr_50km") return { label: "⏱️ Rental: 5h / 50km", color: "bg-slate-100 text-slate-900 border-slate-300" };
  if (t === "rental_8hr_80km") return { label: "⏱️ Rental: 08h / 80km", color: "bg-amber-100 text-amber-950 border-amber-300" };
  if (t === "rental_10hr_100km") return { label: "⏱️ Rental: 10h / 100km", color: "bg-amber-100 text-amber-950 border-amber-300" };
  if (t === "rental_12hr_120km") return { label: "⏱️ Rental: 12h / 120km", color: "bg-amber-100 text-amber-950 border-amber-300" };
  if (t === "outstation_oneway") return { label: "🚗 Outstation (Oneway)", color: "bg-amber-100 text-amber-950 border-amber-400" };
  if (t === "outstation_roundtrip") return { label: "🔄 Outstation (Roundtrip)", color: "bg-amber-100 text-amber-950 border-amber-400" };
  if (t === "tour_package") return { label: "🏖️ Tour Package", color: "bg-purple-100 text-purple-950 border-purple-400" };
  if (t === "corporate_ride") return { label: "💼 Corporate Ride (0% Comm)", color: "bg-cyan-100 text-cyan-950 border-cyan-400" };

  const tier = (planTier || "").toLowerCase().trim();
  if (tier === "platinum") return { label: "💎 Regional Master (0% Comm)", color: "bg-cyan-100 text-cyan-950 border-cyan-400" };
  if (tier === "silver") return { label: "🥈 Ward Kiosk Ride", color: "bg-slate-100 text-slate-900 border-slate-300" };
  return { label: "🥇 District Exclusive Hub", color: "bg-amber-100 text-amber-950 border-amber-300" };
}

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  // Dispatch Desk State
  const [activeAdminTab, setActiveAdminTab] = useState<"dispatch" | "directory">("dispatch");
  const [bookings, setBookings] = useState<AdminBookingOrder[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingPlanFilter, setBookingPlanFilter] = useState("ALL");
  const [bookingSourceFilter, setBookingSourceFilter] = useState("ALL");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("ALL");
  const [bookingSearch, setBookingSearch] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [cascadingBookingId, setCascadingBookingId] = useState<string | null>(null);
  const [dispatchNotice, setDispatchNotice] = useState<{ type: "success" | "info" | "warning"; message: string } | null>(null);

  const [stats, setStats] = useState<Stats>({
    total: 0,
    unassigned: 0,
    gold: 0,
    silver: 0,
    platinum: 0,
    approved: 0,
    paid: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State for Editing Modal
  const [editForm, setEditForm] = useState({
    vendorName: "",
    vendorMobile: "",
    vendorEmail: "",
    city: "",
    state: "",
    planTier: "gold",
    paymentStatus: "PAID",
    status: "pending",
  });

  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch("/api/admin/vendors");
      const data = await res.json();
      if (data.success) {
        setVendors(data.vendors);
        if (data.stats) setStats(data.stats);
      } else {
        setErrorMsg(data.error || "Failed to load vendors");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load vendors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // Fetch all bookings for live dispatch desk
  const fetchBookings = useCallback(async () => {
    try {
      setLoadingBookings(true);
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (data.success && Array.isArray(data.bookings)) {
        setBookings(data.bookings);
      }
    } catch (err: any) {
      console.error("[FETCH BOOKINGS ERROR]", err);
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(() => {
      fetchBookings();
    }, 6000);
    return () => clearInterval(interval);
  }, [fetchBookings]);

  // Simulate new ride booking from App or Web
  const handleSimulateBooking = async (scenario: string) => {
    try {
      setIsSimulating(true);
      let payload: any = {};

      // 1. SILVER PARTNER (WARD KIOSK) SCENARIOS
      if (scenario === "silver_airport") {
        payload = {
          passengerName: "Ananya Ghosh",
          passengerPhone: "+91 98302 11982",
          pickup: "Kolkata Netaji Subhash Chandra Bose Airport (Terminal 2 Gate 4)",
          pickupZone: "Kolkata Airport",
          pickupPincode: "700052",
          drop: "Salt Lake Sector V Tech Park",
          dropZone: "Salt Lake",
          dropPincode: "700091",
          distance: "14.8 km",
          duration: "28 mins",
          vehicleCategory: "Sedan (Swift Dzire / Etios)",
          planTier: "silver",
          bookingType: "airport_transfer",
          commissionRate: 15,
          totalFare: 560,
          source: "broomboom app",
          paymentMethod: "Online Paid (Cashfree UPI)",
        };
      } else if (scenario === "silver_station") {
        payload = {
          passengerName: "Tanmoy Sen",
          passengerPhone: "+91 98741 22891",
          pickup: "Howrah Railway Station Commercial Cab Point A",
          pickupZone: "Howrah Station",
          pickupPincode: "711101",
          drop: "Park Street Commercial District Hub",
          dropZone: "Park Street",
          dropPincode: "700016",
          distance: "7.5 km",
          duration: "22 mins",
          vehicleCategory: "Sedan (Swift Dzire)",
          planTier: "silver",
          bookingType: "station_transfer",
          commissionRate: 15,
          totalFare: 420,
          source: "broomboomweb_page",
          paymentMethod: "Online Paid (Cashfree UPI)",
        };
      } else if (scenario === "silver_rental_1h") {
        payload = {
          passengerName: "Rakesh Verma",
          passengerPhone: "+91 94331 88902",
          pickup: "Ward Kiosk Hub Singur (PIN: 712124)",
          pickupZone: "Singur",
          pickupPincode: "712124",
          drop: "Local Ward Errand (1 Hour / 10 Kms)",
          dropZone: "Singur",
          dropPincode: "712124",
          distance: "10 km",
          duration: "1 hr",
          vehicleCategory: "Hatchback (WagonR)",
          planTier: "silver",
          bookingType: "rental_1hr_10km",
          commissionRate: 15,
          totalFare: 350,
          source: "broomboom app",
          paymentMethod: "Online Paid (Cashfree UPI)",
        };
      } else if (scenario === "silver_rental_3h") {
        payload = {
          passengerName: "Debashis Banerjee",
          passengerPhone: "+91 98305 66710",
          pickup: "Singur Market Square (PIN: 712124)",
          pickupZone: "Singur",
          pickupPincode: "712124",
          drop: "Ward Medical & Shopping Circuit (3 Hours / 30 Kms)",
          dropZone: "Singur",
          dropPincode: "712124",
          distance: "30 km",
          duration: "3 hrs",
          vehicleCategory: "Sedan (Swift Dzire)",
          planTier: "silver",
          bookingType: "rental_3hr_30km",
          commissionRate: 15,
          totalFare: 850,
          source: "broomboomweb_page",
          paymentMethod: "Online Paid (Cashfree UPI)",
        };
      } else if (scenario === "silver_rental_5h") {
        payload = {
          passengerName: "Siddhartha Sen",
          passengerPhone: "+91 98744 33019",
          pickup: "Dum Dum Kiosk Station",
          pickupZone: "Dum Dum",
          pickupPincode: "700028",
          drop: "Half-Day Ward Commercial Rental (5 Hours / 50 Kms)",
          dropZone: "Dum Dum",
          dropPincode: "700028",
          distance: "50 km",
          duration: "5 hrs",
          vehicleCategory: "Sedan (Etios)",
          planTier: "silver",
          bookingType: "rental_5hr_50km",
          commissionRate: 15,
          totalFare: 1350,
          source: "broomboom app",
          paymentMethod: "Online Paid (Cashfree UPI)",
        };
      }
      
      // 2. GOLD PARTNER (DISTRICT EXCLUSIVE) SCENARIOS
      else if (scenario === "gold_rental_8h") {
        payload = {
          passengerName: "Dr. Anirban Ghosh",
          passengerPhone: "+91 94330 55412",
          pickup: "District Exclusive Hub Singur (PIN: 712124)",
          pickupZone: "Singur",
          pickupPincode: "712124",
          drop: "District Full-Day Commercial Rental (08 Hours / 80 Kms)",
          dropZone: "District Hub",
          dropPincode: "712124",
          distance: "80 km",
          duration: "8 hrs",
          vehicleCategory: "Prime Sedan (Honda City)",
          planTier: "gold",
          bookingType: "rental_8hr_80km",
          commissionRate: 10,
          totalFare: 2100,
          source: "broomboomweb_page",
          paymentMethod: "Online Paid (Cashfree UPI)",
        };
      } else if (scenario === "gold_rental_10h") {
        payload = {
          passengerName: "Rohan Malhotra",
          passengerPhone: "+91 98311 99042",
          pickup: "Howrah District Commercial Hub",
          pickupZone: "Howrah",
          pickupPincode: "711101",
          drop: "Industrial Inspection Circuit (10 Hours / 100 Kms)",
          dropZone: "Howrah",
          dropPincode: "711101",
          distance: "100 km",
          duration: "10 hrs",
          vehicleCategory: "SUV (Innova Crysta)",
          planTier: "gold",
          bookingType: "rental_10hr_100km",
          commissionRate: 10,
          totalFare: 2750,
          source: "broomboom app",
          paymentMethod: "Online Paid (Cashfree UPI)",
        };
      } else if (scenario === "gold_rental_12h") {
        payload = {
          passengerName: "Sanjay Singhal",
          passengerPhone: "+91 98300 77123",
          pickup: "Hooghly District Hub (PIN: 712124)",
          pickupZone: "Hooghly",
          pickupPincode: "712124",
          drop: "Extended Full-Day Corporate Rental (12 Hours / 120 Kms)",
          dropZone: "Hooghly",
          dropPincode: "712124",
          distance: "120 km",
          duration: "12 hrs",
          vehicleCategory: "SUV (Innova Crysta)",
          planTier: "gold",
          bookingType: "rental_12hr_120km",
          commissionRate: 10,
          totalFare: 3300,
          source: "broomboomweb_page",
          paymentMethod: "Online Paid (Cashfree UPI)",
        };
      } else if (scenario === "gold_outstation_oneway") {
        payload = {
          passengerName: "Priyanka Sengupta",
          passengerPhone: "+91 98740 11984",
          pickup: "Singur Ratanpur Commercial Hub (PIN: 712124)",
          pickupZone: "Singur",
          pickupPincode: "712124",
          drop: "Burdwan Medical College & District Hub (PIN: 713101)",
          dropZone: "Burdwan",
          dropPincode: "713101",
          distance: "68 km",
          duration: "1 hr 35 mins",
          vehicleCategory: "Sedan (Swift Dzire)",
          planTier: "gold",
          bookingType: "outstation_oneway",
          commissionRate: 10,
          totalFare: 1850,
          source: "broomboom app",
          paymentMethod: "Online Paid (Cashfree UPI)",
        };
      } else if (scenario === "gold_outstation_round") {
        payload = {
          passengerName: "Soumen Adhikary",
          passengerPhone: "+91 98321 44501",
          pickup: "Singur Market Square (PIN: 712124)",
          pickupZone: "Singur",
          pickupPincode: "712124",
          drop: "Durgapur Steel City & Return (Roundtrip Outstation)",
          dropZone: "Durgapur",
          dropPincode: "713216",
          distance: "230 km",
          duration: "Same-Day Roundtrip",
          vehicleCategory: "SUV (Innova Crysta)",
          planTier: "gold",
          bookingType: "outstation_roundtrip",
          commissionRate: 10,
          totalFare: 4200,
          source: "broomboomweb_page",
          paymentMethod: "Online Paid (Cashfree UPI)",
        };
      }

      // 3. PLATINUM PARTNER (REGIONAL MASTER) SCENARIOS
      else if (scenario === "platinum_tour") {
        payload = {
          passengerName: "Vikram Singhania",
          passengerPhone: "+91 98311 00223",
          pickup: "Park Street Commercial VIP Hub",
          pickupZone: "Park Street",
          pickupPincode: "700016",
          drop: "Digha Coastal Beach Resort (3D/2N Holiday Tour Package)",
          dropZone: "Digha",
          dropPincode: "721428",
          distance: "185 km",
          duration: "3 Days / 2 Nights Tour",
          vehicleCategory: "Premium Master Fleet (Innova Crysta Luxury)",
          planTier: "platinum",
          bookingType: "tour_package",
          commissionRate: 0, // ★ 0% Commission (Zero Platform Fee)
          totalFare: 6500,
          source: "broomboomweb_page",
          paymentMethod: "Online Paid (Cashfree UPI)",
        };
      } else if (scenario === "platinum_corporate") {
        payload = {
          passengerName: "Amitabh Choudhury (MNC Director)",
          passengerPhone: "+91 98301 55670",
          pickup: "Rajarhat New Town IT Expressway",
          pickupZone: "New Town",
          pickupPincode: "700156",
          drop: "Salt Lake Sector V Executive Tech Campus",
          dropZone: "Sector V",
          dropPincode: "700091",
          distance: "22 km",
          duration: "45 mins",
          vehicleCategory: "Corporate Luxury Fleet (Camry / Innova Crysta)",
          planTier: "platinum",
          bookingType: "corporate_ride",
          commissionRate: 0, // ★ 0% Commission SLA
          totalFare: 1950,
          source: "broomboom app",
          paymentMethod: "Corporate Direct Invoicing",
        };
      }

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setDispatchNotice({
          type: "success",
          message: `⚡ ${data.message || 'Ride created!'} Allocated exclusively to Nearest ${payload.planTier.toUpperCase()} partner: ${data.booking?.assigned_vendor_name || 'Nearest Partner'} (${data.booking?.assigned_vendor_id}) | Comm: ${payload.commissionRate}% | Payout: ₹${data.booking?.vendor_payout}`,
        });
        setTimeout(() => setDispatchNotice(null), 8000);
        fetchBookings();
      } else {
        alert(data.error || "Simulation failed");
      }
    } catch (e: any) {
      console.error("[SIMULATE ERROR]", e);
    } finally {
      setIsSimulating(false);
    }
  };

  // Simulate Rejection & Cascading to 2nd Nearest Vendor
  const handleSimulateCascade = async (booking: AdminBookingOrder) => {
    try {
      setCascadingBookingId(booking.id);
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          bookingId: booking.id,
          vendorId: booking.assignedVendorId || "UNKNOWN",
          reason: "Simulated rejection by nearest vendor: test cascading to 2nd nearest partner",
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.cascaded && data.nextVendor) {
          setDispatchNotice({
            type: "warning",
            message: `⚡ CASCADE SUCCESS! Booking ${booking.bookingId} was declined by 1st partner ${booking.assignedVendorId} and instantly reassigned to 2nd nearest ${booking.planTier.toUpperCase()} partner: ${data.nextVendor.vendorName} (${data.nextVendor.vendorId} - ${data.nextVendor.city})!`,
          });
        } else {
          setDispatchNotice({
            type: "info",
            message: data.message || "Cascaded booking successfully.",
          });
        }
        setTimeout(() => setDispatchNotice(null), 8000);
        fetchBookings();
      } else {
        alert(data.error || "Cascading failed");
      }
    } catch (err: any) {
      console.error("[CASCADE ERROR]", err);
    } finally {
      setCascadingBookingId(null);
    }
  };

  // Complete a booking
  const handleAdminCompleteBooking = async (bookingId: string) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          bookingId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDispatchNotice({
          type: "success",
          message: `Booking ${bookingId} marked completed & settled successfully!`,
        });
        setTimeout(() => setDispatchNotice(null), 6000);
        fetchBookings();
      }
    } catch (e: any) {
      console.error("[ADMIN COMPLETE ERROR]", e);
    }
  };

  // Client-side filtering for bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.bookingId.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.passengerName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.pickup.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.drop.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      (b.assignedVendorName && b.assignedVendorName.toLowerCase().includes(bookingSearch.toLowerCase())) ||
      (b.assignedVendorId && b.assignedVendorId.toLowerCase().includes(bookingSearch.toLowerCase()));

    if (!matchesSearch) return false;

    if (bookingPlanFilter !== "ALL" && (b.planTier || "").toLowerCase() !== bookingPlanFilter.toLowerCase()) {
      return false;
    }

    if (bookingSourceFilter !== "ALL" && b.source !== bookingSourceFilter) {
      return false;
    }

    if (bookingStatusFilter !== "ALL" && b.status !== bookingStatusFilter) {
      return false;
    }

    return true;
  });

  const openEditModal = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setEditForm({
      vendorName: vendor.vendorName === "Valued Partner" ? "" : vendor.vendorName,
      vendorMobile: vendor.vendorMobile || "",
      vendorEmail: vendor.vendorEmail || "",
      city: vendor.city || "",
      state: vendor.state || "",
      planTier: vendor.planTier === "unassigned" ? "gold" : vendor.planTier,
      paymentStatus: vendor.paymentStatus || "PAID",
      status: vendor.status || "pending",
    });
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const closeEditModal = () => {
    setEditingVendor(null);
  };

  const handleSaveVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVendor) return;

    try {
      setIsSaving(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await fetch("/api/admin/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: editingVendor.applicationId,
          vendorMobile: editForm.vendorMobile || editingVendor.vendorMobile,
          vendorName: editForm.vendorName.trim() || "Valued Partner",
          vendorEmail: editForm.vendorEmail.trim(),
          city: editForm.city.trim(),
          state: editForm.state.trim(),
          planTier: editForm.planTier,
          paymentStatus: editForm.paymentStatus,
          status: editForm.status,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update vendor details");
      }

      setSuccessMsg(data.message || "Vendor updated successfully!");
      fetchVendors();
      setTimeout(() => {
        closeEditModal();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Error saving changes");
    } finally {
      setIsSaving(false);
    }
  };

  // Client-side filtering
  const filteredVendors = vendors.filter((v) => {
    const matchesSearch =
      v.applicationId.toLowerCase().includes(search.toLowerCase()) ||
      v.vendorName.toLowerCase().includes(search.toLowerCase()) ||
      v.vendorMobile.includes(search) ||
      (v.city && v.city.toLowerCase().includes(search.toLowerCase())) ||
      (v.state && v.state.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === "ALL") return true;
    if (activeFilter === "UNASSIGNED") {
      return v.planTier === "unassigned" || v.vendorName === "Valued Partner";
    }
    if (activeFilter === "GOLD") return v.planTier === "gold";
    if (activeFilter === "SILVER") return v.planTier === "silver";
    if (activeFilter === "PLATINUM") return v.planTier === "platinum";
    if (activeFilter === "APPROVED") return v.status === "approved";
    if (activeFilter === "PENDING") return v.status !== "approved";
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-16">
      {/* Top Header */}
      <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-30 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400 bg-white flex items-center justify-center p-0.5">
              <Image src="/broomboom-logo.png" alt="BroomBoom" fill className="object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight">
                  Broom<span className="text-amber-400">Boom</span>
                </span>
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded border border-amber-400/30 uppercase">
                  Admin HQ
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Partner Directory &amp; Manual Onboarding Control Desk
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/admin/vendors"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-950 bg-amber-400 px-3.5 py-2 rounded-xl shadow-xs"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Vendors Directory</span>
            </Link>

            <Link
              href="/admin/tickets"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-xl transition-all"
            >
              <TicketIcon className="w-3.5 h-3.5" />
              <span>Plan Tickets</span>
            </Link>

            <button
              onClick={fetchVendors}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            <Link
              href="/vendor/dashboard"
              target="_blank"
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-emerald-200 bg-emerald-950/80 border border-emerald-800 px-3 py-2 rounded-xl transition-all"
            >
              <span>Vendor Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-6">
        {/* Banner Alert if Any */}
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-300 text-rose-800 rounded-2xl flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Live Dispatch Notification */}
        {dispatchNotice && (
          <div
            className={`p-4 rounded-2xl border-2 flex items-start gap-3 shadow-md animate-in slide-in-from-top-2 ${
              dispatchNotice.type === "success"
                ? "bg-emerald-50 border-emerald-400 text-emerald-950"
                : dispatchNotice.type === "warning"
                ? "bg-amber-50 border-amber-400 text-amber-950"
                : "bg-blue-50 border-blue-400 text-blue-950"
            }`}
          >
            {dispatchNotice.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : dispatchNotice.type === "warning" ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className="text-sm font-black">
                {dispatchNotice.type === "warning" ? "Plan-Wise Cascading Triggered" : "Live Dispatch Notice"}
              </h4>
              <p className="text-xs mt-0.5 font-medium leading-relaxed">{dispatchNotice.message}</p>
            </div>
            <button
              onClick={() => setDispatchNotice(null)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
          <button
            type="button"
            onClick={() => setActiveAdminTab("dispatch")}
            className={`px-5 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
              activeAdminTab === "dispatch"
                ? "bg-slate-950 text-amber-400 ring-2 ring-amber-400/50"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Live Dispatch Desk (User App &amp; Web)</span>
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
              {bookings.length} BOOKINGS
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab("directory")}
            className={`px-5 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
              activeAdminTab === "directory"
                ? "bg-slate-950 text-amber-400 ring-2 ring-amber-400/50"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Users className="w-4 h-4 text-blue-400" />
            <span>Franchise Partner Directory</span>
            <span className="bg-slate-200 text-slate-800 text-[10px] font-black px-2 py-0.5 rounded-full">
              {vendors.length} PARTNERS
            </span>
          </button>
        </div>

        {/* TAB 1: LIVE DISPATCH DESK VIEW */}
        {activeAdminTab === "dispatch" && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Live BroomBoom Dispatch &amp; Cascading Engine Active
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white">
                  Live Rides Dispatch &amp; Proximity Allocation Desk
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Incoming passenger bookings from <strong>BroomBoom Mobile App</strong> and <strong>BroomBoom Web</strong> are automatically segregated strictly by plan tier (Silver for Airport/Station/Kiosk; Gold for District Rentals; Platinum for VIP Master) and dispatched to the <strong>1st Nearest Qualified Franchise</strong>. If declined, bookings instantly cascade to the <strong>2nd Nearest Partner</strong>.
                </p>
              </div>

              {/* Stats Counters */}
              <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 shrink-0">
                <div className="px-3 py-1 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Total</span>
                  <span className="text-lg font-black text-white">{bookings.length}</span>
                </div>
                <div className="w-px h-8 bg-slate-800" />
                <div className="px-3 py-1 text-center">
                  <span className="text-[10px] text-sky-400 font-bold block uppercase">📱 App</span>
                  <span className="text-lg font-black text-sky-400">
                    {bookings.filter((b) => b.source === "broomboom_app").length}
                  </span>
                </div>
                <div className="w-px h-8 bg-slate-800" />
                <div className="px-3 py-1 text-center">
                  <span className="text-[10px] text-teal-400 font-bold block uppercase">🌐 Web</span>
                  <span className="text-lg font-black text-teal-400">
                    {bookings.filter((b) => b.source === "broomboom_web").length}
                  </span>
                </div>
                <div className="w-px h-8 bg-slate-800" />
                <div className="px-3 py-1 text-center">
                  <span className="text-[10px] text-slate-300 font-bold block uppercase">🥈 Silver</span>
                  <span className="text-lg font-black text-slate-200">
                    {bookings.filter((b) => (b.planTier || "").toLowerCase() === "silver").length}
                  </span>
                </div>
                <div className="w-px h-8 bg-slate-800" />
                <div className="px-3 py-1 text-center">
                  <span className="text-[10px] text-amber-400 font-bold block uppercase">🥇 Gold</span>
                  <span className="text-lg font-black text-amber-400">
                    {bookings.filter((b) => (b.planTier || "").toLowerCase() === "gold").length}
                  </span>
                </div>
              </div>
            </div>

            {/* Test Simulation Controls Card - Grouped Strictly by the 3 Packages */}
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-300/60 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-xs">
                    ⚡
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                      <span>Simulate Package-Wise Customer Bookings (App &amp; Web)</span>
                      <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                        Live Auto-Dispatch
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-600">
                      Click any scenario below to trigger a live booking. The dispatch engine routes rides strictly based on package inclusions and proximity!
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={fetchBookings}
                  disabled={loadingBookings}
                  className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer self-start sm:self-auto shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingBookings ? "animate-spin" : ""}`} />
                  <span>Refresh Feed</span>
                </button>
              </div>

              {/* 3 Package Rows */}
              <div className="space-y-3">
                {/* 1. SILVER PARTNER (WARD KIOSK) */}
                <div className="bg-white/80 p-3 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                      🥈 Silver Partner (Ward Kiosk • 1-5 Cabs • 15% Commission)
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      Airport, Station &amp; Short Rentals
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSimulateBooking("silver_airport")}
                      disabled={isSimulating}
                      className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span>✈️ Airport Transfer (Kolkata T2)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulateBooking("silver_station")}
                      disabled={isSimulating}
                      className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span>🚆 Station Transfer (Howrah)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulateBooking("silver_rental_1h")}
                      disabled={isSimulating}
                      className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span>⏱️ Short Rental (1 hr / 10 km)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulateBooking("silver_rental_3h")}
                      disabled={isSimulating}
                      className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span>⏱️ Short Rental (3 hrs / 30 kms)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulateBooking("silver_rental_5h")}
                      disabled={isSimulating}
                      className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span>⏱️ Short Rental (5 hrs / 50 kms)</span>
                    </button>
                  </div>
                </div>

                {/* 2. GOLD PARTNER (DISTRICT EXCLUSIVE) */}
                <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-amber-950 flex items-center gap-1.5 uppercase tracking-wide">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      🥇 Gold Partner (District Exclusive • 1-5 Cabs • 10% Commission)
                    </span>
                    <span className="text-[10px] font-bold text-amber-800">
                      Outstation &amp; Long Rentals Hub
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSimulateBooking("gold_rental_8h")}
                      disabled={isSimulating}
                      className="bg-white hover:bg-amber-100 border border-amber-300 text-amber-950 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span>⏱️ Long Rental (08 hrs / 80 kms)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulateBooking("gold_rental_10h")}
                      disabled={isSimulating}
                      className="bg-white hover:bg-amber-100 border border-amber-300 text-amber-950 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span>⏱️ Long Rental (10 hrs / 100 kms)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulateBooking("gold_rental_12h")}
                      disabled={isSimulating}
                      className="bg-white hover:bg-amber-100 border border-amber-300 text-amber-950 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span>⏱️ Long Rental (12 hrs / 120 kms)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulateBooking("gold_outstation_oneway")}
                      disabled={isSimulating}
                      className="bg-amber-400 hover:bg-amber-500 text-slate-950 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      <span>🚗 Outstation Oneway (Singur &rarr; Burdwan)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulateBooking("gold_outstation_round")}
                      disabled={isSimulating}
                      className="bg-amber-400 hover:bg-amber-500 text-slate-950 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      <span>🔄 Outstation Roundtrip (Kolkata &rarr; Durgapur)</span>
                    </button>
                  </div>
                </div>

                {/* 3. PLATINUM PARTNER (REGIONAL MASTER) */}
                <div className="bg-purple-50/70 p-3 rounded-2xl border border-purple-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-purple-950 flex items-center gap-1.5 uppercase tracking-wide">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                      💎 Platinum Partner (Regional Master • 1-10 Cabs • ★ 0% Commission SLA)
                    </span>
                    <span className="text-[10px] font-bold text-purple-800">
                      Corporate, Tours &amp; Full Fleet
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSimulateBooking("platinum_tour")}
                      disabled={isSimulating}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      <span>🏖️ Tour Package (Digha Beach 3D/2N)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulateBooking("platinum_corporate")}
                      disabled={isSimulating}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      <span>💼 Corporate Ride (MNC Executive • 0% Fee)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bookings Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 mr-1">
                  Plan Tier:
                </span>
                {["ALL", "SILVER", "GOLD", "PLATINUM"].map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setBookingPlanFilter(tier)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      bookingPlanFilter === tier
                        ? "bg-slate-950 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tier}
                  </button>
                ))}

                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 ml-2 mr-1">
                  Source:
                </span>
                {[
                  { id: "ALL", label: "All Sources" },
                  { id: "broomboom_app", label: "📱 App" },
                  { id: "broomboom_web", label: "🌐 Web" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setBookingSourceFilter(s.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      bookingSourceFilter === s.id
                        ? "bg-amber-400 text-slate-950 font-black"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search booking, route, vendor..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Live Dispatch Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white border-b border-slate-800 text-[11px] font-black uppercase tracking-wider">
                      <th className="py-4 px-4">Booking &amp; Source</th>
                      <th className="py-4 px-4">Plan Tier</th>
                      <th className="py-4 px-4">Passenger &amp; Route</th>
                      <th className="py-4 px-4">Total &amp; Net Payout</th>
                      <th className="py-4 px-4">Assigned Franchise Partner</th>
                      <th className="py-4 px-4">Status &amp; Trace</th>
                      <th className="py-4 px-4 text-right">Interactive Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-400">
                          <Car className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="font-bold text-slate-700">No Booking Dispatches Found</p>
                          <p className="text-[11px] mt-1">Use the simulation buttons above to trigger live App or Web bookings.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-amber-50/40 transition-colors">
                          {/* Booking & Source */}
                          <td className="py-4 px-4 space-y-1 align-top">
                            <span className="font-mono font-black text-slate-950 block text-xs">
                              {b.bookingId || b.id}
                            </span>
                            {b.source === "broomboom_web" ? (
                              <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-black px-2 py-0.5 rounded-full">
                                <span>🌐</span> Web Booking
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-black px-2 py-0.5 rounded-full">
                                <span>📱</span> User App
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 block font-medium">
                              {b.dispatchTime || "Recent"}
                            </span>
                          </td>

                          {/* Plan Tier & Package Inclusions */}
                          <td className="py-4 px-4 align-top space-y-1.5">
                            <span
                              className={`inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                                (b.planTier || "").toLowerCase() === "silver"
                                  ? "bg-slate-100 text-slate-800 border-slate-300"
                                  : (b.planTier || "").toLowerCase() === "platinum"
                                  ? "bg-purple-100 text-purple-900 border-purple-300"
                                  : "bg-amber-100 text-amber-900 border-amber-300"
                              }`}
                            >
                              {(b.planTier || "").toLowerCase() === "silver"
                                ? "🥈 Silver (Ward Kiosk)"
                                : (b.planTier || "").toLowerCase() === "platinum"
                                ? "💎 Platinum (Regional Master)"
                                : "🥇 Gold (District Exclusive)"}
                            </span>

                            {/* Exact Package Inclusion Badge */}
                            <div>
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${getBookingTypeBadge(b.bookingType, b.planTier).color}`}>
                                {getBookingTypeBadge(b.bookingType, b.planTier).label}
                              </span>
                            </div>

                            <span className="text-[10px] text-slate-500 font-bold block">
                              {b.vehicleCategory}
                            </span>
                          </td>

                          {/* Passenger & Route */}
                          <td className="py-4 px-4 space-y-1.5 align-top max-w-xs">
                            <div className="font-bold text-slate-900 text-xs">
                              {b.passengerName} <span className="text-slate-400 text-[11px]">({b.passengerPhone})</span>
                            </div>
                            <div className="text-[11px] space-y-0.5">
                              <p className="text-emerald-900 font-bold truncate">
                                <span className="text-emerald-600 font-black">P:</span> {b.pickup}
                              </p>
                              <p className="text-amber-900 font-bold truncate">
                                <span className="text-amber-600 font-black">D:</span> {b.drop}
                              </p>
                            </div>
                            <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-2">
                              <span>Distance: {b.distance}</span>
                              <span>•</span>
                              <span>Est: {b.duration}</span>
                            </div>
                          </td>

                          {/* Total & Net Payout */}
                          <td className="py-4 px-4 align-top space-y-1">
                            <div className="font-black text-slate-900 text-sm">
                              ₹{b.totalFare}
                            </div>
                            <div className="text-[11px] text-emerald-800 font-black">
                              Net: ₹{b.vendorPayout}
                            </div>
                            {(b.planTier || "").toLowerCase() === "platinum" ? (
                              <span className="inline-block bg-purple-100 text-purple-900 border border-purple-300 text-[9px] font-black px-1.5 py-0.5 rounded">
                                ★ 0% Commission SLA
                              </span>
                            ) : (b.planTier || "").toLowerCase() === "gold" ? (
                              <span className="text-[10px] text-amber-800 font-semibold block">
                                10% Commission Slab
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-semibold block">
                                15% Commission Slab
                              </span>
                            )}
                          </td>

                          {/* Assigned Franchise Partner */}
                          <td className="py-4 px-4 align-top space-y-1">
                            {b.assignedVendorId ? (
                              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                                <div className="font-black text-slate-950 flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>{b.assignedVendorName || "Assigned Partner"}</span>
                                </div>
                                <span className="font-mono text-[11px] font-bold text-slate-600 block">
                                  {b.assignedVendorId}
                                </span>
                                {b.rejectedVendorIds && b.rejectedVendorIds.length > 0 && (
                                  <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-black px-1.5 py-0.5 rounded-full inline-block mt-1">
                                    Cascaded to 2nd Nearest
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="bg-rose-50 text-rose-800 p-2 rounded-xl border border-rose-200 text-[10px] font-bold">
                                No vendor allocated (All declined)
                              </div>
                            )}
                          </td>

                          {/* Status & Trace */}
                          <td className="py-4 px-4 align-top space-y-1">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                                b.status === "active"
                                  ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                  : b.status === "completed"
                                  ? "bg-slate-100 text-slate-700 border border-slate-300"
                                  : b.status === "pending_admin_reassign"
                                  ? "bg-rose-100 text-rose-900 border border-rose-300"
                                  : "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse"
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {b.status === "active"
                                ? "In Transit"
                                : b.status === "completed"
                                ? "Completed"
                                : b.status === "pending_admin_reassign"
                                ? "Admin Review"
                                : "Incoming / Ringing"}
                            </span>

                            {b.notes && (
                              <p className="text-[10px] text-slate-500 font-medium leading-tight max-w-[160px] line-clamp-2">
                                {b.notes}
                              </p>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 align-top text-right space-y-1.5">
                            {b.status === "incoming" && b.assignedVendorId && (
                              <button
                                type="button"
                                onClick={() => handleSimulateCascade(b)}
                                disabled={cascadingBookingId === b.id}
                                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-[11px] px-3 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 ml-auto cursor-pointer disabled:opacity-50"
                                title="Simulate 1st nearest vendor declining: order will immediately cascade to 2nd nearest partner of same plan tier!"
                              >
                                {cascadingBookingId === b.id ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Cascading...</span>
                                  </>
                                ) : (
                                  <>
                                    <Shuffle className="w-3.5 h-3.5" />
                                    <span>⚡ Reject &amp; Cascade to 2nd Nearest</span>
                                  </>
                                )}
                              </button>
                            )}

                            {b.status === "active" && (
                              <button
                                type="button"
                                onClick={() => handleAdminCompleteBooking(b.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1 ml-auto cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Force Complete</span>
                              </button>
                            )}

                            {b.status === "completed" && (
                              <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 justify-end">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VENDORS DIRECTORY VIEW */}
        {activeAdminTab === "directory" && (
          <div className="space-y-6">
            {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Total Partners</span>
            <div className="text-2xl font-black text-slate-950 mt-1">{stats.total}</div>
            <span className="text-[10px] text-slate-400 font-semibold">Registered in System</span>
          </div>

          <div className="bg-amber-50/70 p-4 rounded-2xl border-2 border-amber-300 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-900">Needs Setup</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-900 mt-1">{stats.unassigned}</div>
            <span className="text-[10px] text-amber-700 font-semibold">Offline / No Plan Set</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-600">Gold Partners</span>
            <div className="text-2xl font-black text-slate-950 mt-1">{stats.gold}</div>
            <span className="text-[10px] text-slate-400 font-semibold">District Hubs</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-600">Silver Partners</span>
            <div className="text-2xl font-black text-slate-950 mt-1">{stats.silver}</div>
            <span className="text-[10px] text-slate-400 font-semibold">Booking Kiosks</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-600">Platinum</span>
            <div className="text-2xl font-black text-slate-950 mt-1">{stats.platinum}</div>
            <span className="text-[10px] text-slate-400 font-semibold">Regional Masters</span>
          </div>

          <div className="bg-emerald-50/70 p-4 rounded-2xl border-2 border-emerald-300 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900">Approved</span>
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-900 mt-1">{stats.approved}</div>
            <span className="text-[10px] text-emerald-700 font-semibold">Active Licenses</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, mobile, application ID, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            {[
              { id: "ALL", label: "All Partners" },
              { id: "UNASSIGNED", label: "⚠️ Needs Setup" },
              { id: "GOLD", label: "Gold" },
              { id: "SILVER", label: "Silver" },
              { id: "PLATINUM", label: "Platinum" },
              { id: "APPROVED", label: "Approved" },
              { id: "PENDING", label: "Under Process" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                  activeFilter === f.id
                    ? "bg-slate-950 text-amber-400 shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Vendors Directory Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-black tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Application Ref</th>
                  <th className="py-3.5 px-4">Partner Name &amp; Contact</th>
                  <th className="py-3.5 px-4">Territory / Location</th>
                  <th className="py-3.5 px-4">Assigned Plan Tier</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Approval Status</th>
                  <th className="py-3.5 px-4 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-500" />
                      <span>Loading partner directory...</span>
                    </td>
                  </tr>
                ) : filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-bold text-slate-700">No partners found</p>
                      <p className="text-[11px] text-slate-400 mt-1">Try adjusting your search or filters.</p>
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((vendor) => {
                    const isManualPending =
                      vendor.planTier === "unassigned" ||
                      vendor.vendorName === "Valued Partner";

                    return (
                      <tr
                        key={vendor.applicationId + vendor.vendorMobile}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isManualPending ? "bg-amber-50/30" : ""
                        }`}
                      >
                        {/* Application Ref */}
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-slate-950">
                            {vendor.applicationId}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(vendor.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </td>

                        {/* Partner Name & Contact */}
                        <td className="py-3.5 px-4">
                          <div className="font-black text-slate-900 flex items-center gap-1.5">
                            <span>{vendor.vendorName}</span>
                            {vendor.vendorName === "Valued Partner" && (
                              <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                                Default Name
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>+91 {vendor.vendorMobile}</span>
                          </div>
                          {vendor.vendorEmail && (
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Mail className="w-2.5 h-2.5" />
                              <span>{vendor.vendorEmail}</span>
                            </div>
                          )}
                        </td>

                        {/* Location */}
                        <td className="py-3.5 px-4">
                          {vendor.city || vendor.state ? (
                            <div className="flex items-center gap-1 text-slate-700 font-semibold">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>
                                {vendor.city}
                                {vendor.city && vendor.state ? ", " : ""}
                                {vendor.state}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Not set</span>
                          )}
                        </td>

                        {/* Assigned Plan */}
                        <td className="py-3.5 px-4">
                          {vendor.planTier === "gold" ? (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                              <Sparkles className="w-3 h-3 text-amber-600" />
                              <span>Gold Partner (₹10,800)</span>
                            </span>
                          ) : vendor.planTier === "silver" ? (
                            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-900 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-blue-300">
                              <Layers className="w-3 h-3 text-blue-600" />
                              <span>Silver Partner (₹5,400)</span>
                            </span>
                          ) : vendor.planTier === "platinum" ? (
                            <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-900 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-purple-300">
                              <ShieldCheck className="w-3 h-3 text-purple-600" />
                              <span>Platinum Master (₹21,600)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-200 text-amber-950 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-400 animate-pulse">
                              <AlertTriangle className="w-3 h-3 text-amber-700" />
                              <span>⚠️ Needs Admin Setup</span>
                            </span>
                          )}
                        </td>

                        {/* Payment Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full border uppercase ${
                              vendor.paymentStatus === "PAID"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : "bg-slate-100 text-slate-700 border-slate-300"
                            }`}
                          >
                            {vendor.paymentStatus}
                          </span>
                        </td>

                        {/* Approval Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border uppercase ${
                              vendor.status === "approved"
                                ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                : "bg-amber-100 text-amber-900 border-amber-300"
                            }`}
                          >
                            {vendor.status === "approved" ? (
                              <>
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                <span>Approved</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-2.5 h-2.5 text-amber-600" />
                                <span>Under Process</span>
                              </>
                            )}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => openEditModal(vendor)}
                            className="inline-flex items-center gap-1 bg-slate-900 hover:bg-amber-400 hover:text-slate-950 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Edit Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}
  </main>

      {/* ================= EDIT VENDOR MODAL ================= */}
      {editingVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-xl bg-white rounded-3xl border-2 border-amber-300 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-amber-50/80 px-6 py-4 border-b border-amber-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs font-black">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-950 leading-tight">
                    Edit Partner Details
                  </h3>
                  <p className="text-[11px] text-slate-600 font-medium">
                    Application Ref: <span className="font-mono font-bold">{editingVendor.applicationId}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={closeEditModal}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveVendor} className="p-6 overflow-y-auto space-y-4">
              {/* Partner Name */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Partner / Business Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar / Sharma Travels"
                  value={editForm.vendorName}
                  onChange={(e) => setEditForm({ ...editForm, vendorName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Once saved, this exact name will show on their Profile and Thank You page instead of &quot;Valued Partner&quot;.
                </p>
              </div>

              {/* Mobile & Email in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Registered Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile"
                    value={editForm.vendorMobile}
                    onChange={(e) => setEditForm({ ...editForm, vendorMobile: e.target.value.replace(/\D/g, "") })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="partner@example.com"
                    value={editForm.vendorEmail}
                    onChange={(e) => setEditForm({ ...editForm, vendorEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* City & State in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    City / Territory Hub
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kolkata / Howrah"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. West Bengal"
                    value={editForm.state}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Plan Tier Selection */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Assign Plan Tier <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: "silver", label: "Silver Partner", fee: "₹5,400" },
                    { id: "gold", label: "Gold Partner", fee: "₹10,800" },
                    { id: "platinum", label: "Platinum Master", fee: "₹21,600" },
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, planTier: tier.id })}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        editForm.planTier === tier.id
                          ? "bg-amber-50 border-amber-400 ring-2 ring-amber-400/30"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <div className="text-[11px] font-black text-slate-900">{tier.label}</div>
                      <div className="text-[10px] font-bold text-amber-700">{tier.fee}</div>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Assigning a plan updates their Thank You page to show this chosen tier with all corresponding perks.
                </p>
              </div>

              {/* Payment & Approval Status in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={editForm.paymentStatus}
                    onChange={(e) => setEditForm({ ...editForm, paymentStatus: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
                  >
                    <option value="PAID">PAID (Completed Offline/Online)</option>
                    <option value="PENDING">PENDING (Awaiting Payment)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Admin Approval Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
                  >
                    <option value="pending">UNDER PROCESS (Awaiting Review)</option>
                    <option value="approved">APPROVED (Territory Exclusivity Active)</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save &amp; Update Partner</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

