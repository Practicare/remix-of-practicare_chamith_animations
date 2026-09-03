export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  billingEmail: string;
  plan: "small" | "medium" | "large";
  createdAt: Date;
}

export interface Site {
  id: string;
  organizationId: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  timezone?: string;
  isActive: boolean;
  isDefault?: boolean;
  createdAt: Date;
}
