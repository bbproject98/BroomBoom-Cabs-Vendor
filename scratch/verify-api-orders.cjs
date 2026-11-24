const { PrismaClient } = require('c:/Users/ADMIN/Downloads/BroomBoom-Cabs-Vendor/Broomboomvendor page/node_modules/@prisma/client');
const prisma = new PrismaClient();

// Since ordersService is a TS file, let's test via direct query replicating the exact function
async function testEndpoint() {
  const cases = [
    { name: "Silver Partner in Singur", vId: "BB-VENDOR-2026-8778", tier: "silver", pin: "712124", city: "SINGUR" },
    { name: "Gold Partner in Singur", vId: "BB-VENDOR-2026-5058", tier: "gold", pin: "712124", city: "SINGUR" },
    { name: "Platinum Partner in Singur", vId: "BB-VENDOR-2026-1090", tier: "platinum", pin: "712124", city: "SINGUR" },
    { name: "Silver Partner in Airport", vId: "BB-VENDOR-AIRPORT", tier: "silver", pin: "700052", city: "Kolkata" },
    { name: "Gold Partner in Kolkata Central", vId: "BB-VENDOR-KOLKATA", tier: "gold", pin: "700001", city: "Kolkata" },
  ];

  for (const c of cases) {
    console.log(`\n========================================`);
    console.log(`TEST: ${c.name} (${c.tier.toUpperCase()}, PIN: ${c.pin})`);
    console.log(`========================================`);

    // Call http://localhost:3000/api/vendor/orders
    const url = `http://localhost:3000/api/vendor/orders?vendorId=${encodeURIComponent(c.vId)}&planTier=${encodeURIComponent(c.tier)}&pincode=${encodeURIComponent(c.pin)}&city=${encodeURIComponent(c.city)}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      console.log(`HTTP Status: ${res.status}`);
      console.log(`Success: ${data.success}`);
      console.log(`Total orders returned: ${data.total}`);

      if (data.orders && data.orders.length > 0) {
        const plans = new Set(data.orders.map(o => o.planTier));
        const pins = new Set(data.orders.map(o => o.pickupPincode));
        console.log(`Plan tiers in result:`, Array.from(plans));
        console.log(`Pincodes in result:`, Array.from(pins));

        // Assert all match requested tier
        const nonMatchingTier = data.orders.filter(o => (o.planTier || '').toLowerCase() !== c.tier.toLowerCase());
        if (nonMatchingTier.length > 0) {
          console.error(`FAILED: Found ${nonMatchingTier.length} orders not matching tier ${c.tier}!`);
        } else {
          console.log(`PASSED: 100% of orders strictly match Plan Tier: ${c.tier}`);
        }

        console.log(`Sample order:`, {
          id: data.orders[0].id,
          bookingId: data.orders[0].bookingId,
          planTier: data.orders[0].planTier,
          pickup: data.orders[0].pickup,
          pickupPincode: data.orders[0].pickupPincode,
          drop: data.orders[0].drop,
          vendorPayout: data.orders[0].vendorPayout,
          status: data.orders[0].status
        });
      } else {
        console.warn(`WARNING: 0 orders returned for ${c.name}`);
      }
    } catch (err) {
      console.error(`Fetch error for ${c.name}:`, err.message);
    }
  }
}

testEndpoint().finally(() => prisma.$disconnect());
