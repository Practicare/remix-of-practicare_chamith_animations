import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(n || 0);

// Mock budget data
export const BUDGET = {
  planned: 12500,
  actual: 3500,
};

export function BudgetGauge({ planned, actual }: { planned: number; actual: number }) {
  const pct = planned > 0 ? Math.min(120, (actual / planned) * 100) : 0;
  const clamped = Math.min(100, pct);

  // Semicircle geometry
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const r = 100;
  const stroke = 22;

  const polar = (angleDeg: number) => {
    const a = (Math.PI * angleDeg) / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  // Semicircle spans 180° (left) → 360°/0° (right), going over the top
  const arc = (startPct: number, endPct: number, color: string) => {
    const startAngle = 180 + (startPct / 100) * 180;
    const endAngle = 180 + (endPct / 100) * 180;
    const s = polar(startAngle);
    const e = polar(endAngle);
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return (
      <path
        d={`M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="butt"
      />
    );
  };

  // Needle
  const needleAngle = 180 + (clamped / 100) * 180;
  const needleTip = polar(needleAngle);
  const inner = {
    x: cx + (r - stroke) * Math.cos((Math.PI * needleAngle) / 180),
    y: cy + (r - stroke) * Math.sin((Math.PI * needleAngle) / 180),
  };

  const tickLabels = [0, 25, 50, 75, 100];
  const status =
    pct < 60 ? { label: "On track", color: "text-emerald-700" }
    : pct < 90 ? { label: "Watch spend", color: "text-amber-700" }
    : pct <= 100 ? { label: "Near limit", color: "text-orange-700" }
    : { label: "Over budget", color: "text-destructive" };

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`}>
        {/* Track segments: green 0-50, amber 50-80, red 80-100 */}
        {arc(0, 50, "hsl(142 71% 45%)")}
        {arc(50, 80, "hsl(45 93% 55%)")}
        {arc(80, 100, "hsl(0 84% 60%)")}

        {/* Tick labels */}
        {tickLabels.map((t) => {
          const a = 180 + (t / 100) * 180;
          const p = {
            x: cx + (r + 18) * Math.cos((Math.PI * a) / 180),
            y: cy + (r + 18) * Math.sin((Math.PI * a) / 180),
          };
          return (
            <text
              key={t}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground"
              fontSize="10"
            >
              {t === 0 ? "$0" : t === 100 ? fmtCurrency(planned) : fmtCurrency((planned * t) / 100)}
            </text>
          );
        })}

        {/* Needle */}
        <line
          x1={inner.x}
          y1={inner.y}
          x2={needleTip.x}
          y2={needleTip.y}
          stroke="hsl(var(--foreground))"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={5} fill="hsl(var(--foreground))" />

        {/* Center value */}
        <text
          x={cx}
          y={cy - 20}
          textAnchor="middle"
          className="fill-foreground font-semibold"
          fontSize="22"
        >
          {fmtCurrency(actual)}
        </text>
      </svg>
      <div className="text-center -mt-1">
        <p className="text-xs text-muted-foreground">
          Spent {Math.round(pct)}% of {fmtCurrency(planned)} planned budget
        </p>
        <p className={`text-sm font-medium mt-1 ${status.color}`}>{status.label}</p>
      </div>
    </div>
  );
}


export function BudgetSpentSection({
  planned = BUDGET.planned,
  actual = BUDGET.actual,
  periodLabel = "This quarter",
}: { planned?: number; actual?: number; periodLabel?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Budget spent</h3>
          <p className="text-xs text-muted-foreground">Current expenditure as a % of your planned budget</p>
        </div>
        <Badge variant="outline" className="text-[10px]">{periodLabel}</Badge>
      </div>
      <Card>
        <CardContent className="py-6">
          <BudgetGauge planned={planned} actual={actual} />
        </CardContent>
      </Card>
    </div>
  );
}
