import { AboutPractice, ClosedDate, CustomProvider, OpeningHour, PracticeService } from "@/types/aboutPractice";

const defaultHours: OpeningHour[] = [
  { day: "Monday", open: "08:30", close: "17:30", closed: false },
  { day: "Tuesday", open: "08:30", close: "17:30", closed: false },
  { day: "Wednesday", open: "08:30", close: "17:30", closed: false },
  { day: "Thursday", open: "08:30", close: "19:00", closed: false },
  { day: "Friday", open: "08:30", close: "17:30", closed: false },
  { day: "Saturday", open: "09:00", close: "13:00", closed: false },
  { day: "Sunday", open: "", close: "", closed: true },
];

const seedServices: PracticeService[] = [
  { id: "svc-1", name: "Standard consultation", price: "$85", practitionerIds: [] },
  { id: "svc-2", name: "Long consultation", price: "$140", practitionerIds: [] },
  { id: "svc-3", name: "Skin check", price: "$120", practitionerIds: [] },
  { id: "svc-4", name: "Iron infusion", price: "$250", practitionerIds: [] },
];

const defaultContact = {
  phone: "(03) 9123 4567",
  afterHoursPhone: "13 74 25",
  fax: "(03) 9123 4568",
  email: "reception@practice.com.au",
  website: "https://www.practice.com.au",
  address: "123 Main Street, Melbourne VIC 3000",
};

const seedClosedDates: ClosedDate[] = [
  { id: "cd-1", date: "2026-12-25", allDay: true, reason: "Christmas Day" },
  { id: "cd-2", date: "2026-12-26", allDay: true, reason: "Boxing Day" },
];

let state: AboutPractice = {
  contact: defaultContact,
  openingHours: defaultHours,
  services: seedServices,
  closedDates: seedClosedDates,
  customProviders: [],
};

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export const aboutPracticeStore = {
  get: () => state,
  setContact: (contact: AboutPractice["contact"]) => {
    state = { ...state, contact };
    notify();
  },
  setHours: (hours: OpeningHour[]) => {
    state = { ...state, openingHours: hours };
    notify();
  },
  addService: (s: PracticeService) => {
    state = { ...state, services: [s, ...state.services] };
    notify();
  },
  updateService: (s: PracticeService) => {
    state = { ...state, services: state.services.map((x) => (x.id === s.id ? s : x)) };
    notify();
  },
  removeService: (id: string) => {
    state = { ...state, services: state.services.filter((s) => s.id !== id) };
    notify();
  },
  addClosedDate: (c: ClosedDate) => {
    state = {
      ...state,
      closedDates: [...state.closedDates, c].sort((a, b) => a.date.localeCompare(b.date)),
    };
    notify();
  },
  updateClosedDate: (c: ClosedDate) => {
    state = {
      ...state,
      closedDates: state.closedDates
        .map((x) => (x.id === c.id ? c : x))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
    notify();
  },
  removeClosedDate: (id: string) => {
    state = { ...state, closedDates: state.closedDates.filter((c) => c.id !== id) };
    notify();
  },
  addCustomProvider: (p: CustomProvider) => {
    state = { ...state, customProviders: [...state.customProviders, p] };
    notify();
  },
  removeCustomProvider: (id: string) => {
    state = {
      ...state,
      customProviders: state.customProviders.filter((p) => p.id !== id),
      services: state.services.map((s) => ({
        ...s,
        practitionerIds: s.practitionerIds.filter((pid) => pid !== id),
        practitionerPrices: s.practitionerPrices
          ? Object.fromEntries(Object.entries(s.practitionerPrices).filter(([k]) => k !== id))
          : s.practitionerPrices,
      })),
    };
    notify();
  },
  subscribe: (fn: () => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
