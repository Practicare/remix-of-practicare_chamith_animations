// Re-export Department from centralized location
export { type Department, type DepartmentType, DEFAULT_DEPARTMENTS, getDepartmentById, getDepartmentsByType } from "./departments";

export type InvitationStatus = "pending" | "accepted";

// Role Levels - hierarchy from Staff (lowest) to Admin (highest)
export type StaffRoleLevel = "staff" | "2ic" | "lead_nurse" | "lead_clinician" | "clinician" | "practice_nurse" | "admin";

export const STAFF_ROLE_LEVELS: { value: StaffRoleLevel; label: string }[] = [
  { value: "staff", label: "Staff" },
  { value: "2ic", label: "2IC" },
  { value: "lead_nurse", label: "Lead Nurse" },
  { value: "lead_clinician", label: "Lead Clinician" },
  { value: "clinician", label: "Clinician" },
  { value: "practice_nurse", label: "Practice Nurse" },
  { value: "admin", label: "Admin" },
];

export const STAFF_ROLE_LEVEL_LABELS: Record<StaffRoleLevel, string> = {
  staff: "Staff",
  "2ic": "2IC",
  lead_nurse: "Lead Nurse",
  lead_clinician: "Lead Clinician",
  clinician: "Clinician",
  practice_nurse: "Practice Nurse",
  admin: "Admin",
};

// Module Permissions
export type ModulePermission = 
  | "dashboard"
  | "staff"
  | "compliance"
  | "stock"
  | "tasks"
  | "checklists"
  | "memos_news"
  | "room_setup"
  | "settings"
  | "communication_book";

export const MODULE_PERMISSIONS: { value: ModulePermission; label: string; description: string }[] = [
  { value: "dashboard", label: "Dashboard", description: "Access main dashboard and analytics" },
  { value: "staff", label: "Staff", description: "Manage staff members and departments" },
  { value: "compliance", label: "Compliance", description: "Manage compliance items" },
  { value: "stock", label: "Stock", description: "Manage inventory and stock" },
  { value: "tasks", label: "Tasks", description: "Manage tasks and assignments" },
  { value: "checklists", label: "Checklists", description: "Manage checklists" },
  { value: "memos_news", label: "Memos & News", description: "Manage memos and news" },
  { value: "communication_book", label: "Communication Book", description: "Read and post notes" },
  { value: "room_setup", label: "Room Setup", description: "Manage rooms and instruments" },
  { value: "settings", label: "Settings", description: "Manage app settings and departments" },
];

export interface StaffModulePermissions {
  module: ModulePermission;
  canView: boolean;
  canEdit: boolean;
  canCreate: boolean;
}

// Helper to get default permissions based on role level
export function getDefaultPermissionsForRole(roleLevel: StaffRoleLevel): StaffModulePermissions[] {
  const isAdmin = roleLevel === "admin";
  
  return MODULE_PERMISSIONS.map(mod => ({
    module: mod.value,
    canView: true,
    canEdit: isAdmin,
    canCreate: isAdmin,
  }));
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface NextOfKin {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface CulturalCelebration {
  id: string;
  name: string;
  date: Date;
  description?: string;
}

export interface StaffPreferences {
  dietaryRestrictions?: string[];
  workPreferences?: string;
  communicationPreference?: "email" | "phone" | "sms";
  notes?: string;
}

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentId: string;
  role: string;
  invitationStatus: InvitationStatus;
  invitedAt?: Date;
  acceptedAt?: Date;
  
  // Role Level and Permissions
  roleLevel?: StaffRoleLevel;
  modulePermissions?: StaffModulePermissions[];
  
  // Personal information
  birthday?: Date;
  address?: string;
  avatar?: string;
  
  // Emergency & Next of Kin
  emergencyContact?: EmergencyContact;
  nextOfKin?: NextOfKin;
  
  // Preferences & Personal
  preferences?: StaffPreferences;
  culturalCelebrations?: CulturalCelebration[];
  likes?: string[];
  dislikes?: string[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export const INVITATION_STATUS_COLORS: Record<InvitationStatus, string> = {
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  accepted: "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20",
};

export const INVITATION_STATUS_LABELS: Record<InvitationStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
};
