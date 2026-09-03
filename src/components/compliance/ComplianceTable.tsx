import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Pencil, Trash2, User, ShieldCheck, RefreshCw, Plus, Calendar as CalendarIcon, X, Sparkles, Upload, Eye, Loader2, CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { AIStockUploadDialog } from "@/components/stock/AIStockUploadDialog";
import { ComplianceDocumentDialog } from "@/components/compliance/ComplianceDocumentDialog";
import { ComplianceItem, ComplianceCategoryExtended } from "@/types/compliance";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { mockStaffMembers } from "@/data/mockStaff";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface ComplianceTableProps {
  items: ComplianceItem[];
  categories: ComplianceCategoryExtended[];
  onUpdateItem?: (itemId: string, updates: Partial<ComplianceItem>) => void;
  onDeleteItem?: (itemId: string) => void;
  onEditItem?: (item: ComplianceItem) => void;
  onRenewItem?: (item: ComplianceItem) => void;
  
  showAddRow?: boolean;
  activeCategoryId?: string;
  onCreateItem?: (item: Omit<ComplianceItem, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
}

interface DraftRow {
  id: string;
  teamMember: string;
  itemName: string;
  currentDate?: Date;
  expiryDate?: Date;
  customValues: Record<string, string>;
  document?: { name: string; type: string; url: string; status: 'uploading' | 'success' | 'error'; progress: number; error?: string };
}

const createEmptyRow = (): DraftRow => ({
  id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  teamMember: "",
  itemName: "",
  currentDate: undefined,
  expiryDate: undefined,
  customValues: {},
  document: undefined,
});

const DatePickerCell = ({ value, onChange, placeholder }: { value?: Date; onChange: (d?: Date) => void; placeholder: string }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        size="sm"
        className={cn("h-8 w-full justify-start text-left text-xs font-normal", !value && "text-muted-foreground")}
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

export function ComplianceTable({
  items,
  categories,
  onUpdateItem,
  onDeleteItem,
  onEditItem,
  onRenewItem,
  
  showAddRow,
  activeCategoryId,
  onCreateItem,
}: ComplianceTableProps) {
  const [uploadDialogRowId, setUploadDialogRowId] = useState<string | null>(null);
  const [draftRows, setDraftRows] = useState<DraftRow[]>(() =>
    showAddRow ? [createEmptyRow(), createEmptyRow(), createEmptyRow()] : []
  );

  // Custom columns
  const [customColumns, setCustomColumns] = useState<{ id: string; name: string }[]>([]);
  const [isNamingColumn, setIsNamingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;
    setCustomColumns(prev => [...prev, { id: `custom-${Date.now()}`, name: newColumnName.trim() }]);
    setNewColumnName("");
    setIsNamingColumn(false);
  };

  const handleRemoveColumn = (colId: string) => {
    setCustomColumns(prev => prev.filter(c => c.id !== colId));
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || "";
  };


  const updateDraftRow = (rowId: string, updates: Partial<DraftRow>) => {
    setDraftRows(prev => prev.map(r => r.id === rowId ? { ...r, ...updates } : r));
  };

  const startUpload = (rowId: string, file: File) => {
    const url = URL.createObjectURL(file);
    updateDraftRow(rowId, {
      document: { name: file.name, type: file.type, url, status: 'uploading', progress: 0 },
    });
    const shouldFail = file.size > 20 * 1024 * 1024;
    let pct = 0;
    const interval = window.setInterval(() => {
      pct += Math.random() * 22 + 8;
      if (pct >= 100) {
        window.clearInterval(interval);
        setDraftRows(prev => prev.map(r => {
          if (r.id !== rowId || !r.document) return r;
          if (shouldFail) {
            toast.error(`Failed to upload ${file.name}`);
            return { ...r, document: { ...r.document, status: 'error', progress: 100, error: 'File too large (max 20MB)' } };
          }
          toast.success(`Uploaded ${file.name}`);
          return { ...r, document: { ...r.document, status: 'success', progress: 100 } };
        }));
      } else {
        setDraftRows(prev => prev.map(r => r.id === rowId && r.document
          ? { ...r, document: { ...r.document, progress: Math.min(99, Math.round(pct)) } }
          : r
        ));
      }
    }, 220);
  };


  const isRowValid = (row: DraftRow) => row.teamMember.trim().length > 0 && !!row.expiryDate;

  const hasValidRows = draftRows.some(isRowValid);

  const handleSaveAll = () => {
    if (!activeCategoryId || !onCreateItem) return;
    const validRows = draftRows.filter(isRowValid);
    validRows.forEach(row => {
      onCreateItem({
        categoryId: activeCategoryId,
        categoryName: getCategoryName(activeCategoryId),
        title: row.teamMember.trim(),
        details: "",
        level: 'user',
        assignee: row.teamMember.trim(),
        expiryDate: row.expiryDate!,
        reminder: { enabled: false, type: 'email', daysBefore: 30 },
      });
    });
    // Reset saved rows to empty, keep unsaved ones
    setDraftRows(prev => prev.map(r => isRowValid(r) ? createEmptyRow() : r));
  };

  const removeDraftRow = (rowId: string) => {
    setDraftRows(prev => prev.filter(r => r.id !== rowId));
  };

  const addNewDraftRow = () => {
    setDraftRows(prev => [...prev, createEmptyRow()]);
  };

  const [extraMembers, setExtraMembers] = useState<string[]>([]);
  const [addMemberRowId, setAddMemberRowId] = useState<string | null>(null);
  const [newMemberName, setNewMemberName] = useState("");
  const staffMembers = [...mockStaffMembers.map(s => `${s.firstName} ${s.lastName}`), ...extraMembers];

  const handleConfirmAddMember = () => {
    const name = newMemberName.trim();
    if (!name || !addMemberRowId) return;
    if (!staffMembers.includes(name)) {
      setExtraMembers(prev => [...prev, name]);
    }
    updateDraftRow(addMemberRowId, { teamMember: name });
    setNewMemberName("");
    setAddMemberRowId(null);
    toast.success(`Added ${name}`);
  };

  // Determine if this is a practice-level category (e.g. Safety) — use "Item" instead of "Team Member"
  const activeCategory = categories.find(c => c.id === activeCategoryId);
  const isPracticeLevel = activeCategory?.type === 'practice';
  const isTraining = activeCategoryId === 'training';
  const firstColumnLabel = isPracticeLevel ? 'Item' : 'Team Member';

  const filledCount = draftRows.filter(isRowValid).length;

  if (draftRows.length === 0 && items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No compliance items found</p>
      </div>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Add Compliance Items
          </CardTitle>
          <AIStockUploadDialog onItemsDetected={(detectedItems) => {
            const newRows: DraftRow[] = detectedItems.map(item => ({
              ...createEmptyRow(),
              teamMember: item.name,
              expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
            }));
            setDraftRows(prev => [...newRows, ...prev]);
          }} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold text-foreground">{firstColumnLabel}</TableHead>
              {isTraining && <TableHead className="font-semibold text-foreground">Item</TableHead>}
              <TableHead className="font-semibold text-foreground">Current Date</TableHead>
              <TableHead className="font-semibold text-foreground">Expiry Date</TableHead>
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
                      onKeyDown={e => { if (e.key === 'Enter') handleAddColumn(); if (e.key === 'Escape') { setIsNamingColumn(false); setNewColumnName(""); } }}
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
              <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Rows */}
            {draftRows.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/30 transition-colors">
                <TableCell>
                  {isPracticeLevel ? (
                    <Input
                      placeholder="Enter item name"
                      value={row.teamMember}
                      onChange={(e) => updateDraftRow(row.id, { teamMember: e.target.value })}
                      className="h-8 text-xs"
                    />
                  ) : (
                    <Select value={row.teamMember || "__none__"} onValueChange={(v) => {
                      if (v === "__add__") {
                        setNewMemberName("");
                        setAddMemberRowId(row.id);
                        return;
                      }
                      updateDraftRow(row.id, { teamMember: v === "__none__" ? "" : v });
                    }}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__" disabled>
                          <span className="text-muted-foreground">Select member</span>
                        </SelectItem>
                        {staffMembers.map(name => (
                          <SelectItem key={name} value={name}>
                            <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> {name}</span>
                          </SelectItem>
                        ))}
                        <div className="border-t my-1" />
                        <SelectItem value="__add__" className="text-primary focus:text-primary">
                          <span className="flex items-center gap-1.5 font-medium"><Plus className="w-3 h-3" /> Add new member</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                {isTraining && (
                  <TableCell>
                    <Input
                      placeholder="Enter item"
                      value={row.itemName}
                      onChange={(e) => updateDraftRow(row.id, { itemName: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </TableCell>
                )}
                <TableCell>
                  <DatePickerCell
                    value={row.currentDate}
                    onChange={(d) => updateDraftRow(row.id, { currentDate: d })}
                    placeholder="Current date"
                  />
                </TableCell>
                <TableCell>
                  <DatePickerCell
                    value={row.expiryDate}
                    onChange={(d) => updateDraftRow(row.id, { expiryDate: d })}
                    placeholder="Expiry date"
                  />
                </TableCell>
                {customColumns.map(col => (
                  <TableCell key={col.id}>
                    <Input
                      placeholder="—"
                      value={row.customValues[col.id] || ""}
                      onChange={(e) => updateDraftRow(row.id, {
                        customValues: { ...row.customValues, [col.id]: e.target.value }
                      })}
                      className="h-8 text-sm"
                    />
                  </TableCell>
                ))}
                <TableCell className="w-8" />
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-8 w-8 relative",
                              row.document?.status === 'success' && "text-emerald-600",
                              row.document?.status === 'error' && "text-destructive",
                              row.document?.status === 'uploading' && "text-primary",
                            )}
                            onClick={() => setUploadDialogRowId(row.id)}
                          >
                            {row.document?.status === 'uploading' ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : row.document?.status === 'success' ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : row.document?.status === 'error' ? (
                              <AlertCircle className="w-4 h-4" />
                            ) : (
                              <Upload className="w-4 h-4 text-muted-foreground" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {row.document?.status === 'uploading' && `Uploading… ${row.document.progress}%`}
                          {row.document?.status === 'success' && `View ${row.document.name}`}
                          {row.document?.status === 'error' && (row.document.error || 'Upload failed')}
                          {!row.document && 'Upload document'}
                        </TooltipContent>
                      </Tooltip>


                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                            if (isRowValid(row)) onEditItem?.({
                              id: row.id, categoryId: activeCategoryId || '', categoryName: '', title: row.teamMember,
                              details: '', level: 'user', assignee: row.teamMember, expiryDate: row.expiryDate!,
                              reminder: { enabled: false, type: 'email', daysBefore: 30 }, status: 'valid',
                              createdAt: row.currentDate || new Date(), updatedAt: new Date(),
                            });
                          }} disabled={!isRowValid(row)}>
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                            if (isRowValid(row)) onRenewItem?.({
                              id: row.id, categoryId: activeCategoryId || '', categoryName: '', title: row.teamMember,
                              details: '', level: 'user', assignee: row.teamMember, expiryDate: row.expiryDate!,
                              reminder: { enabled: false, type: 'email', daysBefore: 30 }, status: 'valid',
                              createdAt: row.currentDate || new Date(), updatedAt: new Date(),
                            });
                          }} disabled={!isRowValid(row)}>
                            <RefreshCw className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Renew</TooltipContent>
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

      {(() => {
        const activeRow = draftRows.find(r => r.id === uploadDialogRowId);
        if (!uploadDialogRowId) return null;
        return (
          <ComplianceDocumentDialog
            open={!!uploadDialogRowId}
            onOpenChange={(o) => { if (!o) setUploadDialogRowId(null); }}
            document={activeRow?.document}
            onFileSelected={(file) => startUpload(uploadDialogRowId, file)}
            onDelete={() => {
              updateDraftRow(uploadDialogRowId, { document: undefined });
              toast.success("Document removed");
              setUploadDialogRowId(null);
            }}
            onCancel={() => {
              updateDraftRow(uploadDialogRowId, { document: undefined });
            }}
          />
        );
      })()}

      <Dialog open={!!addMemberRowId} onOpenChange={(o) => { if (!o) { setAddMemberRowId(null); setNewMemberName(""); } }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add new team member</DialogTitle>
            <DialogDescription>
              Quickly add a team member for this compliance item.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="new-member-name">Full name</Label>
            <Input
              id="new-member-name"
              autoFocus
              placeholder="e.g. Jane Smith"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmAddMember(); }}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setAddMemberRowId(null); setNewMemberName(""); }}>Cancel</Button>
            <Button onClick={handleConfirmAddMember} disabled={!newMemberName.trim()}>Add member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

