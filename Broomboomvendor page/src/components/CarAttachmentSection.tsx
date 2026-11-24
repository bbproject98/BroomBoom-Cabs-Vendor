"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Car,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Trash2,
  X,
  MapPin,
  Clock,
  ArrowUpRight,
  Phone,
  User,
  Sparkles,
  FileText,
  BadgeCheck,
  Check,
  Loader2,
  RefreshCw,
} from "lucide-react";

export interface AttachedVehicle {
  id: string;
  vendorId: string;
  planTier: string;
  vehicleModel: string;
  vehicleNumber: string;
  vehicleCategory: string;
  fuelType: string;
  hasCarrier: boolean;
  driverName: string;
  driverPhone: string;
  rcStatus?: string;
  insuranceExpiry?: string;
  fitnessStatus?: string;
  permitType?: string;
  fastagStatus?: string;
  operationalStatus: "on_duty" | "on_trip" | "maintenance" | "pending_inspection";
  totalTrips?: number;
  totalEarnings?: number;
  createdAt?: string;
}

interface CarAttachmentSectionProps {
  planTier?: string;
  pincode?: string;
  vendorId?: string;
  vendorName?: string;
  onUpgradePlan?: () => void;
}

const PLAN_CONFIGS: Record<
  string,
  {
    name: string;
    maxCabs: number;
    badge: string;
    badgeColor: string;
    allowedCategories: string[];
    recommendedModels: string[];
    dutyTypes: string[];
    commissionRate: number;
    commissionNote: string;
    monthlyEarningEstimate: string;
  }
> = {
  silver: {
    name: "Silver Partner (Ward Kiosk)",
    maxCabs: 5,
    badge: "WARD KIOSK (1 TO 5 CABS)",
    badgeColor: "bg-slate-100 text-slate-900 border-slate-300",
    allowedCategories: [
      "Hatchback (WagonR / Swift / Tiago)",
      "Compact Sedan (Swift Dzire / Toyota Etios / Hyundai Aura)",
    ],
    recommendedModels: [
      "Maruti Suzuki Swift Dzire",
      "Toyota Etios Liva",
      "Maruti Wagon R",
      "Hyundai Aura",
    ],
    dutyTypes: [
      "Airport Transfer Rides",
      "Station Transfer Rides",
      "Short Rental (1h 10km, 3h 30km, 5h 50km)",
    ],
    commissionRate: 15,
    commissionNote: "15–20% Platform Fee (85% Vendor Payout)",
    monthlyEarningEstimate: "₹45,000 – ₹65,000 / cab",
  },
  gold: {
    name: "Gold Partner (District Exclusive Hub)",
    maxCabs: 5,
    badge: "DISTRICT EXCLUSIVE (1 TO 5 CABS)",
    badgeColor: "bg-amber-100 text-amber-950 border-amber-400",
    allowedCategories: [
      "Prime Sedan (Dzire / Etios / Amaze / Verna)",
      "Family SUV / MUV (Maruti Ertiga / Kia Carens / Triber)",
    ],
    recommendedModels: [
      "Maruti Suzuki Ertiga",
      "Swift Dzire (Prime Sedan)",
      "Toyota Etios",
      "Kia Carens",
      "Honda Amaze",
    ],
    dutyTypes: [
      "Outstation (Oneway Drop)",
      "Outstation (Round Trip)",
      "Long Rental (08h 80km, 10h 100km, 12h 120km)",
    ],
    commissionRate: 10,
    commissionNote: "10–15% Platform Fee (90% Vendor Payout)",
    monthlyEarningEstimate: "₹65,000 – ₹90,000 / cab",
  },
  platinum: {
    name: "Platinum Partner (Regional Master Hub)",
    maxCabs: 10,
    badge: "REGIONAL MASTER (1 TO 10 CABS)",
    badgeColor: "bg-cyan-100 text-cyan-950 border-cyan-400",
    allowedCategories: [
      "Luxury / Premium SUV (Toyota Innova Crysta / Fortuner)",
      "Executive VIP Sedan (Toyota Camry / Skoda Octavia)",
      "Tour Coach (Force Urbania / 12-17 Seater Tempo)",
    ],
    recommendedModels: [
      "Toyota Innova Crysta",
      "Toyota Fortuner",
      "Toyota Camry",
      "Force Urbania",
      "Mahindra XUV700",
    ],
    dutyTypes: [
      "Tour Packages (Digha, Puri, Darjeeling, Sundarban)",
      "Corporate Executive Rides",
      "Master Fleet Regional Dispatches",
    ],
    commissionRate: 0,
    commissionNote: "★ 0% Commission SLA (Zero Platform Fee, 100% Payout)",
    monthlyEarningEstimate: "₹95,000 – ₹1,50,000+ / cab",
  },
};

export default function CarAttachmentSection({
  planTier = "gold",
  pincode = "712124",
  vendorId = "BB-VENDOR-2026-5058",
  vendorName = "Valued Partner",
  onUpgradePlan,
}: CarAttachmentSectionProps) {
  const currentTier = (planTier || "gold").toLowerCase();
  const planInfo = PLAN_CONFIGS[currentTier] || PLAN_CONFIGS.gold;

  const [vehicles, setVehicles] = useState<AttachedVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"all" | "on_duty" | "on_trip" | "maintenance">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionNotice, setActionNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Form State for Adding New Car
  const [formNumber, setFormNumber] = useState("");
  const [formModel, setFormModel] = useState("");
  const [formCategory, setFormCategory] = useState(planInfo.allowedCategories[0]);
  const [formFuel, setFormFuel] = useState("CNG + Petrol");
  const [formCarrier, setFormCarrier] = useState(true);
  const [formDriverName, setFormDriverName] = useState("");
  const [formDriverPhone, setFormDriverPhone] = useState("");
  const [formPermit, setFormPermit] = useState("All-India Tourist Permit (AITP)");

  // Fetch Attached Vehicles from API
  const fetchVehicles = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `/api/vendor/vehicles?vendorId=${encodeURIComponent(vendorId)}&planTier=${encodeURIComponent(currentTier)}`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.vehicles)) {
        setVehicles(data.vehicles);
      }
    } catch (err) {
      console.error("[FETCH VEHICLES ERROR]", err);
    } finally {
      setIsLoading(false);
    }
  }, [vendorId, currentTier]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Handle Attach Vehicle Submit
  const handleAttachSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNumber.trim() || !formModel.trim() || !formDriverName.trim() || !formDriverPhone.trim()) {
      alert("Please enter Registration Number, Vehicle Model, Driver Name, and Driver Phone.");
      return;
    }

    if (vehicles.length >= planInfo.maxCabs) {
      setActionNotice({
        type: "error",
        message: `Fleet attachment limit of ${planInfo.maxCabs} cabs reached for ${planInfo.name}! Upgrade your franchise plan to attach more vehicles.`,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/vendor/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId,
          planTier: currentTier,
          vehicleModel: formModel,
          vehicleNumber: formNumber,
          vehicleCategory: formCategory,
          fuelType: formFuel,
          hasCarrier: formCarrier,
          driverName: formDriverName,
          driverPhone: formDriverPhone,
          permitType: formPermit,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionNotice({
          type: "success",
          message: data.message || `Car ${formNumber.toUpperCase()} attached to your fleet successfully!`,
        });
        setShowAttachModal(false);
        setFormNumber("");
        setFormModel("");
        setFormDriverName("");
        setFormDriverPhone("");
        fetchVehicles();
      } else {
        setActionNotice({
          type: "error",
          message: data.error || "Failed to attach vehicle. Please check plan limits.",
        });
      }
    } catch (err: any) {
      console.error("[ATTACH VEHICLE SUBMIT ERROR]", err);
      setActionNotice({
        type: "error",
        message: err.message || "Network error while attaching car.",
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setActionNotice(null), 8000);
    }
  };

  // Handle Detach Vehicle
  const handleDetach = async (vId: string, vNumber: string) => {
    if (!confirm(`Are you sure you want to detach vehicle ${vNumber} from your franchise fleet?`)) return;
    try {
      const res = await fetch(
        `/api/vendor/vehicles?id=${encodeURIComponent(vId)}&vendorId=${encodeURIComponent(vendorId)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.success) {
        setActionNotice({
          type: "success",
          message: `Vehicle ${vNumber} detached from fleet.`,
        });
        setVehicles((prev) => prev.filter((v) => v.id !== vId));
        fetchVehicles();
      } else {
        alert(data.error || "Failed to detach vehicle.");
      }
    } catch (err) {
      console.error("[DETACH VEHICLE ERROR]", err);
    }
    setTimeout(() => setActionNotice(null), 6000);
  };

  // Filter vehicles
  const filteredVehicles = vehicles.filter((v) => {
    if (filterTab === "on_duty" && v.operationalStatus !== "on_duty") return false;
    if (filterTab === "on_trip" && v.operationalStatus !== "on_trip") return false;
    if (filterTab === "maintenance" && v.operationalStatus !== "maintenance") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = v.vehicleNumber.toLowerCase().includes(q);
      const matchModel = v.vehicleModel.toLowerCase().includes(q);
      const matchDriver = v.driverName.toLowerCase().includes(q);
      return matchNumber || matchModel || matchDriver;
    }
    return true;
  });

  const slotsRemaining = Math.max(0, planInfo.maxCabs - vehicles.length);
  const slotPercent = Math.min(100, Math.round((vehicles.length / planInfo.maxCabs) * 100));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Alert Notice */}
      {actionNotice && (
        <div
          className={`border-2 rounded-3xl p-5 shadow-md flex items-start gap-3 animate-in slide-in-from-top-2 ${
            actionNotice.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-950"
              : "bg-rose-50 border-rose-300 text-rose-950"
          }`}
        >
          {actionNotice.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs">
            <h4 className="font-black text-sm">
              {actionNotice.type === "success" ? "Fleet Action Completed" : "Attachment Restriction"}
            </h4>
            <p className="mt-0.5 leading-relaxed">{actionNotice.message}</p>
          </div>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 max-w-2xl relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border shadow-xs ${planInfo.badgeColor}`}
            >
              ★ {planInfo.badge}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              PIN {pincode} Dispatch Enabled
            </span>
            <span className="bg-white/10 text-white px-3 py-1 rounded-full text-[10px] font-bold border border-white/20">
              {planInfo.commissionNote}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <Car className="w-7 h-7 text-amber-400" />
            Car Attachment &amp; Franchise Fleet
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Attach commercial vehicles to your <strong>{planInfo.name}</strong> license. All attached cabs automatically receive live passenger bookings dispatched across your registered territory (PIN: {pincode}).
          </p>

          {/* Quota Progress Bar */}
          <div className="pt-2 max-w-md space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>
                Attached Fleet Capacity: <strong className="text-amber-400">{vehicles.length}</strong> / {planInfo.maxCabs} Cabs
              </span>
              <span className="text-[11px] text-slate-400 font-mono">{slotsRemaining} slots remaining</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  slotPercent >= 100
                    ? "bg-rose-500"
                    : slotPercent >= 60
                    ? "bg-amber-400"
                    : "bg-emerald-400"
                }`}
                style={{ width: `${slotPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Button Strip */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 relative z-10">
          <button
            type="button"
            onClick={() => {
              if (vehicles.length >= planInfo.maxCabs) {
                setActionNotice({
                  type: "error",
                  message: `All ${planInfo.maxCabs} fleet slots are utilized! Upgrade to Platinum to attach up to 10 cabs with 0% platform commission.`,
                });
                return;
              }
              setShowAttachModal(true);
            }}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Attach New Cab ({slotsRemaining} Left)</span>
          </button>

          {currentTier !== "platinum" && onUpgradePlan && (
            <button
              type="button"
              onClick={onUpgradePlan}
              className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs px-4 py-2.5 rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
              <span>Upgrade to 10 Cabs (Platinum 0% Comm)</span>
            </button>
          )}

          <button
            type="button"
            onClick={fetchVehicles}
            className="text-slate-400 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer pt-1"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
            <span>Sync Fleet Status</span>
          </button>
        </div>
      </div>

      {/* Plan Vehicle Categories & Benefits Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
          <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-amber-600" />
            Eligible Vehicles for {currentTier.toUpperCase()}
          </span>
          <h4 className="text-sm font-black text-slate-900">Allowed Categories</h4>
          <ul className="text-xs text-slate-600 space-y-1">
            {planInfo.allowedCategories.map((cat, idx) => (
              <li key={idx} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>{cat}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
          <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1">
            <BadgeCheck className="w-3 h-3 text-emerald-600" />
            Live Dispatch Booking Types
          </span>
          <h4 className="text-sm font-black text-slate-900">Assigned Trip Duties</h4>
          <ul className="text-xs text-slate-600 space-y-1">
            {planInfo.dutyTypes.map((duty, idx) => (
              <li key={idx} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{duty}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase text-indigo-800 tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            Commercial Fleet Compliance
          </span>
          <h4 className="text-sm font-black text-slate-900">Mandatory Standards</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Attached cabs must hold commercial yellow registration plates, active commercial insurance, fitness certificate, and roof luggage carrier for outstation and airport duties.
          </p>
          <p className="text-[11px] font-black text-indigo-900 pt-1">
            Est. Monthly Payout: {planInfo.monthlyEarningEstimate}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterTab("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              filterTab === "all"
                ? "bg-slate-950 text-amber-400"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Cabs ({vehicles.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("on_duty")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              filterTab === "on_duty"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            On Duty ({vehicles.filter((v) => v.operationalStatus === "on_duty").length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("on_trip")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              filterTab === "on_trip"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            On Trip ({vehicles.filter((v) => v.operationalStatus === "on_trip").length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Plate or Model..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-400"
          />
        </div>
      </div>

      {/* Grid of Attached Cabs */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Loading attached fleet as per your franchise plan...</p>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto border-2 border-amber-300">
            <Car className="w-8 h-8 text-amber-600" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-black text-slate-900">No Cabs Attached Yet</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your {planInfo.name} allows up to {planInfo.maxCabs} commercial vehicles. Attach your first cab now to start receiving live bookings dispatched in PIN {pincode}.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAttachModal(true)}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Attach Your First Cab</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVehicles.map((veh) => {
            const isOnDuty = veh.operationalStatus === "on_duty";
            const isOnTrip = veh.operationalStatus === "on_trip";

            return (
              <div
                key={veh.id}
                className="bg-white rounded-3xl p-5 border-2 border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                {/* Top strip: Commercial Plate & Status */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    {/* Authentic Yellow Taxi Plate */}
                    <div className="bg-yellow-400 text-slate-950 font-mono font-black text-xs px-3 py-1 rounded-md border border-yellow-500 tracking-wider shadow-xs flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-800 font-sans font-bold">IND</span>
                      <span>{veh.vehicleNumber}</span>
                    </div>

                    {/* Operational Status */}
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                        isOnTrip
                          ? "bg-blue-100 text-blue-900 border border-blue-300"
                          : isOnDuty
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                          : "bg-slate-100 text-slate-700 border border-slate-300"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isOnTrip ? "bg-blue-600 animate-ping" : isOnDuty ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                      {isOnTrip ? "On Active Trip" : isOnDuty ? "On Duty (Ready)" : "Standby"}
                    </span>
                  </div>

                  {/* Vehicle Model & Category */}
                  <div>
                    <h3 className="text-base font-black text-slate-950 flex items-center gap-1.5">
                      <Car className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{veh.vehicleModel}</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{veh.vehicleCategory}</p>
                  </div>

                  {/* Fuel & Luggage carrier badges */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-bold">
                      ⛽ {veh.fuelType}
                    </span>
                    {veh.hasCarrier && (
                      <span className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200 font-bold">
                        🧳 Luggage Carrier
                      </span>
                    )}
                    <span className="bg-emerald-50 text-emerald-900 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                      🏷️ Fastag Active
                    </span>
                  </div>

                  {/* Primary Driver */}
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Primary Fleet Driver</span>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-slate-900 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        {veh.driverName}
                      </span>
                      <a
                        href={`tel:${veh.driverPhone}`}
                        className="text-amber-700 hover:text-amber-800 font-bold flex items-center gap-0.5"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{veh.driverPhone}</span>
                      </a>
                    </div>
                  </div>

                  {/* Compliance Matrix */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="bg-slate-50/60 p-2 rounded-xl border border-slate-100 space-y-0.5">
                      <span className="text-[10px] text-slate-400 block font-bold">Commercial RC</span>
                      <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" /> Verified
                      </span>
                    </div>

                    <div className="bg-slate-50/60 p-2 rounded-xl border border-slate-100 space-y-0.5">
                      <span className="text-[10px] text-slate-400 block font-bold">Permit Status</span>
                      <span className="font-extrabold text-slate-800 truncate block" title={veh.permitType}>
                        {veh.permitType?.includes("AITP") ? "AITP Commercial" : "State Permit"}
                      </span>
                    </div>

                    <div className="bg-slate-50/60 p-2 rounded-xl border border-slate-100 space-y-0.5">
                      <span className="text-[10px] text-slate-400 block font-bold">Lifetime Trips</span>
                      <span className="font-black text-slate-900 font-mono">{veh.totalTrips || 0} Trips</span>
                    </div>

                    <div className="bg-slate-50/60 p-2 rounded-xl border border-slate-100 space-y-0.5">
                      <span className="text-[10px] text-slate-400 block font-bold">Net Settled</span>
                      <span className="font-black text-emerald-700 font-mono">
                        ₹{(veh.totalEarnings || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Slot #{filteredVehicles.indexOf(veh) + 1} of {planInfo.maxCabs}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDetach(veh.id, veh.vehicleNumber)}
                    className="text-slate-400 hover:text-rose-600 text-xs font-semibold p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer flex items-center gap-1"
                    title="Detach vehicle from fleet"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Detach</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Attach New Vehicle Modal */}
      {showAttachModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                  {planInfo.name}
                </span>
                <h3 className="text-lg font-black text-slate-950 mt-1 flex items-center gap-2">
                  <Car className="w-5 h-5 text-amber-500" />
                  Attach New Commercial Cab
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAttachModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAttachSubmit} className="space-y-4 text-xs">
              {/* Registration Number */}
              <div className="space-y-1">
                <label className="font-black text-slate-800 uppercase text-[11px] block">
                  Vehicle Registration Number (Yellow Taxi Plate) *
                </label>
                <input
                  type="text"
                  required
                  value={formNumber}
                  onChange={(e) => setFormNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. WB-02-AK-4921 or DL-01-AB-1234"
                  className="w-full px-3.5 py-2.5 bg-yellow-50/60 border border-yellow-300 font-mono font-black text-sm text-slate-900 rounded-xl focus:outline-hidden focus:border-amber-500 uppercase"
                />
              </div>

              {/* Make & Model */}
              <div className="space-y-1">
                <label className="font-black text-slate-800 uppercase text-[11px] block">
                  Vehicle Make &amp; Model *
                </label>
                <input
                  type="text"
                  required
                  value={formModel}
                  onChange={(e) => setFormModel(e.target.value)}
                  placeholder="e.g. Maruti Suzuki Ertiga / Swift Dzire / Innova Crysta"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 font-semibold text-slate-900 rounded-xl focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Category dropdown (as per plan tier) */}
              <div className="space-y-1">
                <label className="font-black text-slate-800 uppercase text-[11px] block">
                  Plan Category Classification *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 font-bold text-slate-900 rounded-xl focus:outline-hidden focus:border-amber-500"
                >
                  {planInfo.allowedCategories.map((cat, idx) => (
                    <option key={idx} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 block">
                  Only categories approved for your {planInfo.name} are eligible for live bookings.
                </span>
              </div>

              {/* Fuel Type & Luggage Carrier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-black text-slate-800 uppercase text-[11px] block">Fuel Type</label>
                  <select
                    value={formFuel}
                    onChange={(e) => setFormFuel(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 font-semibold text-slate-900 rounded-xl focus:outline-hidden"
                  >
                    <option value="CNG + Petrol">CNG + Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Electric (EV)">Electric (EV)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-black text-slate-800 uppercase text-[11px] block">Commercial Permit</label>
                  <select
                    value={formPermit}
                    onChange={(e) => setFormPermit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 font-semibold text-slate-900 rounded-xl focus:outline-hidden"
                  >
                    <option value="All-India Tourist Permit (AITP)">All-India Permit (AITP)</option>
                    <option value="State Commercial Permit">State Commercial Permit</option>
                    <option value="Local Ward Taxi Permit">Local Ward Permit</option>
                  </select>
                </div>
              </div>

              {/* Luggage carrier checkbox */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50/60 border border-amber-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formCarrier}
                  onChange={(e) => setFormCarrier(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <div className="text-[11px]">
                  <strong className="text-slate-900 font-black block">Luggage Roof Carrier Installed</strong>
                  <span className="text-slate-600">
                    Mandatory for outstation one-way drops &amp; airport transfer dispatches.
                  </span>
                </div>
              </label>

              {/* Primary Driver */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="font-black text-slate-800 uppercase text-[11px] block">
                    Assigned Driver Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formDriverName}
                    onChange={(e) => setFormDriverName(e.target.value)}
                    placeholder="e.g. Raju Karmakar"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 font-semibold text-slate-900 rounded-xl focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-black text-slate-800 uppercase text-[11px] block">
                    Driver Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formDriverPhone}
                    onChange={(e) => setFormDriverPhone(e.target.value)}
                    placeholder="+91 91234 56780"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 font-semibold text-slate-900 rounded-xl focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAttachModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying &amp; Attaching...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Confirm Cab Attachment</span>
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
