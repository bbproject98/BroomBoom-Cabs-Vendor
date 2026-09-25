import prisma from "@/lib/prisma";
import { handleOptions, jsonResponse } from "@/lib/cors";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    const hubs = await prisma.vendorHub.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: {
        createdAt: "desc",
      },
    });

    return jsonResponse({
      success: true,
      total: hubs.length,
      hubs,
    });
  } catch (error) {
    console.error("[API ERROR] Failed to fetch vendor hubs:", error);

    return jsonResponse(
      {
        success: false,
        error: "Failed to fetch vendor hubs",
      },
      500
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.city || !body.state || !body.address) {
      return jsonResponse(
        {
          success: false,
          error: "City, State, and Address are required.",
        },
        400
      );
    }

    const hub = await prisma.vendorHub.create({
      data: {
        city: body.city.trim(),
        state: body.state.trim(),
        type: body.type || "Fleet Verification Hub",
        tier: body.tier || "Gold",
        address: body.address.trim(),
        phone: body.phone || "1800-BROOM-BOOM",
        openHours: body.openHours || "9:00 AM - 8:00 PM",
        isActive:
          body.isActive !== undefined ? Boolean(body.isActive) : true,
      },
    });

    return jsonResponse(
      {
        success: true,
        hub,
      },
      201
    );
  } catch (error) {
    console.error("[API ERROR] Failed to create vendor hub:", error);

    return jsonResponse(
      {
        success: false,
        error: "Failed to create vendor hub",
      },
      500
    );
  }
}