export type PackageTier = "silver" | "gold" | "platinum" | "undecided";

export type LeadStatus =
  | "new"
  | "contacted"
  | "in_review"
  | "verified"
  | "approved"
  | "rejected"
  | "onboarded";

export interface VendorLead {
  id: string;
  applicationId: string;
  fullName: string;
  mobile: string;
  alternatePhone?: string;
  email: string;
  state?: string;
  city: string;
  pincode?: string;
  proposedAddress?: string;
  spaceStatus?: string;
  carpetArea?: string;
  preferredPackage: PackageTier;
  packageName?: string;
  investmentBudget?: string;
  financeRequired?: string;
  loanAssistance?: string;
  currentProfession?: string;
  hasExperience?: string;
  message?: string;
  source?: string;
  status: LeadStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrochureDownload {
  id: string;
  name: string;
  mobile: string;
  city: string;
  downloadedAt: string;
}

export interface VendorHub {
  id: string;
  city: string;
  state: string;
  type: string;
  tier: "Silver" | "Gold" | "Platinum";
  address: string;
  phone: string;
  openHours: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface AnalyticsStats {
  totalLeads: number;
  newLeadsToday: number;
  contactedLeads: number;
  approvedLeads: number;
  totalBrochureDownloads: number;
  activeHubsCount: number;
  packageBreakdown: {
    silver: number;
    gold: number;
    platinum: number;
    undecided: number;
  };
  cityBreakdown: Record<string, number>;
  recentActivity: Array<{
    type: "lead" | "brochure" | "hub";
    description: string;
    timestamp: string;
  }>;
}

