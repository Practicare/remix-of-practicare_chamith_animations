import { MARKETPLACE_CATEGORIES, MarketplaceEnquiry, MarketplaceListing, MarketplacePlan } from "@/types/marketplace";

const LISTINGS_KEY = "practicare.marketplace.listings.v1";
const ENQUIRIES_KEY = "practicare.marketplace.enquiries.v1";
const SESSION_KEY = "practicare.marketplace.session.v1";
const CATEGORIES_KEY = "practicare.marketplace.categories.v1";
const BOOKMARKS_KEY = "practicare.marketplace.bookmarks.v1";

const now = new Date().toISOString();

const seedListings: MarketplaceListing[] = [
  {
    id: "mp-1",
    email: "hello@meditech.io",
    password: "password",
    businessName: "MediTech IT Partners",
    category: "IT & Technology",
    tagline: "Practice IT support that actually understands clinical software",
    description:
      "Managed IT, cyber security and cloud backup built specifically for medical practices. We support Best Practice, Medical Director and Zedmed with 24/7 monitoring and a 15-minute response SLA.",
    services: ["Managed IT support", "Cyber security audits", "Cloud backup", "Hardware procurement", "Practice software migration"],
    location: "Sydney, NSW",
    country: "Australia",
    state: "NSW",
    postcode: "2000",
    phone: "02 8000 1234",
    website: "https://meditech.io",
    plan: "premium",
    rating: 4.9,
    reviewCount: 128,
    responseTime: "Replies within 1 hour",
    verified: true,
    published: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "mp-2",
    email: "team@clarityconsult.com",
    password: "password",
    businessName: "Clarity Practice Consulting",
    category: "Management Consulting",
    tagline: "Accreditation, workflow and profitability consulting",
    description:
      "We help practice owners lift margins and pass accreditation first time. Fixed-fee engagements, on-site or remote, across general practice, dental and allied health.",
    services: ["Accreditation readiness", "Workflow redesign", "Billing optimisation", "Practice benchmarking"],
    location: "Melbourne, VIC",
    country: "Australia",
    state: "VIC",
    postcode: "3000",
    phone: "03 9000 5678",
    website: "https://clarityconsult.com",
    plan: "premium",
    rating: 4.8,
    reviewCount: 74,
    responseTime: "Replies within 3 hours",
    verified: true,
    published: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "mp-3",
    email: "jobs@pulserecruit.com.au",
    password: "password",
    businessName: "Pulse Medical Recruitment",
    category: "Recruitment",
    tagline: "Nurses, receptionists and practice managers — placed fast",
    description:
      "Permanent and locum placement for primary care teams. Pre-screened candidates with AHPRA verification and a 90-day replacement guarantee.",
    services: ["Practice nurse placement", "Reception & admin", "Practice manager search", "Locum cover"],
    location: "Brisbane, QLD",
    country: "Australia",
    state: "QLD",
    postcode: "4000",
    phone: "07 3000 9012",
    plan: "free",
    rating: 4.6,
    reviewCount: 41,
    responseTime: "Replies within a day",
    verified: false,
    published: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "mp-4",
    email: "info@ledgerhealth.com",
    password: "password",
    businessName: "Ledger Health Accounting",
    category: "Accounting & Bookkeeping",
    tagline: "Bookkeeping and tax for medical practices",
    description:
      "Monthly bookkeeping, payroll and BAS lodgement with medical-specific benchmarking reports so you always know how your practice compares.",
    services: ["Bookkeeping", "Payroll", "BAS & tax", "Cash flow forecasting"],
    location: "Perth, WA",
    country: "Australia",
    state: "WA",
    postcode: "6000",
    phone: "08 6000 3456",
    plan: "free",
    rating: 4.4,
    reviewCount: 23,
    responseTime: "Replies within a day",
    verified: false,
    published: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "mp-5",
    email: "care@sterileservices.com",
    password: "password",
    businessName: "Sterile Services Group",
    category: "Cleaning & Facilities",
    tagline: "Clinical-grade cleaning and waste management",
    description:
      "Infection-control trained cleaning teams, sharps and clinical waste collection, and documented compliance reporting for accreditation evidence.",
    services: ["Clinical cleaning", "Clinical waste collection", "Infection control audits"],
    location: "Adelaide, SA",
    country: "Australia",
    state: "SA",
    postcode: "5000",
    plan: "free",
    rating: 4.2,
    reviewCount: 17,
    responseTime: "Replies within 2 days",
    verified: false,
    published: true,
    createdAt: now,
    updatedAt: now,
  },
];

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable
  }
}

let listings: MarketplaceListing[] = read(LISTINGS_KEY, seedListings);
let enquiries: MarketplaceEnquiry[] = read(ENQUIRIES_KEY, []);
let customCategories: string[] = read<string[]>(CATEGORIES_KEY, []);
let bookmarkedCategories: string[] = read<string[]>(
  BOOKMARKS_KEY,
  MARKETPLACE_CATEGORIES.slice(0, 5) as unknown as string[]
);

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const persist = () => {
  write(LISTINGS_KEY, listings);
  write(ENQUIRIES_KEY, enquiries);
  emit();
};

const uid = () => `mp-${Math.random().toString(36).slice(2, 10)}`;

export const marketplaceStore = {
  subscribe: (fn: () => void) => {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },

  getListings: () => listings,

  getCategories: (): string[] => [
    ...(MARKETPLACE_CATEGORIES as unknown as string[]),
    ...customCategories,
  ],
  addCategory: (name: string) => {
    const value = name.trim();
    if (!value) return;
    const all = marketplaceStore.getCategories();
    if (all.some((c) => c.toLowerCase() === value.toLowerCase())) return;
    customCategories = [...customCategories, value];
    bookmarkedCategories = [...bookmarkedCategories, value];
    write(CATEGORIES_KEY, customCategories);
    write(BOOKMARKS_KEY, bookmarkedCategories);
    emit();
  },
  getBookmarkedCategories: (): string[] =>
    bookmarkedCategories.filter((c) => marketplaceStore.getCategories().includes(c)),
  toggleBookmarkCategory: (name: string) => {
    bookmarkedCategories = bookmarkedCategories.includes(name)
      ? bookmarkedCategories.filter((c) => c !== name)
      : [...bookmarkedCategories, name];
    write(BOOKMARKS_KEY, bookmarkedCategories);
    emit();
  },

  getListing: (id: string) => listings.find((l) => l.id === id),
  getEnquiries: (listingId?: string) =>
    listingId ? enquiries.filter((e) => e.listingId === listingId) : enquiries,

  register: (input: {
    email: string;
    password: string;
    businessName: string;
    category: string;
    location: string;
  }): { ok: boolean; error?: string; listing?: MarketplaceListing } => {
    const email = input.email.trim().toLowerCase();
    if (listings.some((l) => l.email.toLowerCase() === email)) {
      return { ok: false, error: "An account with this email already exists." };
    }
    const listing: MarketplaceListing = {
      id: uid(),
      email,
      password: input.password,
      businessName: input.businessName.trim(),
      category: input.category,
      tagline: "",
      description: "",
      services: [],
      location: input.location.trim(),
      plan: "free",
      rating: 0,
      reviewCount: 0,
      responseTime: "New member",
      verified: false,
      published: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    listings = [listing, ...listings];
    persist();
    return { ok: true, listing };
  },

  login: (email: string, password: string): { ok: boolean; error?: string; listing?: MarketplaceListing } => {
    const listing = listings.find(
      (l) => l.email.toLowerCase() === email.trim().toLowerCase() && l.password === password
    );
    if (!listing) return { ok: false, error: "Incorrect email or password." };
    return { ok: true, listing };
  },

  update: (id: string, patch: Partial<MarketplaceListing>) => {
    listings = listings.map((l) =>
      l.id === id ? { ...l, ...patch, updatedAt: new Date().toISOString() } : l
    );
    persist();
  },

  setPlan: (id: string, plan: MarketplacePlan) => {
    marketplaceStore.update(id, { plan, verified: plan === "premium" });
  },

  addEnquiry: (input: Omit<MarketplaceEnquiry, "id" | "createdAt" | "read">) => {
    enquiries = [
      { ...input, id: uid(), createdAt: new Date().toISOString(), read: false },
      ...enquiries,
    ];
    persist();
  },

  markEnquiryRead: (id: string) => {
    enquiries = enquiries.map((e) => (e.id === id ? { ...e, read: true } : e));
    persist();
  },

  // --- mock session ---
  getSession: (): string | null => {
    try {
      return localStorage.getItem(SESSION_KEY);
    } catch {
      return null;
    }
  },
  setSession: (id: string | null) => {
    try {
      if (id) localStorage.setItem(SESSION_KEY, id);
      else localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
    emit();
  },
};
