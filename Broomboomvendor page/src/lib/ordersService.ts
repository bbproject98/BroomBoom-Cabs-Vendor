import prisma from "@/lib/prisma";
import { recordBookingDebitOnAccept } from "@/lib/walletService";

export interface BookingData {
  id?: string;
  bookingId?: string;
  passengerName: string;
  passengerPhone: string;
  passengerRating?: number;
  pickup: string;
  pickupZone?: string;
  pickupPincode?: string;
  drop: string;
  dropZone?: string;
  dropPincode?: string;
  distance?: string;
  duration?: string;
  vehicleCategory?: string;
  planTier?: "silver" | "gold" | "platinum" | string;
  bookingType?: string;
  bookingTypeLabel?: string;
  inclusionsMatched?: string;
  totalFare: number;
  vendorPayout?: number;
  commissionRate?: number;
  paymentMethod?: string;
  source?: "broomboom app" | "broomboomweb_page" | "user_app" | "user_app_admin" | "admin_dispatch" | string;
  status?: "incoming" | "active" | "completed" | "rejected" | "cancelled" | "pending_admin_reassign";
  assignedVendorId?: string | null;
  assignedVendorName?: string | null;
  assignedVendorMobile?: string | null;
  assignedVendorPincode?: string | null;
  rejectedVendorIds?: string[];
  assignedDriverName?: string | null;
  assignedDriverPhone?: string | null;
  assignedDriverVehicle?: string | null;
  driverLiveStatus?: string | null;
  startOtp?: string | null;
  adminApproved?: boolean;
  dispatchTime?: string | null;
  notes?: string | null;
  createdAt?: string;
}

/**
 * Normalizes text for matching zones and cities
 */
export function cleanString(str?: string | null): string {
  return (str || "").trim().toLowerCase();
}

/**
 * Extracts 6-digit Indian Pincode from text address
 */
export function extractPincode(text?: string | null): string {
  if (!text) return "";
  const match = text.match(/\b[1-9][0-9]{5}\b/);
  return match ? match[0] : "";
}

/**
 * Cleans and validates a 6-digit Pincode string
 */
export function cleanPincode(pin?: string | null): string {
  if (!pin) return "";
  const match = pin.match(/\b[1-9][0-9]{5}\b/);
  return match ? match[0] : pin.replace(/\D/g, "").slice(0, 6);
}

/**
 * Detects plan tier from booking details if not explicitly provided:
 * - Airport, Station, or Kiosk pickups/drops -> "silver" (Ward Kiosk)
 * - Outstation, rentals, or inter-district -> "gold" (District Exclusive Hub)
 * - Luxury, executive, master regional -> "platinum" (Regional Master Hub)
 */

export interface PlanBookingClassification {
  planTier: "silver" | "gold" | "platinum";
  bookingType: string;
  bookingTypeLabel: string;
  commissionRate: number; // Silver: 15-20% (15%), Gold: 10-15% (10%), Platinum: 0%
  tierScopeLabel: string;
  inclusionsMatched: string;
}

/**
 * Classifies booking strictly according to BroomBoom's 3 Franchise Partner packages:
 * 1. SILVER PARTNER (WARD KIOSK) - 1 to 5 Cabs:
 *    - Airport transfer rides
 *    - Station Transfer Rides
 *    - Rental (1 hours 10 kms, 3 hours 30 kms, 5 hours 50 kms)
 *    - 15-20% commission (15% platform fee, 85% vendor payout)
 *
 * 2. GOLD PARTNER (DISTRICT EXCLUSIVE) - 1 to 5 Cabs:
 *    - Rental (08 hours 80 kms, 10 hours 100 kms, 12 hours 120 kms)
 *    - Outstation (Oneway, roundtrip)
 *    - 10-15% commission (10% platform fee, 90% vendor payout)
 *
 * 3. PLATINUM PARTNER (REGIONAL MASTER) - 1 to 10 Cabs:
 *    - Tour Packages
 *    - Corporate Rides
 *    - Airport/Station Transfer
 *    - Rental (08 hours 80 kms, 10 hours 100 kms, 12 hours 120 kms)
 *    - Outstation (Oneway, roundtrip)
 *    - ★ 0% Commission SLA (Zero Platform Fee, 100% vendor payout)
 */
export function classifyBookingByPlan(data: {
  pickup: string;
  drop: string;
  vehicleCategory?: string;
  distance?: string;
  duration?: string;
  bookingType?: string;
  planTier?: string;
}): PlanBookingClassification {
  const p = cleanString(data.pickup);
  const d = cleanString(data.drop);
  const v = cleanString(data.vehicleCategory);
  const explicitType = cleanString(data.bookingType);
  const explicitTier = cleanString(data.planTier);

  // 1. TOUR PACKAGES & CORPORATE RIDES -> PLATINUM REGIONAL MASTER (0% Commission)
  if (
    explicitType === "tour_package" ||
    explicitType.includes("tour") ||
    explicitType === "corporate_ride" ||
    explicitType.includes("corporate") ||
    p.includes("tour") || d.includes("tour") ||
    p.includes("corporate") || d.includes("corporate") ||
    p.includes("digha") || d.includes("digha") ||
    p.includes("puri") || d.includes("puri") ||
    p.includes("darjeeling") || d.includes("darjeeling") ||
    p.includes("sundarban") || d.includes("sundarban") ||
    v.includes("vip") || v.includes("luxury")
  ) {
    const isTour = explicitType.includes("tour") || p.includes("tour") || d.includes("tour") || p.includes("digha") || d.includes("digha") || p.includes("puri") || d.includes("puri") || p.includes("darjeeling") || d.includes("darjeeling");
    return {
      planTier: "platinum",
      bookingType: isTour ? "tour_package" : "corporate_ride",
      bookingTypeLabel: isTour ? "🏖️ Tour Package (Regional Master)" : "💼 Corporate Ride (Regional Master)",
      commissionRate: 0,
      tierScopeLabel: "Regional Master Hub (0% Commission SLA)",
      inclusionsMatched: isTour ? "Tour Packages (0% Platform Fee)" : "Corporate Rides & Luxury Master Fleet (0% Platform Fee)",
    };
  }

  // 2. SHORT RENTALS (1h 10km, 3h 30km, 5h 50km) -> SILVER PARTNER (WARD KIOSK)
  if (
    explicitType === "rental_1hr_10km" ||
    explicitType === "rental_3hr_30km" ||
    explicitType === "rental_5hr_50km" ||
    explicitType === "short_rental" ||
    p.includes("1 hour") || p.includes("10 km") || p.includes("1 hr") ||
    p.includes("3 hour") || p.includes("30 km") || p.includes("3 hr") ||
    p.includes("5 hour") || p.includes("50 km") || p.includes("5 hr")
  ) {
    let subType = "rental_3hr_30km";
    let subLabel = "⏱️ Rental (3 Hours / 30 Kms)";
    if (explicitType.includes("1hr") || p.includes("1 hour") || p.includes("10 km") || p.includes("1 hr")) {
      subType = "rental_1hr_10km";
      subLabel = "⏱️ Rental (1 Hour / 10 Kms)";
    } else if (explicitType.includes("5hr") || p.includes("5 hour") || p.includes("50 km") || p.includes("5 hr")) {
      subType = "rental_5hr_50km";
      subLabel = "⏱️ Rental (5 Hours / 50 Kms)";
    }
    return {
      planTier: "silver",
      bookingType: subType,
      bookingTypeLabel: subLabel,
      commissionRate: 15,
      tierScopeLabel: "Ward Level Kiosk (15-20% Commission)",
      inclusionsMatched: `Rental (${subLabel})`,
    };
  }

  // 3. LONG RENTALS (08h 80km, 10h 100km, 12h 120km) -> GOLD PARTNER (DISTRICT EXCLUSIVE)
  if (
    explicitType === "rental_8hr_80km" ||
    explicitType === "rental_10hr_100km" ||
    explicitType === "rental_12hr_120km" ||
    explicitType === "long_rental" ||
    p.includes("8 hour") || p.includes("80 km") || p.includes("8 hr") ||
    p.includes("10 hour") || p.includes("100 km") || p.includes("10 hr") ||
    p.includes("12 hour") || p.includes("120 km") || p.includes("12 hr")
  ) {
    let subType = "rental_8hr_80km";
    let subLabel = "⏱️ Rental (08 Hours / 80 Kms)";
    if (explicitType.includes("10hr") || p.includes("10 hour") || p.includes("100 km") || p.includes("10 hr")) {
      subType = "rental_10hr_100km";
      subLabel = "⏱️ Rental (10 Hours / 100 Kms)";
    } else if (explicitType.includes("12hr") || p.includes("12 hour") || p.includes("120 km") || p.includes("12 hr")) {
      subType = "rental_12hr_120km";
      subLabel = "⏱️ Rental (12 Hours / 120 Kms)";
    }
    const isPlat = explicitTier === "platinum";
    return {
      planTier: isPlat ? "platinum" : "gold",
      bookingType: subType,
      bookingTypeLabel: subLabel,
      commissionRate: isPlat ? 0 : 10,
      tierScopeLabel: isPlat ? "Regional Master Hub (0% Commission SLA)" : "District Exclusive Hub (10-15% Commission)",
      inclusionsMatched: `Rental (${subLabel})`,
    };
  }

  // 4. OUTSTATION (ONEWAY & ROUNDTRIP) -> GOLD PARTNER (DISTRICT EXCLUSIVE)
  if (
    explicitType === "outstation_oneway" ||
    explicitType === "outstation_roundtrip" ||
    explicitType === "outstation" ||
    p.includes("outstation") || d.includes("outstation") ||
    p.includes("roundtrip") || d.includes("roundtrip") ||
    p.includes("oneway") || d.includes("oneway") ||
    p.includes("burdwan") || d.includes("burdwan") ||
    p.includes("durgapur") || d.includes("durgapur") ||
    p.includes("asansol") || d.includes("asansol") ||
    p.includes("kharagpur") || d.includes("kharagpur")
  ) {
    const isRound = explicitType.includes("round") || p.includes("roundtrip") || d.includes("roundtrip");
    const subType = isRound ? "outstation_roundtrip" : "outstation_oneway";
    const subLabel = isRound ? "🔄 Outstation (Roundtrip)" : "🚗 Outstation (Oneway)";
    const isPlat = explicitTier === "platinum";
    return {
      planTier: isPlat ? "platinum" : "gold",
      bookingType: subType,
      bookingTypeLabel: subLabel,
      commissionRate: isPlat ? 0 : 10,
      tierScopeLabel: isPlat ? "Regional Master Hub (0% Commission SLA)" : "District Exclusive Hub (10-15% Commission)",
      inclusionsMatched: `Outstation (${subLabel})`,
    };
  }

  // 5. AIRPORT & STATION TRANSFERS -> SILVER PARTNER (WARD KIOSK)
  if (
    explicitType === "airport_transfer" ||
    p.includes("airport") || d.includes("airport") ||
    p.includes("terminal") || d.includes("terminal")
  ) {
    return {
      planTier: "silver",
      bookingType: "airport_transfer",
      bookingTypeLabel: "✈️ Airport Transfer Ride",
      commissionRate: 15,
      tierScopeLabel: "Ward Level Kiosk (Airport & Station Hub)",
      inclusionsMatched: "Airport transfer rides (1-5 Cabs, 15-20% commission)",
    };
  }

  if (
    explicitType === "station_transfer" ||
    p.includes("station") || d.includes("station") ||
    p.includes("howrah") || d.includes("howrah") ||
    p.includes("sealdah") || d.includes("sealdah") ||
    p.includes("kiosk") || d.includes("kiosk") ||
    p.includes("railway") || d.includes("railway")
  ) {
    return {
      planTier: "silver",
      bookingType: "station_transfer",
      bookingTypeLabel: "🚆 Station Transfer Ride",
      commissionRate: 15,
      tierScopeLabel: "Ward Level Kiosk (Airport & Station Hub)",
      inclusionsMatched: "Station Transfer Rides (1-5 Cabs, 15-20% commission)",
    };
  }

  // 6. DEFAULT HEURISTICS (based on explicit tier or distance)
  if (explicitTier === "silver") {
    return {
      planTier: "silver",
      bookingType: "rental_3hr_30km",
      bookingTypeLabel: "⏱️ Rental (3 Hours / 30 Kms)",
      commissionRate: 15,
      tierScopeLabel: "Ward Level Kiosk (15-20% Commission)",
      inclusionsMatched: "Rental (1 hours 10 kms, 3 hours 30 kms, 5 hours 50 kms)",
    };
  }
  if (explicitTier === "gold") {
    return {
      planTier: "gold",
      bookingType: "outstation_oneway",
      bookingTypeLabel: "🚗 Outstation (Oneway)",
      commissionRate: 10,
      tierScopeLabel: "District Exclusive Hub (10-15% Commission)",
      inclusionsMatched: "Outstation (Oneway, roundtrip)",
    };
  }
  if (explicitTier === "platinum") {
    return {
      planTier: "platinum",
      bookingType: "corporate_ride",
      bookingTypeLabel: "💼 Corporate Ride (Regional Master)",
      commissionRate: 0,
      tierScopeLabel: "Regional Master Hub (0% Commission SLA)",
      inclusionsMatched: "Corporate Rides (★ 0% Commission)",
    };
  }

  const distNum = parseFloat((data.distance || "").replace(/[^0-9.]/g, "")) || 0;
  if (distNum > 40) {
    return {
      planTier: "gold",
      bookingType: "outstation_oneway",
      bookingTypeLabel: "🚗 Outstation (District Exclusive)",
      commissionRate: 10,
      tierScopeLabel: "District Exclusive Hub (10-15% Commission)",
      inclusionsMatched: "Outstation (Oneway, roundtrip)",
    };
  }

  return {
    planTier: "silver",
    bookingType: "rental_1hr_10km",
    bookingTypeLabel: "⏱️ Rental (1 Hour / 10 Kms)",
    commissionRate: 15,
    tierScopeLabel: "Ward Level Kiosk (15-20% Commission)",
    inclusionsMatched: "Rental (1 hours 10 kms, 3 hours 30 kms, 5 hours 50 kms)",
  };
}

export function getBookingTypeBadge(bookingType?: string, planTier?: string) {
  const t = cleanString(bookingType);
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

  const tier = cleanString(planTier);
  if (tier === "platinum") return { label: "💎 Regional Master (0% Comm)", color: "bg-cyan-100 text-cyan-950 border-cyan-400" };
  if (tier === "silver") return { label: "🥈 Ward Kiosk Ride", color: "bg-slate-100 text-slate-900 border-slate-300" };
  return { label: "🥇 District Exclusive Hub", color: "bg-amber-100 text-amber-950 border-amber-300" };
}

export function detectPlanTier(pickup: string, drop: string, vehicleCategory?: string, bookingType?: string): "silver" | "gold" | "platinum" {
  const result = classifyBookingByPlan({ pickup, drop, vehicleCategory, bookingType });
  return result.planTier;
}

/**
 * Finds all active / eligible vendors matching a specific plan tier and location/pincode,
 * strictly preserving plan-wise allocation (e.g. Gold -> Gold planner),
 * excluding vendors who have already rejected this booking.
 */
export async function findEligibleVendors(
  planTier: string,
  pickupZone: string = "",
  pickupPincode: string = "",
  excludedVendorIds: string[] = []
): Promise<Array<{
  vendorId: string;
  vendorName: string;
  vendorMobile: string;
  city: string;
  pincode: string;
  planTier: string;
  priority: number;
}>> {
  const targetTier = cleanString(planTier) || "gold";
  const zoneClean = cleanString(pickupZone);
  const targetPin = cleanPincode(pickupPincode);
  const excludedSet = new Set(excludedVendorIds.map((id) => cleanString(id)));

  // 1. Fetch active/approved subscriptions
  const subscriptions = await prisma.vendorSubscription.findMany({
    where: {
      status: { in: ["active", "approved"] },
    },
    orderBy: { createdAt: "desc" },
  });

  // 2. Fetch leads to map pincodes and lead records
  const leads = await prisma.vendorLead.findMany({
    where: {
      status: { in: ["approved", "payment_completed", "active", "new"] },
    },
    orderBy: { createdAt: "desc" },
  });

  // Index lead pincodes by applicationId and mobile
  const leadPinMap = new Map<string, string>();
  for (const l of leads) {
    const pin = cleanPincode(l.pincode);
    if (pin) {
      if (l.applicationId) leadPinMap.set(cleanString(l.applicationId), pin);
      const cleanM = (l.mobile || "").replace(/\D/g, "").slice(-10);
      if (cleanM) leadPinMap.set(`m_${cleanM}`, pin);
    }
  }

  const candidates: Array<{
    vendorId: string;
    vendorName: string;
    vendorMobile: string;
    city: string;
    pincode: string;
    planTier: string;
    priority: number;
  }> = [];

  const seenVendors = new Set<string>();

  // Process subscriptions
  for (const sub of subscriptions) {
    const vId = sub.applicationId || sub.id;
    if (excludedSet.has(cleanString(vId))) continue;
    if (seenVendors.has(vId)) continue;

    const subTier = cleanString(sub.planTier);
    // STRICT PLAN-WISE ALLOCATION:
    // Only vendors with the exact matching plan tier are eligible!
    if (subTier !== targetTier && targetTier !== "any") continue;

    seenVendors.add(vId);

    const cleanMobile = (sub.vendorMobile || "").replace(/\D/g, "").slice(-10);
    const vendorPin =
      cleanPincode((sub as any).pincode) ||
      leadPinMap.get(cleanString(vId)) ||
      (cleanMobile ? leadPinMap.get(`m_${cleanMobile}`) : "") ||
      (cleanString(sub.city).includes("singur") ? "712124" : "700001");

    let priority = 10; // base score for matching the plan tier

    // Pincode Priority Scoring:
    if (targetPin && vendorPin) {
      if (vendorPin === targetPin) {
        // EXACT 6-DIGIT PINCODE MATCH (Top Priority)
        priority += 100;
      } else if (vendorPin.slice(0, 4) === targetPin.slice(0, 4)) {
        // Same 4-digit sub-district postal zone (e.g. 7121xx)
        priority += 60;
      } else if (vendorPin.slice(0, 3) === targetPin.slice(0, 3)) {
        // Same 3-digit district sorting division (e.g. 712xxx)
        priority += 40;
      } else if (vendorPin.slice(0, 2) === targetPin.slice(0, 2)) {
        // Same 2-digit postal circle (e.g. 71xxxx / 70xxxx)
        priority += 20;
      }
    }

    const subCity = cleanString(sub.city);
    if (zoneClean && (subCity.includes(zoneClean) || zoneClean.includes(subCity))) {
      priority += 15;
    }

    candidates.push({
      vendorId: vId,
      vendorName: sub.vendorName || "Valued Partner",
      vendorMobile: sub.vendorMobile || "",
      city: sub.city || "Kolkata",
      pincode: vendorPin,
      planTier: subTier || targetTier,
      priority,
    });
  }

  // Also process approved leads if not in subscriptions
  for (const lead of leads) {
    const vId = lead.applicationId || lead.id;
    if (excludedSet.has(cleanString(vId))) continue;
    if (seenVendors.has(vId)) continue;

    const leadTier = cleanString(lead.preferredPackage);
    if (leadTier !== targetTier && targetTier !== "any") continue;

    seenVendors.add(vId);

    const vendorPin =
      cleanPincode(lead.pincode) ||
      (cleanString(lead.city).includes("singur") ? "712124" : "700001");

    let priority = 10;

    if (targetPin && vendorPin) {
      if (vendorPin === targetPin) {
        priority += 100;
      } else if (vendorPin.slice(0, 4) === targetPin.slice(0, 4)) {
        priority += 60;
      } else if (vendorPin.slice(0, 3) === targetPin.slice(0, 3)) {
        priority += 40;
      } else if (vendorPin.slice(0, 2) === targetPin.slice(0, 2)) {
        priority += 20;
      }
    }

    const leadCity = cleanString(lead.city);
    if (zoneClean && (leadCity.includes(zoneClean) || zoneClean.includes(leadCity))) {
      priority += 15;
    }

    candidates.push({
      vendorId: vId,
      vendorName: lead.fullName || "Valued Partner",
      vendorMobile: lead.mobile || "",
      city: lead.city || "Kolkata",
      pincode: vendorPin,
      planTier: leadTier || targetTier,
      priority,
    });
  }

  // Sort by highest priority: Exact pincode match first, then district prefix, then city!
  candidates.sort((a, b) => b.priority - a.priority);
  return candidates;
}

/**
 * Creates a new booking from BroomBoom App, BroomBoom Web Page, or Admin
 * and automatically assigns it to the nearest vendor plan-wise and pincode-wise.
 */
export async function createBookingOrder(data: {
  passengerName: string;
  passengerPhone: string;
  passengerRating?: number;
  pickup: string;
  pickupZone?: string;
  pickupPincode?: string;
  drop: string;
  dropZone?: string;
  dropPincode?: string;
  distance?: string;
  duration?: string;
  vehicleCategory?: string;
  planTier?: string;
  bookingType?: string;
  commissionRate?: number;
  totalFare: number;
  vendorPayout?: number;
  paymentMethod?: string;
  source?: string;
  adminApproved?: boolean;
  customVendorId?: string;
  notes?: string;
}): Promise<any> {
  const classification = classifyBookingByPlan({
    pickup: data.pickup,
    drop: data.drop,
    vehicleCategory: data.vehicleCategory,
    distance: data.distance,
    duration: data.duration,
    bookingType: data.bookingType,
    planTier: data.planTier,
  });

  const planTier = classification.planTier;
  const bookingType = classification.bookingType;
  const pickupPincode =
    cleanPincode(data.pickupPincode) ||
    extractPincode(data.pickup) ||
    (data.pickup.toLowerCase().includes("airport") ? "700052" : "712124");
  const dropPincode = cleanPincode(data.dropPincode) || extractPincode(data.drop) || "700091";

  const pickupZone = data.pickupZone || (data.pickup.toLowerCase().includes("airport") ? "Kolkata Airport" : "District Hub");
  const dropZone = data.dropZone || "Kolkata Central";

  const totalFare = Number(data.totalFare) || 500;
  // Commission logic from packages:
  // Silver (Ward Kiosk): 15-20% commission (15% platform fee, 85% vendor payout)
  // Gold (District Exclusive): 10-15% commission (10% platform fee, 90% vendor payout)
  // Platinum (Regional Master): ★ 0% Commission SLA (Zero Platform Fee, 100% vendor payout)
  const commissionRate = data.commissionRate !== undefined ? data.commissionRate : classification.commissionRate;
  const vendorPayout = data.vendorPayout || Math.round(totalFare * (1 - commissionRate / 100));

  const bookingId = `BB-ORD-${Date.now().toString().slice(-4)}${Math.floor(1000 + Math.random() * 9000)}`;
  const id = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Find eligible vendor by plan tier and pincode
  let assignedVendorId: string | null = null;
  let assignedVendorName: string | null = null;
  let assignedVendorMobile: string | null = null;
  let assignedVendorPincode: string | null = null;

  if (data.customVendorId) {
    assignedVendorId = data.customVendorId;
    assignedVendorName = "Assigned Vendor Partner";
  } else {
    const eligibleVendors = await findEligibleVendors(planTier, pickupZone, pickupPincode, []);
    if (eligibleVendors.length > 0) {
      const topMatch = eligibleVendors[0];
      assignedVendorId = topMatch.vendorId;
      assignedVendorName = topMatch.vendorName;
      assignedVendorMobile = topMatch.vendorMobile;
      assignedVendorPincode = topMatch.pincode;
    }
  }

  const query = `
    INSERT INTO booking_orders (
      id, booking_id, passenger_name, passenger_phone, passenger_rating,
      pickup, pickup_zone, pickup_pincode, drop_loc, drop_zone, drop_pincode,
      distance, duration, vehicle_category, plan_tier, booking_type, total_fare, vendor_payout,
      commission_rate, payment_method, source, status, assigned_vendor_id,
      assigned_vendor_name, assigned_vendor_mobile, assigned_vendor_pincode,
      rejected_vendor_ids, admin_approved, dispatch_time, notes,
      created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10, $11,
      $12, $13, $14, $15, $16, $17, $18,
      $19, $20, $21, $22, $23,
      $24, $25, $26,
      $27, $28, $29, $30,
      NOW(), NOW()
    ) RETURNING *;
  `;

  const adminApproved = true; // Directly live for vendor to receive on dashboard
  const dispatchTime = "Just now (45s left to accept)";

  const values = [
    id,
    bookingId,
    data.passengerName.trim(),
    data.passengerPhone.trim(),
    data.passengerRating || 4.9,
    data.pickup.trim(),
    pickupZone,
    pickupPincode,
    data.drop.trim(),
    dropZone,
    dropPincode,
    data.distance || "14.5 km",
    data.duration || "28 mins",
    data.vehicleCategory || "Sedan (Swift Dzire / Etios)",
    planTier,
    bookingType,
    totalFare,
    vendorPayout,
    commissionRate,
    data.paymentMethod || "Online Paid (Cashfree UPI)",
    data.source || "broomboom app",
    "incoming",
    assignedVendorId,
    assignedVendorName,
    assignedVendorMobile,
    assignedVendorPincode,
    [],
    adminApproved,
    dispatchTime,
    data.notes || null,
  ];

  const result: any = await prisma.$queryRawUnsafe(query, ...values);
  return result[0];
}

/**
 * Gets live orders for a specific vendor, plan tier, and pincode
 */
export async function getVendorOrders(
  vendorId?: string,
  planTier?: string,
  city?: string,
  pincode?: string
): Promise<any[]> {
  try {
    let sql = `SELECT * FROM booking_orders WHERE 1=1`;
    const params: any[] = [];

    if (vendorId) {
      params.push(vendorId);
      // Directly assigned to this vendor, OR unassigned matching their tier & pincode/city
      sql += ` AND (assigned_vendor_id = $${params.length}`;
      if (planTier) {
        params.push(cleanString(planTier));
        const tierIdx = params.length;
        if (pincode) {
          const cleanP = cleanPincode(pincode);
          params.push(cleanP);
          const pinIdx = params.length;
          sql += ` OR (assigned_vendor_id IS NULL AND plan_tier = $${tierIdx} AND (pickup_pincode = $${pinIdx} OR pickup_pincode LIKE '${cleanP.slice(0, 3)}%') AND NOT ($1 = ANY(rejected_vendor_ids)))`;
        } else {
          sql += ` OR (assigned_vendor_id IS NULL AND plan_tier = $${tierIdx} AND NOT ($1 = ANY(rejected_vendor_ids)))`;
        }
      }
      sql += `)`;
    } else if (planTier) {
      params.push(cleanString(planTier));
      sql += ` AND plan_tier = $${params.length}`;
    }

    sql += ` ORDER BY created_at DESC LIMIT 50;`;

    const rows: any = await prisma.$queryRawUnsafe(sql, ...params);
    return rows.map((r: any) => formatOrderRow(r));
  } catch (error) {
    console.error("[GET VENDOR ORDERS ERROR]", error);
    return [];
  }
}

/**
 * Gets all bookings for the Admin portal / App Admin
 */
export async function getAllBookings(filter?: {
  status?: string;
  planTier?: string;
  pickupZone?: string;
  pincode?: string;
  search?: string;
}): Promise<any[]> {
  try {
    let sql = `SELECT * FROM booking_orders WHERE 1=1`;
    const params: any[] = [];

    if (filter?.status && filter.status !== "ALL") {
      params.push(filter.status);
      sql += ` AND status = $${params.length}`;
    }

    if (filter?.planTier && filter.planTier !== "ALL") {
      params.push(cleanString(filter.planTier));
      sql += ` AND plan_tier = $${params.length}`;
    }

    if (filter?.pincode) {
      params.push(cleanPincode(filter.pincode));
      sql += ` AND (pickup_pincode = $${params.length} OR pickup ILIKE '%${filter.pincode}%')`;
    }

    if (filter?.pickupZone) {
      params.push(`%${filter.pickupZone}%`);
      sql += ` AND (pickup_zone ILIKE $${params.length} OR pickup ILIKE $${params.length})`;
    }

    if (filter?.search) {
      params.push(`%${filter.search}%`);
      sql += ` AND (booking_id ILIKE $${params.length} OR passenger_name ILIKE $${params.length} OR passenger_phone ILIKE $${params.length} OR assigned_vendor_name ILIKE $${params.length} OR pickup_pincode ILIKE $${params.length})`;
    }

    sql += ` ORDER BY created_at DESC LIMIT 100;`;

    const rows: any = await prisma.$queryRawUnsafe(sql, ...params);
    return rows.map((r: any) => formatOrderRow(r));
  } catch (error) {
    console.error("[GET ALL BOOKINGS ERROR]", error);
    return [];
  }
}

/**
 * Handles vendor accepting a booking (or confirming with a custom proposed price)
 * while enforcing the Wallet ₹0 / 2-Booking mandatory settlement rule.
 */
export async function acceptBookingOrder(
  bookingId: string,
  vendorId: string,
  driverInfo?: {
    name?: string;
    phone?: string;
    vehicleNumber?: string;
    startOtp?: string;
    proposedPrice?: number;
    cngCarrierConfirmed?: boolean;
  }
): Promise<any> {
  const existingRows: any = await prisma.$queryRawUnsafe(
    `SELECT * FROM booking_orders WHERE (booking_id = $1 OR id = $1) LIMIT 1;`,
    bookingId
  );
  const existing = existingRows[0];
  if (!existing) {
    return null;
  }

  const driverName = driverInfo?.name || "Raju Karmakar";
  const driverPhone = driverInfo?.phone || "+91 91234 56780";
  const driverVehicle = driverInfo?.vehicleNumber || "WB-02-AK-4921";
  const startOtp = driverInfo?.startOtp || `${Math.floor(1000 + Math.random() * 9000)}`;

  const totalFare = Number(existing.total_fare || 0);
  const currentPayout = Number(existing.vendor_payout || totalFare);
  const effectivePayout =
    driverInfo?.proposedPrice && driverInfo.proposedPrice > 0
      ? Math.round(driverInfo.proposedPrice)
      : currentPayout;

  const isAlreadyActiveForVendor =
    existing.status === "active" && existing.assigned_vendor_id === vendorId;

  let walletState: any = null;
  if (!isAlreadyActiveForVendor) {
    walletState = await recordBookingDebitOnAccept({
      vendorId,
      bookingId: existing.booking_id || bookingId,
      totalFare,
      vendorPayout: currentPayout,
      routeSummary: `${existing.pickup} to ${existing.drop_loc || existing.drop || "Destination"}`,
      driverLabel: `${driverName} (${driverVehicle})`,
    });
  }

  const quoteNote =
    driverInfo?.proposedPrice && driverInfo.proposedPrice > 0 && driverInfo.proposedPrice !== currentPayout
      ? `Vendor confirmed with price quote ₹${Math.round(driverInfo.proposedPrice)} (listed ₹${currentPayout}).`
      : existing.notes || null;

  const sql = `
    UPDATE booking_orders
    SET 
      status = 'active',
      assigned_vendor_id = $2,
      assigned_driver_name = $3,
      assigned_driver_phone = $4,
      assigned_driver_vehicle = $5,
      driver_live_status = 'Driver assigned & navigating to pickup (ETA 5 mins)',
      start_otp = $6,
      vendor_payout = $7,
      notes = $8,
      dispatch_time = 'Accepted just now',
      updated_at = NOW()
    WHERE (booking_id = $1 OR id = $1)
    RETURNING *;
  `;

  const rows: any = await prisma.$queryRawUnsafe(
    sql,
    bookingId,
    vendorId,
    driverName,
    driverPhone,
    driverVehicle,
    startOtp,
    effectivePayout,
    quoteNote
  );

  if (!rows[0]) return null;
  const formatted = formatOrderRow(rows[0]);
  return {
    ...formatted,
    walletState,
  };
}

/**
 * STRICT PLAN-WISE CASCADING ENGINE:
 * If a Gold planner vendor rejects / declines a booking:
 * 1. Add current Gold vendor to rejected_vendor_ids
 * 2. Look for the NEXT GOLD PLANNER VENDOR matching that pincode / nearby district
 * 3. Reassign directly to that next Gold vendor in 'incoming' status
 * 4. Never drop to another tier while Gold vendors are available!
 */
export async function rejectAndCascadeOrder(
  bookingId: string,
  currentVendorId: string,
  reason: string = "Vendor unavailable / declined"
): Promise<{ success: boolean; cascaded: boolean; nextVendor?: any; order?: any; message: string }> {
  // 1. Fetch current order
  const findSql = `SELECT * FROM booking_orders WHERE booking_id = $1 OR id = $1 LIMIT 1;`;
  const existingRows: any = await prisma.$queryRawUnsafe(findSql, bookingId);
  const currentOrder = existingRows[0];

  if (!currentOrder) {
    return { success: false, cascaded: false, message: "Order not found" };
  }

  const currentPlanTier = (currentOrder.plan_tier || "gold").toLowerCase();
  const currentPickupPincode = currentOrder.pickup_pincode || extractPincode(currentOrder.pickup) || "";

  // 2. Add current vendor to rejected list
  const currentRejections = Array.isArray(currentOrder.rejected_vendor_ids)
    ? currentOrder.rejected_vendor_ids
    : [];
  const updatedRejections = Array.from(new Set([...currentRejections, currentVendorId]));

  // 3. Find NEXT vendor of the EXACT SAME PLAN TIER (e.g. Gold -> Next Gold Planner Vendor)
  const nextCandidates = await findEligibleVendors(
    currentPlanTier,
    currentOrder.pickup_zone || currentOrder.pickup,
    currentPickupPincode,
    updatedRejections
  );

  const nextVendor = nextCandidates.length > 0 ? nextCandidates[0] : null;

  if (nextVendor) {
    // Cascade directly to the NEXT vendor of the SAME plan tier!
    const cascadeSql = `
      UPDATE booking_orders
      SET 
        assigned_vendor_id = $2,
        assigned_vendor_name = $3,
        assigned_vendor_mobile = $4,
        assigned_vendor_pincode = $5,
        rejected_vendor_ids = $6,
        status = 'incoming',
        admin_approved = TRUE,
        dispatch_time = 'Cascaded to next ${currentPlanTier.toUpperCase()} partner (45s left)',
        notes = $7,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *;
    `;

    const note = `Rejected by ${currentVendorId}. Cascaded directly to next ${currentPlanTier.toUpperCase()} planner ${nextVendor.vendorName} (${nextVendor.vendorId}, PIN: ${nextVendor.pincode}) on ${new Date().toLocaleTimeString()} - Reason: ${reason}`;
    const updatedRows: any = await prisma.$queryRawUnsafe(
      cascadeSql,
      currentOrder.id,
      nextVendor.vendorId,
      nextVendor.vendorName,
      nextVendor.vendorMobile,
      nextVendor.pincode,
      updatedRejections,
      note
    );

    return {
      success: true,
      cascaded: true,
      nextVendor,
      order: formatOrderRow(updatedRows[0]),
      message: `Booking ${currentOrder.booking_id} rejected and cascaded directly to next ${currentPlanTier.toUpperCase()} partner ${nextVendor.vendorName} (${nextVendor.vendorId}, PIN: ${nextVendor.pincode}).`,
    };
  } else {
    // All vendors in this plan tier have declined -> escalate to Admin Dispatch Desk
    const fallbackSql = `
      UPDATE booking_orders
      SET 
        assigned_vendor_id = NULL,
        assigned_vendor_name = NULL,
        assigned_vendor_mobile = NULL,
        rejected_vendor_ids = $2,
        status = 'pending_admin_reassign',
        dispatch_time = 'All ${currentPlanTier.toUpperCase()} vendors declined • Awaiting Admin re-allocation',
        notes = $3,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *;
    `;

    const note = `All ${currentPlanTier.toUpperCase()} planner vendors declined in PIN territory. Rejection list: ${updatedRejections.join(", ")}`;
    const updatedRows: any = await prisma.$queryRawUnsafe(fallbackSql, currentOrder.id, updatedRejections, note);

    return {
      success: true,
      cascaded: false,
      order: formatOrderRow(updatedRows[0]),
      message: `All available ${currentPlanTier.toUpperCase()} planner vendors in this PIN territory declined. Escalated to Admin Dispatch Desk.`,
    };
  }
}

/**
 * Handles completing a trip and settling payout
 */
export async function completeBookingOrder(bookingId: string): Promise<any> {
  const sql = `
    UPDATE booking_orders
    SET 
      status = 'completed',
      driver_live_status = 'Trip Completed & Settled',
      dispatch_time = 'Completed & Settled',
      updated_at = NOW()
    WHERE (booking_id = $1 OR id = $1)
    RETURNING *;
  `;

  const rows: any = await prisma.$queryRawUnsafe(sql, bookingId);
  return rows[0] ? formatOrderRow(rows[0]) : null;
}

/**
 * Helper to transform DB row into clean UI object
 */
export function formatOrderRow(row: any): any {
  return {
    id: row.booking_id || row.id,
    dbId: row.id,
    bookingId: row.booking_id,
    pickup: row.pickup,
    pickupZone: row.pickup_zone,
    pickupPincode: row.pickup_pincode || extractPincode(row.pickup) || "",
    drop: row.drop_loc || row.drop,
    dropZone: row.drop_zone,
    dropPincode: row.drop_pincode || extractPincode(row.drop_loc || row.drop) || "",
    distance: row.distance,
    duration: row.duration,
    vehicleCategory: row.vehicle_category,
    planTier: row.plan_tier,
    bookingType: row.booking_type || "",
    bookingTypeLabel: getBookingTypeBadge(row.booking_type, row.plan_tier).label,
    totalFare: Number(row.total_fare),
    vendorPayout: Number(row.vendor_payout),
    commissionRate: Number(row.commission_rate),
    passengerName: row.passenger_name,
    passengerPhone: row.passenger_phone,
    passengerRating: Number(row.passenger_rating || 4.9),
    status: row.status,
    dispatchTime: row.dispatch_time || "Recent",
    paymentMethod: row.payment_method,
    source: row.source,
    assignedVendorId: row.assigned_vendor_id,
    assignedVendorName: row.assigned_vendor_name,
    assignedVendorMobile: row.assigned_vendor_mobile,
    assignedVendorPincode: row.assigned_vendor_pincode || "",
    rejectedVendorIds: row.rejected_vendor_ids || [],
    adminApproved: row.admin_approved,
    notes: row.notes,
    createdAt: row.created_at,
    assignedDriver: row.assigned_driver_name
      ? {
          name: row.assigned_driver_name,
          phone: row.assigned_driver_phone,
          vehicleNumber: row.assigned_driver_vehicle,
          liveStatus: row.driver_live_status,
          startOtp: row.start_otp,
        }
      : undefined,
  };
}

/**
 * Admin grants permission or manually re-assigns a booking to any specific vendor
 */
export async function adminApproveAndDispatchBooking(
  bookingId: string,
  targetVendorId?: string,
  adminNotes?: string
): Promise<{ success: boolean; message: string; order?: any }> {
  const findSql = `SELECT * FROM booking_orders WHERE booking_id = $1 OR id = $1 LIMIT 1;`;
  const existingRows: any = await prisma.$queryRawUnsafe(findSql, bookingId);
  const currentOrder = existingRows[0];

  if (!currentOrder) {
    return { success: false, message: "Order not found" };
  }

  let assignedVendorId = targetVendorId || currentOrder.assigned_vendor_id;
  let assignedVendorName = currentOrder.assigned_vendor_name;
  let assignedVendorMobile = currentOrder.assigned_vendor_mobile;
  let assignedVendorPincode = currentOrder.assigned_vendor_pincode;

  if (targetVendorId && targetVendorId !== currentOrder.assigned_vendor_id) {
    const sub = await prisma.vendorSubscription.findFirst({
      where: {
        OR: [{ applicationId: targetVendorId }, { id: targetVendorId }],
      },
    });
    if (sub) {
      assignedVendorId = sub.applicationId;
      assignedVendorName = sub.vendorName;
      assignedVendorMobile = sub.vendorMobile;
      assignedVendorPincode = (sub as any).pincode || "";
    } else {
      const lead = await prisma.vendorLead.findFirst({
        where: {
          OR: [{ applicationId: targetVendorId }, { id: targetVendorId }],
        },
      });
      if (lead) {
        assignedVendorId = lead.applicationId;
        assignedVendorName = lead.fullName;
        assignedVendorMobile = lead.mobile;
        assignedVendorPincode = lead.pincode || "";
      }
    }
  }

  if (!assignedVendorId) {
    const eligibleVendors = await findEligibleVendors(
      currentOrder.plan_tier,
      currentOrder.pickup_zone || currentOrder.pickup,
      currentOrder.pickup_pincode,
      currentOrder.rejected_vendor_ids || []
    );
    if (eligibleVendors.length > 0) {
      assignedVendorId = eligibleVendors[0].vendorId;
      assignedVendorName = eligibleVendors[0].vendorName;
      assignedVendorMobile = eligibleVendors[0].vendorMobile;
      assignedVendorPincode = eligibleVendors[0].pincode;
    }
  }

  const sql = `
    UPDATE booking_orders
    SET 
      admin_approved = TRUE,
      status = 'incoming',
      assigned_vendor_id = $2,
      assigned_vendor_name = $3,
      assigned_vendor_mobile = $4,
      assigned_vendor_pincode = $5,
      dispatch_time = 'Admin approved & dispatched just now (45s left)',
      notes = $6,
      updated_at = NOW()
    WHERE (booking_id = $1 OR id = $1)
    RETURNING *;
  `;

  const note = adminNotes || `Admin granted dispatch permission to vendor ${assignedVendorName || assignedVendorId}`;
  const rows: any = await prisma.$queryRawUnsafe(
    sql,
    bookingId,
    assignedVendorId,
    assignedVendorName,
    assignedVendorMobile,
    assignedVendorPincode,
    note
  );

  return {
    success: true,
    message: `Admin permission granted! Booking ${bookingId} has been dispatched to ${assignedVendorName || assignedVendorId} (${currentOrder.plan_tier.toUpperCase()}).`,
    order: rows[0] ? formatOrderRow(rows[0]) : null,
  };
}
