import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INSTRUMENT_CATEGORIES, InstrumentCategory } from "@/types/rooms";
import { Package } from "lucide-react";

interface AddInstrumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomName: string;
  onAdd: (instrument: {
    category: InstrumentCategory;
    name: string;
    instrumentNumber: string;
    notes?: string;
  }) => void;
}

export function AddInstrumentDialog({ open, onOpenChange, roomName, onAdd }: AddInstrumentDialogProps) {
  const [category, setCategory] = useState<InstrumentCategory | "">("");
  const [name, setName] = useState("");
  const [instrumentNumber, setInstrumentNumber] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (category && name && instrumentNumber) {
      onAdd({ 
        category: category as InstrumentCategory, 
        name, 
        instrumentNumber, 
        notes: notes || undefined 
      });
      setCategory("");
      setName("");
      setInstrumentNumber("");
      setNotes("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent/10">
              <Package className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <DialogTitle>Add Item</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">Adding to {roomName}</p>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={(val) => setCategory(val as InstrumentCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="Select instrument category" />
              </SelectTrigger>
              <SelectContent>
                {INSTRUMENT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Instrument Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Digital BP Monitor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instrumentNumber">Identification Number *</Label>
              <Input
                id="instrumentNumber"
                placeholder="e.g., BP-101-01"
                value={instrumentNumber}
                onChange={(e) => setInstrumentNumber(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Optional notes about this instrument..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!category || !name || !instrumentNumber}>
              Add Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
