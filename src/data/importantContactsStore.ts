import { ImportantContact } from "@/types/importantContacts";

const now = new Date().toISOString();

const seed: ImportantContact[] = [
  {
    id: "ic-1",
    name: "After-Hours Locum Service",
    category: "Clinical",
    phone: "13 74 25",
    email: "bookings@locumservice.com.au",
    fax: "(02) 9000 1111",
    description: "Out-of-hours doctor cover for urgent patient calls. Use when the duty clinician is unavailable.",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "ic-2",
    name: "Best Practice Software Support",
    category: "IT",
    phone: "1300 401 111",
    email: "support@bpsoftware.net",
    description: "Clinical software vendor support — booking issues, billing, prescriptions.",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "ic-3",
    name: "Sharps & Clinical Waste Pickup",
    category: "Facilities",
    phone: "(03) 8000 5555",
    email: "service@cleanaway.com.au",
    fax: "(03) 8000 5556",
    description: "Schedule sharps bin replacement and clinical waste collection.",
    createdAt: now,
    updatedAt: now,
  },
];

let store: ImportantContact[] = [...seed];
const listeners = new Set<() => void>();

export const importantContactsStore = {
  getAll: () => store,
  add: (item: ImportantContact) => {
    store = [item, ...store];
    listeners.forEach((l) => l());
  },
  update: (item: ImportantContact) => {
    store = store.map((c) => (c.id === item.id ? item : c));
    listeners.forEach((l) => l());
  },
  remove: (id: string) => {
    store = store.filter((c) => c.id !== id);
    listeners.forEach((l) => l());
  },
  subscribe: (fn: () => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
