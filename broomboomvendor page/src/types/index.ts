export interface FranchisePackage {
  id: "silver" | "gold" | "platinum";
  name: string;
  tagline: string;
  popular?: boolean;
  badge?: string;
   subtitle: string;
   description: string;
   fleetSize: string;
  originalPrice?: string;
  price?: string;
  discountTag?: string;
  dealTag?: string;
  savings?: string;
  investmentRange: string;
  minInvestment: number;
  maxInvestment: number;
  franchiseFee: string;
  spaceRequired: string;
  idealFor: string;
  commissionSlab: string;
  roiPeriod: string;
  keyHighlights: string[];
  features: string[];
  revenueStreams: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  city: string;
  state: string;
  tier: string;
  monthsActive: number;
  monthlyRevenue: string;
  rating: number;
  quote: string;
  avatar: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  category: "General" | "Investment" | "Operations" | "Earnings" | "Attachment" | "Documents" | "Payouts" | "Fleet Ops";
}

export interface FranchiseInquiry {
  fullName: string;
  email: string;
  mobile: string;
  state: string;
  city: string;
  preferredPackage: "silver" | "gold" | "platinum" | "undecided";
  investmentBudget: string;
  hasExperience: string;
  message?: string;
}

export interface FranchiseHub {
  id: string;
  city: string;
  state: string;
  type: string;
  tier: "Silver" | "Gold" | "Platinum";
  address: string;
  phone: string;
  openHours: string;
  isActive: boolean;
  createdAt?: string;
}

export interface VendorTier {
  id: "individual" | "fleet" | "enterprise";
  name: string;
  tagline: string;
  fleetSize: string;
  popular?: boolean;
  badge?: string;
  originalPrice?: string;
  price?: string;
  discountTag?: string;
  dealTag?: string;
  savings?: string;
  commissionSlab: string;
  payoutSchedule: string;
  onboardingTime: string;
  idealFor: string;
  estimatedMonthlyPerCab: string;
  keyHighlights: string[];
  features: string[];
  revenueStreams: string[];
}

export interface VendorHub {
  id: string;
  city: string;
  state: string;
  type: string;
  tier: "Regional Master Hub" | "Fleet Verification Hub" | "Express Onboarding Desk";
  address: string;
  phone: string;
  openHours: string;
  isActive: boolean;
}
