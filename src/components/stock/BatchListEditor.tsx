import { useState } from "react";
import { StockBatch } from "@/types/stock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BatchListEditorProps {
  batches: StockBatch[];
  onChange: (batches: StockBatch[]) => void;
}

export function BatchListEditor({ batches, onChange }: BatchListEditorProps) {
  const [openDateId, setOpenDateId] = useState<string | null>(null);

  const updateBatch = (id: string, patch: Partial<StockBatch>) => {
    onChange(batches.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const removeBatch = (id: string) => {
    if (batches.length <= 1) return;
    onChange(batches.filter((b) => b.id !== id));
  };

  const addBatch = () => {
    onChange([
      ...batches,
      {
        id: `b-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        batchNumber: "",
        quantity: 1,
        unitPrice: undefined,
        expiryDate: undefined,
      },
    ]);
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs font-medium text-foreground">Batches</Label>
      <div className="space-y-2">
        {batches.map((batch, idx) => (
          <div key={batch.id} className="rounded-lg border border-border bg-muted/30 p-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Batch {idx + 1}</span>
              {batches.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => removeBatch(batch.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Batch number</Label>
                <Input
                  value={batch.batchNumber}
                  onChange={(e) => updateBatch(batch.id, { batchNumber: e.target.value })}
                  placeholder="BATCH-001"
                  className="h-8 text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Quantity</Label>
                <Input
                  type="number"
                  min={0}
                  value={batch.quantity}
                  onChange={(e) => updateBatch(batch.id, { quantity: parseInt(e.target.value, 10) || 0 })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Unit price</Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  placeholder="0.00"
                  value={batch.unitPrice ?? ""}
                  onChange={(e) =>
                    updateBatch(batch.id, {
                      unitPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Expiry date</Label>
                <Popover open={openDateId === batch.id} onOpenChange={(open) => setOpenDateId(open ? batch.id : null)}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-8 w-full justify-start text-left text-xs font-normal",
                        !batch.expiryDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-1.5 h-3 w-3" />
                      {batch.expiryDate ? format(batch.expiryDate, "dd MMM yy") : "No expiry"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={batch.expiryDate}
                      onSelect={(d) => {
                        updateBatch(batch.id, { expiryDate: d });
                        setOpenDateId(null);
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 text-xs gap-1.5 w-full"
        onClick={addBatch}
      >
        <Plus className="w-3.5 h-3.5" /> Add another batch
      </Button>
    </div>
  );
}
