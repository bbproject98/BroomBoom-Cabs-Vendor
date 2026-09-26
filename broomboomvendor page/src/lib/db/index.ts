import fs from "fs";
import path from "path";
import {
  VendorLead,
  BrochureDownload,
  VendorHub,
  AnalyticsStats,
  LeadStatus,
  PackageTier,
} from "./schema";

interface DatabaseState {
  leads: VendorLead[];
  brochures: BrochureDownload[];
  hubs: VendorHub[];
  auditLogs: Array<{
    id: string;
    action: string;
    details: string;
    timestamp: string;
  }>;
  version: number;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "broomboom-vendor-store.json");

const INITIAL_HUBS: VendorHub[] = [
  {
    id: "hub-1",
    city: "Kolkata",
    state: "West Bengal",
    type: "Regional Fleet Operations Hub",
    tier: "Platinum",
    address: "Salt Lake Sector V, Near College More, Kolkata - 700091",
    phone: "8240765499-BROOM-BOOM",
    openHours: "9:00 AM - 8:00 PM",
    isActive: true,
    createdAt: "2026-01-15T09:00:00.000Z",
  },
  {
    id: "hub-2",
    city: "Lucknow",
    state: "Uttar Pradesh",
    type: "Vendor Verification & Inspection Center",
    tier: "Gold",
    address: "Hazratganj Main Market, Near Metro Station, Lucknow - 226001",
    phone: "8240765499-BROOM-BOOM",
    openHours: "9:30 AM - 7:30 PM",
    isActive: true,
    createdAt: "2026-01-20T10:30:00.000Z",
  },
  {
    id: "hub-3",
    city: "Jaipur",
    state: "Rajasthan",
    type: "Fleet Verification & Fastag Center",
    tier: "Gold",
    address: "MI Road, Commercial Hub, Jaipur - 302001",
    phone: "8240765499-BROOM-BOOM",
    openHours: "9:00 AM - 8:00 PM",
    isActive: true,
    createdAt: "2026-02-01T11:00:00.000Z",
  },
  {
    id: "hub-4",
    city: "Patna",
    state: "Bihar",
    type: "Express Vendor Onboarding Desk",
    tier: "Silver",
    address: "Fraser Road, Near Railway Station Junction, Patna - 800001",
    phone: "8240765499-BROOM-BOOM",
    openHours: "8:00 AM - 9:00 PM",
    isActive: true,
    createdAt: "2026-02-10T14:00:00.000Z",
  },
  {
    id: "hub-5",
    city: "Pune",
    state: "Maharashtra",
    type: "Fleet Verification & Dispatch Desk",
    tier: "Gold",
    address: "FC Road, Shivajinagar Commercial Complex, Pune - 411005",
    phone: "8240765499-BROOM-BOOM",
    openHours: "9:30 AM - 8:00 PM",
    isActive: true,
    createdAt: "2026-02-18T16:00:00.000Z",
  },
  {
    id: "hub-6",
    city: "Delhi NCR",
    state: "Delhi",
    type: "Regional Fleet Operations Hub",
    tier: "Platinum",
    address: "Connaught Place, Barakhamba Road, New Delhi - 110001",
    phone: "8240765499-BROOM-BOOM",
    openHours: "8:30 AM - 8:30 PM",
    isActive: true,
    createdAt: "2026-03-01T12:00:00.000Z",
  },
];

const INITIAL_LEADS: VendorLead[] = [
  {
    id: "lead-init-1",
    applicationId: "BB-VENDOR-2026-1001",
    fullName: "Suresh Rathore",
    mobile: "+91 98290 54321",
    email: "suresh.rathore@gmail.com",
    state: "Rajasthan",
    city: "Jaipur",
    pincode: "302001",
    proposedAddress: "MI Road Commercial Hub",
    spaceStatus: "Owned commercial office ready",
    carpetArea: "400 sq.ft",
    preferredPackage: "gold",
    packageName: "Gold Partner (District Exclusive Hub)",
    investmentBudget: "₹5.0 Lakhs - ₹10.0 Lakhs",
    currentProfession: "Travel Agency Owner",
    hasExperience: "Yes, currently in travel / taxi / logistics",
    message: "Operating 8 Innovas & Dzires, looking for exclusive outstation tie-up.",
    source: "apply_page",
    status: "approved",
    adminNotes: "Fleet attached and verified. 8 cabs active in Jaipur zone.",
    createdAt: "2026-03-01T08:30:00.000Z",
    updatedAt: "2026-03-05T11:00:00.000Z",
  },
  {
    id: "lead-init-2",
    applicationId: "BB-VENDOR-2026-1002",
    fullName: "Anirban Mukherjee",
    mobile: "+91 98310 98765",
    email: "anirban.m@yahoo.com",
    state: "West Bengal",
    city: "Kolkata",
    pincode: "700091",
    proposedAddress: "Salt Lake Sector V",
    spaceStatus: "Rented commercial office ready",
    carpetArea: "850 sq.ft",
    preferredPackage: "platinum",
    packageName: "Platinum Partner (Regional Master Hub)",
    investmentBudget: "₹15.0 Lakhs - ₹20.0 Lakhs",
    currentProfession: "Fleet Operator (14 Cabs)",
    hasExperience: "Yes, currently in travel / taxi / logistics",
    message: "Interested in master regional dispatch and corporate MNC airport transfers.",
    source: "apply_page",
    status: "contacted",
    adminNotes: "Scheduled territory viability call for Friday.",
    createdAt: "2026-03-04T10:15:00.000Z",
    updatedAt: "2026-03-06T14:30:00.000Z",
  },
  {
    id: "lead-init-3",
    applicationId: "BB-VENDOR-2026-1003",
    fullName: "Mahesh Patil",
    mobile: "+91 98220 11223",
    email: "mahesh.patil@outlook.com",
    state: "Maharashtra",
    city: "Pune",
    pincode: "411005",
    proposedAddress: "Shivaji Nagar",
    spaceStatus: "Operating from existing travel desk",
    carpetArea: "150 sq.ft",
    preferredPackage: "silver",
    packageName: "Silver Partner (Booking Kiosk)",
    investmentBudget: "₹1.5 Lakhs - ₹3.0 Lakhs",
    currentProfession: "Taxi Operator (2 Ertiga Cabs)",
    hasExperience: "Yes, currently in travel / taxi / logistics",
    message: "Running 2 Ertigas on Pune-Mumbai highway, looking for daily bank payouts.",
    source: "modal",
    status: "new",
    adminNotes: "New application. Need to assign territory manager.",
    createdAt: "2026-03-08T15:20:00.000Z",
    updatedAt: "2026-03-08T15:20:00.000Z",
  },
];

const INITIAL_BROCHURES: BrochureDownload[] = [
  {
    id: "brochure-1",
    name: "Amit Verma",
    mobile: "+91 98765 43210",
    city: "Patna",
    downloadedAt: "2026-03-06T09:12:00.000Z",
  },
  {
    id: "brochure-2",
    name: "Ramesh Sharma",
    mobile: "+91 94312 88776",
    city: "Lucknow",
    downloadedAt: "2026-03-07T14:45:00.000Z",
  },
];

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readState(): DatabaseState {
  ensureDataDir();
  if (!fs.existsSync(DB_FILE)) {
    const initialState: DatabaseState = {
      leads: INITIAL_LEADS,
      brochures: INITIAL_BROCHURES,
      hubs: INITIAL_HUBS,
      auditLogs: [
        {
          id: "log-1",
          action: "SYSTEM_INIT",
          details: "Vendor database initialized with standard configurations.",
          timestamp: new Date().toISOString(),
        },
      ],
      version: 1,
    };
    writeState(initialState);
    return initialState;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading database file, reinitializing fallback:", err);
    const fallback: DatabaseState = {
      leads: INITIAL_LEADS,
      brochures: INITIAL_BROCHURES,
      hubs: INITIAL_HUBS,
      auditLogs: [],
      version: 1,
    };
    writeState(fallback);
    return fallback;
  }
}

function writeState(state: DatabaseState): void {
  ensureDataDir();
  const tempFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(state, null, 2), "utf-8");
  fs.renameSync(tempFile, DB_FILE);
}

function generateLeadApplicationId(count: number): string {
  const serial = 1000 + count + 1;
  return `BB-VENDOR-2026-${serial}`;
}

export const db = {
  leads: {
    getAll: (filters?: {
      status?: string;
      package?: string;
      query?: string;
      limit?: number;
      offset?: number;
    }): { leads: VendorLead[]; total: number } => {
      const state = readState();
      let result = [...state.leads];

      if (filters?.status && filters.status !== "all") {
        result = result.filter((l) => l.status === filters.status);
      }

      if (filters?.package && filters.package !== "all") {
        result = result.filter((l) => l.preferredPackage === filters.package);
      }

      if (filters?.query) {
        const q = filters.query.toLowerCase().trim();
        result = result.filter(
          (l) =>
            l.fullName.toLowerCase().includes(q) ||
            l.city.toLowerCase().includes(q) ||
            (l.state && l.state.toLowerCase().includes(q)) ||
            l.mobile.includes(q) ||
            l.email.toLowerCase().includes(q) ||
            l.applicationId.toLowerCase().includes(q)
        );
      }

      // Sort newest first
      result.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const total = result.length;
      if (filters?.limit) {
        const offset = filters.offset || 0;
        result = result.slice(offset, offset + filters.limit);
      }

      return { leads: result, total };
    },

    getById: (id: string): VendorLead | null => {
      const state = readState();
      return (
        state.leads.find((l) => l.id === id || l.applicationId === id) || null
      );
    },

    create: (
      input: Omit<
        VendorLead,
        "id" | "applicationId" | "status" | "createdAt" | "updatedAt"
      > & { status?: LeadStatus }
    ): VendorLead => {
      const state = readState();
      const now = new Date().toISOString();
      const id = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const applicationId = generateLeadApplicationId(state.leads.length);

      const newLead: VendorLead = {
        ...input,
        id,
        applicationId,
        status: input.status || "new",
        adminNotes: input.adminNotes || "Application received via vendor web portal.",
        createdAt: now,
        updatedAt: now,
      };

      state.leads.unshift(newLead);
      state.auditLogs.unshift({
        id: `log-${Date.now()}`,
        action: "LEAD_CREATED",
        details: `New vendor application ${applicationId} submitted by ${newLead.fullName} (${newLead.city}, ${newLead.preferredPackage.toUpperCase()})`,
        timestamp: now,
      });

      writeState(state);
      return newLead;
    },

    update: (id: string, updates: Partial<VendorLead>): VendorLead | null => {
      const state = readState();
      const index = state.leads.findIndex(
        (l) => l.id === id || l.applicationId === id
      );
      if (index === -1) return null;

      const updatedLead: VendorLead = {
        ...state.leads[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      state.leads[index] = updatedLead;
      state.auditLogs.unshift({
        id: `log-${Date.now()}`,
        action: "LEAD_UPDATED",
        details: `Vendor application ${updatedLead.applicationId} updated. Status: ${updatedLead.status}`,
        timestamp: updatedLead.updatedAt,
      });

      writeState(state);
      return updatedLead;
    },

    delete: (id: string): boolean => {
      const state = readState();
      const initialLen = state.leads.length;
      state.leads = state.leads.filter(
        (l) => l.id !== id && l.applicationId !== id
      );
      if (state.leads.length === initialLen) return false;

      state.auditLogs.unshift({
        id: `log-${Date.now()}`,
        action: "LEAD_DELETED",
        details: `Vendor lead ID ${id} deleted by administrator.`,
        timestamp: new Date().toISOString(),
      });

      writeState(state);
      return true;
    },
  },

  brochures: {
    getAll: (): BrochureDownload[] => {
      const state = readState();
      return [...state.brochures].sort(
        (a, b) =>
          new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime()
      );
    },

    create: (input: { name: string; mobile: string; city: string }): BrochureDownload => {
      const state = readState();
      const now = new Date().toISOString();
      const id = `brochure-${Date.now()}`;
      const item: BrochureDownload = {
        id,
        name: input.name,
        mobile: input.mobile,
        city: input.city,
        downloadedAt: now,
      };

      state.brochures.unshift(item);
      state.auditLogs.unshift({
        id: `log-${Date.now()}`,
        action: "BROCHURE_DOWNLOAD",
        details: `Vendor Prospectus downloaded by ${item.name} (${item.city}, ${item.mobile})`,
        timestamp: now,
      });

      writeState(state);
      return item;
    },
  },

  hubs: {
    getAll: (activeOnly = false): VendorHub[] => {
      const state = readState();
      let list = [...state.hubs];
      if (activeOnly) {
        list = list.filter((h) => h.isActive);
      }
      return list;
    },

    getById: (id: string): VendorHub | null => {
      const state = readState();
      return state.hubs.find((h) => h.id === id) || null;
    },

    create: (input: Omit<VendorHub, "id" | "createdAt">): VendorHub => {
      const state = readState();
      const now = new Date().toISOString();
      const id = `hub-${Date.now()}`;
      const newHub: VendorHub = {
        ...input,
        id,
        createdAt: now,
      };

      state.hubs.push(newHub);
      state.auditLogs.unshift({
        id: `log-${Date.now()}`,
        action: "HUB_CREATED",
        details: `New vendor hub added: ${newHub.city} (${newHub.tier})`,
        timestamp: now,
      });

      writeState(state);
      return newHub;
    },

    update: (id: string, updates: Partial<VendorHub>): VendorHub | null => {
      const state = readState();
      const idx = state.hubs.findIndex((h) => h.id === id);
      if (idx === -1) return null;

      state.hubs[idx] = {
        ...state.hubs[idx],
        ...updates,
      };

      state.auditLogs.unshift({
        id: `log-${Date.now()}`,
        action: "HUB_UPDATED",
        details: `Vendor hub ${state.hubs[idx].city} updated.`,
        timestamp: new Date().toISOString(),
      });

      writeState(state);
      return state.hubs[idx];
    },

    delete: (id: string): boolean => {
      const state = readState();
      const initial = state.hubs.length;
      state.hubs = state.hubs.filter((h) => h.id !== id);
      if (state.hubs.length === initial) return false;

      state.auditLogs.unshift({
        id: `log-${Date.now()}`,
        action: "HUB_DELETED",
        details: `Hub ${id} deleted by administrator.`,
        timestamp: new Date().toISOString(),
      });

      writeState(state);
      return true;
    },
  },

  getAnalytics: (): AnalyticsStats => {
    const state = readState();
    const leads = state.leads;
    const today = new Date().toISOString().slice(0, 10);

    const newLeadsToday = leads.filter(
      (l) => l.createdAt.slice(0, 10) === today
    ).length;
    const contactedLeads = leads.filter((l) => l.status === "contacted").length;
    const approvedLeads = leads.filter((l) => l.status === "approved").length;

    const packageBreakdown = {
      silver: leads.filter((l) => l.preferredPackage === "silver").length,
      gold: leads.filter((l) => l.preferredPackage === "gold").length,
      platinum: leads.filter((l) => l.preferredPackage === "platinum").length,
      undecided: leads.filter((l) => l.preferredPackage === "undecided").length,
    };

    const cityBreakdown: Record<string, number> = {};
    leads.forEach((l) => {
      const c = l.city ? l.city.trim() : "Other";
      cityBreakdown[c] = (cityBreakdown[c] || 0) + 1;
    });

    const recentActivity = state.auditLogs.slice(0, 8).map((log) => ({
      type: log.action.includes("LEAD")
        ? ("lead" as const)
        : log.action.includes("BROCHURE")
        ? ("brochure" as const)
        : ("hub" as const),
      description: log.details,
      timestamp: log.timestamp,
    }));

    return {
      totalLeads: leads.length,
      newLeadsToday,
      contactedLeads,
      approvedLeads,
      totalBrochureDownloads: state.brochures.length,
      activeHubsCount: state.hubs.filter((h) => h.isActive).length,
      packageBreakdown,
      cityBreakdown,
      recentActivity,
    };
  },

  exportLeadsToCsv: (): string => {
    const state = readState();
    const headers = [
      "Application ID",
      "Full Name",
      "Mobile",
      "Alternate Phone",
      "Email",
      "State",
      "City",
      "Pin Code",
      "Preferred Package",
      "Investment Budget",
      "Finance Required",
      "Loan Assistance",
      "Space Status",
      "Carpet Area",
      "Profession",
      "Experience",
      "Status",
      "Application Date",
      "Admin Notes",
    ];

    const rows = state.leads.map((l) => [
      `"${l.applicationId}"`,
      `"${(l.fullName || "").replace(/"/g, '""')}"`,
      `"${l.mobile || ""}"`,
      `"${l.alternatePhone || ""}"`,
      `"${l.email || ""}"`,
      `"${(l.state || "").replace(/"/g, '""')}"`,
      `"${(l.city || "").replace(/"/g, '""')}"`,
      `"${l.pincode || ""}"`,
      `"${(l.packageName || l.preferredPackage || "").replace(/"/g, '""')}"`,
      `"${(l.investmentBudget || "").replace(/"/g, '""')}"`,
      `"${(l.financeRequired || "Self-Funded").replace(/"/g, '""')}"`,
      `"${(l.loanAssistance || "No").replace(/"/g, '""')}"`,
      `"${(l.spaceStatus || "").replace(/"/g, '""')}"`,
      `"${(l.carpetArea || "").replace(/"/g, '""')}"`,
      `"${(l.currentProfession || "").replace(/"/g, '""')}"`,
      `"${(l.hasExperience || "").replace(/"/g, '""')}"`,
      `"${l.status.toUpperCase()}"`,
      `"${l.createdAt}"`,
      `"${(l.adminNotes || "").replace(/"/g, '""')}"`,
    ]);

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  },
};

