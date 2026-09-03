import {
  Home,
  CalendarX,
  ClipboardList,
  CheckSquare,
  Calendar,
  Clock,
  StickyNote,
  AlertTriangle,
  Users,
  Target,
  Layers,
  DoorOpen,
  Package,
  ShieldCheck,
  Shield,
  Newspaper,
  Monitor,
  MessagesSquare,
  BookOpen,
  CalendarDays,
  Mail,
  GraduationCap,
  LifeBuoy,
  FolderOpen,
  HelpCircle,
  BarChart3,
  Store,
  LucideIcon,
} from "lucide-react";

export type ModuleSection =
  | "Overview"
  | "Workflow"
  | "Practice"
  | "Communications"
  | "Resources";

export interface ModuleDefinition {
  /** Must match the nav item id used in AdminLayout / UserLayout */
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  section: ModuleSection;
  /** Route prefixes owned by this module (used for nav filtering + route guarding) */
  paths: string[];
  /** Core modules can never be switched off */
  locked?: boolean;
  /** Other module ids that must be enabled for this one to work */
  dependsOn?: string[];
}

export const MODULE_REGISTRY: ModuleDefinition[] = [
  // Overview
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Practice health, alerts and daily overview.",
    icon: Home,
    section: "Overview",
    paths: ["/dashboard"],
    locked: true,
  },
  {
    id: "expiry-centre",
    label: "Expiry Centre",
    description: "One place for every expiring item, licence and certificate.",
    icon: CalendarX,
    section: "Overview",
    paths: ["/expiry-centre"],
  },

  // Workflow
  {
    id: "tasks",
    label: "Tasks",
    description: "Assign, track and complete recurring practice work.",
    icon: ClipboardList,
    section: "Workflow",
    paths: ["/tasks"],
  },
  {
    id: "checklists",
    label: "Checklists",
    description: "Opening, closing and clinical checklists with audit trail.",
    icon: CheckSquare,
    section: "Workflow",
    paths: ["/checklists"],
  },
  {
    id: "roster",
    label: "Roster",
    description: "Day, week and month shift scheduling by department.",
    icon: Calendar,
    section: "Workflow",
    paths: ["/roster"],
    dependsOn: ["staff"],
  },
  {
    id: "timesheets",
    label: "Timesheets",
    description: "Capture worked hours and approve staff timesheets.",
    icon: Clock,
    section: "Workflow",
    paths: ["/timesheets"],
    dependsOn: ["staff"],
  },
  {
    id: "notes",
    label: "Notes",
    description: "Quick personal notes with images and search.",
    icon: StickyNote,
    section: "Workflow",
    paths: ["/notes"],
  },
  {
    id: "requests",
    label: "Issues",
    description: "Log faults, refill requests and follow them to resolution.",
    icon: AlertTriangle,
    section: "Workflow",
    paths: ["/requests"],
  },

  // Practice
  {
    id: "staff",
    label: "Staff",
    description: "Team profiles, departments, roles and permissions.",
    icon: Users,
    section: "Practice",
    paths: ["/staff", "/department"],
    locked: true,
  },
  {
    id: "kpi",
    label: "KPI",
    description: "Set targets per team member and track attainment.",
    icon: Target,
    section: "Practice",
    paths: ["/kpi"],
    dependsOn: ["staff"],
  },
  {
    id: "inventory",
    label: "Inventory",
    description: "Stock on hand, usage and checkout.",
    icon: Layers,
    section: "Practice",
    paths: ["/inventory"],
  },
  {
    id: "inventory-planner",
    label: "Inventory Planner",
    description: "Budgets, min/max stock levels and expense ratios.",
    icon: ClipboardList,
    section: "Practice",
    paths: ["/inventory/planner"],
    dependsOn: ["inventory"],
  },
  {
    id: "rooms",
    label: "Rooms",
    description: "Room setup, instruments and room checklists.",
    icon: DoorOpen,
    section: "Practice",
    paths: ["/room-setup", "/room"],
  },
  {
    id: "stock-locations",
    label: "Stock Locations",
    description: "Where stock lives across the practice.",
    icon: Package,
    section: "Practice",
    paths: ["/stock"],
    dependsOn: ["inventory"],
  },
  {
    id: "compliance",
    label: "Compliance",
    description: "Registrations, certificates and mandatory evidence.",
    icon: ShieldCheck,
    section: "Practice",
    paths: ["/compliance"],
  },
  {
    id: "accreditation",
    label: "Accreditation Intelligence",
    description: "Accreditation projects, library and readiness reports.",
    icon: Shield,
    section: "Practice",
    paths: ["/accreditation"],
    dependsOn: ["compliance"],
  },

  // Communications
  {
    id: "memos",
    label: "Memos & News",
    description: "Broadcast updates with read receipts.",
    icon: Newspaper,
    section: "Communications",
    paths: ["/memos"],
  },
  {
    id: "noticeboards",
    label: "Noticeboards",
    description: "Screen-ready boards for the staff room.",
    icon: Monitor,
    section: "Communications",
    paths: ["/noticeboards"],
  },
  {
    id: "communication-book",
    label: "Communication Book",
    description: "Shift-to-shift handover in one thread.",
    icon: BookOpen,
    section: "Communications",
    paths: ["/communication-book"],
  },
  {
    id: "messaging",
    label: "Messaging",
    description: "Group chat with document and photo sharing.",
    icon: MessagesSquare,
    section: "Communications",
    paths: ["/messaging"],
  },
  {
    id: "meeting-schedule",
    label: "Meetings & Schedules",
    description: "Plan meetings, send invites and track attendance.",
    icon: CalendarDays,
    section: "Communications",
    paths: ["/meeting-schedule"],
    dependsOn: ["staff"],
  },
  {
    id: "email-templates",
    label: "Email Templates",
    description: "Reusable templates for common practice emails.",
    icon: Mail,
    section: "Communications",
    paths: ["/email-templates"],
  },

  // Resources
  {
    id: "training",
    label: "Training & Resources",
    description: "Training topics and articles for the team.",
    icon: GraduationCap,
    section: "Resources",
    paths: ["/training"],
  },
  {
    id: "staff-action-guide",
    label: "Staff Resource Centre",
    description: "Step-by-step action guides for everyday situations.",
    icon: LifeBuoy,
    section: "Resources",
    paths: ["/staff-action-guide"],
  },
  {
    id: "documents",
    label: "Document Library",
    description: "Policies, procedures and practice documents.",
    icon: FolderOpen,
    section: "Resources",
    paths: ["/documents"],
  },
  {
    id: "faq",
    label: "FAQ",
    description: "Answers your team asks for again and again.",
    icon: HelpCircle,
    section: "Resources",
    paths: ["/faq"],
  },
  {
    id: "reports",
    label: "Reports",
    description: "Exportable performance and compliance reporting.",
    icon: BarChart3,
    section: "Resources",
    paths: ["/reports"],
  },
  {
    id: "marketplace",
    label: "Marketplace",
    description: "Smart directory of service providers with free and premium listings.",
    icon: Store,
    section: "Resources",
    paths: ["/marketplace"],
  },
];

export const MODULE_SECTIONS: ModuleSection[] = [
  "Overview",
  "Workflow",
  "Practice",
  "Communications",
  "Resources",
];

export const ALL_MODULE_IDS = MODULE_REGISTRY.map((m) => m.id);
export const LOCKED_MODULE_IDS = MODULE_REGISTRY.filter((m) => m.locked).map((m) => m.id);

export interface ModulePreset {
  id: string;
  label: string;
  description: string;
  modules: string[];
}

const essentials = [
  "dashboard",
  "staff",
  "tasks",
  "checklists",
  "expiry-centre",
  "inventory",
  "memos",
];

const complianceFocused = [
  ...essentials,
  "compliance",
  "accreditation",
  "documents",
  "reports",
  "requests",
];

export const MODULE_PRESETS: ModulePreset[] = [
  {
    id: "essentials",
    label: "Essentials",
    description: "The daily-run basics — tasks, checklists, stock and staff.",
    modules: essentials,
  },
  {
    id: "compliance",
    label: "Compliance focused",
    description: "Essentials plus accreditation, documents and reporting.",
    modules: complianceFocused,
  },
  {
    id: "full",
    label: "Full practice",
    description: "Every module switched on. Recommended while exploring.",
    modules: ALL_MODULE_IDS,
  },
];

/** Resolve dependencies: enabling a module enables everything it needs. */
export function withDependencies(ids: string[]): string[] {
  const set = new Set([...ids, ...LOCKED_MODULE_IDS]);
  let changed = true;
  while (changed) {
    changed = false;
    MODULE_REGISTRY.forEach((m) => {
      if (!set.has(m.id)) return;
      m.dependsOn?.forEach((dep) => {
        if (!set.has(dep)) {
          set.add(dep);
          changed = true;
        }
      });
    });
  }
  return ALL_MODULE_IDS.filter((id) => set.has(id));
}

/** Modules that would break if `id` is switched off. */
export function dependentsOf(id: string): ModuleDefinition[] {
  return MODULE_REGISTRY.filter((m) => m.dependsOn?.includes(id));
}

export function moduleForPath(pathname: string): ModuleDefinition | undefined {
  let best: ModuleDefinition | undefined;
  let bestLength = 0;
  MODULE_REGISTRY.forEach((m) => {
    m.paths.forEach((p) => {
      if ((pathname === p || pathname.startsWith(`${p}/`)) && p.length > bestLength) {
        best = m;
        bestLength = p.length;
      }
    });
  });
  return best;
}
