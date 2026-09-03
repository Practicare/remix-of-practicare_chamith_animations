import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight, Clock, Package, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Period, checklistsMetrics, complianceMetrics, stockMetrics, tasksMetrics } from "@/utils/dashboardMetrics";
import { cn } from "@/lib/utils";

interface Props {
  period: Period;
}

export function CriticalAlertsStrip({ period }: Props) {
  const navigate = useNavigate();
  const t = tasksMetrics(period);
  const c = checklistsMetrics(period);
  const s = stockMetrics(period);
  const co = complianceMetrics(period);

  const chips = [
    {
      show: t.overdue > 0,
      label: `${t.overdue} overdue task${t.overdue !== 1 ? "s" : ""}`,
      icon: Clock,
      severity: "critical" as const,
      onClick: () => navigate("/tasks"),
    },
    {
      show: s.expired.length > 0,
      label: `${s.expired.length} expired stock item${s.expired.length !== 1 ? "s" : ""}`,
      icon: Package,
      severity: "critical" as const,
      onClick: () => navigate("/stock"),
    },
    {
      show: s.expiring7.length > 0,
      label: `${s.expiring7.length} expiring < 7d`,
      icon: Package,
      severity: "warning" as const,
      onClick: () => navigate("/stock"),
    },
    {
      show: c.missed > 0,
      label: `${c.missed} missed checklist${c.missed !== 1 ? "s" : ""}`,
      icon: AlertTriangle,
      severity: "critical" as const,
      onClick: () => navigate("/checklists"),
    },
    {
      show: co.expired > 0,
      label: `${co.expired} expired compliance`,
      icon: ShieldAlert,
      severity: "critical" as const,
      onClick: () => navigate("/compliance"),
    },
  ].filter((c) => c.show);

  if (chips.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap p-3 rounded-lg border border-destructive/20 bg-destructive/5">
      <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
      <span className="text-xs font-medium text-destructive mr-1">Needs attention:</span>
      {chips.map((c, i) => (
        <Button
          key={i}
          variant="outline"
          size="sm"
          className={cn(
            "h-7 text-xs gap-1.5 rounded-lg",
            c.severity === "critical"
              ? "border-destructive/30 text-destructive hover:bg-destructive/10"
              : "border-warning/30 text-warning hover:bg-warning/10"
          )}
          onClick={c.onClick}
        >
          <c.icon className="w-3 h-3" />
          {c.label}
          <ArrowRight className="w-3 h-3" />
        </Button>
      ))}
    </div>
  );
}
