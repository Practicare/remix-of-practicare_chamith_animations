import { useMemo, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePickerInput } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DynamicIcon } from "@/components/DynamicIcon";
import {
  Sparkles,
  Trash2,
  ChevronDown,
  Plus,
  CheckCircle2,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StockCategory } from "@/types/stock";

export interface ReviewableItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  expiryDate?: string;
  batchNumber?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialItems: Omit<ReviewableItem, "id">[];
  categories: StockCategory[];
  onConfirm: (items: Omit<ReviewableItem, "id">[]) => void;
}

export function AIStockReviewDialog({
  open,
  onOpenChange,
  initialItems,
  categories,
  onConfirm,
}: Props) {
  const [items, setItems] = useState<ReviewableItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      const seeded = initialItems.map((it, idx) => ({
        ...it,
        id: `rev-${Date.now()}-${idx}`,
        category: it.category || categories[0]?.id || "",
      }));
      setItems(seeded);
      const cats = Array.from(new Set(seeded.map((i) => i.category)));
      setOpenSections(Object.fromEntries(cats.map((c) => [c, true])));
      setEditingId(null);
    }
  }, [open, initialItems, categories]);

  const grouped = useMemo(() => {
    const map = new Map<string, ReviewableItem[]>();
    for (const it of items) {
      const key = it.category || "uncategorised";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }
    return Array.from(map.entries());
  }, [items]);

  const catById = (id: string) =>
    categories.find((c) => c.id === id) || {
      id,
      name: "Uncategorised",
      icon: "Package",
    } as Partial<StockCategory>;

  const updateItem = (id: string, patch: Partial<ReviewableItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const addItem = (categoryId: string) => {
    const id = `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setItems((prev) => [
      ...prev,
      { id, name: "", quantity: 1, category: categoryId },
    ]);
    setEditingId(id);
  };

  const handleConfirm = () => {
    const clean = items
      .filter((i) => i.name.trim().length > 0)
      .map(({ id: _id, ...rest }) => rest);
    onConfirm(clean);
    onOpenChange(false);
  };

  const totalValid = items.filter((i) => i.name.trim().length > 0).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 gap-0 max-h-[92vh] flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            Review detected items
          </DialogTitle>
          <DialogDescription>
            Verify and edit the items extracted by AI. They&apos;re grouped by
            category — expand a section to make changes.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {grouped.length === 0 && (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No items detected. Close and try another photo.
            </div>
          )}

          {grouped.map(([catId, catItems]) => {
            const cat = catById(catId);
            const isOpen = openSections[catId] ?? true;
            return (
              <Collapsible
                key={catId}
                open={isOpen}
                onOpenChange={(v) =>
                  setOpenSections((s) => ({ ...s, [catId]: v }))
                }
              >
                <div className="rounded-xl border bg-card overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <DynamicIcon
                            name={cat.icon || "Package"}
                            className="w-4 h-4 text-primary"
                          />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-semibold leading-tight">
                            {cat.name || "Uncategorised"}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {catItems.length}{" "}
                            {catItems.length === 1 ? "item" : "items"}
                          </div>
                        </div>
                      </div>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 text-muted-foreground transition-transform",
                          isOpen && "rotate-180"
                        )}
                      />
                    </button>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="border-t divide-y">
                      {catItems.map((item) => {
                        const isEditing = editingId === item.id;
                        return (
                          <div
                            key={item.id}
                            className={cn(
                              "px-4 py-3 transition-colors",
                              isEditing ? "bg-muted/30" : "hover:bg-muted/20"
                            )}
                          >
                            {isEditing ? (
                              <div className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
                                  <div className="sm:col-span-3">
                                    <Label className="text-[11px] text-muted-foreground">
                                      Item name
                                    </Label>
                                    <Input
                                      value={item.name}
                                      onChange={(e) =>
                                        updateItem(item.id, {
                                          name: e.target.value,
                                        })
                                      }
                                      placeholder="e.g. Paracetamol 500mg"
                                      className="h-9 mt-1"
                                      autoFocus
                                    />
                                  </div>
                                  <div className="sm:col-span-1">
                                    <Label className="text-[11px] text-muted-foreground">
                                      Qty
                                    </Label>
                                    <Input
                                      type="number"
                                      min={0}
                                      value={item.quantity}
                                      onChange={(e) =>
                                        updateItem(item.id, {
                                          quantity:
                                            parseInt(e.target.value) || 0,
                                        })
                                      }
                                      className="h-9 mt-1"
                                    />
                                  </div>
                                  <div className="sm:col-span-2">
                                    <Label className="text-[11px] text-muted-foreground">
                                      Category
                                    </Label>
                                    <Select
                                      value={item.category}
                                      onValueChange={(v) =>
                                        updateItem(item.id, { category: v })
                                      }
                                    >
                                      <SelectTrigger className="h-9 mt-1">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {categories.map((c) => (
                                          <SelectItem key={c.id} value={c.id}>
                                            {c.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="sm:col-span-3">
                                    <Label className="text-[11px] text-muted-foreground">
                                      Expiry date
                                    </Label>
                                    <DatePickerInput
                                      value={item.expiryDate || undefined}
                                      onChange={(v) =>
                                        updateItem(item.id, {
                                          expiryDate: v ?? "",
                                        })
                                      }
                                      className="mt-1"
                                    />
                                  </div>
                                  <div className="sm:col-span-3">
                                    <Label className="text-[11px] text-muted-foreground">
                                      Batch number
                                    </Label>
                                    <Input
                                      value={item.batchNumber || ""}
                                      onChange={(e) =>
                                        updateItem(item.id, {
                                          batchNumber: e.target.value,
                                        })
                                      }
                                      placeholder="Optional"
                                      className="h-9 mt-1"
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 h-8"
                                    onClick={() => removeItem(item.id)}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Remove
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="h-8 gap-1.5"
                                    onClick={() => setEditingId(null)}
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Done
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate">
                                    {item.name || (
                                      <span className="italic text-muted-foreground">
                                        Untitled item
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground">
                                    <span>Qty {item.quantity}</span>
                                    {item.expiryDate && (
                                      <span>Exp {item.expiryDate}</span>
                                    )}
                                    {item.batchNumber && (
                                      <span>Batch {item.batchNumber}</span>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => setEditingId(item.id)}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => removeItem(item.id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => addItem(catId)}
                        className="w-full px-4 py-2.5 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add item to this category
                      </button>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/20 sm:justify-between gap-2">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{totalValid}</span>{" "}
            {totalValid === 1 ? "item" : "items"} ready to add
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={totalValid === 0}
              className="gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Add {totalValid > 0 ? totalValid : ""} to inventory
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
