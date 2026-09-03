import { useState } from "react";
import { format, isWithinInterval, isSameDay } from "date-fns";
import { CalendarIcon, Plus, Trash2, Palmtree, Check, X, AlertCircle, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { StaffHoliday, HolidayStatus } from "@/types/roster";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TeamMember {
  id: string;
  name: string;
  departmentId?: string;
}

interface HolidayManagerProps {
  holidays: StaffHoliday[];
  teamMembers: TeamMember[];
  onAddHoliday: (holiday: Omit<StaffHoliday, "id" | "createdAt">) => void;
  onUpdateHolidayStatus: (holidayId: string, status: HolidayStatus) => void;
  onEditHoliday: (holidayId: string, updates: Partial<Omit<StaffHoliday, "id" | "createdAt">>) => void;
  onDeleteHoliday: (holidayId: string) => void;
  isUserView?: boolean; // Hide approve/reject buttons for regular users
}

const statusColors: Record<HolidayStatus, string> = {
  approved: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export function HolidayManager({
  holidays,
  teamMembers,
  onAddHoliday,
  onUpdateHolidayStatus,
  onEditHoliday,
  onDeleteHoliday,
  isUserView = false,
}: HolidayManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<StaffHoliday | null>(null);
  const [teamMemberId, setTeamMemberId] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamMemberId || !startDate || !endDate) return;

    const member = teamMembers.find((m) => m.id === teamMemberId);
    if (!member) return;

    onAddHoliday({
      teamMemberId,
      teamMemberName: member.name,
      startDate,
      endDate,
      reason,
      status: "pending",
    });

    setDialogOpen(false);
    resetForm();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHoliday || !startDate || !endDate) return;

    const member = teamMembers.find((m) => m.id === teamMemberId);
    
    onEditHoliday(editingHoliday.id, {
      teamMemberId: teamMemberId || editingHoliday.teamMemberId,
      teamMemberName: member?.name || editingHoliday.teamMemberName,
      startDate,
      endDate,
      reason,
    });

    setEditDialogOpen(false);
    resetForm();
  };

  const openEditDialog = (holiday: StaffHoliday) => {
    setEditingHoliday(holiday);
    setTeamMemberId(holiday.teamMemberId);
    setStartDate(new Date(holiday.startDate));
    setEndDate(new Date(holiday.endDate));
    setReason(holiday.reason || "");
    setEditDialogOpen(true);
  };

  const resetForm = () => {
    setTeamMemberId("");
    setStartDate(undefined);
    setEndDate(undefined);
    setReason("");
    setEditingHoliday(null);
  };

  const pendingCount = holidays.filter((h) => h.status === "pending").length;
  const approvedCount = holidays.filter((h) => h.status === "approved").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Palmtree className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Holiday Schedule</h3>
            <p className="text-sm text-muted-foreground">
              {approvedCount} approved, {pendingCount} pending
            </p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Holiday
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Add Staff Holiday</DialogTitle>
              <DialogDescription>
                Schedule holiday leave for a team member. They won't be available for rostering during this period.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Team Member</Label>
                <Select value={teamMemberId} onValueChange={setTeamMemberId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PP") : "Pick date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PP") : "Pick date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        disabled={(d) => startDate ? d < startDate : false}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Annual leave, sick leave, personal leave..."
                  rows={2}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!teamMemberId || !startDate || !endDate}>
                  Add Holiday
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Holiday Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Edit Holiday</DialogTitle>
            <DialogDescription>
              Update the holiday details for this team member.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Team Member</Label>
              <Select value={teamMemberId} onValueChange={setTeamMemberId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PP") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PP") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(d) => startDate ? d < startDate : false}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Annual leave, sick leave, personal leave..."
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!startDate || !endDate}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {holidays.length > 0 ? (
        <ScrollArea className="h-[300px] border rounded-lg">
          <div className="p-3 space-y-2">
            {holidays.map((holiday) => (
              <div
                key={holiday.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{holiday.teamMemberName}</span>
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] capitalize", statusColors[holiday.status])}
                    >
                      {holiday.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(holiday.startDate), "PP")} — {format(new Date(holiday.endDate), "PP")}
                  </p>
                  {holiday.reason && (
                    <p className="text-xs text-muted-foreground mt-1">{holiday.reason}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {holiday.status === "pending" && !isUserView && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-success hover:text-success"
                        onClick={() => onUpdateHolidayStatus(holiday.id, "approved")}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => onUpdateHolidayStatus(holiday.id, "rejected")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                    onClick={() => openEditDialog(holiday)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => onDeleteHoliday(holiday.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="text-center py-8 border rounded-lg bg-muted/20">
          <Palmtree className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No holidays scheduled</p>
        </div>
      )}
    </div>
  );
}

// Utility function to check if a member is on holiday for a specific date
export function isOnHoliday(
  teamMemberId: string,
  date: Date,
  holidays: StaffHoliday[]
): boolean {
  return holidays.some(
    (holiday) =>
      holiday.teamMemberId === teamMemberId &&
      holiday.status === "approved" &&
      (isWithinInterval(date, {
        start: new Date(holiday.startDate),
        end: new Date(holiday.endDate),
      }) ||
        isSameDay(date, new Date(holiday.startDate)) ||
        isSameDay(date, new Date(holiday.endDate)))
  );
}

// Get holiday info for a member on a specific date
export function getHolidayForMember(
  teamMemberId: string,
  date: Date,
  holidays: StaffHoliday[]
): StaffHoliday | undefined {
  return holidays.find(
    (holiday) =>
      holiday.teamMemberId === teamMemberId &&
      holiday.status === "approved" &&
      (isWithinInterval(date, {
        start: new Date(holiday.startDate),
        end: new Date(holiday.endDate),
      }) ||
        isSameDay(date, new Date(holiday.startDate)) ||
        isSameDay(date, new Date(holiday.endDate)))
  );
}