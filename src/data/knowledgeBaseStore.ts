import { KnowledgeDocument } from "@/types/knowledgeBase";

const seed: KnowledgeDocument[] = [
  {
    id: "kb-1",
    name: "Practice Policy Manual.pdf",
    type: "application/pdf",
    size: 0,
    dataUrl: "",
    tags: ["Policy", "HR"],
    description: "Master policy document covering all practice operating procedures.",
    uploadedAt: new Date().toISOString(),
    uploadedBy: "Practice Manager",
  },
  {
    id: "kb-2",
    name: "Infection Control Guidelines.pdf",
    type: "application/pdf",
    size: 0,
    dataUrl: "",
    tags: ["Clinical", "Compliance"],
    description: "Standard infection prevention and control protocols.",
    uploadedAt: new Date().toISOString(),
    uploadedBy: "Practice Manager",
  },
];

let store: KnowledgeDocument[] = [...seed];
const listeners = new Set<() => void>();

export const knowledgeBaseStore = {
  getAll: () => store,
  add: (item: KnowledgeDocument) => {
    store = [item, ...store];
    listeners.forEach((l) => l());
  },
  update: (item: KnowledgeDocument) => {
    store = store.map((d) => (d.id === item.id ? item : d));
    listeners.forEach((l) => l());
  },
  remove: (id: string) => {
    store = store.filter((d) => d.id !== id);
    listeners.forEach((l) => l());
  },
  subscribe: (fn: () => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
