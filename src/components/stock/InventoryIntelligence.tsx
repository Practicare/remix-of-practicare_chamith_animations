import { useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  FileText,
  Mail,
  HardDrive,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Package,
  Brain,
  ScanLine,
  CheckCircle2,
  Link2,
  Camera,
  Receipt,
  FileImage,
  Lightbulb,
  BarChart3,
  ArrowUpRight,
  Zap,
  Filter,
  Check,
  ExternalLink,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { toast } from "sonner";
import { useStock } from "@/contexts/StockContext";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function seededOrders(seed: string, monthIndex: number, year: number): number {
  let h = 0;
  const s = `${seed}-${year}-${monthIndex}`;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return 4 + (h % 22);
}

const categoryBreakdown = [
  { name: "Consumables", value: 38, color: "hsl(var(--primary))" },
  { name: "Vaccines", value: 22, color: "#8b5cf6" },
  { name: "Drugs", value: 18, color: "#f59e0b" },
  { name: "Instruments", value: 12, color: "#06b6d4" },
  { name: "Other", value: 10, color: "#94a3b8" },
];

const lowStockItems = [
  { name: "Gauze Swabs (10x10)", current: 4, min: 20, category: "Consumables" },
  { name: "Adrenaline 1:1000", current: 2, min: 8, category: "Drugs" },
  { name: "Fluvax 2026", current: 6, min: 25, category: "Vaccines" },
  { name: "Alcohol Wipes", current: 12, min: 50, category: "Consumables" },
  { name: "Disposable Gloves M", current: 30, min: 100, category: "Consumables" },
];

const extractedDocs = [
  { name: "Symbion_Invoice_Aug26.pdf", type: "Invoice", items: 24, date: "2 hours ago", status: "processed" },
  { name: "IMG_4823.jpg", type: "Receipt Photo", items: 8, date: "Yesterday", status: "processed" },
  { name: "API_Order_Confirmation.pdf", type: "Order", items: 15, date: "2 days ago", status: "processed" },
  { name: "Vaccine_Delivery_Note.pdf", type: "Delivery", items: 12, date: "3 days ago", status: "processing" },
];

const insights = [
  {
    icon: TrendingUp,
    tone: "positive" as const,
    title: "Vaccine orders trending up 34%",
    body: "Order volume for vaccines has increased over the last quarter, aligned with flu season prep. Consider pre-ordering for September.",
  },
  {
    icon: AlertTriangle,
    tone: "warning" as const,
    title: "5 items below reorder threshold",
    body: "Gauze swabs, adrenaline and 3 other items are running low. AI suggests placing a Symbion order this week to avoid stockouts.",
  },
  {
    icon: TrendingDown,
    tone: "info" as const,
    title: "Consumables spend down 12%",
    body: "Switching to bulk-pack gloves in May reduced spend without impacting availability. Consider applying same strategy to alcohol wipes.",
  },
  {
    icon: Zap,
    tone: "positive" as const,
    title: "Duplicate invoice detected",
    body: "AI matched Symbion INV-4821 against last month's records — flagged as potential duplicate for review before payment.",
  },
];

const toneStyles: Record<string, string> = {
  positive: "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-900",
  warning: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900",
  info: "bg-sky-50 border-sky-200 text-sky-900 dark:bg-sky-950/30 dark:border-sky-900",
};

export function InventoryIntelligence() {
  const [dragOver, setDragOver] = useState(false);
  const [scanning, setScanning] = useState(false);
  const { items } = useStock();
  const currentYear = new Date().getFullYear();

  const itemOptions = useMemo(
    () => items.map((i) => ({ id: i.id, name: i.name })),
    [items],
  );

  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(() =>
    items.slice(0, Math.min(3, items.length)).map((i) => i.id),
  );
  const [fromYear, setFromYear] = useState<number>(currentYear - 1);
  const [toYear, setToYear] = useState<number>(currentYear);
  const [itemFilterOpen, setItemFilterOpen] = useState(false);

  const yearOptions = useMemo(() => {
    const arr: number[] = [];
    for (let y = currentYear - 5; y <= currentYear; y++) arr.push(y);
    return arr;
  }, [currentYear]);

  const selectedItems = useMemo(
    () => itemOptions.filter((i) => selectedItemIds.includes(i.id)),
    [itemOptions, selectedItemIds],
  );

  const orderTrends = useMemo(() => {
    const rows: Array<Record<string, string | number>> = [];
    const startY = Math.min(fromYear, toYear);
    const endY = Math.max(fromYear, toYear);
    for (let y = startY; y <= endY; y++) {
      for (let m = 0; m < 12; m++) {
        const row: Record<string, string | number> = {
          month: `${MONTHS[m]} ${String(y).slice(2)}`,
        };
        let total = 0;
        selectedItems.forEach((it) => {
          const v = seededOrders(it.id, m, y);
          total += v;
        });
        row.orders = total;
        row.spend = total * 85;
        rows.push(row);
      }
    }
    return rows;
  }, [selectedItems, fromYear, toYear]);

  const toggleItemFilter = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      toast.success("AI extracted 18 items from uploaded document");
    }, 1800);
  }, []);

  const handleConnect = (source: string) => {
    toast.info(`${source} connection – coming soon`);
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-purple-500/5">
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold">Inventory Intelligence</h3>
              <Badge className="bg-primary/15 text-primary border-0 text-[10px]">AI-POWERED</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Upload invoices, receipts or photos — or connect Google Drive / email — and AI extracts,
              categorises and surfaces trends automatically.
            </p>
          </div>
          <Button size="sm" className="gap-1.5 shrink-0">
            <Sparkles className="w-3.5 h-3.5" /> Run AI Scan
          </Button>
        </CardContent>
      </Card>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Docs processed", value: "247", icon: FileText, trend: "+18 this week" },
          { label: "Items extracted", value: "3,842", icon: ScanLine, trend: "+126 this week" },
          { label: "Low stock alerts", value: "5", icon: AlertTriangle, trend: "Action needed", warn: true },
          { label: "AI accuracy", value: "97.4%", icon: CheckCircle2, trend: "+2.1% vs last mo" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <kpi.icon className={`w-4 h-4 ${kpi.warn ? "text-amber-500" : "text-primary"}`} />
                <span className="text-[10px] text-muted-foreground">{kpi.trend}</span>
              </div>
              <p className="text-2xl font-semibold">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload + Connect */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card
          className={`lg:col-span-2 border-2 border-dashed transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-border"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <CardContent className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              {scanning ? (
                <ScanLine className="w-7 h-7 text-primary animate-pulse" />
              ) : (
                <Upload className="w-7 h-7 text-primary" />
              )}
            </div>
            <div>
              <p className="font-medium text-sm">
                {scanning ? "AI is reading your document..." : "Drop invoices, receipts or photos here"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, JPG, PNG, HEIC · Up to 20MB · Multiple files supported
              </p>
            </div>
            {scanning ? (
              <Progress value={65} className="max-w-xs mx-auto h-1.5" />
            ) : (
              <div className="flex items-center justify-center gap-2 pt-1">
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toast.info("File picker – coming soon")}>
                  <FileText className="w-3.5 h-3.5" /> Browse files
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toast.info("Camera capture – coming soon")}>
                  <Camera className="w-3.5 h-3.5" /> Take photo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-3">
          {[
            { icon: HardDrive, label: "Google Drive", desc: "Auto-sync a folder", color: "text-blue-500" },
            { icon: Mail, label: "Email inbox", desc: "Forward invoices", color: "text-purple-500" },
            { icon: Link2, label: "Supplier portal", desc: "Symbion, API, others", color: "text-teal-500" },
          ].map((src) => (
            <Card
              key={src.label}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => handleConnect(src.label)}
            >
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <src.icon className={`w-4 h-4 ${src.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{src.label}</p>
                  <p className="text-xs text-muted-foreground">{src.desc}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recently extracted */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary" /> Recently extracted documents
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {extractedDocs.map((doc) => (
              <div key={doc.name} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  {doc.type === "Receipt Photo" ? (
                    <FileImage className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.type} · {doc.items} items · {doc.date}
                  </p>
                </div>
                {doc.status === "processed" ? (
                  <Badge variant="outline" className="text-[10px] gap-1 border-emerald-200 text-emerald-700">
                    <CheckCircle2 className="w-3 h-3" /> Processed
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] gap-1 border-amber-200 text-amber-700">
                    <ScanLine className="w-3 h-3 animate-pulse" /> Processing
                  </Badge>
                )}
                <Button size="sm" variant="ghost" className="h-7 text-xs">
                  Review
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" /> Order trends
              </CardTitle>
              <Button asChild variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                <Link to="/inventory/trends">
                  Detailed breakdown <ExternalLink className="w-3 h-3" />
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Popover open={itemFilterOpen} onOpenChange={setItemFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
                    <Filter className="w-3 h-3" />
                    Items
                    <Badge variant="secondary" className="ml-0.5 h-4 px-1 text-[9px]">
                      {selectedItemIds.length}
                    </Badge>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search items..." />
                    <CommandList>
                      <CommandEmpty>No items found.</CommandEmpty>
                      <CommandGroup>
                        {itemOptions.map((it) => {
                          const checked = selectedItemIds.includes(it.id);
                          return (
                            <CommandItem
                              key={it.id}
                              value={it.name}
                              onSelect={() => toggleItemFilter(it.id)}
                              className="flex items-center gap-2"
                            >
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center ${
                                  checked ? "bg-primary border-primary" : "border-border"
                                }`}
                              >
                                {checked && <Check className="w-3 h-3 text-primary-foreground" />}
                              </div>
                              <span className="text-sm truncate">{it.name}</span>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                  <div className="flex items-center justify-between border-t p-2">
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelectedItemIds([])}>
                      Clear
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setSelectedItemIds(itemOptions.map((i) => i.id))}
                    >
                      Select all
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <div className="flex items-center gap-1">
                <span className="text-[11px] text-muted-foreground">From</span>
                <Select value={String(fromYear)} onValueChange={(v) => setFromYear(Number(v))}>
                  <SelectTrigger className="h-7 w-[80px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-[11px] text-muted-foreground">To</span>
                <Select value={String(toYear)} onValueChange={(v) => setToYear(Number(v))}>
                  <SelectTrigger className="h-7 w-[80px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            {selectedItems.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-xs text-muted-foreground">
                Select at least one item to see the trend
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={orderTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="spend" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" /> Category mix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                >
                  {categoryBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Low stock */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Low stock levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={lowStockItems} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={140} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="min" fill="hsl(var(--muted))" name="Minimum" radius={[0, 4, 4, 0]} />
              <Bar dataKey="current" fill="#f59e0b" name="Current" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">AI Insights</h3>
          <Badge variant="outline" className="text-[10px]">{insights.length}</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map((ins) => (
            <Card key={ins.title} className={`border ${toneStyles[ins.tone]}`}>
              <CardContent className="p-4 flex gap-3">
                <ins.icon className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold mb-1">{ins.title}</p>
                  <p className="text-xs opacity-80 leading-relaxed">{ins.body}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
