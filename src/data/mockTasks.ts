import { Task } from "@/types/tasks";
import { addDays, subDays } from "date-fns";

const today = new Date();

export const mockTasks: Task[] = [
  // Standard task - due today, pending
  {
    id: "task-1",
    title: "Order medical supplies",
    assignee: "Sarah Johnson",
    dueDate: addDays(today, 0),
    completed: false,
    createdAt: subDays(today, 2),
    reminder: { email: true, sms: false },
  },
  // Task with SMS reminder
  {
    id: "task-2",
    title: "Submit weekly report",
    assignee: "James Wilson",
    dueDate: addDays(today, 1),
    completed: false,
    createdAt: subDays(today, 5),
    reminder: { email: false, sms: true },
  },
  // Task without reminders
  {
    id: "task-3",
    title: "Call insurance provider",
    assignee: "Sarah Johnson",
    dueDate: addDays(today, 2),
    completed: false,
    createdAt: subDays(today, 7),
  },
  // Future task
  {
    id: "task-4",
    title: "Update patient records",
    assignee: "Michael Chen",
    dueDate: addDays(today, 7),
    completed: false,
    createdAt: subDays(today, 1),
  },
  // Completed task
  {
    id: "task-5",
    title: "Book equipment maintenance",
    assignee: "Sarah Johnson",
    dueDate: subDays(today, 3),
    completed: true,
    createdAt: subDays(today, 10),
    reminder: { email: true, sms: false },
  },
  // Task with both reminders
  {
    id: "task-6",
    title: "Review staff schedules",
    assignee: "Practice Manager",
    dueDate: addDays(today, 2),
    completed: false,
    createdAt: subDays(today, 3),
    reminder: { email: true, sms: true },
  },
  // Completed future task
  {
    id: "task-7",
    title: "File tax documents",
    assignee: "James Wilson",
    dueDate: addDays(today, 14),
    completed: true,
    createdAt: subDays(today, 20),
  },
  // Due today with SMS
  {
    id: "task-8",
    title: "Confirm delivery slot",
    assignee: "Sarah Johnson",
    dueDate: today,
    completed: false,
    createdAt: subDays(today, 2),
    reminder: { email: false, sms: true },
  },
  // Standard pending task
  {
    id: "task-9",
    title: "Update reception procedures manual",
    assignee: "Sarah Johnson",
    dueDate: addDays(today, 5),
    completed: false,
    createdAt: subDays(today, 1),
  },
  // Due tomorrow
  {
    id: "task-10",
    title: "Schedule patient follow-up calls",
    assignee: "Sarah Johnson",
    dueDate: addDays(today, 1),
    completed: false,
    createdAt: today,
    reminder: { email: true, sms: false },
  },
  // CRITICAL task - overdue (marked as important)
  {
    id: "task-11",
    title: "Verify emergency equipment functionality",
    assignee: "Sarah Johnson",
    dueDate: subDays(today, 1),
    completed: false,
    createdAt: subDays(today, 5),
    important: true,
    reminder: { email: true, sms: true },
  },
  // CRITICAL task - due today
  {
    id: "task-12",
    title: "Complete fire safety checklist",
    assignee: "Sarah Johnson",
    dueDate: today,
    completed: false,
    createdAt: subDays(today, 2),
    important: true,
  },
  // CRITICAL task - completed
  {
    id: "task-13",
    title: "Submit compliance report",
    assignee: "Sarah Johnson",
    dueDate: subDays(today, 2),
    completed: true,
    createdAt: subDays(today, 7),
    important: true,
    reminder: { email: true, sms: false },
  },
];
