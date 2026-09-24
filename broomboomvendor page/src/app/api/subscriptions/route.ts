import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleOptions } from "@/lib/cors";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("order_id");
    const subscriptionId = searchParams.get("subscription_id");
    const applicationId = searchParams.get("applicationId");

    // Single subscription lookup
    if (orderId || subscriptionId || applicationId) {
      const subscription = await prisma.vendorSubscription.findFirst({
        where: {
          OR: [
            ...(orderId ? [{ orderId }] : []),
            ...(subscriptionId ? [{ subscriptionId }] : []),
            ...(applicationId ? [{ applicationId }] : []),
          ],
        },
        orderBy: { createdAt: "desc" },
      });

      if (!subscription) {
        return NextResponse.json(
          { success: false, error: "Subscription record not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        subscription,
      });
    }

    // List recent subscriptions
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const subscriptions = await prisma.vendorSubscription.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      count: subscriptions.length,
      subscriptions,
    });
  } catch (error: any) {
    console.error("[API ERROR /api/subscriptions]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

