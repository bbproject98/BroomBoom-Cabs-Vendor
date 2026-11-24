const { PrismaClient } = require('c:/Users/ADMIN/Downloads/BroomBoom-Cabs-Vendor/Broomboomvendor page/node_modules/@prisma/client');
const prisma = new PrismaClient();

function cleanString(str) {
  return (str || "").trim().toLowerCase();
}
function cleanPincode(pin) {
  if (!pin) return "";
  const match = pin.match(/\b[1-9][0-9]{5}\b/);
  return match ? match[0] : pin.replace(/\D/g, "").slice(0, 6);
}

async function testFinalQuery(vendorId, planTier, pincode) {
  const targetTier = cleanString(planTier) || "gold";
  const targetPin = cleanPincode(pincode) || "712124";
  const vId = (vendorId || "").trim();

  const sql = `
    SELECT * FROM booking_orders 
    WHERE (
      (assigned_vendor_id = $1 AND plan_tier = $2 AND NOT ($1 = ANY(rejected_vendor_ids)))
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

  const rows = await prisma.$queryRawUnsafe(sql, vId, targetTier, targetPin);
  console.log(`\nResults for Vendor: ${vId} | Plan: ${targetTier} | PIN: ${targetPin}:`);
  console.log(`Count: ${rows.length}`);
  const uniqueTiers = Array.from(new Set(rows.map(r => r.plan_tier)));
  const uniquePins = Array.from(new Set(rows.map(r => r.pickup_pincode)));
  console.log(`Tiers present:`, uniqueTiers);
  console.log(`Pickup PINs present:`, uniquePins);
}

async function main() {
  try {
    await testFinalQuery('BB-VENDOR-2026-5058', 'gold', '712124');
    await testFinalQuery('BB-VENDOR-2026-8778', 'silver', '712124');
    await testFinalQuery('BB-VENDOR-2026-1090', 'platinum', '712124');
    await testFinalQuery('BB-VENDOR-NEW', 'silver', '700052');
    await testFinalQuery('BB-VENDOR-NEW', 'gold', '700052');
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

