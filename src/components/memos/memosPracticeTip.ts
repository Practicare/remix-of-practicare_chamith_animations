import { TrainingTopic } from "@/components/staffResourceCentre/TrainingTopicDialog";
import memosShot from "@/assets/training-screenshots/memos.png";

interface TipConfig {
  topic: TrainingTopic;
  about: string;
  howToUse: string[];
}

export const MEMOS_PRACTICE_TIP: TipConfig = {
  about:
    "Memos & News lets you share announcements, policies and updates with your entire practice. You can mark items as mandatory so staff must acknowledge them, and track read status to see who has seen each memo. Categories help organise memos by department or topic.",
  howToUse: [
    "Create a new memo using the + button — set the title, content, category and priority.",
    "Toggle Mandatory Read for important items so staff must acknowledge them.",
    "Use the Unread and Mandatory tabs to quickly see what still needs attention.",
  ],
  topic: {
    id: "memos-overview",
    title: "Memos & News",
    summary: "Share announcements and track mandatory read status across your practice.",
    videoDuration: "2:15",
    screenshotUrl: memosShot,
    steps: [
      {
        step: 1,
        title: "Create a memo",
        description: "Click the + button to compose a new memo. Fill in the title, body, choose a category and set the priority level.",
        screenshotCaption: "Create memo dialog",
        annotations: [{ type: "circle", top: 18, left: 85, width: 24, height: 24, label: "Add" }],
      },
      {
        step: 2,
        title: "Mark as mandatory",
        description: "Enable the Mandatory Read toggle when creating or editing a memo to require staff acknowledgment. Unread mandatory memos show a red badge.",
        screenshotCaption: "Mandatory toggle",
        annotations: [{ type: "circle", top: 45, left: 72, width: 24, height: 24, label: "Required" }],
      },
      {
        step: 3,
        title: "Track read status",
        description: "Switch to the Unread or Mandatory tabs to see what still needs attention. Click the read-report icon on any memo to see who has read it.",
        screenshotCaption: "Status tabs",
        annotations: [{ type: "arrow", top: 22, left: 40, width: 20, rotation: 0, label: "Tabs" }],
      },
    ],
  },
};
