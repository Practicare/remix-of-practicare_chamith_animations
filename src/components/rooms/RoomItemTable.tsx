import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, DoorOpen, Pencil, Trash2, X } from "lucide-react";
import { InstrumentCategory, INSTRUMENT_CATEGORIES } from "@/types/rooms";


interface RoomItemTableProps {
  onCreateItem: (data: { category: InstrumentCategory; name: string; instrumentNumber: string; notes?: string }) => void;
  onEditItem?: (instrument: any) => void;
  onDeleteItem?: (id: string) => void;
}

interface DraftRow {
  id: string;
  name: string;
  category: string;
  instrumentNumber: string;
  notes: string;
}

const createEmptyRow = (): DraftRow => ({
  id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  name: "",
  category: "",
  instrumentNumber: "",
  notes: "",
});

export function RoomItemTable({ onCreateItem, onEditItem, onDeleteItem }: RoomItemTableProps) {
  const [draftRows, setDraftRows] = useState<DraftRow[]>([createEmptyRow(), createEmptyRow(), createEmptyRow()]);
  const [customColumns, setCustomColumns] = useState<{ id: string; name: string }[]>([]);
  const [isNamingColumn, setIsNamingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  const updateDraftRow = (rowId: string, updates: Partial<DraftRow>) => {
    setDraftRows(prev => prev.map(r => r.id === rowId ? { ...r, ...updates } : r));
  };

  const isRowValid = (row: DraftRow) => row.name.trim().length > 0 && row.category.length > 0;
  const hasValidRows = draftRows.some(isRowValid);
  const filledCount = draftRows.filter(isRowValid).length;

  const handleSaveAll = () => {
    const validRows = draftRows.filter(isRowValid);
    validRows.forEach(row => {
      onCreateItem({
        category: row.category as InstrumentCategory,
        name: row.name.trim(),
        instrumentNumber: row.instrumentNumber.trim(),
        notes: row.notes.trim() || undefined,
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

  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;
    setCustomColumns(prev => [...prev, { id: `custom-${Date.now()}`, name: newColumnName.trim() }]);
    setNewColumnName("");
    setIsNamingColumn(false);
  };

  const handleRemoveColumn = (colId: string) => {
    setCustomColumns(prev => prev.filter(c => c.id !== colId));
  };

  if (draftRows.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <DoorOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No items to add</p>
      </div>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-primary" />
            Add Room Items
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold text-foreground">Item Name</TableHead>
                <TableHead className="font-semibold text-foreground">Category</TableHead>
                <TableHead className="font-semibold text-foreground">Item #</TableHead>
                <TableHead className="font-semibold text-foreground">Notes</TableHead>
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
              {draftRows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <Input
                      placeholder="Item name *"
                      value={row.name}
                      onChange={(e) => updateDraftRow(row.id, { name: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </TableCell>
                  <TableCell>
                    <Select value={row.category || "__none__"} onValueChange={(v) => updateDraftRow(row.id, { category: v === "__none__" ? "" : v })}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Category *" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="__none__" disabled>
                          <span className="text-muted-foreground">Select</span>
                        </SelectItem>
                        {INSTRUMENT_CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Item #"
                      value={row.instrumentNumber}
                      onChange={(e) => updateDraftRow(row.id, { instrumentNumber: e.target.value })}
                      className="h-8 text-xs font-mono"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Notes"
                      value={row.notes}
                      onChange={(e) => updateDraftRow(row.id, { notes: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </TableCell>
                  {customColumns.map(col => (
                    <TableCell key={col.id}>
                      <Input placeholder="—" className="h-8 text-xs" />
                    </TableCell>
                  ))}
                  <TableCell className="w-8" />
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
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            {filledCount} item{filledCount !== 1 ? "s" : ""} ready
          </span>
          <Button onClick={handleSaveAll} disabled={!hasValidRows} size="sm">
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
