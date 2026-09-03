import { Organization, Site } from "@/types/organization";

export const mockOrganization: Organization = {
  id: "org-1",
  name: "HealthCare Plus",
  slug: "healthcare-plus",
  billingEmail: "billing@healthcareplus.com.au",
  plan: "medium",
  createdAt: new Date("2024-01-15"),
};

export const mockSites: Site[] = [
  {
    id: "site-1",
    organizationId: "org-1",
    name: "CBD Practice",
    address: "123 Collins St, Melbourne VIC 3000",
    phone: "03 9000 1111",
    email: "cbd@healthcareplus.com.au",
    timezone: "Australia/Melbourne",
    isActive: true,
    isDefault: true,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "site-2",
    organizationId: "org-1",
    name: "Southbank Practice",
    address: "45 Southbank Blvd, Southbank VIC 3006",
    phone: "03 9000 2222",
    email: "southbank@healthcareplus.com.au",
    timezone: "Australia/Melbourne",
    isActive: true,
    createdAt: new Date("2024-06-01"),
  },
  {
    id: "site-3",
    organizationId: "org-1",
    name: "Richmond Branch",
    address: "78 Bridge Rd, Richmond VIC 3121",
    phone: "03 9000 3333",
    email: "richmond@healthcareplus.com.au",
    timezone: "Australia/Melbourne",
    isActive: true,
    createdAt: new Date("2025-01-10"),
  },
];
