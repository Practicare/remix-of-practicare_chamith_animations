export type TaskStatus = "pending" | "completed" | "overdue";
export type ReminderType = "email" | "sms";
export type TaskFrequency = "once" | "daily" | "weekly" | "monthly" | "custom";

export interface TaskCustomFrequency {
  every: number;
  unit: "days" | "weeks" | "months";
}

export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee: string;
  departmentId?: string;
  dueDate: Date;
  completed: boolean;
  createdAt: Date;
  important?: boolean;
  frequency?: TaskFrequency;
  customFrequency?: TaskCustomFrequency;
  reminder?: {
    email: boolean;
    sms: boolean;
  };
  checklist?: TaskChecklistItem[];
}

export const STATUS_COLORS: Record<TaskStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  completed: "bg-success/10 text-success",
  overdue: "bg-destructive/10 text-destructive",
};
