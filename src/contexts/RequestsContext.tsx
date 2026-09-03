import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from "react";
import { toast } from "sonner";

export type RefillStatus = "order" | "pending" | "refilled";
export type RequestAction = RefillStatus | "closed" | (string & {});

export const DEFAULT_ACTIONS: string[] = ["order", "pending", "refilled", "closed"];
export const INACTIVE_ACTIONS = new Set(["refilled", "closed"]);

export interface RequestComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface RefillRequest {
  id: string;
  stockItemId: string;
  itemName: string;
  roomName: string;
  categoryId?: string;
  quantity: number;
  status: string; // RefillStatus | "closed" | custom
  type: string; // "refill" | custom
  teamMember?: string;
  notes?: string;
  comments?: RequestComment[];
  createdAt: string;
  updatedAt: string;
  requestedBy?: string;
}

const STORAGE_KEY = "practicare.refillRequests.v2";
const ACTIONS_STORAGE_KEY = "practicare.refillCustomActions.v1";

function loadInitial(): RefillRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as RefillRequest[];
    // migrate from v1
    const legacy = window.localStorage.getItem("practicare.refillRequests.v1");
    if (legacy) {
      const arr = JSON.parse(legacy) as any[];
      return arr.map((r) => ({ ...r, type: r.type ?? "refill", comments: r.comments ?? [] }));
    }
  } catch {}
  return [];
}

function loadCustomActions(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ACTIONS_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as string[];
  } catch {}
  return [];
}

interface RequestsContextValue {
  requests: RefillRequest[];
  activeCount: number;
  customActions: string[];
  allActions: string[];
  addCustomAction: (label: string) => void;
  createRefill: (input: Omit<RefillRequest, "id" | "status" | "createdAt" | "updatedAt" | "type"> & { status?: string; type?: string }) => RefillRequest;
  createRequest: (input: Omit<RefillRequest, "id" | "createdAt" | "updatedAt">) => RefillRequest;
  updateStatus: (id: string, status: string) => void;
  updateRequest: (id: string, patch: Partial<RefillRequest>) => void;
  addComment: (id: string, author: string, text: string) => void;
  deleteRequest: (id: string) => void;
  getByStockId: (stockItemId: string) => RefillRequest | undefined;
}

const RequestsContext = createContext<RequestsContextValue | null>(null);

export function RequestsProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<RefillRequest[]>(() => loadInitial());
  const [customActions, setCustomActions] = useState<string[]>(() => loadCustomActions());

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests)); } catch {}
  }, [requests]);
  useEffect(() => {
    try { window.localStorage.setItem(ACTIONS_STORAGE_KEY, JSON.stringify(customActions)); } catch {}
  }, [customActions]);

  const createRefill: RequestsContextValue["createRefill"] = useCallback((input) => {
    const now = new Date().toISOString();
    const req: RefillRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      status: input.status ?? "order",
      type: input.type ?? "refill",
      comments: [],
      createdAt: now,
      updatedAt: now,
      ...input,
    };
    setRequests((prev) => [req, ...prev]);
    toast.success(`Refill ordered for "${req.itemName}"`, {
      description: `Sent to Requests · ${req.roomName}`,
    });
    return req;
  }, []);

  const createRequest: RequestsContextValue["createRequest"] = useCallback((input) => {
    const now = new Date().toISOString();
    const req: RefillRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      comments: [],
      createdAt: now,
      updatedAt: now,
      ...input,
    };
    setRequests((prev) => [req, ...prev]);
    toast.success(`Request created: "${req.itemName}"`);
    return req;
  }, []);

  const updateStatus = useCallback((id: string, status: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r))
    );
  }, []);

  const updateRequest = useCallback((id: string, patch: Partial<RefillRequest>) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: new Date().toISOString() } : r))
    );
  }, []);

  const addComment = useCallback((id: string, author: string, text: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              comments: [
                ...(r.comments ?? []),
                { id: `c-${Date.now()}`, author, text, createdAt: new Date().toISOString() },
              ],
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );
  }, []);

  const deleteRequest = useCallback((id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addCustomAction = useCallback((label: string) => {
    const clean = label.trim();
    if (!clean) return;
    setCustomActions((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
  }, []);

  const allActions = useMemo(() => [...DEFAULT_ACTIONS, ...customActions], [customActions]);

  const value = useMemo<RequestsContextValue>(
    () => ({
      requests,
      activeCount: requests.filter((r) => !INACTIVE_ACTIONS.has(r.status)).length,
      customActions,
      allActions,
      addCustomAction,
      createRefill,
      createRequest,
      updateStatus,
      updateRequest,
      addComment,
      deleteRequest,
      getByStockId: (stockItemId) => requests.find((r) => r.stockItemId === stockItemId && !INACTIVE_ACTIONS.has(r.status)),
    }),
    [requests, customActions, allActions, addCustomAction, createRefill, createRequest, updateStatus, updateRequest, addComment, deleteRequest]
  );

  return <RequestsContext.Provider value={value}>{children}</RequestsContext.Provider>;
}

export function useRequests() {
  const ctx = useContext(RequestsContext);
  if (!ctx) throw new Error("useRequests must be used within RequestsProvider");
  return ctx;
}
