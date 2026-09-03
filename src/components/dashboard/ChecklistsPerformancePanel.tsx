import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Period, checklistsMetrics } from "@/utils/dashboardMetrics";

interface Props { period: Period }

export function ChecklistsPerformancePanel({ period }: Props) {
  const navigate = useNavigate();
  const m = checklistsMetrics(period);
  const totalShifts = m.shifts.morning + m.shifts.afternoon + m.shifts.closing || 1;

  return (
    <Card className="border-border/60">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-success" />
            Checklists Performance
          </h3>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => navigate("/checklists")}>
            View <ArrowRight className="w-3 h-3" />
          </Button>
        </div>

        <div className="h-32 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={m.series}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={24} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
              />
              <Bar dataKey="onTime" stackId="a" fill="hsl(var(--success))" radius={[2, 2, 0, 0]} />
              <Bar dataKey="missed" stackId="a" fill="hsl(var(--destructive))" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60">
          {[
            { label: "Morning", value: m.shifts.morning },
            { label: "Afternoon", value: m.shifts.afternoon },
            { label: "Closing", value: m.shifts.closing },
          ].map((s) => (
            <div key={s.label} className="text-center p-2 rounded-lg bg-muted/40">
              <p className="text-[10px] text-muted-foreground uppercase">{s.label}</p>
              <p className="text-sm font-semibold">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">
                {Math.round((s.value / totalShifts) * 100)}%
              </p>
            </div>
          ))}
        </div>

        {m.mostSkipped.length > 0 && (
          <div className="pt-2 border-t border-border/60">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              Most-skipped items
            </p>
            <div className="space-y-1">
              {m.mostSkipped.slice(0, 3).map((it) => (
                <div key={it.text} className="flex items-center justify-between text-xs">
                  <span className="truncate flex-1">{it.text}</span>
                  <span className="text-muted-foreground ml-2 shrink-0">{it.count}×</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
