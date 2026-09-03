import { ReactNode } from "react";
import { format } from "date-fns";
import { Clock, MapPin, Briefcase, Coffee, StickyNote } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Shift } from "@/types/roster";
import { memberColor, memberInitials } from "@/lib/memberColors";

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

const duration = (start: string, end: string) => {
  const mins = Math.max(toMinutes(end) - toMinutes(start), 0);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

interface ShiftHoverCardProps {
  shift: Shift;
  children: ReactNode;
}

/** Shared hover detail panel for a rostered team member's shift. */
export function ShiftHoverCard({ shift, children }: ShiftHoverCardProps) {
  const colour = memberColor(shift.teamMemberId || shift.teamMemberName);
  const paidBreaks = shift.breaks?.filter((b) => b.isPaid).length ?? 0;

  return (
    <HoverCard openDelay={150} closeDelay={80}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent align="start" className="w-64 p-3 z-50">
        <div className="flex items-center gap-2.5">
          <span
            className="h-8 w-8 shrink-0 rounded-full grid place-items-center text-[11px] font-semibold text-primary-foreground"
            style={{ backgroundColor: colour.bg }}
          >
            {memberInitials(shift.teamMemberName)}
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold leading-tight truncate">
              {shift.teamMemberName}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {format(new Date(shift.date), "EEE d MMM")}
            </p>
          </div>
        </div>

        <div className="mt-3 space-y-1.5 text-[12px]">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span>
              {shift.startTime}–{shift.endTime}
              <span className="text-muted-foreground">
                {" "}
                · {duration(shift.startTime, shift.endTime)}
              </span>
            </span>
          </div>
          {shift.role && (
            <div className="flex items-center gap-2">
              <Briefcase className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{shift.role}</span>
            </div>
          )}
          {shift.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{shift.location}</span>
            </div>
          )}
          {shift.breaks?.length > 0 && (
            <div className="flex items-center gap-2">
              <Coffee className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span>
                {shift.breaks.length} break{shift.breaks.length > 1 ? "s" : ""}
                {paidBreaks > 0 && (
                  <span className="text-muted-foreground"> · {paidBreaks} paid</span>
                )}
              </span>
            </div>
          )}
          {shift.notes && (
            <div className="flex items-start gap-2">
              <StickyNote className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{shift.notes}</span>
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-lg bg-muted px-2 py-0.5 text-[10px] capitalize">
            {shift.status.replace("-", " ")}
          </span>
          {shift.isOvertime && (
            <span className="rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 px-2 py-0.5 text-[10px]">
              Overtime
            </span>
          )}
        </div>

        <p className="mt-2 text-[10px] text-muted-foreground">Click to edit this shift</p>
      </HoverCardContent>
    </HoverCard>
  );
}
