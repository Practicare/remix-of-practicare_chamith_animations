import { Task } from "@/types/tasks";
import { StockIntake, StockIntakeLine } from "./stockIntakeStore";

export type StockCheckoutLine = StockIntakeLine;
export type StockCheckout = StockIntake;

export interface StockCheckoutTaskRecord {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  createdAt: string;
}

const CHECKOUT_KEY = "practicare.stockCheckouts.v1";
const CHECKOUT_TASK_KEY = "practicare.stockCheckoutTasks.v1";

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

const MOCK_CHECKOUTS: StockCheckout[] = [
  {
    id: "mock-checkout-1",
    reference: "CO-MOCK-001",
    completedBy: "Sarah Mitchell",
    completedAt: daysAgoISO(3),
    lines: [
      { itemId: "mock-co-1a", itemName: "Nitrile Exam Gloves (Medium)", barcode: "9300607001234", batchNumber: "BTL-2025-A", expiryDate: daysAgoISO(-540), quantity: 20 },
      { itemId: "mock-co-1b", itemName: "Alcohol Swabs 70% IPA", batchNumber: "AS-8842", quantity: 15 },
      { itemId: "mock-co-1c", itemName: "Sterile Gauze Swabs 7.5cm", batchNumber: "GS-1024", expiryDate: daysAgoISO(-365), quantity: 8 },
      { itemId: "mock-co-1d", itemName: "Wound Dressing Packs", batchNumber: "WDP-5591", expiryDate: daysAgoISO(-210), quantity: 4 },
    ],
  },
  {
    id: "mock-checkout-2",
    reference: "CO-MOCK-002",
    completedBy: "James Patel",
    completedAt: daysAgoISO(10),
    lines: [
      { itemId: "mock-co-2a", itemName: "Pulse Oximeter", batchNumber: "POX-7781", quantity: 1 },
      { itemId: "mock-co-2b", itemName: "Digital Thermometer", batchNumber: "DT-9912", quantity: 1 },
      { itemId: "mock-co-2c", itemName: "Examination Lamp", batchNumber: "EL-2204", quantity: 1 },
    ],
  },
  {
    id: "mock-checkout-3",
    reference: "CO-MOCK-003",
    completedBy: "Emma Nguyen",
    completedAt: daysAgoISO(24),
    lines: [
      { itemId: "mock-co-3a", itemName: "A4 Copy Paper (500 sheets)", batchNumber: "PAP-4412", quantity: 2 },
      { itemId: "mock-co-3b", itemName: "Ballpoint Pens (Box of 50)", batchNumber: "PEN-8833", quantity: 1 },
      { itemId: "mock-co-3c", itemName: "Sterile Bandages", batchNumber: "SB-2210", expiryDate: daysAgoISO(-180), quantity: 6 },
      { itemId: "mock-co-3d", itemName: "Disposable Syringes 5ml", batchNumber: "SYN-5521", expiryDate: daysAgoISO(-300), quantity: 10 },
      { itemId: "mock-co-3e", itemName: "Antiseptic Solution 500ml", batchNumber: "ANT-3309", expiryDate: daysAgoISO(-120), quantity: 1 },
    ],
  },
];

export function readStockCheckouts(): StockCheckout[] {
  // Seed mock checkouts the first time the store is read (key never initialised),
  // so the "Previous stock checkouts" list demonstrates the UI. Deletions persist
  // because the key exists from then on.
  if (localStorage.getItem(CHECKOUT_KEY) === null) {
    write(CHECKOUT_KEY, MOCK_CHECKOUTS);
    return MOCK_CHECKOUTS;
  }
  return read<StockCheckout>(CHECKOUT_KEY);
}

export function saveStockCheckout(checkout: StockCheckout): StockCheckout[] {
  const next = [checkout, ...readStockCheckouts()];
  write(CHECKOUT_KEY, next);
  return next;
}

export function deleteStockCheckout(id: string): StockCheckout[] {
  const next = readStockCheckouts().filter((i) => i.id !== id);
  write(CHECKOUT_KEY, next);
  return next;
}

export function addStockCheckoutTask(record: StockCheckoutTaskRecord) {
  write(CHECKOUT_TASK_KEY, [record, ...read<StockCheckoutTaskRecord>(CHECKOUT_TASK_KEY)]);
}

export function getStockCheckoutTasks(): Task[] {
  return read<StockCheckoutTaskRecord>(CHECKOUT_TASK_KEY).map((r) => ({
    id: r.id,
    title: r.title,
    assignee: r.assignee,
    dueDate: new Date(r.dueDate),
    completed: false,
    createdAt: new Date(r.createdAt),
    important: false,
  }));
}
