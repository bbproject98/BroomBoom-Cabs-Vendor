import prisma from "@/lib/prisma";
import { PackageTier } from "@/lib/db/schema";
import { handleOptions, jsonResponse } from "@/lib/cors";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.fullName || !body.mobile || !body.city) {
      return jsonResponse(
        {
          success: false,
          error: "Full Name, Mobile Number, and City are required.",
        },
        400
      );
    }

    const packageKey = (
      body.preferredPackage ||
      body.selectedPackage ||
      "gold"
    ).toLowerCase();

    const validPackage: PackageTier = [
      "silver",
      "gold",
      "platinum",
      "undecided",
    ].includes(packageKey)
      ? (packageKey as PackageTier)
      : "gold";

    const packageName =
      body.packageName ||
      (validPackage === "silver"
        ? "Silver Partner (Booking Kiosk — ₹10,000)"
        : validPackage === "gold"
        ? "Gold Partner (District Exclusive Hub — ₹20,000)"
        : validPackage === "platinum"
        ? "Platinum Partner (Regional Master Hub — ₹50,000)"
        : "Custom Vendor Inquiry");

    let investmentBudget = body.investmentBudget;

    if (
      !investmentBudget ||
      investmentBudget === "Flexible" ||
      (validPackage === "silver" &&
        investmentBudget.includes("Gold")) ||
      (validPackage === "platinum" &&
        investmentBudget.includes("Gold")) ||
      (validPackage === "gold" &&
        investmentBudget.includes("Silver"))
    ) {
      investmentBudget =
        validPackage === "silver"
          ? "₹10,000 (Silver Partner - 50% OFF Exclusive Deal)"
          : validPackage === "platinum"
          ? "₹50,000 (Platinum Package - 50% OFF Exclusive Deal)"
          : "₹20,000 (Gold Package - 50% OFF Exclusive Deal)";
    }

    let carpetArea = body.carpetArea;

    if (
      !carpetArea ||
      (validPackage === "silver" &&
        carpetArea.includes("Gold")) ||
      (validPackage === "platinum" &&
        carpetArea.includes("Gold")) ||
      (validPackage === "gold" &&
        carpetArea.includes("Silver"))
    ) {
      carpetArea =
        validPackage === "silver"
          ? "100 - 150 sq.ft (Ideal for Silver Kiosk)"
          : validPackage === "platinum"
          ? "800 - 1,200 sq.ft (Ideal for Platinum Master)"
          : "300 - 500 sq.ft (Ideal for Gold Hub)";
    }

    const serial = Math.floor(1000 + Math.random() * 9000);
    const generatedApplicationId = `BB-VENDOR-2026-${serial}`;

    const lead = await prisma.vendorLead.create({
      data: {
        applicationId: generatedApplicationId,
        fullName: body.fullName.trim(),
        mobile: body.mobile.trim(),
        alternatePhone: body.alternatePhone?.trim() || null,
        email: body.email?.trim() || null,
        state: body.state?.trim() || null,
        city: body.city.trim(),
        pincode: body.pincode?.trim() || null,
        proposedAddress: body.proposedAddress?.trim() || null,
        spaceStatus: body.spaceStatus || null,
        carpetArea,
        preferredPackage: validPackage,
        packageName,
        investmentBudget,
        financeRequired:
          body.financeRequired || "Self-Funded / Ready Capital",
        loanAssistance:
          body.loanAssistance || "No (Self-Funded)",
        currentProfession: body.currentProfession || null,
        hasExperience: body.hasExperience || null,
        message: body.message || null,
        source: body.source || "vendor_portal",
        status: "new",
        adminNotes:
          "Application saved to PostgreSQL via Prisma. Ready for evaluation.",
      },
    });

    console.log(
      `[PRISMA POSTGRES] Successfully saved Vendor Lead: ${lead.applicationId} (${lead.fullName}, ${lead.city})`
    );

    return jsonResponse(
      {
        success: true,
        message:
          "Your vendor application has been recorded successfully in the database.",
        data: {
          applicationId: lead.applicationId,
          leadId: lead.id,
          applicant: lead.fullName,
          city: lead.city,
          packageName: lead.packageName,
          status: lead.status,
          storage: "postgresql_prisma",
          submittedAt: lead.createdAt,
        },
      },
      201
    );
  } catch (error) {
    console.error(
      "[API ERROR] Failed to process vendor application:",
      error
    );

    return jsonResponse(
      {
        success: false,
        error: "Internal server error processing vendor application.",
      },
      500
    );
  }
}