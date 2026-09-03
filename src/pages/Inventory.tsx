import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
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
import { mockStockCategories } from "@/data/mockStock";
import { format, differenceInDays, parseISO } from "date-fns";
import {
  Package,
  MapPin,
  Check,
  FolderInput,
  Trash2,
  Clock,
  Gauge,
  Zap,
  HelpCircle,
  AlertTriangle,
  FileText,
  Pencil,
  Barcode as BarcodeIcon,
  Radio,
  Save,
  X,
  ArrowUpDown,
  Filter,
  ChevronDown,
  Plus,
} from "lucide-react";
import { STATUS_COLORS, StockItem, StockBatch } from "@/types/stock";

import { useStock } from "@/contexts/StockContext";
import { useRooms } from "@/contexts/RoomsContext";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AddInventoryItemDialog, NewInventoryItemValues } from "@/components/stock/AddInventoryItemDialog";
import { BatchListEditor } from "@/components/stock/BatchListEditor";
import { StockCheckoutTab } from "@/components/stock/StockCheckoutTab";
import { StockIntakeTab } from "@/components/stock/StockIntakeTab";
import { StockReportsTab } from "@/components/stock/StockReportsTab";
import { useBarcodeMap, useBarcodeScanner, normaliseBarcode } from "@/lib/barcodes";
import { ExportDropdown } from "@/components/ui/ExportDropdown";
import { downloadCSV, openPrintPDF, wrapPDFPage, exportTimestamp } from "@/utils/exportUtils";



type InventoryGroup = "expiring" | "calibrating" | "electrical" | "stationery" | "other";
type ExpiryFilterId = "valid" | "expiring7" | "expiring30" | "expiring90" | "expired";

const EXPIRY_FILTER_OPTIONS: { id: ExpiryFilterId; label: string }[] = [
  { id: "valid", label: "Valid" },
  { id: "expiring7", label: "Expiring in 7 days" },
  { id: "expiring30", label: "Expiring in 30 days" },
  { id: "expiring90", label: "Expiring in 90 days" },
  { id: "expired", label: "Expired" },
];

const CALIBRATING_CATEGORY_IDS = new Set([
  "vital-signs",
  "diagnostic-measurement",
  "sterilization-infection",
  "therapeutic-treatment",
]);

const STATIONERY_CATEGORY_IDS = new Set([
  "stationery",
  "office-supplies",
  "admin-supplies",
]);

const STATIONERY_KEYWORDS = ["pen", "paper", "stapler", "envelope", "notebook", "printer", "toner", "ink", "folder", "stationery", "stationary"];

function classifyItem(item: StockItem): InventoryGroup {
  if (item.electricalTestDate || item.nextElectricalTestDate || item.electricalTagNumber || item.categoryId === "electrical-tagging") {
    return "electrical";
  }
  if (item.calibrationDate || item.nextCalibrationDate || CALIBRATING_CATEGORY_IDS.has(item.categoryId)) {
    return "calibrating";
  }
  const hasExpiry = item.expiryDate || item.batches?.some((b) => b.expiryDate);
  if (hasExpiry) return "expiring";
  if (STATIONERY_CATEGORY_IDS.has(item.categoryId)) return "stationery";
  const name = `${item.name} ${item.description || ""}`.toLowerCase();
  if (STATIONERY_KEYWORDS.some((k) => name.includes(k))) return "stationery";
  return "other";
}

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<InventoryGroup>("expiring");
  const [statusFilters, setStatusFilters] = useState<ExpiryFilterId[]>([]);
  const [expirySort, setExpirySort] = useState<"asc" | "desc" | "none">("none");
  const [selectedBatchKeys, setSelectedBatchKeys] = useState<Set<string>>(new Set());
  const [editBatchOpen, setEditBatchOpen] = useState(false);
  const [allocateOpen, setAllocateOpen] = useState(false);
  const { items, createItem, updateItem, deleteItem } = useStock();
  const { rooms } = useRooms();

  const [addOpen, setAddOpen] = useState(false);

  /* ---------------- Barcode matching (inline columns) ---------------- */
  const { map: barcodeMap, persist: persistBarcodes } = useBarcodeMap();
  const [barcodeMode, setBarcodeMode] = useState(false);
  const [armedItemId, setArmedItemId] = useState<string | null>(null);
  const [barcodeDraft, setBarcodeDraft] = useState<Record<string, string>>({});

  const savedBarcodeByItem = useMemo(() => {
    const out: Record<string, string> = {};
    Object.entries(barcodeMap).forEach(([code, itemId]) => {
      out[itemId] = code;
    });
    return out;
  }, [barcodeMap]);

  const barcodeFor = (itemId: string) =>
    barcodeDraft[itemId] !== undefined ? barcodeDraft[itemId] : savedBarcodeByItem[itemId] ?? "";

  const barcodeDirtyCount = useMemo(
    () =>
      Object.keys(barcodeDraft).filter(
        (id) => normaliseBarcode(barcodeDraft[id] ?? "") !== (savedBarcodeByItem[id] ?? ""),
      ).length,
    [barcodeDraft, savedBarcodeByItem],
  );

  const assignBarcode = (itemId: string, rawCode: string) => {
    const code = normaliseBarcode(rawCode);
    if (code) {
      const clash = items.find((i) => i.id !== itemId && barcodeFor(i.id) === code);
      if (clash) {
        toast.error(`That barcode is already matched to "${clash.name}"`);
        return;
      }
    }
    setBarcodeDraft((prev) => ({ ...prev, [itemId]: code }));
  };

  useBarcodeScanner({
    enabled: barcodeMode,
    onScan: (code) => {
      if (armedItemId) {
        const item = items.find((i) => i.id === armedItemId);
        assignBarcode(armedItemId, code);
        setArmedItemId(null);
        if (item) toast.success(`Matched ${code} → ${item.name}`);
        return;
      }
      const knownId = barcodeMap[code] ?? items.find((i) => barcodeFor(i.id) === code)?.id;
      const known = items.find((i) => i.id === knownId);
      if (known) toast.info(`${code} is already matched to "${known.name}"`);
      else toast.message(`Scanned ${code}`, { description: "Click the barcode icon on a row to match it." });
    },
  });

  const saveBarcodes = () => {
    const next: Record<string, string> = {};
    items.forEach((i) => {
      const code = normaliseBarcode(barcodeFor(i.id));
      if (code) next[code] = i.id;
    });
    persistBarcodes(next);
    setBarcodeDraft({});
    toast.success("Barcode matches saved");
  };

  const openBarcodeForItem = (itemId: string) => {
    setBarcodeMode(true);
    setArmedItemId((prev) => (prev === itemId ? null : itemId));
  };

  const exitBarcodeMode = () => {
    setBarcodeMode(false);
    setArmedItemId(null);
    setBarcodeDraft({});
  };


  const computeDraftStatus = (d?: Date): StockItem["status"] => {
    if (!d) return "valid";
    const days = differenceInDays(d, new Date());
    if (days < 0) return "expired";
    if (days <= 60) return "expiring";
    return "valid";
  };

  const handleAddItem = (values: NewInventoryItemValues) => {
    const now = new Date();
    createItem({
      id: `stk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      categoryId: activeGroup === "electrical" ? "electrical-tagging" : "consumables",
      name: values.name,
      description: "",
      quantity: 0,
      status: "valid",
      batches: values.batches,
      createdAt: now,
      updatedAt: now,
    });
    toast.success(`Added ${values.name}`);
  };

  const handleExportCSV = () => {
    const headers = ["Item", "Batch number", "Expiry date", "Unit price", "Quantity", "Status", "Locations"];
    const rows = visibleBatchRows.map(({ item, batch }) => {
      const status = computeDraftStatus(batch.expiryDate);
      const locations = [item.location, ...(item.allocatedRooms || [])].filter(Boolean).join("; ");
      return [
        item.name,
        batch.batchNumber || "",
        batch.expiryDate ? format(batch.expiryDate, "dd.MM.yyyy") : "",
        typeof batch.unitPrice === "number" ? `$${batch.unitPrice.toFixed(2)}` : "",
        String(batch.quantity),
        status,
        locations,
      ];
    });
    downloadCSV(headers, rows, `inventory-${exportTimestamp()}`);
    toast.success("Inventory exported as CSV");
  };

  const handleExportPDF = () => {
    const rows = visibleBatchRows.map(({ item, batch }) => {
      const status = computeDraftStatus(batch.expiryDate);
      const locations = [item.location, ...(item.allocatedRooms || [])].filter(Boolean).join(", ") || "—";
      return `
        <tr>
          <td>${item.name}</td>
          <td>${batch.batchNumber || "—"}</td>
          <td>${batch.expiryDate ? format(batch.expiryDate, "dd.MM.yyyy") : "—"}</td>
          <td>${typeof batch.unitPrice === "number" ? `$${batch.unitPrice.toFixed(2)}` : "—"}</td>
          <td>${batch.quantity}</td>
          <td>${status}</td>
          <td>${locations}</td>
        </tr>
      `;
    }).join("");
    const html = wrapPDFPage({
      title: "Inventory Report",
      subtitle: `Generated on ${format(new Date(), "MMMM d, yyyy")} · ${visibleBatchRows.length} items`,
      bodyHtml: `
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Batch number</th>
              <th>Expiry date</th>
              <th>Unit price</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Locations</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      `,
    });
    openPrintPDF(html);
    toast.success("Inventory exported as PDF");
  };


  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const validTabs = ["inventory", "intake", "checkout", "reports"] as const;
  const activeTab = (validTabs as readonly string[]).includes(tabParam ?? "") ? (tabParam as string) : "inventory";
  const setActiveTab = (value: string) => {
    setSearchParams((prev) => {
      if ((validTabs as readonly string[]).includes(value) && value !== "inventory") {
        prev.set("tab", value);
      } else {
        prev.delete("tab");
      }
      return prev;
    }, { replace: true });
  };

  const inventoryItems = useMemo(() => {
    return items.map((item) => {
      const category = mockStockCategories.find((c) => c.id === item.categoryId);
      return {
        ...item,
        categoryName: category?.name || item.categoryId,
        inventoryGroup: classifyItem(item),
        invoiceNumber: `INV-${item.id.padStart(4, "0")}`,
        purchaseDate: item.createdAt,
      };
    });
  }, [items]);

  const matchesExpiryFilters = (expiryDate?: Date): boolean => {
    if (statusFilters.length === 0) return true;
    const status = computeDraftStatus(expiryDate);
    const days = expiryDate ? differenceInDays(expiryDate, new Date()) : null;
    return statusFilters.some((f) => {
      if (f === "valid") return status === "valid";
      if (f === "expired") return status === "expired";
      if (days === null || days < 0) return false;
      if (f === "expiring7") return days <= 7;
      if (f === "expiring30") return days <= 30;
      if (f === "expiring90") return days <= 90;
      return false;
    });
  };

  const toggleStatusFilter = (id: ExpiryFilterId) => {
    setStatusFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const filtered = useMemo(() => {
    return inventoryItems.filter((item) => {
      if (item.inventoryGroup !== activeGroup) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q) ||
        item.invoiceNumber.toLowerCase().includes(q) ||
        (item.batchNumber && item.batchNumber.toLowerCase().includes(q)) ||
        item.batches?.some((b) => b.batchNumber?.toLowerCase().includes(q)) ||
        (item.location && item.location.toLowerCase().includes(q))
      );
    });
  }, [inventoryItems, activeGroup, searchQuery]);

  const counts = useMemo(() => {
    const c: Record<InventoryGroup, number> = { expiring: 0, calibrating: 0, electrical: 0, stationery: 0, other: 0 };
    inventoryItems.forEach((item) => { c[item.inventoryGroup]++; });
    return c;
  }, [inventoryItems]);

  const batchesForItem = (item: StockItem): StockBatch[] => item.batches?.length ? item.batches : [{
    id: `legacy-${item.id}`,
    batchNumber: item.batchNumber || "",
    expiryDate: item.expiryDate,
    quantity: item.quantity,
    unitPrice: item.buyingPrice,
  }];
  const batchKey = (itemId: string, batchId: string) => `${itemId}::${batchId}`;
  const visibleBatchRows = useMemo(() => {
    const rows = filtered
      .flatMap((item) => batchesForItem(item).map((batch) => ({ item, batch })))
      .filter(({ batch }) => matchesExpiryFilters(batch.expiryDate));
    if (expirySort === "none") return rows;
    return [...rows].sort((a, b) => {
      const aTime = a.batch.expiryDate ? a.batch.expiryDate.getTime() : Infinity;
      const bTime = b.batch.expiryDate ? b.batch.expiryDate.getTime() : Infinity;
      return expirySort === "asc" ? aTime - bTime : bTime - aTime;
    });
  }, [filtered, expirySort, statusFilters]);
  const selectedBatchRows = useMemo(
    () => items.flatMap((item) => batchesForItem(item)
      .filter((batch) => selectedBatchKeys.has(batchKey(item.id, batch.id)))
      .map((batch) => ({ item, batch }))),
    [items, selectedBatchKeys],
  );
  const expiredVisibleKeys = useMemo(
    () => visibleBatchRows
      .filter(({ batch }) => computeDraftStatus(batch.expiryDate) === "expired")
      .map(({ item, batch }) => batchKey(item.id, batch.id)),
    [visibleBatchRows],
  );

  const allVisibleSelected = visibleBatchRows.length > 0 && visibleBatchRows.every(({ item, batch }) => selectedBatchKeys.has(batchKey(item.id, batch.id)));
  const toggleSelect = (key: string) => {
    setSelectedBatchKeys((prev) => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  };
  const toggleSelectAll = () => {
    setSelectedBatchKeys((prev) => {
      if (allVisibleSelected) {
        const n = new Set(prev);
        visibleBatchRows.forEach(({ item, batch }) => n.delete(batchKey(item.id, batch.id)));
        return n;
      }
      const n = new Set(prev);
      visibleBatchRows.forEach(({ item, batch }) => n.add(batchKey(item.id, batch.id)));
      return n;
    });
  };
  const selectAllExpired = () => {
    setSelectedBatchKeys((prev) => {
      const n = new Set(prev);
      expiredVisibleKeys.forEach((key) => n.add(key));
      return n;
    });
  };
  const handleBulkDelete = () => {
    const count = selectedBatchRows.length;
    if (count === 0) return;
    const byItem = new Map<string, Set<string>>();
    selectedBatchRows.forEach(({ item, batch }) => {
      const ids = byItem.get(item.id) ?? new Set<string>();
      ids.add(batch.id);
      byItem.set(item.id, ids);
    });
    byItem.forEach((batchIds, itemId) => {
      const item = items.find((candidate) => candidate.id === itemId);
      if (!item) return;
      const remaining = batchesForItem(item).filter((batch) => !batchIds.has(batch.id));
      if (remaining.length === 0) deleteItem(itemId);
      else updateItem(itemId, { batches: remaining });
    });
    setSelectedBatchKeys(new Set());
    toast.success(`Deleted ${count} batch${count > 1 ? "es" : ""}`);
  };

  const handleAddBatch = (item: StockItem) => {
    const currentBatches = item.batches?.length
      ? item.batches
      : [{
          id: `legacy-${item.id}`,
          batchNumber: item.batchNumber || "",
          expiryDate: item.expiryDate,
          quantity: item.quantity,
          unitPrice: item.buyingPrice,
        } as StockBatch];

    updateItem(item.id, {
      batches: [
        ...currentBatches,
        {
          id: `b-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          batchNumber: "",
          quantity: 0,
          unitPrice: currentBatches[0]?.unitPrice,
        },
      ],
    });
    toast.success(`Batch ${currentBatches.length + 1} added to ${item.name}`);
  };

  const handleAllocate = (
    itemId: string,
    itemName: string,
    patch: { rooms: string[]; categoryIds: string[]; roomQuantities: Record<string, number> },
  ) => {
    updateItem(itemId, {
      location: patch.rooms[0] || undefined,
      allocatedRooms: patch.rooms.slice(1),
      allocatedRoomQuantities: patch.roomQuantities,
      allocatedCategoryIds: patch.categoryIds,
    });
    const parts: string[] = [];
    if (patch.rooms.length) parts.push(`${patch.rooms.length} room${patch.rooms.length > 1 ? "s" : ""}`);
    if (patch.categoryIds.length) parts.push(`${patch.categoryIds.length} categor${patch.categoryIds.length > 1 ? "ies" : "y"}`);
    toast.success(`Allocated ${itemName}${parts.length ? ` to ${parts.join(" & ")}` : ""}`);
  };

  return (
    <AdminLayout>
      <MobileHeader title="Inventory" subtitle="Consolidated view of all stock items" />
      <PageHeader
        title="Inventory"
        subtitle="Consolidated view of all stock items across categories"
        icon={Package}
      />
      <div className="px-8 pt-6 pb-4 w-full space-y-4 md:space-y-6">
        <div className="rounded-lg border border-border bg-card p-4 md:p-5">
          <p className="text-sm leading-relaxed text-foreground">
            <span className="font-semibold text-primary">Everything your practice needs, tracked in one place.</span>{" "}
            Use this page to monitor stock levels, keep an eye on expiries, and make sure medical supplies never run short.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 rounded-lg mb-4 md:mb-6">
            <TabsTrigger value="inventory" className="rounded-lg text-xs">Inventory</TabsTrigger>
            <TabsTrigger value="intake" className="rounded-lg text-xs">Stock intake</TabsTrigger>
            <TabsTrigger value="checkout" className="rounded-lg text-xs">Stock checkout</TabsTrigger>
            <TabsTrigger value="reports" className="rounded-lg text-xs">Reports</TabsTrigger>
          </TabsList>


          <TabsContent value="inventory" className="mt-0 space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, invoice..."
            className="flex-1 min-w-[220px] max-w-lg"
          />
          <div className="flex flex-wrap items-center justify-end gap-2">
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportPDF={handleExportPDF}
              disabled={visibleBatchRows.length === 0}
              size="sm"
              variant="outline"
              label="Export"
            />
            <Button size="sm" className="h-8 gap-1.5" onClick={() => setAddOpen(true)}>
              <Plus className="w-3.5 h-3.5" />
              Add New Item
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <SegmentedControl
            value={activeGroup}
            onChange={(v) => {
              setActiveGroup(v as InventoryGroup);
              setSelectedBatchKeys(new Set());
            }}
            options={[
              { id: "expiring" as InventoryGroup, label: "Medical Supplies", icon: Clock, badge: counts.expiring },
              { id: "calibrating" as InventoryGroup, label: "Calibrating", icon: Gauge, badge: counts.calibrating },
              { id: "electrical" as InventoryGroup, label: "Test & Tagging", icon: Zap, badge: counts.electrical },
              { id: "stationery" as InventoryGroup, label: "Stationery", icon: FileText, badge: counts.stationery },
              { id: "other" as InventoryGroup, label: "Other", icon: HelpCircle, badge: counts.other },
            ]}
          />
          <p className="text-xs text-muted-foreground whitespace-nowrap">
            {visibleBatchRows.length} item{visibleBatchRows.length !== 1 ? "s" : ""}
            {selectedBatchRows.length > 0 && ` · ${selectedBatchRows.length} selected`}
          </p>
        </div>


        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className={cn(
                    "h-9 text-xs rounded-lg gap-2",
                    statusFilters.length > 0
                      ? "border-primary/50 text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Filter className="w-3.5 h-3.5" />
                  {statusFilters.length === 0 ? "All statuses" : `Status (${statusFilters.length})`}
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60 p-2 rounded-lg" align="start">
                <div className="space-y-0.5">
                  {EXPIRY_FILTER_OPTIONS.map((opt) => {
                    const checked = statusFilters.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleStatusFilter(opt.id)}
                        className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm hover:bg-muted/60 transition-colors"
                      >
                        <Checkbox checked={checked} />
                        <span className="flex-1 text-left">{opt.label}</span>
                        {checked && <Check className="w-4 h-4 text-primary" />}
                      </button>
                    );
                  })}
                </div>
                {statusFilters.length > 0 && (
                  <div className="pt-1.5 mt-1.5 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-8 text-xs gap-1.5"
                      onClick={() => setStatusFilters([])}
                    >
                      <X className="w-3.5 h-3.5" />
                      Clear filters
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            <Select value={expirySort} onValueChange={(v) => setExpirySort(v as "asc" | "desc" | "none")}>
              <SelectTrigger className="h-9 w-[190px] rounded-lg text-xs">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border shadow-lg z-50">
                <SelectItem value="none">Default order</SelectItem>
                <SelectItem value="asc">Expiry: earliest first</SelectItem>
                <SelectItem value="desc">Expiry: latest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            {activeGroup === "expiring" && expiredVisibleKeys.length > 0 && (
              <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={selectAllExpired}>
                <AlertTriangle className="w-3.5 h-3.5" />
                Select expired ({expiredVisibleKeys.length})
              </Button>
            )}
          </div>
        </div>

        {barcodeMode && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/[0.06] px-3 py-2">
            <p className="text-xs text-foreground flex items-center gap-1.5">
              <BarcodeIcon className="w-3.5 h-3.5 text-primary" />
              {armedItemId
                ? "Listening — scan a barcode to match it to the highlighted row."
                : "Click the barcode icon on a row, then scan. You can also type a code."}
              {barcodeDirtyCount > 0 && (
                <span className="text-muted-foreground">· {barcodeDirtyCount} unsaved</span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="h-8 gap-1.5" onClick={exitBarcodeMode}>
                <X className="w-3.5 h-3.5" />
                Close
              </Button>
              <Button size="sm" className="h-8 gap-1.5" disabled={barcodeDirtyCount === 0} onClick={saveBarcodes}>
                <Save className="w-3.5 h-3.5" />
                Save all
              </Button>
            </div>
          </div>
        )}

        <AddInventoryItemDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          productOptions={Array.from(new Set(items.map((i) => i.name))).sort()}
          onSave={handleAddItem}
        />



        <TooltipProvider>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10">
                  <Checkbox
                    checked={allVisibleSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                    disabled={visibleBatchRows.length === 0}
                  />
                </TableHead>
                <TableHead className="text-xs font-semibold whitespace-nowrap min-w-[14rem]">Item</TableHead>
                <TableHead className="text-xs font-semibold whitespace-nowrap w-44">Category</TableHead>
                <TableHead className="text-xs font-semibold whitespace-nowrap w-36">Batch number</TableHead>
                <TableHead className="text-xs font-semibold whitespace-nowrap w-32">Expiry date</TableHead>
                <TableHead className="text-xs font-semibold text-right whitespace-nowrap w-28">Unit price</TableHead>
                <TableHead className="text-xs font-semibold text-right whitespace-nowrap w-24">Quantity</TableHead>
                <TableHead className="text-xs font-semibold whitespace-nowrap w-28">Status</TableHead>
                <TableHead className="text-xs font-semibold whitespace-nowrap min-w-[10rem]">Locations</TableHead>
                <TableHead className="text-xs font-semibold text-right whitespace-nowrap w-72">
                  <div className={cn(
                    "flex items-center justify-between gap-2 rounded-lg transition-colors px-2 py-1 -mr-2",
                    selectedBatchRows.length > 0 && "bg-primary/[0.08] border border-primary/20"
                  )}>
                    <span>Actions</span>
                    <div className="flex items-center gap-3">
                      <Popover open={editBatchOpen} onOpenChange={setEditBatchOpen}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <PopoverTrigger asChild>
                              <Button
                                size="icon"
                                variant={selectedBatchRows.length === 1 ? "default" : "ghost"}
                                className={cn("h-7 w-7", selectedBatchRows.length === 1 && "bg-primary text-primary-foreground hover:bg-primary/90")}
                                disabled={selectedBatchRows.length !== 1}
                                aria-label="Edit selected batch"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </PopoverTrigger>
                          </TooltipTrigger>
                          <TooltipContent>Edit (select one batch)</TooltipContent>
                        </Tooltip>
                        <PopoverContent align="end" className="w-80 p-3">
                          {selectedBatchRows[0] && (
                            <SelectedBatchEditForm
                              item={selectedBatchRows[0].item}
                              batch={selectedBatchRows[0].batch}
                              onSubmit={(batch) => {
                                const target = selectedBatchRows[0];
                                updateItem(target.item.id, { batches: batchesForItem(target.item).map((current) => current.id === batch.id ? batch : current) });
                                setEditBatchOpen(false);
                                toast.success("Batch updated");
                              }}
                            />
                          )}
                        </PopoverContent>
                      </Popover>
                      <Popover open={allocateOpen} onOpenChange={setAllocateOpen}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <PopoverTrigger asChild>
                              <Button
                                size="icon"
                                variant={selectedBatchRows.length > 0 ? "default" : "ghost"}
                                className={cn("h-7 w-7", selectedBatchRows.length > 0 && "bg-primary text-primary-foreground hover:bg-primary/90")}
                                disabled={selectedBatchRows.length === 0}
                                aria-label="Allocate selected batches"
                              >
                                <MapPin className="h-3.5 w-3.5" />
                              </Button>
                            </PopoverTrigger>
                          </TooltipTrigger>
                          <TooltipContent>Allocate to rooms and stock locations</TooltipContent>
                        </Tooltip>
                        <PopoverContent side="left" align="start" className="w-[28rem] p-4">
                          <AllocateForm
                            selectedItems={selectedBatchRows.reduce((acc, { item, batch }) => {
                              const existing = acc.find((it) => it.id === item.id);
                              if (existing) {
                                existing.quantity += batch.quantity;
                                if (batch.batchNumber) {
                                  existing.batchNumber = [existing.batchNumber, batch.batchNumber]
                                    .filter(Boolean)
                                    .join(", ");
                                }
                              } else {
                                acc.push({
                                  id: item.id,
                                  name: item.name,
                                  batchNumber: batch.batchNumber || undefined,
                                  quantity: batch.quantity,
                                  currentRooms: [item.location, ...(item.allocatedRooms || [])].filter(Boolean) as string[],
                                  currentRoomQuantities: item.allocatedRoomQuantities ?? {},
                                  currentCategoryIds: item.allocatedCategoryIds ?? [],
                                });
                              }
                              return acc;
                            }, [] as SelectedItemInfo[])}
                            rooms={rooms.map((room) => ({ id: room.id, name: room.roomName }))}
                            categories={mockStockCategories.map((category) => ({ id: category.id, name: category.name }))}
                            onSubmit={(patches) => {
                              Object.entries(patches).forEach(([itemId, patch]) =>
                                handleAllocate(itemId, items.find((item) => item.id === itemId)?.name ?? "item", patch),
                              );
                              setAllocateOpen(false);
                            }}
                          />
                        </PopoverContent>

                      </Popover>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant={selectedBatchRows.length > 0 ? "default" : "ghost"}
                            className={cn("h-7 w-7 text-muted-foreground hover:text-destructive", selectedBatchRows.length > 0 && "bg-destructive text-destructive-foreground hover:bg-destructive/90")}
                            disabled={selectedBatchRows.length === 0}
                            onClick={handleBulkDelete}
                            aria-label="Delete selected batches"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleBatchRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12 text-muted-foreground text-sm">
                    No inventory items found
                  </TableCell>
                </TableRow>
              ) : (
                visibleBatchRows.map(({ item, batch }) => {
                  const batchStatus = computeDraftStatus(batch.expiryDate);
                  const key = batchKey(item.id, batch.id);
                  const locations = [item.location, ...(item.allocatedRooms || [])].filter(Boolean) as string[];
                  return (
                    <TableRow key={key} className={cn(selectedBatchKeys.has(key) && "bg-primary/[0.06]")}>
                      <TableCell className="py-2">
                        <Checkbox checked={selectedBatchKeys.has(key)} onCheckedChange={() => toggleSelect(key)} aria-label={`Select ${item.name}, batch ${batch.batchNumber || "unnamed"}`} />
                      </TableCell>
                      <TableCell className="py-2 text-sm font-medium text-foreground whitespace-nowrap">
                        {item.name}
                      </TableCell>
                      <TableCell className="py-2">
                        <Select
                          value={item.categoryId}
                          onValueChange={(value) => {
                            updateItem(item.id, { categoryId: value });
                            toast.success(`Category updated for ${item.name}`);
                          }}
                        >
                          <SelectTrigger
                            className="h-8 w-40 text-xs rounded-lg border-transparent bg-transparent hover:border-border hover:bg-muted/50 focus:ring-1 focus:ring-primary"
                            aria-label={`Change category for ${item.name}`}
                          >
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border border-border shadow-lg z-50">
                            {mockStockCategories.map((category) => (
                              <SelectItem key={category.id} value={category.id} className="text-xs">
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="py-2 text-xs text-muted-foreground font-mono whitespace-nowrap">
                        {batch.batchNumber || "—"}
                      </TableCell>
                      <TableCell className={cn("py-2 text-xs whitespace-nowrap", batchStatus === "expiring" ? "text-amber-600" : batchStatus === "expired" ? "text-red-600" : "text-muted-foreground")}>
                        {batch.expiryDate ? format(batch.expiryDate, "dd.MM.yyyy") : "—"}
                      </TableCell>
                      <TableCell className="py-2 text-right text-xs text-muted-foreground whitespace-nowrap">
                        {typeof batch.unitPrice === "number" ? `$${batch.unitPrice.toFixed(2)}` : "—"}
                      </TableCell>
                      <TableCell className="py-2 text-right text-sm font-medium whitespace-nowrap">{batch.quantity}</TableCell>
                      <TableCell className="py-2">
                        <Badge className={`${STATUS_COLORS[batchStatus]} text-[10px] border-0 capitalize`}>
                          {batchStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 text-xs text-muted-foreground max-w-[14rem]">
                        {locations.length === 0 ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 shrink-0 text-muted-foreground" />
                            <span className="truncate">
                              {locations[0]}
                              {item.allocatedRoomQuantities?.[locations[0]] !== undefined && (
                                <span className="ml-1 text-muted-foreground">({item.allocatedRoomQuantities[locations[0]]})</span>
                              )}
                            </span>
                            {locations.length > 1 && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className="shrink-0 inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-foreground hover:bg-muted/80 transition-colors"
                                  >
                                    +{locations.length - 1} more
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="w-56 p-2 rounded-lg">
                                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide px-2 py-1">
                                    All locations
                                  </p>
                                  <div className="mt-1 space-y-0.5">
                                    {locations.map((loc, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs text-foreground hover:bg-muted/60"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <MapPin className="w-3 h-3 shrink-0 text-muted-foreground" />
                                          <span className="truncate">{loc}</span>
                                        </div>
                                        {item.allocatedRoomQuantities?.[loc] !== undefined && (
                                          <span className="shrink-0 text-muted-foreground">({item.allocatedRoomQuantities[loc]})</span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-2">
                          {barcodeMode && (
                            <div className="flex items-center justify-end gap-2">
                              <Input
                                value={barcodeFor(item.id)}
                                onChange={(e) => assignBarcode(item.id, e.target.value)}
                                onFocus={() => setArmedItemId(item.id)}
                                placeholder={armedItemId === item.id ? "Scan or type…" : "Barcode"}
                                className={cn(
                                  "h-7 text-xs rounded-lg font-mono min-w-[8rem]",
                                  armedItemId === item.id && "ring-2 ring-primary border-primary",
                                )}
                              />
                              {armedItemId === item.id ? (
                                <Badge className="bg-primary/10 text-primary border-0 text-[10px] gap-1">
                                  <Radio className="w-3 h-3 animate-pulse" />
                                  Listening
                                </Badge>
                              ) : barcodeFor(item.id) ? (
                                <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px]">Matched</Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px] text-muted-foreground">Not matched</Badge>
                              )}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          </div>
        </div>
        </TooltipProvider>


          </TabsContent>
          <TabsContent value="intake" className="mt-0">
            <StockIntakeTab />
          </TabsContent>
          <TabsContent value="checkout" className="mt-0">
            <StockCheckoutTab />
          </TabsContent>
          <TabsContent value="reports" className="mt-0">
            <StockReportsTab />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>

  );
}

interface SelectedItemInfo {
  id: string;
  name: string;
  batchNumber?: string;
  quantity: number;
  currentRooms: string[];
  currentRoomQuantities: Record<string, number>;
  currentCategoryIds: string[];
}

type AllocationPatch = { rooms: string[]; categoryIds: string[]; roomQuantities: Record<string, number> };

interface AllocateFormProps {
  selectedItems: SelectedItemInfo[];
  rooms: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  onSubmit: (patches: Record<string, AllocationPatch>) => void;
}

function AllocateForm({ selectedItems, rooms, categories, onSubmit }: AllocateFormProps) {
  const [itemQty, setItemQty] = useState<Record<string, number>>(() =>
    selectedItems.reduce((acc, it) => {
      acc[it.id] = it.quantity;
      return acc;
    }, {} as Record<string, number>),
  );
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleRoom = (roomName: string) => {
    setSelectedRooms((prev) =>
      prev.includes(roomName) ? prev.filter((r) => r !== roomName) : [...prev, roomName],
    );
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((c) => c !== categoryId) : [...prev, categoryId],
    );
  };

  const updateItemQty = (itemId: string, value: string) => {
    const qty = value === "" ? 0 : Math.max(0, Number(value));
    setItemQty((prev) => ({ ...prev, [itemId]: qty }));
  };

  const canSave = selectedRooms.length > 0 || selectedCategories.length > 0;

  const handleSave = () => {
    const patches = selectedItems.reduce((acc, it) => {
      const qty = itemQty[it.id] ?? 0;
      acc[it.id] = {
        rooms: selectedRooms,
        categoryIds: selectedCategories,
        roomQuantities: selectedRooms.reduce((q, room) => {
          q[room] = qty;
          return q;
        }, {} as Record<string, number>),
      };
      return acc;
    }, {} as Record<string, AllocationPatch>);
    onSubmit(patches);
  };

  return (
    <div className="space-y-4 w-full">
      <div>
        <p className="text-sm font-semibold text-foreground">Allocate to rooms and stock</p>
        <p className="text-xs text-muted-foreground">
          Set quantities for the selected items, then choose rooms and stock categories.
        </p>
      </div>

      {/* Section 1: Selected items with editable quantities */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center justify-between">
          <span>Items selected ({selectedItems.length})</span>
          <span className="text-[10px] normal-case font-normal">Quantity to allocate</span>
        </label>
        <div className="max-h-40 overflow-y-auto rounded-md border border-border divide-y divide-border">
          {selectedItems.length === 0 && (
            <p className="px-3 py-3 text-xs text-muted-foreground">No items selected</p>
          )}
          {selectedItems.map((it) => (
            <div
              key={it.id}
              className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-muted/40 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">{it.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {it.batchNumber ? `${it.batchNumber} · ` : ""}Available: {it.quantity}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] text-muted-foreground hidden sm:inline">Qty</span>
                <Input
                  type="number"
                  min={0}
                  value={itemQty[it.id] ?? 0}
                  onChange={(e) => updateItemQty(it.id, e.target.value)}
                  className="h-7 w-20 text-xs rounded-lg px-2 py-0 text-right"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Rooms selection (scrollable) */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          Rooms
          {selectedRooms.length > 0 && (
            <span className="text-[10px] text-muted-foreground">({selectedRooms.length})</span>
          )}
        </label>
        <div className="max-h-44 overflow-y-auto border border-border rounded-md p-2 space-y-1">
          {rooms.length === 0 && (
            <div className="px-1.5 py-1 text-xs text-muted-foreground">No rooms available</div>
          )}
          {rooms
            .filter((r) => r.name && r.name.trim())
            .map((r) => {
              const checked = selectedRooms.includes(r.name);
              return (
                <label
                  key={r.id}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded border cursor-pointer",
                    checked ? "border-primary/30 bg-primary/[0.04]" : "border-transparent hover:bg-muted/50",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleRoom(r.name)}
                    className="h-4 w-4 accent-primary shrink-0"
                  />
                  <span className="text-xs truncate">{r.name}</span>
                </label>
              );
            })}
        </div>
      </div>

      {/* Section 3: Stock categories (scrollable) */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <FolderInput className="w-3.5 h-3.5" />
          Stock categories
          {selectedCategories.length > 0 && (
            <span className="text-[10px] text-muted-foreground">({selectedCategories.length})</span>
          )}
        </label>
        <div className="max-h-44 overflow-y-auto border border-border rounded-md p-2 space-y-1">
          {categories.map((c) => {
            const checked = selectedCategories.includes(c.id);
            return (
              <label
                key={c.id}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded border cursor-pointer",
                  checked ? "border-primary/30 bg-primary/[0.04]" : "border-transparent hover:bg-muted/50",
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCategory(c.id)}
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-xs">{c.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      <Button size="sm" className="w-full h-9 text-xs gap-1.5" disabled={!canSave} onClick={handleSave}>
        <Check className="w-3.5 h-3.5" />
        Save allocation
      </Button>
    </div>
  );
}



interface SelectedBatchEditFormProps {
  item: StockItem;
  batch: StockBatch;
  onSubmit: (batch: StockBatch) => void;
}

function SelectedBatchEditForm({ item, batch, onSubmit }: SelectedBatchEditFormProps) {
  const [draft, setDraft] = useState<StockBatch>(batch);
  const dirty = JSON.stringify(draft) !== JSON.stringify(batch);

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold text-foreground">Edit batch</p>
        <p className="text-xs text-muted-foreground truncate">{item.name}</p>
      </div>
      <BatchListEditor batches={[draft]} onChange={(batches) => {
        const next = batches[0];
        if (next) setDraft(next);
      }} />
      <Button
        size="sm"
        className="w-full h-8 text-xs gap-1.5"
        disabled={!dirty}
        onClick={() => onSubmit(draft)}
      >
        <Check className="w-3.5 h-3.5" />
        Save batch
      </Button>
    </div>
  );
}
