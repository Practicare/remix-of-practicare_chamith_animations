import { useMemo } from "react";
import {
  format,
  isSameDay,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  isToday,
} from "date-fns";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Shift } from "@/types/roster";
import { HorizontalDayTimeline } from "./HorizontalDayTimeline";
import { WeekNamesView } from "./WeekNamesView";

export type ScheduleMode = "day" | "week" | "month";

interface RosterScheduleViewProps {
  mode: ScheduleMode;
  anchorDate: Date;
  shifts: Shift[];
  startHour?: number;
  endHour?: number;
  onShiftClick: (shift: Shift) => void;
  onSlotClick: (date: Date, hour: number) => void;
  onDayClick?: (date: Date) => void;
}

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

const shortTime = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "p" : "a";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hour12}:${String(m).padStart(2, "0")}${suffix}` : `${hour12}${suffix}`;
};

const initials = (name: string) =>
  name
    .replace(/^Dr\.?\s+/i, "")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

/** Assign side-by-side lanes to overlapping shifts. */
function layoutShifts(shifts: Shift[]) {
  const sorted = [...shifts].sort(
    (a, b) => toMinutes(a.startTime) - toMinutes(b.startTime) || toMinutes(a.endTime) - toMinutes(b.endTime)
  );

  const placed: { shift: Shift; lane: number; start: number; end: number; cluster: number }[] = [];
  let clusterId = 0;
  let clusterEnd = -1;
  let lanes: number[] = []; // lane -> end minute

  sorted.forEach((shift) => {
    const start = toMinutes(shift.startTime);
    const end = Math.max(toMinutes(shift.endTime), start + 30);

    if (start >= clusterEnd) {
      clusterId += 1;
      lanes = [];
      clusterEnd = end;
    } else {
      clusterEnd = Math.max(clusterEnd, end);
    }

    let lane = lanes.findIndex((laneEnd) => laneEnd <= start);
    if (lane === -1) {
      lane = lanes.length;
      lanes.push(end);
    } else {
      lanes[lane] = end;
    }

    placed.push({ shift, lane, start, end, cluster: clusterId });
  });

  const clusterWidth = new Map<number, number>();
  placed.forEach((p) => {
    clusterWidth.set(p.cluster, Math.max(clusterWidth.get(p.cluster) ?? 1, p.lane + 1));
  });

  return placed.map((p) => ({ ...p, lanes: clusterWidth.get(p.cluster) ?? 1 }));
}

export function RosterScheduleView({
  mode,
  anchorDate,
  shifts,
  startHour = 6,
  endHour = 22,
  onShiftClick,
  onSlotClick,
  onDayClick,
}: RosterScheduleViewProps) {
  const days = useMemo(() => {
    if (mode === "day") return [anchorDate];
    const start = startOfWeek(anchorDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [mode, anchorDate]);

  const hours = useMemo(
    () => Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i),
    [startHour, endHour]
  );

  const hourHeight = mode === "day" ? 60 : 48;
  const gridHeight = (endHour - startHour) * hourHeight;

  if (mode === "month") {
    return (
      <MonthGrid anchorDate={anchorDate} shifts={shifts} onDayClick={onDayClick} onShiftClick={onShiftClick} />
    );
  }

  if (mode === "day") {
    return (
      <HorizontalDayTimeline
        date={anchorDate}
        shifts={shifts}
        startHour={startHour}
        endHour={endHour}
        onShiftClick={onShiftClick}
        onSlotClick={onSlotClick}
      />
    );
  }

  if (mode === "week") {
    return (
      <WeekNamesView
        anchorDate={anchorDate}
        shifts={shifts}
        onShiftClick={onShiftClick}
        onDayClick={onDayClick}
        onAddClick={(d) => onSlotClick(d, 9)}
      />
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Day headers */}
      <div
        className="grid border-b bg-muted/30"
        style={{ gridTemplateColumns: `56px repeat(${days.length}, minmax(0,1fr))` }}
      >
        <div />
        {days.map((day) => {
          const count = shifts.filter((s) => isSameDay(new Date(s.date), day)).length;
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onDayClick?.(day)}
              className={cn(
                "px-2 py-2 text-center border-l transition-colors hover:bg-muted/60",
                isToday(day) && "bg-primary/[0.07]"
              )}
            >
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {format(day, mode === "day" ? "EEEE" : "EEE")}
              </div>
              <div className={cn("text-sm font-semibold", isToday(day) && "text-primary")}>
                {format(day, mode === "day" ? "d MMMM" : "d")}
              </div>
              <div className="text-[10px] text-muted-foreground">{count} shift{count === 1 ? "" : "s"}</div>
            </button>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="overflow-y-auto max-h-[560px]">
        <div
          className="grid relative"
          style={{ gridTemplateColumns: `56px repeat(${days.length}, minmax(0,1fr))` }}
        >
          {/* Hour gutter */}
          <div className="relative" style={{ height: gridHeight }}>
            {hours.slice(0, -1).map((h, i) => (
              <div
                key={h}
                className="absolute right-2 -translate-y-1/2 text-[11px] text-muted-foreground"
                style={{ top: i * hourHeight }}
              >
                {shortTime(`${String(h).padStart(2, "0")}:00`)}
              </div>
            ))}
          </div>

          {days.map((day) => {
            const dayShifts = shifts.filter((s) => isSameDay(new Date(s.date), day));
            const allLaidOut = layoutShifts(dayShifts);
            const maxLanes = mode === "week" ? 3 : Infinity;
            const laidOut = allLaidOut.filter((p) => p.lane < maxLanes);
            const hidden = allLaidOut.length - laidOut.length;
            return (
              <div
                key={day.toISOString()}
                className={cn("relative border-l", isToday(day) && "bg-primary/[0.03]")}
                style={{ height: gridHeight }}
              >
                {/* Hour rows (click to add) */}
                {hours.slice(0, -1).map((h, i) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => onSlotClick(day, h)}
                    className="absolute left-0 right-0 border-t border-border/60 group hover:bg-primary/5 transition-colors"
                    style={{ top: i * hourHeight, height: hourHeight }}
                    aria-label={`Add shift ${format(day, "EEE d")} ${h}:00`}
                  >
                    <Plus className="h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-70 mx-auto" />
                  </button>
                ))}

                {/* Shifts */}
                {laidOut.map(({ shift, lane, lanes: laneCount, start, end }) => {
                  const lanes = Math.min(laneCount, maxLanes);
                  const top = ((start - startHour * 60) / 60) * hourHeight;
                  const height = Math.max(((end - start) / 60) * hourHeight - 3, 22);
                  const widthPct = 100 / lanes;
                  const overlapping = lanes > 1;
                  return (
                    <button
                      key={shift.id}
                      type="button"
                      onClick={() => onShiftClick(shift)}
                      className={cn(
                        "absolute rounded-md border border-primary/25 bg-primary/10 text-left px-1.5 py-1 overflow-hidden",
                        "hover:bg-primary/20 hover:border-primary/50 transition-colors",
                        "border-l-[3px] border-l-primary"
                      )}
                      style={{
                        top: Math.max(top, 0),
                        height,
                        left: `calc(${lane * widthPct}% + 3px)`,
                        width: `calc(${widthPct}% - 6px)`,
                      }}
                      title={`${shift.teamMemberName} · ${shift.startTime}–${shift.endTime}`}
                    >
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="shrink-0 h-4 w-4 rounded-full bg-primary/20 text-primary text-[8px] font-semibold grid place-items-center">
                          {initials(shift.teamMemberName)}
                        </span>
                        <span className="text-[11px] font-medium truncate">
                          {overlapping && mode === "week" ? initials(shift.teamMemberName) : shift.teamMemberName}
                        </span>
                      </div>
                      {height > 34 && (
                        <div className="text-[10px] text-muted-foreground truncate">
                          {shortTime(shift.startTime)}–{shortTime(shift.endTime)}
                          {shift.role ? ` · ${shift.role}` : ""}
                        </div>
                      )}
                    </button>
                  );
                })}
                {hidden > 0 && (
                  <button
                    type="button"
                    onClick={() => onDayClick?.(day)}
                    className="absolute bottom-1 left-1 right-1 text-[10px] rounded bg-muted text-muted-foreground hover:bg-muted/80 py-0.5"
                  >
                    +{hidden} more
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MonthGrid({
  anchorDate,
  shifts,
  onDayClick,
  onShiftClick,
}: {
  anchorDate: Date;
  shifts: Shift[];
  onDayClick?: (date: Date) => void;
  onShiftClick: (shift: Shift) => void;
}) {
  const cells = useMemo(() => {
    const first = startOfWeek(startOfMonth(anchorDate), { weekStartsOn: 1 });
    const last = endOfMonth(anchorDate);
    const total = Math.ceil((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24) / 7) * 7 + 7;
    return Array.from({ length: Math.min(total, 42) }, (_, i) => addDays(first, i));
  }, [anchorDate]);

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="grid grid-cols-7 border-b bg-muted/30">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="px-2 py-2 text-center text-[11px] uppercase tracking-wide text-muted-foreground">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day) => {
          const dayShifts = shifts
            .filter((s) => isSameDay(new Date(s.date), day))
            .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
          const inMonth = isSameMonth(day, anchorDate);
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[104px] border-t border-l p-1.5 space-y-1",
                !inMonth && "bg-muted/20",
                isToday(day) && "bg-primary/[0.06]"
              )}
            >
              <button
                type="button"
                onClick={() => onDayClick?.(day)}
                className={cn(
                  "text-xs font-medium w-6 h-6 rounded-md hover:bg-muted",
                  !inMonth && "text-muted-foreground",
                  isToday(day) && "bg-primary text-primary-foreground hover:bg-primary"
                )}
              >
                {format(day, "d")}
              </button>
              {dayShifts.slice(0, 3).map((shift) => (
                <button
                  key={shift.id}
                  type="button"
                  onClick={() => onShiftClick(shift)}
                  className="w-full text-left text-[10px] rounded px-1 py-0.5 bg-primary/10 border-l-2 border-primary hover:bg-primary/20 truncate"
                >
                  {shortTime(shift.startTime)} {shift.teamMemberName}
                </button>
              ))}
              {dayShifts.length > 3 && (
                <button
                  type="button"
                  onClick={() => onDayClick?.(day)}
                  className="text-[10px] text-muted-foreground hover:text-foreground"
                >
                  +{dayShifts.length - 3} more
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
