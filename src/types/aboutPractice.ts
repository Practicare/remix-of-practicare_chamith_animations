export interface OpeningHour {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export type ServicePricingMode = "flat" | "per-practitioner";

export interface PracticeService {
  id: string;
  name: string;
  price: string; // used when pricingMode is "flat"
  practitionerIds: string[]; // empty array means "All practitioners"
  pricingMode?: ServicePricingMode; // defaults to "flat"
  practitionerPrices?: Record<string, string>; // practitionerId -> price, used when pricingMode is "per-practitioner"
  notes?: string;
}

export interface PracticeContact {
  phone: string;
  afterHoursPhone: string;
  fax: string;
  email: string;
  website: string;
  address: string;
}

export interface ClosedDate {
  id: string;
  date: string; // ISO yyyy-mm-dd
  endDate?: string; // optional range end
  allDay: boolean;
  open?: string;
  close?: string;
  reason?: string;
}

export interface CustomProvider {
  id: string;
  name: string;
}

export interface AboutPractice {
  contact: PracticeContact;
  openingHours: OpeningHour[];
  services: PracticeService[];
  closedDates: ClosedDate[];
  customProviders: CustomProvider[];
}
