export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category:
    | "Earnings & Strategy"
    | "Territory Hubs"
    | "Fleet Operations"
    | "Corporate & Airport";
  cityFocus: string;
  readTime: string;
  publishedAt: string;
  author: string;
  authorRole: string;
  image: string;
  featured?: boolean;
  keyTakeaways: string[];
  sections: {
    heading: string;
    paragraphs: string[];
  }[];
}

export const BLOG_CATEGORIES = [
  "All",
  "Earnings & Strategy",
  "Territory Hubs",
  "Fleet Operations",
  "Corporate & Airport",
] as const;

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "maximize-airport-and-station-trips-silver-partner-guide",
    title:
      "How Silver Partners Maximize Daily Airport & Station Trips Without Idle Waiting",
    excerpt:
      "Learn how ward-level pincode allocation and automated airport queue matching help 1-5 cab owners turn morning and late-night terminal arrivals into predictable daily bank payouts.",
    category: "Corporate & Airport",
    cityFocus: "Kolkata, Delhi & Bangalore",
    readTime: "5 min read",
    publishedAt: "November 2026",
    author: "BroomBoom Fleet Strategy Desk",
    authorRole: "Airport & Transit Operations",
    image: "/images/travel-airport.jpg",
    featured: true,
    keyTakeaways: [
      "Silver Partner kiosks match ward-level pincodes directly to nearby airport and railway station pickups.",
      "Short rental packages (1 hr/10 km, 3 hr/30 km, 5 hr/50 km) fill midday gaps between flight banks.",
      "Automated daily bank settlements keep working capital liquid for fuel and driver advances.",
    ],
    sections: [
      {
        heading: "Why Airport & Station Transfers Beat Random Street Hail",
        paragraphs: [
          "Empty return legs and unpredictable street demand eat into profitability for small operators with 1 to 5 cabs. Airport terminals like NSCBI Kolkata, IGI Delhi, and KIA Bangalore generate scheduled arrival waves throughout the day.",
          "With a Silver Partner Ward Kiosk allocation, bookings placed in your mapped pincode zone route straight to your vendor console first—reducing dead mileage and stabilizing trip utilization.",
        ],
      },
      {
        heading: "Stacking Short Rentals Between Terminal Waves",
        paragraphs: [
          "Peak flight arrivals typically cluster between 6:00 AM–10:30 AM and 5:30 PM–11:30 PM. During midday hours, Silver Partners can activate 1-hour, 3-hour, and 5-hour rental blocks for business visitors and local families.",
          "Keeping utilization high across every 12-hour shift lets a compact fleet outperform unorganized aggregator driving while maintaining clear transparent slabs (15–20% commission).",
        ],
      },
    ],
  },
  {
    slug: "outstation-return-leg-economics-gold-partner-playbook",
    title:
      "Outstation Return-Leg Economics: Scaling From 2 Cars to a District Hub",
    excerpt:
      "Why district-exclusive Gold Partners earn higher margins on one-way intercity routes like Pune–Mumbai, Kolkata–Durgapur, and Delhi–Jaipur with priority dispatch.",
    category: "Earnings & Strategy",
    cityFocus: "Mumbai, Pune & Delhi NCR",
    readTime: "6 min read",
    publishedAt: "November 2026",
    author: "Arjun Sengupta",
    authorRole: "Head of Partner Expansion",
    image: "/images/travel-roadtrip.jpg",
    keyTakeaways: [
      "One-way outstation bookings stay profitable when paired with return-corridor dispatch priority.",
      "08h/80km, 10h/100km, and 12h/120km rental slabs attract steady corporate day-charters.",
      "Gold Partner account managers assist with driver compliance and highway route scheduling.",
    ],
    sections: [
      {
        heading: "Solving the Biggest Risk in Outstation Cab Operations",
        paragraphs: [
          "The #1 profit leak in intercity travel is returning with an empty cabin on routes such as Pune–Mumbai Express corridor or Delhi–Agra. Gold Partners tap into BroomBoom's district dispatch network to match return passengers on high-traffic corridors.",
          "Instead of discounting heavily to fill seats via informal WhatsApp groups, verified partners see pre-vetted app and web bookings with transparent fare breakdowns inside the Vendor Dashboard.",
        ],
      },
      {
        heading: "Why District Exclusivity Matters",
        paragraphs: [
          "Gold Partner status lowers platform commissions to 10–15% while prioritizing 8-hour, 10-hour, and 12-hour executive rentals. Combined with dedicated Account Manager check-ins, agencies can grow safely from 2 vehicles to a multi-driver district hub.",
        ],
      },
    ],
  },
  {
    slug: "zero-commission-platinum-corporate-fleet-model",
    title:
      "Inside the 0% Commission Platinum Partner Model for Corporate & Tour Fleets",
    excerpt:
      "Discover how operators with 5 to 10+ cabs eliminate per-trip platform fees and capture recurring MNC employee transport and multi-day tour itineraries.",
    category: "Territory Hubs",
    cityFocus: "Hyderabad, Bangalore & Mumbai",
    readTime: "4 min read",
    publishedAt: "October 2026",
    author: "Rituja Deshmukh",
    authorRole: "Enterprise Mobility Lead",
    image: "/images/benefit-commission.jpg",
    keyTakeaways: [
      "Platinum Master Hubs operate at 0% platform commission across all booking categories.",
      "Includes corporate duties, curated tour packages, airport/station transfers, long rentals, and outstation rides.",
      "Best suited for established travel agencies running 1–10+ sedans, SUVs, and tempo travellers.",
    ],
    sections: [
      {
        heading: "Transitioning From Commission Eats to Fixed Margin Retention",
        paragraphs: [
          "When running a 6-to-10-vehicle fleet across tech parks in HITEC City, Whitefield, or BKC, even a 15% aggregator fee represents tens of thousands of rupees per month.",
          "BroomBoom's Platinum Partner tier drops per-ride commission to 0% so every corporate billing cycle, tour charter, and airport duty flows directly to your vendor ledger.",
        ],
      },
      {
        heading: "Single Console for All Verticals",
        paragraphs: [
          "Rather than juggling separate sheets for corporate retainers and weekend family tour packages, Platinum vendors receive unified pincode dispatch, GST ledger exports, and a Dedicated Account Manager.",
        ],
      },
    ],
  },
  {
    slug: "pincode-wise-dispatch-and-waterfall-routing-explained",
    title:
      "Pincode-Wise Dispatch & Plan Waterfall: How Bookings Reach Your Vendor Dashboard",
    excerpt:
      "A behind-the-scenes look at how customer bookings from the BroomBoom User App and Website match your registered pincode and tier plan in real time.",
    category: "Fleet Operations",
    cityFocus: "All 6 Metro Hubs",
    readTime: "5 min read",
    publishedAt: "October 2026",
    author: "BroomBoom Engineering Team",
    authorRole: "Dispatch Architecture",
    image: "/images/benefit-dashboard.jpg",
    keyTakeaways: [
      "Incoming app & web bookings inspect pickup pincode + booking category (Airport, Rental, Outstation, Tour, Corporate).",
      "Silver handles Airport/Station/Short Rentals; Gold owns Outstation & Long Rentals; Platinum unlocks all categories at 0% commission.",
      "Unaccepted or rejected bookings automatically waterfall to the next active partner matching that plan and zone.",
    ],
    sections: [
      {
        heading: "Right Booking, Right Partner, Right Territory",
        paragraphs: [
          "Every trip request placed by passengers contains critical attributes: pickup pincode, service category, and trip duration. Our dispatch router filters for active verified partners serving that exact pincode area whose partner tier covers that trip type.",
          "If a primary partner is at capacity or rejects a ride, the system automatically cascades the order to the next eligible partner within that same plan tier—keeping passenger wait times low and partner fill rates high.",
        ],
      },
    ],
  },
  {
    slug: "commercial-cab-onboarding-checklist-2026",
    title:
      "2026 Commercial Cab & Driver Verification Checklist for Faster Onboarding",
    excerpt:
      "Avoid verification delays by preparing yellow-plate RC, commercial insurance, fitness, PUC, and driver KYC documents cleanly before uploading to the Vendor Portal.",
    category: "Fleet Operations",
    cityFocus: "Pan-India Vendors",
    readTime: "4 min read",
    publishedAt: "September 2026",
    author: "Compliance & Onboarding Desk",
    authorRole: "Vendor Quality Assurance",
    image: "/images/benefit-training.jpg",
    keyTakeaways: [
      "Keep clear, glare-free photos of yellow-board RC, valid permit, comprehensive commercial insurance, and fitness certificates.",
      "Ensure driver commercial license (TR/Transport badge) and Aadhaar details match the active assignment.",
      "Once uploaded, verification typically clears within 24 hours so you can accept orders immediately.",
    ],
    sections: [
      {
        heading: "5 Documents Every Commercial Partner Should Prepare Upfront",
        paragraphs: [
          "Smooth onboarding starts with legible, up-to-date vehicle paperwork: Certificate of Registration (RC), Commercial Vehicle Insurance policy, State or All-India Tourist Permit (AITP), Fitness Certificate, and valid PUC.",
          "Paired with your driver's active commercial driving licence and bank account details for automated payouts, your territory profile can move from application to dispatch-ready inside a single business day.",
        ],
      },
    ],
  },
  {
    slug: "capturing-festive-and-heritage-tourism-demand-with-broomboom",
    title:
      "Capturing Festive & Heritage Tourism Surge With Managed Multi-Day Packages",
    excerpt:
      "Peak holiday months create massive demand for SUVs and sedans across Golden Triangle, Konkan Coast, and East India circuits. Position your fleet early.",
    category: "Corporate & Airport",
    cityFocus: "Kolkata, Delhi & Pune",
    readTime: "4 min read",
    publishedAt: "September 2026",
    author: "Vikramaditya Roy",
    authorRole: "Tourism & Charter Partnerships",
    image: "/images/travel-tajmahal.jpg",
    keyTakeaways: [
      "Tour package leads generate multi-day consecutive vehicle lock-ins with minimal idle downtime.",
      "SUVs (Ertiga, Carens, Innova Crysta) see the highest holiday booking conversion rates.",
      "Pre-allocated drivers with route familiarity earn stronger repeat ratings and tips.",
    ],
    sections: [
      {
        heading: "Turning Weekend Peaks Into 5-Day Revenue Blocks",
        paragraphs: [
          "Single-day transfers fill daily fuel cash flow, while managed heritage tours and corporate offsites lock in higher ticket bookings over 3 to 7 consecutive days.",
          "Platinum Partners gain priority access to BroomBoom Tour Packages alongside year-round airport and corporate duties—smoothing seasonal dips cleanly.",
        ],
      },
    ],
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
