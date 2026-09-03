import { ActionGuide } from "@/types/actionGuide";

const seed: ActionGuide[] = [
  {
    id: "ag-1",
    title: "Patient faints in waiting room",
    content:
      "<ol><li>Stay calm and call for the duty clinician immediately.</li><li>Lay the patient flat and elevate their legs.</li><li>Check airway, breathing and pulse.</li><li>Loosen tight clothing and ensure good airflow.</li><li>If unresponsive for &gt;1 minute, dial <strong>000</strong>.</li><li>Document the incident in the Communication Book.</li></ol>",
    images: [],
    tags: ["Emergency", "Clinical"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "Practice Manager",
  },
  {
    id: "ag-2",
    title: "EFTPOS terminal not working",
    content:
      "<ol><li>Check the terminal is powered on and connected to Wi-Fi.</li><li>Restart the terminal (hold power 5 seconds).</li><li>If still offline, switch to manual card imprint or request bank transfer.</li><li>Notify reception lead and log a ticket with the bank.</li></ol>",
    images: [],
    tags: ["Reception", "IT"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "Practice Manager",
  },
  {
    id: "ag-3",
    title: "Sharps injury / needlestick",
    content:
      "<ol><li>Wash the area immediately with soap and running water.</li><li>Encourage gentle bleeding — do not suck the wound.</li><li>Cover with a waterproof dressing.</li><li>Notify the duty clinician and complete an incident report.</li><li>Arrange source patient testing if appropriate.</li></ol>",
    images: [],
    tags: ["Emergency", "Clinical", "WHS"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "Practice Manager",
  },
];

let store: ActionGuide[] = [...seed];
const listeners = new Set<() => void>();

export const actionGuideStore = {
  getAll: () => store,
  add: (item: ActionGuide) => {
    store = [item, ...store];
    listeners.forEach((l) => l());
  },
  update: (item: ActionGuide) => {
    store = store.map((g) => (g.id === item.id ? item : g));
    listeners.forEach((l) => l());
  },
  remove: (id: string) => {
    store = store.filter((g) => g.id !== id);
    listeners.forEach((l) => l());
  },
  subscribe: (fn: () => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
