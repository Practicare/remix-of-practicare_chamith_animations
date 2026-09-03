import { Roster, Shift, TeamMemberAvailability, SwapRequest, OrganizationSettings, DepartmentSettings, DayOperatingHours, StaffHoliday } from "@/types/roster";
import { addDays, startOfWeek, addWeeks, subWeeks } from "date-fns";

const today = new Date();
const weekStart = startOfWeek(today, { weekStartsOn: 1 });
const previousWeekStart = subWeeks(weekStart, 1);

export const mockDepartments = [
  { id: "reception", name: "Reception" },
  { id: "nursing", name: "Nursing" },
  { id: "doctors", name: "Doctors" },
  { id: "management", name: "Management" },
  { id: "admin", name: "Administration" },
  { id: "support", name: "Support Staff" },
];

export const mockTeamMembersForRoster = [
  // Reception
  { id: "tm-1", name: "Sarah Johnson", departmentId: "reception" },
  { id: "tm-2", name: "Michael Chen", departmentId: "reception" },
  { id: "tm-3", name: "Amanda Foster", departmentId: "reception" },
  // Nursing
  { id: "tm-4", name: "Emily Davis", departmentId: "nursing" },
  { id: "tm-5", name: "James Wilson", departmentId: "nursing" },
  { id: "tm-6", name: "Rachel Kim", departmentId: "nursing" },
  { id: "tm-7", name: "David Martinez", departmentId: "nursing" },
  // Doctors
  { id: "tm-8", name: "Dr. Lisa Anderson", departmentId: "doctors" },
  { id: "tm-9", name: "Dr. Mark Thompson", departmentId: "doctors" },
  { id: "tm-10", name: "Dr. Jennifer Lee", departmentId: "doctors" },
  // Management
  { id: "tm-11", name: "Robert Taylor", departmentId: "management" },
  { id: "tm-12", name: "Catherine Brown", departmentId: "management" },
  // Administration
  { id: "tm-13", name: "Alex Rivera", departmentId: "admin" },
  { id: "tm-14", name: "Jessica Nguyen", departmentId: "admin" },
  // Support Staff
  { id: "tm-15", name: "Chris O'Brien", departmentId: "support" },
  { id: "tm-16", name: "Patricia Santos", departmentId: "support" },
];

const roles = ["Receptionist", "Nurse", "Doctor", "Manager", "Admin", "Support"];
const locations = ["Main Office", "Reception", "Floor 1", "Floor 2", "Floor 3", "Emergency", "Remote"];

const generateShifts = (rosterId: string, startDate: Date): Shift[] => {
  const shifts: Shift[] = [];
  
  // Ensure shifts are generated for today specifically
  const todayDate = new Date();
  const todayDayOfWeek = todayDate.getDay(); // 0 = Sunday
  const mondayOffset = todayDayOfWeek === 0 ? -6 : 1 - todayDayOfWeek;
  
  mockTeamMembersForRoster.forEach((member, memberIndex) => {
    // Generate 5-6 shifts per member to ensure coverage
    const numShifts = 5 + Math.floor(Math.random() * 2);
    const usedDays = new Set<number>();
    
    // Ensure today always has a shift for most members
    const todayOffset = Math.floor((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (todayOffset >= 0 && todayOffset < 7 && memberIndex % 2 === 0) {
      usedDays.add(todayOffset);
      const startHour = 7 + (memberIndex % 4); // Stagger start times
      const shiftLength = 8;
      
      shifts.push({
        id: `shift-${rosterId}-${memberIndex}-today`,
        rosterId,
        teamMemberId: member.id,
        teamMemberName: member.name,
        date: todayDate,
        startTime: `${startHour.toString().padStart(2, "0")}:00`,
        endTime: `${(startHour + shiftLength).toString().padStart(2, "0")}:00`,
        breaks: [
          {
            startTime: `${(startHour + 4).toString().padStart(2, "0")}:00`,
            endTime: `${(startHour + 4).toString().padStart(2, "0")}:30`,
            isPaid: false,
          },
        ],
        role: roles[memberIndex % roles.length],
        location: locations[memberIndex % locations.length],
        notes: memberIndex % 3 === 0 ? "Morning shift" : undefined,
        isOvertime: false,
        status: memberIndex % 4 === 0 ? "confirmed" : "scheduled",
      });
    }
    
    // Generate remaining shifts across the week
    for (let i = 0; i < numShifts; i++) {
      let dayOffset: number;
      let attempts = 0;
      do {
        dayOffset = Math.floor(Math.random() * 7);
        attempts++;
      } while (usedDays.has(dayOffset) && attempts < 10);
      
      if (usedDays.has(dayOffset)) continue;
      usedDays.add(dayOffset);
      
      const isOvertime = Math.random() > 0.85;
      const startHour = 6 + Math.floor(Math.random() * 6); // 6am to 11am
      const shiftLength = isOvertime ? 10 : (7 + Math.floor(Math.random() * 2)); // 7-8 hours normally
      
      shifts.push({
        id: `shift-${rosterId}-${memberIndex}-${i}`,
        rosterId,
        teamMemberId: member.id,
        teamMemberName: member.name,
        date: addDays(startDate, dayOffset),
        startTime: `${startHour.toString().padStart(2, "0")}:00`,
        endTime: `${(startHour + shiftLength).toString().padStart(2, "0")}:00`,
        breaks: [
          {
            startTime: `${(startHour + 4).toString().padStart(2, "0")}:00`,
            endTime: `${(startHour + 4).toString().padStart(2, "0")}:30`,
            isPaid: false,
          },
        ],
        role: roles[Math.floor(Math.random() * roles.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        notes: Math.random() > 0.7 ? "Cover for annual leave" : undefined,
        isOvertime,
        status: Math.random() > 0.7 ? "confirmed" : "scheduled",
      });
    }
  });
  
  return shifts;
};

export const mockRosters: Roster[] = [
  {
    id: "roster-0",
    name: "Week 2 - January 2026",
    period: "weekly",
    startDate: previousWeekStart,
    endDate: addDays(previousWeekStart, 6),
    createdAt: addDays(today, -10),
    createdBy: "Admin User",
    shifts: generateShifts("roster-0", previousWeekStart),
    published: true,
  },
  {
    id: "roster-1",
    name: "Week 3 - January 2026",
    period: "weekly",
    startDate: weekStart,
    endDate: addDays(weekStart, 6),
    createdAt: addDays(today, -5),
    createdBy: "Admin User",
    shifts: generateShifts("roster-1", weekStart),
    published: true,
  },
  {
    id: "roster-2",
    name: "Week 4 - January 2026",
    period: "weekly",
    startDate: addWeeks(weekStart, 1),
    endDate: addDays(addWeeks(weekStart, 1), 6),
    createdAt: addDays(today, -2),
    createdBy: "Admin User",
    shifts: generateShifts("roster-2", addWeeks(weekStart, 1)),
    published: false,
  },
  {
    id: "roster-3",
    name: "Week 5 - February 2026",
    period: "weekly",
    startDate: addWeeks(weekStart, 2),
    endDate: addDays(addWeeks(weekStart, 2), 6),
    createdAt: addDays(today, -1),
    createdBy: "Catherine Brown",
    shifts: generateShifts("roster-3", addWeeks(weekStart, 2)),
    published: false,
  },
  {
    id: "roster-4",
    name: "Emergency Coverage - Jan",
    period: "weekly",
    startDate: weekStart,
    endDate: addDays(weekStart, 6),
    createdAt: addDays(today, -3),
    createdBy: "Robert Taylor",
    shifts: generateShifts("roster-4", weekStart),
    published: true,
  },
  {
    id: "roster-5",
    name: "Night Shift Rotation",
    period: "fortnightly",
    startDate: weekStart,
    endDate: addDays(weekStart, 13),
    createdAt: addDays(today, -4),
    createdBy: "Admin User",
    shifts: generateShifts("roster-5", weekStart),
    published: false,
  },
];

export const mockAvailability: TeamMemberAvailability[] = mockTeamMembersForRoster.flatMap(
  (member) =>
    [0, 1, 2, 3, 4, 5, 6].map((day) => ({
      id: `avail-${member.id}-${day}`,
      teamMemberId: member.id,
      teamMemberName: member.name,
      dayOfWeek: day,
      available: day !== 0 && day !== 6, // Not available weekends by default
      preferredStartTime: "09:00",
      preferredEndTime: "17:00",
      notes: day === 0 || day === 6 ? "Weekend - not available" : undefined,
    }))
);

export const mockSwapRequests: SwapRequest[] = [
  {
    id: "swap-1",
    shiftId: "shift-roster-1-0-0",
    requesterId: "tm-1",
    requesterName: "Sarah Johnson",
    targetMemberId: "tm-2",
    targetMemberName: "Michael Chen",
    status: "pending",
    reason: "Doctor appointment on that day",
    createdAt: addDays(today, -1),
  },
  {
    id: "swap-2",
    shiftId: "shift-roster-1-4-1",
    requesterId: "tm-4",
    requesterName: "Emily Davis",
    targetMemberId: "tm-5",
    targetMemberName: "James Wilson",
    status: "pending",
    reason: "Family emergency",
    createdAt: addDays(today, -2),
  },
  {
    id: "swap-3",
    shiftId: "shift-roster-2-8-0",
    requesterId: "tm-8",
    requesterName: "Dr. Lisa Anderson",
    status: "approved",
    reason: "Conference attendance",
    createdAt: addDays(today, -5),
  },
];

// Default operating hours helper
const createDefaultOperatingHours = (): DayOperatingHours[] => [
  { dayOfWeek: 0, isOpen: false, openTime: "09:00", closeTime: "17:00" }, // Sunday - closed
  { dayOfWeek: 1, isOpen: true, openTime: "08:00", closeTime: "18:00" },  // Monday
  { dayOfWeek: 2, isOpen: true, openTime: "08:00", closeTime: "18:00" },  // Tuesday
  { dayOfWeek: 3, isOpen: true, openTime: "08:00", closeTime: "18:00" },  // Wednesday
  { dayOfWeek: 4, isOpen: true, openTime: "08:00", closeTime: "18:00" },  // Thursday
  { dayOfWeek: 5, isOpen: true, openTime: "08:00", closeTime: "18:00" },  // Friday
  { dayOfWeek: 6, isOpen: false, openTime: "09:00", closeTime: "17:00" }, // Saturday - closed
];

export const mockOrganizationSettings: OrganizationSettings = {
  id: "org-1",
  name: "HealthCare Plus",
  operatingHours: createDefaultOperatingHours(),
};

export const mockDepartmentSettings: DepartmentSettings[] = mockDepartments.map((dept) => ({
  id: `dept-settings-${dept.id}`,
  departmentId: dept.id,
  departmentName: dept.name,
  useOrgHours: true,
  operatingHours: createDefaultOperatingHours(),
}));

export const mockStaffHolidays: StaffHoliday[] = [
  {
    id: "holiday-1",
    teamMemberId: "tm-1",
    teamMemberName: "Sarah Johnson",
    startDate: addDays(weekStart, 2),
    endDate: addDays(weekStart, 4),
    reason: "Annual leave - family vacation",
    status: "approved",
    createdAt: addDays(today, -7),
  },
  {
    id: "holiday-2",
    teamMemberId: "tm-4",
    teamMemberName: "Emily Davis",
    startDate: addWeeks(weekStart, 1),
    endDate: addDays(addWeeks(weekStart, 1), 2),
    reason: "Personal leave",
    status: "approved",
    createdAt: addDays(today, -5),
  },
  {
    id: "holiday-3",
    teamMemberId: "tm-8",
    teamMemberName: "Dr. Lisa Anderson",
    startDate: addWeeks(weekStart, 2),
    endDate: addDays(addWeeks(weekStart, 2), 6),
    reason: "Conference and training",
    status: "approved",
    createdAt: addDays(today, -3),
  },
  {
    id: "holiday-4",
    teamMemberId: "tm-2",
    teamMemberName: "Michael Chen",
    startDate: addDays(weekStart, 5),
    endDate: addDays(weekStart, 7),
    reason: "Sick leave",
    status: "pending",
    createdAt: addDays(today, -1),
  },
];
