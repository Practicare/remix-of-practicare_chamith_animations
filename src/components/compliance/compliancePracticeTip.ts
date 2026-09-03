import { TrainingTopic } from "@/components/staffResourceCentre/TrainingTopicDialog";
import complianceShot from "@/assets/training-screenshots/compliance.png";

interface TipConfig {
  topic: TrainingTopic;
  about: string;
  howToUse: string[];
}

export const COMPLIANCE_PRACTICE_TIP: TipConfig = {
  about:
    "The Compliance Dashboard keeps every certification, registration and safety requirement in one place. Category cards give you an at-a-glance view of status — click any card to open its detail page and manage individual items. The system automatically flags items as Valid, Expiring Soon or Expired based on their due dates.",
  howToUse: [
    "Click any category card (e.g. CPR Certification, AHPRA, Safety) to open its detail page.",
    "Inside a category, create new items, edit existing ones, or renew expiring documents.",
    "Use the AI Task Creation button to quickly generate follow-up tasks for expiring items.",
  ],
  topic: {
    id: "compliance-overview",
    title: "Compliance Dashboard",
    summary: "Track certifications, registrations and safety requirements across your practice.",
    videoDuration: "2:40",
    screenshotUrl: complianceShot,
    steps: [
      {
        step: 1,
        title: "Browse categories",
        description: "The dashboard shows every compliance category as a card. Each card displays how many items it contains and their overall status at a glance.",
        screenshotCaption: "Category grid",
        annotations: [{ type: "circle", top: 35, left: 12, width: 24, height: 24, label: "Category" }],
      },
      {
        step: 2,
        title: "Open a category",
        description: "Click any category card to open its detail page. Here you can view all items, add new ones, edit details or renew expiring certifications.",
        screenshotCaption: "Category card",
        annotations: [{ type: "circle", top: 35, left: 12, width: 24, height: 24, label: "Open" }],
      },
      {
        step: 3,
        title: "AI Task Creation",
        description: "Use the AI Task Creation button in the top right to quickly generate follow-up tasks for expiring or expired compliance items.",
        screenshotCaption: "AI button",
        annotations: [{ type: "arrow", top: 18, left: 72, width: 20, rotation: 0, label: "AI Tasks" }],
      },
    ],
  },
};
