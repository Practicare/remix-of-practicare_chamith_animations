import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { PageIntro } from "@/components/layout/PageIntro";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/SearchInput";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarX,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  ExpiryRecord,
  ExpirySource,
  daysUntil,
  getAllExpiryRecords,
  urgencyBucket,
  URGENCY_LABELS,
  UrgencyBucket,
} from "@/utils/expiryAggregator";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockStockCategories } from "@/data/mockStock";
import { mockComplianceCategories } from "@/data/mockCompliance";
import { useRooms } from "@/contexts/RoomsContext";

type GroupBy = "category" | "urgency" | "source" | "owner";

const SOURCE_OPTIONS: { value: ExpirySource | "all"; label: string }[] = [
  { value: "all", label: "All sources" },
  { value: "stock", label: "Stock" },
  { value: "calibration", label: "Calibration" },
  { value: "electrical", label: "Test & Tagging" },
  { value: "compliance", label: "Compliance" },
];

function urgencyChip(date: Date) {
  const d = daysUntil(date);
  if (d < 0)
    return (
      <Badge variant="destructive" className="text-[10px]">
        {Math.abs(d)}d overdue
      </Badge>
    );
  if (d <= 7)
    return (
      <Badge className="text-[10px] bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/20">
        in {d}d
      </Badge>
    );
  if (d <= 30)
    return (
      <Badge className="text-[10px] bg-warning/15 text-warning border-warning/30 hover:bg-warning/20">
        in {d}d
      </Badge>
    );
  return (
    <Badge variant="secondary" className="text-[10px]">
      in {d}d
    </Badge>
  );
}

function sourceBadge(source: ExpirySource, label: string) {
  const colorMap: Record<ExpirySource, string> = {
    stock: "bg-primary/10 text-primary border-primary/20",
    calibration: "bg-accent/10 text-accent-foreground border-accent/30",
    electrical: "bg-warning/10 text-warning border-warning/30",
    compliance: "bg-secondary text-secondary-foreground border-border",
  };
  return (
    <Badge variant="outline" className={cn("text-[10px]", colorMap[source])}>
      {label}
    </Badge>
  );
}

export default function ExpiryCentre() {
  const navigate = useNavigate();
  const { rooms } = useRooms();
  const [groupBy, setGroupBy] = useState<GroupBy>("category");
  const [sourceFilter, setSourceFilter] = useState<ExpirySource | "all">("all");
  const [scope, setScope] = useState<"all" | "expired" | "soon">("all");
  const [search, setSearch] = useState("");
  const [stockCategoryFilter, setStockCategoryFilter] = useState<string>("all");
  const [roomFilter, setRoomFilter] = useState<string>("all");
  const [complianceCategoryFilter, setComplianceCategoryFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const records = useMemo(() => {
    let r = getAllExpiryRecords();
    if (sourceFilter !== "all") r = r.filter((x) => x.source === sourceFilter);
    if (scope === "expired") r = r.filter((x) => daysUntil(x.expiryDate) < 0);
    if (scope === "soon")
      r = r.filter((x) => {
        const d = daysUntil(x.expiryDate);
        return d >= 0 && d <= 30;
      });
    if (stockCategoryFilter !== "all") {
      r = r.filter(
        (x) =>
          x.source === "compliance" || x.categoryId === stockCategoryFilter,
      );
    }
    if (roomFilter !== "all") {
      r = r.filter(
        (x) =>
          x.source === "compliance" ||
          (x.roomName || "").trim().toLowerCase() === roomFilter.trim().toLowerCase(),
      );
    }
    if (complianceCategoryFilter !== "all") {
      r = r.filter(
        (x) => x.source !== "compliance" || x.categoryId === complianceCategoryFilter,
      );
    }
    if (fromDate) {
      const from = new Date(fromDate);
      r = r.filter((x) => x.expiryDate.getTime() >= from.getTime());
    }
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      r = r.filter((x) => x.expiryDate.getTime() <= to.getTime());
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (x) =>
          x.itemName.toLowerCase().includes(q) ||
          x.category.toLowerCase().includes(q) ||
          x.ownerName?.toLowerCase().includes(q),
      );
    }
    return r.sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime());
  }, [sourceFilter, scope, search, stockCategoryFilter, roomFilter, complianceCategoryFilter, fromDate, toDate]);

  const summary = useMemo(() => {
    const all = getAllExpiryRecords();
    let expired = 0,
      lt7 = 0,
      lt30 = 0;
    for (const r of all) {
      const d = daysUntil(r.expiryDate);
      if (d < 0) expired++;
      else if (d <= 7) lt7++;
      else if (d <= 30) lt30++;
    }
    return { expired, lt7, lt30 };
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, ExpiryRecord[]>();
    for (const r of records) {
      let key = "Unspecified";
      if (groupBy === "category") key = r.category;
      else if (groupBy === "source") key = r.sourceLabel;
      else if (groupBy === "owner") key = r.ownerName ?? "Unassigned";
      else if (groupBy === "urgency")
        key = URGENCY_LABELS[urgencyBucket(r.expiryDate) as UrgencyBucket];
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries());
  }, [records, groupBy]);

  const exportCsv = () => {
    const rows = [
      ["Item", "Source", "Category", "Expiry Date", "Days", "Owner"],
      ...records.map((r) => [
        r.itemName,
        r.sourceLabel,
        r.category,
        format(r.expiryDate, "yyyy-MM-dd"),
        String(daysUntil(r.expiryDate)),
        r.ownerName ?? "",
      ]),
    ];
    const csv = rows
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expiry-centre-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <MobileHeader title="Expiry Centre" subtitle="Everything expiring across the practice" />

      <header className="hidden md:flex min-h-[64px] bg-card border-b px-10 items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <CalendarX className="w-5 h-5 text-destructive" />
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Expiry Centre</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Everything expiring across stock, calibration, electrical and compliance
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={exportCsv}>
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </header>

      <div className="p-4 md:px-8 md:py-6 max-w-4xl mx-auto space-y-5">
        <PageIntro
          highlight="Never miss another expiry."
          description="One consolidated view of everything expiring across stock, calibrations, electrical tests and compliance. Filter by source, urgency or category, then act on what matters most today."
        />

        {/* Summary chips */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-destructive">{summary.expired}</p>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
                Expired
              </p>
            </CardContent>
          </Card>
          <Card className="border-destructive/20 bg-destructive/[0.03]">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-destructive">{summary.lt7}</p>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
                Within 7 days
              </p>
            </CardContent>
          </Card>
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-warning">{summary.lt30}</p>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
                Within 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-border/60">
          <CardContent className="p-3 md:p-4 space-y-3">
            {/* Row 1: Tabs + Search + Group by */}
            <div className="flex flex-col md:flex-row gap-2 md:items-center">
              <Tabs value={scope} onValueChange={(v) => setScope(v as typeof scope)}>
                <TabsList className="rounded-lg">
                  <TabsTrigger value="all" className="rounded-lg text-xs">All</TabsTrigger>
                  <TabsTrigger value="soon" className="rounded-lg text-xs">Expiring</TabsTrigger>
                  <TabsTrigger value="expired" className="rounded-lg text-xs">Expired</TabsTrigger>
                </TabsList>
              </Tabs>

              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search items, categories, owners…"
                className="md:flex-1"
              />

              <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
                <SelectTrigger className="w-full md:w-[170px] rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="category">Group by Category</SelectItem>
                  <SelectItem value="urgency">Group by Urgency</SelectItem>
                  <SelectItem value="source">Group by Source</SelectItem>
                  <SelectItem value="owner">Group by Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Row 2: Source + Stock + Room + Compliance */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as typeof sourceFilter)}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {SOURCE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={stockCategoryFilter} onValueChange={setStockCategoryFilter}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Stock category" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="all">All stock categories</SelectItem>
                  {mockStockCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.displayName || c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={roomFilter} onValueChange={setRoomFilter}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Room" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="all">All rooms</SelectItem>
                  {rooms.map((r) => (
                    <SelectItem key={r.id} value={r.roomName}>
                      {r.roomName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={complianceCategoryFilter} onValueChange={setComplianceCategoryFilter}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Compliance" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="all">All compliance</SelectItem>
                  {mockComplianceCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.displayName || c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Row 3: Date range + clear all */}
            <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between border-t border-border/60 pt-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  Date range
                </Label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="rounded-lg h-9 w-full md:w-[160px]"
                  aria-label="From date"
                />
                <span className="text-xs text-muted-foreground">to</span>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="rounded-lg h-9 w-full md:w-[160px]"
                  aria-label="To date"
                />
              </div>

              {(stockCategoryFilter !== "all" ||
                roomFilter !== "all" ||
                complianceCategoryFilter !== "all" ||
                sourceFilter !== "all" ||
                fromDate ||
                toDate ||
                search) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    setStockCategoryFilter("all");
                    setRoomFilter("all");
                    setComplianceCategoryFilter("all");
                    setSourceFilter("all");
                    setFromDate("");
                    setToDate("");
                    setSearch("");
                  }}
                >
                  Clear all filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Groups */}
        {groups.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center text-sm text-muted-foreground">
              Nothing expiring matches your filters. 🎉
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {groups.map(([groupKey, items]) => {
              const isCollapsed = collapsed[groupKey];
              const expiredCount = items.filter((i) => daysUntil(i.expiryDate) < 0).length;
              return (
                <Card key={groupKey} className="border-border/60">
                  <button
                    className="w-full flex items-center gap-2 px-4 py-3 hover:bg-muted/40 rounded-t-lg"
                    onClick={() =>
                      setCollapsed((p) => ({ ...p, [groupKey]: !p[groupKey] }))
                    }
                  >
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                    <h3 className="text-sm font-semibold capitalize flex-1 text-left">
                      {groupKey.replace(/-/g, " ")}
                    </h3>
                    <Badge variant="secondary" className="text-[10px]">
                      {items.length}
                    </Badge>
                  </button>


                  {!isCollapsed && (
                    <CardContent className="p-0">
                      <div className="divide-y divide-border/60">
                        {items.map((r) => (
                          <div
                            key={r.id}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-medium truncate">{r.itemName}</p>
                                {sourceBadge(r.source, r.sourceLabel)}
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5 capitalize">
                                {r.category.replace(/-/g, " ")}
                                {r.ownerName ? ` · ${r.ownerName}` : ""}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-[11px] text-muted-foreground">
                                {format(r.expiryDate, "d MMM yyyy")}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                title="Open source"
                                onClick={() => navigate(r.route)}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
