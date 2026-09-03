import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INSTRUMENT_CATEGORIES, InstrumentCategory, Instrument } from "@/types/rooms";
import { Pencil } from "lucide-react";

interface EditInstrumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instrument: Instrument | null;
  roomName: string;
  onSave: (instrumentId: string, data: {
    category: InstrumentCategory;
    name: string;
    instrumentNumber: string;
    notes?: string;
    status: "active" | "maintenance" | "inactive";
  }) => void;
}

export function EditInstrumentDialog({ open, onOpenChange, instrument, roomName, onSave }: EditInstrumentDialogProps) {
  const [category, setCategory] = useState<InstrumentCategory | "">("");
  const [name, setName] = useState("");
  const [instrumentNumber, setInstrumentNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"active" | "maintenance" | "inactive">("active");

  useEffect(() => {
    if (instrument) {
      setCategory(instrument.category);
      setName(instrument.name);
      setInstrumentNumber(instrument.instrumentNumber);
      setNotes(instrument.notes || "");
      setStatus(instrument.status);
    }
  }, [instrument]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (instrument && category && name && instrumentNumber) {
      onSave(instrument.id, { 
        category: category as InstrumentCategory, 
        name, 
        instrumentNumber, 
        notes: notes || undefined,
        status
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent/10">
              <Pencil className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <DialogTitle>Edit Instrument</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">In {roomName}</p>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-category">Category *</Label>
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
              <Label htmlFor="edit-name">Instrument Name *</Label>
              <Input
                id="edit-name"
                placeholder="e.g., Digital BP Monitor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-instrumentNumber">Instrument Number *</Label>
              <Input
                id="edit-instrumentNumber"
                placeholder="e.g., BP-101-01"
                value={instrumentNumber}
                onChange={(e) => setInstrumentNumber(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select value={status} onValueChange={(val) => setStatus(val as "active" | "maintenance" | "inactive")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
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
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
