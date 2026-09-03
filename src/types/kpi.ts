export type KpiPeriod = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

export const KPI_PERIODS: { value: KpiPeriod; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

export interface Kpi {
  id: string;
  memberId: string;
  memberName: string;
  title: string;
  period: KpiPeriod;
  target: number;
  unit?: string;
  current: number;
  autoTask: boolean;
  createdAt: string;
}
