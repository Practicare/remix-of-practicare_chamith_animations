import { addDays, differenceInDays, format, isAfter, isBefore, isWithinInterval, startOfDay, subDays } from "date-fns";
import { mockTasks } from "@/data/mockTasks";
import { mockChecklists } from "@/data/mockChecklists";
import { mockChecklistSubmissions } from "@/data/mockChecklistSubmissions";
import { mockStockItems } from "@/data/mockStock";
import { mockComplianceItems } from "@/data/mockCompliance";
import { mockStaffMembers } from "@/data/mockStaff";

export type Period = "today" | "7d" | "30d" | "90d";

export const PERIOD_LABEL: Record<Period, string> = {
  today: "Today",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

export function periodDays(p: Period): number {
  switch (p) {
    case "today": return 1;
    case "7d": return 7;
    case "30d": return 30;
    case "90d": return 90;
  }
}

export function periodRange(p: Period): { start: Date; end: Date } {
  const end = new Date();
  const start = subDays(startOfDay(end), periodDays(p) - 1);
  return { start, end };
}

export function previousRange(p: Period): { start: Date; end: Date } {
  const days = periodDays(p);
  const end = subDays(startOfDay(new Date()), days);
  const start = subDays(end, days - 1);
  return { start, end };
}

// ── Tasks ──
export function tasksMetrics(p: Period) {
  const { start, end } = periodRange(p);
  const today = startOfDay(new Date());

  const inRange = mockTasks.filter((t) => {
    const ref = t.completed ? t.dueDate : t.createdAt;
    return ref && isWithinInterval(new Date(ref), { start, end });
  });
  const completed = inRange.filter((t) => t.completed).length;
  const total = inRange.length || mockTasks.length;
  const overdue = mockTasks.filter((t) => !t.completed && isBefore(startOfDay(t.dueDate), today)).length;
  const completionPct = total ? Math.round((completed / total) * 100) : 0;

  // Sparkline: last N days completed counts
  const days = periodDays(p);
  const series = Array.from({ length: Math.min(days, 14) }, (_, i) => {
    const d = startOfDay(subDays(new Date(), Math.min(days, 14) - 1 - i));
    const next = addDays(d, 1);
    const count = mockTasks.filter(
      (t) => t.completed && isWithinInterval(new Date(t.dueDate), { start: d, end: next })
    ).length;
    const overdueOn = mockTasks.filter(
      (t) => !t.completed && isWithinInterval(new Date(t.dueDate), { start: d, end: next })
    ).length;
    return { date: format(d, "MMM d"), completed: count, overdue: overdueOn };
  });

  // Previous period delta
  const prev = previousRange(p);
  const prevInRange = mockTasks.filter((t) => {
    const ref = t.completed ? t.dueDate : t.createdAt;
    return ref && isWithinInterval(new Date(ref), prev);
  });
  const prevPct = prevInRange.length
    ? Math.round((prevInRange.filter((t) => t.completed).length / prevInRange.length) * 100)
    : completionPct;
  const delta = completionPct - prevPct;

  // Performers
  const byAssignee = new Map<string, { done: number; total: number }>();
  mockTasks.forEach((t) => {
    const k = t.assignee || "Unassigned";
    const v = byAssignee.get(k) || { done: 0, total: 0 };
    v.total += 1;
    if (t.completed) v.done += 1;
    byAssignee.set(k, v);
  });
  const performers = Array.from(byAssignee.entries())
    .map(([name, v]) => ({ name, pct: v.total ? Math.round((v.done / v.total) * 100) : 0, done: v.done, total: v.total }))
    .filter((p) => p.total >= 2);
  const top = [...performers].sort((a, b) => b.pct - a.pct).slice(0, 3);
  const bottom = [...performers].sort((a, b) => a.pct - b.pct).slice(0, 3);

  return { completionPct, completed, total, overdue, series, delta, top, bottom };
}

// ── Checklists ──
export function checklistsMetrics(p: Period) {
  const { start, end } = periodRange(p);
  const subs = mockChecklistSubmissions.filter((s) =>
    isWithinInterval(new Date(s.submittedAt), { start, end })
  );
  const total = subs.length;
  const onTime = subs.filter((s) => s.completionPercentage >= 90).length;
  const onTimePct = total ? Math.round((onTime / total) * 100) : 0;
  const missed = subs.filter((s) => s.completionPercentage < 50).length;

  // Sparkline by day
  const days = periodDays(p);
  const series = Array.from({ length: Math.min(days, 14) }, (_, i) => {
    const d = startOfDay(subDays(new Date(), Math.min(days, 14) - 1 - i));
    const next = addDays(d, 1);
    const dayItems = mockChecklistSubmissions.filter((s) =>
      isWithinInterval(new Date(s.submittedAt), { start: d, end: next })
    );
    const onT = dayItems.filter((s) => s.completionPercentage >= 90).length;
    return {
      date: format(d, "MMM d"),
      onTime: onT,
      missed: dayItems.length - onT,
    };
  });

  // Most-skipped items
  const skipMap = new Map<string, number>();
  mockChecklists.forEach((cl) => {
    cl.items.forEach((it) => {
      if (!it.completed) skipMap.set(it.text, (skipMap.get(it.text) || 0) + 1);
    });
  });
  const mostSkipped = Array.from(skipMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([text, count]) => ({ text, count }));

  // Shift breakdown — by hour of submission
  const shifts = { morning: 0, afternoon: 0, closing: 0 };
  subs.forEach((s) => {
    const h = new Date(s.submittedAt).getHours();
    if (h < 12) shifts.morning += 1;
    else if (h < 17) shifts.afternoon += 1;
    else shifts.closing += 1;
  });

  // Delta
  const prev = previousRange(p);
  const prevSubs = mockChecklistSubmissions.filter((s) =>
    isWithinInterval(new Date(s.submittedAt), prev)
  );
  const prevOnTime = prevSubs.filter((s) => s.completionPercentage >= 90).length;
  const prevPct = prevSubs.length ? Math.round((prevOnTime / prevSubs.length) * 100) : onTimePct;

  return { onTimePct, total, onTime, missed, series, mostSkipped, shifts, delta: onTimePct - prevPct };
}

// ── Stock ──
export function stockMetrics(_p: Period) {
  const items = mockStockItems;
  const today = startOfDay(new Date());
  const expired = items.filter((i) => i.expiryDate && isBefore(new Date(i.expiryDate), today));
  const expiring7 = items.filter((i) => {
    if (!i.expiryDate) return false;
    const d = differenceInDays(new Date(i.expiryDate), today);
    return d >= 0 && d <= 7;
  });
  const expiring14 = items.filter((i) => {
    if (!i.expiryDate) return false;
    const d = differenceInDays(new Date(i.expiryDate), today);
    return d > 7 && d <= 14;
  });
  const expiring30 = items.filter((i) => {
    if (!i.expiryDate) return false;
    const d = differenceInDays(new Date(i.expiryDate), today);
    return d > 14 && d <= 30;
  });
  const lowStock = items.filter((i) => i.quantity <= 2).slice(0, 5);

  const validityPct = items.length
    ? Math.round(((items.length - expired.length) / items.length) * 100)
    : 100;

  // Category donut
  const byCat = new Map<string, number>();
  items.forEach((i) => byCat.set(i.categoryId, (byCat.get(i.categoryId) || 0) + 1));
  const categories = Array.from(byCat.entries()).map(([name, value]) => ({ name, value }));

  // Sparkline (synthetic — validity over last 14 days, currently flat)
  const series = Array.from({ length: 14 }, (_, i) => ({
    date: format(subDays(new Date(), 13 - i), "MMM d"),
    value: validityPct,
  }));

  return {
    validityPct,
    expired,
    expiring7,
    expiring14,
    expiring30,
    lowStock,
    categories,
    series,
    delta: 0,
  };
}

// ── Compliance ──
export function complianceMetrics(_p: Period) {
  const items = mockComplianceItems;
  const today = startOfDay(new Date());
  const expired = items.filter((i: any) => i.expiryDate && isBefore(new Date(i.expiryDate), today));
  const expiringSoon = items.filter((i: any) => {
    if (!i.expiryDate) return false;
    const d = differenceInDays(new Date(i.expiryDate), today);
    return d >= 0 && d <= 60;
  });
  const total = items.length || 1;
  const valid = total - expired.length;
  const compliancePct = Math.round((valid / total) * 100);

  // Staff cert expiries (mocked: birthday-derived placeholder when no real certs)
  const certExpiries = mockStaffMembers
    .filter((s) => s.invitationStatus === "accepted")
    .slice(0, 4)
    .map((s, idx) => ({
      name: `${s.firstName} ${s.lastName}`,
      cert: ["First Aid", "CPR", "AHPRA Renewal", "WHS Training"][idx % 4],
      expiresIn: [12, 28, 45, 58][idx % 4],
    }));

  return {
    compliancePct,
    expired: expired.length,
    expiringSoon: expiringSoon.length,
    certExpiries,
    series: Array.from({ length: 14 }, (_, i) => ({
      date: format(subDays(new Date(), 13 - i), "MMM d"),
      value: compliancePct,
    })),
    delta: 0,
  };
}

// ── Practice Health Score ──
export function practiceHealthScore(p: Period) {
  const t = tasksMetrics(p).completionPct;
  const c = checklistsMetrics(p).onTimePct;
  const s = stockMetrics(p).validityPct;
  const co = complianceMetrics(p).compliancePct;
  const score = Math.round((t + c + s + co) / 4);
  const status: "good" | "warn" | "bad" = score >= 85 ? "good" : score >= 70 ? "warn" : "bad";
  return { score, status, breakdown: { tasks: t, checklists: c, stock: s, compliance: co } };
}

// ── Activity feed ──
export type ActivityEvent = {
  id: string;
  type: "task" | "checklist" | "stock" | "compliance";
  title: string;
  actor?: string;
  at: Date;
};

export function activityFeed(limit = 20): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  mockTasks
    .filter((t) => t.completed)
    .forEach((t) =>
      events.push({
        id: `t-${t.id}`,
        type: "task",
        title: `Completed: ${t.title}`,
        actor: t.assignee,
        at: new Date(t.dueDate),
      })
    );

  mockChecklistSubmissions.forEach((s) =>
    events.push({
      id: `c-${s.id}`,
      type: "checklist",
      title: `${s.checklistTitle} — ${s.completionPercentage}%`,
      actor: s.submittedBy,
      at: new Date(s.submittedAt),
    })
  );

  mockStockItems
    .filter((i) => i.status === "expiring" || i.status === "expired")
    .slice(0, 6)
    .forEach((i) =>
      events.push({
        id: `s-${i.id}`,
        type: "stock",
        title: `${i.name} — ${i.status === "expired" ? "expired" : "expiring soon"}`,
        at: new Date(i.expiryDate || i.updatedAt),
      })
    );

  return events.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, limit);
}
