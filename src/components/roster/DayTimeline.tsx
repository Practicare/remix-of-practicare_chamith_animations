import { useMemo, useState, useRef, useEffect } from "react";
import { format, isSameDay, addDays, differenceInDays, eachDayOfInterval } from "date-fns";
import { Clock, MapPin, Coffee, AlertTriangle, ChevronLeft, ChevronRight, GripVertical, Pencil, Check, X, Plus, Trash2, CalendarDays, Calendar, Filter, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Roster, Shift, TimelineGroup, TimelineGroupMember } from "@/types/roster";
import { toast } from "@/hooks/use-toast";
import { AddTimelineGroupDialog } from "./TimelineGroupManager";
import { AddShiftPopover } from "./TimeSlotPopover";
import { ShiftInstructionsDialog } from "./ShiftInstructionsDialog";

interface TeamMember {
  id: string;
  name: string;
  role?: string;
  departmentId?: string;
}

interface Department {
  id: string;
  name: string;
}

type ViewMode = "1-day" | "3-day" | "5-day" | "7-day";

interface DayTimelineProps {
  roster: Roster;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onShiftClick: (shift: Shift) => void;
  onUpdateShiftTime?: (shiftId: string, startTime: string, endTime: string) => void;
  onAddShift?: (teamMemberId: string, teamMemberName: string, startTime: string, endTime: string, entryId?: string) => void;
  onDeleteShift?: (shiftId: string) => void;
  teamMembers: TeamMember[];
  departments?: Department[];
  // Filter props
  selectedDepartment?: string;
  onDepartmentChange?: (value: string) => void;
  selectedTeamMembers?: string[];
  onTeamMembersChange?: (members: string[]) => void;
  // Read-only mode (hides editing controls)
  readOnly?: boolean;
}

const HOUR_WIDTH_12H = 80; // pixels per hour in 12h mode
const HOUR_WIDTH_24H = 50; // pixels per hour in 24h mode (narrower to fit all 24)
const HOUR_WIDTH_MULTI_DAY = 40; // narrower for multi-day view
const START_HOUR_12H = 6; // 6 AM
const END_HOUR_12H = 22; // 10 PM
const START_HOUR_24H = 0; // Midnight
const END_HOUR_24H = 24; // Midnight next day

const VIEW_MODE_DAYS: Record<ViewMode, number> = {
  "1-day": 1,
  "3-day": 3,
  "5-day": 5,
  "7-day": 7,
};

// Custom scrollbar component for timeline
function TimelineScrollContainer({ 
  children, 
  minWidth 
}: { 
  children: React.ReactNode; 
  minWidth: number;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(20);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, scrollLeft: 0 });

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const updateScrollInfo = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        setScrollProgress(scrollLeft / maxScroll);
        setThumbWidth(Math.max(40, (clientWidth / scrollWidth) * 100));
      }
    };

    updateScrollInfo();
    container.addEventListener("scroll", updateScrollInfo);
    window.addEventListener("resize", updateScrollInfo);
    
    return () => {
      container.removeEventListener("scroll", updateScrollInfo);
      window.removeEventListener("resize", updateScrollInfo);
    };
  }, [minWidth]);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    const track = e.currentTarget;
    if (!container || !track) return;

    const rect = track.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const trackWidth = rect.width;
    const thumbWidthPx = (thumbWidth / 100) * trackWidth;
    const maxThumbLeft = trackWidth - thumbWidthPx;
    const newProgress = Math.max(0, Math.min(1, (clickX - thumbWidthPx / 2) / maxThumbLeft));
    
    const maxScroll = container.scrollWidth - container.clientWidth;
    container.scrollLeft = newProgress * maxScroll;
  };

  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      scrollLeft: scrollContainerRef.current?.scrollLeft || 0
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const deltaX = e.clientX - dragStartRef.current.x;
      const trackWidth = container.clientWidth;
      const thumbWidthPx = (thumbWidth / 100) * trackWidth;
      const maxThumbLeft = trackWidth - thumbWidthPx;
      const maxScroll = container.scrollWidth - container.clientWidth;
      
      const scrollDelta = (deltaX / maxThumbLeft) * maxScroll;
      container.scrollLeft = dragStartRef.current.scrollLeft + scrollDelta;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, thumbWidth]);

  const thumbLeft = `calc(${scrollProgress * (100 - thumbWidth)}%)`;

  return (
    <div className="flex flex-col">
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto overflow-y-hidden scrollbar-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div style={{ minWidth }}>
          {children}
        </div>
      </div>
      
      {/* Custom horizontal scrollbar */}
      <div 
        className="relative mt-4 mx-4 h-3 rounded-full bg-muted/50 cursor-pointer shadow-inner"
        onClick={handleTrackClick}
      >
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 h-6 rounded-full bg-background cursor-grab shadow-[0_2px_8px_rgba(0,0,0,0.15)] border border-border/50 transition-shadow",
            isDragging && "cursor-grabbing shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
          )}
          style={{
            left: thumbLeft,
            width: `${thumbWidth}%`,
            minWidth: "40px",
          }}
          onMouseDown={handleThumbMouseDown}
        />
      </div>
    </div>
  );
}

export function DayTimeline({ 
  roster, 
  selectedDate, 
  onDateChange, 
  onShiftClick, 
  onUpdateShiftTime, 
  onAddShift, 
  onDeleteShift, 
  teamMembers, 
  departments = [],
  selectedDepartment = "all",
  onDepartmentChange,
  selectedTeamMembers = [],
  onTeamMembersChange,
  readOnly = false,
}: DayTimelineProps) {
  const [resizing, setResizing] = useState<{ shiftId: string; edge: "start" | "end"; initialX: number; initialTime: string } | null>(null);
  const [dragging, setDragging] = useState<{ shiftId: string; initialX: number; initialStartTime: string; initialEndTime: string } | null>(null);
  const [is24Hour, setIs24Hour] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("1-day");
  
  // Calculate the days to display based on view mode
  const daysToShow = useMemo(() => {
    const numDays = VIEW_MODE_DAYS[viewMode];
    const rosterStart = new Date(roster.startDate);
    const rosterEnd = new Date(roster.endDate);
    
    // Calculate start date (centered around selected date when possible)
    let startDate = selectedDate;
    if (numDays > 1) {
      const offset = Math.floor((numDays - 1) / 2);
      startDate = addDays(selectedDate, -offset);
      
      // Ensure we don't go before roster start
      if (startDate < rosterStart) {
        startDate = rosterStart;
      }
      
      // Ensure we don't go past roster end
      const endDate = addDays(startDate, numDays - 1);
      if (endDate > rosterEnd) {
        startDate = addDays(rosterEnd, -(numDays - 1));
        if (startDate < rosterStart) {
          startDate = rosterStart;
        }
      }
    }
    
    return eachDayOfInterval({
      start: startDate,
      end: addDays(startDate, Math.min(numDays - 1, differenceInDays(rosterEnd, startDate))),
    });
  }, [selectedDate, viewMode, roster.startDate, roster.endDate]);
  
  // Get unique team member IDs from roster shifts for default group
  const rosterTeamMemberIds = useMemo(() => {
    const ids = new Set<string>();
    roster.shifts.forEach((shift) => ids.add(shift.teamMemberId));
    return Array.from(ids);
  }, [roster.shifts]);

  const [timelineGroups, setTimelineGroups] = useState<TimelineGroup[]>([
    { id: "default", name: "All Staff", teamMemberIds: [], members: [] }
  ]);
  
  // Update default group with roster team members when roster changes
  useEffect(() => {
    setTimelineGroups((prev) => 
      prev.map((group) => 
        group.id === "default" 
          ? { 
              ...group, 
              teamMemberIds: rosterTeamMemberIds,
              members: rosterTeamMemberIds.map((id) => {
                const member = teamMembers.find((m) => m.id === id);
                return {
                  entryId: `default-${id}`,
                  teamMemberId: id,
                  teamMemberName: member?.name || id,
                };
              }),
            }
          : group
      )
    );
  }, [rosterTeamMemberIds, teamMembers]);

  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState("");
  const [showInstructionsDialog, setShowInstructionsDialog] = useState(false);
  const [addedMembersCount, setAddedMembersCount] = useState(0);
  const [hideInstructions, setHideInstructions] = useState(() => {
    return localStorage.getItem("hideShiftInstructions") === "true";
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const [teamMemberSearchOpen, setTeamMemberSearchOpen] = useState(false);

  // Team member department map
  const teamMemberDepartmentMap = useMemo(() => {
    return teamMembers.reduce((acc, member) => {
      if (member.departmentId) {
        acc[member.id] = member.departmentId;
      }
      return acc;
    }, {} as Record<string, string>);
  }, [teamMembers]);

  // Filter team members based on selected department
  const filteredTeamMembersForSelector = useMemo(() => {
    if (selectedDepartment === "all") {
      return teamMembers;
    }
    return teamMembers.filter(member => member.departmentId === selectedDepartment);
  }, [selectedDepartment, teamMembers]);

  const hasActiveFilters = selectedDepartment !== "all" || selectedTeamMembers.length > 0;

  const toggleTeamMember = (memberId: string) => {
    if (!onTeamMembersChange) return;
    const newMembers = selectedTeamMembers.includes(memberId)
      ? selectedTeamMembers.filter(id => id !== memberId)
      : [...selectedTeamMembers, memberId];
    onTeamMembersChange(newMembers);
  };

  const removeTeamMember = (memberId: string) => {
    if (!onTeamMembersChange) return;
    onTeamMembersChange(selectedTeamMembers.filter(id => id !== memberId));
  };

  const clearAllFilters = () => {
    onDepartmentChange?.("all");
    onTeamMembersChange?.([]);
  };

  // Dynamic values based on 12h/24h mode and view mode
  const isMultiDay = viewMode !== "1-day";
  const HOUR_WIDTH = isMultiDay ? HOUR_WIDTH_MULTI_DAY : (is24Hour ? HOUR_WIDTH_24H : HOUR_WIDTH_12H);
  const START_HOUR = is24Hour ? START_HOUR_24H : START_HOUR_12H;
  const END_HOUR = is24Hour ? END_HOUR_24H : END_HOUR_12H;
  const TOTAL_HOURS = END_HOUR - START_HOUR;

  // Get shifts for a specific day (with filtering)
  const getShiftsForDay = (day: Date) => {
    return roster.shifts.filter((shift) => {
      const matchesDate = isSameDay(new Date(shift.date), day);
      if (!matchesDate) return false;
      
      const memberDepartment = teamMemberDepartmentMap[shift.teamMemberId];
      const matchesDepartment = selectedDepartment === "all" || memberDepartment === selectedDepartment;
      const matchesTeamMember = selectedTeamMembers.length === 0 || selectedTeamMembers.includes(shift.teamMemberId);
      
      return matchesDepartment && matchesTeamMember;
    });
  };

  const shiftsForDay = useMemo(() => {
    return roster.shifts.filter((shift) => {
      const matchesDate = isSameDay(new Date(shift.date), selectedDate);
      if (!matchesDate) return false;
      
      const memberDepartment = teamMemberDepartmentMap[shift.teamMemberId];
      const matchesDepartment = selectedDepartment === "all" || memberDepartment === selectedDepartment;
      const matchesTeamMember = selectedTeamMembers.length === 0 || selectedTeamMembers.includes(shift.teamMemberId);
      
      return matchesDepartment && matchesTeamMember;
    });
  }, [roster.shifts, selectedDate, selectedDepartment, selectedTeamMembers, teamMemberDepartmentMap]);

  // Get shifts for a specific group - uses members array for independence
  const getShiftsForGroup = (group: TimelineGroup): Shift[] => {
    if (group.members.length === 0) {
      return []; // Show no shifts if no members added to this group
    }
    const memberIds = group.members.map((m) => m.teamMemberId);
    return shiftsForDay.filter((shift) => memberIds.includes(shift.teamMemberId));
  };

  // Group shifts by member entry for a specific group (allows same member to appear independently)
  const getShiftsByMemberForGroup = (group: TimelineGroup): Map<string, { member: TimelineGroupMember; shifts: Shift[] }> => {
    const grouped = new Map<string, { member: TimelineGroupMember; shifts: Shift[] }>();
    
    group.members.forEach((member) => {
      // Filter shifts by entryId for true independence, fallback to teamMemberId for legacy shifts
      const memberShifts = shiftsForDay.filter((shift) => {
        if (shift.entryId) {
          return shift.entryId === member.entryId;
        }
        // Fallback for legacy shifts without entryId (only for default group)
        return group.id === "default" && shift.teamMemberId === member.teamMemberId;
      });
      grouped.set(member.entryId, { member, shifts: memberShifts });
    });
    
    return grouped;
  };

  const handleAddGroup = (group: Omit<TimelineGroup, "id">) => {
    const newGroup: TimelineGroup = {
      ...group,
      id: `group-${Date.now()}`,
    };
    setTimelineGroups((prev) => [...prev, newGroup]);
    toast({
      title: "Timeline Group Added",
      description: `"${group.name}" has been created.`,
    });
  };

  const handleRenameGroup = (id: string, name: string) => {
    setTimelineGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, name } : g))
    );
  };

  const handleRemoveGroup = (id: string) => {
    if (timelineGroups.length <= 1) {
      toast({
        title: "Cannot Remove",
        description: "You must have at least one timeline group.",
        variant: "destructive",
      });
      return;
    }
    setTimelineGroups((prev) => prev.filter((g) => g.id !== id));
    toast({
      title: "Group Removed",
    });
  };

  const handleAddShiftsForMembers = (memberIds: string[], groupId: string) => {
    if (!onAddShift) return;
    
    const defaultStartTime = "09:00";
    const defaultEndTime = "17:00";
    
    // Create unique entry IDs for each new member
    const newMembers: TimelineGroupMember[] = memberIds.map((memberId, index) => {
      const member = teamMembers.find((m) => m.id === memberId);
      return {
        entryId: `${groupId}-${memberId}-${Date.now()}-${index}`,
        teamMemberId: memberId,
        teamMemberName: member?.name || memberId,
      };
    });
    
    // Add member entries to the group's members array (with unique entryIds)
    setTimelineGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        
        return {
          ...g,
          teamMemberIds: [...new Set([...g.teamMemberIds, ...memberIds])],
          members: [...g.members, ...newMembers],
        };
      })
    );
    
    // Create shifts with entryId for each new member entry
    newMembers.forEach((newMember) => {
      const member = teamMembers.find((m) => m.id === newMember.teamMemberId);
      if (member) {
        onAddShift(member.id, member.name, defaultStartTime, defaultEndTime, newMember.entryId);
      }
    });
    
    // Show instructions dialog only if not hidden
    if (!hideInstructions) {
      setAddedMembersCount(memberIds.length);
      setShowInstructionsDialog(true);
    }
  };

  const getShiftPosition = (shift: Shift) => {
    const [startHour, startMin] = shift.startTime.split(":").map(Number);
    const [endHour, endMin] = shift.endTime.split(":").map(Number);
    
    const startOffset = Math.max(0, (startHour - START_HOUR) + startMin / 60);
    const endOffset = Math.min(TOTAL_HOURS, (endHour - START_HOUR) + endMin / 60);
    const duration = endOffset - startOffset;
    
    return {
      left: startOffset * HOUR_WIDTH,
      width: duration * HOUR_WIDTH,
    };
  };

  const pixelToTime = (pixels: number): string => {
    const totalMinutes = (pixels / HOUR_WIDTH) * 60;
    const hours = Math.floor(totalMinutes / 60) + START_HOUR;
    const minutes = Math.round(totalMinutes % 60 / 15) * 15; // Snap to 15-min intervals
    const clampedHours = Math.max(START_HOUR, Math.min(END_HOUR, hours));
    const clampedMinutes = minutes >= 60 ? 0 : minutes;
    return `${clampedHours.toString().padStart(2, "0")}:${clampedMinutes.toString().padStart(2, "0")}`;
  };

  const getShiftColor = (shift: Shift): string => {
    if (shift.isOvertime) return "bg-destructive/20 border-destructive text-destructive-foreground";
    switch (shift.status) {
      case "confirmed":
        return "bg-success/20 border-success text-success-foreground";
      case "swap-requested":
        return "bg-warning/20 border-warning text-warning-foreground";
      default:
        return "bg-primary/20 border-primary text-primary-foreground";
    }
  };

  const handleResizeStart = (e: React.MouseEvent, shiftId: string, edge: "start" | "end", currentTime: string) => {
    e.stopPropagation();
    e.preventDefault();
    setResizing({ shiftId, edge, initialX: e.clientX, initialTime: currentTime });
  };

  const handleResizeMove = (e: React.MouseEvent) => {
    if (!resizing || !containerRef.current) return;
    
    const shift = shiftsForDay.find(s => s.id === resizing.shiftId);
    if (!shift) return;

    const deltaX = e.clientX - resizing.initialX;
    const [initHour, initMin] = resizing.initialTime.split(":").map(Number);
    const initPixels = ((initHour - START_HOUR) + initMin / 60) * HOUR_WIDTH;
    const newPixels = initPixels + deltaX;
    const newTime = pixelToTime(newPixels);

    if (resizing.edge === "start") {
      // Ensure start doesn't go past end
      if (newTime < shift.endTime) {
        onUpdateShiftTime?.(shift.id, newTime, shift.endTime);
      }
    } else {
      // Ensure end doesn't go before start
      if (newTime > shift.startTime) {
        onUpdateShiftTime?.(shift.id, shift.startTime, newTime);
      }
    }
  };

  const handleResizeEnd = () => {
    if (resizing) {
      const shift = shiftsForDay.find(s => s.id === resizing.shiftId);
      if (shift) {
        toast({
          title: "Shift Updated",
          description: `${shift.teamMemberName}: ${shift.startTime} - ${shift.endTime}`,
        });
      }
      setResizing(null);
    }
  };

  const handleDragStart = (e: React.MouseEvent, shift: Shift) => {
    e.stopPropagation();
    e.preventDefault();
    setDragging({
      shiftId: shift.id,
      initialX: e.clientX,
      initialStartTime: shift.startTime,
      initialEndTime: shift.endTime,
    });
  };

  const handleDragMove = (e: React.MouseEvent) => {
    if (!dragging || !containerRef.current) return;

    const shift = shiftsForDay.find(s => s.id === dragging.shiftId);
    if (!shift) return;

    const deltaX = e.clientX - dragging.initialX;
    
    // Calculate new start time
    const [startHour, startMin] = dragging.initialStartTime.split(":").map(Number);
    const startPixels = ((startHour - START_HOUR) + startMin / 60) * HOUR_WIDTH;
    const newStartPixels = startPixels + deltaX;
    const newStartTime = pixelToTime(Math.max(0, newStartPixels));

    // Calculate new end time (maintain duration)
    const [endHour, endMin] = dragging.initialEndTime.split(":").map(Number);
    const endPixels = ((endHour - START_HOUR) + endMin / 60) * HOUR_WIDTH;
    const newEndPixels = endPixels + deltaX;
    const newEndTime = pixelToTime(Math.min(TOTAL_HOURS * HOUR_WIDTH, newEndPixels));

    // Only update if both times are valid
    if (newStartTime < newEndTime) {
      onUpdateShiftTime?.(shift.id, newStartTime, newEndTime);
    }
  };

  const handleDragEnd = () => {
    if (dragging) {
      const shift = shiftsForDay.find(s => s.id === dragging.shiftId);
      if (shift) {
        toast({
          title: "Shift Moved",
          description: `${shift.teamMemberName}: ${shift.startTime} - ${shift.endTime}`,
        });
      }
      setDragging(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (resizing) {
      handleResizeMove(e);
    } else if (dragging) {
      handleDragMove(e);
    }
  };

  const handleMouseUp = () => {
    handleResizeEnd();
    handleDragEnd();
  };

  const formatTime = (time: string): string => {
    if (is24Hour) return time;
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const formatHourHeader = (hour: number): string => {
    if (is24Hour) return `${hour.toString().padStart(2, "0")}:00`;
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour} ${period}`;
  };

  const hours = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => START_HOUR + i);

  const handlePrevPeriod = () => {
    const numDays = VIEW_MODE_DAYS[viewMode];
    const newDate = addDays(selectedDate, -numDays);
    if (newDate >= new Date(roster.startDate)) {
      onDateChange(newDate);
    } else {
      onDateChange(new Date(roster.startDate));
    }
  };

  const handleNextPeriod = () => {
    const numDays = VIEW_MODE_DAYS[viewMode];
    const newDate = addDays(selectedDate, numDays);
    if (newDate <= new Date(roster.endDate)) {
      onDateChange(newDate);
    } else {
      onDateChange(new Date(roster.endDate));
    }
  };

  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  
  const getNowPosition = (day: Date) => {
    const isDayToday = isSameDay(day, new Date());
    if (isDayToday && currentHour >= START_HOUR && currentHour <= END_HOUR) {
      return ((currentHour - START_HOUR) + currentMinute / 60) * HOUR_WIDTH;
    }
    return null;
  };
  
  // Calculate total shifts across all days being shown
  const totalShiftsInView = useMemo(() => {
    return daysToShow.reduce((total, day) => total + getShiftsForDay(day).length, 0);
  }, [daysToShow, roster.shifts, selectedDepartment, selectedTeamMembers, teamMemberDepartmentMap]);

  return (
    <div className="space-y-4">
      {/* Date navigation and controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handlePrevPeriod}
            disabled={isSameDay(daysToShow[0], new Date(roster.startDate))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[200px] text-center">
            {isMultiDay ? (
              <span className="font-medium">
                {format(daysToShow[0], "MMM d")} - {format(daysToShow[daysToShow.length - 1], "MMM d, yyyy")}
              </span>
            ) : (
              <span className="font-medium">{format(selectedDate, "EEEE, MMMM d")}</span>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleNextPeriod}
            disabled={isSameDay(daysToShow[daysToShow.length - 1], new Date(roster.endDate))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          {/* View mode selector */}
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-day">1 Day</SelectItem>
                <SelectItem value="3-day">3 Days</SelectItem>
                <SelectItem value="5-day">5 Days</SelectItem>
                <SelectItem value="7-day">7 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* 12h/24h toggle */}
          <div className="flex items-center gap-2 border rounded-lg p-1">
            <Button
              variant={!is24Hour ? "default" : "ghost"}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setIs24Hour(false)}
            >
              12h
            </Button>
            <Button
              variant={is24Hour ? "default" : "ghost"}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setIs24Hour(true)}
            >
              24h
            </Button>
          </div>
          <Badge variant="outline">
            {totalShiftsInView} shift{totalShiftsInView !== 1 ? "s" : ""}
          </Badge>
          <AddTimelineGroupDialog onAddGroup={handleAddGroup} />
        </div>
      </div>

      {/* Filters Row */}
      {onDepartmentChange && onTeamMembersChange && (
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          
          {/* Department filter */}
          <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
            <SelectTrigger className="w-[160px] h-8">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Team members filter */}
          <Popover open={teamMemberSearchOpen} onOpenChange={setTeamMemberSearchOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-2">
                <User className="h-4 w-4" />
                {selectedTeamMembers.length > 0 ? (
                  <span>{selectedTeamMembers.length} selected</span>
                ) : (
                  <span>Team Members</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search team members..." />
                <CommandList>
                  <CommandEmpty>No team member found.</CommandEmpty>
                  <CommandGroup>
                    {filteredTeamMembersForSelector.map((member) => (
                      <CommandItem
                        key={member.id}
                        value={member.name}
                        onSelect={() => toggleTeamMember(member.id)}
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            selectedTeamMembers.includes(member.id)
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50 [&_svg]:invisible"
                          )}
                        >
                          <Check className="h-4 w-4" />
                        </div>
                        <span>{member.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Selected team member badges */}
          {selectedTeamMembers.map((memberId) => {
            const member = teamMembers.find((m) => m.id === memberId);
            return (
              <Badge key={memberId} variant="secondary" className="gap-1 pr-1">
                {member?.name || memberId}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 hover:bg-transparent"
                  onClick={() => removeTeamMember(memberId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={clearAllFilters}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Timeline Groups - each as its own wrapper container */}
      {timelineGroups.map((group) => {
        const groupShifts = getShiftsForGroup(group);
        const shiftsByMember = getShiftsByMemberForGroup(group);

        return (
          <div key={group.id} className="rounded-lg border bg-card shadow-sm">
            {/* Group header bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {editingGroupId === group.id ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={editingGroupName}
                      onChange={(e) => setEditingGroupName(e.target.value)}
                      className="h-7 w-40 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (editingGroupName.trim()) {
                            handleRenameGroup(group.id, editingGroupName.trim());
                          }
                          setEditingGroupId(null);
                        }
                        if (e.key === "Escape") {
                          setEditingGroupId(null);
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        if (editingGroupName.trim()) {
                          handleRenameGroup(group.id, editingGroupName.trim());
                        }
                        setEditingGroupId(null);
                      }}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setEditingGroupId(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="font-medium">{group.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-50 hover:opacity-100"
                      onClick={() => {
                        setEditingGroupId(group.id);
                        setEditingGroupName(group.name);
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs font-normal">
                  {groupShifts.length} shift{groupShifts.length !== 1 ? "s" : ""}
                </Badge>
                <AddShiftPopover
                  teamMembers={teamMembers}
                  departments={departments}
                  onAddShifts={(memberIds) => handleAddShiftsForMembers(memberIds, group.id)}
                />
                {timelineGroups.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveGroup(group.id)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
            <div className="p-4">
              {isMultiDay ? (
                /* Multi-day view */
                <div className="space-y-4">
                  {daysToShow.map((day) => {
                    const dayShifts = getShiftsForDay(day).filter((s) => 
                      group.teamMemberIds.length === 0 || group.teamMemberIds.includes(s.teamMemberId)
                    );
                    const isDayToday = isSameDay(day, new Date());
                    const nowPos = getNowPosition(day);

                    // Group shifts by member for this day
                    const dayShiftsByMember = new Map<string, Shift[]>();
                    dayShifts.forEach((shift) => {
                      const existing = dayShiftsByMember.get(shift.teamMemberId) || [];
                      dayShiftsByMember.set(shift.teamMemberId, [...existing, shift]);
                    });

                    return (
                      <div key={day.toISOString()} className={cn(
                        "rounded-lg border p-3",
                        isDayToday && "border-primary bg-primary/5"
                      )}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-medium",
                              isDayToday && "text-primary"
                            )}>
                              {format(day, "EEE, MMM d")}
                            </span>
                            {isDayToday && (
                              <Badge variant="default" className="text-[10px]">Today</Badge>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {dayShifts.length} shift{dayShifts.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                        
                        <TimelineScrollContainer
                          minWidth={Math.max(800, TOTAL_HOURS * HOUR_WIDTH + 140)}
                        >
                          {/* Time header */}
                          <div className="flex border-b pb-2 mb-3">
                            <div className="w-[120px] flex-shrink-0 text-xs font-medium text-muted-foreground">
                              Staff
                            </div>
                            <div className="flex-1 relative" style={{ width: TOTAL_HOURS * HOUR_WIDTH }}>
                              <div className="flex">
                                {hours.filter((_, i) => i % 2 === 0).map((hour) => (
                                  <div
                                    key={hour}
                                    className="text-[10px] text-muted-foreground text-center"
                                    style={{ width: HOUR_WIDTH * 2 }}
                                  >
                                    {formatHourHeader(hour)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          <div 
                            ref={containerRef}
                            className={cn("space-y-1", (resizing || dragging) && "select-none")}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                          >
                            {dayShifts.length === 0 ? (
                              <div className="text-center py-4 text-muted-foreground text-sm">
                                No shifts scheduled
                              </div>
                            ) : (
                              Array.from(dayShiftsByMember.entries()).map(([memberId, shifts]) => (
                                <div key={memberId} className="flex items-center">
                                  <div className="w-[120px] flex-shrink-0 pr-2">
                                    <p className="text-xs font-medium truncate">
                                      {shifts[0].teamMemberName}
                                    </p>
                                  </div>
                                  <div
                                    className="flex-1 relative h-8 bg-background/50 rounded"
                                    style={{ width: TOTAL_HOURS * HOUR_WIDTH }}
                                  >
                                    {/* Hour grid lines */}
                                    {hours.map((hour) => (
                                      <div
                                        key={hour}
                                        className="absolute top-0 bottom-0 border-l border-border/20"
                                        style={{ left: (hour - START_HOUR) * HOUR_WIDTH }}
                                      />
                                    ))}

                                    {/* Current time indicator */}
                                    {nowPos !== null && (
                                      <div
                                        className="absolute top-0 bottom-0 w-0.5 bg-destructive z-20"
                                        style={{ left: nowPos }}
                                      >
                                        <div className="absolute -top-0.5 -left-1 w-2 h-2 rounded-full bg-destructive" />
                                      </div>
                                    )}

                                    {/* Shifts */}
                                    {shifts.map((shift) => {
                                      const pos = getShiftPosition(shift);
                                      return (
                                        <Tooltip key={shift.id}>
                                          <TooltipTrigger asChild>
                                            <div
                                              onClick={() => onShiftClick(shift)}
                                              className={cn(
                                                "absolute top-0.5 bottom-0.5 rounded border cursor-pointer flex items-center px-2 overflow-hidden",
                                                getShiftColor(shift),
                                                "hover:shadow-md hover:ring-1 hover:ring-primary/50"
                                              )}
                                              style={{
                                                left: pos.left,
                                                width: Math.max(pos.width, 40),
                                              }}
                                            >
                                              <span className="text-[10px] font-medium truncate">
                                                {formatTime(shift.startTime)}-{formatTime(shift.endTime)}
                                              </span>
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent side="top">
                                            <div className="space-y-1">
                                              <p className="font-medium">{shift.teamMemberName}</p>
                                              <p className="text-xs">{shift.startTime} - {shift.endTime}</p>
                                              <p className="text-xs text-muted-foreground">{shift.role} @ {shift.location}</p>
                                            </div>
                                          </TooltipContent>
                                        </Tooltip>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </TimelineScrollContainer>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Single-day view */
                <TimelineScrollContainer
                  minWidth={Math.max(1200, TOTAL_HOURS * HOUR_WIDTH + 160)}
                >
                  {/* Time header */}
                  <div className="flex border-b pb-2 mb-4">
                    <div className="w-[140px] flex-shrink-0 text-sm font-medium text-muted-foreground">
                      Team Member
                    </div>
                    <div className="flex-1 relative" style={{ width: TOTAL_HOURS * HOUR_WIDTH }}>
                      <div className="flex">
                        {hours.map((hour) => (
                          <div
                            key={hour}
                            className="text-xs text-muted-foreground text-center"
                            style={{ width: HOUR_WIDTH }}
                          >
                            {formatHourHeader(hour)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Timeline content */}
                  <div 
                    ref={containerRef}
                    className={cn("space-y-2", (resizing || dragging) && "select-none")}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    {groupShifts.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No shifts in this group</p>
                      </div>
                    ) : (
                      Array.from(shiftsByMember.entries()).map(([entryId, { member, shifts }]) => {
                        const singleDayNowPos = getNowPosition(selectedDate);
                        return (
                          <div key={entryId} className="flex items-center">
                            <div className="w-[140px] flex-shrink-0 pr-4">
                              <p className="text-sm font-medium truncate">
                                {member.teamMemberName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {shifts[0]?.role || ""}
                              </p>
                            </div>
                            <div
                              className="flex-1 relative h-10 bg-background/50 rounded-lg"
                              style={{ width: TOTAL_HOURS * HOUR_WIDTH }}
                            >
                              {/* Hour grid lines */}
                              {hours.map((hour) => (
                                <div
                                  key={hour}
                                  className="absolute top-0 bottom-0 border-l border-border/30"
                                  style={{ left: (hour - START_HOUR) * HOUR_WIDTH }}
                                />
                              ))}

                              {/* Current time indicator */}
                              {singleDayNowPos !== null && (
                                <div
                                  className="absolute top-0 bottom-0 w-0.5 bg-destructive z-20"
                                  style={{ left: singleDayNowPos }}
                                >
                                  <div className="absolute -top-1 -left-1.5 w-3 h-3 rounded-full bg-destructive" />
                                </div>
                              )}

                              {/* Shifts */}
                              {shifts.map((shift) => {
                                const pos = getShiftPosition(shift);
                                return (
                                  <ContextMenu key={shift.id}>
                                    <ContextMenuTrigger asChild>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div
                                            onClick={() => !resizing && !dragging && onShiftClick(shift)}
                                            className={cn(
                                              "absolute top-0.5 bottom-0.5 rounded border transition-all flex items-center overflow-hidden group",
                                              getShiftColor(shift),
                                              resizing?.shiftId === shift.id && "cursor-ew-resize z-30",
                                              dragging?.shiftId === shift.id && "cursor-grabbing z-30 shadow-xl scale-105",
                                              !resizing && !dragging && "hover:shadow-lg hover:ring-2 hover:ring-primary/50 hover:scale-[1.02]"
                                            )}
                                            style={{
                                              left: pos.left,
                                              width: Math.max(pos.width, 60),
                                            }}
                                          >
                                            {/* Left resize handle */}
                                            <div
                                              onMouseDown={(e) => handleResizeStart(e, shift.id, "start", shift.startTime)}
                                              className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/10 transition-opacity z-10"
                                              title="Drag to change start time"
                                            >
                                              <GripVertical className="h-4 w-4 text-current opacity-60" />
                                            </div>

                                            {/* Shift content - draggable area */}
                                            <div 
                                              className={cn(
                                                "flex-1 min-w-0 px-4 cursor-grab active:cursor-grabbing",
                                                dragging?.shiftId === shift.id && "cursor-grabbing"
                                              )}
                                              onMouseDown={(e) => handleDragStart(e, shift)}
                                              title="Drag to move shift"
                                            >
                                              <div className="text-xs font-medium truncate">
                                                {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                                              </div>
                                              <div className="text-[10px] opacity-80 truncate flex items-center gap-1">
                                                <MapPin className="h-2.5 w-2.5" />
                                                {shift.location}
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-1 pr-4">
                                              {shift.breaks.length > 0 && (
                                                <Coffee className="h-3 w-3 opacity-60" />
                                              )}
                                              {shift.isOvertime && (
                                                <AlertTriangle className="h-3 w-3" />
                                              )}
                                              {onDeleteShift && (
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteShift(shift.id);
                                                    toast({
                                                      title: "Shift Deleted",
                                                      description: `Removed shift for ${shift.teamMemberName}`,
                                                    });
                                                  }}
                                                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 transition-all"
                                                  title="Delete shift"
                                                >
                                                  <Trash2 className="h-3 w-3 text-destructive" />
                                                </button>
                                              )}
                                            </div>

                                            {/* Right resize handle */}
                                            <div
                                              onMouseDown={(e) => handleResizeStart(e, shift.id, "end", shift.endTime)}
                                              className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/10 transition-opacity z-10"
                                              title="Drag to change end time"
                                            >
                                              <GripVertical className="h-4 w-4 text-current opacity-60" />
                                            </div>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                          <div className="space-y-1">
                                            <p className="font-medium">{shift.teamMemberName}</p>
                                            <p className="text-xs">
                                              {shift.startTime} - {shift.endTime} ({shift.role})
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              {shift.location}
                                            </p>
                                            {shift.breaks.length > 0 && (
                                              <p className="text-xs">
                                                {shift.breaks.length} break(s)
                                              </p>
                                            )}
                                            {shift.isOvertime && (
                                              <Badge variant="destructive" className="text-[10px]">
                                                Overtime
                                              </Badge>
                                            )}
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </ContextMenuTrigger>
                                    <ContextMenuContent>
                                      <ContextMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => {
                                          if (onDeleteShift) {
                                            onDeleteShift(shift.id);
                                            toast({
                                              title: "Shift Deleted",
                                              description: `Removed shift for ${shift.teamMemberName}`,
                                            });
                                          }
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Shift
                                      </ContextMenuItem>
                                    </ContextMenuContent>
                                  </ContextMenu>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-4 mt-6 pt-4 border-t flex-wrap">
                    <span className="text-xs text-muted-foreground">Legend:</span>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-primary/20 border-2 border-primary" />
                      <span className="text-xs">Scheduled</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-success/20 border-2 border-success" />
                      <span className="text-xs">Confirmed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-warning/20 border-2 border-warning" />
                      <span className="text-xs">Swap Requested</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-destructive/20 border-2 border-destructive" />
                      <span className="text-xs">Overtime</span>
                    </div>
                    {isSameDay(selectedDate, new Date()) && (
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-destructive" />
                        <span className="text-xs">Current Time</span>
                      </div>
                    )}
                  </div>
                </TimelineScrollContainer>
              )}
            </div>
          </div>
        );
      })}

      {/* Free space for popover visibility */}
      <div className="h-32" />

      {/* Instructions dialog */}
      <ShiftInstructionsDialog
        open={showInstructionsDialog}
        onOpenChange={setShowInstructionsDialog}
        addedCount={addedMembersCount}
        onDontShowAgain={(value) => {
          if (value) {
            localStorage.setItem("hideShiftInstructions", "true");
            setHideInstructions(true);
          }
        }}
      />
    </div>
  );
}
