import { db } from "@/lib/db";
import prisma from "@/lib/prisma";
import { handleOptions, jsonResponse } from "@/lib/cors";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(_request: Request) {
  try {
    try {
      const brochures = await prisma.brochureDownload.findMany({
        orderBy: { downloadedAt: "desc" },
      });
      return jsonResponse({
        success: true,
        source: "postgresql_prisma",
        total: brochures.length,
        brochures,
      });
    } catch {
      const brochures = db.brochures.getAll();
      return jsonResponse({
        success: true,
        source: "local_store",
        total: brochures.length,
        brochures,
      });
    }
  } catch (error) {
    return jsonResponse(
      { success: false, error: "Failed to fetch brochure downloads" },
      500
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.mobile) {
      return jsonResponse(
        { success: false, error: "Name and Mobile number are required" },
        400
      );
    }

    let downloadRecord: any = null;
    try {
      downloadRecord = await prisma.brochureDownload.create({
        data: {
          name: body.name.trim(),
          mobile: body.mobile.trim(),
          city: body.city?.trim() || "Unspecified",
        },
      });
      console.log(`[PRISMA POSTGRES] Brochure download logged: ${downloadRecord.name} (${downloadRecord.city})`);
    } catch (err) {
      console.warn("[PRISMA DB] Could not write brochure to PostgreSQL directly:", err);
    }

    const fallbackRecord = db.brochures.create({
      name: body.name.trim(),
      mobile: body.mobile.trim(),
      city: body.city?.trim() || "Unspecified",
    });

    const activeRecord = downloadRecord || fallbackRecord;

    return jsonResponse(
      {
        success: true,
        message: "Vendor Prospectus download logged successfully in database.",
        data: activeRecord,
      },
      201
    );
  } catch (error) {
    console.error("[API ERROR] Failed to log brochure download:", error);
    return jsonResponse(
      { success: false, error: "Internal server error logging brochure download." },
      500
    );
  }
}
