import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageIntro } from "@/components/layout/PageIntro";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InventoryIntelligencePanel } from "@/components/stock/InventoryIntelligencePanel";
import { useStock } from "@/contexts/StockContext";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ClipboardCheck, Plus, Trash2, Sparkles, Wallet, Gauge, Percent,
  CalendarDays, Package2, TrendingDown, TrendingUp, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STORAGE_BUDGET = "practicare.inventoryPlanBudget.v1";
const STORAGE_LEVELS = "practicare.inventoryPlanLevels.v1";
const STORAGE_RATIO = "practicare.inventoryPlanRatio.v1";

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

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function InventoryPlanner() {
  const { items } = useStock();
  const [budget, setBudget] = useState(() =>
    loadJSON(STORAGE_BUDGET, { month: 0, quarter: 0, year: 0 }),
  );
  const [levels, setLevels] = useState<StockLevelRow[]>(() => loadJSON(STORAGE_LEVELS, []));
  const [ratio, setRatio] = useState<number | "">(() => loadJSON<number | "">(STORAGE_RATIO, ""));

  const persist = <T,>(key: string, val: T) => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  };

  const updateBudget = (patch: Partial<typeof budget>) => {
    const next = { ...budget, ...patch };
    setBudget(next); persist(STORAGE_BUDGET, next);
  };

  const saved = () => toast.success("Saved");

  // ── Stock level planner ───────────────────────────────────
  const stockOptions = useMemo(() => {
    const names = new Set<string>();
    items.forEach((i) => i.name && names.add(i.name));
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const [lName, setLName] = useState("");
  const [lMin, setLMin] = useState<number | "">("");
  const [lMax, setLMax] = useState<number | "">("");

  const addLevel = () => {
    if (!lName.trim() || lMin === "" || lMax === "") return;
    const next: StockLevelRow[] = [
      { id: crypto.randomUUID(), itemName: lName.trim(), min: Number(lMin), max: Number(lMax) },
      ...levels,
    ];
    setLevels(next); persist(STORAGE_LEVELS, next);
    setLName(""); setLMin(""); setLMax("");
  };

  const updateLevel = (id: string, patch: Partial<StockLevelRow>) => {
    const next = levels.map((l) => (l.id === id ? { ...l, ...patch } : l));
    setLevels(next); persist(STORAGE_LEVELS, next);
  };

  const removeLevel = (id: string) => {
    const next = levels.filter((l) => l.id !== id);
    setLevels(next); persist(STORAGE_LEVELS, next);
  };

  const updateRatio = (val: number | "") => {
    setRatio(val); persist(STORAGE_RATIO, val);
  };

  const totalPlannedBudget = budget.month * 12;

  return (
    <AdminLayout>
      <PageHeader
        title="Inventory Planner"
        subtitle="Plan your stock levels and spending"
        icon={ClipboardCheck}
      />
      <AnimatedPage className="max-w-4xl mx-auto px-8 py-6 space-y-6">
        <PageIntro
          highlight="Plan smarter, spend better, stock right."
          description="Set min/max stock levels and budget usage across the year — turn ordering from guesswork into a clear plan."
        />
        <Tabs defaultValue="budget" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-muted/60">
            <TabsTrigger value="budget" className="gap-1.5 rounded-md data-[state=active]:shadow-sm">
              <Wallet className="w-3.5 h-3.5" /> Order & Expense Plan
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="gap-1.5 rounded-md data-[state=active]:shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> Intelligence
            </TabsTrigger>
          </TabsList>
          <TabsContent value="intelligence" className="space-y-4">
            <InventoryIntelligencePanel />
          </TabsContent>

          <TabsContent value="budget" className="space-y-5">
            {/* 1. Budget planner */}
            <Card className="overflow-hidden border-border/60 shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">Budget planner</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        Set the maximum inventory spend allowed for each period and the target inventory expense-to-income ratio.
                      </CardDescription>
                    </div>
                  </div>
                  <Button size="sm" className="rounded-lg h-8 shrink-0" onClick={saved}>Save</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {([
                    { key: "month", label: "Per month", icon: CalendarDays },
                    { key: "quarter", label: "Per quarter", icon: CalendarDays },
                    { key: "year", label: "Per year", icon: CalendarDays },
                  ] as const).map(({ key, label, icon: Icon }) => (
                    <div key={key} className="rounded-lg border border-border/70 bg-muted/30 p-3">
                      <Label className="text-xs capitalize text-muted-foreground flex items-center gap-1.5 mb-2">
                        <Icon className="w-3.5 h-3.5" /> {label}
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">$</span>
                        <Input
                          type="number" min={0}
                          value={budget[key] || ""}
                          onChange={(e) => updateBudget({ [key]: Number(e.target.value) } as any)}
                          className="pl-8 rounded-lg bg-background border-input"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg border border-primary/15 bg-primary/[0.04] p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Percent className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Inventory expense as % of total income</p>
                        <p className="text-xs text-muted-foreground">Target ratio for inventory spend vs. gross billing.</p>
                      </div>
                    </div>
                    <div className="relative">
                      <Input
                        type="number" min={0} max={100} step="0.1"
                        value={ratio}
                        onChange={(e) => updateRatio(e.target.value === "" ? "" : Number(e.target.value))}
                        className="pr-10 rounded-lg bg-background border-input"
                        placeholder="0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">%</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <SummaryPill
                    label="Monthly budget"
                    value={formatCurrency(budget.month || 0)}
                    trend={budget.month > 0 ? "set" : "empty"}
                  />
                  <SummaryPill
                    label="Quarterly budget"
                    value={formatCurrency(budget.quarter || 0)}
                    trend={budget.quarter > 0 ? "set" : "empty"}
                  />
                  <SummaryPill
                    label="Annual projection"
                    value={formatCurrency(totalPlannedBudget)}
                    trend={totalPlannedBudget > 0 ? "up" : "empty"}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 2. Stock level planner */}
            <Card className="overflow-hidden border-border/60 shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                      <Gauge className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">Stock level planner</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        Select a stock item and set the minimum and maximum units to keep on hand.
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-lg">
                    <Package2 className="w-3.5 h-3.5" />
                    {levels.length} item{levels.length === 1 ? "" : "s"}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_110px_110px_auto] gap-2 items-end">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Stock item</Label>
                      <Select value={lName} onValueChange={setLName}>
                        <SelectTrigger className="rounded-lg bg-background border-input">
                          <SelectValue placeholder="Select stock item" />
                        </SelectTrigger>
                        <SelectContent className="max-h-72 rounded-lg">
                          {stockOptions.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-muted-foreground">No stock items yet</div>
                          ) : (
                            stockOptions.map((n) => (
                              <SelectItem key={n} value={n} className="rounded-md">{n}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Min</Label>
                      <Input
                        type="number" min={0} placeholder="0"
                        value={lMin}
                        onChange={(e) => setLMin(e.target.value === "" ? "" : Number(e.target.value))}
                        className="rounded-lg bg-background border-input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Max</Label>
                      <Input
                        type="number" min={0} placeholder="0"
                        value={lMax}
                        onChange={(e) => setLMax(e.target.value === "" ? "" : Number(e.target.value))}
                        className="rounded-lg bg-background border-input"
                      />
                    </div>
                    <Button onClick={addLevel} className="rounded-lg gap-1.5 h-10">
                      <Plus className="w-4 h-4" /> Add
                    </Button>
                  </div>
                </div>

                {levels.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 py-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                      <Package2 className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">No stock levels set yet</p>
                    <p className="text-xs text-muted-foreground max-w-xs mt-1">
                      Select a stock item above and add minimum and maximum levels to start planning.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-border/70 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                          <TableHead className="text-xs font-semibold">Item</TableHead>
                          <TableHead className="w-28 text-xs font-semibold">Min</TableHead>
                          <TableHead className="w-28 text-xs font-semibold">Max</TableHead>
                          <TableHead className="w-14" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {levels.map((l, idx) => (
                          <TableRow key={l.id} className="group">
                            <TableCell className="font-medium text-sm">
                              <div className="flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-[10px] font-bold text-muted-foreground">
                                  {idx + 1}
                                </span>
                                {l.itemName}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number" min={0}
                                value={l.min}
                                onChange={(e) => updateLevel(l.id, { min: Number(e.target.value) })}
                                className="h-8 rounded-md bg-background border-input"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number" min={0}
                                value={l.max}
                                onChange={(e) => updateLevel(l.id, { max: Number(e.target.value) })}
                                className="h-8 rounded-md bg-background border-input"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost" size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => removeLevel(l.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </AnimatedPage>
    </AdminLayout>
  );
}

function SummaryPill({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: "up" | "down" | "set" | "empty";
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3">
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          trend === "empty" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
        )}
      >
        {trend === "up" ? <TrendingUp className="w-4 h-4" /> :
         trend === "down" ? <TrendingDown className="w-4 h-4" /> :
         trend === "set" ? <ArrowRight className="w-4 h-4" /> :
         <Wallet className="w-4 h-4" />}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">{label}</p>
        <p className="text-sm font-semibold text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}
