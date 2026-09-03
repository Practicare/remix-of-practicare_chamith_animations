import { MeetingType } from "./meetingSchedule";

export interface MeetingInviteLink {
  id: string;
  token: string;
  title: string;
  /** Allowed meeting type the external party is invited to request */
  meetingType: MeetingType;
  /** Optional notes / instructions for the external party (e.g. dietary requirements) */
  instructions?: string;
  /** Specific custom prompts/questions the external party must answer */
  customPrompts: string[];
  /** Expiry datetime (ISO) */
  expiresAt: string;
  /** Single-use link? If true, becomes inactive after first submission */
  singleUse: boolean;
  /** Manager who created */
  createdBy?: string;
  createdAt: string;
  /** Disabled manually by manager */
  revoked?: boolean;
}

export interface MeetingRequest {
  id: string;
  inviteId: string;
  inviteToken: string;
  /** Submitter info */
  submitterName: string;
  submitterEmail: string;
  submitterOrganization?: string;
  /** Proposed meeting */
  proposedTitle: string;
  proposedDate: string; // yyyy-MM-dd
  proposedStartTime: string;
  proposedEndTime: string;
  proposedLocation?: string;
  details?: string;
  /** Answers to customPrompts (parallel array) */
  promptAnswers: string[];
  status: "pending" | "approved" | "declined";
  submittedAt: string;
  reviewedAt?: string;
  /** Linked meeting once approved */
  meetingId?: string;
}
