import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format, addDays } from "date-fns";
import {
  CalendarIcon,
  Check,
  ClipboardList,
  Download,
  FileText,
  History,
  Minus,
  Plus,
  Radio,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useUser } from "@/contexts/UserContext";
import { StockCheckoutWizard, CheckoutLine } from "./StockCheckoutWizard";
import { useBarcodeMap, useBarcodeScanner, normaliseBarcode } from "@/lib/barcodes";
import {
  StockCheckout,
  StockCheckoutLine,
  addStockCheckoutTask,
  deleteStockCheckout,
  readStockCheckouts,
  saveStockCheckout,
} from "@/data/stockCheckoutStore";
import { exportStockCheckoutCSV, exportStockCheckoutPDF } from "@/utils/stockCheckoutExport";
import { mockStaffMembers } from "@/data/mockStaff";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function nextReference() {
  return `CO-${format(new Date(), "yyyyMMdd")}-${Math.floor(Math.random() * 900 + 100)}`;
}

export function StockCheckoutTab() {
  const { items, updateItem } = useStock();
  const { currentUser } = useUser();
  const { map: barcodeMap } = useBarcodeMap();

  const [checkouts, setCheckouts] = useState<StockCheckout[]>(() => readStockCheckouts());

  const [active, setActive] = useState<{
    reference: string;
    categoryId?: string;
    groupLabel?: string;
    lines: StockCheckoutLine[];
  } | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [manualCode, setManualCode] = useState("");

  // Finish flow
  const [finishOpen, setFinishOpen] = useState(false);
  const [nextCheckoutDate, setNextCheckoutDate] = useState<Date | undefined>(addDays(new Date(), 30));
  const [nextCheckoutAssignee, setNextCheckoutAssignee] = useState<string>("");
  const [scheduleNext, setScheduleNext] = useState(true);

  const [viewing, setViewing] = useState<StockCheckout | null>(null);

  const onHand = (id: string) => items.find((i) => i.id === id)?.quantity ?? 0;

  const handleWizardComplete = (
    drafts: CheckoutLine[],
    group: { id: string; label: string; categoryId?: string },
  ) => {
    const lines: StockCheckoutLine[] = drafts.map((d) => {
      const item = items.find((i) => i.id === d.itemId);
      return {
        itemId: d.itemId,
        itemName: d.itemName,
        quantity: d.quantity,
        expiryDate: d.expiryDate
          ? d.expiryDate
          : item?.expiryDate
            ? new Date(item.expiryDate).toISOString().slice(0, 10)
            : undefined,
        batchNumber: d.batchNumber ?? item?.batchNumber,
      };
    });
    setActive({
      reference: nextReference(),
      categoryId: group.categoryId,
      groupLabel: group.label,
      lines,
    });
    if (lines.length === 0) {
      toast.success("New stock checkout started");
    } else {
      toast.success(`${lines.length} item${lines.length === 1 ? "" : "s"} added to checkout`);
    }
  };

  const addLine = (line: StockCheckoutLine) => {
    setActive((prev) => {
      if (!prev) return prev;
      const existing = prev.lines.findIndex((l) => l.itemId === line.itemId);
      if (existing >= 0) {
        const lines = [...prev.lines];
        const merged = lines[existing].quantity + line.quantity;
        lines[existing] = { ...lines[existing], quantity: Math.min(merged, Math.max(1, onHand(line.itemId)) || merged) };
        return { ...prev, lines };
      }
      return { ...prev, lines: [...prev.lines, line] };
    });
  };

  const handleCode = (raw: string) => {
    if (!active) return;
    const code = normaliseBarcode(raw);
    if (!code) return;
    const itemId = barcodeMap[code];
    const item = itemId ? items.find((i) => i.id === itemId) : undefined;
    if (item) {
      addLine({
        itemId: item.id,
        itemName: item.name,
        barcode: code,
        quantity: 1,
        expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().slice(0, 10) : undefined,
        batchNumber: item.batchNumber,
      });
      toast.success(`Scanned ${item.name}`);
      return;
    }
    toast.error(`No item matched to ${code}`, {
      description: "Match it in the Barcodes tab first.",
    });
  };

  const { scanning } = useBarcodeScanner({
    onScan: handleCode,
    enabled: !!active,
  });

  const changeQty = (itemId: string, delta: number) =>
    setActive((prev) =>
      prev
        ? {
            ...prev,
            lines: prev.lines.map((l) => {
              if (l.itemId !== itemId) return l;
              const max = Math.max(1, onHand(itemId));
              return { ...l, quantity: Math.min(max, Math.max(1, l.quantity + delta)) };
            }),
          }
        : prev,
    );

  const setQty = (itemId: string, value: number) =>
    setActive((prev) =>
      prev
        ? {
            ...prev,
            lines: prev.lines.map((l) => {
              if (l.itemId !== itemId) return l;
              const max = Math.max(1, onHand(itemId));
              return { ...l, quantity: Math.min(max, Math.max(1, value)) };
            }),
          }
        : prev,
    );

  const removeLine = (itemId: string) =>
    setActive((prev) => (prev ? { ...prev, lines: prev.lines.filter((l) => l.itemId !== itemId) } : prev));

  const totalUnits = active?.lines.reduce((s, l) => s + l.quantity, 0) ?? 0;

  const finishCheckout = () => {
    if (!active || active.lines.length === 0) return;

    let shortages = 0;
    active.lines.forEach((line) => {
      const item = items.find((i) => i.id === line.itemId);
      if (!item) return;
      const next = item.quantity - line.quantity;
      if (next < 0) shortages += 1;
      updateItem(item.id, { quantity: Math.max(0, next) });
    });

    const record: StockCheckout = {
      id: `checkout-${Date.now()}`,
      reference: active.reference,
      categoryId: active.categoryId,
      lines: active.lines,
      completedAt: new Date().toISOString(),
      completedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : "Practice Manager",
    };
    setCheckouts(saveStockCheckout(record));

    if (scheduleNext && nextCheckoutDate) {
      addStockCheckoutTask({
        id: `checkout-task-${Date.now()}`,
        title: `Stock checkout — follow up on ${active.reference}`,
        assignee: nextCheckoutAssignee || "Practice Manager",
        dueDate: nextCheckoutDate.toISOString(),
        createdAt: new Date().toISOString(),
      });
      toast.success("Checkout completed and next checkout task created");
    } else if (shortages > 0) {
      toast.warning(`Checked out — ${shortages} item(s) had insufficient stock and were set to 0`);
    } else {
      toast.success("Stock checkout completed");
    }

    setActive(null);
    setFinishOpen(false);
  };

  const pickerItems = useMemo(() => items.slice().sort((a, b) => a.name.localeCompare(b.name)), [items]);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Active checkout */}
      {!active ? (
        <StockCheckoutWizard onComplete={handleWizardComplete} />
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <ClipboardList className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  Checkout {active.reference}
                  {active.groupLabel && (
                    <Badge variant="outline" className="rounded-lg text-[10px] font-medium">
                      {active.groupLabel}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {active.lines.length} line{active.lines.length === 1 ? "" : "s"} · {totalUnits} unit
                  {totalUnits === 1 ? "" : "s"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="rounded-lg" onClick={() => setActive(null)}>
                Cancel
              </Button>
              <Button
                className="rounded-lg"
                disabled={active.lines.length === 0}
                onClick={() => setFinishOpen(true)}
              >
                Finish checkout
              </Button>
            </div>
          </div>

          {/* Scan bar */}
          <div className="flex flex-wrap items-center gap-2 border-t border-border bg-muted/30 px-4 py-3">
            <Badge variant="outline" className="rounded-lg gap-1 text-xs">
              <Radio className={cn("h-3 w-3", scanning ? "text-primary animate-pulse" : "text-muted-foreground")} />
              {scanning ? "Reading..." : "Scanner ready"}
            </Badge>
            <Input
              className="h-9 w-52 rounded-lg"
              placeholder="Scan or type barcode"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && manualCode.trim()) {
                  e.preventDefault();
                  handleCode(manualCode);
                  setManualCode("");
                }
              }}
            />
            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 rounded-lg">
                  <Plus className="mr-2 h-4 w-4" /> Add item
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search inventory..." />
                  <CommandList>
                    <CommandEmpty>No items found.</CommandEmpty>
                    <CommandGroup>
                      {pickerItems.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={item.name}
                          onSelect={() => {
                            addLine({
                              itemId: item.id,
                              itemName: item.name,
                              quantity: 1,
                              expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().slice(0, 10) : undefined,
                              batchNumber: item.batchNumber,
                            });
                            setPickerOpen(false);
                          }}
                        >
                          <Check className="mr-2 h-4 w-4 opacity-0" />
                          {item.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Lines */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead className="w-[190px]">Quantity</TableHead>
                <TableHead className="w-[190px]">Expiry date</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {active.lines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    Scan a barcode or add an item to begin this checkout.
                  </TableCell>
                </TableRow>
              ) : (
                active.lines.map((line) => {
                  const stock = onHand(line.itemId);
                  const short = line.quantity >= stock && stock < line.quantity;
                  return (
                    <TableRow key={line.itemId}>
                      <TableCell className="font-medium">
                        {line.itemName}
                        {short && (
                          <Badge className="ml-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/10">
                            Only {stock} on hand
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{line.batchNumber || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{line.barcode || "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            onClick={() => changeQty(line.itemId, -1)}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <Input
                            className="h-8 w-16 rounded-lg text-center"
                            value={line.quantity}
                            onChange={(e) => setQty(line.itemId, parseInt(e.target.value, 10) || 1)}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            onClick={() => changeQty(line.itemId, 1)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                          <span className="ml-1 text-[11px] text-muted-foreground whitespace-nowrap">
                            {stock} on hand
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {line.expiryDate ? format(new Date(line.expiryDate), "MMM d, yyyy") : "—"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
                          onClick={() => removeLine(line.itemId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Previous checkouts */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border p-4">
          <History className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Previous stock checkouts</h3>
        </div>
        {checkouts.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No stock checkouts recorded yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {checkouts.map((checkout) => {
              const names = checkout.lines.map((l) => l.itemName);
              const shown = names.slice(0, 3);
              const extra = names.length - shown.length;
              return (
                <div key={checkout.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="w-28 shrink-0 text-sm font-medium">
                    {format(new Date(checkout.completedAt), "MMM d, yyyy")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-muted-foreground">
                      {shown.join(", ")}
                      {extra > 0 && <span className="text-foreground"> +{extra} more</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {checkout.lines.length} item{checkout.lines.length === 1 ? "" : "s"} ·{" "}
                      {checkout.lines.reduce((s, l) => s + l.quantity, 0)} units
                    </div>
                  </div>
                  <Link
                    to="/inventory?tab=reports&report=checkout"
                    className="shrink-0 text-xs font-medium text-primary hover:underline"
                  >
                    View report
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground hover:text-destructive"
                    title="Delete"
                    onClick={() => {
                      setCheckouts(deleteStockCheckout(checkout.id));
                      toast.success("Checkout deleted");
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Finish checkout */}
      <Dialog open={finishOpen} onOpenChange={setFinishOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Finish stock checkout</DialogTitle>
            <DialogDescription>
              {active?.lines.length} line item{active?.lines.length === 1 ? "" : "s"} · {totalUnits} units will be
              deducted from your inventory.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <div className="text-sm font-medium">Schedule next stock checkout</div>
                <div className="text-xs text-muted-foreground">Creates a task so the next checkout isn't missed.</div>
              </div>
              <Switch checked={scheduleNext} onCheckedChange={setScheduleNext} />
            </div>

            {scheduleNext && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs">Due date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="h-9 w-full justify-start rounded-lg text-xs font-normal">
                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                        {nextCheckoutDate ? format(nextCheckoutDate, "MMM d, yyyy") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={nextCheckoutDate}
                        onSelect={setNextCheckoutDate}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Assign to</Label>
                  <Select value={nextCheckoutAssignee} onValueChange={setNextCheckoutAssignee}>
                    <SelectTrigger className="h-9 rounded-lg text-xs">
                      <SelectValue placeholder="Practice Manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockStaffMembers.map((s) => (
                        <SelectItem key={s.id} value={`${s.firstName} ${s.lastName}`}>
                          {s.firstName} {s.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" className="rounded-lg" onClick={() => setFinishOpen(false)}>
              Back
            </Button>
            <Button className="rounded-lg" onClick={finishCheckout}>
              Complete checkout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View past checkout */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Stock checkout {viewing?.reference}</DialogTitle>
            <DialogDescription>
              {viewing ? format(new Date(viewing.completedAt), "MMMM d, yyyy 'at' h:mm a") : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[50vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Expiry</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {viewing?.lines.map((l) => (
                  <TableRow key={l.itemId}>
                    <TableCell className="font-medium">{l.itemName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{l.batchNumber || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{l.barcode || "—"}</TableCell>
                    <TableCell>{l.quantity}</TableCell>
                    <TableCell>{l.expiryDate ? format(new Date(l.expiryDate), "MMM d, yyyy") : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-lg"
              onClick={() => viewing && exportStockCheckoutCSV(viewing)}
            >
              <Download className="mr-2 h-4 w-4" /> CSV
            </Button>
            <Button className="rounded-lg" onClick={() => viewing && exportStockCheckoutPDF(viewing)}>
              <FileText className="mr-2 h-4 w-4" /> PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
