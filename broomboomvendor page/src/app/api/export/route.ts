import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value);

  if (
    text.includes(",") ||
    text.includes('"') ||
    text.includes("\n") ||
    text.includes("\r")
  ) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

export async function GET(_request: Request) {
  try {
    const leads = await prisma.vendorLead.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const headers = [
      "ID",
      "Application ID",
      "Full Name",
      "Mobile",
      "Alternate Phone",
      "Email",
      "State",
      "City",
      "Pincode",
      "Proposed Address",
      "Space Status",
      "Carpet Area",
      "Preferred Package",
      "Package Name",
      "Investment Budget",
      "Finance Required",
      "Loan Assistance",
      "Current Profession",
      "Has Experience",
      "Message",
      "Source",
      "Status",
      "Admin Notes",
      "Created At",
      "Updated At",
    ];

    const rows = leads.map((lead: any) => [
      lead.id,
      lead.applicationId,
      lead.fullName,
      lead.mobile,
      lead.alternatePhone,
      lead.email,
      lead.state,
      lead.city,
      lead.pincode,
      lead.proposedAddress,
      lead.spaceStatus,
      lead.carpetArea,
      lead.preferredPackage,
      lead.packageName,
      lead.investmentBudget,
      lead.financeRequired,
      lead.loanAssistance,
      lead.currentProfession,
      lead.hasExperience,
      lead.message,
      lead.source,
      lead.status,
      lead.adminNotes,
      lead.createdAt.toISOString(),
      lead.updatedAt.toISOString(),
    ]);

    const csvData = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row: any[]) => row.map(escapeCsv).join(",")),
    ].join("\r\n");

    const filename = `broomboom-vendor-leads-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

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
      {
        success: false,
        error: "Failed to export leads to CSV",
      },
      { status: 500 }
    );
  }
}