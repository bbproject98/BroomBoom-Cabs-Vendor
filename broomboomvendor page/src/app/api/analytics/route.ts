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
      const [
        totalLeads,
        silverCount,
        goldCount,
        platinumCount,
        brochureDownloads,
        activeHubs,
      ] = await Promise.all([
        prisma.vendorLead.count(),
        prisma.vendorLead.count({ where: { preferredPackage: "silver" } }),
        prisma.vendorLead.count({ where: { preferredPackage: "gold" } }),
        prisma.vendorLead.count({ where: { preferredPackage: "platinum" } }),
        prisma.brochureDownload.count(),
        prisma.vendorHub.count({ where: { isActive: true } }),
      ]);

      return jsonResponse({
        success: true,
        source: "postgresql_prisma",
        stats: {
          totalLeads,
          leadsByTier: {
            silver: silverCount,
            gold: goldCount,
            platinum: platinumCount,
          },
          brochureDownloads,
          activeHubs,
        },
      });
    } catch {
      const stats = db.getAnalytics();
      return jsonResponse({
        success: true,
        source: "local_store",
        stats,
      });
    }
  } catch (error) {
    return jsonResponse(
      { success: false, error: "Failed to fetch analytics" },
      500
    );
  }
}
