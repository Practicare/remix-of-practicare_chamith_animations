export type MemberStatus = "pending" | "accepted" | "invited" | "confirmed";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  status: MemberStatus;
  categoryId: string;
}

export const MEMBER_STATUS_COLORS: Record<MemberStatus, string> = {
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  accepted: "bg-green-500/10 text-green-700 dark:text-green-300",
  invited: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  confirmed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};
