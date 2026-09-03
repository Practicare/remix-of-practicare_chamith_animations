import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Plus,
  Calendar as CalendarIcon,
  X,
  Trash2,
  Upload,
  FileSpreadsheet,
  FileText,
  Camera,
  Sparkles,
  CheckCircle,
  Table as TableIcon,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  StockItem,
  StockCategory,
  VaccineFundingType,
  CATEGORY_FIELD_CONFIG,
  DEFAULT_FIELD_CONFIG,
  CategoryFieldConfig,
} from "@/types/stock";
import { StockLocation } from "@/components/stock/LocationManager";
import { mockTeamMembers } from "@/data/mockTeamMembers";
import { useRooms } from "@/contexts/RoomsContext";
import { AIPromptInput } from "@/components/ui/AIPromptInput";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { DoorOpen } from "lucide-react";

interface RoomAssignment {
  roomId: string;
  roomName: string;
  quantity: number;
}

interface DraftRow {
  id: string;
  name: string;
  description: string;
  quantity: number;
  location: string;
  batchNumber: string;
  expiryDate?: Date;
  calibrationDate?: Date;
  nextCalibrationDate?: Date;
  vaccineFundingType: VaccineFundingType | "";
  leadId: string;
  leadName: string;
  roomAssignments: RoomAssignment[];
}

interface DetectedItem {
  name: string;
  quantity: number;
  category: string;
  expiryDate?: string;
  batchNumber?: string;
}

interface AddStockItemsPanelProps {
  subcategoryId: string;
  subcategoryName: string;
  locations: StockLocation[];
  onCreateItems: (items: Omit<StockItem, "id" | "createdAt" | "updatedAt" | "status">[]) => void;
  onItemsDetected: (items: DetectedItem[]) => void;
  onClose: () => void;
}

const createEmptyRow = (): DraftRow => ({
  id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  name: "",
  description: "",
  quantity: 1,
  location: "",
  batchNumber: "",
  expiryDate: undefined,
  calibrationDate: undefined,
  nextCalibrationDate: undefined,
  vaccineFundingType: "",
  leadId: "",
  leadName: "",
  roomAssignments: [],
});

export function AddStockItemsPanel({
  subcategoryId,
  subcategoryName,
  locations,
  onCreateItems,
  onItemsDetected,
  onClose,
}: AddStockItemsPanelProps) {
  const [method, setMethod] = useState<"manual" | "csv" | "pdf" | "ai">("manual");
  const [rows, setRows] = useState<DraftRow[]>([createEmptyRow()]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const { rooms } = useRooms();

  const fieldConfig: CategoryFieldConfig =
    CATEGORY_FIELD_CONFIG[subcategoryId] || DEFAULT_FIELD_CONFIG;

  // --- Manual table helpers ---
  const addRow = () => setRows((prev) => [...prev, createEmptyRow()]);

  const removeRow = (id: string) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRow = (id: string, field: keyof DraftRow, value: any) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (field === "leadId") {
          const member = mockTeamMembers.find((m) => m.id === value);
          return { ...r, leadId: value, leadName: member?.name || "" };
        }
        return { ...r, [field]: value };
      })
    );
  };

  const isRowValid = (row: DraftRow) => {
    if (!row.name.trim()) return false;
    if (fieldConfig.expiryRequired && !row.expiryDate) return false;
    return true;
  };

  const validRows = rows.filter(isRowValid);

  const updateRoomAssignment = (rowId: string, idx: number, patch: Partial<RoomAssignment>) => {
    setRows(prev => prev.map(r => {
      if (r.id !== rowId) return r;
      const next = [...r.roomAssignments];
      next[idx] = { ...next[idx], ...patch };
      return { ...r, roomAssignments: next };
    }));
  };
  const addRoomAssignment = (rowId: string) => {
    setRows(prev => prev.map(r => r.id === rowId
      ? { ...r, roomAssignments: [...r.roomAssignments, { roomId: "", roomName: "", quantity: 1 }] }
      : r));
  };
  const removeRoomAssignment = (rowId: string, idx: number) => {
    setRows(prev => prev.map(r => r.id === rowId
      ? { ...r, roomAssignments: r.roomAssignments.filter((_, i) => i !== idx) }
      : r));
  };
  const pickRoom = (rowId: string, idx: number, roomId: string) => {
    const r = rooms.find(x => x.id === roomId);
    updateRoomAssignment(rowId, idx, { roomId, roomName: r?.roomName || "" });
  };

  const handleSubmitManual = () => {
    if (validRows.length === 0) return;
    const items: Omit<StockItem, "id" | "createdAt" | "updatedAt" | "status">[] = [];
    validRows.forEach((row) => {
      const base = {
        categoryId: subcategoryId,
        name: row.name.trim(),
        description: row.description.trim(),
        expiryDate: fieldConfig.showExpiry ? row.expiryDate : undefined,
        batchNumber: fieldConfig.showBatchNumber ? (row.batchNumber || undefined) : undefined,
        calibrationDate: fieldConfig.showCalibration ? row.calibrationDate : undefined,
        nextCalibrationDate: fieldConfig.showCalibration ? row.nextCalibrationDate : undefined,
        vaccineFundingType: fieldConfig.showVaccineFunding
          ? (row.vaccineFundingType || undefined)
          : undefined,
        leadId: row.leadId || undefined,
        leadName: row.leadName || undefined,
      };
      const validAssignments = row.roomAssignments.filter(a => a.roomId && a.quantity > 0);
      if (validAssignments.length > 0) {
        // One stock item per assigned room
        validAssignments.forEach((a) => {
          items.push({ ...base, quantity: a.quantity, location: a.roomName });
        });
        // Remainder (if any) stays at original location
        const assignedTotal = validAssignments.reduce((s, a) => s + a.quantity, 0);
        const remainder = row.quantity - assignedTotal;
        if (remainder > 0) {
          items.push({ ...base, quantity: remainder, location: row.location || undefined });
        }
      } else {
        items.push({ ...base, quantity: row.quantity, location: row.location || undefined });
      }
    });
    onCreateItems(items);
    toast({
      title: "Items Added",
      description: `${items.length} item${items.length > 1 ? "s" : ""} added to ${subcategoryName}.`,
    });
    setRows([createEmptyRow()]);
  };

  // --- CSV upload ---
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length < 2) {
        toast({ title: "Invalid CSV", description: "CSV must have a header row and at least one data row.", variant: "destructive" });
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const nameIdx = headers.findIndex((h) => h.includes("name") || h.includes("item"));
      const qtyIdx = headers.findIndex((h) => h.includes("qty") || h.includes("quantity"));
      const batchIdx = headers.findIndex((h) => h.includes("batch") || h.includes("serial"));
      const locationIdx = headers.findIndex((h) => h.includes("location") || h.includes("room"));
      const descIdx = headers.findIndex((h) => h.includes("desc"));

      const parsed: DraftRow[] = lines.slice(1).map((line) => {
        const cols = line.split(",").map((c) => c.trim());
        return {
          ...createEmptyRow(),
          name: nameIdx >= 0 ? cols[nameIdx] || "" : "",
          quantity: qtyIdx >= 0 ? parseInt(cols[qtyIdx]) || 1 : 1,
          batchNumber: batchIdx >= 0 ? cols[batchIdx] || "" : "",
          location: locationIdx >= 0 ? cols[locationIdx] || "" : "",
          description: descIdx >= 0 ? cols[descIdx] || "" : "",
        };
      }).filter((r) => r.name.trim());

      if (parsed.length === 0) {
        toast({ title: "No Items Found", description: "Could not parse any items from the CSV.", variant: "destructive" });
        return;
      }

      setRows(parsed);
      setMethod("manual"); // Switch to manual so user can review/edit
      toast({ title: "CSV Imported", description: `${parsed.length} items loaded for review. Edit and submit when ready.` });
    };
    reader.readAsText(file);
    if (csvInputRef.current) csvInputRef.current.value = "";
  };

  // --- PDF upload (mock) ---
  const handlePDFUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    // Simulate AI extraction from PDF
    setTimeout(() => {
      const mockRows: DraftRow[] = [
        { ...createEmptyRow(), name: "Extracted Item 1", quantity: 5, batchNumber: "EXT-001" },
        { ...createEmptyRow(), name: "Extracted Item 2", quantity: 10, batchNumber: "EXT-002" },
        { ...createEmptyRow(), name: "Extracted Item 3", quantity: 3 },
      ];
      setRows(mockRows);
      setIsAnalyzing(false);
      setMethod("manual");
      toast({ title: "PDF Processed", description: "3 items extracted. Review and edit before submitting." });
    }, 2500);

    if (pdfInputRef.current) pdfInputRef.current.value = "";
  };

  // --- AI photo scan ---
  const handleAISubmit = async (prompt: string, files?: File[]) => {
    setIsAnalyzing(true);
    await new Promise((r) => setTimeout(r, 2500));

    const mockDetected: DetectedItem[] = [
      { name: "Paracetamol 500mg", quantity: 50, category: subcategoryId, expiryDate: "2025-06-15", batchNumber: "PAR2024001" },
      { name: "Bandages (Sterile)", quantity: 20, category: subcategoryId, expiryDate: "2026-01-20" },
    ];

    setIsAnalyzing(false);
    setAnalysisComplete(true);
    onItemsDetected(mockDetected);

    setTimeout(() => {
      setAnalysisComplete(false);
    }, 2000);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 animate-in slide-in-from-top-2 duration-200 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-base">Add Items to {subcategoryName}</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            Choose how to add items: enter manually, upload a CSV/PDF, or use AI to scan a photo.
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Method selector */}
      <SegmentedControl
        options={[
          { id: "manual" as const, label: "Manual Entry", icon: TableIcon },
          { id: "csv" as const, label: "CSV Upload", icon: FileSpreadsheet },
          { id: "pdf" as const, label: "PDF Upload", icon: FileText },
          { id: "ai" as const, label: "AI Photo Scan", icon: Camera },
        ]}
        value={method}
        onChange={(val) => setMethod(val)}
        size="sm"
      />

      {/* ===================== MANUAL TABLE ENTRY ===================== */}
      {method === "manual" && (
        <ManualEntryTable
          rows={rows}
          validRowsCount={validRows.length}
          onUpdate={updateRow}
          onAddRow={addRow}
          onRemoveRow={removeRow}
          onSubmit={handleSubmitManual}
        />
      )}

      {/* ===================== CSV UPLOAD ===================== */}
      {method === "csv" && (
        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
            onClick={() => csvInputRef.current?.click()}
          >
            <FileSpreadsheet className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium">Click to upload a CSV file</p>
            <p className="text-xs text-muted-foreground mt-1">
              Include columns: Name, Quantity, Batch/Serial, Location, Description
            </p>
          </div>
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleCSVUpload}
          />
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[12px] font-medium mb-1">CSV Template</p>
            <code className="text-[11px] text-muted-foreground block">
              Name, Quantity, Batch Number, Location, Description
              <br />
              Paracetamol 500mg, 50, PAR-001, Treatment Room 1, Pain relief tablets
            </code>
          </div>
        </div>
      )}

      {/* ===================== PDF UPLOAD ===================== */}
      {method === "pdf" && (
        <div className="space-y-4">
          {isAnalyzing ? (
            <div className="flex items-center justify-center gap-3 p-8 rounded-xl bg-primary/5 border border-primary/20">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <p className="text-sm font-medium">Analysing PDF document...</p>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
              onClick={() => pdfInputRef.current?.click()}
            >
              <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium">Click to upload a PDF document</p>
              <p className="text-xs text-muted-foreground mt-1">
                AI will extract stock items from invoices, delivery notes, or order forms
              </p>
            </div>
          )}
          <input
            ref={pdfInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handlePDFUpload}
          />
        </div>
      )}

      {/* ===================== AI PHOTO SCAN ===================== */}
      {method === "ai" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">AI Stock Scanner</p>
              <p className="text-xs text-muted-foreground">Describe items or upload a photo to add stock</p>
            </div>
          </div>

          <AIPromptInput
            placeholder={`Describe items for ${subcategoryName}... e.g., '50 boxes of Paracetamol 500mg, expires June 2025'`}
            onSubmit={handleAISubmit}
            isProcessing={isAnalyzing}
            showAttachments={true}
            acceptedFileTypes="image/*"
            maxFiles={3}
          />

          {isAnalyzing && (
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <p className="text-sm font-medium">Analyzing your request...</p>
            </div>
          )}

          {analysisComplete && (
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <p className="text-sm font-medium">Items detected and added to inventory!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ===================== Inline Manual Entry Table =====================
import { PaginationBar } from "@/components/ui/PaginationBar";

const PAGE_SIZE = 15;

interface ManualEntryTableProps {
  rows: DraftRow[];
  validRowsCount: number;
  onUpdate: (id: string, field: keyof DraftRow, value: any) => void;
  onAddRow: () => void;
  onRemoveRow: (id: string) => void;
  onSubmit: () => void;
}

function ManualEntryTable({
  rows,
  validRowsCount,
  onUpdate,
  onAddRow,
  onRemoveRow,
  onSubmit,
}: ManualEntryTableProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = rows.slice(start, start + PAGE_SIZE);

  const handleAddRow = () => {
    onAddRow();
    const newTotal = rows.length + 1;
    setPage(Math.ceil(newTotal / PAGE_SIZE));
  };

  return (
    <div className="space-y-3">
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold text-foreground w-[44px] text-center">#</TableHead>
              <TableHead className="font-semibold text-foreground">Item *</TableHead>
              <TableHead className="font-semibold text-foreground text-center w-[90px]">Quantity</TableHead>
              <TableHead className="font-semibold text-foreground w-[160px]">Batch</TableHead>
              <TableHead className="font-semibold text-foreground w-[160px]">Expiry Date</TableHead>
              <TableHead className="w-[44px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((row, idx) => (
              <TableRow key={row.id} className="hover:bg-muted/30">
                <TableCell className="p-1.5 text-center text-xs text-muted-foreground tabular-nums">
                  {start + idx + 1}
                </TableCell>
                <TableCell className="p-1.5">
                  <Input
                    placeholder="Item name"
                    value={row.name}
                    onChange={(e) => onUpdate(row.id, "name", e.target.value)}
                    className="h-8 text-sm"
                  />
                </TableCell>
                <TableCell className="p-1.5">
                  <Input
                    type="number"
                    min={1}
                    value={row.quantity}
                    onChange={(e) => onUpdate(row.id, "quantity", parseInt(e.target.value) || 1)}
                    className="h-8 text-sm text-center"
                  />
                </TableCell>
                <TableCell className="p-1.5">
                  <Input
                    placeholder="Batch #"
                    value={row.batchNumber}
                    onChange={(e) => onUpdate(row.id, "batchNumber", e.target.value)}
                    className="h-8 text-sm font-mono"
                  />
                </TableCell>
                <TableCell className="p-1.5">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-8 w-full justify-start text-left text-sm font-normal",
                          !row.expiryDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                        {row.expiryDate ? format(row.expiryDate, "dd MMM yy") : "Select"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={row.expiryDate}
                        onSelect={(d) => onUpdate(row.id, "expiryDate", d)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell className="p-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemoveRow(row.id)}
                    disabled={rows.length <= 1}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="border-t border-border bg-muted/30 px-4 py-2 flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddRow}
            className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Row
          </Button>
        </div>
      </div>

      <PaginationBar
        page={currentPage}
        totalPages={totalPages}
        total={rows.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      <div className="flex items-center justify-between">
        <span className="text-[12px] text-muted-foreground">
          {validRowsCount} of {rows.length} row{rows.length !== 1 ? "s" : ""} valid
        </span>
        <Button size="sm" onClick={onSubmit} disabled={validRowsCount === 0}>
          Add {validRowsCount} Item{validRowsCount !== 1 ? "s" : ""}
        </Button>
      </div>
    </div>
  );
}
