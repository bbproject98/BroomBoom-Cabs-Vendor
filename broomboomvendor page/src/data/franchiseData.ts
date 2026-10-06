import { FranchisePackage, Testimonial, FaqItem } from "@/types";

export const FRANCHISE_PACKAGES: FranchisePackage[] = [
  {
    id: "silver",
    name: "Silver Partner",
    tagline: "Booking Kiosk & Express Travel Outlet",
    subtitle: "Quick-start booking kiosk and express travel outlet",
    description: "Operate a compact booking outlet and earn commissions from cab, airport transfer, outstation, and rental bookings.",
    fleetSize: "1-5 cars",
    badge: "Quick Start Entry",
    originalPrice: "₹20,000",
    price: "₹5,000",
    discountTag: "75% OFF",
    dealTag: "Exclusive Deal",
    savings: "Save ₹15,000",
    investmentRange: "₹5,000 (Limited Offer)",
    minInvestment: 5000,
    maxInvestment: 20000,
    franchiseFee: "₹5,000 (Flat 75% OFF)",
    spaceRequired: "100 - 150 sq.ft (or Shop-in-Shop)",
    idealFor: "Travel Agents, Internet Cafes, Mall/Transit Kiosks, Retail Store Owners",
    commissionSlab: "15% - 20% Commission",
    roiPeriod: "3-5 Months",
    keyHighlights: [
      "Immediate activation within 7 working days",
      "Official BroomBoom branding kit & counter standee",
      "Dedicated Agent Booking Portal & POS tool",
      "Direct commission on Cabs, Outstation, Airport, Rentals",
    ],
    features: [
      "Airport transfer rides",
      "Station Transfer Rides",
      "Rental (1 hours 10 kms, 3 hours 30 kms, 5 hours 50 kms)",
      "No dedicated account manager",
      "15-20% commission",
      "1-5 cars",
      "GST and Gateway Charges is only Applicable",
    ],
    revenueStreams: [
      "8% to 12% commission on all local & outstation rides",
      "Airport transfer fixed markup commissions",
      "Package & holiday cab bundle earnings",
      "Driver referral bonus (₹500 per verified driver)",
    ],
  },
  {
    id: "gold",
    name: "Gold Partner",
    tagline: "Exclusive District Fleet & Hub Franchise",
    subtitle: "Exclusive district-level fleet and operations hub",
    description: "Operate a dedicated district hub, onboard drivers, and earn from ride commissions and fleet overrides.",
    fleetSize: "1-5 cars",
    popular: true,
    badge: "Most Popular • High ROI",
    originalPrice: "₹40,000",
    price: "₹10,000",
    discountTag: "75% OFF",
    dealTag: "Exclusive Deal",
    savings: "Save ₹30,000",
    investmentRange: "₹10,000 (Limited Offer)",
    minInvestment: 10000,
    maxInvestment: 40000,
    franchiseFee: "₹10,000 (Flat 75% OFF)",
    spaceRequired: "300 - 500 sq.ft Commercial Office",
    idealFor: "Established Entrepreneurs, Fleet Owners, Logistics Professionals",
    commissionSlab: "10% - 15% Commission + Fleet Overrides",
    roiPeriod: "5-8 Months",
    keyHighlights: [
      "Exclusive territorial rights for your District / Sub-City",
      "Driver onboarding hub with verification approval rights",
      "Double earning: Ride commissions + Recurring fleet override",
      "HQ-funded hyper-local digital marketing campaigns",
    ],
    features: [
      "Rental (08 hours 80 kms, 10 hours 100 kms, 12 hours 120 kms)",
      "Outstation (Oneway, roundtrip)",
      "Account manager",
      "10-15% commission",
      "1-5 cars",
      "GST and Gateway Charges is only Applicable",
    ],
    revenueStreams: [
      "15% to 20% booking commission on customer rides",
      "₹1,000 to ₹1,500 onboarding fee per active driver",
      "2% to 4% perpetual override on territory ride volume",
      "Corporate accounts & local business tie-up revenue",
      "Advertising displays in hub & cab branding cut",
    ],
  },
  {
    id: "platinum",
    name: "Platinum Partner",
    tagline: "Regional Master Franchise & State Hub",
    subtitle: "Regional master franchise and state-level operations hub",
    description: "Lead regional operations, appoint sub-franchisees, and earn from ride commissions, royalties, and enterprise fleet contracts.",
    fleetSize: "1-10 cars",
    badge: "Master Territory Exclusivity",
    originalPrice: "₹1,00,000",
    price: "₹20,000",
    discountTag: "80% OFF",
    dealTag: "Exclusive Deal",
    savings: "Save ₹80,000",
    investmentRange: "₹20,000 (Limited Offer)",
    minInvestment: 20000,
    maxInvestment: 100000,
    franchiseFee: "₹20,000 (Flat 80% OFF)",
    spaceRequired: "800 - 1,200 sq.ft Regional Headquarters",
    idealFor: "High Net-Worth Investors, Large Fleet Operators, Regional Corporates",
    commissionSlab: "0% Commission + Sub-Franchise Royalty",
    roiPeriod: "8-12 Months",
    keyHighlights: [
      "Complete Zone or Multi-District Master Exclusivity",
      "Right to appoint Silver & Gold franchisees in your territory",
      "Earn royalty on all sub-franchises + EV Fleet integration",
      "Direct Board-level advisory & HQ priority allocation",
    ],
    features: [
      "Tour Packages",
      "Corporate Rides",
      "Airport/Station Transfer",
      "Rental (08 hours 80 kms, 10 hours 100 kms, 12 hours 120 kms)",
      "Outstation (Oneway, roundtrip)",
      "Dedicated Account Manager",
      "0% commission",
      "1-10 cars",
      "GST and Gateway Charges is only Applicable",
    ],
    revenueStreams: [
      "Sub-franchise royalty & master override earnings (0% direct ride commission)",
      "Sub-franchise sign-up fee royalty share (up to 40%)",
      "Perpetual 1.5% - 2.5% master cut on all regional transactions",
      "EV charging hub revenue & fleet leasing margins",
      "Regional corporate logistics & enterprise fleet contracts",
    ],
  },
];

export const NETWORK_STATS = [
  { label: "Operating Cities", value: "120+", detail: "Pan-India Footprint" },
  { label: "Active Fleet & Drivers", value: "50,000+", detail: "Verified Partners" },
  { label: "Completed Rides", value: "5.2 Million+", detail: "Safe & On-Time" },
  { label: "Franchise Partners", value: "350+", detail: "Thriving Across India" },
  { label: "Avg. Partner ROI", value: "38.5%", detail: "Industry Leading" },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Rajesh Sharma",
    city: "Jaipur",
    state: "Rajasthan",
    tier: "Gold Vendor Partner",
    monthsActive: 14,
    monthlyRevenue: "₹2.8 Lakhs/mo",
    rating: 5,
    quote:
      "Partnering with BroomBoom transformed my business. The driver onboarding hub alone generates substantial recurring revenue. The MakeMyTrip-like tech portal makes managing bookings effortless.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "2",
    name: "Pooja Deshmukh",
    city: "Pune",
    state: "Maharashtra",
    tier: "Silver Kiosk Partner",
    monthsActive: 8,
    monthlyRevenue: "₹95,000/mo",
    rating: 5,
    quote:
      "I started with a small kiosk counter near the railway station with the Silver Package. Within 3 months I broke even! The BroomBoom brand attracts regular outstation commuters daily.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "3",
    name: "Vikram Singhania",
    city: "Lucknow & Kanpur",
    state: "Uttar Pradesh",
    tier: "Platinum Master Partner",
    monthsActive: 22,
    monthlyRevenue: "₹7.4 Lakhs/mo",
    rating: 5,
    quote:
      "The master partner model is exceptional. We have sub-franchisees operating across the zone, and the automated weekly settlement ensures complete peace of mind. Exceptional HQ support.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    category: "General",
    question: "What is BroomBoom Vendor Partner, and how does it work?",
    answer:
      "BroomBoom Vendor Partner allows entrepreneurs and fleet operators to partner with India's fastest-growing mobility network. Depending on your chosen package (Silver, Gold, or Platinum), you operate a booking counter, a dedicated city driver & customer hub, or an entire regional master zone, earning high commissions on every ride, driver onboarding, and corporate booking.",
  },
  {
    category: "Investment",
    question: "What is the total investment required, and are there hidden charges?",
    answer:
      "Our packages start at ₹5,000 for the Silver Partner kiosk, ₹10,000 for the Gold District Hub, and ₹20,000 for Platinum Regional Master. There are zero hidden royalties. The package fee covers the license, complete branding kit, portal access, onboarding training, and marketing launch support.",
  },
  {
    category: "Earnings",
    question: "What kind of ROI and monthly profits can I expect?",
    answer:
      "Our partners typically achieve breakeven within 3 to 8 months. Silver partners average net profits of ₹60,000 - ₹1,20,000/month, Gold partners make ₹2,00,000 - ₹4,50,000/month, while Platinum master partners frequently exceed ₹6,00,000+/month with sub-partner royalties.",
  },
  {
    category: "Operations",
    question: "Do I need prior experience in the cab or travel industry?",
    answer:
      "No prior experience is necessary! BroomBoom provides comprehensive, hands-on training covering customer booking portals, driver onboarding SOPs, local marketing, and fleet operations. A dedicated Territory Relationship Manager is assigned to support your daily operations.",
  },
  {
    category: "Operations",
    question: "How does BroomBoom support me in generating customer demand and drivers?",
    answer:
      "BroomBoom handles central digital marketing (Google Ads, Meta, SEO, local app store optimization) driving rides straight to your territory. For Gold & Platinum hubs, HQ allocates direct localized marketing budgets and connects you to our existing 50,000+ driver network.",
  },
  {
    category: "Investment",
    question: "Can I start with Silver and upgrade to Gold or Platinum later?",
    answer:
      "Yes! You can upgrade your model at any time by paying the differential investment, subject to territory availability for Gold or Platinum exclusivity in your desired city or district.",
  },
];

export const WHY_CHOOSE_US = [
  {
    icon: "ShieldCheck",
    title: "Established High-Trust Brand",
    description:
      "Leverage an established mobility network recognized nationwide for safety, transparent pricing, and quality service.",
  },
  {
    icon: "TrendingUp",
    title: "Multiple Recurring Revenue Streams",
    description:
      "Earn not just on customer rides, but on driver onboarding bounties, territory volume overrides, airport transfers, and corporate contracts.",
  },
  {
    icon: "Laptop",
    title: "Cutting-Edge MMT-Grade Tech",
    description:
      "Get our partner admin console, driver verification engine, real-time dispatch, and automated instant commission settlement tool.",
  },
  {
    icon: "Megaphone",
    title: "360° HQ Marketing Blitz",
    description:
      "From billboards and retail point-of-sale branding to local Google ads and social media campaigns funded directly by headquarters.",
  },
  {
    icon: "GraduationCap",
    title: "Comprehensive 1-on-1 Training",
    description:
      "End-to-end training for you and your staff on lead conversion, customer hospitality, driver fleet management, and emergency response.",
  },
  {
    icon: "Headphones",
    title: "Dedicated Partner Relationship Desk",
    description:
      "Never run alone. A designated Territory Manager is available 24/7 to resolve issues, optimize fleet density, and maximize your profitability.",
  },
];

export const ONBOARDING_STEPS = [
  {
    step: "01",
    title: "Submit Online Application",
    desc: "Fill out the inquiry form with your preferred package, city, and investment readiness.",
  },
  {
    step: "02",
    title: "Consultation & Location Feasibility",
    desc: "Our Senior Director connects with you for profile review, territory exclusivity check, and business plan.",
  },
  {
    step: "03",
    title: "Agreement & Store Branding",
    desc: "Sign the agreement, secure your exclusive zone, and set up your counter/hub using our architectural brand kit.",
  },
  {
    step: "04",
    title: "HQ Training & Grand Launch",
    desc: "Complete the 7-day operational training, turn on your partner portal, launch local marketing blitz, and start earning!",
  },
];