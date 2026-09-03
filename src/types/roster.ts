export type RosterPeriod = "weekly" | "fortnightly" | "monthly";

export type ShiftStatus = "scheduled" | "swap-requested" | "swapped" | "confirmed";

export interface ShiftBreak {
  startTime: string;
  endTime: string;
  isPaid: boolean;
}

export interface Shift {
  id: string;
  rosterId: string;
  teamMemberId: string;
  teamMemberName: string;
  entryId?: string; // Links shift to a specific group entry (allows same member in multiple groups)
  date: Date;
  startTime: string;
  endTime: string;
  breaks: ShiftBreak[];
  role: string;
  location: string;
  notes?: string;
  isOvertime: boolean;
  status: ShiftStatus;
  swapRequestedWith?: string;
}

export interface Roster {
  id: string;
  name: string;
  period: RosterPeriod;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  createdBy: string;
  shifts: Shift[];
  published: boolean;
  departmentId?: string;
  departmentName?: string;
}

export interface TeamMemberAvailability {
  id: string;
  teamMemberId: string;
  teamMemberName: string;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  available: boolean;
  preferredStartTime?: string;
  preferredEndTime?: string;
  notes?: string;
}

export interface SwapRequest {
  id: string;
  shiftId: string;
  requesterId: string;
  requesterName: string;
  targetMemberId?: string;
  targetMemberName?: string;
  status: "pending" | "approved" | "rejected";
  reason: string;
  createdAt: Date;
}

export interface TimelineGroupMember {
  entryId: string; // Unique ID for this entry (allows same member in multiple groups)
  teamMemberId: string;
  teamMemberName: string;
}

export interface TimelineGroup {
  id: string;
  name: string;
  teamMemberIds: string[]; // Keep for backwards compatibility
  members: TimelineGroupMember[]; // New: Independent member entries per group
}

export const SHIFT_ROLES = [
  "Receptionist",
  "Nurse",
  "Doctor",
  "Manager",
  "Supervisor",
  "Administrative",
  "Support Staff",
];

export const SHIFT_LOCATIONS = [
  "Main Office",
  "Reception",
  "Floor 1",
  "Floor 2",
  "Remote",
  "On-call",
];

export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export interface DayOperatingHours {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface OperatingHours {
  id: string;
  name: string;
  hours: DayOperatingHours[];
}

export interface OrganizationSettings {
  id: string;
  name: string;
  operatingHours: DayOperatingHours[];
}

export interface DepartmentSettings {
  id: string;
  departmentId: string;
  departmentName: string;
  useOrgHours: boolean; // If true, inherit from org. If false, use custom hours
  operatingHours: DayOperatingHours[];
}

export type HolidayStatus = "approved" | "pending" | "rejected";

export interface StaffHoliday {
  id: string;
  teamMemberId: string;
  teamMemberName: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: HolidayStatus;
  createdAt: Date;
}
