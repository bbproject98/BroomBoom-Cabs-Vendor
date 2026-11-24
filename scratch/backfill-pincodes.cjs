const { PrismaClient } = require('c:/Users/ADMIN/Downloads/BroomBoom-Cabs-Vendor/Broomboomvendor page/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const res1 = await prisma.$executeRawUnsafe(`
      UPDATE booking_orders 
      SET pickup_pincode = '700052' 
      WHERE pickup_pincode IS NULL 
        AND (pickup_zone ILIKE '%Airport%' OR pickup ILIKE '%Airport%');
    `);
    console.log('Updated Airport pickup_pincode: 700052 count:', res1);

    const res2 = await prisma.$executeRawUnsafe(`
      UPDATE booking_orders 
      SET pickup_pincode = '711101' 
      WHERE pickup_pincode IS NULL 
        AND (pickup_zone ILIKE '%Howrah%' OR pickup ILIKE '%Howrah%');
    `);
    console.log('Updated Howrah pickup_pincode: 711101 count:', res2);

    const res3 = await prisma.$executeRawUnsafe(`
      UPDATE booking_orders 
      SET pickup_pincode = '700156' 
      WHERE pickup_pincode IS NULL 
        AND (pickup_zone ILIKE '%New Town%' OR pickup ILIKE '%New Town%');
    `);
    console.log('Updated New Town pickup_pincode: 700156 count:', res3);

    const res4 = await prisma.$executeRawUnsafe(`
      UPDATE booking_orders 
      SET drop_pincode = '700091' 
      WHERE drop_pincode IS NULL 
        AND (drop_zone ILIKE '%Salt Lake%' OR drop_loc ILIKE '%Salt Lake%');
    `);
    console.log('Updated Salt Lake drop_pincode: 700091 count:', res4);

    const res5 = await prisma.$executeRawUnsafe(`
      UPDATE booking_orders 
      SET drop_pincode = '700016' 
      WHERE drop_pincode IS NULL 
        AND (drop_zone ILIKE '%Park Street%' OR drop_loc ILIKE '%Park Street%');
    `);
    console.log('Updated Park Street drop_pincode: 700016 count:', res5);

    const remainingNulls = await prisma.$queryRawUnsafe(`
      SELECT count(*) FROM booking_orders WHERE pickup_pincode IS NULL;
    `);
    console.log('Remaining null pickup_pincodes:', remainingNulls);

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

