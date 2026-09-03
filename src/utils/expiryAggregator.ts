import { mockStockItems } from "@/data/mockStock";
import { mockStockCategories } from "@/data/mockStock";
import { mockComplianceItems, mockComplianceCategories } from "@/data/mockCompliance";

export type ExpirySource = "stock" | "calibration" | "electrical" | "compliance";

export interface ExpiryRecord {
  id: string;
  source: ExpirySource;
  sourceLabel: string;
  itemName: string;
  category: string;
  categoryId?: string;
  roomName?: string;
  expiryDate: Date;
  ownerName?: string;
  route: string;
}

const stockCategoryName = (id: string) =>
  mockStockCategories.find((c) => c.id === id)?.name ?? id;

export function getAllExpiryRecords(): ExpiryRecord[] {
  const records: ExpiryRecord[] = [];

  for (const s of mockStockItems) {
    if (s.expiryDate) {
      records.push({
        id: `stock-${s.id}`,
        source: "stock",
        sourceLabel: "Stock",
        itemName: s.name,
        category: stockCategoryName(s.categoryId),
        categoryId: s.categoryId,
        roomName: s.location,
        expiryDate: new Date(s.expiryDate),
        ownerName: s.leadName,
        route: "/stock",
      });
    }
    if (s.nextCalibrationDate) {
      records.push({
        id: `cal-${s.id}`,
        source: "calibration",
        sourceLabel: "Calibration",
        itemName: s.name,
        category: stockCategoryName(s.categoryId),
        categoryId: s.categoryId,
        roomName: s.location,
        expiryDate: new Date(s.nextCalibrationDate),
        ownerName: s.leadName,
        route: "/stock",
      });
    }
    if (s.nextElectricalTestDate) {
      records.push({
        id: `elec-${s.id}`,
        source: "electrical",
        sourceLabel: "Electrical Test",
        itemName: s.name,
        category: stockCategoryName(s.categoryId),
        categoryId: s.categoryId,
        roomName: s.location,
        expiryDate: new Date(s.nextElectricalTestDate),
        ownerName: s.leadName,
        route: "/stock",
      });
    }
  }

  for (const c of mockComplianceItems) {
    const cat =
      mockComplianceCategories.find((x) => x.id === c.categoryId)?.displayName ??
      c.categoryName;
    records.push({
      id: `comp-${c.id}`,
      source: "compliance",
      sourceLabel: "Compliance",
      itemName: c.title,
      category: cat,
      categoryId: c.categoryId,
      expiryDate: new Date(c.expiryDate),
      ownerName: c.assignee,
      route: "/compliance",
    });
  }

  return records;
}

export function daysUntil(date: Date): number {
  const ms = date.getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export type UrgencyBucket = "expired" | "lt7" | "lt30" | "lt90" | "later";

export function urgencyBucket(date: Date): UrgencyBucket {
  const d = daysUntil(date);
  if (d < 0) return "expired";
  if (d <= 7) return "lt7";
  if (d <= 30) return "lt30";
  if (d <= 90) return "lt90";
  return "later";
}

export const URGENCY_LABELS: Record<UrgencyBucket, string> = {
  expired: "Expired",
  lt7: "Expiring in 7 days",
  lt30: "Expiring in 30 days",
  lt90: "Expiring in 90 days",
  later: "Later",
};

export function getExpiringAndExpired(withinDays = 90): ExpiryRecord[] {
  return getAllExpiryRecords()
    .filter((r) => daysUntil(r.expiryDate) <= withinDays)
    .sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime());
}

export function getExpirySummary() {
  const all = getAllExpiryRecords();
  let expired = 0,
    lt7 = 0,
    lt30 = 0;
  for (const r of all) {
    const d = daysUntil(r.expiryDate);
    if (d < 0) expired++;
    else if (d <= 7) lt7++;
    else if (d <= 30) lt30++;
  }
  return { expired, lt7, lt30, total: all.length };
}
