const { PrismaClient } = require('c:/Users/ADMIN/Downloads/BroomBoom-Cabs-Vendor/Broomboomvendor page/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function runTest(vendorId, planTier, pincode) {
  const sql = `
    SELECT * FROM booking_orders 
    WHERE (
      (assigned_vendor_id = $1 AND status IN ('active', 'completed') AND plan_tier = $2)
      OR
      (
        status = 'incoming'
        AND plan_tier = $2
        AND (
          pickup_pincode = $3 
          OR drop_pincode = $3 
          OR pickup LIKE '%' || $3 || '%' 
          OR drop_loc LIKE '%' || $3 || '%'
        )
        AND NOT ($1 = ANY(rejected_vendor_ids))
      )
    )
    ORDER BY created_at DESC 
    LIMIT 50;
  `;

  const rows = await prisma.$queryRawUnsafe(sql, vendorId, planTier.toLowerCase(), pincode);
  console.log(`\n=== Vendor: ${vendorId} | Plan: ${planTier} | PIN: ${pincode} ===`);
  console.log(`Found: ${rows.length} orders`);
  if (rows.length > 0) {
    console.log(rows.slice(0, 3).map(r => ({
      booking_id: r.booking_id,
      plan_tier: r.plan_tier,
      pickup_pincode: r.pickup_pincode,
      pickup: r.pickup,
      status: r.status,
      assigned_vendor_id: r.assigned_vendor_id
    })));
  }
}

async function main() {
  try {
    // 1. Gold vendor in Singur (712124)
    await runTest('BB-VENDOR-2026-5058', 'gold', '712124');

    // 2. Any other Gold vendor in Singur (712124)
    await runTest('BB-VENDOR-2026-5106', 'gold', '712124');

    // 3. Silver vendor in Singur (712124)
    await runTest('BB-VENDOR-2026-8778', 'silver', '712124');

    // 4. Platinum vendor in Singur (712124)
    await runTest('BB-VENDOR-2026-1090', 'platinum', '712124');

    // 5. Gold vendor in Kolkata Central (700001)
    await runTest('BB-VENDOR-2026-KOL', 'gold', '700001');

    // 6. Silver vendor in Kolkata Airport (700052)
    await runTest('BB-VENDOR-AIRPORT', 'silver', '700052');
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

