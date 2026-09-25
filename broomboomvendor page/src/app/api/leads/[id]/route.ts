import prisma from "@/lib/prisma";
import { handleOptions, jsonResponse } from "@/lib/cors";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const lead = await prisma.vendorLead.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!lead) {
      return jsonResponse(
        { success: false, error: "Lead not found" },
        404
      );
    }

    return jsonResponse({
      success: true,
      lead,
    });
  } catch (error) {
    console.error("[API ERROR] Failed to fetch lead:", error);

    return jsonResponse(
      { success: false, error: "Failed to fetch lead" },
      500
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const allowedFields = [
      "fullName",
      "mobile",
      "alternatePhone",
      "email",
      "state",
      "city",
      "pincode",
      "proposedAddress",
      "spaceStatus",
      "carpetArea",
      "preferredPackage",
      "packageName",
      "investmentBudget",
      "financeRequired",
      "loanAssistance",
      "currentProfession",
      "hasExperience",
      "message",
      "source",
      "status",
      "adminNotes",
    ];

    const data: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        data[field] = body[field];
      }
    }

    const updated = await prisma.vendorLead.update({
      where: {
        id: params.id,
      },
      data,
    });

    return jsonResponse({
      success: true,
      lead: updated,
    });
  } catch (error: any) {
    console.error("[API ERROR] Failed to update lead:", error);

    if (error?.code === "P2025") {
      return jsonResponse(
        { success: false, error: "Lead not found" },
        404
      );
    }

    return jsonResponse(
      { success: false, error: "Failed to update lead" },
      500
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.vendorLead.delete({
      where: {
        id: params.id,
      },
    });

    return jsonResponse({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error: any) {
    console.error("[API ERROR] Failed to delete lead:", error);

    if (error?.code === "P2025") {
      return jsonResponse(
        { success: false, error: "Lead not found" },
        404
      );
    }

    return jsonResponse(
      { success: false, error: "Failed to delete lead" },
      500
    );
  }
}