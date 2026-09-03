import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import {
  ArrowLeft,
  TrendingUp,
  Filter,
  Check,
  Package,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { useStock } from "@/contexts/StockContext";
import { mockStockCategories } from "@/data/mockStock";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "#8b5cf6",
  "#f59e0b",
  "#06b6d4",
  "#ec4899",
  "#10b981",
  "#f43f5e",
  "#3b82f6",
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Deterministic pseudo-random for stable mock trend data per item
function seededOrders(seed: string, monthIndex: number, year: number): number {
  let h = 0;
  const s = `${seed}-${year}-${monthIndex}`;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return 4 + (h % 22);
}

export default function InventoryTrends() {
  const { items } = useStock();
  const currentYear = new Date().getFullYear();

  const allItems = useMemo(
    () =>
      items.map((i) => ({
        id: i.id,
        name: i.name,
        categoryName:
          mockStockCategories.find((c) => c.id === i.categoryId)?.name || i.categoryId,
      })),
    [items],
  );

  const [selectedIds, setSelectedIds] = useState<string[]>(
    () => allItems.slice(0, Math.min(5, allItems.length)).map((i) => i.id),
  );
  const [fromYear, setFromYear] = useState<number>(currentYear - 1);
  const [toYear, setToYear] = useState<number>(currentYear);
  const [filterOpen, setFilterOpen] = useState(false);

  const yearOptions = useMemo(() => {
    const arr: number[] = [];
    for (let y = currentYear - 5; y <= currentYear; y++) arr.push(y);
    return arr;
  }, [currentYear]);

  const selectedItems = useMemo(
    () => allItems.filter((i) => selectedIds.includes(i.id)),
    [allItems, selectedIds],
  );

  // Build monthly chart data across year range
  const chartData = useMemo(() => {
    const rows: Array<Record<string, string | number>> = [];
    const startY = Math.min(fromYear, toYear);
    const endY = Math.max(fromYear, toYear);
    for (let y = startY; y <= endY; y++) {
      for (let m = 0; m < 12; m++) {
        const row: Record<string, string | number> = {
          label: `${MONTHS[m]} ${String(y).slice(2)}`,
        };
        selectedItems.forEach((it) => {
          row[it.name] = seededOrders(it.id, m, y);
        });
        rows.push(row);
      }
    }
    return rows;
  }, [selectedItems, fromYear, toYear]);

  const totalsByItem = useMemo(() => {
    return selectedItems.map((it) => ({
      name: it.name,
      total: chartData.reduce((sum, row) => sum + (Number(row[it.name]) || 0), 0),
    }));
  }, [selectedItems, chartData]);

  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <AdminLayout>
      <MobileHeader title="Inventory Trends" subtitle="Detailed breakdown across items" />
      <PageHeader
        title="Inventory Trends"
        subtitle="Detailed order trend breakdown across your inventory items"
        icon={TrendingUp}
      />
      <div className="px-8 pt-6 pb-10 w-full space-y-6">
        <div>
          <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2">
            <Link to="/inventory?tab=intelligence">
              <ArrowLeft className="w-4 h-4" /> Back to Inventory
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-3 flex-wrap">
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Filter className="w-3.5 h-3.5" />
                  Items
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                    {selectedIds.length}
                  </Badge>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search items..." />
                  <CommandList>
                    <CommandEmpty>No items found.</CommandEmpty>
                    <CommandGroup>
                      {allItems.map((it) => {
                        const checked = selectedIds.includes(it.id);
                        return (
                          <CommandItem
                            key={it.id}
                            value={it.name}
                            onSelect={() => toggleItem(it.id)}
                            className="flex items-center gap-2"
                          >
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center ${
                                checked ? "bg-primary border-primary" : "border-border"
                              }`}
                            >
                              {checked && <Check className="w-3 h-3 text-primary-foreground" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate">{it.name}</p>
                              <p className="text-[10px] text-muted-foreground truncate">
                                {it.categoryName}
                              </p>
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
                <div className="flex items-center justify-between border-t p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setSelectedIds([])}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setSelectedIds(allItems.map((i) => i.id))}
                  >
                    Select all
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">From</span>
              <Select value={String(fromYear)} onValueChange={(v) => setFromYear(Number(v))}>
                <SelectTrigger className="h-8 w-[100px] text-xs">
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
              <span className="text-xs text-muted-foreground">To</span>
              <Select value={String(toYear)} onValueChange={(v) => setToYear(Number(v))}>
                <SelectTrigger className="h-8 w-[100px] text-xs">
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

            <div className="md:ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Showing {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""} across{" "}
              {Math.abs(toYear - fromYear) + 1} year
              {Math.abs(toYear - fromYear) + 1 !== 1 ? "s" : ""}
            </div>
          </CardContent>
        </Card>

        {/* Multi-item trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> Order trend by item
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {selectedItems.length === 0 ? (
              <div className="h-[320px] flex items-center justify-center text-sm text-muted-foreground">
                Select at least one item to see the trend
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={340}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {selectedItems.map((it, idx) => (
                    <Line
                      key={it.id}
                      type="monotone"
                      dataKey={it.name}
                      stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Totals bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" /> Total orders in range
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totalsByItem.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
                No items selected
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(220, totalsByItem.length * 34)}>
                <BarChart data={totalsByItem} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={160} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
