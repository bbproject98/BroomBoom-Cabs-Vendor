const { PrismaClient } = require('c:/Users/ADMIN/Downloads/BroomBoom-Cabs-Vendor/Broomboomvendor page/node_modules/@prisma/client');
const prisma = new PrismaClient();

// Mirror getVendorOrders logic from ordersService.ts
function cleanString(str) {
  return (str || "").trim().toLowerCase();
}
function cleanPincode(pin) {
  if (!pin) return "";
  const match = pin.match(/\b[1-9][0-9]{5}\b/);
  return match ? match[0] : pin.replace(/\D/g, "").slice(0, 6);
}

async function testQuery(vendorId, planTier, city, pincode) {
  let sql = `SELECT * FROM booking_orders WHERE 1=1`;
  const params = [];

  if (vendorId) {
    params.push(vendorId);
    sql += ` AND (assigned_vendor_id = $${params.length}`;
    if (planTier) {
      params.push(cleanString(planTier));
      const tierIdx = params.length;
      if (pincode) {
        const cleanP = cleanPincode(pincode);
        params.push(cleanP);
        const pinIdx = params.length;
        sql += ` OR (assigned_vendor_id IS NULL AND plan_tier = $${tierIdx} AND (pickup_pincode = $${pinIdx} OR pickup_pincode LIKE '${cleanP.slice(0, 3)}%') AND NOT ($1 = ANY(rejected_vendor_ids)))`;
      } else {
        sql += ` OR (assigned_vendor_id IS NULL AND plan_tier = $${tierIdx} AND NOT ($1 = ANY(rejected_vendor_ids)))`;
      }
    }
    sql += `)`;
  } else if (planTier) {
    params.push(cleanString(planTier));
    sql += ` AND plan_tier = $${params.length}`;
  }

  sql += ` ORDER BY created_at DESC LIMIT 50;`;

  console.log('\n--- Testing with:', { vendorId, planTier, pincode }, '---');
  console.log('SQL:', sql);
  console.log('Params:', params);
  const rows = await prisma.$queryRawUnsafe(sql, ...params);
  console.log('Rows count:', rows.length);
  if (rows.length > 0) {
    console.log('Sample matching rows:', rows.slice(0, 3).map(r => ({
      booking_id: r.booking_id,
      plan_tier: r.plan_tier,
      pickup_pincode: r.pickup_pincode,
      pickup: r.pickup,
      assigned_vendor_id: r.assigned_vendor_id,
      status: r.status
    })));
  }
}

async function main() {
  try {
    // Test 1: Gold vendor with pincode 712124
    await testQuery('BB-VENDOR-2026-5058', 'gold', 'SINGUR', '712124');

    // Test 2: Silver vendor with pincode 712124
    await testQuery('BB-VENDOR-2026-8778', 'silver', 'SINGUR', '712124');

    // Test 3: Platinum vendor with pincode 712124
    await testQuery('BB-VENDOR-2026-1090', 'platinum', 'SINGUR', '712124');

    // Test 4: Another vendor who is NOT 5058 or 9696 (e.g. 8031, 8032, or fresh vendor)
    await testQuery('BB-VENDOR-2026-8031', 'gold', 'Kolkata', '700001');

    // Test 5: Fresh vendor with Singur pincode 712124
    await testQuery('BB-VENDOR-NEW', 'gold', 'SINGUR', '712124');

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

