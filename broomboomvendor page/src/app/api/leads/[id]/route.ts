import { db } from "@/lib/db";
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
    const lead = db.leads.getById(params.id);
    if (!lead) {
      return jsonResponse({ success: false, error: "Lead not found" }, 404);
    }
    return jsonResponse({ success: true, lead });
  } catch (error) {
    return jsonResponse({ success: false, error: "Failed to fetch lead" }, 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = db.leads.update(params.id, body);
    if (!updated) {
      return jsonResponse({ success: false, error: "Lead not found" }, 404);
    }
    return jsonResponse({ success: true, lead: updated });
  } catch (error) {
    return jsonResponse({ success: false, error: "Failed to update lead" }, 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = db.leads.delete(params.id);
    if (!deleted) {
      return jsonResponse({ success: false, error: "Lead not found" }, 404);
    }
    return jsonResponse({ success: true, message: "Lead deleted successfully" });
  } catch (error) {
    return jsonResponse({ success: false, error: "Failed to delete lead" }, 500);
  }
}

