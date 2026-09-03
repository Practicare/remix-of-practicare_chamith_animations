import { CommunicationNote } from "@/types/communicationBook";

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

const makeDate = (base: Date, h: number, m: number) => {
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
};

export const mockCommunicationNotes: CommunicationNote[] = [
  {
    id: "cn-1",
    content: "Printer in Room 3 is jammed again. I've placed an out-of-order sign. IT has been notified.",
    authorId: "staff-1",
    authorName: "Sarah Johnson",
    authorRole: "Senior Receptionist",
    authorDepartment: "Reception",
    authorInitials: "SJ",
    createdAt: makeDate(today, 9, 15),
    seenBy: [
      { userId: "staff-4", userName: "Jessica Williams", seenAt: makeDate(today, 9, 30), avatarInitials: "JW" },
      { userId: "staff-9", userName: "Patricia Moore", seenAt: makeDate(today, 10, 0), avatarInitials: "PM" },
    ],
  },
  {
    id: "cn-2",
    content: "Reminder: Fire drill scheduled for Thursday at 2pm. Please ensure all patients are informed during morning appointments.",
    authorId: "staff-9",
    authorName: "Patricia Moore",
    authorRole: "Office Manager",
    authorDepartment: "Admin",
    authorInitials: "PM",
    createdAt: makeDate(today, 8, 0),
    seenBy: [
      { userId: "staff-1", userName: "Sarah Johnson", seenAt: makeDate(today, 8, 20), avatarInitials: "SJ" },
      { userId: "staff-4", userName: "Jessica Williams", seenAt: makeDate(today, 8, 45), avatarInitials: "JW" },
      { userId: "staff-7", userName: "Robert Smith", seenAt: makeDate(today, 9, 0), avatarInitials: "RS" },
      { userId: "staff-5", userName: "David Lee", seenAt: makeDate(today, 9, 10), avatarInitials: "DL" },
    ],
  },
  {
    id: "cn-3",
    content: "Low stock on flu vaccines. Only 12 remaining. Placed an order with supplier — expected delivery Friday.",
    authorId: "staff-4",
    authorName: "Jessica Williams",
    authorRole: "Head Nurse",
    authorDepartment: "Nursing",
    authorInitials: "JW",
    createdAt: makeDate(yesterday, 16, 30),
    seenBy: [
      { userId: "staff-7", userName: "Robert Smith", seenAt: makeDate(yesterday, 17, 0), avatarInitials: "RS" },
      { userId: "staff-9", userName: "Patricia Moore", seenAt: makeDate(yesterday, 17, 15), avatarInitials: "PM" },
    ],
  },
  {
    id: "cn-4",
    content: "Patient Mrs. Green called to say she left her umbrella in the waiting room. It's been placed in lost and found behind reception.",
    authorId: "staff-2",
    authorName: "Mike Chen",
    authorRole: "Receptionist",
    authorDepartment: "Reception",
    authorInitials: "MC",
    createdAt: makeDate(yesterday, 14, 10),
    seenBy: [
      { userId: "staff-1", userName: "Sarah Johnson", seenAt: makeDate(yesterday, 14, 30), avatarInitials: "SJ" },
    ],
  },
  {
    id: "cn-5",
    content: "Air conditioning unit in the main waiting area has been serviced and is now working. Temperature should normalise within the hour.",
    authorId: "staff-11",
    authorName: "Kevin White",
    authorRole: "IT Manager",
    authorDepartment: "IT",
    authorInitials: "KW",
    createdAt: makeDate(twoDaysAgo, 11, 0),
    seenBy: [
      { userId: "staff-9", userName: "Patricia Moore", seenAt: makeDate(twoDaysAgo, 11, 30), avatarInitials: "PM" },
      { userId: "staff-1", userName: "Sarah Johnson", seenAt: makeDate(twoDaysAgo, 12, 0), avatarInitials: "SJ" },
      { userId: "staff-4", userName: "Jessica Williams", seenAt: makeDate(twoDaysAgo, 12, 15), avatarInitials: "JW" },
      { userId: "staff-2", userName: "Mike Chen", seenAt: makeDate(twoDaysAgo, 13, 0), avatarInitials: "MC" },
      { userId: "staff-5", userName: "David Lee", seenAt: makeDate(twoDaysAgo, 13, 30), avatarInitials: "DL" },
    ],
  },
];
