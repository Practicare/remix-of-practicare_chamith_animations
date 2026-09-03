import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format, differenceInDays, addDays } from "date-fns";
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
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
import { StockItem } from "@/types/stock";
import { StockIntakeWizard, IntakeDraftItem, IntakeGroup } from "./StockIntakeWizard";
import { useBarcodeMap, useBarcodeScanner, normaliseBarcode } from "@/lib/barcodes";
import {
  StockIntake,
  StockIntakeLine,
  addStockIntakeTask,
  deleteStockIntake,
  readStockIntakes,
  saveStockIntake,
} from "@/data/stockIntakeStore";
import { exportStockIntakeCSV, exportStockIntakePDF } from "@/utils/stockIntakeExport";
import { mockStaffMembers } from "@/data/mockStaff";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function computeStatus(d?: Date): StockItem["status"] {
  if (!d) return "valid";
  const days = differenceInDays(d, new Date());
  if (days < 0) return "expired";
  if (days <= 60) return "expiring";
  return "valid";
}

function nextReference() {
  return `SI-${format(new Date(), "yyyyMMdd")}-${Math.floor(Math.random() * 900 + 100)}`;
}

export function StockIntakeTab() {
  const { items, createItem, updateItem } = useStock();
  const { currentUser } = useUser();
  const { map: barcodeMap, persist: persistBarcodes } = useBarcodeMap();

  const [intakes, setIntakes] = useState<StockIntake[]>(() => readStockIntakes());

  const [active, setActive] = useState<{
    reference: string;
    categoryId?: string;
    groupLabel?: string;
    lines: StockIntakeLine[];
  } | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [manualCode, setManualCode] = useState("");

  // Unknown barcode -> create new inventory item
  const [newItemDialog, setNewItemDialog] = useState<{ barcode: string; name: string } | null>(null);

  // Finish flow
  const [finishOpen, setFinishOpen] = useState(false);
  const [nextIntakeDate, setNextIntakeDate] = useState<Date | undefined>(addDays(new Date(), 30));
  const [nextIntakeAssignee, setNextIntakeAssignee] = useState<string>("");
  const [scheduleNext, setScheduleNext] = useState(true);

  const [viewing, setViewing] = useState<StockIntake | null>(null);

  const handleWizardComplete = (group: IntakeGroup, drafts: IntakeDraftItem[]) => {
    if (drafts.length === 0) {
      setActive({ reference: nextReference(), categoryId: group.categoryId, groupLabel: group.label, lines: [] });
      toast.success("New stock intake started");
      return;
    }
    const now = new Date();
    const newBarcodes: Record<string, string> = {};
    const lines: StockIntakeLine[] = drafts.map((d) => {
      const id = `stk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      if (d.barcode) newBarcodes[d.barcode] = id;
      createItem({
        id,
        categoryId: group.categoryId,
        name: d.name.trim(),
        description: "",
        quantity: 0,
        status: "valid",
        batchNumber: d.batchNumber,
        expiryDate: d.expiryDate ? new Date(d.expiryDate) : undefined,
        createdAt: now,
        updatedAt: now,
      });
      return {
        itemId: id,
        itemName: d.name.trim(),
        barcode: d.barcode,
        quantity: d.quantity,
        expiryDate: d.expiryDate ? new Date(d.expiryDate).toISOString() : undefined,
        isNewItem: true,
      };
    });
    if (Object.keys(newBarcodes).length > 0) {
      persistBarcodes({ ...barcodeMap, ...newBarcodes });
    }
    setActive({ reference: nextReference(), categoryId: group.categoryId, groupLabel: group.label, lines });
    toast.success(`${lines.length} item${lines.length === 1 ? "" : "s"} added to intake`);
  };

  const addLine = (line: StockIntakeLine) => {
    setActive((prev) => {
      if (!prev) return prev;
      const existing = prev.lines.findIndex((l) => l.itemId === line.itemId);
      if (existing >= 0) {
        const lines = [...prev.lines];
        lines[existing] = { ...lines[existing], quantity: lines[existing].quantity + line.quantity };
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
        expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString() : undefined,
      });
      toast.success(`Scanned ${item.name}`);
      return;
    }
    setNewItemDialog({ barcode: code, name: "" });
  };

  const { scanning } = useBarcodeScanner({
    onScan: handleCode,
    enabled: !!active,
  });

  const confirmNewItem = () => {
    if (!newItemDialog || !newItemDialog.name.trim()) return;
    const now = new Date();
    const id = `stk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    createItem({
      id,
      categoryId: active?.categoryId || "consumables",
      name: newItemDialog.name.trim(),
      description: "",
      quantity: 0,
      status: "valid",
      createdAt: now,
      updatedAt: now,
    });
    persistBarcodes({ ...barcodeMap, [newItemDialog.barcode]: id });
    addLine({
      itemId: id,
      itemName: newItemDialog.name.trim(),
      barcode: newItemDialog.barcode,
      quantity: 1,
      isNewItem: true,
    });
    toast.success(`Created ${newItemDialog.name.trim()} and added to intake`);
    setNewItemDialog(null);
  };

  const changeQty = (itemId: string, delta: number) =>
    setActive((prev) =>
      prev
        ? {
            ...prev,
            lines: prev.lines.map((l) =>
              l.itemId === itemId ? { ...l, quantity: Math.max(1, l.quantity + delta) } : l,
            ),
          }
        : prev,
    );

  const setQty = (itemId: string, value: number) =>
    setActive((prev) =>
      prev
        ? { ...prev, lines: prev.lines.map((l) => (l.itemId === itemId ? { ...l, quantity: Math.max(1, value) } : l)) }
        : prev,
    );

  const setExpiry = (itemId: string, date?: Date) =>
    setActive((prev) =>
      prev
        ? {
            ...prev,
            lines: prev.lines.map((l) =>
              l.itemId === itemId ? { ...l, expiryDate: date ? date.toISOString() : undefined } : l,
            ),
          }
        : prev,
    );

  const removeLine = (itemId: string) =>
    setActive((prev) => (prev ? { ...prev, lines: prev.lines.filter((l) => l.itemId !== itemId) } : prev));

  const totalUnits = active?.lines.reduce((s, l) => s + l.quantity, 0) ?? 0;

  const finishIntake = () => {
    if (!active || active.lines.length === 0) return;

    active.lines.forEach((line) => {
      const item = items.find((i) => i.id === line.itemId);
      const expiry = line.expiryDate ? new Date(line.expiryDate) : item?.expiryDate;
      updateItem(line.itemId, {
        quantity: (item?.quantity ?? 0) + line.quantity,
        expiryDate: expiry,
        status: computeStatus(expiry),
      });
    });

    const record: StockIntake = {
      id: `intake-${Date.now()}`,
      reference: active.reference,
      categoryId: active.categoryId,
      lines: active.lines,
      completedAt: new Date().toISOString(),
      completedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : "Practice Manager",
    };
    setIntakes(saveStockIntake(record));

    if (scheduleNext && nextIntakeDate) {
      addStockIntakeTask({
        id: `intake-task-${Date.now()}`,
        title: `Stock intake — follow up on ${active.reference}`,
        assignee: nextIntakeAssignee || "Practice Manager",
        dueDate: nextIntakeDate.toISOString(),
        createdAt: new Date().toISOString(),
      });
      toast.success("Intake completed and next intake task created");
    } else {
      toast.success("Stock intake completed");
    }

    setActive(null);
    setFinishOpen(false);
  };

  const pickerItems = useMemo(() => items.slice().sort((a, b) => a.name.localeCompare(b.name)), [items]);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Active intake */}
      {!active ? (
        <StockIntakeWizard onComplete={handleWizardComplete} />
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <ClipboardList className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  Intake {active.reference}
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
                Finish intake
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
                              expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString() : undefined,
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
                <TableHead>Barcode</TableHead>
                <TableHead className="w-[170px]">Quantity</TableHead>
                <TableHead className="w-[190px]">Expiry date</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {active.lines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    Scan a barcode or add an item to begin this intake.
                  </TableCell>
                </TableRow>
              ) : (
                active.lines.map((line) => (
                  <TableRow key={line.itemId}>
                    <TableCell className="font-medium">
                      {line.itemName}
                      {line.isNewItem && (
                        <Badge className="ml-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/10">New</Badge>
                      )}
                    </TableCell>
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
                      </div>
                    </TableCell>
                    <TableCell>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="h-8 w-full justify-start rounded-lg text-xs font-normal">
                            <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                            {line.expiryDate ? format(new Date(line.expiryDate), "MMM d, yyyy") : "Set expiry"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={line.expiryDate ? new Date(line.expiryDate) : undefined}
                            onSelect={(d) => setExpiry(line.itemId, d)}
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Previous intakes */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border p-4">
          <History className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Previous stock intakes</h3>
        </div>
        {intakes.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No stock intakes recorded yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {intakes.map((intake) => {
              const names = intake.lines.map((l) => l.itemName);
              const shown = names.slice(0, 3);
              const extra = names.length - shown.length;
              return (
                <div key={intake.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="w-28 shrink-0 text-sm font-medium">
                    {format(new Date(intake.completedAt), "MMM d, yyyy")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-muted-foreground">
                      {shown.join(", ")}
                      {extra > 0 && <span className="text-foreground"> +{extra} more</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {intake.lines.length} item{intake.lines.length === 1 ? "" : "s"} ·{" "}
                      {intake.lines.reduce((s, l) => s + l.quantity, 0)} units
                    </div>
                  </div>
                  <Link
                    to="/inventory?tab=reports&report=intake"
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
                      setIntakes(deleteStockIntake(intake.id));
                      toast.success("Intake deleted");
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

      {/* New item from unknown barcode */}
      <Dialog open={!!newItemDialog} onOpenChange={(o) => !o && setNewItemDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New inventory item</DialogTitle>
            <DialogDescription>
              Barcode <span className="font-mono">{newItemDialog?.barcode}</span> isn't matched to any item. Name it to
              create it and add it to this intake.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs">Item name</Label>
            <Input
              autoFocus
              className="rounded-lg"
              value={newItemDialog?.name || ""}
              onChange={(e) => setNewItemDialog((p) => (p ? { ...p, name: e.target.value } : p))}
              onKeyDown={(e) => e.key === "Enter" && confirmNewItem()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-lg" onClick={() => setNewItemDialog(null)}>
              Cancel
            </Button>
            <Button className="rounded-lg" onClick={confirmNewItem} disabled={!newItemDialog?.name.trim()}>
              Create & add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finish intake */}
      <Dialog open={finishOpen} onOpenChange={setFinishOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Finish stock intake</DialogTitle>
            <DialogDescription>
              {active?.lines.length} line item{active?.lines.length === 1 ? "" : "s"} · {totalUnits} units will be added
              to your inventory with the expiry dates set above.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <div className="text-sm font-medium">Schedule next stock intake</div>
                <div className="text-xs text-muted-foreground">Creates a task so the next intake isn't missed.</div>
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
                        {nextIntakeDate ? format(nextIntakeDate, "MMM d, yyyy") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={nextIntakeDate}
                        onSelect={setNextIntakeDate}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Assign to</Label>
                  <Select value={nextIntakeAssignee} onValueChange={setNextIntakeAssignee}>
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
            <Button className="rounded-lg" onClick={finishIntake}>
              Complete intake
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View past intake */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Stock intake {viewing?.reference}</DialogTitle>
            <DialogDescription>
              {viewing ? format(new Date(viewing.completedAt), "MMMM d, yyyy 'at' h:mm a") : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[50vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Expiry</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {viewing?.lines.map((l) => (
                  <TableRow key={l.itemId}>
                    <TableCell className="font-medium">{l.itemName}</TableCell>
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
              onClick={() => viewing && exportStockIntakeCSV(viewing)}
            >
              <Download className="mr-2 h-4 w-4" /> CSV
            </Button>
            <Button className="rounded-lg" onClick={() => viewing && exportStockIntakePDF(viewing)}>
              <FileText className="mr-2 h-4 w-4" /> PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
