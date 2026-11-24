const { PrismaClient } = require('c:/Users/ADMIN/Downloads/BroomBoom-Cabs-Vendor/Broomboomvendor page/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.$queryRawUnsafe('SELECT count(*) FROM booking_orders;');
    console.log('booking_orders count:', count);
    const sample = await prisma.$queryRawUnsafe('SELECT id, booking_id, plan_tier, pickup, pickup_pincode, drop_loc, assigned_vendor_id, status FROM booking_orders ORDER BY created_at DESC LIMIT 15;');
    console.log('Sample rows:', JSON.stringify(sample, null, 2));

    const vendors = await prisma.vendorSubscription.findMany({ select: { id: true, applicationId: true, planTier: true, city: true, vendorName: true } });
    console.log('Subscriptions:', JSON.stringify(vendors, null, 2));

    const leads = await prisma.vendorLead.findMany({ select: { id: true, applicationId: true, preferredPackage: true, city: true, pincode: true, fullName: true }, take: 10 });
    console.log('Leads:', JSON.stringify(leads, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

