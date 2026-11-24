const { PrismaClient } = require('c:/Users/ADMIN/Downloads/BroomBoom-Cabs-Vendor/Broomboomvendor page/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const plans = await prisma.$queryRawUnsafe(`
      SELECT plan_tier, count(*) as count 
      FROM booking_orders 
      GROUP BY plan_tier;
    `);
    console.log('Plans distribution:', plans);

    const pincodes = await prisma.$queryRawUnsafe(`
      SELECT pickup_pincode, count(*) as count 
      FROM booking_orders 
      GROUP BY pickup_pincode 
      ORDER BY count DESC 
      LIMIT 10;
    `);
    console.log('Top pincodes:', pincodes);

    const statuses = await prisma.$queryRawUnsafe(`
      SELECT status, count(*) as count 
      FROM booking_orders 
      GROUP BY status;
    `);
    console.log('Statuses:', statuses);

    const assigned = await prisma.$queryRawUnsafe(`
      SELECT assigned_vendor_id, count(*) as count 
      FROM booking_orders 
      GROUP BY assigned_vendor_id 
      ORDER BY count DESC 
      LIMIT 10;
    `);
    console.log('Assigned vendor ids:', assigned);

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

