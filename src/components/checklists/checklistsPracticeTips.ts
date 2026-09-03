import { TrainingTopic } from "@/components/staffResourceCentre/TrainingTopicDialog";
import createShot from "@/assets/training-screenshots/checklists-create.png";
import libraryShot from "@/assets/training-screenshots/checklists-library.png";
import submissionsShot from "@/assets/training-screenshots/checklists-submissions.png";

export type ChecklistsTabKey = "creation" | "library" | "submissions";

interface TipConfig {
  topic: TrainingTopic;
  about: string;
  howToUse: string[];
}

export const CHECKLISTS_PRACTICE_TIPS: Record<ChecklistsTabKey, TipConfig> = {
  creation: {
    about:
      "Build a checklist for any repeatable, multi-step workflow — opening procedures, closing routines, infection control rounds, equipment checks. Items can be tick, yes/no or number entry, and you can assign the whole checklist to a department, role or specific people.",
    howToUse: [
      "Give the checklist a clear title and pick a category.",
      "Add items one at a time, choosing the right response type (tick, yes/no, number).",
      "Assign it to a department, role or named team members and save.",
    ],
    topic: {
      id: "checklists-create",
      title: "Create a Checklist",
      summary: "Turn any repeatable multi-step routine into a structured, assignable checklist.",
      videoDuration: "3:00",
      screenshotUrl: createShot,
      steps: [
        {
          step: 1,
          title: "Title and category",
          description: "Use a clear, action-led title (e.g. 'Morning opening — Reception'). Pick the right category so it's easy to find.",
          screenshotCaption: "Checklist details",
          annotations: [{ type: "arrow", top: 20, left: 16, width: 22, rotation: 0, label: "Title" }],
        },
        {
          step: 2,
          title: "Add items",
          description: "Add each step as a separate item and pick the response type — tick for done/not-done, yes/no for confirmations, number for readings or counts.",
          screenshotCaption: "Add item",
          annotations: [{ type: "circle", top: 45, left: 10, width: 30, height: 14, label: "Item type" }],
        },
        {
          step: 3,
          title: "Assign and save",
          description: "Assign the checklist to a department, role or named users. Save — it will appear in the Library ready to be completed.",
          screenshotCaption: "Assignment",
          annotations: [{ type: "circle", top: 65, left: 60, width: 22, height: 14, label: "Save" }],
        },
      ],
    },
  },
  library: {
    about:
      "The Checklist Library is where your team finds and completes their assigned checklists. Use category filters and search to locate one quickly. Click any checklist card to open it, tick off items in real time and see who else has completed what.",
    howToUse: [
      "Filter by category or search by name to find a checklist.",
      "Click a card to open and complete the items.",
      "Use the settings menu on a card to edit, assign or reset a checklist.",
    ],
    topic: {
      id: "checklists-library",
      title: "Checklist Library",
      summary: "Find, open and complete the right checklist for your shift or role.",
      videoDuration: "2:40",
      screenshotUrl: libraryShot,
      steps: [
        {
          step: 1,
          title: "Filter and search",
          description: "Use category chips on the left or the search bar to narrow the list to what's relevant.",
          screenshotCaption: "Filters",
          annotations: [{ type: "arrow", top: 28, left: 6, width: 18, rotation: 0, label: "Category" }],
        },
        {
          step: 2,
          title: "Open a checklist",
          description: "Click a card to open it. Tick items as you go — completion is tracked per user in real time.",
          screenshotCaption: "Checklist card",
          annotations: [{ type: "circle", top: 60, left: 28, width: 18, height: 18, label: "Open" }],
        },
        {
          step: 3,
          title: "Manage from the card",
          description: "Use the kebab menu on each card to edit settings, reassign, reset progress or delete.",
          screenshotCaption: "Card actions",
          annotations: [{ type: "circle", top: 60, left: 85, width: 8, height: 10, label: "Menu" }],
        },
      ],
    },
  },
  submissions: {
    about:
      "Submissions is your audit trail — an immutable record of every completed checklist with who completed it, when and what they answered. Filter by date, checklist, user or status and click into any submission to see the full response.",
    howToUse: [
      "Choose a date range and (optionally) a specific checklist or user.",
      "Click a submission row to see the full responses for that run.",
      "Export the filtered list to CSV or PDF for compliance and reporting.",
    ],
    topic: {
      id: "checklists-submissions",
      title: "Checklist Submissions",
      summary: "Audit completed checklists and export evidence for compliance.",
      videoDuration: "2:30",
      screenshotUrl: submissionsShot,
      steps: [
        {
          step: 1,
          title: "Filter submissions",
          description: "Pick a date range and narrow by checklist, user or status to find the runs you need.",
          screenshotCaption: "Filter submissions",
          annotations: [{ type: "arrow", top: 28, left: 18, width: 22, rotation: 0, label: "Filter" }],
        },
        {
          step: 2,
          title: "Review a submission",
          description: "Click any row to see the full responses for that checklist run, including who completed each item and any notes.",
          screenshotCaption: "Submission detail",
          annotations: [{ type: "circle", top: 55, left: 50, width: 28, height: 14, label: "Open" }],
        },
        {
          step: 3,
          title: "Export for compliance",
          description: "Export the filtered list as CSV or PDF — useful for audits, accreditation and reporting.",
          screenshotCaption: "Export",
          annotations: [{ type: "circle", top: 28, left: 84, width: 12, height: 12, label: "Export" }],
        },
      ],
    },
  },
};
