import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Room } from "@/types/rooms";
import { Pencil } from "lucide-react";

interface EditRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null;
  onSave: (roomId: string, data: { roomNumber: string; roomName: string; description: string }) => void;
}

export function EditRoomDialog({ open, onOpenChange, room, onSave }: EditRoomDialogProps) {
  const [roomNumber, setRoomNumber] = useState("");
  const [roomName, setRoomName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (room) {
      setRoomNumber(room.roomNumber);
      setRoomName(room.roomName);
      setDescription(room.description || "");
    }
  }, [room]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (room && roomNumber && roomName) {
      onSave(room.id, { roomNumber, roomName, description });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Pencil className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle>Edit Room</DialogTitle>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-roomNumber">Room Number *</Label>
              <Input
                id="edit-roomNumber"
                placeholder="e.g., 101"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-roomName">Room Name *</Label>
              <Input
                id="edit-roomName"
                placeholder="e.g., Consultation Room A"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              placeholder="Optional description of the room's purpose..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!roomNumber || !roomName}>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
