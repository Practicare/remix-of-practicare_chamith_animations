import { Kpi, KpiPeriod } from "@/types/kpi";
import { Task } from "@/types/tasks";
import { addDays } from "date-fns";

const KPI_KEY = "practicare_kpis";
const KPI_TASK_KEY = "practicare_kpi_tasks";

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeKpis(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function emit() {
  listeners.forEach((l) => l());
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

const SEED: Omit<Kpi, "id" | "createdAt">[] = [
  { memberId: "staff-1", memberName: "Sarah Johnson", title: "Patient calls returned", period: "daily", target: 25, unit: "calls", current: 19, autoTask: true },
  { memberId: "staff-1", memberName: "Sarah Johnson", title: "Recalls actioned", period: "weekly", target: 40, unit: "recalls", current: 34, autoTask: false },
  { memberId: "staff-2", memberName: "James Wilson", title: "Billing accuracy", period: "monthly", target: 98, unit: "%", current: 95, autoTask: true },
  { memberId: "staff-3", memberName: "Michael Chen", title: "Cold chain audits", period: "quarterly", target: 3, unit: "audits", current: 2, autoTask: false },
  { memberId: "staff-2", memberName: "James Wilson", title: "Accreditation readiness", period: "yearly", target: 100, unit: "%", current: 62, autoTask: true },
];

export function getKpis(): Kpi[] {
  const existing = read<Kpi[] | null>(KPI_KEY, null);
  if (existing && existing.length) return existing;
  const seeded: Kpi[] = SEED.map((k, i) => ({
    ...k,
    id: `kpi-seed-${i + 1}`,
    createdAt: new Date().toISOString(),
  }));
  write(KPI_KEY, seeded);
  return seeded;
}

export function saveKpis(kpis: Kpi[]) {
  write(KPI_KEY, kpis);
  emit();
}

export function addKpi(kpi: Omit<Kpi, "id" | "createdAt">): Kpi {
  const created: Kpi = { ...kpi, id: `kpi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, createdAt: new Date().toISOString() };
  const next = [...getKpis(), created];
  saveKpis(next);
  if (created.autoTask) createKpiTask(created);
  return created;
}

export function updateKpi(id: string, patch: Partial<Kpi>) {
  saveKpis(getKpis().map((k) => (k.id === id ? { ...k, ...patch } : k)));
}

export function deleteKpi(id: string) {
  saveKpis(getKpis().filter((k) => k.id !== id));
  write(KPI_TASK_KEY, readKpiTaskRecords().filter((t) => t.kpiId !== id));
}

// ── Auto-generated tasks ──
interface KpiTaskRecord {
  id: string;
  kpiId: string;
  title: string;
  assignee: string;
  dueDate: string;
  createdAt: string;
}

const DUE_DAYS: Record<KpiPeriod, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  quarterly: 90,
  yearly: 365,
};

export function kpiTaskTitle(kpi: Kpi) {
  return `Achieve ${kpi.title} — ${kpi.target}${kpi.unit ? ` ${kpi.unit}` : ""} (${kpi.period})`;
}

function readKpiTaskRecords(): KpiTaskRecord[] {
  return read<KpiTaskRecord[]>(KPI_TASK_KEY, []);
}

export function createKpiTask(kpi: Kpi) {
  const records = readKpiTaskRecords();
  const record: KpiTaskRecord = {
    id: `task-kpi-${kpi.id}`,
    kpiId: kpi.id,
    title: kpiTaskTitle(kpi),
    assignee: kpi.memberName,
    dueDate: addDays(new Date(), DUE_DAYS[kpi.period]).toISOString(),
    createdAt: new Date().toISOString(),
  };
  write(KPI_TASK_KEY, [...records.filter((r) => r.kpiId !== kpi.id), record]);
  emit();
}

export function getKpiGeneratedTasks(): Task[] {
  return readKpiTaskRecords().map((r) => ({
    id: r.id,
    title: r.title,
    assignee: r.assignee,
    dueDate: new Date(r.dueDate),
    completed: false,
    createdAt: new Date(r.createdAt),
    important: false,
  }));
}

export function kpiProgress(kpi: Kpi) {
  if (!kpi.target) return 0;
  return Math.min(100, Math.round((kpi.current / kpi.target) * 100));
}
