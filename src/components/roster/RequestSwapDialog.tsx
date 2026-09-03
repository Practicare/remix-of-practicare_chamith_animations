import { useState } from "react";
import { format } from "date-fns";
import { ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Shift, SwapRequest } from "@/types/roster";

interface TeamMember {
  id: string;
  name: string;
}

interface RequestSwapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: Shift | null;
  teamMembers: TeamMember[];
  onSubmitRequest: (request: Omit<SwapRequest, "id" | "createdAt" | "status">) => void;
}

export function RequestSwapDialog({
  open,
  onOpenChange,
  shift,
  teamMembers,
  onSubmitRequest,
}: RequestSwapDialogProps) {
  const [targetMemberId, setTargetMemberId] = useState<string>("");
  const [reason, setReason] = useState("");

  const availableMembers = teamMembers.filter((m) => m.id !== shift?.teamMemberId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shift || !reason) return;

    const targetMember = availableMembers.find((m) => m.id === targetMemberId);

    onSubmitRequest({
      shiftId: shift.id,
      requesterId: shift.teamMemberId,
      requesterName: shift.teamMemberName,
      targetMemberId: targetMemberId || undefined,
      targetMemberName: targetMember?.name,
      reason,
    });

    onOpenChange(false);
    setTargetMemberId("");
    setReason("");
  };

  if (!shift) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Request Shift Swap
          </DialogTitle>
          <DialogDescription>
            Submit a request to swap this shift with another team member
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Shift</span>
            <Badge variant="outline">{shift.role}</Badge>
          </div>
          <p className="font-medium">{shift.teamMemberName}</p>
          <div className="text-sm text-muted-foreground">
            {format(new Date(shift.date), "EEEE, MMMM d, yyyy")}
          </div>
          <div className="text-sm">
            {shift.startTime} - {shift.endTime} @ {shift.location}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Swap With (optional)</Label>
            <Select value={targetMemberId} onValueChange={setTargetMemberId}>
              <SelectTrigger>
                <SelectValue placeholder="Anyone available" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open request (anyone)</SelectItem>
                {availableMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Leave empty to request a swap with anyone available
            </p>
          </div>

          <div className="space-y-2">
            <Label>Reason for swap *</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why you need to swap this shift..."
              className="resize-none"
              rows={3}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!reason.trim()}>
              Submit Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
