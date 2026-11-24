const { PrismaClient } = require('c:/Users/ADMIN/Downloads/BroomBoom-Cabs-Vendor/Broomboomvendor page/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const recent = await prisma.$queryRawUnsafe(`
      SELECT id, booking_id, plan_tier, pickup, pickup_pincode, drop_loc, drop_pincode, assigned_vendor_id, status, created_at 
      FROM booking_orders 
      WHERE created_at >= '2026-11-19' 
      ORDER BY created_at DESC;
    `);
    console.log('Recent bookings count:', recent.length);
    console.log(JSON.stringify(recent, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

