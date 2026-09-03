import { ChatMessage, MessageGroup } from "@/types/messaging";
import { mockStaffMembers } from "@/data/mockStaff";

const GROUPS_KEY = "practicare.messaging.groups";
const MESSAGES_KEY = "practicare.messaging.messages";

const hoursAgo = (n: number) => new Date(Date.now() - n * 3600000).toISOString();

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");

const seedGroups = (): MessageGroup[] => {
  const ids = mockStaffMembers.slice(0, 6).map((s) => s.id);
  return [
    {
      id: "grp-all",
      name: "Whole Practice",
      description: "Everyone at the practice",
      memberIds: mockStaffMembers.map((s) => s.id),
      createdAt: hoursAgo(240),
      createdBy: "System",
    },
    {
      id: "grp-front",
      name: "Front Desk",
      description: "Reception and admin team",
      memberIds: ids.slice(0, 3),
      createdAt: hoursAgo(120),
      createdBy: "System",
    },
    {
      id: "grp-clinical",
      name: "Clinical Team",
      description: "Nurses and clinicians",
      memberIds: ids.slice(2, 6),
      createdAt: hoursAgo(80),
      createdBy: "System",
    },
  ];
};

const seedMessages = (): ChatMessage[] => {
  const a = mockStaffMembers[0];
  const b = mockStaffMembers[1] ?? a;
  const nameA = a ? `${a.firstName} ${a.lastName}` : "Practice Manager";
  const nameB = b ? `${b.firstName} ${b.lastName}` : "Team Member";
  return [
    {
      id: "msg-1",
      groupId: "grp-all",
      authorId: a?.id ?? "sys",
      authorName: nameA,
      authorInitials: initials(nameA),
      content: "Morning team — the new infection control policy is now in the Document Library. Please read before Friday.",
      attachments: [],
      createdAt: hoursAgo(26),
    },
    {
      id: "msg-2",
      groupId: "grp-all",
      authorId: b?.id ?? "sys",
      authorName: nameB,
      authorInitials: initials(nameB),
      content: "Thanks, will go through it today.",
      attachments: [],
      createdAt: hoursAgo(24),
    },
    {
      id: "msg-3",
      groupId: "grp-front",
      authorId: b?.id ?? "sys",
      authorName: nameB,
      authorInitials: initials(nameB),
      content: "Phones were flat out this morning — can we add a second person to the 9–11 slot?",
      attachments: [],
      createdAt: hoursAgo(5),
    },
  ];
};

function read<T>(key: string, seed: () => T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T[];
  } catch {
    /* ignore */
  }
  const data = seed();
  localStorage.setItem(key, JSON.stringify(data));
  return data;
}

export const loadGroups = (): MessageGroup[] => read<MessageGroup>(GROUPS_KEY, seedGroups);
export const saveGroups = (groups: MessageGroup[]) =>
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));

export const loadMessages = (): ChatMessage[] => read<ChatMessage>(MESSAGES_KEY, seedMessages);
export const saveMessages = (messages: ChatMessage[]) =>
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));

export const getInitials = initials;
