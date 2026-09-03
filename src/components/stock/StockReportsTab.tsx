import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Download,
  FileBarChart2,
  FileText,
  Play,
  Sparkles,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStock } from "@/contexts/StockContext";
import { mockStockCategories } from "@/data/mockStock";
import {
  readStockIntakes,
  deleteStockIntake,
  StockIntake,
} from "@/data/stockIntakeStore";
import {
  readStockCheckouts,
  deleteStockCheckout,
  StockCheckout,
} from "@/data/stockCheckoutStore";
import { exportStockIntakeCSV, exportStockIntakePDF } from "@/utils/stockIntakeExport";
import { exportStockCheckoutCSV, exportStockCheckoutPDF } from "@/utils/stockCheckoutExport";
import { downloadCSV, openPrintPDF, wrapPDFPage, exportSubtitleDate } from "@/utils/exportUtils";
import { AIChatDialog } from "@/components/ai/AIChatDialog";
import { toast } from "sonner";

const fmtDateTime = (iso: string) => format(new Date(iso), "MMM d, yyyy · h:mm a");

type ReportType = "consolidated" | "intake" | "checkout" | "custom";

const REPORT_OPTIONS: { value: ReportType; label: string; description: string; icon: LucideIcon }[] = [
  { value: "consolidated", label: "Total stock count", description: "Totals and value by category", icon: BarChart3 },
  { value: "intake", label: "Stock intake", description: "When, what and who received stock", icon: ArrowDownToLine },
  { value: "checkout", label: "Stock checkout", description: "When, what and who checked out stock", icon: ArrowUpFromLine },
  { value: "custom", label: "Custom (AI)", description: "Ask the AI assistant anything", icon: Sparkles },
];

export function StockReportsTab() {
  const { items } = useStock();
  const [intakes, setIntakes] = useState<StockIntake[]>(() => readStockIntakes());
  const [checkouts, setCheckouts] = useState<StockCheckout[]>(() => readStockCheckouts());
  const [selectedType, setSelectedType] = useState<ReportType | "">("");
  const [generatedType, setGeneratedType] = useState<ReportType | null>(null);
  const [customChatOpen, setCustomChatOpen] = useState(false);
  const [intakeYear, setIntakeYear] = useState<string>("all");
  const [checkoutYear, setCheckoutYear] = useState<string>("all");

  // Deep link: /inventory?tab=reports&report=intake auto-generates that report.
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const r = searchParams.get("report");
    if (r === "consolidated" || r === "intake" || r === "checkout" || r === "custom") {
      setSelectedType(r);
      if (r === "custom") {
        setCustomChatOpen(true);
      } else {
        setGeneratedType(r);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- Consolidated stock report data ---------------- */
  const consolidated = useMemo(() => {
    const totalItems = items.length;
    const totalUnits = items.reduce((s, i) => s + (i.quantity || 0), 0);
    const totalValue = items.reduce(
      (s, i) => s + (i.batches ?? []).reduce((bs, b) => bs + (b.quantity || 0) * (b.unitPrice ?? 0), 0),
      0,
    );
    const expiring = items.filter((i) => i.status === "expiring").length;
    const expired = items.filter((i) => i.status === "expired").length;

    const byCategory = new Map<string, { name: string; items: number; units: number; value: number }>();
    items.forEach((i) => {
      const name = mockStockCategories.find((c) => c.id === i.categoryId)?.name || "Other";
      const entry = byCategory.get(name) ?? { name, items: 0, units: 0, value: 0 };
      entry.items += 1;
      entry.units += i.quantity || 0;
      entry.value += (i.batches ?? []).reduce((bs, b) => bs + (b.quantity || 0) * (b.unitPrice ?? 0), 0);
      byCategory.set(name, entry);
    });
    const rows = Array.from(byCategory.values()).sort((a, b) => b.units - a.units);
    return { totalItems, totalUnits, totalValue, expiring, expired, rows };
  }, [items]);

  /* ---------------- Year filtering ---------------- */
  const getYears = (records: { completedAt: string }[]) => {
    const years = new Set<number>();
    records.forEach((r) => {
      const y = new Date(r.completedAt).getFullYear();
      if (!Number.isNaN(y)) years.add(y);
    });
    return Array.from(years).sort((a, b) => b - a);
  };

  const filterByYear = <T extends { completedAt: string }>(records: T[], year: string): T[] => {
    if (year === "all") return records;
    return records.filter((r) => String(new Date(r.completedAt).getFullYear()) === year);
  };

  const intakeYears = useMemo(() => getYears(intakes), [intakes]);
  const checkoutYears = useMemo(() => getYears(checkouts), [checkouts]);
  const filteredIntakes = useMemo(() => filterByYear(intakes, intakeYear), [intakes, intakeYear]);
  const filteredCheckouts = useMemo(() => filterByYear(checkouts, checkoutYear), [checkouts, checkoutYear]);

  /* ---------------- Exports ---------------- */
  const exportConsolidatedCSV = () => {
    downloadCSV(
      ["Category", "Items", "Units on hand", "Stock value"],
      consolidated.rows.map((r) => [r.name, String(r.items), String(r.units), `$${r.value.toFixed(2)}`]),
      `total-stock-count-report-${format(new Date(), "yyyyMMdd")}`,
    );
    toast.success("Report exported as CSV");
  };

  const exportConsolidatedPDF = () => {
    const rows = consolidated.rows
      .map(
        (r) => `<tr>
          <td>${r.name}</td>
          <td>${r.items}</td>
          <td>${r.units}</td>
          <td>$${r.value.toFixed(2)}</td>
        </tr>`,
      )
      .join("");
    openPrintPDF(
      wrapPDFPage({
        title: "Total Stock Count Report",
        subtitle: `Generated ${exportSubtitleDate()}`,
        bodyHtml: `
          <div class="stats">
            <div class="stat"><strong>${consolidated.totalItems}</strong>Items</div>
            <div class="stat"><strong>${consolidated.totalUnits}</strong>Units on hand</div>
            <div class="stat"><strong>$${consolidated.totalValue.toFixed(2)}</strong>Stock value</div>
            <div class="stat"><strong>${consolidated.expiring}</strong>Expiring soon</div>
            <div class="stat"><strong>${consolidated.expired}</strong>Expired</div>
          </div>
          <table>
            <thead><tr><th>Category</th><th>Items</th><th>Units on hand</th><th>Stock value</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>`,
      }),
    );
    toast.success("Report exported as PDF");
  };

  const flowRows = (records: (StockIntake | StockCheckout)[]) =>
    records.map((rec) => ({
      when: fmtDateTime(rec.completedAt),
      reference: rec.reference,
      what:
        rec.lines.map((l) => `${l.itemName} ×${l.quantity}`).join(", "),
      units: rec.lines.reduce((s, l) => s + l.quantity, 0),
      who: rec.completedBy || "Practice Manager",
    }));

  const exportFlowCSV = (kind: "intake" | "checkout", records: (StockIntake | StockCheckout)[]) => {
    const rows = flowRows(records).map((r) => [
      r.when,
      r.reference,
      r.what,
      String(r.units),
      r.who,
    ]);
    downloadCSV(
      ["When", "Reference", "Items", "Units", "Completed by"],
      rows,
      `stock-${kind}-report-${format(new Date(), "yyyyMMdd")}`,
    );
    toast.success("Report exported as CSV");
  };

  const exportFlowPDF = (kind: "intake" | "checkout", records: (StockIntake | StockCheckout)[]) => {
    const rows = flowRows(records)
      .map(
        (r) => `<tr>
          <td>${r.when}</td>
          <td>${r.reference}</td>
          <td>${r.what}</td>
          <td>${r.units}</td>
          <td>${r.who}</td>
        </tr>`,
      )
      .join("");
    const totalUnits = flowRows(records).reduce((s, r) => s + r.units, 0);
    openPrintPDF(
      wrapPDFPage({
        title: kind === "intake" ? "Stock Intake Report" : "Stock Checkout Report",
        subtitle: `Generated ${exportSubtitleDate()}`,
        bodyHtml: `
          <div class="stats">
            <div class="stat"><strong>${records.length}</strong>${kind === "intake" ? "Intakes" : "Checkouts"}</div>
            <div class="stat"><strong>${totalUnits}</strong>Units moved</div>
          </div>
          <table>
            <thead><tr><th>When</th><th>Reference</th><th>Items</th><th>Units</th><th>Completed by</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>`,
      }),
    );
    toast.success("Report exported as PDF");
  };

  /* ---------------- Render helpers ---------------- */
  const exportButtons = (onCSV: () => void, onPDF: () => void) => (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-lg text-xs" onClick={onCSV}>
        <Download className="w-3.5 h-3.5" /> CSV
      </Button>
      <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-lg text-xs" onClick={onPDF}>
        <FileText className="w-3.5 h-3.5" /> PDF
      </Button>
    </div>
  );

  const renderFlowTable = (
    records: (StockIntake | StockCheckout)[],
    kind: "intake" | "checkout",
  ) => {
    const isIntake = kind === "intake";
    if (records.length === 0) {
      return (
        <div className="p-8 text-center text-sm text-muted-foreground">
          No stock {isIntake ? "intakes" : "checkouts"} recorded yet.
        </div>
      );
    }
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>When</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>What</TableHead>
            <TableHead>Units</TableHead>
            <TableHead>Who</TableHead>
            <TableHead className="w-[140px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((rec) => {
            const units = rec.lines.reduce((s, l) => s + l.quantity, 0);
            const what = rec.lines
              .slice(0, 2)
              .map((l) => l.itemName)
              .join(", ");
            const extra = rec.lines.length - 2;
            return (
              <TableRow key={rec.id}>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {fmtDateTime(rec.completedAt)}
                </TableCell>
                <TableCell className="font-medium">{rec.reference}</TableCell>
                <TableCell className="max-w-[220px]">
                  <span className="block truncate text-xs">
                    {what}
                    {extra > 0 && <span className="text-muted-foreground"> +{extra} more</span>}
                  </span>
                </TableCell>
                <TableCell>{units}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="rounded-lg text-[10px] font-medium">
                    {rec.completedBy || "Practice Manager"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    title="Export record as CSV"
                    onClick={() =>
                      isIntake
                        ? exportStockIntakeCSV(rec as StockIntake)
                        : exportStockCheckoutCSV(rec as StockCheckout)
                    }
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    title="Export record as PDF"
                    onClick={() =>
                      isIntake
                        ? exportStockIntakePDF(rec as StockIntake)
                        : exportStockCheckoutPDF(rec as StockCheckout)
                    }
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
                    title="Delete record"
                    onClick={() => {
                      if (isIntake) setIntakes(deleteStockIntake(rec.id));
                      else setCheckouts(deleteStockCheckout(rec.id));
                      toast.success("Record deleted");
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  const stats = [
    { label: "Total items", value: String(consolidated.totalItems) },
    { label: "Units on hand", value: String(consolidated.totalUnits) },
    { label: "Stock value", value: `$${consolidated.totalValue.toFixed(2)}` },
    { label: "Expiring soon", value: String(consolidated.expiring) },
    { label: "Expired", value: String(consolidated.expired) },
  ];

  const generatedMeta = generatedType
    ? REPORT_OPTIONS.find((o) => o.value === generatedType)
    : null;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Report generator bar */}
      <div className="rounded-lg border border-border bg-card p-4 md:p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <FileBarChart2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Report generator</h3>
            <p className="text-xs text-muted-foreground">
              Pick a report type, then generate — results appear below, ready to export as CSV or PDF.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="overflow-x-auto flex-1">
            <SegmentedControl<ReportType | "">
              value={selectedType}
              onChange={(v) => {
                setSelectedType(v);
                setGeneratedType(null);
              }}
              options={REPORT_OPTIONS.map((o) => ({ id: o.value, label: o.label, icon: o.icon }))}
            />
          </div>
          <Button
            className="h-9 gap-2 rounded-lg sm:w-36 shrink-0"
            disabled={!selectedType}
            onClick={() => {
              if (!selectedType) return;
              if (selectedType === "custom") {
                setCustomChatOpen(true);
                return;
              }
              setGeneratedType(selectedType);
              toast.success("Report generated");
            }}
          >
            <Play className="w-4 h-4" />
            Generate
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {!generatedType && (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-10 text-center">
          <FileBarChart2 className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm font-medium">No report generated yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Select a report type above and click Generate to see the results here.
          </p>
        </div>
      )}

      {/* 1. Total stock count report */}
      {generatedType === "consolidated" && (
        <div className="rounded-lg border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">{generatedMeta?.label}</h3>
              <span className="text-xs text-muted-foreground">
                — generated {format(new Date(), "MMM d, yyyy · h:mm a")}
              </span>
            </div>
            {exportButtons(exportConsolidatedCSV, exportConsolidatedPDF)}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
                <p className="text-lg font-semibold leading-tight">{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Units on hand</TableHead>
                <TableHead>Stock value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consolidated.rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                    No stock items yet.
                  </TableCell>
                </TableRow>
              ) : (
                consolidated.rows.map((r) => (
                  <TableRow key={r.name}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{r.items}</TableCell>
                    <TableCell>{r.units}</TableCell>
                    <TableCell>${r.value.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 2. Stock intake report */}
      {generatedType === "intake" && (
        <div className="rounded-lg border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-4">
            <div className="flex items-center gap-2">
              <ArrowDownToLine className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">{generatedMeta?.label}</h3>
              <span className="text-xs text-muted-foreground">— when, what and who received stock</span>
            </div>
            <div className="flex items-center gap-2">
              <Select value={intakeYear} onValueChange={setIntakeYear}>
                <SelectTrigger className="h-8 w-[110px] rounded-lg text-xs">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All years</SelectItem>
                  {intakeYears.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {exportButtons(
                () => exportFlowCSV("intake", filteredIntakes),
                () => exportFlowPDF("intake", filteredIntakes),
              )}
            </div>
          </div>
          {renderFlowTable(filteredIntakes, "intake")}
        </div>
      )}

      {/* 3. Stock checkout report */}
      {generatedType === "checkout" && (
        <div className="rounded-lg border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-4">
            <div className="flex items-center gap-2">
              <ArrowUpFromLine className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">{generatedMeta?.label}</h3>
              <span className="text-xs text-muted-foreground">— when, what and who checked out stock</span>
            </div>
            <div className="flex items-center gap-2">
              <Select value={checkoutYear} onValueChange={setCheckoutYear}>
                <SelectTrigger className="h-8 w-[110px] rounded-lg text-xs">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All years</SelectItem>
                  {checkoutYears.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {exportButtons(
                () => exportFlowCSV("checkout", filteredCheckouts),
                () => exportFlowPDF("checkout", filteredCheckouts),
              )}
            </div>
          </div>
          {renderFlowTable(filteredCheckouts, "checkout")}
        </div>
      )}

      {/* 4. Custom report (AI) — opens chat directly */}
      <AIChatDialog
        pageContext="inventory-reports"
        pageTitle="Inventory Reports"
        open={customChatOpen}
        onOpenChange={setCustomChatOpen}
      />
    </div>
  );
}
