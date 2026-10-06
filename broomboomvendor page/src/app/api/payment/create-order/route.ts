import { NextResponse } from "next/server";
import { createCashfreeOrder, getCashfreeMode } from "@/lib/cashfree";
import prisma from "@/lib/prisma";
import { handleOptions } from "@/lib/cors";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function OPTIONS() {
  return handleOptions();
}

const PACKAGE_PRICES: Record<string, { amount: number; name: string; originalPrice: string; discountedPrice: string }> = {
  silver: {
    amount: 5000,
    name: "Silver Partner (Booking Kiosk)",
    originalPrice: "₹20,000",
    discountedPrice: "₹5,000",
  },
  gold: {
    amount: 10000,
    name: "Gold Partner (District Exclusive Hub)",
    originalPrice: "₹40,000",
    discountedPrice: "₹10,000",
  },
  platinum: {
    amount: 20000,
    name: "Platinum Partner (Regional Master Hub)",
    originalPrice: "₹1,00,000",
    discountedPrice: "₹20,000",
  },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      applicationId,
      packageId = "gold",
      fullName = "Valued Partner",
      mobile = "9999999999",
      email = "support@broomboomcabs.com",
      city = "India",
    } = body;

    const pkgKey = (packageId || "gold").toLowerCase();
    const pkg = PACKAGE_PRICES[pkgKey] || PACKAGE_PRICES.gold;

    // Generate unique order ID
    const cleanAppId = (applicationId || "BB-VENDOR").replace(/[^a-zA-Z0-9]/g, "_");
    const uniqueSuffix = Date.now().toString().slice(-6);
    const orderId = `${cleanAppId}_${uniqueSuffix}`.slice(0, 45);

    // Price & Charges Calculation: Base + 3% Gateway Fee + 5% GST
    const baseAmount = pkg.amount;
    const gatewayFee = Math.round(baseAmount * 0.03); // 3% Gateway Fee
    const gstFee = Math.round(baseAmount * 0.05);     // 5% GST
    const totalAmount = baseAmount + gatewayFee + gstFee;

    // Resolve base application URL for return redirect
    const origin = request.headers.get("origin") || (request.headers.get("referer") ? new URL(request.headers.get("referer")!).origin : null);
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    const appUrl = origin || `${protocol}://${host}` || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const returnUrl = `${appUrl}/api/payment/callback?order_id={order_id}&applicationId=${encodeURIComponent(
      applicationId || ""
    )}&pkg=${encodeURIComponent(pkgKey)}`;

    // Create Cashfree Order with all charges added directly
    const result = await createCashfreeOrder({
      orderId,
      orderAmount: totalAmount,
      orderCurrency: "INR",
      customerId: (mobile || "cust_vendor").replace(/[^0-9]/g, "") || "cust_vendor",
      customerName: fullName,
      customerEmail: email || "support@broomboomcabs.com",
      customerPhone: mobile,
      returnUrl,
      orderNote: `BroomBoom ${pkg.name} | Base: ₹${baseAmount.toLocaleString('en-IN')} + 3% Gateway Fee: ₹${gatewayFee.toLocaleString('en-IN')} + 5% GST: ₹${gstFee.toLocaleString('en-IN')} | Total: ₹${totalAmount.toLocaleString('en-IN')}`,
      orderTags: {
        package: pkgKey,
        base_amount: String(baseAmount),
        gateway_fee_3_percent: String(gatewayFee),
        gst_5_percent: String(gstFee),
        total_amount: String(totalAmount),
      },
      cartDetails: {
        cart_items: [
          {
            item_name: pkg.name,
            item_price: baseAmount,
            item_quantity: 1,
          },
          {
            item_name: "Payment Gateway Fee (3%)",
            item_price: gatewayFee,
            item_quantity: 1,
          },
          {
            item_name: "Government GST (5%)",
            item_price: gstFee,
            item_quantity: 1,
          },
        ],
      },
    });

    if (!result.success || !result.data) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to initiate Cashfree payment session",
        },
        { status: 500 }
      );
    }

    // Fetch lead record if exists to fill in accurate vendor details
    let leadRecord: any = null;
    if (applicationId) {
      try {
        leadRecord = await prisma.vendorLead.findFirst({
          where: {
            OR: [
              { applicationId },
              { applicationId: { contains: applicationId, mode: "insensitive" } },
            ],
          },
        });
      } catch (err) {
        console.warn("[FIND LEAD WARN]", err);
      }
    }

    const finalVendorName = fullName || leadRecord?.fullName || "Valued Partner";
    const finalMobile = mobile || leadRecord?.mobile || "9999999999";
    const finalEmail = email || leadRecord?.email || "support@broomboomcabs.com";
    const finalCity = city || leadRecord?.city || "India";
    const finalState = leadRecord?.state || null;

    const territoryScope =
      pkgKey === "silver"
        ? "Local Ward / Pin Code Hub"
        : pkgKey === "gold"
        ? "Exclusive District Hub"
        : "State / Regional Master Territory";
    const hasExclusivity = pkgKey !== "silver";

    const subscriptionId = `SUB-BB-2026-${Date.now().toString().slice(-6)}`;
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

    // Save/Upsert VendorSubscription in PostgreSQL via Prisma
    let subscriptionRecord: any = null;
    try {
      subscriptionRecord = await prisma.vendorSubscription.upsert({
        where: { orderId: result.data.orderId },
        update: {
          subscriptionId,
          applicationId: applicationId || leadRecord?.applicationId || "BB-VENDOR",
          vendorName: finalVendorName,
          vendorMobile: finalMobile,
          vendorEmail: finalEmail,
          city: finalCity,
          state: finalState,
          planTier: pkgKey,
          planName: pkg.name,
          territoryScope,
          hasExclusivity,
          paymentSessionId: result.data.paymentSessionId,
          cfOrderId: result.data.cfOrderId,
          baseAmount,
          gatewayFee,
          gstAmount: gstFee,
          totalAmount,
          paymentStatus: "ACTIVE",
          status: "pending",
          endDate: oneYearLater,
          adminNotes: `Cashfree order initiated: Base ₹${baseAmount} + 3% GW ₹${gatewayFee} + 5% GST ₹${gstFee} = ₹${totalAmount}`,
        },
        create: {
          subscriptionId,
          applicationId: applicationId || leadRecord?.applicationId || "BB-VENDOR",
          vendorName: finalVendorName,
          vendorMobile: finalMobile,
          vendorEmail: finalEmail,
          city: finalCity,
          state: finalState,
          planTier: pkgKey,
          planName: pkg.name,
          territoryScope,
          hasExclusivity,
          orderId: result.data.orderId,
          cfOrderId: result.data.cfOrderId,
          paymentSessionId: result.data.paymentSessionId,
          baseAmount,
          gatewayFee,
          gstAmount: gstFee,
          totalAmount,
          paymentStatus: "ACTIVE",
          status: "pending",
          endDate: oneYearLater,
          adminNotes: `Cashfree order initiated: Base ₹${baseAmount} + 3% GW ₹${gatewayFee} + 5% GST ₹${gstFee} = ₹${totalAmount}`,
        },
      });
      console.log(`[DB SUCCESS] VendorSubscription recorded: ${subscriptionRecord.subscriptionId} for order ${orderId}`);
    } catch (subErr) {
      console.error("[DB VENDOR SUBSCRIPTION ERROR]", subErr);
    }

    // Attempt to annotate VendorLead in database if exists
    if (applicationId) {
      try {
        await prisma.vendorLead.updateMany({
          where: { applicationId },
          data: {
            adminNotes: `Cashfree order: ${orderId} | Subscription: ${subscriptionId} | Base: ₹${baseAmount} + 3% GW: ₹${gatewayFee} + 5% GST: ₹${gstFee} = Total: ₹${totalAmount} (Status: ACTIVE)`,
          },
        });
      } catch (dbErr) {
        console.warn("[DB NOTE UPDATE SKIP]", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: result.data.orderId,
      cfOrderId: result.data.cfOrderId,
      paymentSessionId: result.data.paymentSessionId,
      subscriptionId: subscriptionRecord?.subscriptionId || subscriptionId,
      amount: totalAmount,
      baseAmount: baseAmount,
      gatewayFee: gatewayFee,
      gstFee: gstFee,
      totalAmount: totalAmount,
      packageName: pkg.name,
      originalPrice: pkg.originalPrice,
      discountedPrice: pkg.discountedPrice,
      mode: getCashfreeMode(),
    });
  } catch (err: any) {
    console.error("[API ERROR /api/payment/create-order]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

