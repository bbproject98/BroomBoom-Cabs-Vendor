import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_request: Request) {
  try {
    const csvData = db.exportLeadsToCsv();
    const filename = `broomboom-vendor-leads-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[API ERROR] Failed to export leads to CSV:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export leads to CSV" },
      { status: 500 }
    );
  }
}

