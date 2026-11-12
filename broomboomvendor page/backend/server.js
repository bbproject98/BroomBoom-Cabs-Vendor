const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

// Load .env from root or local directory
dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;

// Middlewares
app.use(cors({ origin: "*" }));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    // Quick DB ping
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      service: "BroomBoom Vendor Express API",
      database: "PostgreSQL (Connected via Prisma)",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      service: "BroomBoom Vendor Express API",
      database: "PostgreSQL Connection Error",
      error: error.message,
    });
  }
});

// CREATE VENDOR LEAD (POST /api/leads or POST /api/apply)
const handleCreateLead = async (req, res) => {
  try {
    const body = req.body;
    if (!body.fullName || !body.mobile) {
      return res.status(400).json({
        success: false,
        error: "fullName, mobile, and city are required fields.",
      });
    }

    const serial = Math.floor(1000 + Math.random() * 9000);
    const applicationId = body.applicationId || `BB-VENDOR-2026-${serial}`;
    const preferredPackage = body.preferredPackage || body.selectedPackage || "gold";

    const packageName =
      body.packageName ||
      (preferredPackage === "silver"
        ? "Silver Partner (Booking Kiosk — ₹5,000)"
        : preferredPackage === "gold"
        ? "Gold Partner (District Exclusive Hub — ₹10,000)"
        : preferredPackage === "platinum"
        ? "Platinum Partner (Regional Master Hub — ₹20,000)"
        : "Custom Vendor Inquiry");

    let investmentBudget = body.investmentBudget;
    if (
      !investmentBudget ||
      investmentBudget === "Flexible" ||
      (preferredPackage === "silver" && investmentBudget.includes("Gold")) ||
      (preferredPackage === "platinum" && investmentBudget.includes("Gold")) ||
      (preferredPackage === "gold" && investmentBudget.includes("Silver"))
    ) {
      investmentBudget =
        preferredPackage === "silver"
          ? "₹5,000 (Silver Partner - 50% OFF Exclusive Deal)"
          : preferredPackage === "platinum"
          ? "₹20,000 (Platinum Package - 50% OFF Exclusive Deal)"
          : "₹10,000 (Gold Package - 50% OFF Exclusive Deal)";
    }

    let carpetArea = body.carpetArea;
    if (
      !carpetArea ||
      (preferredPackage === "silver" && carpetArea.includes("Gold")) ||
      (preferredPackage === "platinum" && carpetArea.includes("Gold")) ||
      (preferredPackage === "gold" && carpetArea.includes("Silver"))
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
        alternatePhone: body.alternatePhone?.trim() || null,
        email: body.email?.trim() || null,
        state: body.state?.trim() || null,
        city: (body.city && body.city.trim()) || "Kolkata",
        pincode: body.pincode?.trim() || null,
        proposedAddress: body.proposedAddress?.trim() || null,
        spaceStatus: body.spaceStatus || null,
        carpetArea,
        preferredPackage,
        packageName,
        investmentBudget,
        financeRequired: body.financeRequired || "Self-Funded / Ready Capital",
        loanAssistance: body.loanAssistance || "No (Self-Funded)",
        currentProfession: body.currentProfession || null,
        hasExperience: body.hasExperience || null,
        message: body.message || null,
        source: body.source || "backend_api",
        status: "new",
        adminNotes: body.adminNotes || "Received via BroomBoom backend REST API.",
      },
    });

    console.log(`[BACKEND DB] Created Lead: ${lead.applicationId} - ${lead.fullName}`);

    res.status(201).json({
      success: true,
      message: "Lead recorded successfully in PostgreSQL via Prisma.",
      data: lead,
    });
  } catch (error) {
    console.error("[BACKEND DB ERROR] Failed to create lead:", error);
    res.status(500).json({
      success: false,
      error: "Failed to store lead in PostgreSQL database.",
      details: error.message,
    });
  }
};

app.post("/api/leads", handleCreateLead);
app.post("/api/apply", handleCreateLead);

// GET ALL LEADS (with query filtering)
app.get("/api/leads", async (req, res) => {
  try {
    const { status, package: pkg, query, limit = 50, offset = 0 } = req.query;
    const where = {};

    if (status) where.status = status;
    if (pkg) where.preferredPackage = pkg;
    if (query) {
      where.OR = [
        { fullName: { contains: query, mode: "insensitive" } },
        { mobile: { contains: query } },
        { city: { contains: query, mode: "insensitive" } },
        { applicationId: { contains: query, mode: "insensitive" } },
      ];
    }

    const [leads, total] = await Promise.all([
      prisma.vendorLead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: parseInt(limit, 10),
        skip: parseInt(offset, 10),
      }),
      prisma.vendorLead.count({ where }),
    ]);

    res.json({
      success: true,
      total,
      leads,
    });
  } catch (error) {
    console.error("[BACKEND DB ERROR] Failed to fetch leads:", error);
    res.status(500).json({ success: false, error: "Failed to fetch leads" });
  }
});

// GET SINGLE LEAD BY ID
app.get("/api/leads/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await prisma.vendorLead.findFirst({
      where: {
        OR: [{ id }, { applicationId: id }],
      },
    });

    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found" });
    }

    res.json({ success: true, lead });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch lead" });
  }
});

// UPDATE LEAD STATUS / NOTES
app.patch("/api/leads/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const data = {};
    if (status) data.status = status;
    if (adminNotes !== undefined) data.adminNotes = adminNotes;

    const updated = await prisma.vendorLead.update({
      where: { id },
      data,
    });

    res.json({ success: true, lead: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to update lead" });
  }
});

// BROCHURE DOWNLOADS
app.post("/api/brochure", async (req, res) => {
  try {
    const { name, mobile, city } = req.body;
    if (!name || !mobile) {
      return res.status(400).json({ success: false, error: "name and mobile required." });
    }

    const download = await prisma.brochureDownload.create({
      data: {
        name: name.trim(),
        mobile: mobile.trim(),
        city: city?.trim() || "Unspecified",
      },
    });

    res.status(201).json({ success: true, data: download });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to log brochure download" });
  }
});

app.get("/api/brochure", async (req, res) => {
  try {
    const brochures = await prisma.brochureDownload.findMany({
      orderBy: { downloadedAt: "desc" },
    });
    res.json({ success: true, total: brochures.length, brochures });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch brochure downloads" });
  }
});

// CASHFREE PAYMENT INTEGRATION
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || "";
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || "";
const CASHFREE_ENV = (process.env.CASHFREE_ENV || "sandbox").toLowerCase();
const CASHFREE_BASE_URL =
  CASHFREE_ENV === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

const PACKAGE_PRICES = {
  silver: { amount: 5000, name: "Silver Partner (Booking Kiosk — ₹5,000)", original: "₹20,000", discounted: "₹5,000" },
  gold: { amount: 10000, name: "Gold Partner (District Exclusive Hub — ₹10,000)", original: "₹40,000", discounted: "₹10,000" },
  platinum: { amount: 20000, name: "Platinum Partner (Regional Master Hub — ₹20,000)", original: "₹1,00,000", discounted: "₹20,000" },
};

app.post("/api/payment/create-order", async (req, res) => {
  try {
    const {
      applicationId,
      packageId = "gold",
      fullName = "Valued Partner",
      mobile = "9999999999",
      email = "vendor@broomboom.com",
    } = req.body;

    const pkgKey = (packageId || "gold").toLowerCase();
    const pkg = PACKAGE_PRICES[pkgKey] || PACKAGE_PRICES.gold;
    const cleanAppId = (applicationId || "BB-VENDOR").replace(/[^a-zA-Z0-9]/g, "_");
    const uniqueSuffix = Date.now().toString().slice(-6);
    const orderId = `${cleanAppId}_${uniqueSuffix}`.slice(0, 45);

    // Price & Charges Calculation: Base + 3% Gateway Fee + 5% GST
    const baseAmount = pkg.amount;
    const gatewayFee = Math.round(baseAmount * 0.03); // 3% Gateway Fee
    const gstFee = Math.round(baseAmount * 0.05);     // 5% GST
    const totalAmount = baseAmount + gatewayFee + gstFee;

    const origin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : null);
    const host = req.headers.host || "localhost:3000";
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    const appUrl = origin || `${protocol}://${host}` || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const returnUrl = `${appUrl}/api/payment/callback?order_id={order_id}&applicationId=${encodeURIComponent(
      applicationId || ""
    )}&pkg=${encodeURIComponent(pkgKey)}`;

    const cfPayload = {
      order_id: orderId,
      order_amount: totalAmount,
      order_currency: "INR",
      customer_details: {
        customer_id: (mobile || "cust_vendor").replace(/[^0-9]/g, "") || "cust_vendor",
        customer_name: fullName.trim().slice(0, 50),
        customer_email: email.trim(),
        customer_phone: mobile.replace(/[^0-9]/g, "").slice(-10),
      },
      order_meta: {
        return_url: returnUrl,
      },
      order_note: `BroomBoom ${pkg.name} | Base: ₹${baseAmount.toLocaleString('en-IN')} + 3% Gateway Fee: ₹${gatewayFee.toLocaleString('en-IN')} + 5% GST: ₹${gstFee.toLocaleString('en-IN')} | Total: ₹${totalAmount.toLocaleString('en-IN')}`,
      order_tags: {
        package: pkgKey,
        base_amount: String(baseAmount),
        gateway_fee_3_percent: String(gatewayFee),
        gst_5_percent: String(gstFee),
        total_amount: String(totalAmount),
      },
      cart_details: {
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
            item_name: "Goods & Services Tax (5% GST)",
            item_price: gstFee,
            item_quantity: 1,
          },
        ],
      },
    };

    const cfRes = await fetch(`${CASHFREE_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": CASHFREE_APP_ID,
        "x-client-secret": CASHFREE_SECRET_KEY,
        "x-api-version": "2023-08-01",
      },
      body: JSON.stringify(cfPayload),
    });

    const data = await cfRes.json();

    if (!cfRes.ok) {
      console.error("[CASHFREE ERROR - BACKEND]", data);
      return res.status(cfRes.status).json({ success: false, error: data.message || "Cashfree error" });
    }

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

    let subscriptionRecord = null;
    try {
      subscriptionRecord = await prisma.vendorSubscription.upsert({
        where: { orderId: data.order_id },
        update: {
          subscriptionId,
          applicationId: applicationId || "BB-VENDOR",
          vendorName: fullName,
          vendorMobile: mobile,
          vendorEmail: email,
          city: "India",
          planTier: pkgKey,
          planName: pkg.name,
          territoryScope,
          hasExclusivity,
          paymentSessionId: data.payment_session_id,
          cfOrderId: data.cf_order_id,
          baseAmount,
          gatewayFee,
          gstAmount: gstFee,
          totalAmount,
          paymentStatus: "ACTIVE",
          status: "pending",
          endDate: oneYearLater,
          adminNotes: `Order created via Express backend: Base ₹${baseAmount} + 3% GW ₹${gatewayFee} + 5% GST ₹${gstFee}`,
        },
        create: {
          subscriptionId,
          applicationId: applicationId || "BB-VENDOR",
          vendorName: fullName,
          vendorMobile: mobile,
          vendorEmail: email,
          city: "India",
          planTier: pkgKey,
          planName: pkg.name,
          territoryScope,
          hasExclusivity,
          orderId: data.order_id,
          cfOrderId: data.cf_order_id,
          paymentSessionId: data.payment_session_id,
          baseAmount,
          gatewayFee,
          gstAmount: gstFee,
          totalAmount,
          paymentStatus: "ACTIVE",
          status: "pending",
          endDate: oneYearLater,
          adminNotes: `Order created via Express backend: Base ₹${baseAmount} + 3% GW ₹${gatewayFee} + 5% GST ₹${gstFee}`,
        },
      });
      console.log(`[BACKEND DB] VendorSubscription recorded: ${subscriptionRecord.subscriptionId}`);
    } catch (subErr) {
      console.error("[BACKEND DB SUBSCRIPTION ERROR]", subErr.message);
    }

    if (applicationId) {
      try {
        await prisma.vendorLead.updateMany({
          where: { applicationId },
          data: {
            adminNotes: `Cashfree order: ${orderId} | Subscription: ${subscriptionId} | Base: ₹${baseAmount} + 3% GW: ₹${gatewayFee} + 5% GST: ₹${gstFee} = Total: ₹${totalAmount} (Status: ACTIVE)`,
          },
        });
      } catch (e) {}
    }

    res.json({
      success: true,
      orderId: data.order_id,
      cfOrderId: data.cf_order_id,
      paymentSessionId: data.payment_session_id,
      subscriptionId: subscriptionRecord?.subscriptionId || subscriptionId,
      amount: totalAmount,
      baseAmount: baseAmount,
      gatewayFee: gatewayFee,
      gstFee: gstFee,
      totalAmount: totalAmount,
      packageName: pkg.name,
      originalPrice: pkg.original,
      discountedPrice: pkg.discounted,
      mode: CASHFREE_ENV,
    });
  } catch (error) {
    console.error("[BACKEND PAYMENT ERROR]", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/payment/verify", async (req, res) => {
  try {
    const { order_id, applicationId } = req.query;
    if (!order_id) {
      return res.status(400).json({ success: false, error: "order_id required" });
    }

    const cfRes = await fetch(`${CASHFREE_BASE_URL}/orders/${encodeURIComponent(order_id)}`, {
      headers: {
        "Content-Type": "application/json",
        "x-client-id": CASHFREE_APP_ID,
        "x-client-secret": CASHFREE_SECRET_KEY,
        "x-api-version": "2023-08-01",
      },
    });

    const data = await cfRes.json();
    if (!cfRes.ok) {
      return res.status(cfRes.status).json({ success: false, error: data.message || "Failed to fetch order" });
    }

    const isPaid = data.order_status === "PAID";
    const targetAppId = applicationId || (order_id.includes("_") ? order_id.split("_")[0] : null);

    if (targetAppId) {
      try {
        await prisma.vendorLead.updateMany({
          where: { applicationId: targetAppId },
          data: {
            status: isPaid ? "payment_completed" : "payment_pending",
            adminNotes: `Cashfree Order: ${order_id} | Status: ${data.order_status} | Amount: ₹${data.order_amount}`,
          },
        });
      } catch (e) {}
    }

    let subscription = null;
    try {
      const existingSub = await prisma.vendorSubscription.findFirst({
        where: {
          OR: [
            { orderId: data.order_id },
            ...(targetAppId ? [{ applicationId: targetAppId }] : []),
          ],
        },
      });

      if (existingSub) {
        subscription = await prisma.vendorSubscription.update({
          where: { id: existingSub.id },
          data: {
            status: isPaid ? "active" : "pending",
            paymentStatus: data.order_status,
            cfOrderId: data.cf_order_id,
            paidAt: isPaid ? new Date() : existingSub.paidAt,
            adminNotes: `Verified on ${new Date().toISOString()} via backend`,
          },
        });
      }
    } catch (e) {
      console.warn("[BACKEND DB SUB VERIFY WARN]", e.message);
    }

    res.json({
      success: true,
      orderId: data.order_id,
      cfOrderId: data.cf_order_id,
      orderStatus: data.order_status,
      orderAmount: data.order_amount,
      orderCurrency: data.order_currency,
      customerDetails: data.customer_details,
      createdAt: data.created_at,
      isPaid,
      applicationId: targetAppId,
      subscription,
    });
  } catch (error) {
    console.error("[BACKEND PAYMENT VERIFY ERROR]", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// CASHFREE RETURN CALLBACK HANDLER
app.get("/api/payment/callback", async (req, res) => {
  try {
    const { order_id, applicationId, pkg = "gold" } = req.query;
    const origin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : null);
    const host = req.headers.host || "localhost:3000";
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    const appUrl = origin || `${protocol}://${host}` || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!order_id) {
      return res.redirect(`${appUrl}/apply?package=${pkg}`);
    }

    const cfRes = await fetch(`${CASHFREE_BASE_URL}/orders/${encodeURIComponent(order_id)}`, {
      headers: {
        "Content-Type": "application/json",
        "x-client-id": CASHFREE_APP_ID,
        "x-client-secret": CASHFREE_SECRET_KEY,
        "x-api-version": "2023-08-01",
      },
    });

    const data = await cfRes.json();
    if (!cfRes.ok || data.order_status !== "PAID") {
      // PAYMENT PENDING / FAILED: Redirect directly back to apply page (NEVER show thankyou page)
      const failureStatus = (data?.order_status || "failed").toLowerCase();
      return res.redirect(`${appUrl}/apply?package=${pkg}&applicationId=${encodeURIComponent(applicationId || "")}&payment_status=${failureStatus}&order_id=${encodeURIComponent(order_id)}`);
    }

    // PAYMENT SUCCESS: Update DB and redirect ONLY on success to thankyou page
    const targetAppId = applicationId || (order_id.includes("_") ? order_id.split("_")[0] : null);
    if (targetAppId) {
      try {
        await prisma.vendorLead.updateMany({
          where: { applicationId: targetAppId },
          data: { status: "payment_completed" },
        });
      } catch (e) {}
    }

    try {
      await prisma.vendorSubscription.updateMany({
        where: { orderId: order_id },
        data: { status: "active", paymentStatus: "PAID", paidAt: new Date() },
      });
    } catch (e) {}

    return res.redirect(`${appUrl}/thank-you?order_id=${encodeURIComponent(order_id)}&applicationId=${encodeURIComponent(applicationId || "")}&status=success`);
  } catch (error) {
    console.error("[BACKEND CALLBACK ERROR]", error);
    res.redirect("/apply?payment_status=error");
  }
});

// SUBSCRIPTIONS API
app.get("/api/subscriptions", async (req, res) => {
  try {
    const { order_id, subscription_id, applicationId, limit = 50 } = req.query;
    if (order_id || subscription_id || applicationId) {
      const subscription = await prisma.vendorSubscription.findFirst({
        where: {
          OR: [
            ...(order_id ? [{ orderId: order_id }] : []),
            ...(subscription_id ? [{ subscriptionId: subscription_id }] : []),
            ...(applicationId ? [{ applicationId }] : []),
          ],
        },
        orderBy: { createdAt: "desc" },
      });

      if (!subscription) {
        return res.status(404).json({ success: false, error: "Subscription not found" });
      }
      return res.json({ success: true, subscription });
    }

    const subscriptions = await prisma.vendorSubscription.findMany({
      orderBy: { createdAt: "desc" },
      take: parseInt(limit, 10),
    });

    res.json({ success: true, count: subscriptions.length, subscriptions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// ==========================================
// BOOKINGS & LIVE VENDOR DISPATCH ENGINE
// Strict Plan-Wise Proximity Matching & Cascading
// ==========================================

function cleanString(str) {
  return (str || "").trim().toLowerCase();
}


function classifyBookingByPlan(data) {
  const p = cleanString(data.pickup);
  const d = cleanString(data.drop);
  const v = cleanString(data.vehicleCategory);
  const explicitType = cleanString(data.bookingType);
  const explicitTier = cleanString(data.planTier);

  // 1. TOUR PACKAGES & CORPORATE RIDES -> PLATINUM REGIONAL MASTER (0% Commission)
  if (
    explicitType === "tour_package" ||
    explicitType.includes("tour") ||
    explicitType === "corporate_ride" ||
    explicitType.includes("corporate") ||
    p.includes("tour") || d.includes("tour") ||
    p.includes("corporate") || d.includes("corporate") ||
    p.includes("digha") || d.includes("digha") ||
    p.includes("puri") || d.includes("puri") ||
    p.includes("darjeeling") || d.includes("darjeeling") ||
    p.includes("sundarban") || d.includes("sundarban") ||
    v.includes("vip") || v.includes("luxury")
  ) {
    const isTour = explicitType.includes("tour") || p.includes("tour") || d.includes("tour") || p.includes("digha") || d.includes("digha") || p.includes("puri") || d.includes("puri") || p.includes("darjeeling") || d.includes("darjeeling");
    return {
      planTier: "platinum",
      bookingType: isTour ? "tour_package" : "corporate_ride",
      bookingTypeLabel: isTour ? "🏖️ Tour Package (Regional Master)" : "💼 Corporate Ride (Regional Master)",
      commissionRate: 0,
      tierScopeLabel: "Regional Master Hub (0% Commission SLA)",
      inclusionsMatched: isTour ? "Tour Packages (0% Platform Fee)" : "Corporate Rides & Luxury Master Fleet (0% Platform Fee)",
    };
  }

  // 2. SHORT RENTALS (1h 10km, 3h 30km, 5h 50km) -> SILVER PARTNER (WARD KIOSK)
  if (
    explicitType === "rental_1hr_10km" ||
    explicitType === "rental_3hr_30km" ||
    explicitType === "rental_5hr_50km" ||
    explicitType === "short_rental" ||
    p.includes("1 hour") || p.includes("10 km") || p.includes("1 hr") ||
    p.includes("3 hour") || p.includes("30 km") || p.includes("3 hr") ||
    p.includes("5 hour") || p.includes("50 km") || p.includes("5 hr")
  ) {
    let subType = "rental_3hr_30km";
    let subLabel = "⏱️ Rental (3 Hours / 30 Kms)";
    if (explicitType.includes("1hr") || p.includes("1 hour") || p.includes("10 km") || p.includes("1 hr")) {
      subType = "rental_1hr_10km";
      subLabel = "⏱️ Rental (1 Hour / 10 Kms)";
    } else if (explicitType.includes("5hr") || p.includes("5 hour") || p.includes("50 km") || p.includes("5 hr")) {
      subType = "rental_5hr_50km";
      subLabel = "⏱️ Rental (5 Hours / 50 Kms)";
    }
    return {
      planTier: "silver",
      bookingType: subType,
      bookingTypeLabel: subLabel,
      commissionRate: 15,
      tierScopeLabel: "Ward Level Kiosk (15-20% Commission)",
      inclusionsMatched: `Rental (${subLabel})`,
    };
  }

  // 3. LONG RENTALS (08h 80km, 10h 100km, 12h 120km) -> GOLD PARTNER (DISTRICT EXCLUSIVE)
  if (
    explicitType === "rental_8hr_80km" ||
    explicitType === "rental_10hr_100km" ||
    explicitType === "rental_12hr_120km" ||
    explicitType === "long_rental" ||
    p.includes("8 hour") || p.includes("80 km") || p.includes("8 hr") ||
    p.includes("10 hour") || p.includes("100 km") || p.includes("10 hr") ||
    p.includes("12 hour") || p.includes("120 km") || p.includes("12 hr")
  ) {
    let subType = "rental_8hr_80km";
    let subLabel = "⏱️ Rental (08 Hours / 80 Kms)";
    if (explicitType.includes("10hr") || p.includes("10 hour") || p.includes("100 km") || p.includes("10 hr")) {
      subType = "rental_10hr_100km";
      subLabel = "⏱️ Rental (10 Hours / 100 Kms)";
    } else if (explicitType.includes("12hr") || p.includes("12 hour") || p.includes("120 km") || p.includes("12 hr")) {
      subType = "rental_12hr_120km";
      subLabel = "⏱️ Rental (12 Hours / 120 Kms)";
    }
    const isPlat = explicitTier === "platinum";
    return {
      planTier: isPlat ? "platinum" : "gold",
      bookingType: subType,
      bookingTypeLabel: subLabel,
      commissionRate: isPlat ? 0 : 10,
      tierScopeLabel: isPlat ? "Regional Master Hub (0% Commission SLA)" : "District Exclusive Hub (10-15% Commission)",
      inclusionsMatched: `Rental (${subLabel})`,
    };
  }

  // 4. OUTSTATION (ONEWAY & ROUNDTRIP) -> GOLD PARTNER (DISTRICT EXCLUSIVE)
  if (
    explicitType === "outstation_oneway" ||
    explicitType === "outstation_roundtrip" ||
    explicitType === "outstation" ||
    p.includes("outstation") || d.includes("outstation") ||
    p.includes("roundtrip") || d.includes("roundtrip") ||
    p.includes("oneway") || d.includes("oneway") ||
    p.includes("burdwan") || d.includes("burdwan") ||
    p.includes("durgapur") || d.includes("durgapur") ||
    p.includes("asansol") || d.includes("asansol") ||
    p.includes("kharagpur") || d.includes("kharagpur")
  ) {
    const isRound = explicitType.includes("round") || p.includes("roundtrip") || d.includes("roundtrip");
    const subType = isRound ? "outstation_roundtrip" : "outstation_oneway";
    const subLabel = isRound ? "🔄 Outstation (Roundtrip)" : "🚗 Outstation (Oneway)";
    const isPlat = explicitTier === "platinum";
    return {
      planTier: isPlat ? "platinum" : "gold",
      bookingType: subType,
      bookingTypeLabel: subLabel,
      commissionRate: isPlat ? 0 : 10,
      tierScopeLabel: isPlat ? "Regional Master Hub (0% Commission SLA)" : "District Exclusive Hub (10-15% Commission)",
      inclusionsMatched: `Outstation (${subLabel})`,
    };
  }

  // 5. AIRPORT & STATION TRANSFERS -> SILVER PARTNER (WARD KIOSK)
  if (
    explicitType === "airport_transfer" ||
    p.includes("airport") || d.includes("airport") ||
    p.includes("terminal") || d.includes("terminal")
  ) {
    return {
      planTier: "silver",
      bookingType: "airport_transfer",
      bookingTypeLabel: "✈️ Airport Transfer Ride",
      commissionRate: 15,
      tierScopeLabel: "Ward Level Kiosk (Airport & Station Hub)",
      inclusionsMatched: "Airport transfer rides (1-5 Cabs, 15-20% commission)",
    };
  }

  if (
    explicitType === "station_transfer" ||
    p.includes("station") || d.includes("station") ||
    p.includes("howrah") || d.includes("howrah") ||
    p.includes("sealdah") || d.includes("sealdah") ||
    p.includes("kiosk") || d.includes("kiosk") ||
    p.includes("railway") || d.includes("railway")
  ) {
    return {
      planTier: "silver",
      bookingType: "station_transfer",
      bookingTypeLabel: "🚆 Station Transfer Ride",
      commissionRate: 15,
      tierScopeLabel: "Ward Level Kiosk (Airport & Station Hub)",
      inclusionsMatched: "Station Transfer Rides (1-5 Cabs, 15-20% commission)",
    };
  }

  // 6. DEFAULT HEURISTICS (based on explicit tier or distance)
  if (explicitTier === "silver") {
    return {
      planTier: "silver",
      bookingType: "rental_3hr_30km",
      bookingTypeLabel: "⏱️ Rental (3 Hours / 30 Kms)",
      commissionRate: 15,
      tierScopeLabel: "Ward Level Kiosk (15-20% Commission)",
      inclusionsMatched: "Rental (1 hours 10 kms, 3 hours 30 kms, 5 hours 50 kms)",
    };
  }
  if (explicitTier === "gold") {
    return {
      planTier: "gold",
      bookingType: "outstation_oneway",
      bookingTypeLabel: "🚗 Outstation (Oneway)",
      commissionRate: 10,
      tierScopeLabel: "District Exclusive Hub (10-15% Commission)",
      inclusionsMatched: "Outstation (Oneway, roundtrip)",
    };
  }
  if (explicitTier === "platinum") {
    return {
      planTier: "platinum",
      bookingType: "corporate_ride",
      bookingTypeLabel: "💼 Corporate Ride (Regional Master)",
      commissionRate: 0,
      tierScopeLabel: "Regional Master Hub (0% Commission SLA)",
      inclusionsMatched: "Corporate Rides (★ 0% Commission)",
    };
  }

  const distNum = parseFloat((data.distance || "").replace(/[^0-9.]/g, "")) || 0;
  if (distNum > 40) {
    return {
      planTier: "gold",
      bookingType: "outstation_oneway",
      bookingTypeLabel: "🚗 Outstation (District Exclusive)",
      commissionRate: 10,
      tierScopeLabel: "District Exclusive Hub (10-15% Commission)",
      inclusionsMatched: "Outstation (Oneway, roundtrip)",
    };
  }

  return {
    planTier: "silver",
    bookingType: "rental_1hr_10km",
    bookingTypeLabel: "⏱️ Rental (1 Hour / 10 Kms)",
    commissionRate: 15,
    tierScopeLabel: "Ward Level Kiosk (15-20% Commission)",
    inclusionsMatched: "Rental (1 hours 10 kms, 3 hours 30 kms, 5 hours 50 kms)",
  };
}

function detectPlanTier(pickup, drop, vehicleCategory, distance) {
  const result = classifyBookingByPlan({ pickup, drop, vehicleCategory, distance });
  return result.planTier;
}

function calculateVendorProximity(pickup, pickupZone, vendor) {
  const p = cleanString(pickup);
  const z = cleanString(pickupZone);
  const vCity = cleanString(vendor.city);
  const vScope = cleanString(vendor.territoryScope);
  const vAddr = cleanString(vendor.proposedAddress);
  const vCombined = `${vCity} ${vScope} ${vAddr}`;

  let score = 20;

  if ((p.includes("airport") || z.includes("airport")) && (vCombined.includes("airport") || vCombined.includes("dum dum") || vCombined.includes("kolkata"))) {
    score = 100;
  } else if ((p.includes("howrah") || z.includes("howrah")) && (vCombined.includes("howrah") || vCombined.includes("kolkata"))) {
    score = 95;
  } else if (vCity && (p.includes(vCity) || z.includes(vCity))) {
    score = 90;
  } else if (
    (p.includes("kolkata") || z.includes("kolkata") || p.includes("airport") || p.includes("salt lake")) &&
    (vCombined.includes("kolkata") || vCombined.includes("singur") || vCombined.includes("howrah") || vCombined.includes("hooghly"))
  ) {
    score = 75;
  } else if (
    (p.includes("singur") || z.includes("singur") || p.includes("hooghly") || p.includes("chandannagar")) &&
    (vCombined.includes("singur") || vCombined.includes("hooghly") || vCombined.includes("chandannagar"))
  ) {
    score = 85;
  } else if (vScope.includes("district") || vScope.includes("exclusive") || vScope.includes("state")) {
    score = 65;
  }

  return score;
}

async function findRankedVendorsForPlan(planTier, pickup, pickupZone, excludedVendorIds = []) {
  const targetTier = cleanString(planTier);
  const excluded = Array.isArray(excludedVendorIds) ? excludedVendorIds : [];

  let leads = [];
  try {
    leads = await prisma.vendorLead.findMany({
      where: {
        preferredPackage: { equals: targetTier, mode: "insensitive" },
      },
      select: {
        applicationId: true,
        fullName: true,
        mobile: true,
        city: true,
        state: true,
        preferredPackage: true,
        proposedAddress: true,
        pincode: true,
        status: true,
      },
      orderBy: { createdAt: "desc" },
      take: 60,
    });
  } catch (e) {
    console.warn("[FIND VENDORS LEAD WARN]", e.message);
  }

  const candidateMap = new Map();

  for (const v of leads) {
    const vId = v.applicationId;
    if (!vId || excluded.includes(vId)) continue;
    if (v.preferredPackage && cleanString(v.preferredPackage) !== targetTier) continue;

    const proximity = calculateVendorProximity(pickup, pickupZone, {
      city: v.city,
      proposedAddress: v.proposedAddress,
      pincode: v.pincode,
    });

    candidateMap.set(vId, {
      vendorId: vId,
      vendorName: v.fullName || "Franchise Partner",
      vendorMobile: v.mobile,
      city: v.city || "Kolkata",
      planTier: targetTier,
      proximityScore: proximity,
    });
  }

  const candidates = Array.from(candidateMap.values());
  candidates.sort((a, b) => b.proximityScore - a.proximityScore);
  return candidates;
}

function formatOrderRow(row) {
  return {
    id: row.booking_id || row.id,
    dbId: row.id,
    bookingId: row.booking_id,
    pickup: row.pickup,
    pickupZone: row.pickup_zone,
    drop: row.drop_loc || row.drop,
    dropZone: row.drop_zone,
    distance: row.distance,
    duration: row.duration,
    vehicleCategory: row.vehicle_category,
    planTier: row.plan_tier,
    bookingType: row.booking_type || "",
    totalFare: Number(row.total_fare),
    vendorPayout: Number(row.vendor_payout),
    commissionRate: Number(row.commission_rate),
    passengerName: row.passenger_name,
    passengerPhone: row.passenger_phone,
    passengerRating: Number(row.passenger_rating || 4.9),
    status: row.status,
    dispatchTime: row.dispatch_time || "Recent",
    paymentMethod: row.payment_method,
    source: row.source,
    assignedVendorId: row.assigned_vendor_id,
    assignedVendorName: row.assigned_vendor_name,
    assignedVendorMobile: row.assigned_vendor_mobile,
    rejectedVendorIds: row.rejected_vendor_ids || [],
    adminApproved: row.admin_approved,
    notes: row.notes,
    createdAt: row.created_at,
    assignedDriver: row.assigned_driver_name
      ? {
          name: row.assigned_driver_name,
          phone: row.assigned_driver_phone,
          vehicleNumber: row.assigned_driver_vehicle,
          liveStatus: row.driver_live_status,
          startOtp: row.start_otp,
        }
      : undefined,
  };
}

// GET /api/bookings
app.get("/api/bookings", async (req, res) => {
  try {
    const { status, planTier, source, pickupZone, search } = req.query;
    let sql = `SELECT * FROM booking_orders WHERE 1=1`;
    const params = [];

    if (status && status !== "ALL") {
      params.push(status);
      sql += ` AND status = ${params.length}`;
    }
    if (planTier && planTier !== "ALL") {
      params.push(cleanString(planTier));
      sql += ` AND LOWER(plan_tier) = LOWER(${params.length})`;
    }
    if (source && source !== "ALL") {
      params.push(source);
      sql += ` AND source = ${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (booking_id ILIKE ${params.length} OR passenger_name ILIKE ${params.length} OR pickup ILIKE ${params.length} OR drop_loc ILIKE ${params.length})`;
    }

    sql += ` ORDER BY created_at DESC LIMIT 100;`;
    const rows = await prisma.$queryRawUnsafe(sql, ...params);
    res.json({ success: true, total: rows.length, bookings: rows.map(formatOrderRow) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/bookings
app.post("/api/bookings", async (req, res) => {
  try {
    const data = req.body;
    if (!data.passengerName || !data.passengerPhone || !data.pickup || !data.drop) {
      return res.status(400).json({ success: false, error: "passengerName, passengerPhone, pickup, drop are required." });
    }

    const planTier = cleanString(data.planTier) || detectPlanTier(data.pickup, data.drop, data.vehicleCategory, data.distance);
    const pickupZone = data.pickupZone || (data.pickup.toLowerCase().includes("airport") ? "Kolkata Airport" : "Kolkata Hub");
    const dropZone = data.dropZone || "Kolkata Central";
    const totalFare = Number(data.totalFare) || 560;
    const commissionRate = planTier === "platinum" ? 0 : planTier === "gold" ? 10 : 15;
    const vendorPayout = data.vendorPayout || Math.round(totalFare * (1 - commissionRate / 100));

    const bookingId = `BB-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const id = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    let assignedVendorId = null;
    let assignedVendorName = null;
    let assignedVendorMobile = null;
    let dispatchNote = `Dispatched to 1st nearest ${planTier.toUpperCase()} partner`;

    if (data.customVendorId) {
      assignedVendorId = data.customVendorId;
      assignedVendorName = "Assigned Vendor Partner";
    } else {
      const ranked = await findRankedVendorsForPlan(planTier, data.pickup, pickupZone, []);
      if (ranked.length > 0) {
        const nearest = ranked[0];
        assignedVendorId = nearest.vendorId;
        assignedVendorName = nearest.vendorName;
        assignedVendorMobile = nearest.vendorMobile;
        dispatchNote = `Allocated to 1st Nearest ${planTier.toUpperCase()} Partner: ${nearest.vendorName} (${nearest.city} - Proximity: ${nearest.proximityScore}%)`;
      }
    }

    const source = data.source || "broomboom_app";
    const query = `
      INSERT INTO booking_orders (
        id, booking_id, passenger_name, passenger_phone, passenger_rating,
        pickup, pickup_zone, drop_loc, drop_zone, distance, duration,
        vehicle_category, plan_tier, total_fare, vendor_payout, commission_rate,
        payment_method, source, status, assigned_vendor_id, assigned_vendor_name,
        assigned_vendor_mobile, rejected_vendor_ids, admin_approved, dispatch_time, notes,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21,
        $22, $23, $24, $25, $26,
        NOW(), NOW()
      ) RETURNING *;
    `;

    const values = [
      id,
      bookingId,
      data.passengerName.trim(),
      data.passengerPhone.trim(),
      data.passengerRating || 4.9,
      data.pickup.trim(),
      pickupZone,
      data.drop.trim(),
      dropZone,
      data.distance || "14.8 km",
      data.duration || "28 mins",
      data.vehicleCategory || "Sedan (Swift Dzire / Etios)",
      planTier,
      totalFare,
      vendorPayout,
      commissionRate,
      data.paymentMethod || "Online Paid (Cashfree UPI)",
      source,
      "incoming",
      assignedVendorId,
      assignedVendorName,
      assignedVendorMobile,
      [],
      true,
      "Just now (45s left to accept)",
      data.notes || dispatchNote,
    ];

    const result = await prisma.$queryRawUnsafe(query, ...values);
    const booking = formatOrderRow(result[0]);

    res.status(201).json({
      success: true,
      message: `Booking ${booking.bookingId} created from ${source.toUpperCase()}! Dispatched to nearest partner: ${booking.assignedVendorName}.`,
      booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/bookings
app.patch("/api/bookings", async (req, res) => {
  try {
    const { bookingId, action, vendorId, reason } = req.body;
    if (!bookingId || !action) {
      return res.status(400).json({ success: false, error: "bookingId and action are required." });
    }

    if (action === "accept") {
      const sql = `
        UPDATE booking_orders
        SET status = 'active', assigned_vendor_id = $2, assigned_driver_name = 'Raju Karmakar',
            assigned_driver_phone = '+91 91234 56780', assigned_driver_vehicle = 'WB-02-AK-4921',
            driver_live_status = 'Driver assigned & navigating to pickup', start_otp = '4921',
            dispatch_time = 'Accepted just now', updated_at = NOW()
        WHERE (booking_id = $1 OR id = $1) RETURNING *;
      `;
      const rows = await prisma.$queryRawUnsafe(sql, bookingId, vendorId || "VALUED_VENDOR");
      return res.json({ success: true, message: `Booking ${bookingId} accepted!`, order: formatOrderRow(rows[0]) });
    }

    if (action === "reject") {
      const existing = await prisma.$queryRawUnsafe(`SELECT * FROM booking_orders WHERE booking_id = $1 OR id = $1 LIMIT 1;`, bookingId);
      const currentOrder = existing[0];
      if (!currentOrder) return res.status(404).json({ success: false, message: "Order not found" });

      const currentRejections = Array.isArray(currentOrder.rejected_vendor_ids) ? currentOrder.rejected_vendor_ids : [];
      const updatedRejections = Array.from(new Set([...currentRejections, vendorId]));

      const remainingCandidates = await findRankedVendorsForPlan(
        currentOrder.plan_tier,
        currentOrder.pickup,
        currentOrder.pickup_zone || currentOrder.pickup,
        updatedRejections
      );

      const nextVendor = remainingCandidates.length > 0 ? remainingCandidates[0] : null;

      if (nextVendor) {
        const cascadeSql = `
          UPDATE booking_orders
          SET assigned_vendor_id = $2, assigned_vendor_name = $3, assigned_vendor_mobile = $4,
              rejected_vendor_ids = $5, status = 'incoming', dispatch_time = 'Cascaded to 2nd nearest partner (45s left)',
              notes = $6, updated_at = NOW()
          WHERE id = $1 RETURNING *;
        `;
        const note = `Cascaded from ${vendorId} to 2nd nearest partner ${nextVendor.vendorName} (${nextVendor.city}) - Reason: ${reason || 'Declined'}`;
        const updatedRows = await prisma.$queryRawUnsafe(cascadeSql, currentOrder.id, nextVendor.vendorId, nextVendor.vendorName, nextVendor.vendorMobile, updatedRejections, note);

        return res.json({
          success: true,
          cascaded: true,
          nextVendor,
          order: formatOrderRow(updatedRows[0]),
          message: `Booking ${currentOrder.booking_id} cascaded to 2nd nearest ${currentOrder.plan_tier.toUpperCase()} partner: ${nextVendor.vendorName} (${nextVendor.vendorId}).`,
        });
      } else {
        const fallbackSql = `
          UPDATE booking_orders
          SET assigned_vendor_id = NULL, assigned_vendor_name = NULL, rejected_vendor_ids = $2,
              status = 'pending_admin_reassign', notes = 'All tier partners declined. Sent to Admin Desk.', updated_at = NOW()
          WHERE id = $1 RETURNING *;
        `;
        const updatedRows = await prisma.$queryRawUnsafe(fallbackSql, currentOrder.id, updatedRejections);
        return res.json({
          success: true,
          cascaded: false,
          order: formatOrderRow(updatedRows[0]),
          message: `All registered ${currentOrder.plan_tier.toUpperCase()} vendors declined. Escalated to Admin Dispatch Desk.`,
        });
      }
    }

    if (action === "complete") {
      const sql = `
        UPDATE booking_orders
        SET status = 'completed', driver_live_status = 'Trip Completed & Settled',
            dispatch_time = 'Completed & Settled', updated_at = NOW()
        WHERE (booking_id = $1 OR id = $1) RETURNING *;
      `;
      const rows = await prisma.$queryRawUnsafe(sql, bookingId);
      return res.json({ success: true, message: `Booking ${bookingId} completed!`, order: formatOrderRow(rows[0]) });
    }

    res.status(400).json({ success: false, error: `Invalid action: ${action}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/vendor/orders
app.get("/api/vendor/orders", async (req, res) => {
  try {
    const { vendorId, planTier } = req.query;
    if (!vendorId) return res.json({ success: true, count: 0, orders: [] });

    let sql = `SELECT * FROM booking_orders WHERE admin_approved = TRUE AND assigned_vendor_id = $1`;
    const params = [vendorId];

    if (planTier) {
      params.push(cleanString(planTier));
      sql += ` AND LOWER(plan_tier) = LOWER(${params.length})`;
    }

    sql += ` ORDER BY created_at DESC LIMIT 50;`;
    const rows = await prisma.$queryRawUnsafe(sql, ...params);
    res.json({ success: true, count: rows.length, orders: rows.map(formatOrderRow) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/vendor/orders
app.post("/api/vendor/orders", async (req, res) => {
  try {
    const { action, bookingId, vendorId, reason } = req.body;
    if (!bookingId || !action) {
      return res.status(400).json({ success: false, error: "bookingId and action are required." });
    }

    if (action === "accept") {
      const sql = `
        UPDATE booking_orders
        SET status = 'active', assigned_vendor_id = $2, assigned_driver_name = 'Raju Karmakar',
            assigned_driver_phone = '+91 91234 56780', assigned_driver_vehicle = 'WB-02-AK-4921',
            driver_live_status = 'Driver assigned & navigating to pickup', start_otp = '4921',
            dispatch_time = 'Accepted just now', updated_at = NOW()
        WHERE (booking_id = $1 OR id = $1) RETURNING *;
      `;
      const rows = await prisma.$queryRawUnsafe(sql, bookingId, vendorId || "BB-VENDOR");
      return res.json({ success: true, message: `Booking ${bookingId} accepted!`, order: formatOrderRow(rows[0]) });
    }

    if (action === "reject") {
      const existing = await prisma.$queryRawUnsafe(`SELECT * FROM booking_orders WHERE booking_id = $1 OR id = $1 LIMIT 1;`, bookingId);
      const currentOrder = existing[0];
      if (!currentOrder) return res.status(404).json({ success: false, message: "Order not found" });

      const currentRejections = Array.isArray(currentOrder.rejected_vendor_ids) ? currentOrder.rejected_vendor_ids : [];
      const updatedRejections = Array.from(new Set([...currentRejections, vendorId]));

      const remainingCandidates = await findRankedVendorsForPlan(
        currentOrder.plan_tier,
        currentOrder.pickup,
        currentOrder.pickup_zone || currentOrder.pickup,
        updatedRejections
      );

      const nextVendor = remainingCandidates.length > 0 ? remainingCandidates[0] : null;

      if (nextVendor) {
        const cascadeSql = `
          UPDATE booking_orders
          SET assigned_vendor_id = $2, assigned_vendor_name = $3, assigned_vendor_mobile = $4,
              rejected_vendor_ids = $5, status = 'incoming', dispatch_time = 'Cascaded to 2nd nearest partner (45s left)',
              notes = $6, updated_at = NOW()
          WHERE id = $1 RETURNING *;
        `;
        const note = `Cascaded from ${vendorId} to 2nd nearest partner ${nextVendor.vendorName} (${nextVendor.city}) - Reason: ${reason || 'Declined'}`;
        const updatedRows = await prisma.$queryRawUnsafe(cascadeSql, currentOrder.id, nextVendor.vendorId, nextVendor.vendorName, nextVendor.vendorMobile, updatedRejections, note);

        return res.json({
          success: true,
          cascaded: true,
          nextVendor,
          order: formatOrderRow(updatedRows[0]),
          message: `Booking ${currentOrder.booking_id} cascaded to 2nd nearest ${currentOrder.plan_tier.toUpperCase()} partner: ${nextVendor.vendorName} (${nextVendor.vendorId}).`,
        });
      } else {
        const fallbackSql = `
          UPDATE booking_orders
          SET assigned_vendor_id = NULL, assigned_vendor_name = NULL, rejected_vendor_ids = $2,
              status = 'pending_admin_reassign', notes = 'All tier partners declined. Sent to Admin Desk.', updated_at = NOW()
          WHERE id = $1 RETURNING *;
        `;
        const updatedRows = await prisma.$queryRawUnsafe(fallbackSql, currentOrder.id, updatedRejections);
        return res.json({
          success: true,
          cascaded: false,
          order: formatOrderRow(updatedRows[0]),
          message: `All registered ${currentOrder.plan_tier.toUpperCase()} vendors declined.`,
        });
      }
    }

    if (action === "complete") {
      const sql = `
        UPDATE booking_orders
        SET status = 'completed', driver_live_status = 'Trip Completed & Settled',
            dispatch_time = 'Completed & Settled', updated_at = NOW()
        WHERE (booking_id = $1 OR id = $1) RETURNING *;
      `;
      const rows = await prisma.$queryRawUnsafe(sql, bookingId);
      return res.json({ success: true, message: `Booking ${bookingId} completed!`, order: formatOrderRow(rows[0]) });
    }

    res.status(400).json({ success: false, error: `Invalid action: ${action}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Start listening
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 BroomBoom Vendor Backend Server is RUNNING!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🗄️  Database: PostgreSQL (connected via Prisma)`);
  console.log(`🩺 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Leads endpoint: http://localhost:${PORT}/api/leads`);
  console.log(`=================================================`);
});

