import prisma from "@/lib/prisma";
import { handleOptions, jsonResponse } from "@/lib/cors";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status") || undefined;
    const pkg = searchParams.get("package") || undefined;
    const query = searchParams.get("query") || undefined;

    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");

    const limit = limitParam ? parseInt(limitParam, 10) : 50;
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (pkg) {
      where.preferredPackage = pkg;
    }

    if (query) {
      where.OR = [
        {
          fullName: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          mobile: {
            contains: query,
          },
        },
        {
          city: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          applicationId: {
            contains: query,
            mode: "insensitive",
          },
        },
      ];
    }

    const [leads, total] = await Promise.all([
      prisma.vendorLead.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      }),
      prisma.vendorLead.count({
        where,
      }),
    ]);

    return jsonResponse({
      success: true,
      source: "postgresql_prisma",
      total,
      leads,
    });
  } catch (error) {
    console.error("[API ERROR] Failed to fetch leads:", error);

    return jsonResponse(
      {
        success: false,
        error: "Failed to fetch leads",
      },
      500
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.fullName || !body.mobile || !body.city) {
      return jsonResponse(
        {
          success: false,
          error: "Full Name, Mobile, and City are required.",
        },
        400
      );
    }

    const preferredPackage =
      body.preferredPackage ||
      body.selectedPackage ||
      "gold";

    const serial = Math.floor(1000 + Math.random() * 9000);

    const applicationId =
      body.applicationId ||
      `BB-VENDOR-2026-${serial}`;

    let investmentBudget = body.investmentBudget;

    if (
      !investmentBudget ||
      investmentBudget === "Flexible" ||
      (preferredPackage === "silver" &&
        investmentBudget.includes("Gold")) ||
      (preferredPackage === "platinum" &&
        investmentBudget.includes("Gold")) ||
      (preferredPackage === "gold" &&
        investmentBudget.includes("Silver"))
    ) {
      investmentBudget =
        preferredPackage === "silver"
          ? "₹10,000 (Silver Partner - 50% OFF Exclusive Deal)"
          : preferredPackage === "platinum"
          ? "₹50,000 (Platinum Package - 50% OFF Exclusive Deal)"
          : "₹20,000 (Gold Package - 50% OFF Exclusive Deal)";
    }

    let carpetArea = body.carpetArea;

    if (
      !carpetArea ||
      (preferredPackage === "silver" &&
        carpetArea.includes("Gold")) ||
      (preferredPackage === "platinum" &&
        carpetArea.includes("Gold")) ||
      (preferredPackage === "gold" &&
        carpetArea.includes("Silver"))
    ) {
      carpetArea =
        preferredPackage === "silver"
          ? "100 - 150 sq.ft (Ideal for Silver Kiosk)"
          : preferredPackage === "platinum"
          ? "800 - 1,200 sq.ft (Ideal for Platinum Master)"
          : "300 - 500 sq.ft (Ideal for Gold Hub)";
    }

    const lead = await prisma.vendorLead.create({
      data: {
        applicationId,
        fullName: body.fullName.trim(),
        mobile: body.mobile.trim(),
        alternatePhone:
          body.alternatePhone?.trim() || null,
        email:
          body.email?.trim() || null,
        state:
          body.state?.trim() || null,
        city:
          body.city.trim(),
        pincode:
          body.pincode?.trim() || null,
        proposedAddress:
          body.proposedAddress?.trim() || null,
        spaceStatus:
          body.spaceStatus || null,
        carpetArea,
        preferredPackage,
        packageName:
          body.packageName || null,
        investmentBudget,
        financeRequired:
          body.financeRequired ||
          "Self-Funded / Ready Capital",
        loanAssistance:
          body.loanAssistance ||
          "No (Self-Funded)",
        currentProfession:
          body.currentProfession || null,
        hasExperience:
          body.hasExperience || null,
        message:
          body.message || null,
        source:
          body.source || "direct_api",
        status:
          body.status || "new",
      },
    });

    return jsonResponse(
      {
        success: true,
        source: "postgresql_prisma",
        lead,
      },
      201
    );
  } catch (error) {
    console.error("[API ERROR] Failed to create lead:", error);

    return jsonResponse(
      {
        success: false,
        error: "Failed to create lead",
      },
      500
    );
  }
}