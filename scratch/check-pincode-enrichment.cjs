const { PrismaClient } = require('c:/Users/ADMIN/Downloads/BroomBoom-Cabs-Vendor/Broomboomvendor page/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const rows = await prisma.$queryRawUnsafe(`
      SELECT count(*) 
      FROM booking_orders 
      WHERE pickup_pincode IS NULL 
        AND (pickup ~ '[1-9][0-9]{5}' OR drop_loc ~ '[1-9][0-9]{5}');
    `);
    console.log('Rows with regex pincode in pickup/drop:', rows);

    // Let's also check zone mapping:
    // E.g. 'Kolkata Airport' -> '700052'
    // 'Howrah Station' -> '711101'
    // 'Salt Lake' -> '700091'
    // 'Park Street' -> '700016'
    // 'New Town' -> '700156'
    // 'Sealdah' -> '700014'
    const zones = await prisma.$queryRawUnsafe(`
      SELECT pickup_zone, count(*) 
      FROM booking_orders 
      WHERE pickup_pincode IS NULL 
      GROUP BY pickup_zone;
    `);
    console.log('Zones for null pickup_pincode:', zones);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

