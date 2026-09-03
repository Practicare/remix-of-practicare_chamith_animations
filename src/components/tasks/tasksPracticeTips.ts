import { TrainingTopic } from "@/components/staffResourceCentre/TrainingTopicDialog";
import createShot from "@/assets/training-screenshots/tasks-create.png";
import libraryShot from "@/assets/training-screenshots/tasks-library.png";
import historyShot from "@/assets/training-screenshots/tasks-history.png";

export type TasksTabKey = "creation" | "library" | "history";

interface TipConfig {
  topic: TrainingTopic;
  about: string;
  howToUse: string[];
}

export const TASKS_PRACTICE_TIPS: Record<TasksTabKey, TipConfig> = {
  creation: {
    about:
      "Use tasks for standalone, one-off actions — like ordering supplies or following up on a phone call. Tasks can be once-off or set to recur on a schedule. For multi-step workflows (e.g. daily opening procedures), create a checklist instead.",
    howToUse: [
      "Click 'Create Task' and give it a clear, action-led title.",
      "Assign to a person or a role, set the due date and priority.",
      "Toggle 'Recurring' for tasks that repeat on a schedule (daily, weekly, monthly).",
    ],
    topic: {
      id: "tasks-create",
      title: "Create a Task",
      summary: "Capture one-off and recurring actions and assign them to the right person.",
      videoDuration: "2:20",
      screenshotUrl: createShot,
      steps: [
        {
          step: 1,
          title: "Open the create form",
          description: "From the Create tab, click 'Create Task' to open the form.",
          screenshotCaption: "Create tab",
          annotations: [{ type: "circle", top: 60, left: 38, width: 24, height: 18, label: "Create Task" }],
        },
        {
          step: 2,
          title: "Fill in the details",
          description: "Add a title, assignee, due date and priority. Use a clear verb-led title so it's obvious what to do.",
          screenshotCaption: "Task details",
          annotations: [{ type: "arrow", top: 30, left: 30, width: 25, rotation: 0, label: "Title" }],
        },
        {
          step: 3,
          title: "Set recurrence if needed",
          description: "Toggle 'Recurring' for repeating tasks. Pick a cadence (daily, weekly, monthly) and an end date if any.",
          screenshotCaption: "Recurrence toggle",
          annotations: [{ type: "circle", top: 70, left: 35, width: 14, height: 10, label: "Recur" }],
        },
      ],
    },
  },
  library: {
    about:
      "The Task Library is where all active tasks live. Filter by assignee, status or keyword to find what you need, and switch between list, cards or board view for the best fit. Tick tasks off as you complete them — they'll move to History automatically.",
    howToUse: [
      "Search or filter by assignee and status to narrow the list.",
      "Switch between List, Cards and Board views using the segmented control.",
      "Tick the checkbox to complete a task, or click a row to edit it.",
    ],
    topic: {
      id: "tasks-library",
      title: "Task Library",
      summary: "Find, organise and complete every active task in your practice.",
      videoDuration: "3:00",
      screenshotUrl: libraryShot,
      steps: [
        {
          step: 1,
          title: "Filter and search",
          description: "Use the search bar and assignee filter to narrow the list. Clear filters to see everything.",
          screenshotCaption: "Filters",
          annotations: [{ type: "arrow", top: 18, left: 10, width: 25, rotation: 0, label: "Search" }],
        },
        {
          step: 2,
          title: "Choose your view",
          description: "List is best for quick triage, Cards group by date, and Board shows status columns Kanban-style.",
          screenshotCaption: "View switcher",
          annotations: [{ type: "circle", top: 18, left: 60, width: 22, height: 14, label: "View" }],
        },
        {
          step: 3,
          title: "Complete or edit",
          description: "Tick the checkbox to mark a task complete. Click the row to edit details or reassign.",
          screenshotCaption: "Row actions",
          annotations: [{ type: "circle", top: 50, left: 6, width: 6, height: 8, label: "Tick" }],
        },
      ],
    },
  },
  history: {
    about:
      "Task History keeps an audit trail of every completed task. Use it for reporting, performance reviews or to look back at when something was actioned. Filter by date, department or person and export to CSV or PDF.",
    howToUse: [
      "Pick a date range and (optionally) a department or user.",
      "Review the completed tasks shown in the table.",
      "Click Export to download the filtered list as CSV or PDF.",
    ],
    topic: {
      id: "tasks-history",
      title: "Task History",
      summary: "Audit completed tasks and export reports by date, team or person.",
      videoDuration: "1:50",
      screenshotUrl: historyShot,
      steps: [
        {
          step: 1,
          title: "Set the date range",
          description: "Pick a preset (last 7 days, this month) or a custom range.",
          screenshotCaption: "Date range",
          annotations: [{ type: "arrow", top: 20, left: 14, width: 20, rotation: 0, label: "Range" }],
        },
        {
          step: 2,
          title: "Filter by team or user",
          description: "Narrow further by department or by an individual assignee.",
          screenshotCaption: "Filters",
          annotations: [{ type: "circle", top: 28, left: 30, width: 18, height: 10, label: "Filter" }],
        },
        {
          step: 3,
          title: "Export the report",
          description: "Use the Export button to download the filtered list as CSV or PDF for reporting.",
          screenshotCaption: "Export",
          annotations: [{ type: "circle", top: 28, left: 82, width: 14, height: 12, label: "Export" }],
        },
      ],
    },
  },
};
