import { Meeting } from "@/types/meetingSchedule";

const today = new Date();
const d = (offset: number) => {
  const x = new Date(today);
  x.setDate(today.getDate() + offset);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const mockMeetings: Meeting[] = [
  {
    id: "mtg-1",
    title: "Weekly Staff Meeting",
    type: "staff_meeting",
    date: d(1),
    startTime: "08:00",
    endTime: "09:00",
    location: "Conference Room",
    presenter: "Practice Manager",
    details: "Review of week's operations, upcoming priorities and open issues.",
    attendees: [],
    createdAt: new Date(),
  },
  {
    id: "mtg-2",
    title: "Pfizer Rep — New Vaccine Update",
    type: "medical_representative",
    date: d(3),
    startTime: "12:30",
    endTime: "13:15",
    location: "Lunch Room",
    presenter: "John (Pfizer)",
    details: "Lunch provided. Presentation on latest vaccine guidelines.",
    attendees: [],
    createdAt: new Date(),
  },
  {
    id: "mtg-3",
    title: "Clinical Case Review — Diabetes",
    type: "clinical_presentation",
    date: d(7),
    startTime: "17:30",
    endTime: "18:30",
    location: "Doctors' Room",
    presenter: "Dr. Sarah Johnson",
    details: "Monthly clinical presentation. CPD points available.",
    attendees: [],
    createdAt: new Date(),
  },
];
