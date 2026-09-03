import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, CheckCircle2, AlertTriangle, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import { Kpi, KPI_PERIODS, KpiPeriod } from "@/types/kpi";
import { getKpis, kpiProgress, kpiTaskTitle, subscribeKpis } from "@/data/kpiStore";

interface Props {
  memberId?: string;
  title?: string;
  emptyMessage?: string;
  showOwner?: boolean;
}

export function KpiTrackerPanel({
  memberId,
  title = "KPI Tracker",
  emptyMessage = "No KPIs have been set yet.",
  showOwner = true,
}: Props) {
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [period, setPeriod] = useState<KpiPeriod | "all">("all");

  useEffect(() => {
    const load = () => setKpis(getKpis());
    load();
    return subscribeKpis(load);
  }, []);

  const scoped = kpis.filter((k) => (memberId ? k.memberId === memberId : true));
  const filtered = scoped.filter((k) => (period === "all" ? true : k.period === period));

  const onTrack = scoped.filter((k) => kpiProgress(k) >= 80).length;
  const atRisk = scoped.filter((k) => kpiProgress(k) < 50).length;
  const avg = scoped.length
    ? Math.round(scoped.reduce((sum, k) => sum + kpiProgress(k), 0) / scoped.length)
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Target} label="Active KPIs" value={String(scoped.length)} tone="primary" />
        <StatCard icon={TrendingUp} label="Avg attainment" value={`${avg}%`} tone="primary" />
        <StatCard icon={CheckCircle2} label="On track" value={String(onTrack)} tone="success" />
        <StatCard icon={AlertTriangle} label="At risk" value={String(atRisk)} tone="warning" />
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3 flex-wrap">
          <CardTitle className="text-base flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-primary" />
            {title}
          </CardTitle>
          <div className="flex flex-wrap gap-1.5">
            {(["all", ...KPI_PERIODS.map((p) => p.value)] as (KpiPeriod | "all")[]).map((p) => (
              <Button
                key={p}
                size="sm"
                variant={period === p ? "default" : "outline"}
                className="h-7 rounded-lg text-xs capitalize"
                onClick={() => setPeriod(p)}
              >
                {p === "all" ? "All" : p}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground py-6 text-center">{emptyMessage}</p>
          )}
          {filtered.map((kpi) => {
            const pct = kpiProgress(kpi);
            return (
              <div key={kpi.id} className="rounded-lg border border-border/60 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{kpi.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {showOwner && <span>{kpi.memberName} · </span>}
                      <span className="capitalize">{kpi.period}</span> target {kpi.target}
                      {kpi.unit ? ` ${kpi.unit}` : ""}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "rounded-lg shrink-0",
                      pct >= 100
                        ? "bg-success/10 text-success"
                        : pct >= 80
                        ? "bg-primary/10 text-primary"
                        : pct < 50
                        ? "bg-destructive/10 text-destructive"
                        : "bg-warning/10 text-warning"
                    )}
                  >
                    {pct}%
                  </Badge>
                </div>
                <Progress value={pct} className="h-1.5 mt-2.5" />
                <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
                  <span>
                    {kpi.current} of {kpi.target}
                    {kpi.unit ? ` ${kpi.unit}` : ""}
                  </span>
                  {kpi.autoTask && (
                    <span className="flex items-center gap-1 text-primary">
                      <ListChecks className="w-3 h-3" />
                      Task: {kpiTaskTitle(kpi)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Target;
  label: string;
  value: string;
  tone: "primary" | "success" | "warning";
}) {
  const toneClass =
    tone === "success"
      ? "text-success bg-success/10"
      : tone === "warning"
      ? "text-warning bg-warning/10"
      : "text-primary bg-primary/10";
  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <div className={cn("p-1.5 rounded-lg w-fit", toneClass)}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-2">{label}</p>
        <p className="text-2xl font-bold tracking-tight mt-0.5">{value}</p>
      </CardContent>
    </Card>
  );
}
