import { VendorTier, Testimonial, FaqItem, VendorHub } from "@/types";

export const VENDOR_TIERS: VendorTier[] = [
  {
    id: "individual",
    name: "Individual Cab Owner",
    tagline: "Single & Multi-Car Owner-Driver Fleet Attachment",
    badge: "Quick Start • Zero Setup Fee",
    originalPrice: "₹20,000",
    price: "₹10,000",
    discountTag: "50% OFF",
    dealTag: "Exclusive Deal",
    savings: "Save ₹10,000",
    fleetSize: "1-5 Cabs",
    commissionSlab: "0% Commission First 30 Days, then 8% - 10%",
    payoutSchedule: "Daily Instant Payouts directly to Bank",
    onboardingTime: "Under 24 Hours",
    idealFor: "Owner-cum-Drivers, Single & Double Cab Owners, Local Taxi Operators",
    estimatedMonthlyPerCab: "₹45,000 - ₹75,000 / cab",
    keyHighlights: [
      "Lightning-fast 24-hour document verification & live activation",
      "Zero upfront onboarding fees or mandatory security deposit",
      "Daily automated bank payout settlement every evening",
      "Flexible duty hours with high-demand outstation one-way trips",
    ],
    features: [
      "Access to official BroomBoom Driver & Vendor Mobile App",
      "Instant trip dispatch with optimized return-trip algorithms",
      "Fastag recharge assistance & fleet fuel discount vouchers",
      "24x7 roadside emergency & on-trip passenger SOS assistance",
      "Transparent trip-by-trip earnings breakdown with zero surprises",
      "Zero penalty on genuine ride cancellations or re-routing",
      "Free vehicle branding decals and door stickers (optional)",
    ],
    revenueStreams: [
      "Local city rides with guaranteed base fare protection",
      "Airport pickup & drop premium fixed markups",
      "Outstation round-trips & assured return leg passenger matching",
      "Driver referral bonuses (₹1,000 per attached vehicle friend)",
    ],
  },
  {
    id: "fleet",
    name: "Fleet Partner / Travel Agency",
    tagline: "Multi-Vehicle Commercial Operators & Travel Agencies",
    popular: true,
    badge: "Most Popular • High Trip Volume",
    originalPrice: "₹40,000",
    price: "₹20,000",
    discountTag: "50% OFF",
    dealTag: "Exclusive Deal",
    savings: "Save ₹20,000",
    fleetSize: "1-5 Cabs",
    commissionSlab: "5% - 8% Preferred Vendor Slab + Volume Rebates",
    payoutSchedule: "Weekly Bulk Settlement + Daily Fuel Advances",
    onboardingTime: "48 - 72 Hours",
    idealFor: "Travel Agencies, Car Rental Companies, Fleet Operators, Transport Contractors",
    estimatedMonthlyPerCab: "₹55,000 - ₹90,000 / cab",
    keyHighlights: [
      "Dedicated Fleet Manager & Priority Trip Dispatch Engine",
      "Bulk corporate booking & outstation holiday route allocations",
      "Comprehensive Vendor Web Console for driver & trip monitoring",
      "Weekly bulk payments with daily fuel advance credit options",
    ],
    features: [
      "Full Enterprise Vendor Web Dashboard access for desktop & mobile",
      "Real-time GPS vehicle tracking & automated driver duty roaster",
      "Pre-assigned high-value outstation & corporate client trips",
      "Fuel advance credit facility to ensure uninterrupted fleet operations",
      "Automated GST billing, client e-invoicing & monthly ledger sheets",
      "Driver recruitment assistance from certified BroomBoom driver database",
      "Dedicated Account Relationship Manager (ARM) assigned to your fleet",
      "Priority physical vehicle inspection & fast-track Fastag fitting",
    ],
    revenueStreams: [
      "High-margin corporate employee transfers & executive airport runs",
      "Multi-day outstation tourist holiday packages & wedding cab rentals",
      "Bulk airport transfers with reserved terminal entry privileges",
      "Tier-2 volume performance bonus and quarterly fuel cashbacks",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise Fleet & Bus Operator",
    tagline: "Large Fleet Companies & Commercial Transport Transporters",
    badge: "Enterprise SLA • Guaranteed Retainers",
    originalPrice: "₹1,00,000",
    price: "₹50,000",
    discountTag: "50% OFF",
    dealTag: "Exclusive Deal",
    savings: "Save ₹50,000",
    fleetSize: "16+ Cabs, Tempo Travellers & Buses",
    commissionSlab: "Custom SLA (Down to 3% - 5%) + Guaranteed Retainers",
    payoutSchedule: "Bi-Weekly / Monthly Enterprise Contract Billing",
    onboardingTime: "3 - 5 Days",
    idealFor: "Large Scale Fleet Operators, Bus & Tempo Fleets, Luxury Car Rental Companies",
    estimatedMonthlyPerCab: "₹70,000 - ₹1,20,000+ / cab",
    keyHighlights: [
      "Guaranteed monthly vehicle retainers on select corporate routes",
      "Direct API / Webhook integration with your existing fleet ERP",
      "Dedicated Operations Desk & 24/7 Route Dispatch Controllers",
      "BroomBoom Airport Exclusive Booth & Rail Hub Priority",
    ],
    features: [
      "Custom enterprise SLA with guaranteed minimum monthly trip allocations",
      "Full API integration with your internal fleet ERP & telematics devices",
      "Dedicated senior account director and round-the-clock dispatch desk",
      "Long-term corporate enterprise contracts, MNC shuttles & event logistics",
      "Customized invoicing, pooled driver management & compliance reports",
      "Bulk tire, battery & vehicle insurance corporate group discounts",
      "Quarterly business review and dedicated route expansion planning",
    ],
    revenueStreams: [
      "Long-term corporate lease & daily dedicated office runs",
      "Large event, conference & government transport contracts",
      "Inter-city luxury bus & tempo traveller tour bookings",
      "Direct enterprise retainers with guaranteed monthly minimums",
    ],
  },
];

export const VENDOR_PACKAGES = [
  {
    id: "silver",
    name: "Silver Partner",
    subtitle: "Airport, Station & Short Rentals",
    fleetSize: "1-5 Cabs",
    originalPrice: "₹20,000",
    price: "₹10,000",
    discountTag: "50% OFF",
    dealTag: "Exclusive Deal",
    savings: "Save ₹10,000",
    description:
      "Ideal for individual cab owners, booking counters and operators with 1-5 cars.",
    features: [
      "Airport transfer rides",
      "Station Transfer Rides",
      "Rental (1 hours 10 kms, 3 hours 30 kms, 5 hours 50 kms)",
      "No dedicated account manager",
      "15-20% commission",
      "1-5 cars",
    ],
  },
  {
    id: "gold",
    name: "Gold Partner",
    subtitle: "Outstation & Long Rentals",
    popular: true,
    fleetSize: "1-5 Cabs",
    originalPrice: "₹40,000",
    price: "₹20,000",
    discountTag: "50% OFF",
    dealTag: "Exclusive Deal",
    savings: "Save ₹20,000",
    description:
      "Ideal for travel agencies and small fleet operators needing outstation and long-duration rentals.",
    features: [
      "Rental (08 hours 80 kms, 10 hours 100 kms, 12 hours 120 kms)",
      "Outstation (Oneway, roundtrip)",
      "Account manager",
      "10-15% commission",
      "1-5 cars",
    ],
  },
  {
    id: "platinum",
    name: "Platinum Partner",
    subtitle: "Corporate, Tours & Full Fleet",
    fleetSize: "1 - 10 Cabs",
    originalPrice: "₹1,00,000",
    price: "₹50,000",
    discountTag: "50% OFF",
    dealTag: "Exclusive Deal",
    savings: "Save ₹50,000",
    description:
      "Complete plan for corporate rides, tour packages, airport/station transfers, outstation and rentals.",
    features: [
      "Tour Packages",
      "Corporate Rides",
      "Airport/Station Transfer",
      "Rental (08 hours 80 kms, 10 hours 100 kms, 12 hours 120 kms)",
      "Outstation (Oneway, roundtrip)",
      "Dedicated Account Manager",
      "5% commission",
      "1-10 cars",
    ],
  },
];

export const NETWORK_STATS = [
  { label: "Operating Cities", value: "120+", detail: "Pan-India Footprint" },
  { label: "Active Attached Fleet", value: "50,000+", detail: "Sedans, SUVs & Cabs" },
  { label: "Completed Trips", value: "5.2 Million+", detail: "Safe & On-Time Trips" },
  { label: "Attached Fleet Vendors", value: "12,000+", detail: "Thriving Across India" },
  { label: "Avg. Monthly per Cab", value: "₹65,000+", detail: "Industry Leading Payout" },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Suresh Rathore",
    city: "Jaipur",
    state: "Rajasthan",
    tier: "Fleet Partner (8 Cabs)",
    monthsActive: 16,
    monthlyRevenue: "₹5.8 Lakhs/mo",
    rating: 5,
    quote:
      "Attaching my 8 cabs with BroomBoom was the best decision for my travel agency. The outstation bookings from Jaipur to Delhi and Udaipur keep my drivers constantly occupied with zero dead kilometers.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "2",
    name: "Anirban Mukherjee",
    city: "Kolkata",
    state: "West Bengal",
    tier: "Travel Agency Partner (14 Cabs)",
    monthsActive: 12,
    monthlyRevenue: "₹9.4 Lakhs/mo",
    rating: 5,
    quote:
      "The Vendor Web Dashboard makes tracking 14 cars and drivers completely effortless. Payouts arrive every Tuesday without fail, and the corporate airport duties provide steady, high-margin revenues.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "3",
    name: "Mahesh Patil",
    city: "Pune",
    state: "Maharashtra",
    tier: "Individual Cab Owner (2 Cabs)",
    monthsActive: 9,
    monthlyRevenue: "₹1.45 Lakhs/mo",
    rating: 5,
    quote:
      "I run two Ertigas between Pune and Mumbai. The daily bank settlement means I never run out of diesel money. 0% commission in my first month helped me set up my business smoothly.",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    category: "General",
    question: "What is BroomBoom Vendor Partner, and how does fleet attachment work?",
    answer:
      "BroomBoom Vendor Partner is an attachment ecosystem for commercial taxi owners, travel agencies, and fleet operators. You attach your vehicles (sedans, SUVs, hatchbacks, tempo travellers, or buses) to our network to receive daily local, outstation, airport, and corporate bookings, with high payouts settled directly to your bank account.",
  },
  {
    category: "Attachment",
    question: "Is there any initial attachment or onboarding fee to join?",
    answer:
      "No! There is zero upfront attachment fee for attaching your vehicles with BroomBoom. We offer a 0% commission promotional window for the first 30 days so you can test our high trip volume and on-time payouts with complete peace of mind.",
  },
  {
    category: "Documents",
    question: "What documents are required to attach commercial cabs?",
    answer:
      "You will need: (1) Vehicle Registration Certificate (RC) with yellow commercial plate, (2) Valid Commercial Vehicle Insurance, (3) State/All India Tourist Permit (AITP), (4) Fitness Certificate, (5) Pollution Certificate (PUC), and (6) Driver Commercial License and Aadhaar card.",
  },
  {
    category: "Payouts",
    question: "How and when do I receive trip payments and payouts?",
    answer:
      "Individual cab owners receive daily automated payouts directly into their registered bank account every evening. Multi-car fleet partners enjoy weekly bulk automated transfers along with daily fuel advance allowances, ensuring your fleet never stalls.",
  },
  {
    category: "Fleet Ops",
    question: "Can I manage multiple drivers and vehicles through a single login?",
    answer:
      "Yes! Our dedicated BroomBoom Vendor Web & Mobile Portal allows you to monitor all your vehicles in real-time on live maps, assign trips to specific drivers, track daily/monthly revenues, view fuel logs, and download automated GST invoices.",
  },
  {
    category: "Attachment",
    question: "What vehicle categories are eligible for attachment?",
    answer:
      "We accept: Hatchbacks (WagonR, Tiago, etc.), Prime Sedans (Dzire, Etios, Aura), Prime SUVs (Ertiga, Carens, Innova Crysta), Luxury Sedans (Camry, BMW, Mercedes), Tempo Travellers (12-26 seaters), and Mini-buses. Vehicles should ideally be 2017 or newer and in good condition.",
  },
];

export const WHY_CHOOSE_US = [
  {
    id: 1,
    title: "Attractive & Transparent Slabs",
    desc: "0% commission promotional launch window followed by industry-lowest vendor commission slabs. Zero hidden penalties or deductions.",
    image: "/images/benefit-commission.jpg",
  },
  {
    id: 2,
    title: "Best-in-Class Technical Dispatch",
    desc: "Intelligent trip matching algorithm guarantees high outstation one-way utilization and assured return-leg passenger bookings.",
    image: "/images/benefit-support.jpg",
  },
  {
    id: 3,
    title: "Fuel Advances & On-Time Payouts",
    desc: "Daily automated direct bank settlements and fuel credit options to keep your cabs rolling without operational cash crunches.",
    image: "/images/benefit-branding.jpg",
  },
  {
    id: 4,
    title: "Dedicated Vendor Relationship Desk",
    desc: "A designated Account Relationship Manager (ARM) available 24/7 to resolve dispatch inquiries, toll queries, and trip disputes.",
    image: "/images/benefit-manager.jpg",
  },
  {
    id: 5,
    title: "High-Margin Corporate & Airport Surge",
    desc: "Get exclusive direct access to MNC employee transportation, wedding car rentals, and pre-booked airport transfers nationwide.",
    image: "/images/benefit-training.jpg",
  },
  {
    id: 6,
    title: "Comprehensive Business Dashboard",
    desc: "State-of-the-art vendor console to monitor real-time vehicle GPS, driver attendance, trip histories, and automated GST ledgers.",
    image: "/images/benefit-dashboard.jpg",
  },
];

export const ONBOARDING_STEPS = [
  {
    stepNumber: "01",
    title: "Fill Online Fleet Form",
    subtitle: "Quick Online Application",
    description:
      "Submit your vehicle count, preferred cities, and contact details in under 2 minutes. No physical paperwork needed at this stage.",
    badge: "2 Mins",
  },
  {
    stepNumber: "02",
    title: "Quick Document Verification",
    subtitle: "Digital Check Within 24 Hrs",
    description:
      "Upload vehicle RC, commercial permit, insurance, and driver license on our partner portal for rapid verification by our operations team.",
    badge: "Within 24 Hrs",
  },
  {
    stepNumber: "03",
    title: "Vendor Console & App Setup",
    subtitle: "Fleet Credentials Issued",
    description:
      "Get access to your BroomBoom Vendor Dashboard, link your drivers, configure payout bank accounts, and pick up optional branding kits.",
    badge: "Instant Setup",
  },
  {
    stepNumber: "04",
    title: "Start Trips & Earn Daily",
    subtitle: "Receive High-Yield Bookings",
    description:
      "Turn on availability, dispatch your fleet to high-paying local, airport, and outstation trips, and enjoy automated daily bank deposits!",
    badge: "Go Live Fast",
  },
];

export const FALLBACK_HUBS: VendorHub[] = [
  {
    id: "hub-1",
    city: "Kolkata",
    state: "West Bengal",
    type: "Regional Fleet Operations Hub",
    tier: "Regional Master Hub",
    address: "Salt Lake Sector V, Near College More, Kolkata - 700091",
    phone: "6289952418-270-6600",
    openHours: "9:00 AM - 8:00 PM",
    isActive: true,
  },
  {
    id: "hub-2",
    city: "Lucknow",
    state: "Uttar Pradesh",
    type: "Vendor Verification & Inspection Center",
    tier: "Fleet Verification Hub",
    address: "Hazratganj Main Market, Near Metro Station, Lucknow - 226001",
    phone: "6289952418-270-6600",
    openHours: "9:30 AM - 7:30 PM",
    isActive: true,
  },
  {
    id: "hub-3",
    city: "Jaipur",
    state: "Rajasthan",
    type: "Fleet Verification & Fastag Center",
    tier: "Fleet Verification Hub",
    address: "MI Road, Commercial Hub, Jaipur - 302001",
    phone: "6289952418-270-6600",
    openHours: "9:00 AM - 8:00 PM",
    isActive: true,
  },
  {
    id: "hub-4",
    city: "Patna",
    state: "Bihar",
    type: "Express Vendor Onboarding Desk",
    tier: "Express Onboarding Desk",
    address: "Fraser Road, Near Railway Station Junction, Patna - 800001",
    phone: "6289952418-270-6600",
    openHours: "8:00 AM - 9:00 PM",
    isActive: true,
  },
  {
    id: "hub-5",
    city: "Pune",
    state: "Maharashtra",
    type: "Fleet Verification & Dispatch Desk",
    tier: "Fleet Verification Hub",
    address: "Shivaji Nagar, Near Pune Railway Station, Pune - 411005",
    phone: "6289952418-270-6600",
    openHours: "9:00 AM - 8:00 PM",
    isActive: true,
  },
  {
    id: "hub-6",
    city: "Delhi NCR",
    state: "Delhi",
    type: "Regional Fleet Operations Hub",
    tier: "Regional Master Hub",
    address: "Connaught Place, Barakhamba Road, New Delhi - 110001",
    phone: "6289952418-270-6600",
    openHours: "8:30 AM - 8:30 PM",
    isActive: true,
  },
];