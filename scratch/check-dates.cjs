const { PrismaClient } = require('c:/Users/ADMIN/Downloads/BroomBoom-Cabs-Vendor/Broomboomvendor page/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const dates = await prisma.$queryRawUnsafe(`
      SELECT DATE(created_at) as d, count(*) 
      FROM booking_orders 
      GROUP BY DATE(created_at) 
      ORDER BY d DESC;
    `);
    console.log('Creation dates:', dates);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

