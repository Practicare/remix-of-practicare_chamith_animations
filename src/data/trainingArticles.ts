import { TrainingTopic } from "@/components/staffResourceCentre/TrainingTopicDialog";
import { PRACTICE_TIPS } from "@/components/staffResourceCentre/practiceTipsData";
import { TASKS_PRACTICE_TIPS } from "@/components/tasks/tasksPracticeTips";
import { CHECKLISTS_PRACTICE_TIPS } from "@/components/checklists/checklistsPracticeTips";
import { STOCK_PRACTICE_TIPS } from "@/components/stock/stockPracticeTips";
import { INVENTORY_PRACTICE_TIP } from "@/components/stock/inventoryPracticeTip";
import { ROOMS_PRACTICE_TIP } from "@/components/rooms/roomsPracticeTip";
import { COMPLIANCE_PRACTICE_TIP } from "@/components/compliance/compliancePracticeTip";
import { MEMOS_PRACTICE_TIP } from "@/components/memos/memosPracticeTip";
import { COMMUNICATION_BOOK_PRACTICE_TIP } from "@/components/communicationBook/communicationBookPracticeTip";
import { FAQ_PRACTICE_TIP } from "@/components/faq/faqPracticeTip";

// Central registry of training articles. Keyed by article id (also used in URLs).
// Sourced from per-feature Practice Tip topics — extend here as more help articles are added.
const ALL_TIP_SOURCES = [
  ...Object.values(PRACTICE_TIPS),
  ...Object.values(TASKS_PRACTICE_TIPS),
  ...Object.values(CHECKLISTS_PRACTICE_TIPS),
  ...Object.values(STOCK_PRACTICE_TIPS),
  INVENTORY_PRACTICE_TIP,
  ROOMS_PRACTICE_TIP,
  COMPLIANCE_PRACTICE_TIP,
  MEMOS_PRACTICE_TIP,
  COMMUNICATION_BOOK_PRACTICE_TIP,
  FAQ_PRACTICE_TIP,
];

export const TRAINING_ARTICLES: Record<string, TrainingTopic> = Object.fromEntries(
  ALL_TIP_SOURCES.map((tip) => [tip.topic.id, tip.topic])
);

export const getTrainingArticle = (id: string): TrainingTopic | undefined =>
  TRAINING_ARTICLES[id];
