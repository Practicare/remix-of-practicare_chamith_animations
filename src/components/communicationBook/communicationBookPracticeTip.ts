import { TrainingTopic } from "@/components/staffResourceCentre/TrainingTopicDialog";
import commBookShot from "@/assets/training-screenshots/communication-book.png";

interface TipConfig {
  topic: TrainingTopic;
  about: string;
  howToUse: string[];
}

export const COMMUNICATION_BOOK_PRACTICE_TIP: TipConfig = {
  about:
    "The Digital Communication Book lets your team leave notes, updates and reminders that everyone can see. Each entry tracks who has read it, so you know important messages have been seen. Use it for shift handovers, announcements and anything the whole practice needs to know.",
  howToUse: [
    "Type a note in the text box and press Enter (or click Add Note) to post it to the team.",
    "Notes are automatically grouped by date — today, yesterday and earlier entries.",
    "Click the eye icon on any note to see which team members have read it.",
    "Use the date filters (Today, 7 Days, Custom) to find older messages quickly.",
  ],
  topic: {
    id: "communication-book-overview",
    title: "Communication Book",
    summary: "Leave team notes and track read status so nothing gets missed.",
    videoDuration: "2:10",
    screenshotUrl: commBookShot,
    steps: [
      {
        step: 1,
        title: "Add a note",
        description: "Type your message in the text box at the top and press Enter or click Add Note. Your name, role and timestamp are recorded automatically.",
        screenshotCaption: "Add note",
        annotations: [{ type: "arrow", top: 18, left: 12, width: 22, rotation: 0, label: "Write" }],
      },
      {
        step: 2,
        title: "Track read status",
        description: "Each note shows a Seen by count. Click the eye icon to see exactly which staff members have read the entry and when.",
        screenshotCaption: "Seen by",
        annotations: [{ type: "circle", top: 55, left: 8, width: 24, height: 24, label: "Seen" }],
      },
      {
        step: 3,
        title: "Filter by date",
        description: "Use the date filter tabs to show only today's notes, the last 7 days, or pick a custom date range to find older entries.",
        screenshotCaption: "Date filters",
        annotations: [{ type: "arrow", top: 22, left: 40, width: 20, rotation: 0, label: "Filter" }],
      },
    ],
  },
};
