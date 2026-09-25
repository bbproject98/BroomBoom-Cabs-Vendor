-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "vendor_leads" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "alternate_phone" TEXT,
    "email" TEXT,
    "state" TEXT,
    "city" TEXT NOT NULL,
    "pincode" TEXT,
    "proposed_address" TEXT,
    "space_status" TEXT,
    "carpet_area" TEXT,
    "preferred_package" TEXT NOT NULL,
    "package_name" TEXT,
    "investment_budget" TEXT,
    "finance_required" TEXT DEFAULT 'Self-Funded / Ready Capital',
    "loan_assistance" TEXT DEFAULT 'No (Self-Funded)',
    "current_profession" TEXT,
    "has_experience" TEXT,
    "message" TEXT,
    "source" TEXT NOT NULL DEFAULT 'vendor_portal',
    "status" TEXT NOT NULL DEFAULT 'new',
    "admin_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brochure_downloads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "city" TEXT,
    "downloaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brochure_downloads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_hubs" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "open_hours" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_hubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_subscriptions" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "vendor_name" TEXT NOT NULL,
    "vendor_mobile" TEXT NOT NULL,
    "vendor_email" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "plan_tier" TEXT NOT NULL,
    "plan_name" TEXT NOT NULL,
    "billing_cycle" TEXT NOT NULL DEFAULT 'One-Time Onboarding & Annual Licensing',
    "status" TEXT NOT NULL DEFAULT 'active',
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "territory_scope" TEXT,
    "has_exclusivity" BOOLEAN NOT NULL DEFAULT true,
    "order_id" TEXT NOT NULL,
    "cf_order_id" TEXT,
    "cf_payment_id" TEXT,
    "payment_session_id" TEXT,
    "payment_method" TEXT,
    "payment_status" TEXT NOT NULL DEFAULT 'pending',
    "base_amount" DOUBLE PRECISION NOT NULL,
    "gateway_fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gst_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "paid_at" TIMESTAMP(3),
    "admin_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_change_tickets" (
    "id" TEXT NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "vendor_name" TEXT NOT NULL,
    "vendor_mobile" TEXT NOT NULL,
    "vendor_email" TEXT,
    "current_plan" TEXT NOT NULL,
    "requested_plan" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "admin_notes" TEXT,
    "upgrade_amount" DOUBLE PRECISION DEFAULT 0,
    "gateway_fee" DOUBLE PRECISION DEFAULT 0,
    "gst_amount" DOUBLE PRECISION DEFAULT 0,
    "total_amount" DOUBLE PRECISION DEFAULT 0,
    "payment_status" TEXT DEFAULT 'UNPAID',
    "payment_id" TEXT,
    "paid_at" TIMESTAMP(3),
    "new_user_id" TEXT,
    "new_password" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_change_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_users" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "vendor_name" TEXT NOT NULL,
    "vendor_mobile" TEXT NOT NULL,
    "vendor_email" TEXT,
    "current_plan" TEXT NOT NULL DEFAULT 'gold',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vendor_leads_application_id_key" ON "vendor_leads"("application_id");

-- CreateIndex
CREATE INDEX "vendor_leads_status_idx" ON "vendor_leads"("status");

-- CreateIndex
CREATE INDEX "vendor_leads_city_idx" ON "vendor_leads"("city");

-- CreateIndex
CREATE INDEX "vendor_leads_preferred_package_idx" ON "vendor_leads"("preferred_package");

-- CreateIndex
CREATE INDEX "vendor_leads_created_at_idx" ON "vendor_leads"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "vendor_subscriptions_subscription_id_key" ON "vendor_subscriptions"("subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_subscriptions_order_id_key" ON "vendor_subscriptions"("order_id");

-- CreateIndex
CREATE INDEX "vendor_subscriptions_application_id_idx" ON "vendor_subscriptions"("application_id");

-- CreateIndex
CREATE INDEX "vendor_subscriptions_order_id_idx" ON "vendor_subscriptions"("order_id");

-- CreateIndex
CREATE INDEX "vendor_subscriptions_status_idx" ON "vendor_subscriptions"("status");

-- CreateIndex
CREATE INDEX "vendor_subscriptions_payment_status_idx" ON "vendor_subscriptions"("payment_status");

-- CreateIndex
CREATE INDEX "vendor_subscriptions_plan_tier_idx" ON "vendor_subscriptions"("plan_tier");

-- CreateIndex
CREATE UNIQUE INDEX "plan_change_tickets_ticket_id_key" ON "plan_change_tickets"("ticket_id");

-- CreateIndex
CREATE INDEX "plan_change_tickets_application_id_idx" ON "plan_change_tickets"("application_id");

-- CreateIndex
CREATE INDEX "plan_change_tickets_status_idx" ON "plan_change_tickets"("status");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_users_user_id_key" ON "vendor_users"("user_id");

-- CreateIndex
CREATE INDEX "vendor_users_user_id_idx" ON "vendor_users"("user_id");

-- CreateIndex
CREATE INDEX "vendor_users_application_id_idx" ON "vendor_users"("application_id");
