import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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

interface Department {
  id: string;
  name: string;
}

interface AddShiftDialogProps {
  rosterId: string;
  rosterStartDate: Date;
  rosterEndDate: Date;
  teamMembers: TeamMember[];
  departments?: Department[];
  onAddShift: (shift: Omit<Shift, "id">) => void;
  defaultDate?: Date;
  defaultStartTime?: string;
  defaultEndTime?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function AddShiftDialog({
  rosterId,
  rosterStartDate,
  rosterEndDate,
  teamMembers,
  departments = [],
  onAddShift,
  defaultDate,
  defaultStartTime = "09:00",
  defaultEndTime = "17:00",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
}: AddShiftDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState<Date | undefined>(defaultDate);
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  // Keep local fields in sync when the dialog is opened externally (controlled mode),
  // where handleOpen is never invoked.
  useEffect(() => {
    if (open) {
      if (defaultDate) setDate(defaultDate);
      setStartTime(defaultStartTime);
      setEndTime(defaultEndTime);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultDate, defaultStartTime, defaultEndTime]);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      if (defaultDate) setDate(defaultDate);
      setStartTime(defaultStartTime);
      setEndTime(defaultEndTime);
    }
    if (!isOpen) {
      resetForm();
    }
    setOpen(isOpen);
  };


  const resetForm = () => {
    setSelectedIds([]);
    setSearch("");
    setDate(defaultDate);
    setStartTime(defaultStartTime);
    setEndTime(defaultEndTime);
    setRole("");
    setLocation("");
    setNotes("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const members = teamMembers.filter((m) => selectedIds.includes(m.id));
    if (members.length === 0 || !date) return;

    members.forEach((member) => {
      onAddShift({
        rosterId,
        teamMemberId: member.id,
        teamMemberName: member.name,
        date, startTime, endTime,
        breaks: [], role: role || "General", location: location || "Main Office",
        notes: notes || undefined,
        isOvertime: false,
        status: "scheduled",
      });
    });

    handleOpen(false);
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

  const toggleMember = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const filteredMembers = teamMembers.filter((m) =>
    m.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const groupedMembers =
    departments.length > 0
      ? [
          ...departments
            .map((d) => ({
              id: d.id,
              name: d.name,
              members: filteredMembers.filter((m) => m.departmentId === d.id),
            }))
            .filter((g) => g.members.length > 0),
          {
            id: "__other",
            name: "Other",
            members: filteredMembers.filter(
              (m) => !m.departmentId || !departments.some((d) => d.id === m.departmentId)
            ),
          },
        ].filter((g) => g.members.length > 0)
      : [{ id: "__all", name: "", members: filteredMembers }];

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Shift
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[460px] p-0 gap-0 overflow-hidden">
        {/* Visual header */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 pb-4">
          <DialogHeader className="text-left">
            <DialogTitle className="text-base flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              New Shift
            </DialogTitle>
            {defaultDate && (
              <p className="text-xs text-muted-foreground mt-1">
                Scheduling for <span className="font-medium text-foreground">{format(defaultDate, "EEEE, MMMM d, yyyy")}</span>
              </p>
            )}
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-5 pt-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">Team members</Label>
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Clear ({selectedIds.length})
                </button>
              )}
            </div>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search team members..."
              className="h-9"
            />
            <div className="max-h-[190px] overflow-y-auto rounded-lg border divide-y">
              {groupedMembers.length === 0 && (
                <p className="p-3 text-xs text-muted-foreground text-center">No matching members</p>
              )}
              {groupedMembers.map((group) => (
                <div key={group.id}>
                  {group.name && (
                    <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50">
                      {group.name}
                    </div>
                  )}
                  {group.members.map((member) => {
                    const checked = selectedIds.includes(member.id);
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => toggleMember(member.id)}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-1.5 text-left text-sm hover:bg-muted/60 transition-colors",
                          checked && "bg-primary/[0.07]"
                        )}
                      >
                        <span
                          className={cn(
                            "h-4 w-4 shrink-0 rounded border grid place-items-center",
                            checked ? "bg-primary border-primary" : "border-input"
                          )}
                        >
                          {checked && <Check className="h-3 w-3 text-primary-foreground" />}
                        </span>
                        <span className="truncate">{member.name}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Select as many people as you like — each gets a shift for this time slot.
            </p>
          </div>

          {/* Only show date picker when no defaultDate */}
          {!defaultDate && (
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
                  <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < rosterStartDate || d > rosterEndDate} initialFocus className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          )}

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
              <Label className="text-xs font-medium text-muted-foreground">Role (optional)</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="h-9"><SelectValue placeholder="General" /></SelectTrigger>
                <SelectContent>
                  {SHIFT_ROLES.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Location (optional)</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Main Office" /></SelectTrigger>
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

          <DialogFooter className="gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => handleOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={selectedIds.length === 0 || !date}>
              {selectedIds.length > 1 ? `Add ${selectedIds.length} shifts` : "Add Shift"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
