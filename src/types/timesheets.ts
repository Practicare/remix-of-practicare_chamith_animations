export type TimesheetStatus = "draft" | "submitted" | "approved" | "rejected";

export interface TimesheetEntryBreak {
  startTime: string;
  endTime: string;
  isPaid: boolean;
}

export interface TimesheetSlot {
  id: string;
  start: string; // "HH:mm"
  end: string;
  label?: string; // optional, e.g. "Reception cover"
  addedByUser?: boolean; // user-added extra timeslot
}

export interface TimesheetEntry {
  id: string;
  date: Date;
  shiftId?: string; // links to source roster shift if any
  scheduledStart: string; // "HH:mm" — primary slot start (kept for back-compat)
  scheduledEnd: string;
  actualStart: string;
  actualEnd: string;
  slots?: TimesheetSlot[]; // additional time slots for the day
  breaks: TimesheetEntryBreak[];
  breakMinutes?: number; // simple total break (template-driven)
  isOvertime: boolean;
  notes?: string;
  clockedIn?: boolean;
  clockedInAt?: Date;
}

export interface TimesheetComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: "admin" | "staff";
  message: string;
  createdAt: Date;
}

export interface Timesheet {
  id: string;
  templateId?: string; // links back to template if generated from one
  departmentId?: string;
  teamMemberId: string;
  teamMemberName: string;
  periodStart: Date; // fortnight start (Monday)
  periodEnd: Date; // periodStart + 13 days
  status: TimesheetStatus;
  entries: TimesheetEntry[];
  comments?: TimesheetComment[];
  submittedAt?: Date;
  approvedAt?: Date;
  approvedBy?: string;
  rejectedReason?: string;
  createdBy: "system" | "admin";
  createdAt: Date;
  publishedAt?: Date;
}

// --- Template ---
export interface TimesheetTemplateDay {
  dayOfWeek: number; // 0 = Sun, 1 = Mon ... 6 = Sat
  enabled: boolean;
  startTime: string; // "HH:mm"
  endTime: string;
  breakMinutes: number;
}

export interface TimesheetTemplate {
  id: string;
  name: string;
  departmentId: string;
  days: TimesheetTemplateDay[]; // length 7, Mon..Sun (we still store dayOfWeek)
  allocatedTeamMemberIds: string[];
  periodStart: Date;
  periodEnd: Date;
  published: boolean;
  createdAt: Date;
  createdBy: string;
}

export const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const calcTemplateWeeklyHours = (tpl: Pick<TimesheetTemplate, "days">) => {
  const minutes = tpl.days.reduce((sum, d) => {
    if (!d.enabled) return sum;
    const worked = timeToMinutes(d.endTime) - timeToMinutes(d.startTime) - (d.breakMinutes || 0);
    return sum + Math.max(0, worked);
  }, 0);
  return Math.round((minutes / 60) * 100) / 100;
};

// --- Helpers ---
export const timeToMinutes = (t: string): number => {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const minutesToHours = (m: number): number => Math.max(0, m) / 60;

export const calcEntryHours = (e: TimesheetEntry, source: "scheduled" | "actual" = "actual") => {
  const start = source === "actual" ? e.actualStart : e.scheduledStart;
  const end = source === "actual" ? e.actualEnd : e.scheduledEnd;
  if (!start || !end) return 0;
  const worked = timeToMinutes(end) - timeToMinutes(start);
  const unpaidBreak = e.breaks
    .filter((b) => !b.isPaid)
    .reduce((sum, b) => sum + (timeToMinutes(b.endTime) - timeToMinutes(b.startTime)), 0);
  return minutesToHours(worked - unpaidBreak);
};

export const calcTimesheetTotals = (ts: Timesheet) => {
  let scheduled = 0;
  let actual = 0;
  let overtime = 0;
  ts.entries.forEach((e) => {
    scheduled += calcEntryHours(e, "scheduled");
    const a = calcEntryHours(e, "actual");
    actual += a;
    if (e.isOvertime) overtime += a;
  });
  return {
    scheduled: Math.round(scheduled * 100) / 100,
    actual: Math.round(actual * 100) / 100,
    overtime: Math.round(overtime * 100) / 100,
    variance: Math.round((actual - scheduled) * 100) / 100,
  };
};

export const STATUS_LABEL: Record<TimesheetStatus, string> = {
  draft: "Draft",
  submitted: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
};
