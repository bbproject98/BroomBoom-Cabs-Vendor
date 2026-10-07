require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const leads = await prisma.vendorLead.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
  });
  console.log('--- RECENT LEADS ---');
  leads.forEach((l) =>
    console.log(
      JSON.stringify({
        mobile: l.mobile,
        appId: l.applicationId,
        status: l.status,
        name: l.fullName,
      })
    )
  );

  const subs = await prisma.vendorSubscription.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
  });
  console.log('--- RECENT SUBSCRIPTIONS ---');
  subs.forEach((s) =>
    console.log(
      JSON.stringify({
        mobile: s.vendorMobile,
        appId: s.applicationId,
        paymentStatus: s.paymentStatus,
        status: s.status,
        orderId: s.orderId,
      })
    )
  );
}

main().finally(() => prisma.$disconnect());

