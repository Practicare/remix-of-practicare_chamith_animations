import type { Country } from "./onboarding";

export type TeamIndustry =
  | "GP / Primary Care"
  | "Dental"
  | "Allied Health"
  | "Specialist & Cosmetic"
  | "Other";

export const TEAM_INDUSTRIES: TeamIndustry[] = [
  "GP / Primary Care",
  "Dental",
  "Allied Health",
  "Specialist & Cosmetic",
  "Other",
];

export type StockMethod = "ai" | "csv" | "manual";

export interface TeamRoom {
  id: string;
  number: string;
  name: string;
}

export interface TeamStockItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  expiry?: string;
}

export interface TeamRole {
  id: string;
  name: string;
  description: string;
  modules: string[];
  system?: boolean;
}

export interface TeamStaffMember {
  id: string;
  name: string;
  email: string;
  roleId: string | null;
}

export interface TeamChecklistTemplate {
  id: string;
  title: string;
  description: string;
  frequency: string;
}

export interface TeamOnboardingState {
  // Phase 1 — Welcome & Context
  practiceName: string;
  country: Country | null;
  industry: TeamIndustry | null;

  // Phase 2 — Practice Foundation
  practiceEmail: string;
  practicePhone: string;
  timezone: string;
  address: string;
  siteName: string;
  logoDataUrl: string | null;

  // Phase 3 — Locations
  rooms: TeamRoom[];

  // Phase 4 — Stock
  stockMethod: StockMethod | null;
  stockItems: TeamStockItem[];

  // Phase 5 — Team & Roles
  roles: TeamRole[];
  staff: TeamStaffMember[];

  // Phase 6 — Checklists
  activeTemplates: string[];

  // Progress
  completed: number[];
  done: boolean;
}

export const TIMEZONES = [
  "Australia/Sydney",
  "Australia/Melbourne",
  "Australia/Brisbane",
  "Australia/Adelaide",
  "Australia/Perth",
  "Pacific/Auckland",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Asia/Singapore",
  "UTC",
];

export const DEFAULT_TEAM_ONBOARDING: TeamOnboardingState = {
  practiceName: "",
  country: null,
  industry: null,
  practiceEmail: "",
  practicePhone: "",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Australia/Sydney",
  address: "",
  siteName: "Main Site",
  logoDataUrl: null,
  rooms: [],
  stockMethod: null,
  stockItems: [],
  roles: [],
  staff: [],
  activeTemplates: [],
  completed: [],
  done: false,
};

const STORAGE_KEY = "practicare_team_onboarding_v1";

export function loadTeamOnboarding(): TeamOnboardingState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_TEAM_ONBOARDING };
    return { ...DEFAULT_TEAM_ONBOARDING, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_TEAM_ONBOARDING };
  }
}

export function saveTeamOnboarding(state: TeamOnboardingState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or unavailable — progress simply won't persist
  }
}
