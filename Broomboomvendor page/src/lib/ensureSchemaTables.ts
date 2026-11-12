import prisma from "@/lib/prisma";

let baseTablesEnsured = false;

/**
 * Ensures secondary Prisma tables (`vendor_hubs`, `brochure_downloads`) exist
 * so read/analytics endpoints never fail with P2021 on fresh databases.
 */
export async function ensureBaseCatalogTables(): Promise<void> {
  if (baseTablesEnsured) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "vendor_hubs" (
        "id" TEXT PRIMARY KEY,
        "city" TEXT NOT NULL,
        "state" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "tier" TEXT NOT NULL,
        "address" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "open_hours" TEXT NOT NULL,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "brochure_downloads" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "mobile" TEXT NOT NULL,
        "city" TEXT,
        "downloaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    baseTablesEnsured = true;
  } catch (err) {
    console.warn("[ENSURE BASE TABLES WARN]", err);
  }
}
