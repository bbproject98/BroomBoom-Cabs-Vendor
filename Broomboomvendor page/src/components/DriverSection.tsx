"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  UserCheck,
  UserPlus,
  Phone,
  ShieldCheck,
  Award,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Search,
  FileText,
  Clock,
  Car,
  Star,
  DollarSign,
  TrendingUp,
  X,
  Plus,
} from "lucide-react";

export interface DriverData {
  id: string;
  vendorId: string;
  name: string;
  phone: string;
  dlNumber: string;
  dlExpiry: string;
  experienceYears: number;
  assignedVehicle: string;
  dutyStatus: string;
  policeVerification: string;
  rating: number;
  totalRides: number;
  earnings: number;
  createdAt: string;
}

interface DriverSectionProps {
  planTier: string;
  pincode: string;
  vendorId: string;
  vendorName: string;
}

export default function DriverSection({
  planTier,
  pincode,
  vendorId,
  vendorName,
}: DriverSectionProps) {
  const [drivers, setDrivers] = useState<DriverData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "on_duty" | "available">("all");

  // Add Driver Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dlNumber, setDlNumber] = useState("");
  const [dlExpiry, setDlExpiry] = useState("2032-12-31");
  const [experienceYears, setExperienceYears] = useState(3);
  const [assignedVehicle, setAssignedVehicle] = useState("");

  // Available vehicles for assigning
  const [attachedVehicles, setAttachedVehicles] = useState<any[]>([]);

  // Fetch Drivers
  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/vendor/drivers?vendorId=${encodeURIComponent(vendorId)}`);
      const data = await res.json();
      if (data.success) {
        setDrivers(data.drivers || []);
      } else {
        setError(data.error || "Failed to load drivers");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to fetch drivers");
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  // Fetch attached vehicles to allow vehicle assignment
  const fetchVehicles = useCallback(async () => {
    try {
      const res = await fetch(`/api/vendor/vehicles?vendorId=${encodeURIComponent(vendorId)}&planTier=${encodeURIComponent(planTier)}`);
      const data = await res.json();
      if (data.success && data.vehicles) {
        setAttachedVehicles(data.vehicles);
      }
    } catch (e) {
      // ignore
    }
  }, [vendorId, planTier]);

  useEffect(() => {
    fetchDrivers();
    fetchVehicles();
  }, [fetchDrivers, fetchVehicles]);

  // Handle Add Driver Submit
  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !dlNumber.trim()) {
      setFormError("Please fill out Driver Name, Mobile, and Driving License Number.");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const res = await fetch("/api/vendor/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId,
          name: name.trim(),
          phone: phone.trim(),
          dlNumber: dlNumber.trim().toUpperCase(),
          dlExpiry,
          experienceYears,
          assignedVehicle: assignedVehicle.trim() || "Unassigned",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFormSuccess("Driver registered & verified successfully!");
        setName("");
        setPhone("");
        setDlNumber("");
        setAssignedVehicle("");
        fetchDrivers();
        setTimeout(() => {
          setShowAddModal(false);
          setFormSuccess(null);
        }, 1200);
      } else {
        setFormError(data.error || "Failed to add driver");
      }
    } catch (err: any) {
      setFormError(err?.message || "Error submitting driver details");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Remove Driver
  const handleRemoveDriver = async (id: string, dName: string) => {
    if (!confirm(`Are you sure you want to remove ${dName} from your driver fleet?`)) return;
    try {
      const res = await fetch(`/api/vendor/drivers?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchDrivers();
      } else {
        alert(data.error || "Failed to remove driver");
      }
    } catch (err: any) {
      alert(err?.message || "Failed to remove driver");
    }
  };

  // Filtered drivers
  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.phone.includes(searchQuery) ||
      d.dlNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.assignedVehicle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ? true : d.dutyStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-400/10 text-amber-300 border border-amber-400/30 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              <UserCheck className="w-3.5 h-3.5" />
              Vendor Fleet Chauffeurs
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Driver Management &amp; Rostering
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Add and manage certified commercial drivers for your attached cabs. All drivers are verified with Aadhaar, Commercial DL, and background check standards for BroomBoom duty assignments.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setFormSuccess(null);
              setShowAddModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm px-6 py-3.5 rounded-2xl shadow-lg transition-all cursor-pointer self-start md:self-auto shrink-0"
          >
            <UserPlus className="w-5 h-5 stroke-[2.5]" />
            <span>Add New Driver</span>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold block">Total Drivers</span>
            <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
              {drivers.length}
            </span>
          </div>
          <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold block">On Duty</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 block">
              {drivers.filter((d) => d.dutyStatus === "on_duty").length}
            </span>
          </div>
          <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold block">Available</span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 mt-1 block">
              {drivers.filter((d) => d.dutyStatus !== "on_duty").length}
            </span>
          </div>
          <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold block">Avg. Rating</span>
            <span className="text-xl sm:text-2xl font-black text-yellow-300 mt-1 flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {drivers.length > 0
                ? (
                    drivers.reduce((acc, d) => acc + d.rating, 0) / drivers.length
                  ).toFixed(1)
                : "5.0"}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search driver by name, phone, DL, or assigned cab..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({drivers.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("on_duty")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === "on_duty"
                ? "bg-emerald-500 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            On Duty ({drivers.filter((d) => d.dutyStatus === "on_duty").length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("available")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === "available"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Available ({drivers.filter((d) => d.dutyStatus === "available").length})
          </button>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Loading your verified fleet drivers...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-3xl p-6 text-xs font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Drivers Cards Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDrivers.map((driver) => (
            <div
              key={driver.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 hover:border-amber-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              {/* Card Header: Avatar & Duty Status */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-950 font-black text-lg flex items-center justify-center shadow-xs">
                      {driver.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 leading-tight">
                        {driver.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="font-semibold">{driver.phone}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                      driver.dutyStatus === "on_duty"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {driver.dutyStatus === "on_duty" ? "● ON DUTY" : "AVAILABLE"}
                  </span>
                </div>

                {/* Rating & Commercial DL Details */}
                <div className="mt-4 bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Driving License</span>
                    <span className="font-mono font-bold text-slate-900">{driver.dlNumber}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">DL Expiry</span>
                    <span className="font-semibold text-slate-700">{driver.dlExpiry}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Experience</span>
                    <span className="font-bold text-slate-900">{driver.experienceYears} Years</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500 font-medium">Assigned Vehicle</span>
                    <span className="font-bold text-amber-700 max-w-[160px] truncate text-right">
                      {driver.assignedVehicle || "Unassigned"}
                    </span>
                  </div>
                </div>

                {/* Badges: Police verification & Star Rating */}
                <div className="flex items-center justify-between gap-2 mt-3 text-[11px]">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Police Verified
                  </span>
                  <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    {driver.rating} ({driver.totalRides} Trips)
                  </span>
                </div>
              </div>

              {/* Card Footer: Total Earnings & Delete Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                    Trip Earnings
                  </span>
                  <span className="text-sm font-black text-slate-900">
                    ₹{driver.earnings.toLocaleString("en-IN")}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveDriver(driver.id, driver.name)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                  title="Remove Driver"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Empty state when no drivers found */}
          {filteredDrivers.length === 0 && (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
              <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                <UserPlus className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">No Drivers Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No drivers matched your search criteria or none are added yet. Click &quot;Add New Driver&quot; to register your fleet chauffeurs.
              </p>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 bg-slate-950 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Driver Now</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD DRIVER */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-amber-200 space-y-6 animate-in fade-in zoom-in-95 duration-200 my-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-300 mb-1">
                  <UserPlus className="w-3 h-3 text-amber-600" />
                  Roster Enrollment
                </div>
                <h3 className="text-xl font-black text-slate-950 tracking-tight">
                  Add Commercial Driver
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Register a driver with commercial driving credentials to drive under your franchise.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error / Success Notices */}
            {formError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-3.5 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-3.5 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAddDriver} className="space-y-4">
              {/* Driver Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Driver Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Subir Karmakar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50"
                />
              </div>

              {/* Mobile Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Primary Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98300 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50"
                />
              </div>

              {/* Commercial DL Number & Expiry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Commercial DL No. *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="WB-0220200012345"
                    value={dlNumber}
                    onChange={(e) => setDlNumber(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-mono font-bold text-slate-900 uppercase focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    DL Valid Till
                  </label>
                  <input
                    type="date"
                    value={dlExpiry}
                    onChange={(e) => setDlExpiry(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50"
                  />
                </div>
              </div>

              {/* Experience Years & Assigned Vehicle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Driving Exp. (Years)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={35}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Assign Attached Vehicle
                  </label>
                  <select
                    value={assignedVehicle}
                    onChange={(e) => setAssignedVehicle(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50"
                  >
                    <option value="">Unassigned (Reserve Driver)</option>
                    {attachedVehicles.map((v) => (
                      <option
                        key={v.id}
                        value={`${v.vehicleNumber} (${v.vehicleModel.split(" ")[0]} ${v.vehicleModel.split(" ")[1] || ""})`}
                      >
                        {v.vehicleNumber} - {v.vehicleModel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mandatory Checklist notice */}
              <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 text-[11px] text-amber-950 space-y-1">
                <span className="font-bold flex items-center gap-1 text-amber-800">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  BroomBoom Onboarding Compliance:
                </span>
                <p className="text-slate-600 leading-normal">
                  By adding this driver, you confirm that their Aadhaar card, valid Commercial Badge Driving License, and Police Verification are collected and kept on vendor file.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-900 text-amber-400 font-black text-xs px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Saving Driver...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 stroke-[2.5]" />
                      <span>Register Driver</span>
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
