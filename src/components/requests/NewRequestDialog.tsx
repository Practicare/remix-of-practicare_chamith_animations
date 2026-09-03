import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRequests } from "@/contexts/RequestsContext";
import { useRooms } from "@/contexts/RoomsContext";
import { mockTeamMembers } from "@/data/mockTeamMembers";

const REQUEST_TYPES = ["refill", "repair", "purchase", "restock", "other"];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function NewRequestDialog({ open, onOpenChange }: Props) {
  const { createRequest } = useRequests();
  const { rooms } = useRooms();
  const [itemName, setItemName] = useState("");
  const [type, setType] = useState("refill");
  const [teamMember, setTeamMember] = useState<string>("");
  const [roomName, setRoomName] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const reset = () => {
    setItemName(""); setType("refill"); setTeamMember(""); setRoomName(""); setQuantity(1); setNotes("");
  };

  const submit = () => {
    if (!itemName.trim()) return;
    createRequest({
      stockItemId: `manual-${Date.now()}`,
      itemName: itemName.trim(),
      roomName: roomName || "Unassigned",
      quantity,
      type,
      teamMember: teamMember || undefined,
      notes: notes || undefined,
      status: "order",
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New request</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Item</Label>
            <Input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g. Alcohol wipes" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Type of request</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REQUEST_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Quantity</Label>
              <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value) || 1)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Room</Label>
              <Select value={roomName} onValueChange={setRoomName}>
                <SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger>
                <SelectContent>
                  {rooms.map((r) => (
                    <SelectItem key={r.id} value={r.roomName}>{r.roomName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Team member</Label>
              <Select value={teamMember} onValueChange={setTeamMember}>
                <SelectTrigger><SelectValue placeholder="Assign to..." /></SelectTrigger>
                <SelectContent>
                  {mockTeamMembers.map((m) => (
                    <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Notes</Label>
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional context..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!itemName.trim()}>Create request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
