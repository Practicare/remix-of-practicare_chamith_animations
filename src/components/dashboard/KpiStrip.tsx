import { useNavigate } from "react-router-dom";
import { CheckSquare, ClipboardList, Package, ShieldCheck } from "lucide-react";
import { KpiCard } from "./KpiCard";
import {
  Period,
  checklistsMetrics,
  complianceMetrics,
  stockMetrics,
  tasksMetrics,
} from "@/utils/dashboardMetrics";

interface Props {
  period: Period;
}

export function KpiStrip({ period }: Props) {
  const navigate = useNavigate();
  const t = tasksMetrics(period);
  const c = checklistsMetrics(period);
  const s = stockMetrics(period);
  const co = complianceMetrics(period);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KpiCard
        label="Tasks completion"
        value={`${t.completionPct}%`}
        sub={`${t.completed}/${t.total} · ${t.overdue} overdue`}
        delta={t.delta}
        series={t.series.map((d) => ({ value: d.completed }))}
        icon={ClipboardList}
        tone="primary"
        onClick={() => navigate("/tasks")}
      />
      <KpiCard
        label="Checklists on-time"
        value={`${c.onTimePct}%`}
        sub={`${c.onTime}/${c.total} submissions`}
        delta={c.delta}
        series={c.series.map((d) => ({ value: d.onTime }))}
        icon={CheckSquare}
        tone="success"
        onClick={() => navigate("/checklists")}
      />
      <KpiCard
        label="Stock validity"
        value={`${s.validityPct}%`}
        sub={`${s.expired.length} expired · ${s.expiring7.length} <7d`}
        delta={s.delta}
        series={s.series.map((d) => ({ value: d.value }))}
        icon={Package}
        tone="warning"
        onClick={() => navigate("/stock")}
      />
      <KpiCard
        label="Compliance"
        value={`${co.compliancePct}%`}
        sub={`${co.expiringSoon} expiring soon`}
        delta={co.delta}
        series={co.series.map((d) => ({ value: d.value }))}
        icon={ShieldCheck}
        tone="accent"
        onClick={() => navigate("/compliance")}
      />
    </div>
  );
}
