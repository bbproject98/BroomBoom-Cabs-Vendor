const { PrismaClient } = require('c:/Users/ADMIN/Downloads/BroomBoom-Cabs-Vendor/Broomboomvendor page/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const nullPins = await prisma.$queryRawUnsafe(`
      SELECT id, booking_id, pickup, drop_loc, pickup_zone, drop_zone, plan_tier, assigned_vendor_id, status, created_at 
      FROM booking_orders 
      WHERE pickup_pincode IS NULL 
      LIMIT 5;
    `);
    console.log('Null pincode rows:', nullPins);

    const nonNullPins = await prisma.$queryRawUnsafe(`
      SELECT id, booking_id, pickup, pickup_pincode, drop_loc, drop_pincode, plan_tier, assigned_vendor_id, status, created_at 
      FROM booking_orders 
      WHERE pickup_pincode IS NOT NULL 
      LIMIT 10;
    `);
    console.log('Non-null pincode rows:', nonNullPins);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

