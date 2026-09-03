export type PracticeSize = "small" | "medium" | "large" | "custom";

export type FeaturePriority = 
  | "daily-tasks"
  | "checklists-audits"
  | "stock-expiry"
  | "compliance";

export type Country = "USA" | "Australia" | "New Zealand" | "Canada" | "Singapore";

export type Industry = 
  | "Primary Care" 
  | "Allied Health" 
  | "Integrative Medicine" 
  | "Specialist Private Practice";

export const COUNTRIES: Country[] = ["USA", "Australia", "New Zealand", "Canada", "Singapore"];

export const INDUSTRIES: Industry[] = [
  "Primary Care",
  "Allied Health",
  "Integrative Medicine",
  "Specialist Private Practice",
];

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  pricePerUser: number;
  features: string[];
  recommended?: boolean;
}

export interface OnboardingUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

export interface OnboardingData {
  // Step 2: Practice Info
  practiceName: string;
  practiceEmail: string;
  practicePhone: string;
  address: string;
  country: Country | null;
  industry: Industry | null;
  
  // Step 3: Practice Size
  practiceSize: PracticeSize | null;
  
  // Step 4: Feature Priorities
  priorities: FeaturePriority[];
  
  // Step 5: Account Setup
  password: string;
  confirmPassword: string;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  accountCreated: boolean;
  
  // Step 6: Demo completed
  demoCompleted: boolean;
  
  // Legacy - keeping for compatibility
  selectedPlan: string | null;
  mfaVerified: boolean;
  users: OnboardingUser[];
}

export const PRACTICE_SIZES: { value: PracticeSize; label: string; description: string; price: number; fortnightPrice: number; isCustom?: boolean }[] = [
  { value: "small", label: "Small", description: "Up to 10 staff members", price: 189, fortnightPrice: 95 },
  { value: "medium", label: "Medium", description: "11 to 25 staff members", price: 289, fortnightPrice: 145 },
  { value: "large", label: "Large", description: "26 to 51 staff members", price: 389, fortnightPrice: 195 },
  { value: "custom", label: "Custom", description: "More than 52 staff members", price: 0, fortnightPrice: 0, isCustom: true },
];

export const FEATURE_PRIORITIES: { value: FeaturePriority; label: string; icon: string }[] = [
  { value: "daily-tasks", label: "Daily tasks", icon: "CheckSquare" },
  { value: "checklists-audits", label: "Checklists & audits", icon: "ClipboardCheck" },
  { value: "stock-expiry", label: "Stock & expiry dates", icon: "Package" },
  { value: "compliance", label: "Compliance tracking", icon: "Shield" },
];

export const SUBSCRIPTION_PLANS: Record<PracticeSize, SubscriptionPlan> = {
  small: {
    id: "small",
    name: "Small",
    price: 189,
    pricePerUser: 19,
    features: ["Up to 10 staff members", "Task management", "Team management", "Stock management", "Checklist management", "5GB storage", "Email support"],
  },
  medium: {
    id: "medium",
    name: "Medium",
    price: 289,
    pricePerUser: 12,
    features: ["11-25 staff members", "Everything in Small", "Advanced reporting", "Full compliance suite", "SMS & email reminders", "25GB storage", "Priority support"],
    recommended: true,
  },
  large: {
    id: "large",
    name: "Large",
    price: 389,
    pricePerUser: 8,
    features: ["26-51 staff members", "Everything in Medium", "Multi-location support", "Custom integrations", "Dedicated account manager", "Unlimited storage", "24/7 support"],
  },
  custom: {
    id: "custom",
    name: "Custom",
    price: 0,
    pricePerUser: 0,
    features: ["52+ staff members", "Everything in Large", "Enterprise features", "Custom onboarding", "Dedicated success manager", "SLA guarantees", "Custom integrations"],
  },
};
