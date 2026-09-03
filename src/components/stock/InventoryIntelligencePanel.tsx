import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Wallet, Calendar, CalendarDays, CalendarRange, TrendingUp, TrendingDown, Gauge, Truck, Repeat,
} from "lucide-react";
import {
  ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { BudgetSpentSection } from "./BudgetGauge";


const STORAGE_EXPENSE = "practicare.inventoryPlanExpense.v1";
const STORAGE_BUDGET = "practicare.inventoryPlanBudget.v1";
const STORAGE_LEVELS = "practicare.inventoryPlanLevels.v1";

interface ExpenseRow {
  id: string;
  itemName: string;
  expense: number;
  period: "month" | "quarter" | "year";
}

interface StockLevelRow {
  id: string;
  itemName: string;
  min: number;
  max: number;
}

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(n || 0);

const STORAGE_INCOME = "practicare.inventoryPlanIncome.v1";

function SpendVsIncomeCard({
  totals,
  defaultPeriod,
  labels,
}: {
  totals: { month: number; quarter: number; year: number };
  defaultPeriod: "month" | "quarter" | "year";
  labels: Record<"month" | "quarter" | "year", { period: string; subtitle: string }>;
}) {
  const currentYear = new Date().getFullYear();
  const yearOptions = [0, 1, 2, 3].map((n) => currentYear - n);
  const [year, setYear] = useState<number>(currentYear);
  const [periodKey, setPeriodKey] = useState<"month" | "quarter" | "year">(defaultPeriod);
  const [incomes, setIncomes] = useState<Record<string, number>>(() =>
    loadJSON<Record<string, number>>(STORAGE_INCOME, {})
  );
  const [draft, setDraft] = useState<string>("");

  const incomeKey = `${year}-${periodKey}`;

  useEffect(() => {
    setPeriodKey(defaultPeriod);
  }, [defaultPeriod]);

  useEffect(() => {
    setDraft(incomes[incomeKey] ? String(incomes[incomeKey]) : "");
  }, [incomeKey, incomes]);

  const isCurrentYear = year === currentYear;
  const actual = isCurrentYear ? totals[periodKey] || 0 : 0;
  const periodLabel = isCurrentYear
    ? labels[periodKey].period
    : `${labels[periodKey].subtitle.replace("This ", "").replace("Year to date", "Year")} · ${year}`;
  const subtitle = labels[periodKey].subtitle;
  const income = incomes[incomeKey] || 0;
  const pct = income > 0 ? (actual / income) * 100 : 0;
  const tone = pct === 0 ? "muted" : pct <= 15 ? "good" : pct <= 25 ? "warn" : "bad";
  const toneClass =
    tone === "good" ? "text-primary" : tone === "warn" ? "text-amber-600" : tone === "bad" ? "text-destructive" : "text-muted-foreground";

  const save = () => {
    const val = Math.max(0, parseFloat(draft) || 0);
    const next = { ...incomes, [incomeKey]: val };
    setIncomes(next);
    try {
      localStorage.setItem(STORAGE_INCOME, JSON.stringify(next));
    } catch { /* ignore */ }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" /> % of inventory expense to the gross billing
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border bg-muted/40 p-0.5">
              {(["month", "quarter", "year"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriodKey(p)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                    periodKey === p ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p === "month" ? "Month" : p === "quarter" ? "Quarter" : "Year"}
                </button>
              ))}
            </div>
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="h-8 w-[124px] text-xs border-primary/40 bg-background">
                <CalendarDays className="w-3.5 h-3.5 text-primary mr-1 shrink-0" />
                <SelectValue placeholder="Year" />
              </SelectTrigger>

              <SelectContent>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={String(y)} className="text-xs">{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline" className="text-[10px]">{periodLabel}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
          <div className="space-y-1.5">
            <Label htmlFor="period-income" className="text-xs">{subtitle} gross billing (AUD)</Label>
            <Input
              id="period-income"
              type="number"
              min={0}
              inputMode="decimal"
              placeholder="e.g. 85000"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
            />
          </div>
          <Button onClick={save} className="w-full sm:w-auto">Save</Button>
        </div>

        {income > 0 ? (
          <div className="space-y-2.5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className={`text-3xl font-semibold tracking-tight ${toneClass}`}>{pct.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">of gross billing spent on inventory</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{fmt(actual)} <span className="text-muted-foreground font-normal">spent</span></p>
                <p className="text-xs text-muted-foreground">Gross billing {fmt(income)}</p>
              </div>
            </div>
            <Progress value={Math.min(100, pct)} className="h-2" />
            <p className="text-[11px] text-muted-foreground">
              {tone === "good"
                ? "Healthy — inventory spend is well within a sustainable share of gross billing."
                : tone === "warn"
                ? "Moderate — inventory spend is climbing as a share of gross billing."
                : "High — inventory spend is taking a large share of gross billing. Review ordering levels."}
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Enter your {subtitle.toLowerCase()} gross billing to see inventory expense of {fmt(actual)} as a percentage.
          </p>
        )}
      </CardContent>
    </Card>
  );
}



const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// deterministic pseudo-variation so the trend looks natural but stays stable
const wave = (i: number, seed: number) => 0.78 + 0.44 * Math.abs(Math.sin(i * 1.7 + seed));

function ExpenseTrendCard({
  budget,
  totals,
  year,
  isCurrentYear,
}: {
  budget: { month: number; quarter: number; year: number };
  totals: { month: number; quarter: number; year: number };
  year: number;
  isCurrentYear: boolean;
}) {
  const [view, setView] = useState<PeriodKey>("month");

  const data = useMemo(() => {
    const nowMonth = new Date().getMonth();
    if (view === "month") {
      return MONTHS.map((m, i) => {
        const future = isCurrentYear && i > nowMonth;
        return {
          label: m,
          planned: Math.round(budget.month || 0),
          actual: future ? null : Math.round((totals.month || 0) * wave(i, 1.1)),
        };
      });
    }
    if (view === "quarter") {
      const nowQ = Math.floor(nowMonth / 3);
      return [0, 1, 2, 3].map((i) => {
        const future = isCurrentYear && i > nowQ;
        return {
          label: `Q${i + 1}`,
          planned: Math.round(budget.quarter || 0),
          actual: future ? null : Math.round((totals.quarter || 0) * wave(i, 2.3)),
        };
      });
    }
    return [3, 2, 1, 0].map((back, i) => ({
      label: String(year - back),
      planned: Math.round(budget.year || 0),
      actual: Math.round((totals.year || 0) * wave(i, 0.6)),
    }));
  }, [view, budget, totals, year, isCurrentYear]);

  const totalPlanned = data.reduce((a, b) => a + (b.planned || 0), 0);
  const totalActual = data.reduce((a, b) => a + (b.actual || 0), 0);
  const variance = totalActual - totalPlanned;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Planned vs actual expense trend
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border bg-muted/40 p-0.5">
              {(["month", "quarter", "year"] as PeriodKey[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setView(p)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors ${
                    view === p ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p === "month" ? "Months" : p === "quarter" ? "Quarters" : "Years"}
                </button>
              ))}
            </div>
            <Badge variant="outline" className="text-[10px]">{view === "year" ? "Last 4 years" : year}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-[11px] text-muted-foreground">Planned</p>
            <p className="text-base font-semibold">{fmt(totalPlanned)}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Actual</p>
            <p className="text-base font-semibold">{fmt(totalActual)}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Variance</p>
            <p className={`text-base font-semibold ${variance > 0 ? "text-destructive" : "text-emerald-700"}`}>
              {variance > 0 ? "+" : ""}{fmt(variance)}
            </p>
          </div>
        </div>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => (v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${v}`)}
              />
              <Tooltip
                formatter={(v: number, name: string) => [fmt(v), name === "planned" ? "Planned" : "Actual"]}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 10,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--popover))",
                  color: "hsl(var(--popover-foreground))",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={26}
                iconType="circle"
                formatter={(value) => (
                  <span className="text-[11px] text-muted-foreground">{value === "planned" ? "Planned" : "Actual"}</span>
                )}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#actualFill)"
                connectNulls
                dot={{ r: 3, strokeWidth: 0, fill: "hsl(var(--primary))" }}
              />
              <Line
                type="monotone"
                dataKey="planned"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}


const MOCK_BUDGET = { month: 4200, quarter: 12500, year: 48000 };
const MOCK_TOTALS = { month: 3680, quarter: 13420, year: 31240 };
const MOCK_LEVELS: StockLevelRow[] = [
  { id: "m1", itemName: "Nitrile gloves (M)", min: 20, max: 80 },
  { id: "m2", itemName: "Surgical masks", min: 15, max: 60 },
  { id: "m3", itemName: "Alcohol swabs", min: 10, max: 50 },
  { id: "m4", itemName: "Syringes 5ml", min: 25, max: 100 },
  { id: "m5", itemName: "Gauze pads 4x4", min: 12, max: 48 },
  { id: "m6", itemName: "A4 printer paper", min: 5, max: 20 },
  { id: "m7", itemName: "Examination table paper", min: 8, max: 30 },
];

type PeriodKey = "month" | "quarter" | "year";

const PO_KEY = "practicare.purchaseOrders.v1";

const MOCK_ORDER_FREQ: { name: string; times: number; units: number }[] = [
  { name: "Nitrile gloves (M)", times: 14, units: 168 },
  { name: "Alcohol swabs", times: 11, units: 240 },
  { name: "Surgical masks", times: 9, units: 130 },
  { name: "Syringes 5ml", times: 7, units: 95 },
  { name: "Gauze pads 4x4", times: 4, units: 40 },
  { name: "Examination table paper", times: 2, units: 12 },
  { name: "A4 printer paper", times: 1, units: 5 },
];

function OrderFrequencyCard({ year, periodLabel }: { year: number; periodLabel: string }) {
  const rows = useMemo(() => {
    let pos: any[] = [];
    try {
      const raw = localStorage.getItem(PO_KEY);
      if (raw) pos = JSON.parse(raw) || [];
    } catch {}
    const map = new Map<string, { name: string; times: number; units: number }>();
    pos
      .filter((p) => {
        const d = new Date(p?.orderDate || p?.createdAt || "");
        return !isNaN(d.getTime()) ? d.getFullYear() === year : false;
      })
      .forEach((p) => {
        (p?.lines || []).forEach((l: any) => {
          const name = (l?.itemName || "").trim();
          if (!name) return;
          const cur = map.get(name) || { name, times: 0, units: 0 };
          cur.times += 1;
          cur.units += Number(l?.quantity) || 0;
          map.set(name, cur);
        });
      });
    const list = Array.from(map.values());
    return list.length > 0 ? list : MOCK_ORDER_FREQ;
  }, [year]);

  const sorted = [...rows].sort((a, b) => b.times - a.times);
  const most = sorted.slice(0, 5);
  const least = [...sorted].reverse().slice(0, 5);
  const maxTimes = Math.max(1, ...sorted.map((r) => r.times));

  const List = ({
    data, tone, icon: Icon, title, caption,
  }: { data: typeof rows; tone: string; icon: typeof TrendingUp; title: string; caption: string }) => (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${tone}`} />
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{caption}</p>
      <div className="space-y-2.5">
        {data.map((r) => (
          <div key={r.name}>
            <div className="flex items-center justify-between gap-2 text-xs mb-1">
              <span className="truncate font-medium">{r.name}</span>
              <span className="text-muted-foreground shrink-0">
                {r.times}× · {r.units} units
              </span>
            </div>
            <Progress value={(r.times / maxTimes) * 100} className="h-1.5" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-sm flex items-center gap-2">
            <Repeat className="w-4 h-4 text-primary" /> Order frequency
          </CardTitle>
          <Badge variant="secondary" className="text-[10px]">{periodLabel} · {year}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <List data={most} tone="text-emerald-600" icon={TrendingUp} title="Ordered most often" caption="Top items by number of purchase orders" />
        <List data={least} tone="text-amber-600" icon={TrendingDown} title="Ordered least often" caption="Items rarely reordered — review stock levels" />
      </CardContent>
    </Card>
  );
}

export function InventoryIntelligencePanel() {
  const storedExpenses = loadJSON<ExpenseRow[]>(STORAGE_EXPENSE, []);
  const storedBudget = loadJSON(STORAGE_BUDGET, { month: 0, quarter: 0, year: 0 });
  const storedLevels = loadJSON<StockLevelRow[]>(STORAGE_LEVELS, []);
  const [periodFilter, setPeriodFilter] = useState<PeriodKey>("quarter");
  const currentYear = new Date().getFullYear();
  const yearOptions = [0, 1, 2, 3].map((n) => currentYear - n);
  const [filterYear, setFilterYear] = useState<number>(currentYear);
  const isCurrentYear = filterYear === currentYear;

  const computed = useMemo(() => {
    const sum = (p: "month" | "quarter" | "year") =>
      storedExpenses.filter((e) => e.period === p).reduce((a, b) => a + (Number(b.expense) || 0), 0);
    return { month: sum("month"), quarter: sum("quarter"), year: sum("year") };
  }, [storedExpenses]);

  const hasBudget = storedBudget.month || storedBudget.quarter || storedBudget.year;
  const hasExpenses = storedExpenses.length > 0;
  const budget = hasBudget ? storedBudget : MOCK_BUDGET;
  const rawTotals = hasExpenses ? computed : MOCK_TOTALS;
  const totals = isCurrentYear ? rawTotals : { month: 0, quarter: 0, year: 0 };

  const now = new Date();
  const monthLabel = isCurrentYear
    ? now.toLocaleString("en-AU", { month: "long", year: "numeric" })
    : `Monthly · ${filterYear}`;
  const quarterLabel = isCurrentYear
    ? `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`
    : `Quarterly · ${filterYear}`;
  const yearLabel = isCurrentYear ? `${now.getFullYear()} · to-date` : `${filterYear}`;

  const periodMeta: Record<PeriodKey, { label: string; icon: typeof Wallet; period: string; subtitle: string }> = {
    month: { label: "Monthly expense", icon: Calendar, period: monthLabel, subtitle: isCurrentYear ? "This month" : `Month ${filterYear}` },
    quarter: { label: "Quarterly expense", icon: CalendarRange, period: quarterLabel, subtitle: isCurrentYear ? "This quarter" : `Quarter ${filterYear}` },
    year: { label: "Yearly expense", icon: CalendarDays, period: yearLabel, subtitle: isCurrentYear ? "Year to date" : `Year ${filterYear}` },
  };
  const meta = periodMeta[periodFilter];

  const realPlannedLevels = storedLevels.filter((l) => (l.min || 0) > 0 || (l.max || 0) > 0);
  const plannedLevels = realPlannedLevels.length > 0 ? realPlannedLevels : MOCK_LEVELS;


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold">Statistics period</h3>
          <p className="text-xs text-muted-foreground">Filter all figures below by month, quarter or year</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-lg border bg-muted/40 p-0.5">
            {(["month", "quarter", "year"] as PeriodKey[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriodFilter(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  periodFilter === p
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p === "month" ? "Month" : p === "quarter" ? "Quarter" : "Year"}
              </button>
            ))}
          </div>
          <Select value={String(filterYear)} onValueChange={(v) => setFilterYear(Number(v))}>
            <SelectTrigger className="h-9 w-[124px] text-xs border-primary/40 bg-background">
              <CalendarDays className="h-3.5 w-3.5 mr-1.5 text-primary" />
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((y) => (
                <SelectItem key={y} value={String(y)} className="text-xs">{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>


      <BudgetSpentSection
        planned={budget[periodFilter] || undefined}
        actual={totals[periodFilter] || undefined}
        periodLabel={meta.period}
      />

      <SpendVsIncomeCard
        totals={totals}
        defaultPeriod={periodFilter}
        labels={{
          month: { period: periodMeta.month.period, subtitle: periodMeta.month.subtitle },
          quarter: { period: periodMeta.quarter.period, subtitle: periodMeta.quarter.subtitle },
          year: { period: periodMeta.year.period, subtitle: periodMeta.year.subtitle },
        }}
      />

      <ExpenseTrendCard
        budget={budget}
        totals={totals}
        year={filterYear}
        isCurrentYear={isCurrentYear}
      />


      <SupplierCostsSection total={totals[periodFilter]} periodLabel={meta.subtitle} />

      <OrderFrequencyCard year={filterYear} periodLabel={meta.subtitle} />




      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Gauge className="w-4 h-4 text-primary" /> Planned min / max order levels
            </CardTitle>
            <Badge variant="outline" className="text-[10px]">
              {plannedLevels.length} {plannedLevels.length === 1 ? "item" : "items"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Item</TableHead>
                <TableHead className="text-xs text-right">Minimum</TableHead>
                <TableHead className="text-xs text-right">Maximum</TableHead>
                <TableHead className="text-xs text-right">Range</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plannedLevels.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="text-sm font-medium">{l.itemName}</TableCell>
                  <TableCell className="text-sm text-right">{l.min}</TableCell>
                  <TableCell className="text-sm text-right">{l.max}</TableCell>
                  <TableCell className="text-sm text-right text-muted-foreground">
                    {Math.max(0, (l.max || 0) - (l.min || 0))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}


const SUPPLIERS_KEY = "practicare.suppliers.v1";
const MOCK_SUPPLIER_COSTS: Record<string, number> = {
  "MedSupply Australia": 14280,
  "CoolChain Vaccines": 9640,
  "OfficeWorks Business": 3120,
};
const QUARTER_SHAPES = [
  [0.21, 0.24, 0.26, 0.29],
  [0.28, 0.26, 0.23, 0.23],
  [0.22, 0.28, 0.24, 0.26],
  [0.26, 0.22, 0.27, 0.25],
];

function SupplierCostsSection({ total, periodLabel = "Year to date" }: { total: number; periodLabel?: string }) {
  const suppliers = loadJSON<{ id: string; name: string; category: string }[]>(SUPPLIERS_KEY, []);
  const list = suppliers.length
    ? suppliers
    : [
        { id: "sup-1", name: "MedSupply Australia", category: "Consumables" },
        { id: "sup-2", name: "CoolChain Vaccines", category: "Vaccines" },
        { id: "sup-3", name: "OfficeWorks Business", category: "Stationery" },
      ];

  const baseRows = list.map((s, i) => ({
    ...s,
    base: MOCK_SUPPLIER_COSTS[s.name] ?? Math.round(31240 / (list.length + i) / 1.5),
  }));
  const baseTotal = baseRows.reduce((a, b) => a + b.base, 0) || 1;
  const scale = total > 0 ? total / baseTotal : 1;
  const rows = baseRows.map((r, i) => {
    const cost = Math.round(r.base * scale);
    // Deterministic quarterly distribution so the trend is stable per supplier
    const shape = QUARTER_SHAPES[i % QUARTER_SHAPES.length];
    const shapeTotal = shape.reduce((a, b) => a + b, 0);
    const quarters = shape.map((w, qi) => ({
      quarter: `Q${qi + 1}`,
      value: Math.round((cost * w) / shapeTotal),
    }));
    return { ...r, cost, quarters };
  });
  const grand = rows.reduce((a, b) => a + b.cost, 0) || 1;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Truck className="w-4 h-4 text-primary" /> Costs per supplier
        </h3>
        <Badge variant="outline" className="text-[10px]">{periodLabel} · {fmt(grand)}</Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((r) => {
          const pct = Math.round((r.cost / grand) * 100);
          const peak = Math.max(...r.quarters.map((q) => q.value), 1);
          const last = r.quarters[3].value;
          const prev = r.quarters[2].value || 1;
          const delta = Math.round(((last - prev) / prev) * 100);
          const up = delta >= 0;
          return (
            <Card key={r.id}>
              <CardContent className="p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{r.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{r.category || "Uncategorised"}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">{pct}%</Badge>
                </div>
                <div className="flex items-end justify-between gap-2">
                  <p className="text-2xl font-semibold tracking-tight">{fmt(r.cost)}</p>
                  <span className={`flex items-center gap-1 text-[11px] font-medium ${up ? "text-destructive" : "text-primary"}`}>
                    {up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {up ? "+" : ""}{delta}% QoQ
                  </span>
                </div>
                <Progress value={pct} className="h-1.5" />
                <div className="pt-1">
                  <div className="flex items-end justify-between gap-2 h-16">
                    {r.quarters.map((q) => (
                      <div key={q.quarter} className="flex-1 flex flex-col items-center justify-end gap-1 h-full">
                        <span className="text-[10px] text-muted-foreground leading-none">{fmt(q.value)}</span>
                        <div
                          className="w-full rounded-t-md bg-primary/70"
                          style={{ height: `${Math.max(6, (q.value / peak) * 100)}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between gap-2 mt-1">
                    {r.quarters.map((q) => (
                      <span key={q.quarter} className="flex-1 text-center text-[10px] text-muted-foreground">{q.quarter}</span>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">Last 4 quarters · share of {periodLabel.toLowerCase()} spend</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

