import { addDays, startOfWeek } from "date-fns";
import { Timesheet, TimesheetEntry } from "@/types/timesheets";
import { mockRosters, mockTeamMembersForRoster } from "./mockRosters";

const today = new Date();
const fortnightStart = startOfWeek(today, { weekStartsOn: 1 });

// Build timesheets for the current fortnight from rostered shifts
function buildTimesheetsForFortnight(periodStart: Date): Timesheet[] {
  const periodEnd = addDays(periodStart, 13);

  return mockTeamMembersForRoster.map((member, idx) => {
    // Gather all shifts for this member across rosters that intersect this fortnight
    const entries: TimesheetEntry[] = [];
    mockRosters.forEach((roster) => {
      roster.shifts
        .filter((s) => s.teamMemberId === member.id)
        .filter((s) => {
          const t = new Date(s.date).getTime();
          return t >= periodStart.getTime() && t <= addDays(periodEnd, 1).getTime();
        })
        .forEach((s) => {
          // Slight variance for actual vs scheduled to make demo data feel real
          const variance = (idx % 3) - 1; // -1, 0, +1 minutes-ish
          const actualStart = s.startTime;
          const actualEnd = s.endTime;
          entries.push({
            id: `tse-${s.id}`,
            date: new Date(s.date),
            shiftId: s.id,
            scheduledStart: s.startTime,
            scheduledEnd: s.endTime,
            actualStart,
            actualEnd,
            breaks: s.breaks.map((b) => ({ ...b })),
            isOvertime: s.isOvertime,
            notes: variance !== 0 ? "Auto-generated from roster" : undefined,
          });
        });
    });

    // Sort by date
    entries.sort((a, b) => a.date.getTime() - b.date.getTime());

    const status =
      idx % 5 === 0 ? "approved" : idx % 5 === 1 ? "submitted" : "draft";

    return {
      id: `ts-${member.id}-${periodStart.getTime()}`,
      teamMemberId: member.id,
      teamMemberName: member.name,
      periodStart,
      periodEnd,
      status,
      entries,
      submittedAt: status !== "draft" ? addDays(today, -2) : undefined,
      approvedAt: status === "approved" ? addDays(today, -1) : undefined,
      approvedBy: status === "approved" ? "Admin User" : undefined,
      createdBy: "system",
      createdAt: addDays(today, -7),
    } as Timesheet;
  });
}

export const mockTimesheets: Timesheet[] = buildTimesheetsForFortnight(fortnightStart);
