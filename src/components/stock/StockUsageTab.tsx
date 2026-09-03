import { useState, useMemo } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, TrendingDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useStock } from "@/contexts/StockContext";
import { toast } from "sonner";

type UsageEntry = {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  date: string;
  note: string;
  createdAt: string;
};

const STORAGE_KEY = "practicare.stockUsage.v1";

function loadUsage(): UsageEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsage(entries: UsageEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function StockUsageTab() {
  const { items } = useStock();
  const [entries, setEntries] = useState<UsageEntry[]>(() => loadUsage());
  const [itemQuery, setItemQuery] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [selectedItemName, setSelectedItemName] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [note, setNote] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  const matches = useMemo(() => {
    if (!itemQuery) return items.slice(0, 8);
    const q = itemQuery.toLowerCase();
    return items.filter((i) => i.name.toLowerCase().includes(q)).slice(0, 8);
  }, [itemQuery, items]);

  const totalQty = useMemo(
    () => entries.reduce((sum, e) => sum + e.quantity, 0),
    [entries],
  );

  const reset = () => {
    setSelectedItemId("");
    setSelectedItemName("");
    setItemQuery("");
    setQuantity("");
    setNote("");
    setDate(new Date());
  };

  const handleSubmit = () => {
    const name = selectedItemName || itemQuery.trim();
    const qty = Number(quantity);
    if (!name) {
      toast.error("Please select or enter an item");
      return;
    }
    if (!qty || qty <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    const entry: UsageEntry = {
      id: `usage-${Date.now()}`,
      itemId: selectedItemId || `custom-${Date.now()}`,
      itemName: name,
      quantity: qty,
      date: date.toISOString(),
      note: note.trim(),
      createdAt: new Date().toISOString(),
    };
    const next = [entry, ...entries];
    setEntries(next);
    saveUsage(next);
    reset();
    toast.success(`Logged ${qty} × ${name}`);
  };

  const handleDelete = (id: string) => {
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    saveUsage(next);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingDown className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Log stock usage</h3>
            <p className="text-xs text-muted-foreground">Record consumed items to keep inventory accurate.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 space-y-1.5">
            <Label className="text-xs">Item</Label>
            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start font-normal h-10",
                    !selectedItemName && "text-muted-foreground",
                  )}
                >
                  <Search className="w-3.5 h-3.5 mr-2" />
                  {selectedItemName || itemQuery || "Search inventory item"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-2" align="start">
                <Input
                  autoFocus
                  placeholder="Type item name..."
                  value={itemQuery}
                  onChange={(e) => {
                    setItemQuery(e.target.value);
                    setSelectedItemId("");
                    setSelectedItemName("");
                  }}
                  className="h-9 mb-2"
                />
                <div className="max-h-56 overflow-y-auto">
                  {matches.length === 0 ? (
                    <p className="text-xs text-muted-foreground p-3 text-center">
                      No match. Press submit to log "{itemQuery}" as a custom item.
                    </p>
                  ) : (
                    matches.map((it) => (
                      <button
                        key={it.id}
                        type="button"
                        onClick={() => {
                          setSelectedItemId(it.id);
                          setSelectedItemName(it.name);
                          setItemQuery(it.name);
                          setPickerOpen(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-muted text-sm flex items-center justify-between"
                      >
                        <span className="truncate">{it.name}</span>
                        <Badge variant="outline" className="text-[10px] font-normal ml-2">
                          {it.quantity} on hand
                        </Badge>
                      </button>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <Label className="text-xs">Quantity</Label>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              className="h-10"
            />
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <Label className="text-xs">Date</Label>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start font-normal h-10">
                  <CalendarIcon className="w-3.5 h-3.5 mr-2" />
                  {format(date, "dd MMM yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => {
                    if (d) setDate(d);
                    setDateOpen(false);
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <Label className="text-xs opacity-0">Submit</Label>
            <Button onClick={handleSubmit} className="w-full h-10 gap-1.5">
              <Plus className="w-4 h-4" /> Submit
            </Button>
          </div>

          <div className="md:col-span-12 space-y-1.5">
            <Label className="text-xs">Note (optional)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Used during morning clinic"
              rows={2}
              className="resize-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div>
            <p className="text-sm font-semibold text-foreground">Usage log</p>
            <p className="text-xs text-muted-foreground">
              {entries.length} entr{entries.length === 1 ? "y" : "ies"} · {totalQty} units used total
            </p>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs font-semibold">Date</TableHead>
              <TableHead className="text-xs font-semibold">Item</TableHead>
              <TableHead className="text-xs font-semibold text-center">Quantity</TableHead>
              <TableHead className="text-xs font-semibold">Note</TableHead>
              <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground text-sm">
                  No usage logged yet. Add your first entry above.
                </TableCell>
              </TableRow>
            ) : (
              entries.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(e.date), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="text-sm font-medium">{e.itemName}</TableCell>
                  <TableCell className="text-center text-sm font-semibold">{e.quantity}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-md">
                    {e.note || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => handleDelete(e.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
