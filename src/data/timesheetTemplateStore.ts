import { addDays, startOfWeek } from "date-fns";
import { TimesheetTemplate, TimesheetTemplateDay } from "@/types/timesheets";
import { mockDepartments } from "./mockDepartments";
import { mockTeamMembers } from "./mockTeamMembers";

const monday = startOfWeek(new Date(), { weekStartsOn: 1 });

const buildDays = (
  startTime: string,
  endTime: string,
  breakMinutes: number,
  enabledDows: number[] = [1, 2, 3, 4, 5]
): TimesheetTemplateDay[] =>
  [1, 2, 3, 4, 5, 6, 0].map((dow) => ({
    dayOfWeek: dow,
    enabled: enabledDows.includes(dow),
    startTime,
    endTime,
    breakMinutes,
  }));

const seed = (): TimesheetTemplate[] => {
  const dept0 = mockDepartments[0];
  const dept1 = mockDepartments[1] ?? dept0;
  const members = mockTeamMembers.slice(0, 4).map((m) => m.id);

  const items: TimesheetTemplate[] = [
    {
      id: "tpl-seed-1",
      name: "Reception standard week",
      departmentId: dept0?.id ?? "",
      days: buildDays("09:00", "17:00", 30),
      allocatedTeamMemberIds: members.slice(0, 2),
      periodStart: monday,
      periodEnd: addDays(monday, 13),
      published: true,
      createdAt: addDays(new Date(), -10),
      createdBy: "Admin",
    },
    {
      id: "tpl-seed-2",
      name: "Clinical early shift",
      departmentId: dept1?.id ?? "",
      days: buildDays("07:30", "15:30", 45),
      allocatedTeamMemberIds: members.slice(0, 3),
      periodStart: monday,
      periodEnd: addDays(monday, 13),
      published: true,
      createdAt: addDays(new Date(), -6),
      createdBy: "Admin",
    },
    {
      id: "tpl-seed-3",
      name: "Weekend cover",
      departmentId: dept0?.id ?? "",
      days: buildDays("10:00", "16:00", 30, [6, 0]),
      allocatedTeamMemberIds: members.slice(2, 4),
      periodStart: monday,
      periodEnd: addDays(monday, 13),
      published: false,
      createdAt: addDays(new Date(), -2),
      createdBy: "Admin",
    },
  ];
  return items;
};

let store: TimesheetTemplate[] = seed();
const listeners = new Set<() => void>();

export const timesheetTemplateStore = {
  getAll: () => store,
  setAll: (next: TimesheetTemplate[]) => {
    store = next;
    listeners.forEach((l) => l());
  },
  add: (tpl: TimesheetTemplate) => {
    store = [...store, tpl];
    listeners.forEach((l) => l());
  },
  update: (id: string, patch: Partial<TimesheetTemplate>) => {
    store = store.map((t) => (t.id === id ? { ...t, ...patch } : t));
    listeners.forEach((l) => l());
  },
  remove: (id: string) => {
    store = store.filter((t) => t.id !== id);
    listeners.forEach((l) => l());
  },
  subscribe: (fn: () => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
