"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
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

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
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

