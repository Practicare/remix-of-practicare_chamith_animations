export type MeetingType =
  | "staff_meeting"
  | "medical_representative"
  | "clinical_presentation"
  | "training"
  | "management"
  | "other";

export interface MeetingAttendee {
  id: string;
  name: string;
}

export interface Meeting {
  id: string;
  title: string;
  type: MeetingType;
  date: Date;
  startTime: string; // "HH:mm"
  endTime: string;
  location?: string;
  presenter?: string;
  details?: string;
  attendees: MeetingAttendee[];
  createdAt: Date;
  sentAsMemo?: boolean;
  notifications?: {
    email?: boolean;
    sms?: boolean;
    sentAt?: Date;
  };
}

export const MEETING_TYPE_LABELS: Record<MeetingType, string> = {
  staff_meeting: "Staff Meeting",
  medical_representative: "Medical Representative",
  clinical_presentation: "Clinical Presentation",
  training: "Training",
  management: "Management",
  other: "Other",
};

export const MEETING_TYPE_COLORS: Record<MeetingType, string> = {
  staff_meeting: "bg-primary/10 text-primary border-primary/30",
  medical_representative: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  clinical_presentation: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  training: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
  management: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30",
  other: "bg-muted text-muted-foreground border-border",
};

export const MEETING_TYPE_DOT: Record<MeetingType, string> = {
  staff_meeting: "bg-primary",
  medical_representative: "bg-amber-500",
  clinical_presentation: "bg-emerald-500",
  training: "bg-blue-500",
  management: "bg-purple-500",
  other: "bg-muted-foreground",
};
