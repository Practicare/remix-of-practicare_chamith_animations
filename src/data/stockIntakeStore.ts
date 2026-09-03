import { Task } from "@/types/tasks";

export interface StockIntakeLine {
  itemId: string;
  itemName: string;
  barcode?: string;
  quantity: number;
  /** ISO string */
  expiryDate?: string;
  batchNumber?: string;
  isNewItem?: boolean;
}

export interface StockIntake {
  id: string;
  reference: string;
  categoryId?: string;
  supplier?: string;
  notes?: string;
  lines: StockIntakeLine[];
  /** ISO string */
  completedAt: string;
  /** Name of the team member who completed the intake/checkout */
  completedBy?: string;
}

export interface StockIntakeTaskRecord {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  createdAt: string;
}

const INTAKE_KEY = "practicare.stockIntakes.v1";
const INTAKE_TASK_KEY = "practicare.stockIntakeTasks.v1";

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function daysAgoISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

const MOCK_INTAKES: StockIntake[] = [
  {
    id: "mock-intake-1",
    reference: "SI-MOCK-001",
    completedBy: "Sarah Mitchell",
    completedAt: daysAgoISO(4),
    supplier: "Medline Australia",
    lines: [
      { itemId: "mock-1a", itemName: "Nitrile Exam Gloves (Medium)", barcode: "9300607001234", quantity: 20, expiryDate: daysAgoISO(-540) },
      { itemId: "mock-1b", itemName: "Adrenaline 1mg/mL Ampoules", barcode: "9300607005678", quantity: 10, expiryDate: daysAgoISO(-210) },
      { itemId: "mock-1c", itemName: "Sterile Saline 0.9% 500mL", quantity: 24, expiryDate: daysAgoISO(-365) },
      { itemId: "mock-1d", itemName: "Alcohol Swabs 70% IPA", quantity: 40 },
      { itemId: "mock-1e", itemName: "IV Cannula 20G (Pink)", quantity: 15, expiryDate: daysAgoISO(-300) },
    ],
  },
  {
    id: "mock-intake-2",
    reference: "SI-MOCK-002",
    completedBy: "James Patel",
    completedAt: daysAgoISO(12),
    supplier: "EBOS Healthcare",
    lines: [
      { itemId: "mock-2a", itemName: "Flu Vaccine (Quadrivalent) 2026", quantity: 50, expiryDate: daysAgoISO(-90) },
      { itemId: "mock-2b", itemName: "BD 1mL Tuberculin Syringes", barcode: "9300607023456", quantity: 100 },
      { itemId: "mock-2c", itemName: "Gauze Swabs 7.5cm Sterile", quantity: 60 },
    ],
  },
  {
    id: "mock-intake-3",
    reference: "SI-MOCK-003",
    completedBy: "Emma Nguyen",
    completedAt: daysAgoISO(26),
    supplier: "Symbion",
    lines: [
      { itemId: "mock-3a", itemName: "Panadol 500mg Tablets (100 pack)", quantity: 12, expiryDate: daysAgoISO(-700) },
      { itemId: "mock-3b", itemName: "Ventolin 100mcg Inhaler", quantity: 8, expiryDate: daysAgoISO(-420) },
    ],
  },
];

export function readStockIntakes(): StockIntake[] {
  // Seed mock intakes the first time the store is read (key never initialised),
  // so the "Previous stock intakes" list demonstrates the UI. Deletions persist
  // because the key exists from then on.
  if (localStorage.getItem(INTAKE_KEY) === null) {
    write(INTAKE_KEY, MOCK_INTAKES);
    return MOCK_INTAKES;
  }
  return read<StockIntake>(INTAKE_KEY);
}

export function saveStockIntake(intake: StockIntake): StockIntake[] {
  const next = [intake, ...readStockIntakes()];
  write(INTAKE_KEY, next);
  return next;
}

export function deleteStockIntake(id: string): StockIntake[] {
  const next = readStockIntakes().filter((i) => i.id !== id);
  write(INTAKE_KEY, next);
  return next;
}

export function addStockIntakeTask(record: StockIntakeTaskRecord) {
  write(INTAKE_TASK_KEY, [record, ...read<StockIntakeTaskRecord>(INTAKE_TASK_KEY)]);
}

export function getStockIntakeTasks(): Task[] {
  return read<StockIntakeTaskRecord>(INTAKE_TASK_KEY).map((r) => ({
    id: r.id,
    title: r.title,
    assignee: r.assignee,
    dueDate: new Date(r.dueDate),
    completed: false,
    createdAt: new Date(r.createdAt),
    important: false,
  }));
}
