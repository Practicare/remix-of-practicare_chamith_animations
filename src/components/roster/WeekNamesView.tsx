import { useMemo } from "react";
import { format, startOfWeek, addDays, isSameDay, isToday } from "date-fns";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Shift } from "@/types/roster";
import { memberColor } from "@/lib/memberColors";
import { ShiftHoverCard } from "./ShiftHoverCard";

interface WeekNamesViewProps {
  anchorDate: Date;
  shifts: Shift[];
  onShiftClick: (shift: Shift) => void;
  onDayClick?: (date: Date) => void;
  onAddClick: (date: Date) => void;
}

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

const shortTime = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hour12}:${String(m).padStart(2, "0")}${suffix}` : `${hour12}${suffix}`;
};

/** Week = who is on, by name. No time grid. */
export function WeekNamesView({
  anchorDate,
  shifts,
  onShiftClick,
  onDayClick,
  onAddClick,
}: WeekNamesViewProps) {
  const days = useMemo(() => {
    const start = startOfWeek(anchorDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [anchorDate]);

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-7">
        {days.map((day, idx) => {
          const dayShifts = shifts
            .filter((s) => isSameDay(new Date(s.date), day))
            .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "border-b sm:border-b-0 sm:border-r last:border-r-0 flex flex-col min-h-[180px]",
                isToday(day) && "bg-primary/[0.05]"
              )}
            >
              <button
                type="button"
                onClick={() => onDayClick?.(day)}
                className={cn(
                  "px-2 py-2 text-center border-b hover:bg-muted/60 transition-colors",
                  idx > 4 && "bg-muted/20"
                )}
              >
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {format(day, "EEE")}
                </div>
                <div className={cn("text-sm font-semibold", isToday(day) && "text-primary")}>
                  {format(day, "d MMM")}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {dayShifts.length} on
                </div>
              </button>

              <div className="p-1.5 space-y-1 flex-1">
                {dayShifts.length === 0 && (
                  <p className="text-[11px] text-muted-foreground text-center py-3">No one on</p>
                )}
                {dayShifts.map((shift) => {
                  const colour = memberColor(shift.teamMemberId || shift.teamMemberName);
                  return (
                    <ShiftHoverCard key={shift.id} shift={shift}>
                      <button
                        type="button"
                        onClick={() => onShiftClick(shift)}
                        className="w-full text-left rounded-lg border hover:brightness-95 transition-all px-2 py-1 flex items-center gap-2"
                        style={{ backgroundColor: colour.soft, borderColor: colour.border }}
                      >
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: colour.bg }}
                        />
                        <span className="min-w-0">
                          <span className="block text-[12px] font-medium leading-tight truncate">
                            {shift.teamMemberName}
                          </span>
                          <span className="block text-[10px] text-muted-foreground truncate">
                            {shortTime(shift.startTime)}–{shortTime(shift.endTime)}
                          </span>
                        </span>
                      </button>
                    </ShiftHoverCard>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => onAddClick(day)}
                className="flex items-center justify-center gap-1 py-1.5 text-[11px] text-muted-foreground hover:text-primary hover:bg-primary/5 border-t transition-colors"
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
