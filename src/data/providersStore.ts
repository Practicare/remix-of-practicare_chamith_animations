import { Provider } from "@/types/providers";

const now = new Date().toISOString();

const seed: Provider[] = [
  {
    id: "pv-1",
    name: "Westside Pathology",
    category: "Pathology",
    servicesProvided: [
      "Blood collection (on-site)",
      "Home visit collections",
      "Routine biochemistry",
      "Histology",
    ],
    servicesNotProvided: ["Genetic testing", "After-hours urgent results"],
    specialNote: "Courier pickup 11am and 3pm weekdays. Urgent requests must be phoned through first.",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "pv-2",
    name: "Capital Imaging",
    category: "Radiology",
    servicesProvided: ["X-Ray", "Ultrasound", "CT", "Bulk-billed Medicare scans"],
    servicesNotProvided: ["MRI", "Nuclear medicine"],
    specialNote: "Bulk-bills all Medicare-eligible patients. Walk-ins accepted for X-Ray only.",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "pv-3",
    name: "Northside Allied Health",
    category: "Allied Health",
    servicesProvided: ["Physiotherapy", "Podiatry", "Dietetics"],
    servicesNotProvided: ["Psychology", "Speech pathology"],
    specialNote: "Accepts EPC/CDM referrals. Bulk-bills DVA patients.",
    createdAt: now,
    updatedAt: now,
  },
];

let store: Provider[] = [...seed];
const listeners = new Set<() => void>();

export const providersStore = {
  getAll: () => store,
  add: (item: Provider) => {
    store = [item, ...store];
    listeners.forEach((l) => l());
  },
  update: (item: Provider) => {
    store = store.map((p) => (p.id === item.id ? item : p));
    listeners.forEach((l) => l());
  },
  remove: (id: string) => {
    store = store.filter((p) => p.id !== id);
    listeners.forEach((l) => l());
  },
  subscribe: (fn: () => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
