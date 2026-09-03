import { useMemo, useState } from "react";
import {
  format,
  addDays,
  addWeeks,
  addMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isWithinInterval,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Send,
  Save,
  Trash2,
  FileDown,
  Palmtree,
  Users,
  Plus,
  ChevronDown,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { memberColor } from "@/lib/memberColors";
import { AddShiftDialog } from "@/components/roster/AddShiftDialog";
import { HolidayManager } from "@/components/roster/HolidayManager";
import { RosterScheduleView, ScheduleMode } from "@/components/roster/RosterScheduleView";
import { Roster, Shift, StaffHoliday, HolidayStatus } from "@/types/roster";
import { mockTeamMembersForRoster, mockDepartments } from "@/data/mockRosters";
import { exportRosterPDF } from "@/utils/rosterExport";
import { useOrgSite } from "@/contexts/OrgSiteContext";

interface RosterCardProps {
  roster: Roster;
  holidays: StaffHoliday[];
  onAddShift: (shift: Omit<Shift, "id">) => void;
  onShiftClick: (shift: Shift) => void;
  onPublish: (rosterId: string) => void;
  isDirty?: boolean;
  onSave: (rosterId: string) => void;
  onRename: (rosterId: string, name: string) => void;
  onDelete: (rosterId: string) => void;
  onAddHoliday: (holiday: Omit<StaffHoliday, "id" | "createdAt">) => void;
  onUpdateHolidayStatus: (id: string, status: HolidayStatus) => void;
  onEditHoliday: (id: string, updates: Partial<Omit<StaffHoliday, "id" | "createdAt">>) => void;
  onDeleteHoliday: (id: string) => void;
}

export function RosterCard({
  roster,
  holidays,
  onAddShift,
  onShiftClick,
  onPublish,
  isDirty = false,
  onSave,
  onRename,
  onDelete,
  onAddHoliday,
  onUpdateHolidayStatus,
  onEditHoliday,
  onDeleteHoliday,
}: RosterCardProps) {
  const { organization, currentSite } = useOrgSite();
  const [tab, setTab] = useState<"schedule" | "holidays">("schedule");
  const [mode, setMode] = useState<ScheduleMode>("week");
  const [anchorDate, setAnchorDate] = useState<Date>(new Date(roster.startDate));
  const [memberFilter, setMemberFilter] = useState<string[]>([]);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");

  const [addShiftOpen, setAddShiftOpen] = useState(false);
  const [slotDate, setSlotDate] = useState<Date | undefined>();
  const [slotStart, setSlotStart] = useState("09:00");
  const [slotEnd, setSlotEnd] = useState("17:00");

  const pendingHolidays = holidays.filter((h) => h.status === "pending").length;
  const activeDepartment = roster.departmentId ?? "all";

  const memberIdsInDepartment = useMemo(
    () =>
      new Set(
        mockTeamMembersForRoster
          .filter((m) => activeDepartment === "all" || m.departmentId === activeDepartment)
          .map((m) => m.id)
      ),
    [activeDepartment]
  );

  const filterableMembers = useMemo(
    () =>
      mockTeamMembersForRoster
        .filter((m) => activeDepartment === "all" || m.departmentId === activeDepartment)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [activeDepartment]
  );

  const toggleMemberFilter = (id: string) =>
    setMemberFilter((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const visibleShifts = useMemo(
    () =>
      roster.shifts.filter(
        (s) =>
          (activeDepartment === "all" || memberIdsInDepartment.has(s.teamMemberId)) &&
          (memberFilter.length === 0 || memberFilter.includes(s.teamMemberId))
      ),
    [roster.shifts, activeDepartment, memberIdsInDepartment, memberFilter]
  );

  const rangeShifts = useMemo(() => {
    if (mode === "day") return visibleShifts.filter((s) => isSameDay(new Date(s.date), anchorDate));
    const start = mode === "week" ? startOfWeek(anchorDate, { weekStartsOn: 1 }) : startOfMonth(anchorDate);
    const end = mode === "week" ? endOfWeek(anchorDate, { weekStartsOn: 1 }) : endOfMonth(anchorDate);
    return visibleShifts.filter((s) => isWithinInterval(new Date(s.date), { start, end }));
  }, [visibleShifts, mode, anchorDate]);

  const rangeLabel = useMemo(() => {
    if (mode === "day") return format(anchorDate, "EEEE, d MMMM yyyy");
    if (mode === "week") {
      const start = startOfWeek(anchorDate, { weekStartsOn: 1 });
      return `${format(start, "d MMM")} – ${format(addDays(start, 6), "d MMM yyyy")}`;
    }
    return format(anchorDate, "MMMM yyyy");
  }, [mode, anchorDate]);

  const shiftMembers = new Set(rangeShifts.map((s) => s.teamMemberId)).size;

  const navigate = (dir: -1 | 1) => {
    setAnchorDate((d) =>
      mode === "day" ? addDays(d, dir) : mode === "week" ? addWeeks(d, dir) : addMonths(d, dir)
    );
  };

  const handleSlotClick = (date: Date, hour: number) => {
    setSlotDate(date);
    setSlotStart(`${String(hour).padStart(2, "0")}:00`);
    setSlotEnd(`${String(Math.min(hour + 4, 23)).padStart(2, "0")}:00`);
    setAddShiftOpen(true);
  };

  const memberFilterLabel =
    memberFilter.length === 0
      ? "All team members"
      : memberFilter.length === 1
      ? filterableMembers.find((m) => m.id === memberFilter[0])?.name ?? "1 selected"
      : `${memberFilter.length} team members`;

  const membersFilter = (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-9 min-w-[180px] justify-between gap-2 rounded-lg font-normal text-sm"
        >
          <span className="flex items-center gap-2 truncate">
            <Users className="h-4 w-4 text-muted-foreground" />
            {memberFilterLabel}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[260px] p-0 bg-popover z-50">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <span className="text-xs font-medium">Filter by team member</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => setMemberFilter([])}
            disabled={memberFilter.length === 0}
          >
            Clear
          </Button>
        </div>
        <ScrollArea className="max-h-[260px]">
          <div className="p-1">
            {filterableMembers.map((m) => {
              const colour = memberColor(m.id);
              const checked = memberFilter.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleMemberFilter(m.id)}
                  className="w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-muted/60 transition-colors"
                >
                  <Checkbox checked={checked} className="pointer-events-none" />
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: colour.bg }} />
                  <span className="text-[13px] truncate">{m.name}</span>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Name row */}
      <div className="flex items-center gap-2 min-w-0 px-3 pt-3 pb-2">
        {editingName ? (
          <>
            <Input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onRename(roster.id, nameDraft.trim());
                  setEditingName(false);
                }
                if (e.key === "Escape") setEditingName(false);
              }}
              className="h-9 max-w-xs text-base font-semibold"
            />
            <Button
              size="icon"
              className="h-9 w-9"
              onClick={() => {
                onRename(roster.id, nameDraft.trim());
                setEditingName(false);
              }}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground"
              onClick={() => setEditingName(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold tracking-tight truncate">{roster.name}</h2>
            {roster.departmentName && (
              <span className="text-xs text-muted-foreground truncate">· {roster.departmentName}</span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
              onClick={() => {
                setNameDraft(roster.name);
                setEditingName(true);
              }}
              aria-label="Edit schedule name"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </>
        )}

        <div className="ml-auto flex items-center gap-2 shrink-0">
          <span className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className={`h-1.5 w-1.5 rounded-full ${roster.published ? "bg-primary" : "bg-muted-foreground/50"}`}
            />
            {isDirty ? "Unsaved changes" : roster.published ? "Published" : "Draft"}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5"
            onClick={() =>
              exportRosterPDF(roster, {
                name: currentSite.name,
                organisation: organization.name,
                address: currentSite.address,
                phone: currentSite.phone,
                email: currentSite.email,
              })
            }
          >
            <FileDown className="h-3.5 w-3.5" /> Export PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5"
            disabled={!isDirty}
            onClick={() => onSave(roster.id)}
          >
            <Save className="h-3.5 w-3.5" /> Save
          </Button>
          <Button
            size="sm"
            className="h-9 gap-1.5"
            disabled={!isDirty && roster.published}
            onClick={() => onPublish(roster.id)}
          >
            <Send className="h-3.5 w-3.5" /> Save &amp; publish
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete roster?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently deletes "{roster.name}" and all of its shifts.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(roster.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="px-3 pb-3">
        <SegmentedControl
          options={[
            { id: "schedule" as const, label: "Schedule", icon: CalendarIcon },
            {
              id: "holidays" as const,
              label: "Holidays",
              icon: Palmtree,
              badge: pendingHolidays > 0 ? pendingHolidays : undefined,
            },
          ]}
          value={tab}
          onChange={(v) => setTab(v as "schedule" | "holidays")}
          fullWidth
        />
      </div>

      {tab === "schedule" ? (
        <div className="border-t">
          <div className="p-3 border-b space-y-3">
            <div className="flex items-center gap-2 flex-wrap">{membersFilter}</div>
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => setAnchorDate(new Date())}
                >
                  Today
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{rangeLabel}</div>
                <div className="text-[11px] text-muted-foreground">
                  {rangeShifts.length} shifts · {shiftMembers} members
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <SegmentedControl
                  options={[
                    { id: "day" as const, label: "Day" },
                    { id: "week" as const, label: "Week" },
                    { id: "month" as const, label: "Month" },
                  ]}
                  value={mode}
                  onChange={(v) => setMode(v as ScheduleMode)}
                  size="sm"
                />
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => handleSlotClick(mode === "month" ? new Date() : anchorDate, 9)}
                >
                  <Plus className="h-3.5 w-3.5" /> Add shift
                </Button>
              </div>
            </div>
          </div>
          <div className="p-3">
            <RosterScheduleView
              mode={mode}
              anchorDate={anchorDate}
              shifts={visibleShifts}
              onShiftClick={onShiftClick}
              onSlotClick={handleSlotClick}
              onDayClick={(d) => {
                setAnchorDate(d);
                setMode("day");
              }}
            />
          </div>
        </div>
      ) : (
        <div className="p-3 border-t">
          <HolidayManager
            holidays={holidays}
            teamMembers={mockTeamMembersForRoster}
            onAddHoliday={onAddHoliday}
            onUpdateHolidayStatus={onUpdateHolidayStatus}
            onEditHoliday={onEditHoliday}
            onDeleteHoliday={onDeleteHoliday}
          />
        </div>
      )}

      <AddShiftDialog
        rosterId={roster.id}
        rosterStartDate={new Date(roster.startDate)}
        rosterEndDate={new Date(roster.endDate)}
        teamMembers={mockTeamMembersForRoster.filter(
          (m) => activeDepartment === "all" || m.departmentId === activeDepartment
        )}
        departments={mockDepartments}
        onAddShift={onAddShift}
        defaultDate={slotDate}
        defaultStartTime={slotStart}
        defaultEndTime={slotEnd}
        open={addShiftOpen}
        onOpenChange={setAddShiftOpen}
        trigger={<span className="hidden" />}
      />
    </div>
  );
}
