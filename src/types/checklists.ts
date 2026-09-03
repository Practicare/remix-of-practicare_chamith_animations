// Re-export Department from centralized location
export { type Department, type DepartmentType, DEFAULT_DEPARTMENTS } from "./departments";

// Legacy type alias for backward compatibility
import { Department, DepartmentType, DEFAULT_DEPARTMENTS } from "./departments";
export type ChecklistCategory = Department;
export type CategoryType = DepartmentType;

// Create DEFAULT_CHECKLIST_CATEGORIES from departments for backward compatibility
export const DEFAULT_CHECKLIST_CATEGORIES: ChecklistCategory[] = [
  { id: "all", name: "All Checklists", icon: "Layers", color: "bg-gray-500", type: "internal", isDefault: true },
  ...DEFAULT_DEPARTMENTS,
];

export type ChecklistItemType = "tick" | "yesno" | "number";

export interface ChecklistItem {
  id: string;
  text: string;
  type: ChecklistItemType;
  completed: boolean;
  completedAt?: Date;
  completedBy?: string;
  critical?: boolean;
  yesNoValue?: "yes" | "no" | null;
  numberValue?: string | null;
  comment?: string;

}

export type AssignmentType = "all" | "department" | "users";

export interface ChecklistAssignment {
  type: AssignmentType;
  departmentIds?: string[];
  userIds?: string[];
}

export type FrequencyType = "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";

export type DailyTimeSlot = "am" | "pm" | "custom";

export type WeekDay = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export type CustomFrequencyUnit = "days" | "weeks" | "months" | "years";

export interface ChecklistFrequency {
  type: FrequencyType;
  // Daily options
  dailyTimeSlot?: DailyTimeSlot;
  customTime?: string; // HH:mm format
  // Weekly options
  weekDay?: WeekDay | "any";
  // Custom options
  customInterval?: number;
  customUnit?: CustomFrequencyUnit;
}

export interface Checklist {
  id: string;
  title: string;
  description?: string;
  categoryId: string; // This is the departmentId
  items: ChecklistItem[];
  createdAt: Date;
  createdBy: string;
  recurring?: "daily" | "weekly" | "monthly" | null;
  frequency?: ChecklistFrequency;
  lastReset?: Date;
  assignment?: ChecklistAssignment;
}
