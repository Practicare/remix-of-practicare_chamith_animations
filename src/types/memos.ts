export type MemoType = "memo" | "news" | "announcement" | "policy";
export type MemoPriority = "low" | "normal" | "high" | "urgent";

export interface MemoReadStatus {
  userId: string;
  userName: string;
  readAt: Date;
}

export interface Memo {
  id: string;
  title: string;
  content: string;
  type: MemoType;
  priority: MemoPriority;
  mandatoryRead: boolean;
  author: string;
  categoryId: string;
  createdAt: Date;
  expiresAt?: Date;
  readBy: MemoReadStatus[];
  targetDepartments: string[]; // empty = all departments
}

export interface MemoCategory {
  id: string;
  name: string;
  color: string;
}

export const DEFAULT_MEMO_CATEGORIES: MemoCategory[] = [
  { id: "all", name: "All", color: "bg-primary" },
  { id: "general", name: "General", color: "bg-blue-500" },
  { id: "clinical", name: "Clinical", color: "bg-green-500" },
  { id: "administrative", name: "Administrative", color: "bg-purple-500" },
  { id: "hr", name: "HR & Staff", color: "bg-orange-500" },
  { id: "compliance", name: "Compliance", color: "bg-red-500" },
  { id: "it", name: "IT & Systems", color: "bg-cyan-500" },
];

export const MEMO_TYPE_LABELS: Record<MemoType, string> = {
  memo: "Memo",
  news: "Practice News",
  announcement: "Announcement",
  policy: "Policy Update",
};

export const MEMO_PRIORITY_COLORS: Record<MemoPriority, string> = {
  low: "bg-muted text-muted-foreground",
  normal: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  high: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  urgent: "bg-destructive/10 text-destructive",
};
