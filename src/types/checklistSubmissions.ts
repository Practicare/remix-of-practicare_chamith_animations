import { ChecklistItem } from "./checklists";

export interface ChecklistSubmission {
  id: string;
  checklistId: string;
  checklistTitle: string;
  categoryId: string;
  submittedAt: Date;
  submittedBy: string;
  submittedById: string;
  completionPercentage: number;
  totalItems: number;
  completedItems: number;
  criticalItemsCompleted: number;
  criticalItemsTotal: number;
  itemsSnapshot: ChecklistItem[];
  notes?: string;
  /** Ordered oldest -> newest. The submission itself always reflects the latest version. */
  revisions?: SubmissionRevision[];
}

export interface SubmissionRevision {
  id: string;
  version: number;
  editedAt: Date;
  editedBy: string;
  editedById: string;
  changeSummary: string;
  completionPercentage: number;
  completedItems: number;
  totalItems: number;
  itemsSnapshot: ChecklistItem[];
  notes?: string;
}

export interface SubmissionFilters {
  checklistId?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  recurring?: "daily" | "weekly" | "monthly";
}
