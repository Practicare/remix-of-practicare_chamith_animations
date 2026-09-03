export type MarketplacePlan = "free" | "premium";

export const MARKETPLACE_CATEGORIES = [
  "IT & Technology",
  "Management Consulting",
  "Recruitment",
  "Accounting & Bookkeeping",
  "Legal & Compliance",
  "Marketing & Design",
  "Medical Equipment",
  "Cleaning & Facilities",
  "Training & Education",
  "Insurance & Finance",
] as const;

export type MarketplaceCategory = (typeof MARKETPLACE_CATEGORIES)[number];

/**
 * Industry groups let the directory scale across sectors: categories are
 * grouped so filtering stays usable with hundreds of categories.
 */
export const MARKETPLACE_INDUSTRIES: Record<string, string[]> = {
  "Technology & Data": ["IT & Technology", "Marketing & Design"],
  "Business & Advisory": [
    "Management Consulting",
    "Accounting & Bookkeeping",
    "Legal & Compliance",
    "Insurance & Finance",
  ],
  "People & Training": ["Recruitment", "Training & Education"],
  "Clinical & Facilities": ["Medical Equipment", "Cleaning & Facilities"],
};

export const industryForCategory = (category: string): string =>
  Object.keys(MARKETPLACE_INDUSTRIES).find((i) =>
    MARKETPLACE_INDUSTRIES[i].includes(category)
  ) ?? "Other industries";

export interface MarketplaceListing {
  id: string;
  /** Mock credentials — prototype only */
  email: string;
  password: string;
  businessName: string;
  category: string;
  tagline: string;
  description: string;
  /** data URL */
  logo?: string;
  /** data URL — single flyer per member */
  flyer?: string;
  services: string[];
  location: string;
  country?: string;
  state?: string;
  postcode?: string;
  phone?: string;
  website?: string;
  plan: MarketplacePlan;
  rating: number;
  reviewCount: number;
  responseTime: string;
  verified: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceEnquiry {
  id: string;
  listingId: string;
  name: string;
  practice?: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export const PLAN_FEATURES: Record<MarketplacePlan, string[]> = {
  free: [
    "Directory listing with logo",
    "Brief description & up to 5 services",
    "One flyer upload",
    "Contact enquiry form",
  ],
  premium: [
    "Everything in Free",
    "Featured placement at the top of results",
    "Verified badge & priority support",
    "Unlimited services & richer profile",
    "Enquiry insights",
  ],
};
