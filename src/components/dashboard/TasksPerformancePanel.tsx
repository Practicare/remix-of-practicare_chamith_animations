import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ClipboardList, TrendingDown, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Period, tasksMetrics } from "@/utils/dashboardMetrics";

interface Props { period: Period }

export function TasksPerformancePanel({ period }: Props) {
  const navigate = useNavigate();
  const m = tasksMetrics(period);

  return (
    <Card className="border-border/60">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary" />
            Tasks Performance
          </h3>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => navigate("/tasks")}>
            View tasks <ArrowRight className="w-3 h-3" />
          </Button>
        </div>

        <div className="h-40 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={m.series}>
              <defs>
                <linearGradient id="taskDone" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="taskOverdue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={24} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
              />
              <Area type="monotone" dataKey="completed" stroke="hsl(var(--primary))" fill="url(#taskDone)" strokeWidth={2} />
              <Area type="monotone" dataKey="overdue" stroke="hsl(var(--destructive))" fill="url(#taskOverdue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/60">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-success" /> Top performers
            </p>
            <div className="space-y-1.5">
              {m.top.length === 0 ? (
                <p className="text-xs text-muted-foreground">No data yet</p>
              ) : (
                m.top.map((p) => (
                  <div key={p.name} className="flex items-center justify-between text-xs">
                    <span className="truncate">{p.name}</span>
                    <span className="font-semibold text-success ml-2">{p.pct}%</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-destructive" /> Bottlenecks
            </p>
            <div className="space-y-1.5">
              {m.bottom.length === 0 ? (
                <p className="text-xs text-muted-foreground">No data yet</p>
              ) : (
                m.bottom.map((p) => (
                  <div key={p.name} className="flex items-center justify-between text-xs">
                    <span className="truncate">{p.name}</span>
                    <span className="font-semibold text-destructive ml-2">{p.pct}%</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
