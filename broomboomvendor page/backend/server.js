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
    if (!body.fullName || !body.mobile || !body.city) {
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
        ? "Silver Partner (Booking Kiosk — ₹10,000)"
        : preferredPackage === "gold"
        ? "Gold Partner (District Exclusive Hub — ₹20,000)"
        : preferredPackage === "platinum"
        ? "Platinum Partner (Regional Master Hub — ₹50,000)"
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
          ? "₹10,000 (Silver Partner - 50% OFF Exclusive Deal)"
          : preferredPackage === "platinum"
          ? "₹50,000 (Platinum Package - 50% OFF Exclusive Deal)"
          : "₹20,000 (Gold Package - 50% OFF Exclusive Deal)";
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
        city: body.city?.trim(),
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
  silver: { amount: 10000, name: "Silver Partner (Booking Kiosk — ₹10,000)", original: "₹20,000", discounted: "₹10,000" },
  gold: { amount: 20000, name: "Gold Partner (District Exclusive Hub — ₹20,000)", original: "₹40,000", discounted: "₹20,000" },
  platinum: { amount: 50000, name: "Platinum Partner (Regional Master Hub — ₹50,000)", original: "₹1,00,000", discounted: "₹50,000" },
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

