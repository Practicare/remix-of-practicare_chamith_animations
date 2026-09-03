export type FAQStatus = "published" | "draft";

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  department: string; // "all" or department id
  status: FAQStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
