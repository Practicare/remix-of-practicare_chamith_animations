import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Package, Trash2, Calendar as CalendarIcon, Search } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { StockItem, StockStatus } from "@/types/stock";

interface DraftRow {
  id: string;
  name: string;
  itemNumber: string;
  batchNumber: string;
  expiryDate?: Date;
  quantity: number;
}

const createEmptyRow = (): DraftRow => ({
  id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  name: "",
  itemNumber: "",
  batchNumber: "",
  expiryDate: undefined,
  quantity: 1,
});

function computeStatus(expiryDate?: Date): StockStatus {
  if (!expiryDate) return "valid";
  const days = differenceInDays(expiryDate, new Date());
  if (days < 0) return "expired";
  if (days <= 60) return "expiring";
  return "valid";
}

interface Props {
  roomName: string;
  existingStockNames: string[];
  onCreate: (items: Omit<StockItem, "id" | "createdAt" | "updatedAt">[]) => void;
}

export function RoomStockAddTable({ roomName, existingStockNames, onCreate }: Props) {
  const [rows, setRows] = useState<DraftRow[]>([createEmptyRow(), createEmptyRow(), createEmptyRow()]);

  const update = (id: string, patch: Partial<DraftRow>) =>
    setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));

  const isValid = (r: DraftRow) => r.name.trim().length > 0;
  const validRows = rows.filter(isValid);

  const addRow = () => setRows(prev => [...prev, createEmptyRow()]);
  const removeRow = (id: string) => setRows(prev => prev.filter(r => r.id !== id));

  const handleSave = () => {
    if (validRows.length === 0) return;
    const items = validRows.map(r => ({
      categoryId: "consumables",
      name: r.name.trim(),
      description: "",
      quantity: r.quantity,
      expiryDate: r.expiryDate,
      status: computeStatus(r.expiryDate),
      location: roomName,
      batchNumber: r.batchNumber.trim() || undefined,
    }));
    onCreate(items);
    setRows([createEmptyRow(), createEmptyRow(), createEmptyRow()]);
  };

  const datalistId = "room-stock-name-options";

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Add Stock to {roomName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <datalist id={datalistId}>
          {existingStockNames.map(n => <option key={n} value={n} />)}
        </datalist>
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold text-foreground">Item Name</TableHead>
                <TableHead className="font-semibold text-foreground">Item #</TableHead>
                <TableHead className="font-semibold text-foreground">Batch</TableHead>
                <TableHead className="font-semibold text-foreground">Expiry Date</TableHead>
                <TableHead className="font-semibold text-foreground text-center w-[80px]">Qty</TableHead>
                <TableHead className="font-semibold text-foreground text-right w-[60px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(row => (
                <TableRow key={row.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                      <Input
                        list={datalistId}
                        placeholder="Search or add item *"
                        value={row.name}
                        onChange={(e) => update(row.id, { name: e.target.value })}
                        className="h-8 text-xs pl-7"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Item #"
                      value={row.itemNumber}
                      onChange={(e) => update(row.id, { itemNumber: e.target.value })}
                      className="h-8 text-xs font-mono"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Batch #"
                      value={row.batchNumber}
                      onChange={(e) => update(row.id, { batchNumber: e.target.value })}
                      className="h-8 text-xs font-mono"
                    />
                  </TableCell>
                  <TableCell>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-8 w-full justify-start text-left text-xs font-normal",
                            !row.expiryDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-1.5 h-3 w-3" />
                          {row.expiryDate ? format(row.expiryDate, "dd MMM yy") : "Select"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={row.expiryDate}
                          onSelect={(d) => update(row.id, { expiryDate: d })}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={1}
                      value={row.quantity}
                      onChange={(e) => update(row.id, { quantity: parseInt(e.target.value) || 1 })}
                      className="h-8 text-xs text-center"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    {rows.length > 1 && (
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => removeRow(row.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
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
              onClick={addRow}
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Row
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            {validRows.length} item{validRows.length !== 1 ? "s" : ""} ready
          </span>
          <Button onClick={handleSave} disabled={validRows.length === 0} size="sm">
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
