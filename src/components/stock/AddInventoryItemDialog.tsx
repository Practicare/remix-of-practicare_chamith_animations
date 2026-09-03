import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StockBatch } from "@/types/stock";
import { BatchListEditor } from "./BatchListEditor";

export interface NewInventoryItemValues {
  name: string;
  batches: StockBatch[];
}

interface AddInventoryItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productOptions: string[];
  onSave: (values: NewInventoryItemValues) => void;
}

export function AddInventoryItemDialog({
  open,
  onOpenChange,
  productOptions,
  onSave,
}: AddInventoryItemDialogProps) {
  const [name, setName] = useState("");
  const [batches, setBatches] = useState<StockBatch[]>([
    {
      id: `b-${Date.now()}`,
      batchNumber: "",
      quantity: 1,
      unitPrice: undefined,
      expiryDate: undefined,
    },
  ]);
  const [error, setError] = useState("");

  const reset = () => {
    setName("");
    setBatches([
      {
        id: `b-${Date.now()}`,
        batchNumber: "",
        quantity: 1,
        unitPrice: undefined,
        expiryDate: undefined,
      },
    ]);
    setError("");
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError("Product name is required");
      return;
    }
    if (batches.length === 0 || batches.every((b) => b.quantity <= 0)) {
      setError("Add at least one batch with a quantity");
      return;
    }
    onSave({
      name: name.trim(),
      batches: batches.map((b) => ({ ...b, quantity: Math.max(0, b.quantity) })),
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add inventory item</DialogTitle>
          <DialogDescription>
            Record a new product with one or more batches.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-1">
          <div className="rounded-lg bg-primary/[0.06] border border-primary/20 p-4">
            <p className="text-sm text-foreground leading-relaxed">
              <span className="font-semibold text-primary">Adding more than one item?</span>{" "}
              Use the{" "}
              <span className="font-medium">Stock Intake</span> menu tab next to Inventory to add
              multiple items easily. You can use AI, pictures, PDFs, or documents to import them
              all at once.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inv-name">Product *</Label>
            <Input
              id="inv-name"
              list="inv-add-product-options"
              placeholder="Select or type a product"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
            />
            <datalist id="inv-add-product-options">
              {productOptions.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <BatchListEditor batches={batches} onChange={setBatches} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
