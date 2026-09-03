import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  delta?: number;
  series?: { value: number }[];
  icon: LucideIcon;
  tone: "primary" | "success" | "warning" | "accent";
  onClick?: () => void;
}

const TONE_CLASS: Record<string, string> = {
  primary: "text-primary bg-primary/10",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
  accent: "text-accent bg-accent/10",
};

const TONE_STROKE: Record<string, string> = {
  primary: "hsl(var(--primary))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  accent: "hsl(var(--accent))",
};

export function KpiCard({ label, value, sub, delta, series, icon: Icon, tone, onClick }: KpiCardProps) {
  const TrendIcon = delta === undefined || delta === 0 ? Minus : delta > 0 ? TrendingUp : TrendingDown;
  return (
    <Card
      className={cn("border-border/60 transition-shadow", onClick && "cursor-pointer hover:shadow-md")}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className={cn("p-1.5 rounded-lg", TONE_CLASS[tone])}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          {delta !== undefined && (
            <span
              className={cn(
                "flex items-center gap-0.5 text-[11px] font-medium",
                delta > 0 ? "text-success" : delta < 0 ? "text-destructive" : "text-muted-foreground"
              )}
            >
              <TrendIcon className="w-3 h-3" />
              {Math.abs(delta)}%
            </span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold tracking-tight mt-0.5">{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
        {series && series.length > 0 && (
          <div className="h-8 mt-2 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id={`g-${tone}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={TONE_STROKE[tone]} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={TONE_STROKE[tone]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={TONE_STROKE[tone]}
                  strokeWidth={1.5}
                  fill={`url(#g-${tone})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
