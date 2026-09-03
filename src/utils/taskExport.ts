import { Task } from "@/types/tasks";
import { format, isPast, isToday } from "date-fns";
import { downloadCSV, openPrintPDF, wrapPDFPage, exportTimestamp, exportSubtitleDate } from "./exportUtils";

const getTaskStatus = (task: Task): string => {
  if (task.completed) return "Completed";
  if (isPast(task.dueDate) && !isToday(task.dueDate)) return "Overdue";
  return "Pending";
};

export function exportTasksCSV(tasks: Task[], filename?: string) {
  const headers = ["Title", "Assignee", "Department", "Due Date", "Status", "Important", "Description", "Created"];
  const rows = tasks.map((t) => [
    t.title,
    t.assignee,
    t.departmentId || "",
    format(new Date(t.dueDate), "yyyy-MM-dd"),
    getTaskStatus(t),
    t.important ? "Yes" : "No",
    t.description || "",
    format(new Date(t.createdAt), "yyyy-MM-dd"),
  ]);

  downloadCSV(headers, rows, filename || `tasks-${exportTimestamp()}`);
}

export function exportTasksPDF(tasks: Task[]) {
  const statusColor = (task: Task) => {
    if (task.completed) return "#16a34a";
    if (isPast(task.dueDate) && !isToday(task.dueDate)) return "#dc2626";
    return "#f59e0b";
  };

  const tableRows = tasks
    .map(
      (t) => `<tr>
        <td>${t.title}${t.important ? ' <span style="color:#dc2626;font-size:11px;font-weight:600;">● Important</span>' : ""}</td>
        <td>${t.assignee}</td>
        <td>${format(new Date(t.dueDate), "MMM d, yyyy")}</td>
        <td><span style="color:${statusColor(t)};font-weight:600;">${getTaskStatus(t)}</span></td>
      </tr>`
    )
    .join("");

  const completed = tasks.filter((t) => t.completed).length;
  const overdue = tasks.filter((t) => !t.completed && isPast(t.dueDate) && !isToday(t.dueDate)).length;
  const pending = tasks.length - completed - overdue;

  const bodyHtml = `
    <div class="stats">
      <div class="stat"><strong>${pending}</strong>Pending</div>
      <div class="stat"><strong style="color:#16a34a">${completed}</strong>Completed</div>
      <div class="stat"><strong style="color:#dc2626">${overdue}</strong>Overdue</div>
    </div>
    <table>
      <thead><tr><th>Task</th><th>Assigned To</th><th>Due Date</th><th>Status</th></tr></thead>
      <tbody>${tableRows}</tbody>
    </table>`;

  const html = wrapPDFPage({
    title: "Tasks Report",
    subtitle: `Generated ${exportSubtitleDate()} · ${tasks.length} tasks`,
    bodyHtml,
  });

  openPrintPDF(html);
}

export function exportSingleTaskPDF(task: Task) {
  const status = getTaskStatus(task);

  const bodyHtml = `
    <div class="grid">
      <div class="field"><div class="field-label">Assigned To</div><div class="field-value">${task.assignee}</div></div>
      <div class="field"><div class="field-label">Due Date</div><div class="field-value">${format(new Date(task.dueDate), "MMMM d, yyyy")}</div></div>
      <div class="field"><div class="field-label">Status</div><div class="field-value">${status}</div></div>
      <div class="field"><div class="field-label">Priority</div><div class="field-value">${task.important ? "Important" : "Normal"}</div></div>
    </div>
    ${task.description ? `<div class="field"><div class="field-label">Description</div><div class="field-value">${task.description}</div></div>` : ""}
    ${task.reminder ? `<div class="field"><div class="field-label">Reminders</div><div class="field-value">${[task.reminder.email && "Email", task.reminder.sms && "SMS"].filter(Boolean).join(", ")}</div></div>` : ""}`;

  const html = wrapPDFPage({
    title: `${task.title}${task.important ? ' <span style="color:#dc2626;">●</span>' : ""}`,
    subtitle: `Created ${format(new Date(task.createdAt), "MMMM d, yyyy")}`,
    bodyHtml,
  });

  openPrintPDF(html);
}
