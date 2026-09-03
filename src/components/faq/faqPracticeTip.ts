import { TrainingTopic } from "@/components/staffResourceCentre/TrainingTopicDialog";
import faqShot from "@/assets/training-screenshots/faq.png";

interface TipConfig {
  topic: TrainingTopic;
  about: string;
  howToUse: string[];
}

export const FAQ_PRACTICE_TIP: TipConfig = {
  about:
    "FAQ Manager is for commonly asked questions that staff need quick answers to. For step-by-step action guides and emergency procedures, use the Action Guides section of the Staff Resource Centre instead.",
  howToUse: [
    "Create a new FAQ using the + button — set the question, answer, department and status.",
    "Publish FAQs so they appear to all staff. Keep drafts while you're still refining the content.",
    "Filter by department to see FAQs relevant to specific teams.",
    "For detailed action guides and emergency procedures, go to the Staff Resource Centre.",
  ],
  topic: {
    id: "faq-overview",
    title: "FAQ Manager",
    summary: "Manage commonly asked questions for quick staff reference.",
    videoDuration: "1:45",
    screenshotUrl: faqShot,
    steps: [
      {
        step: 1,
        title: "Create an FAQ",
        description: "Click the + button to add a new frequently asked question. Fill in the question, answer, choose a department and set the status.",
        screenshotCaption: "Create FAQ dialog",
        annotations: [{ type: "circle", top: 18, left: 85, width: 24, height: 24, label: "Add" }],
      },
      {
        step: 2,
        title: "Publish or draft",
        description: "Set the status to Published to make it visible to staff, or keep it as Draft while you refine the content. Toggle status anytime.",
        screenshotCaption: "Status toggle",
        annotations: [{ type: "circle", top: 45, left: 72, width: 24, height: 24, label: "Publish" }],
      },
      {
        step: 3,
        title: "Filter by department",
        description: "Use the department tabs to quickly find FAQs relevant to specific teams or view all at once.",
        screenshotCaption: "Department tabs",
        annotations: [{ type: "arrow", top: 22, left: 40, width: 20, rotation: 0, label: "Tabs" }],
      },
    ],
  },
};
