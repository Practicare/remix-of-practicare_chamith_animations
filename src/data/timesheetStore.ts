import { Timesheet } from "@/types/timesheets";
import { mockTimesheets } from "./mockTimesheets";

// Simple in-memory store so newly published timesheets persist across page navigation.
// Replace with a real backend / context later.
let store: Timesheet[] = [...mockTimesheets];
const listeners = new Set<() => void>();

export const timesheetStore = {
  getAll: () => store,
  setAll: (next: Timesheet[]) => {
    store = next;
    listeners.forEach((l) => l());
  },
  add: (items: Timesheet[]) => {
    store = [...store, ...items];
    listeners.forEach((l) => l());
  },
  subscribe: (fn: () => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
