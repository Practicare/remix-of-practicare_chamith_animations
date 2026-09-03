import { useState, useMemo } from "react";
import { StockItem, StockCategory, CATEGORY_FIELD_CONFIG, DEFAULT_FIELD_CONFIG } from "@/types/stock";
import { useStock } from "@/contexts/StockContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Plus, Calendar as CalendarIcon, X, Package, Sparkles, Pencil, RefreshCw, Trash2, Info, ShoppingCart, Clock, PackageCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";


interface StockTableProps {
  showAddRow?: boolean;
  activeCategoryId?: string;
  
  onCreateItem?: (item: Omit<StockItem, "id" | "createdAt" | "updatedAt" | "status">) => void;
  savedItems?: StockItem[];
  onUpdateItem?: (id: string, patch: Partial<StockItem>) => void;
  onDeleteItem?: (id: string) => void;
  onEditItem?: (item: StockItem) => void;
  onRenewItem?: (item: StockItem) => void;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
  // Refill column (optional). When enabled, a "Refill" column is appended.
  refillEnabled?: boolean;
  getRefillStatus?: (item: StockItem) => "order" | "pending" | "refilled" | undefined;
  onOrderRefill?: (item: StockItem) => void;
  onUpdateRefillStatus?: (item: StockItem, status: "order" | "pending" | "refilled") => void;
}

interface DraftRow {
  id: string;
  name: string;
  qty: number;
  location: string;
  batch: string;
  serial: string;
  company: string;
  instructions: string;
  expiry?: Date;
  calibration?: Date;
  nextCalibration?: Date;
  elecTestDate?: Date;
  nextElecTestDate?: Date;
  annualReview?: Date;
  sixMonthReview?: Date;
  customValues: Record<string, string>;
}

const createEmptyRow = (): DraftRow => ({
  id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  name: "",
  qty: 1,
  location: "",
  batch: "",
  serial: "",
  company: "",
  instructions: "",
  customValues: {},
});

const DatePickerCell = ({ value, onChange, placeholder }: { value?: Date; onChange: (d?: Date) => void; placeholder: string }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        size="sm"
        className={cn("h-8 w-full min-w-[140px] justify-start text-left text-xs font-normal", !value && "text-muted-foreground")}
      >
        <CalendarIcon className="mr-1 h-3 w-3" />
        {value ? format(value, "dd MMM yy") : placeholder}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start">
      <Calendar mode="single" selected={value} onSelect={(d) => onChange(d)} initialFocus className="pointer-events-auto" />
    </PopoverContent>
  </Popover>
);

export function StockTable({ showAddRow, activeCategoryId, onCreateItem, savedItems = [], onUpdateItem, onDeleteItem, onEditItem, onRenewItem, selectedIds: selectedIdsProp, onToggleSelect: onToggleSelectProp, onToggleSelectAll: onToggleSelectAllProp, refillEnabled, getRefillStatus, onOrderRefill, onUpdateRefillStatus }: StockTableProps) {
  const { items: allInventoryItems } = useStock();
  const inventorySuggestions = useMemo(() => {
    const map = new Map<string, StockItem>();
    for (const it of allInventoryItems) {
      const key = it.name.trim().toLowerCase();
      if (key && !map.has(key)) map.set(key, it);
    }
    return Array.from(map.values());
  }, [allInventoryItems]);
  const datalistId = "stock-table-inventory-names";
  const [customColumns, setCustomColumns] = useState<{ id: string; name: string }[]>([]);
  const [isNamingColumn, setIsNamingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [instructionOptions, setInstructionOptions] = useState<string[]>(["Inside fridge", "Outside fridge"]);
  const [instructionSearch, setInstructionSearch] = useState<Record<string, string>>({});
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string>>(new Set());
  const controlled = !!selectedIdsProp;
  const selectedIds = selectedIdsProp ?? internalSelectedIds;
  const isExpired = (it: StockItem) => it.status === "expired" || (!!it.expiryDate && new Date(it.expiryDate).getTime() < Date.now());


  const allVisibleSelected = savedItems.length > 0 && savedItems.every(i => selectedIds.has(i.id));
  const toggleSelect = (id: string) => {
    if (controlled) { onToggleSelectProp?.(id); return; }
    setInternalSelectedIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const toggleSelectAll = () => {
    if (controlled) { onToggleSelectAllProp?.(); return; }
    setInternalSelectedIds(prev => {
      if (allVisibleSelected) {
        const n = new Set(prev);
        savedItems.forEach(i => n.delete(i.id));
        return n;
      }
      const n = new Set(prev);
      savedItems.forEach(i => n.add(i.id));
      return n;
    });
  };
  const handleBulkDelete = () => {
    if (!onDeleteItem) return;
    selectedIds.forEach(id => onDeleteItem(id));
    if (!controlled) setInternalSelectedIds(new Set());
  };

  const [draftRows, setDraftRows] = useState<DraftRow[]>(() =>
    showAddRow ? [createEmptyRow(), createEmptyRow(), createEmptyRow()] : []
  );

  const fieldConfig = activeCategoryId
    ? (CATEGORY_FIELD_CONFIG[activeCategoryId] || DEFAULT_FIELD_CONFIG)
    : DEFAULT_FIELD_CONFIG;

  // Column visibility
  const EXPIRING_COLUMNS = ['item', 'qty', 'batch', 'expiry', 'room'];
  const CALIBRATING_COLUMNS = ['item', 'serial', 'calibration', 'nextCal', 'annualReview', 'sixMonthReview', 'company', 'room'];
  const ELEC_TAGGING_COLUMNS = ['item', 'serial', 'elecTest', 'nextElecTest', 'annualReview', 'sixMonthReview', 'room'];
  const CATEGORY_COLUMNS: Record<string, string[]> = {
    'doctors-bag': EXPIRING_COLUMNS,
    'drug-cupboard': EXPIRING_COLUMNS,
    'instruments': EXPIRING_COLUMNS,
    'consumables': EXPIRING_COLUMNS,
    'medication-samples': EXPIRING_COLUMNS,
    'vaccines': EXPIRING_COLUMNS,
    'patient-owned': [...EXPIRING_COLUMNS, 'instructions'],
    'emergency-trolley': EXPIRING_COLUMNS,
    'vital-signs': CALIBRATING_COLUMNS,
    'diagnostic-measurement': CALIBRATING_COLUMNS,
    'sterilization-infection': CALIBRATING_COLUMNS,
    'therapeutic-treatment': CALIBRATING_COLUMNS,
    'electrical-tagging': ELEC_TAGGING_COLUMNS,
  };
  const visibleCols = new Set(activeCategoryId ? (CATEGORY_COLUMNS[activeCategoryId] || EXPIRING_COLUMNS) : EXPIRING_COLUMNS);
  const show = (col: string) => visibleCols.has(col);

  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;
    setCustomColumns(prev => [...prev, { id: `custom-${Date.now()}`, name: newColumnName.trim() }]);
    setNewColumnName("");
    setIsNamingColumn(false);
  };

  const handleRemoveColumn = (colId: string) => {
    setCustomColumns(prev => prev.filter(c => c.id !== colId));
  };

  const updateDraftRow = (rowId: string, updates: Partial<DraftRow>) => {
    setDraftRows(prev => prev.map(r => r.id === rowId ? { ...r, ...updates } : r));
  };

  const isRowValid = (row: DraftRow) => row.name.trim().length > 0 && (!fieldConfig.expiryRequired || !!row.expiry);

  const hasValidRows = draftRows.some(isRowValid);
  const filledCount = draftRows.filter(isRowValid).length;

  const handleSaveAll = () => {
    if (!activeCategoryId || !onCreateItem) return;
    const validRows = draftRows.filter(isRowValid);
    validRows.forEach(row => {
      onCreateItem({
        categoryId: activeCategoryId,
        name: row.name.trim(),
        description: "",
        quantity: row.qty,
        expiryDate: fieldConfig.showExpiry ? row.expiry : undefined,
        location: row.location || undefined,
        batchNumber: fieldConfig.showBatchNumber ? (row.batch.trim() || undefined) : undefined,
        calibrationDate: fieldConfig.showCalibration ? row.calibration : undefined,
        nextCalibrationDate: fieldConfig.showCalibration ? row.nextCalibration : undefined,
        electricalTestDate: row.elecTestDate,
        nextElectricalTestDate: row.nextElecTestDate,
        annualReviewDate: row.annualReview,
        sixMonthReviewDate: row.sixMonthReview,
        electricalTagNumber: row.serial.trim() || undefined,
        leadName: row.company.trim() || undefined,
      });
    });
    setDraftRows(prev => prev.map(r => isRowValid(r) ? createEmptyRow() : r));
  };

  const removeDraftRow = (rowId: string) => {
    setDraftRows(prev => prev.filter(r => r.id !== rowId));
  };

  const addNewDraftRow = () => {
    setDraftRows(prev => [...prev, createEmptyRow()]);
  };

  if (draftRows.length === 0 && savedItems.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No stock items found</p>
      </div>
    );
  }

  return (
    <Card className="border-border w-max min-w-full max-w-none">
      <datalist id={datalistId}>
        {inventorySuggestions.map((it) => (
          <option key={it.id} value={it.name} />
        ))}
      </datalist>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Add Stock Items
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!controlled && selectedIds.size > 0 && (
          <div className="flex items-center justify-end gap-2">
            <span className="text-xs text-muted-foreground">{selectedIds.size} selected</span>
            <Button size="sm" variant="destructive" className="h-8 gap-1.5" onClick={handleBulkDelete}>
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </Button>
          </div>
        )}
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>


            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-10">
                  {savedItems.length > 0 && (
                    <Checkbox
                      checked={allVisibleSelected}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  )}
                </TableHead>
                {show('item') && <TableHead className="font-semibold text-foreground">Item</TableHead>}
                {show('qty') && <TableHead className="font-semibold text-foreground text-center">Qty</TableHead>}
                {show('batch') && <TableHead className="font-semibold text-foreground">Batch #</TableHead>}
                {show('expiry') && <TableHead className="font-semibold text-foreground">Expiry Date</TableHead>}
                {show('instructions') && <TableHead className="font-semibold text-foreground">Instructions</TableHead>}
                {show('serial') && <TableHead className="font-semibold text-foreground">Serial #</TableHead>}
                {show('calibration') && <TableHead className="font-semibold text-foreground">Last Calibration</TableHead>}
                {show('nextCal') && <TableHead className="font-semibold text-foreground">Next Calibration</TableHead>}
                {show('annualReview') && <TableHead className="font-semibold text-foreground">Annual Review</TableHead>}
                {show('sixMonthReview') && <TableHead className="font-semibold text-foreground">6 Month Review</TableHead>}
                {show('company') && <TableHead className="font-semibold text-foreground">Company</TableHead>}
                {/* Room column removed — use Allocate action instead */}
                {show('elecTest') && <TableHead className="font-semibold text-foreground">Last Test Date</TableHead>}
                {show('nextElecTest') && <TableHead className="font-semibold text-foreground">Next Test Date</TableHead>}
                {customColumns.map(col => (
                  <TableHead key={col.id} className="font-semibold text-foreground">
                    <div className="flex items-center gap-1">
                      <span>{col.name}</span>
                      <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveColumn(col.id)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableHead>
                ))}
                <TableHead className="w-8 p-0">
                  {isNamingColumn ? (
                    <div className="flex items-center gap-1 px-1">
                      <Input
                        placeholder="Column name"
                        value={newColumnName}
                        onChange={e => setNewColumnName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddColumn(); } if (e.key === 'Escape') { setIsNamingColumn(false); setNewColumnName(""); } }}
                        onBlur={() => { if (newColumnName.trim()) handleAddColumn(); else setIsNamingColumn(false); }}
                        className="h-7 text-xs w-28"
                        autoFocus
                      />

                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleAddColumn} disabled={!newColumnName.trim()}>
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground" onClick={() => { setIsNamingColumn(false); setNewColumnName(""); }}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => setIsNamingColumn(true)}>
                            <Plus className="w-3.5 h-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Add column</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </TableHead>
                {refillEnabled && <TableHead className="font-semibold text-foreground">Refill</TableHead>}
                <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savedItems.map((item) => (
                <TableRow key={item.id} className={cn("hover:bg-muted/30 transition-colors bg-muted/10", isExpired(item) && "bg-destructive/5")}>
                  <TableCell className="w-10">
                    <Checkbox
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={() => toggleSelect(item.id)}
                      aria-label={`Select ${item.name}`}
                    />
                  </TableCell>
                  {show('item') && (
                    <TableCell className="text-xs font-medium">{item.name}</TableCell>
                  )}
                  {show('qty') && (
                    <TableCell className="text-center text-xs tabular-nums">{item.quantity}</TableCell>
                  )}
                  {show('batch') && (
                    <TableCell className="text-xs font-mono text-muted-foreground">{item.batchNumber || "—"}</TableCell>
                  )}
                  {show('expiry') && (
                    <TableCell className="text-xs">{item.expiryDate ? format(item.expiryDate, "dd MMM yy") : "—"}</TableCell>
                  )}
                  {show('instructions') && (
                    <TableCell className="text-xs text-muted-foreground">—</TableCell>
                  )}
                  {show('serial') && (
                    <TableCell className="text-xs font-mono text-muted-foreground">{item.electricalTagNumber || "—"}</TableCell>
                  )}
                  {show('calibration') && (
                    <TableCell className="text-xs">{item.calibrationDate ? format(item.calibrationDate, "dd MMM yy") : "—"}</TableCell>
                  )}
                  {show('nextCal') && (
                    <TableCell className="text-xs">{item.nextCalibrationDate ? format(item.nextCalibrationDate, "dd MMM yy") : "—"}</TableCell>
                  )}
                  {show('annualReview') && (
                    <TableCell className="text-xs">{item.annualReviewDate ? format(item.annualReviewDate, "dd MMM yy") : "—"}</TableCell>
                  )}
                  {show('sixMonthReview') && (
                    <TableCell className="text-xs">{item.sixMonthReviewDate ? format(item.sixMonthReviewDate, "dd MMM yy") : "—"}</TableCell>
                  )}
                  {show('company') && (
                    <TableCell className="text-xs text-muted-foreground">{item.leadName || "—"}</TableCell>
                  )}
                  {show('elecTest') && (
                    <TableCell className="text-xs">{item.electricalTestDate ? format(item.electricalTestDate, "dd MMM yy") : "—"}</TableCell>
                  )}
                  {show('nextElecTest') && (
                    <TableCell className="text-xs">{item.nextElectricalTestDate ? format(item.nextElectricalTestDate, "dd MMM yy") : "—"}</TableCell>
                  )}
                  {customColumns.map(col => (
                    <TableCell key={col.id} className="text-xs text-muted-foreground">—</TableCell>
                  ))}
                  <TableCell className="w-8" />
                  {refillEnabled && (
                    <TableCell className="text-xs">
                      {(() => {
                        const status = getRefillStatus?.(item);
                        if (!status) {
                          return (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1.5"
                              onClick={() => onOrderRefill?.(item)}
                            >
                              <ShoppingCart className="w-3 h-3" /> Order
                            </Button>
                          );
                        }
                        const meta = status === "order"
                          ? { label: "Order", cls: "bg-primary/10 text-primary border-primary/20", Icon: ShoppingCart, next: "pending" as const, nextLabel: "Mark pending" }
                          : status === "pending"
                          ? { label: "Pending", cls: "bg-warning/10 text-warning border-warning/20", Icon: Clock, next: "refilled" as const, nextLabel: "Mark refilled" }
                          : { label: "Refilled", cls: "bg-success/10 text-success border-success/20", Icon: PackageCheck, next: null, nextLabel: "" };
                        return (
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className={cn("text-[11px] gap-1", meta.cls)}>
                              <meta.Icon className="w-3 h-3" />
                              {meta.label}
                            </Badge>
                            {meta.next && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-1.5 text-[11px]"
                                onClick={() => onUpdateRefillStatus?.(item, meta.next!)}
                              >
                                {meta.nextLabel}
                              </Button>
                            )}
                          </div>
                        );
                      })()}
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <TooltipProvider delayDuration={100}>
                        {onEditItem && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditItem(item)}>
                                <Pencil className="w-4 h-4 text-muted-foreground" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>
                        )}
                        {onDeleteItem && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDeleteItem(item.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                        )}
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {draftRows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="w-10" />
                  {show('item') && (
                    <TableCell>
                      <Input
                        list={datalistId}
                        placeholder="Item name *"
                        value={row.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          const match = inventorySuggestions.find(
                            (it) => it.name.trim().toLowerCase() === name.trim().toLowerCase()
                          );
                          if (match) {
                            updateDraftRow(row.id, {
                              name,
                              location: row.location || match.location || "",
                            });
                          } else {
                            updateDraftRow(row.id, { name });
                          }
                        }}
                        className="h-8 text-xs min-w-[140px]"
                      />
                    </TableCell>

                  )}
                  {show('qty') && (
                    <TableCell className="text-center">
                      <Input
                        type="number"
                        min={1}
                        value={row.qty}
                        onChange={(e) => updateDraftRow(row.id, { qty: parseInt(e.target.value) || 1 })}
                        className="h-8 text-xs w-16 mx-auto text-center"
                      />
                    </TableCell>
                  )}
                  {show('batch') && (
                    <TableCell>
                      <Input
                        placeholder="Batch #"
                        value={row.batch}
                        onChange={(e) => updateDraftRow(row.id, { batch: e.target.value })}
                        className="h-8 text-xs font-mono min-w-[120px]"
                      />
                    </TableCell>
                  )}
                  {show('expiry') && (
                    <TableCell>
                      <DatePickerCell
                        value={row.expiry}
                        onChange={(d) => updateDraftRow(row.id, { expiry: d })}
                        placeholder={fieldConfig.expiryRequired ? "Expiry *" : "Expiry"}
                      />
                    </TableCell>
                  )}
                  {show('instructions') && (
                    <TableCell>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn("h-8 w-full justify-between text-left text-xs font-normal", !row.instructions && "text-muted-foreground")}
                          >
                            <span className="truncate">{row.instructions || "Select..."}</span>
                            <CalendarIcon className="ml-1 h-3 w-3 shrink-0 opacity-0" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-52 p-0 bg-popover z-50" align="start">
                          <div className="p-2 border-b border-border">
                            <Input
                              placeholder="Search or add..."
                              value={instructionSearch[row.id] || ""}
                              onChange={(e) => setInstructionSearch(prev => ({ ...prev, [row.id]: e.target.value }))}
                              className="h-7 text-xs"
                              autoFocus
                            />
                          </div>
                          <div className="max-h-40 overflow-y-auto p-1">
                            {instructionOptions
                              .filter(opt => opt.toLowerCase().includes((instructionSearch[row.id] || "").toLowerCase()))
                              .map(opt => (
                                <button
                                  key={opt}
                                  className={cn(
                                    "w-full text-left px-2 py-1.5 text-xs rounded-md hover:bg-accent transition-colors",
                                    row.instructions === opt && "bg-accent font-medium"
                                  )}
                                  onClick={() => {
                                    updateDraftRow(row.id, { instructions: opt });
                                    setInstructionSearch(prev => ({ ...prev, [row.id]: "" }));
                                  }}
                                >
                                  {opt}
                                </button>
                              ))}
                            {(instructionSearch[row.id] || "").trim() &&
                              !instructionOptions.some(o => o.toLowerCase() === (instructionSearch[row.id] || "").toLowerCase()) && (
                              <button
                                className="w-full text-left px-2 py-1.5 text-xs rounded-md hover:bg-accent text-primary font-medium flex items-center gap-1.5"
                                onClick={() => {
                                  const newOpt = (instructionSearch[row.id] || "").trim();
                                  setInstructionOptions(prev => [...prev, newOpt]);
                                  updateDraftRow(row.id, { instructions: newOpt });
                                  setInstructionSearch(prev => ({ ...prev, [row.id]: "" }));
                                }}
                              >
                                <Plus className="w-3 h-3" />
                                Add "{(instructionSearch[row.id] || "").trim()}"
                              </button>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  )}
                  {show('serial') && (
                    <TableCell>
                      <Input
                        placeholder="Serial #"
                        value={row.serial}
                        onChange={(e) => updateDraftRow(row.id, { serial: e.target.value })}
                        className="h-8 text-xs font-mono min-w-[120px]"
                      />
                    </TableCell>
                  )}
                  {show('calibration') && (
                    <TableCell>
                      <DatePickerCell value={row.calibration} onChange={(d) => updateDraftRow(row.id, { calibration: d })} placeholder="Last cal." />
                    </TableCell>
                  )}
                  {show('nextCal') && (
                    <TableCell>
                      <DatePickerCell value={row.nextCalibration} onChange={(d) => updateDraftRow(row.id, { nextCalibration: d })} placeholder="Next cal." />
                    </TableCell>
                  )}
                  {show('annualReview') && (
                    <TableCell>
                      <DatePickerCell value={row.annualReview} onChange={(d) => updateDraftRow(row.id, { annualReview: d })} placeholder="Annual" />
                    </TableCell>
                  )}
                  {show('sixMonthReview') && (
                    <TableCell>
                      <DatePickerCell value={row.sixMonthReview} onChange={(d) => updateDraftRow(row.id, { sixMonthReview: d })} placeholder="6 month" />
                    </TableCell>
                  )}
                  {show('company') && (
                    <TableCell>
                      <Input
                        placeholder="Company"
                        value={row.company}
                        onChange={(e) => updateDraftRow(row.id, { company: e.target.value })}
                        className="h-8 text-xs min-w-[140px]"
                      />
                    </TableCell>
                  )}
                  {/* Room cell removed — handled by Allocate popover in Actions */}
                  {show('elecTest') && (
                    <TableCell>
                      <DatePickerCell value={row.elecTestDate} onChange={(d) => updateDraftRow(row.id, { elecTestDate: d })} placeholder="Last test" />
                    </TableCell>
                  )}
                  {show('nextElecTest') && (
                    <TableCell>
                      <DatePickerCell value={row.nextElecTestDate} onChange={(d) => updateDraftRow(row.id, { nextElecTestDate: d })} placeholder="Next test" />
                    </TableCell>
                  )}
                  {customColumns.map(col => (
                    <TableCell key={col.id}>
                      <Input
                        placeholder="—"
                        value={row.customValues[col.id] || ""}
                        onChange={e => updateDraftRow(row.id, { customValues: { ...row.customValues, [col.id]: e.target.value } })}
                        className="h-8 text-xs min-w-[140px]"
                      />
                    </TableCell>
                  ))}
                  <TableCell className="w-8" />
                  {refillEnabled && <TableCell />}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!isRowValid(row)}>
                              <Pencil className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {draftRows.length > 1 && (
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeDraftRow(row.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Add Row Button */}
          <div className="border-t border-border bg-muted/30 px-4 py-2 flex justify-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addNewDraftRow}
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Row
            </Button>
          </div>
        </div>

        {/* Footer */}
        {showAddRow && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              {filledCount} item{filledCount !== 1 ? "s" : ""} added
            </span>
            <Button onClick={handleSaveAll} disabled={!hasValidRows} size="sm">
              Save
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

