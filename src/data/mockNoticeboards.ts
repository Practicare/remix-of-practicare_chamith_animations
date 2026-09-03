import { Noticeboard } from "@/types/noticeboards";

const code = () =>
  Math.random().toString(36).slice(2, 6).toUpperCase() +
  "-" +
  Math.random().toString(36).slice(2, 6).toUpperCase();

export const mockNoticeboards: Noticeboard[] = [
  {
    id: "nb-1",
    name: "Reception Display",
    location: "reception",
    pairingCode: "A4F2-9KQ7",
    paired: true,
    notices: [
      {
        id: "n-1",
        title: "Welcome to our practice",
        body: "Please check in at the front desk on arrival.",
        durationSeconds: 10,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ],
    linkedMemoIds: [],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: "nb-2",
    name: "Waiting Room TV",
    location: "waiting_room",
    pairingCode: "B7X1-3MP9",
    paired: true,
    notices: [
      {
        id: "n-2",
        title: "Flu season is here",
        body: "Ask reception about booking your flu vaccination today.",
        durationSeconds: 15,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ],
    linkedMemoIds: [],
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
  },
  {
    id: "nb-3",
    name: "Staff Room Board",
    location: "staff_room",
    pairingCode: code(),
    paired: false,
    notices: [],
    linkedMemoIds: ["memo-2"],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
];
