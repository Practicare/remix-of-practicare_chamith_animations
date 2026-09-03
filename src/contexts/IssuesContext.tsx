import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from "react";
import { toast } from "sonner";

export type IssueStatus = "open" | "in-progress" | "resolved" | "closed";
export type IssuePriority = "low" | "medium" | "high";

export interface Issue {
  id: string;
  title: string;
  description?: string;
  status: IssueStatus;
  priority: IssuePriority;
  reportedBy?: string;
  assignedTo?: string; // team member name
  departmentId?: string;
  roomName?: string;
  stockCategoryId?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "practicare.issues.v1";

function loadInitial(): Issue[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Issue[];
  } catch {}
  return [];
}

interface IssuesContextValue {
  issues: Issue[];
  activeCount: number;
  createIssue: (input: Omit<Issue, "id" | "createdAt" | "updatedAt" | "status"> & { status?: IssueStatus }) => Issue;
  updateIssue: (id: string, patch: Partial<Issue>) => void;
  deleteIssue: (id: string) => void;
}

const IssuesContext = createContext<IssuesContextValue | null>(null);

export function IssuesProvider({ children }: { children: ReactNode }) {
  const [issues, setIssues] = useState<Issue[]>(() => loadInitial());

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(issues)); } catch {}
  }, [issues]);

  const createIssue: IssuesContextValue["createIssue"] = useCallback((input) => {
    const now = new Date().toISOString();
    const issue: Issue = {
      id: `iss-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      status: input.status ?? "open",
      createdAt: now,
      updatedAt: now,
      ...input,
    };
    setIssues((prev) => [issue, ...prev]);
    toast.success(`Issue reported: "${issue.title}"`, {
      description: issue.assignedTo ? `Assigned to ${issue.assignedTo}` : undefined,
    });
    return issue;
  }, []);

  const updateIssue = useCallback((id: string, patch: Partial<Issue>) => {
    setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch, updatedAt: new Date().toISOString() } : i)));
  }, []);

  const deleteIssue = useCallback((id: string) => {
    setIssues((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const value = useMemo<IssuesContextValue>(
    () => ({
      issues,
      activeCount: issues.filter((i) => i.status !== "resolved" && i.status !== "closed").length,
      createIssue,
      updateIssue,
      deleteIssue,
    }),
    [issues, createIssue, updateIssue, deleteIssue]
  );

  return <IssuesContext.Provider value={value}>{children}</IssuesContext.Provider>;
}

export function useIssues() {
  const ctx = useContext(IssuesContext);
  if (!ctx) throw new Error("useIssues must be used within IssuesProvider");
  return ctx;
}
