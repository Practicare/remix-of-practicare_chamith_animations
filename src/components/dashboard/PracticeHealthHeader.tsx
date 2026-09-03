import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, TrendingDown, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { Period, practiceHealthScore } from "@/utils/dashboardMetrics";
import { useOrgSite } from "@/contexts/OrgSiteContext";
import { cn } from "@/lib/utils";

interface Props {
  period: Period;
  onPeriodChange: (p: Period) => void;
}

export function PracticeHealthHeader({ period, onPeriodChange }: Props) {
  const { currentSite } = useOrgSite();
  const { score, status, breakdown } = practiceHealthScore(period);

  const statusLabel = status === "good" ? "Healthy" : status === "warn" ? "Needs attention" : "Critical";
  const statusColor =
    status === "good"
      ? "text-success bg-success/10 border-success/20"
      : status === "warn"
        ? "text-warning bg-warning/10 border-warning/20"
        : "text-destructive bg-destructive/10 border-destructive/20";

  return (
    <Card className="border-border/60">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-16 h-16 rounded-lg flex items-center justify-center font-bold text-2xl border-2",
                statusColor
              )}
            >
              {score}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Practice Health
                </span>
              </div>
              <h2 className="text-lg font-semibold tracking-tight">{currentSite.name}</h2>
              <p className="text-xs text-muted-foreground">
                {format(new Date(), "EEEE, d MMMM yyyy")} · <span className={cn(
                  status === "good" && "text-success",
                  status === "warn" && "text-warning",
                  status === "bad" && "text-destructive"
                )}>{statusLabel}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={(v) => onPeriodChange(v as Period)}>
              <SelectTrigger className="w-[140px] h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Score breakdown bar */}
        <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-border/60">
          {[
            { label: "Tasks", value: breakdown.tasks },
            { label: "Checklists", value: breakdown.checklists },
            { label: "Stock", value: breakdown.stock },
            { label: "Compliance", value: breakdown.compliance },
          ].map((b) => (
            <div key={b.label}>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{b.label}</p>
              <p className="text-sm font-semibold">{b.value}%</p>
              <div className="h-1 bg-muted rounded-full mt-1.5 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full",
                    b.value >= 85 ? "bg-success" : b.value >= 70 ? "bg-warning" : "bg-destructive"
                  )}
                  style={{ width: `${b.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
