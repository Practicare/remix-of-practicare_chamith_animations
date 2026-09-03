import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock, MapPin, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Shift, SHIFT_ROLES, SHIFT_LOCATIONS } from "@/types/roster";

interface TeamMember {
  id: string;
  name: string;
  departmentId?: string;
}

interface EditShiftDialogProps {
  shift: Shift | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamMembers: TeamMember[];
  onSave: (shiftId: string, updates: Partial<Shift>) => void;
  onDelete: (shiftId: string) => void;
}

export function EditShiftDialog({
  shift,
  open,
  onOpenChange,
  teamMembers,
  onSave,
  onDelete,
}: EditShiftDialogProps) {
  const [teamMemberId, setTeamMemberId] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (shift) {
      setTeamMemberId(shift.teamMemberId);
      setDate(new Date(shift.date));
      setStartTime(shift.startTime);
      setEndTime(shift.endTime);
      setRole(shift.role);
      setLocation(shift.location);
      setNotes(shift.notes || "");
    }
  }, [shift]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shift || !date || !role || !location) return;
    const member = teamMembers.find((m) => m.id === teamMemberId);
    onSave(shift.id, {
      teamMemberId,
      teamMemberName: member?.name || shift.teamMemberName,
      date, startTime, endTime, role, location,
      notes: notes || undefined,
    });
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!shift) return;
    onDelete(shift.id);
    onOpenChange(false);
  };

  const getShiftDuration = (): string => {
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins <= 0) return "—";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h${m > 0 ? ` ${m}m` : ""}`;
  };

  if (!shift) return null;

  const memberInitial = shift.teamMemberName.charAt(0).toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] p-0 gap-0 overflow-hidden">
        {/* Visual header */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg">
              {memberInitial}
            </div>
            <div className="flex-1 min-w-0">
              <DialogHeader className="text-left space-y-0.5">
                <DialogTitle className="text-base">{shift.teamMemberName}</DialogTitle>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{shift.startTime} – {shift.endTime}</span>
                  <span>·</span>
                  <span>{date ? format(date, "EEE, MMM d") : ""}</span>
                </div>
              </DialogHeader>
            </div>
            <Badge variant="outline" className="text-[10px] shrink-0">{shift.role}</Badge>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 pt-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Team Member</Label>
            <Select value={teamMemberId} onValueChange={setTeamMemberId}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-9", !date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                  {date ? format(date, "EEEE, MMMM d, yyyy") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Start Time</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className="h-9" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">End Time</Label>
              <div className="relative">
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required className="h-9" />
                <Badge variant="secondary" className="absolute -top-2 -right-1 text-[9px] px-1 py-0">{getShiftDuration()}</Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  {SHIFT_ROLES.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Select location" /></SelectTrigger>
                <SelectContent>
                  {SHIFT_LOCATIONS.map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." rows={2} className="resize-none text-sm" />
          </div>

          <Separator />

          <DialogFooter className="flex-row justify-between sm:justify-between gap-2 pt-1">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this shift?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove {shift.teamMemberName}'s shift on {date ? format(date, "EEEE, MMM d") : ""} ({startTime}–{endTime}).
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Shift</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete Shift
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={!teamMemberId || !date || !role || !location}>
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
