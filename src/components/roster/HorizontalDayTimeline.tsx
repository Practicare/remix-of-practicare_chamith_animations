import { useMemo, useRef } from "react";
import { format, isSameDay, isToday } from "date-fns";
import { Plus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Shift } from "@/types/roster";
import { memberColor, memberInitials } from "@/lib/memberColors";
import { ShiftHoverCard } from "./ShiftHoverCard";

interface HorizontalDayTimelineProps {
  date: Date;
  shifts: Shift[];
  startHour?: number;
  endHour?: number;
  onShiftClick: (shift: Shift) => void;
  onSlotClick: (date: Date, hour: number) => void;
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

const initials = memberInitials;

/** Rows = people, X axis = time. One line per person so overlaps read clearly. */
export function HorizontalDayTimeline({
  date,
  shifts,
  startHour = 6,
  endHour = 22,
  onShiftClick,
  onSlotClick,
}: HorizontalDayTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const dayShifts = useMemo(
    () => shifts.filter((s) => isSameDay(new Date(s.date), date)),
    [shifts, date]
  );

  const hours = useMemo(
    () => Array.from({ length: endHour - startHour }, (_, i) => startHour + i),
    [startHour, endHour]
  );

  const rows = useMemo(() => {
    const map = new Map<string, { id: string; name: string; shifts: Shift[] }>();
    dayShifts.forEach((s) => {
      const row = map.get(s.teamMemberId) ?? { id: s.teamMemberId, name: s.teamMemberName, shifts: [] };
      row.shifts.push(s);
      map.set(s.teamMemberId, row);
    });
    return Array.from(map.values())
      .map((r) => ({
        ...r,
        shifts: [...r.shifts].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime)),
      }))
      .sort(
        (a, b) =>
          toMinutes(a.shifts[0].startTime) - toMinutes(b.shifts[0].startTime) ||
          a.name.localeCompare(b.name)
      );
  }, [dayShifts]);

  const totalMinutes = (endHour - startHour) * 60;
  const colWidth = 72; // px per hour
  const trackWidth = hours.length * colWidth;

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const showNow = isToday(date) && nowMinutes >= startHour * 60 && nowMinutes <= endHour * 60;
  const nowLeft = ((nowMinutes - startHour * 60) / totalMinutes) * trackWidth;

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
        <div className="text-sm font-medium">{format(date, "EEEE, d MMMM")}</div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {rows.length} on shift · {dayShifts.length} shifts
        </div>
      </div>

      <div ref={scrollRef} className="overflow-x-auto">
        <div style={{ minWidth: trackWidth + 148 }}>
          {/* Hour header */}
          <div className="flex sticky top-0 z-10 bg-muted/40 border-b">
            <div className="w-[148px] shrink-0 border-r px-3 py-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
              Team member
            </div>
            <div className="relative" style={{ width: trackWidth }}>
              <div className="flex">
                {hours.map((h) => (
                  <div
                    key={h}
                    className="border-r border-border/60 py-1.5 text-[11px] text-muted-foreground text-center"
                    style={{ width: colWidth }}
                  >
                    {shortTime(`${String(h).padStart(2, "0")}:00`)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rows */}
          {rows.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No one rostered on this day yet — click a time slot below to add.
            </div>
          )}

          {rows.map((row) => {
            const colour = memberColor(row.id || row.name);
            return (
            <div key={row.id} className="flex border-b last:border-b-0 group/row">
              <div className="w-[148px] shrink-0 border-r px-3 py-2 flex items-center gap-2 bg-card">
                <span
                  className="h-6 w-6 shrink-0 rounded-full text-[10px] font-semibold grid place-items-center text-primary-foreground"
                  style={{ backgroundColor: colour.bg }}
                >
                  {initials(row.name)}
                </span>
                <span className="text-[13px] font-medium truncate">{row.name}</span>
              </div>
              <div className="relative" style={{ width: trackWidth, height: 44 }}>
                {/* clickable hour cells */}
                <div className="absolute inset-0 flex">
                  {hours.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => onSlotClick(date, h)}
                      className="border-r border-border/50 hover:bg-primary/5 transition-colors"
                      style={{ width: colWidth }}
                      aria-label={`Add shift at ${h}:00`}
                    />
                  ))}
                </div>

                {showNow && (
                  <div
                    className="absolute top-0 bottom-0 w-px bg-destructive/70 pointer-events-none"
                    style={{ left: nowLeft }}
                  />
                )}

                {row.shifts.map((shift) => {
                  const start = Math.max(toMinutes(shift.startTime), startHour * 60);
                  const end = Math.min(Math.max(toMinutes(shift.endTime), start + 30), endHour * 60);
                  const left = ((start - startHour * 60) / totalMinutes) * trackWidth;
                  const width = Math.max(((end - start) / totalMinutes) * trackWidth, 44);
                  return (
                    <ShiftHoverCard key={shift.id} shift={shift}>
                      <button
                        type="button"
                        onClick={() => onShiftClick(shift)}
                        className={cn(
                          "absolute top-1.5 h-8 rounded-lg border px-2",
                          "flex items-center gap-1.5 text-left overflow-hidden",
                          "hover:brightness-95 transition-all",
                          shift.isOvertime && "border-dashed"
                        )}
                        style={{
                          left,
                          width,
                          backgroundColor: colour.soft,
                          borderColor: colour.border,
                        }}
                      >
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: colour.bg }}
                        />
                        <span className="text-[11px] font-medium whitespace-nowrap">
                          {shortTime(shift.startTime)}–{shortTime(shift.endTime)}
                        </span>
                        {width > 150 && shift.role && (
                          <span className="text-[10px] text-muted-foreground truncate">{shift.role}</span>
                        )}
                      </button>
                    </ShiftHoverCard>
                  );
                })}
              </div>
            </div>
            );
          })}

          {/* Add row */}
          <div className="flex border-t bg-muted/20">
            <div className="w-[148px] shrink-0 border-r px-3 py-2 text-[11px] text-muted-foreground flex items-center gap-1">
              <Plus className="h-3 w-3" /> Add shift
            </div>
            <div className="flex" style={{ width: trackWidth }}>
              {hours.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => onSlotClick(date, h)}
                  className="h-9 border-r border-border/50 hover:bg-primary/10 text-primary/0 hover:text-primary transition-colors text-[11px]"
                  style={{ width: colWidth }}
                >
                  +
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
