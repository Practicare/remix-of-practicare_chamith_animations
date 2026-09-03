import type { TeamChecklistTemplate, TeamIndustry, TeamRole } from "@/types/onboardingTeam";

interface IndustryDefaults {
  suggestedRooms: string[];
  stockCategories: string[];
  checklistTemplates: TeamChecklistTemplate[];
  roles: TeamRole[];
}

export const DEFAULT_ROLES: TeamRole[] = [
  {
    id: "role-manager",
    name: "Practice Manager",
    description: "Full access to all modules except billing owner settings.",
    modules: ["Tasks", "Checklists", "Stock", "Rooms", "Staff", "Reports", "Compliance"],
    system: true,
  },
  {
    id: "role-clinician",
    name: "Clinician",
    description: "Own tasks and checklists, patient-related stock. No admin settings.",
    modules: ["Tasks", "Checklists", "Stock"],
    system: true,
  },
  {
    id: "role-nurse",
    name: "Practice Nurse",
    description: "Tasks, checklists, stock checkout and rooms.",
    modules: ["Tasks", "Checklists", "Stock", "Rooms"],
    system: true,
  },
  {
    id: "role-reception",
    name: "Reception / Admin",
    description: "Tasks, memos and noticeboards with limited stock visibility.",
    modules: ["Tasks", "Memos", "Noticeboards"],
    system: true,
  },
];

export const INDUSTRY_DEFAULTS: Record<TeamIndustry, IndustryDefaults> = {
  "GP / Primary Care": {
    suggestedRooms: [
      "Reception",
      "Waiting Room",
      "Consulting Room 1",
      "Consulting Room 2",
      "Consulting Room 3",
      "Treatment Room",
      "Nurse Station",
      "Sterilisation",
      "Staff Room",
    ],
    stockCategories: ["Medical consumables", "Vaccines", "PPE", "Stationery"],
    checklistTemplates: [
      {
        id: "tpl-daily-opening",
        title: "Daily Opening Checklist",
        description: "Open the practice: unlock, alarms off, lights, waiting room walk-through.",
        frequency: "Daily",
      },
      {
        id: "tpl-vaccine-fridge",
        title: "Vaccine Fridge Check",
        description: "Record fridge temperature twice daily and flag any excursions.",
        frequency: "Twice daily",
      },
      {
        id: "tpl-sterilisation",
        title: "Sterilisation Log",
        description: "Log autoclave cycles, load contents and indicator results.",
        frequency: "Each cycle",
      },
    ],
    roles: DEFAULT_ROLES,
  },
  Dental: {
    suggestedRooms: [
      "Reception",
      "Waiting Room",
      "Surgery 1",
      "Surgery 2",
      "X-Ray Room",
      "Sterilisation",
      "Staff Room",
    ],
    stockCategories: ["Dental materials", "Instruments", "PPE", "Disinfectants"],
    checklistTemplates: [
      {
        id: "tpl-daily-opening",
        title: "Daily Opening Checklist",
        description: "Open the practice: surgery setup, suction lines, steriliser ready.",
        frequency: "Daily",
      },
      {
        id: "tpl-sterilisation-log",
        title: "Sterilisation Log",
        description: "Record instrument cycles, load tracking and biological indicator results.",
        frequency: "Each cycle",
      },
      {
        id: "tpl-autoclave-test",
        title: "Autoclave Weekly Test",
        description: "Weekly validation test of the autoclave with pass/fail recording.",
        frequency: "Weekly",
      },
    ],
    roles: DEFAULT_ROLES,
  },
  "Allied Health": {
    suggestedRooms: [
      "Reception",
      "Waiting Room",
      "Treatment Room 1",
      "Treatment Room 2",
      "Gym Area",
      "Staff Room",
    ],
    stockCategories: ["Therapy supplies", "PPE", "Equipment"],
    checklistTemplates: [
      {
        id: "tpl-equipment-check",
        title: "Equipment Safety Check",
        description: "Inspect therapy equipment for wear, damage and calibration.",
        frequency: "Weekly",
      },
      {
        id: "tpl-daily-opening",
        title: "Daily Opening Checklist",
        description: "Open the clinic: rooms reset, equipment charged, waiting area tidy.",
        frequency: "Daily",
      },
    ],
    roles: DEFAULT_ROLES,
  },
  "Specialist & Cosmetic": {
    suggestedRooms: [
      "Reception",
      "Waiting Room",
      "Consult Room 1",
      "Procedure Room 1",
      "Procedure Room 2",
      "Recovery",
      "Staff Room",
    ],
    stockCategories: ["Cosmetic consumables", "Medical supplies", "PPE"],
    checklistTemplates: [
      {
        id: "tpl-procedure-room",
        title: "Procedure Room Check",
        description: "Pre-procedure readiness: sterile field, equipment, emergency kit.",
        frequency: "Before each list",
      },
      {
        id: "tpl-expiry-review",
        title: "Expiry Review",
        description: "Review stock approaching expiry and rotate or dispose safely.",
        frequency: "Monthly",
      },
      {
        id: "tpl-daily-opening",
        title: "Daily Opening Checklist",
        description: "Open the practice: reception ready, rooms prepared, recovery stocked.",
        frequency: "Daily",
      },
    ],
    roles: DEFAULT_ROLES,
  },
  Other: {
    suggestedRooms: [
      "Reception",
      "Waiting Room",
      "Consult Room 1",
      "Treatment Room",
      "Storage",
      "Staff Room",
    ],
    stockCategories: ["General supplies", "PPE", "Stationery"],
    checklistTemplates: [
      {
        id: "tpl-daily-opening",
        title: "Daily Opening Checklist",
        description: "Open the practice: rooms ready, reception prepared, systems on.",
        frequency: "Daily",
      },
      {
        id: "tpl-stock-count",
        title: "Stock Count",
        description: "Count key consumables and record low-stock levels for reorder.",
        frequency: "Weekly",
      },
    ],
    roles: DEFAULT_ROLES,
  },
};

export function defaultsFor(industry: TeamIndustry | null): IndustryDefaults {
  return INDUSTRY_DEFAULTS[industry ?? "Other"] ?? INDUSTRY_DEFAULTS["Other"];
}
