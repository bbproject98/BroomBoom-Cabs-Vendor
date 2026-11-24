import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleOptions, jsonResponse } from "@/lib/cors";
import { cleanString } from "@/lib/ordersService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function OPTIONS() {
  return handleOptions();
}

/**
 * Plan fleet limits according to BroomBoom franchise packages
 */
const PLAN_FLEET_LIMITS: Record<
  string,
  {
    maxCabs: number;
    planName: string;
    tierLabel: string;
    allowedCategories: string[];
    recommendedModels: string[];
    dutyTypes: string[];
    commissionRate: number;
    commissionNote: string;
    monthlyEarningEstimate: string;
  }
> = {
  silver: {
    maxCabs: 5,
    planName: "Silver Partner (Ward Kiosk)",
    tierLabel: "Ward Level Kiosk Partner",
    allowedCategories: [
      "Hatchback (WagonR / Swift / Tiago)",
      "Compact Sedan (Swift Dzire / Toyota Etios / Hyundai Aura)",
    ],
    recommendedModels: [
      "Maruti Suzuki Swift Dzire",
      "Toyota Etios",
      "Maruti Wagon R",
      "Hyundai Aura",
    ],
    dutyTypes: [
      "Airport Transfer Rides",
      "Station Transfer Rides",
      "Rental (1h 10km, 3h 30km, 5h 50km)",
    ],
    commissionRate: 15,
    commissionNote: "15–20% Platform Fee (85% Vendor Payout)",
    monthlyEarningEstimate: "₹45,000 – ₹65,000 / cab",
  },
  gold: {
    maxCabs: 5,
    planName: "Gold Partner (District Exclusive Hub)",
    tierLabel: "District Exclusive Fleet Partner",
    allowedCategories: [
      "Prime Sedan (Dzire / Etios / Amaze / Verna)",
      "Family SUV / MUV (Maruti Ertiga / Kia Carens / Triber)",
    ],
    recommendedModels: [
      "Maruti Suzuki Ertiga",
      "Swift Dzire (Prime)",
      "Toyota Etios",
      "Kia Carens",
      "Honda Amaze",
    ],
    dutyTypes: [
      "Outstation (Oneway Drop)",
      "Outstation (Round Trip)",
      "Rental (08h 80km, 10h 100km, 12h 120km)",
    ],
    commissionRate: 10,
    commissionNote: "10–15% Platform Fee (90% Vendor Payout)",
    monthlyEarningEstimate: "₹65,000 – ₹90,000 / cab",
  },
  platinum: {
    maxCabs: 10,
    planName: "Platinum Partner (Regional Master Hub)",
    tierLabel: "Regional Master Fleet Hub",
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

let tableEnsured = false;
async function ensureVehicleTable() {
  if (tableEnsured) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS vendor_attached_vehicles (
        id TEXT PRIMARY KEY,
        vendor_id TEXT NOT NULL,
        plan_tier TEXT NOT NULL,
        vehicle_model TEXT NOT NULL,
        vehicle_number TEXT NOT NULL,
        vehicle_category TEXT NOT NULL,
        fuel_type TEXT NOT NULL,
        has_carrier BOOLEAN DEFAULT TRUE,
        driver_name TEXT NOT NULL,
        driver_phone TEXT NOT NULL,
        rc_status TEXT DEFAULT 'VERIFIED',
        insurance_expiry TEXT DEFAULT '2027-12-31',
        fitness_status TEXT DEFAULT 'VALID',
        permit_type TEXT DEFAULT 'All-India Tourist Permit (AITP)',
        fastag_status TEXT DEFAULT 'ACTIVE',
        operational_status TEXT DEFAULT 'on_duty',
        total_trips INTEGER DEFAULT 0,
        total_earnings DOUBLE PRECISION DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    tableEnsured = true;
  } catch (e) {
    console.warn("[ENSURE VEHICLES TABLE WARN]", e);
  }
}

/**
 * Pre-seeds default plan-compliant vehicles for a newly active vendor
 */
async function seedDefaultVehiclesForVendor(vendorId: string, planTier: string) {
  const tier = cleanString(planTier) || "gold";
  const vId = vendorId.trim();

  const existing: any = await prisma.$queryRawUnsafe(
    `SELECT count(*) FROM vendor_attached_vehicles WHERE vendor_id = $1;`,
    vId
  );
  if (Number(existing[0]?.count || 0) > 0) return;

  const defaultVehicles =
    tier === "silver"
      ? [
          {
            model: "Maruti Suzuki Swift Dzire (2023)",
            number: "WB-02-AK-4921",
            category: "Compact Sedan (Dzire)",
            fuel: "CNG + Petrol",
            hasCarrier: true,
            driverName: "Raju Karmakar",
            driverPhone: "+91 91234 56780",
            trips: 84,
            earnings: 45600,
          },
          {
            model: "Toyota Etios Liva (2022)",
            number: "WB-04-E-8832",
            category: "Compact Sedan (Etios)",
            fuel: "Diesel",
            hasCarrier: false,
            driverName: "Bikash Paul",
            driverPhone: "+91 98305 11203",
            trips: 62,
            earnings: 34100,
          },
        ]
      : tier === "platinum"
      ? [
          {
            model: "Toyota Innova Crysta 2.4 VX (2024)",
            number: "WB-06-M-7701",
            category: "Luxury / Premium SUV (Innova Crysta)",
            fuel: "Diesel",
            hasCarrier: true,
            driverName: "Siddhartha Roy",
            driverPhone: "+91 98319 44021",
            trips: 112,
            earnings: 142000,
          },
          {
            model: "Toyota Camry Hybrid Executive (2023)",
            number: "WB-02-VIP-0099",
            category: "Executive VIP Sedan (Camry)",
            fuel: "Petrol + Hybrid",
            hasCarrier: false,
            driverName: "Debashis Sen",
            driverPhone: "+91 94330 91823",
            trips: 76,
            earnings: 89500,
          },
          {
            model: "Force Urbania 12-Seater Luxury (2024)",
            number: "WB-08-T-4509",
            category: "Tour Coach (Force Urbania)",
            fuel: "Diesel",
            hasCarrier: true,
            driverName: "Sanjoy Banerjee",
            driverPhone: "+91 98741 00293",
            trips: 45,
            earnings: 168000,
          },
        ]
      : [
          // GOLD PARTNER (DISTRICT EXCLUSIVE)
          {
            model: "Maruti Suzuki Ertiga VXi (2023)",
            number: "WB-02-AK-4921",
            category: "Family SUV / MUV (Ertiga)",
            fuel: "CNG + Petrol",
            hasCarrier: true,
            driverName: "Raju Karmakar",
            driverPhone: "+91 91234 56780",
            trips: 124,
            earnings: 82400,
          },
          {
            model: "Maruti Suzuki Swift Dzire ZXi (2024)",
            number: "WB-04-E-8832",
            category: "Prime Sedan (Dzire)",
            fuel: "CNG + Petrol",
            hasCarrier: true,
            driverName: "Bikash Paul",
            driverPhone: "+91 98305 11203",
            trips: 98,
            earnings: 68500,
          },
          {
            model: "Kia Carens Prestige Plus (2023)",
            number: "WB-12-C-3419",
            category: "Family SUV / MUV (Carens)",
            fuel: "Diesel",
            hasCarrier: false,
            driverName: "Subhasish Das",
            driverPhone: "+91 94331 67890",
            trips: 41,
            earnings: 39800,
          },
        ];

  for (const v of defaultVehicles) {
    const id = `veh_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    await prisma.$executeRawUnsafe(
      `
      INSERT INTO vendor_attached_vehicles (
        id, vendor_id, plan_tier, vehicle_model, vehicle_number, vehicle_category,
        fuel_type, has_carrier, driver_name, driver_phone, rc_status,
        insurance_expiry, fitness_status, permit_type, fastag_status,
        operational_status, total_trips, total_earnings, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, 'VERIFIED',
        '2027-12-31', 'VALID', 'All-India Tourist Permit (AITP)', 'ACTIVE',
        'on_duty', $11, $12, NOW(), NOW()
      );
      `,
      id,
      vId,
      tier,
      v.model,
      v.number,
      v.category,
      v.fuel,
      v.hasCarrier,
      v.driverName,
      v.driverPhone,
      v.trips,
      v.earnings
    );
  }
}

/**
 * GET /api/vendor/vehicles
 * Returns vehicles attached by the vendor, with plan limit statistics
 */
export async function GET(request: Request) {
  try {
    await ensureVehicleTable();
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendorId") || searchParams.get("applicationId") || "BB-VENDOR-2026-5058";
    const planTier = cleanString(searchParams.get("planTier") || "gold");

    await seedDefaultVehiclesForVendor(vendorId, planTier);

    const rows: any = await prisma.$queryRawUnsafe(
      `
      SELECT * FROM vendor_attached_vehicles
      WHERE vendor_id = $1 OR vendor_id = 'BB-VENDOR-2026-5058'
      ORDER BY created_at DESC;
      `,
      vendorId
    );

    const planConfig = PLAN_FLEET_LIMITS[planTier] || PLAN_FLEET_LIMITS.gold;
    const maxCabs = planConfig.maxCabs;
    const attachedCount = rows.length;
    const remainingSlots = Math.max(0, maxCabs - attachedCount);

    const vehicles = rows.map((r: any) => ({
      id: r.id,
      vendorId: r.vendor_id,
      planTier: r.plan_tier,
      vehicleModel: r.vehicle_model,
      vehicleNumber: r.vehicle_number,
      vehicleCategory: r.vehicle_category,
      fuelType: r.fuel_type,
      hasCarrier: Boolean(r.has_carrier),
      driverName: r.driver_name,
      driverPhone: r.driver_phone,
      rcStatus: r.rc_status || "VERIFIED",
      insuranceExpiry: r.insurance_expiry || "2027-12-31",
      fitnessStatus: r.fitness_status || "VALID",
      permitType: r.permit_type || "All-India Tourist Permit (AITP)",
      fastagStatus: r.fastag_status || "ACTIVE",
      operationalStatus: r.operational_status || "on_duty",
      totalTrips: Number(r.total_trips || 0),
      totalEarnings: Number(r.total_earnings || 0),
      createdAt: r.created_at,
    }));

    return jsonResponse({
      success: true,
      vendorId,
      planTier,
      planConfig,
      maxCabs,
      attachedCount,
      remainingSlots,
      vehicles,
    });
  } catch (error: any) {
    console.error("[API VENDOR VEHICLES GET ERROR]", error);
    return jsonResponse(
      { success: false, error: error.message || "Failed to load attached vehicles" },
      500
    );
  }
}

/**
 * POST /api/vendor/vehicles
 * Attach a new car to the vendor's fleet
 */
export async function POST(request: Request) {
  try {
    await ensureVehicleTable();
    const body = await request.json();
    const {
      vendorId = "BB-VENDOR-2026-5058",
      planTier = "gold",
      vehicleModel,
      vehicleNumber,
      vehicleCategory,
      fuelType = "CNG + Petrol",
      hasCarrier = true,
      driverName,
      driverPhone,
      permitType = "All-India Tourist Permit (AITP)",
    } = body;

    if (!vehicleModel || !vehicleNumber || !driverName || !driverPhone) {
      return jsonResponse(
        {
          success: false,
          error: "Vehicle Model, Registration Number, Driver Name, and Driver Phone are required.",
        },
        400
      );
    }

    const tier = cleanString(planTier) || "gold";
    const planConfig = PLAN_FLEET_LIMITS[tier] || PLAN_FLEET_LIMITS.gold;

    // Check plan quota
    const existing: any = await prisma.$queryRawUnsafe(
      `SELECT count(*) FROM vendor_attached_vehicles WHERE vendor_id = $1;`,
      vendorId
    );
    const count = Number(existing[0]?.count || 0);

    if (count >= planConfig.maxCabs) {
      return jsonResponse(
        {
          success: false,
          error: `Fleet attachment slot limit of ${planConfig.maxCabs} cabs reached for ${planConfig.planName}! Upgrade to Platinum to attach up to 10 cabs with 0% platform commission.`,
          slotLimitReached: true,
          maxCabs: planConfig.maxCabs,
        },
        400
      );
    }

    const id = `veh_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const category =
      vehicleCategory ||
      (planConfig.allowedCategories[0] || "Prime Sedan (Dzire / Etios)");

    await prisma.$executeRawUnsafe(
      `
      INSERT INTO vendor_attached_vehicles (
        id, vendor_id, plan_tier, vehicle_model, vehicle_number, vehicle_category,
        fuel_type, has_carrier, driver_name, driver_phone, rc_status,
        insurance_expiry, fitness_status, permit_type, fastag_status,
        operational_status, total_trips, total_earnings, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, 'VERIFIED',
        '2027-12-31', 'VALID', $11, 'ACTIVE',
        'on_duty', 0, 0, NOW(), NOW()
      );
      `,
      id,
      vendorId,
      tier,
      vehicleModel.trim(),
      vehicleNumber.trim().toUpperCase(),
      category,
      fuelType,
      Boolean(hasCarrier),
      driverName.trim(),
      driverPhone.trim(),
      permitType
    );

    return jsonResponse({
      success: true,
      message: `Vehicle ${vehicleNumber.toUpperCase()} (${vehicleModel}) successfully attached to your ${planConfig.planName} fleet!`,
      vehicle: {
        id,
        vendorId,
        planTier: tier,
        vehicleModel: vehicleModel.trim(),
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        vehicleCategory: category,
        fuelType,
        hasCarrier: Boolean(hasCarrier),
        driverName: driverName.trim(),
        driverPhone: driverPhone.trim(),
        rcStatus: "VERIFIED",
        fitnessStatus: "VALID",
        fastagStatus: "ACTIVE",
        permitType,
        operationalStatus: "on_duty",
        totalTrips: 0,
        totalEarnings: 0,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("[API VENDOR VEHICLES POST ERROR]", error);
    return jsonResponse(
      { success: false, error: error.message || "Failed to attach vehicle" },
      500
    );
  }
}

/**
 * DELETE /api/vendor/vehicles
 * Remove / detach a vehicle from the fleet
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get("id");
    const vendorId = searchParams.get("vendorId");

    if (!vehicleId) {
      return jsonResponse({ success: false, error: "Vehicle id is required." }, 400);
    }

    await prisma.$executeRawUnsafe(
      `DELETE FROM vendor_attached_vehicles WHERE id = $1;`,
      vehicleId
    );

    return jsonResponse({
      success: true,
      message: `Vehicle detached from fleet successfully.`,
      vehicleId,
    });
  } catch (error: any) {
    console.error("[API VENDOR VEHICLES DELETE ERROR]", error);
    return jsonResponse(
      { success: false, error: error.message || "Failed to detach vehicle" },
      500
    );
  }
}
