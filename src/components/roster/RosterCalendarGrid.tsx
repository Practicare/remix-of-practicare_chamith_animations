import { useMemo, useState } from "react";
import { format, eachDayOfInterval, isSameDay, isToday, addWeeks, startOfWeek, endOfWeek, addDays, subDays } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, User, Pencil, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Roster, Shift } from "@/types/roster";
import { mockDepartments, mockTeamMembersForRoster } from "@/data/mockRosters";

// Role color map using design tokens
const ROLE_COLORS: Record<string, string> = {
  Receptionist: "bg-primary/10 text-primary border-primary/25",
  Nurse: "bg-success/10 text-success border-success/25",
  Doctor: "bg-secondary text-secondary-foreground border-secondary",
  Manager: "bg-warning/10 text-warning border-warning/25",
  Supervisor: "bg-accent/10 text-accent border-accent/25",
  Administrative: "bg-muted text-muted-foreground border-border",
  "Support Staff": "bg-muted text-muted-foreground border-border",
  Admin: "bg-muted text-muted-foreground border-border",
  Support: "bg-muted text-muted-foreground border-border",
  General: "bg-primary/10 text-primary border-primary/25",
};

const getRoleColor = (role: string) => ROLE_COLORS[role] || "bg-muted text-muted-foreground border-border";

interface RosterCalendarGridProps {
  roster: Roster;
  onShiftClick: (shift: Shift) => void;
  onAddShiftForDate: (date: Date) => void;
}

export function RosterCalendarGrid({ roster, onShiftClick, onAddShiftForDate }: RosterCalendarGridProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  const currentWeekStart = useMemo(() => {
    const base = startOfWeek(new Date(roster.startDate), { weekStartsOn: 1 });
    return addWeeks(base, weekOffset);
  }, [roster.startDate, weekOffset]);

  const days = useMemo(() => {
    return eachDayOfInterval({
      start: currentWeekStart,
      end: endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
    });
  }, [currentWeekStart]);

  const getShiftsForDay = (date: Date): Shift[] => {
    return roster.shifts.filter((shift) => {
      const matchesDate = isSameDay(new Date(shift.date), date);
      if (!matchesDate) return false;
      if (selectedDepartment === "all") return true;
      const member = mockTeamMembersForRoster.find((m) => m.id === shift.teamMemberId);
      return member?.departmentId === selectedDepartment;
    });
  };

  const getShiftDuration = (shift: Shift): string => {
    const [sh, sm] = shift.startTime.split(":").map(Number);
    const [eh, em] = shift.endTime.split(":").map(Number);
    const mins = (eh * 60 + em) - (sh * 60 + sm);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h${m > 0 ? ` ${m}m` : ""}`;
  };

  const totalShifts = days.reduce((count, day) => count + getShiftsForDay(day).length, 0);
  const uniqueMembers = new Set(days.flatMap((day) => getShiftsForDay(day).map((s) => s.teamMemberId))).size;

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="hidden md:flex items-center justify-between gap-3 p-3 bg-muted/30 rounded-xl border">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekOffset((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="bg-card border rounded-lg px-4 py-1.5 min-w-[200px] text-center">
            <p className="text-sm font-semibold">{format(days[0], "MMM d")} – {format(days[6], "MMM d, yyyy")}</p>
          </div>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekOffset((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-xs h-7 text-primary" onClick={() => setWeekOffset(0)}>
            Today
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="h-8 w-[160px] text-xs bg-card">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {mockDepartments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 font-normal gap-1">
              <Users className="h-3 w-3" />
              {uniqueMembers}
            </Badge>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 font-normal gap-1">
              <Clock className="h-3 w-3" />
              {totalShifts} shifts
            </Badge>
          </div>
        </div>
      </div>

      {/* Desktop Week Grid */}
      <div className="hidden md:block">
        <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden border shadow-sm">
          {/* Day Headers */}
          {days.map((day) => {
            const dayShifts = getShiftsForDay(day);
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "px-2 py-2.5 text-center bg-card border-b",
                  isToday(day) && "bg-primary/5"
                )}
              >
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {format(day, "EEE")}
                </p>
                <p className={cn(
                  "text-lg font-bold mt-0.5 leading-none",
                  isToday(day) ? "text-primary" : "text-foreground"
                )}>
                  {format(day, "d")}
                </p>
                {dayShifts.length > 0 && (
                  <p className="text-[9px] text-muted-foreground mt-1">{dayShifts.length} shift{dayShifts.length !== 1 ? "s" : ""}</p>
                )}
              </div>
            );
          })}

          {/* Day Cells */}
          {days.map((day) => {
            const shifts = getShiftsForDay(day);
            const maxVisible = 5;
            const overflow = shifts.length - maxVisible;
            return (
              <div
                key={`cell-${day.toISOString()}`}
                className={cn(
                  "min-h-[160px] bg-card p-1.5 space-y-1 relative group transition-colors",
                  isToday(day) && "bg-primary/[0.02]"
                )}
              >
                {/* Add shift button - always visible */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-full text-[10px] font-medium gap-1 border-dashed border-primary/30 text-primary/70 hover:text-primary hover:bg-primary/5 hover:border-primary/50 transition-all"
                  onClick={() => onAddShiftForDate(day)}
                >
                  <Plus className="h-3 w-3" />
                  Add Shift
                </Button>

                {/* Shift Cards */}
                {shifts.slice(0, maxVisible).map((shift) => (
                  <button
                    key={shift.id}
                    onClick={() => onShiftClick(shift)}
                    className={cn(
                      "w-full text-left px-2 py-1.5 rounded-lg border text-[11px] leading-tight transition-all hover:shadow-md hover:-translate-y-px cursor-pointer group/card",
                      getRoleColor(shift.role)
                    )}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold truncate">{shift.teamMemberName.split(" ")[0]}</span>
                      <Pencil className="h-2.5 w-2.5 opacity-0 group-hover/card:opacity-60 transition-opacity shrink-0" />
                    </div>
                    <p className="opacity-75 mt-0.5 text-[10px]">
                      {shift.startTime}–{shift.endTime}
                    </p>
                  </button>
                ))}

                {/* Overflow indicator with popover */}
                {overflow > 0 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-full text-center text-[10px] font-medium text-primary hover:text-primary/80 py-0.5 rounded-md hover:bg-primary/5 transition-colors">
                        +{overflow} more
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0" side="right" align="start">
                      <div className="p-3 border-b">
                        <p className="text-sm font-semibold">{format(day, "EEEE, MMM d")}</p>
                        <p className="text-xs text-muted-foreground">{shifts.length} shifts</p>
                      </div>
                      <ScrollArea className="max-h-[240px]">
                        <div className="p-2 space-y-1">
                          {shifts.map((shift) => (
                            <button
                              key={shift.id}
                              onClick={() => onShiftClick(shift)}
                              className="w-full text-left p-2 rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-2"
                            >
                              <div className={cn("w-1.5 h-8 rounded-full shrink-0", getRoleColor(shift.role).split(" ")[0])} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{shift.teamMemberName}</p>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                                  <span>{shift.startTime}–{shift.endTime}</span>
                                  <span>·</span>
                                  <span>{shift.role}</span>
                                </div>
                              </div>
                              <Pencil className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                      <div className="p-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full gap-1.5 text-xs h-7 text-primary"
                          onClick={() => onAddShiftForDate(day)}
                        >
                          <Plus className="h-3 w-3" /> Add Shift
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

                {/* Empty state */}
                {shifts.length === 0 && (
                  <div className="flex-1 flex items-center justify-center min-h-[100px]">
                    <p className="text-[10px] text-muted-foreground/40 font-medium">No shifts</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Role Legend */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Roles:</span>
          {["Receptionist", "Nurse", "Doctor", "Manager"].map((role) => (
            <div key={role} className="flex items-center gap-1.5">
              <div className={cn("w-2.5 h-2.5 rounded-sm border", getRoleColor(role))} />
              <span className="text-[10px] text-muted-foreground">{role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: Single Day View */}
      <MobileDayView
        roster={roster}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={setSelectedDepartment}
        onShiftClick={onShiftClick}
        onAddShiftForDate={onAddShiftForDate}
      />
    </div>
  );
}

// Enhanced mobile day view
function MobileDayView({
  roster,
  selectedDepartment,
  onDepartmentChange,
  onShiftClick,
  onAddShiftForDate,
}: {
  roster: Roster;
  selectedDepartment: string;
  onDepartmentChange: (dept: string) => void;
  onShiftClick: (shift: Shift) => void;
  onAddShiftForDate: (date: Date) => void;
}) {
  const [currentDay, setCurrentDay] = useState(new Date());

  const shifts = useMemo(() => {
    return roster.shifts
      .filter((shift) => {
        const matchesDate = isSameDay(new Date(shift.date), currentDay);
        if (!matchesDate) return false;
        if (selectedDepartment === "all") return true;
        const member = mockTeamMembersForRoster.find((m) => m.id === shift.teamMemberId);
        return member?.departmentId === selectedDepartment;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [roster.shifts, currentDay, selectedDepartment]);

  const getShiftDuration = (shift: Shift): string => {
    const [sh, sm] = shift.startTime.split(":").map(Number);
    const [eh, em] = shift.endTime.split(":").map(Number);
    const mins = (eh * 60 + em) - (sh * 60 + sm);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h${m > 0 ? ` ${m}m` : ""}`;
  };

  return (
    <div className="md:hidden space-y-3">
      {/* Day Navigator */}
      <div className="flex items-center justify-between bg-muted/30 rounded-xl p-3 border">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentDay((d) => subDays(d, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <p className={cn("text-sm font-bold", isToday(currentDay) && "text-primary")}>
            {isToday(currentDay) ? "Today" : format(currentDay, "EEEE")}
          </p>
          <p className="text-xs text-muted-foreground">{format(currentDay, "MMM d, yyyy")}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentDay((d) => addDays(d, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {!isToday(currentDay) && (
        <Button variant="ghost" size="sm" className="w-full text-xs text-primary" onClick={() => setCurrentDay(new Date())}>
          Go to Today
        </Button>
      )}

      {/* Department filter */}
      <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
        <SelectTrigger className="h-9 text-xs">
          <SelectValue placeholder="All Departments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          {mockDepartments.map((dept) => (
            <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Shift count */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-medium text-muted-foreground">{shifts.length} shift{shifts.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Shift Cards */}
      <div className="space-y-2">
        {shifts.map((shift) => (
          <button
            key={shift.id}
            onClick={() => onShiftClick(shift)}
            className={cn(
              "w-full text-left p-3 rounded-xl border bg-card hover:bg-muted/30 transition-all active:scale-[0.99] shadow-sm",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Role color indicator */}
                <div className={cn("w-1 h-10 rounded-full shrink-0", getRoleColor(shift.role).split(" ")[0])} />
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{shift.teamMemberName}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {shift.startTime} – {shift.endTime}
                    </span>
                    <span className="text-border">·</span>
                    <span>{getShiftDuration(shift)}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", getRoleColor(shift.role))}>
                  {shift.role}
                </Badge>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <MapPin className="h-2.5 w-2.5" />
                  {shift.location}
                </span>
              </div>
            </div>
          </button>
        ))}

        {shifts.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No shifts scheduled</p>
            <p className="text-xs mt-1">Tap below to add a shift for this day</p>
          </div>
        )}
      </div>

      {/* Sticky add button */}
      <Button
        className="w-full gap-2 h-11 shadow-md"
        onClick={() => onAddShiftForDate(currentDay)}
      >
        <Plus className="h-4 w-4" />
        Add Shift for {isToday(currentDay) ? "Today" : format(currentDay, "EEE, MMM d")}
      </Button>
    </div>
  );
}
