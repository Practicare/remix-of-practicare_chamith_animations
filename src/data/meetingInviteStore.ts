import { MeetingInviteLink, MeetingRequest } from "@/types/meetingInvites";

const LINKS_KEY = "practicare.meeting-invite-links";
const REQUESTS_KEY = "practicare.meeting-requests";

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const subscribeInviteStore = (cb: () => void): (() => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

export const getInviteLinks = (): MeetingInviteLink[] => {
  try {
    const raw = localStorage.getItem(LINKS_KEY);
    return raw ? (JSON.parse(raw) as MeetingInviteLink[]) : [];
  } catch {
    return [];
  }
};

export const saveInviteLinks = (links: MeetingInviteLink[]) => {
  localStorage.setItem(LINKS_KEY, JSON.stringify(links));
  emit();
};

export const upsertInviteLink = (link: MeetingInviteLink) => {
  const all = getInviteLinks();
  const idx = all.findIndex((l) => l.id === link.id);
  if (idx >= 0) all[idx] = link;
  else all.unshift(link);
  saveInviteLinks(all);
};

export const deleteInviteLink = (id: string) => {
  saveInviteLinks(getInviteLinks().filter((l) => l.id !== id));
};

export const getInviteByToken = (token: string): MeetingInviteLink | undefined =>
  getInviteLinks().find((l) => l.token === token);

export const getRequests = (): MeetingRequest[] => {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    return raw ? (JSON.parse(raw) as MeetingRequest[]) : [];
  } catch {
    return [];
  }
};

export const saveRequests = (reqs: MeetingRequest[]) => {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(reqs));
  emit();
};

export const addRequest = (req: MeetingRequest) => {
  saveRequests([req, ...getRequests()]);
};

export const updateRequest = (id: string, patch: Partial<MeetingRequest>) => {
  saveRequests(getRequests().map((r) => (r.id === id ? { ...r, ...patch } : r)));
};

export const isLinkActive = (link: MeetingInviteLink, requests?: MeetingRequest[]) => {
  if (link.revoked) return false;
  if (new Date(link.expiresAt).getTime() < Date.now()) return false;
  if (link.singleUse) {
    const reqs = requests ?? getRequests();
    if (reqs.some((r) => r.inviteId === link.id)) return false;
  }
  return true;
};

export const generateToken = () =>
  Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
