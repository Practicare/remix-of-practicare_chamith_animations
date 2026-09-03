import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { StockItem, StockBatch, computeBatchStatus, deriveBatchMeta } from "@/types/stock";
import { mockStockItems } from "@/data/mockStock";

const STORAGE_KEY = "practicare.stockItems.v3";

const DATE_FIELDS: (keyof StockItem)[] = [
  "expiryDate",
  "calibrationDate",
  "nextCalibrationDate",
  "electricalTestDate",
  "nextElectricalTestDate",
  "annualReviewDate",
  "sixMonthReviewDate",
  "inspectionDate",
  "reviewDate",
  "createdAt",
  "updatedAt",
];

function serialize(items: StockItem[]): string {
  return JSON.stringify(items);
}

function deserialize(raw: string): StockItem[] {
  const arr = JSON.parse(raw) as any[];
  return arr.map((it) => {
    const next: any = { ...it };
    for (const f of DATE_FIELDS) {
      if (next[f]) next[f] = new Date(next[f]);
    }
    if (Array.isArray(next.batches)) {
      next.batches = next.batches.map((b: any) => {
        const bn: any = { ...b };
        if (bn.expiryDate) bn.expiryDate = new Date(bn.expiryDate);
        return bn;
      });
    }
    return normalizeBatches(next as StockItem);
  });
}

function normalizeBatches(item: StockItem): StockItem {
  let batches: StockBatch[] | undefined = item.batches?.map((b) => ({
    ...b,
    status: computeBatchStatus(b.expiryDate),
  }));

  if (!batches || batches.length === 0) {
    batches = [
      {
        id: `b-${item.id}-1`,
        batchNumber: item.batchNumber || "Batch 1",
        expiryDate: item.expiryDate,
        quantity: item.quantity,
        unitPrice: item.buyingPrice,
        status: computeBatchStatus(item.expiryDate),
      },
    ];
  }

  const meta = deriveBatchMeta(batches);
  return { ...item, ...meta, batches };
}

function loadInitial(): StockItem[] {
  if (typeof window === "undefined") return mockStockItems.map(normalizeBatches);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return deserialize(raw);
  } catch {}
  return mockStockItems.map(normalizeBatches);
}

interface StockContextValue {
  items: StockItem[];
  setItems: React.Dispatch<React.SetStateAction<StockItem[]>>;
  createItem: (item: StockItem) => void;
  updateItem: (id: string, patch: Partial<StockItem>) => void;
  deleteItem: (id: string) => void;
  itemsByRoom: (roomName: string) => StockItem[];
}

const StockContext = createContext<StockContextValue | null>(null);

export function StockProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<StockItem[]>(() => loadInitial());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, serialize(items));
    } catch {}
  }, [items]);

  const value = useMemo<StockContextValue>(
    () => ({
      items,
      setItems,
      createItem: (item) => {
        const normalized = normalizeBatches(item);
        setItems((prev) => [normalized, ...prev]);
      },
      updateItem: (id, patch) =>
        setItems((prev) =>
          prev.map((i) => {
            if (i.id !== id) return i;
            let next: StockItem = { ...i, ...patch, updatedAt: new Date() };

            if (next.batches) {
              const batches = next.batches.map((b) => ({
                ...b,
                status: computeBatchStatus(b.expiryDate),
              }));
              const meta = deriveBatchMeta(batches);
              next = { ...next, ...meta, batches };
            } else if (i.batches && i.batches.length > 0 && patch.quantity !== undefined) {
              // Keep batch quantities in sync when only the top-level quantity is changed
              const delta = (patch.quantity ?? 0) - i.quantity;
              const first = { ...i.batches[0], quantity: Math.max(0, i.batches[0].quantity + delta) };
              const batches = [first, ...i.batches.slice(1)];
              const meta = deriveBatchMeta(batches);
              next = { ...next, ...meta, batches };
            }

            return next;
          }),
        ),
      deleteItem: (id) => setItems((prev) => prev.filter((i) => i.id !== id)),
      itemsByRoom: (roomName) =>
        items.filter((i) => {
          const target = roomName.trim().toLowerCase();
          const primary = (i.location || "").trim().toLowerCase();
          if (primary === target) return true;
          return (i.allocatedRooms || []).some(
            (r) => r.trim().toLowerCase() === target
          );
        }),
    }),
    [items]
  );

  return <StockContext.Provider value={value}>{children}</StockContext.Provider>;
}

export function useStock() {
  const ctx = useContext(StockContext);
  if (!ctx) throw new Error("useStock must be used within StockProvider");
  return ctx;
}
