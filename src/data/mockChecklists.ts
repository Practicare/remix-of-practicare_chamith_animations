import { Checklist } from "@/types/checklists";

export const mockChecklists: Checklist[] = [
  {
    id: "checklist-1",
    title: "Morning Opening Procedures",
    description: "Daily opening tasks for reception",
    categoryId: "reception",
    recurring: "daily",
    createdAt: new Date("2024-01-01"),
    createdBy: "Admin",
    items: [
      // Tick items - basic
      { id: "item-1-1", text: "Unlock front doors", type: "tick", completed: true, completedBy: "Sarah M.", completedAt: new Date(Date.now() - 3600000) },
      { id: "item-1-2", text: "Turn on lights and signage", type: "tick", completed: true, completedBy: "Sarah M.", completedAt: new Date(Date.now() - 3540000) },
      // Tick item - CRITICAL
      { id: "item-1-3", text: "Boot up reception computers", type: "tick", completed: true, completedBy: "John D.", completedAt: new Date(Date.now() - 1800000), critical: true },
      // Yes/No item - answered
      { id: "item-1-4", text: "All systems operational?", type: "yesno", completed: true, yesNoValue: "yes", completedBy: "Emma W.", completedAt: new Date(Date.now() - 900000), critical: true },
      // Number item - answered
      { id: "item-1-5", text: "Number of patients scheduled today", type: "number", completed: true, numberValue: "24", completedBy: "Sarah M.", completedAt: new Date(Date.now() - 600000) },
      { id: "item-1-6", text: "Check voicemail messages", type: "tick", completed: true, completedBy: "Mike T.", completedAt: new Date(Date.now() - 300000) },
      // Tick item - not completed
      { id: "item-1-7", text: "Review appointment schedule", type: "tick", completed: false },
      { id: "item-1-8", text: "Prepare patient files for morning appointments", type: "tick", completed: false },
      { id: "item-1-9", text: "Check waiting room is tidy", type: "tick", completed: false },
      // Yes/No item - not answered
      { id: "item-1-10", text: "Verify internet connection", type: "yesno", completed: false, yesNoValue: null },
      { id: "item-1-11", text: "Check printer paper and toner", type: "tick", completed: false },
      { id: "item-1-12", text: "Turn on background music", type: "tick", completed: false },
      // Yes/No item - not answered
      { id: "item-1-13", text: "Verify coffee machine is ready", type: "yesno", completed: false, yesNoValue: null },
      // Tick item - CRITICAL, not completed
      { id: "item-1-14", text: "Check hand sanitizer stations", type: "tick", completed: false, critical: true },
      // Number item - not answered
      { id: "item-1-15", text: "Temperature reading (°C)", type: "number", completed: false, numberValue: null },
    ],
  },
  {
    id: "checklist-2",
    title: "End of Day Closing",
    description: "Daily closing procedures for reception",
    categoryId: "reception",
    recurring: "daily",
    createdAt: new Date("2024-01-01"),
    createdBy: "Admin",
    items: [
      // All CRITICAL tick items
      { id: "item-2-1", text: "Lock all entry points", type: "tick", completed: false, critical: true },
      { id: "item-2-2", text: "Secure cash drawer", type: "tick", completed: false, critical: true },
      // Yes/No - CRITICAL
      { id: "item-2-3", text: "All equipment turned off?", type: "yesno", completed: false, yesNoValue: null, critical: true },
      // Yes/No - CRITICAL
      { id: "item-2-4", text: "Alarm system set?", type: "yesno", completed: false, yesNoValue: null, critical: true },
      // Number - closing count
      { id: "item-2-5", text: "Total patients seen today", type: "number", completed: false, numberValue: null },
      // Additional items
      { id: "item-2-6", text: "Empty reception waste bins", type: "tick", completed: false },
      { id: "item-2-7", text: "Turn off air conditioning", type: "tick", completed: false },
    ],
  },
  {
    id: "checklist-3",
    title: "Patient Room Preparation",
    description: "Standard room prep before each patient",
    categoryId: "nursing",
    recurring: "daily",
    createdAt: new Date("2024-01-05"),
    createdBy: "Head Nurse",
    items: [
      { id: "item-3-1", text: "Clean and sanitize surfaces", type: "tick", completed: true, completedBy: "Emma", completedAt: new Date() },
      { id: "item-3-2", text: "Replace paper coverings", type: "tick", completed: true, completedBy: "Emma", completedAt: new Date() },
      // Yes/No - equipment check
      { id: "item-3-3", text: "Equipment functional?", type: "yesno", completed: false, yesNoValue: null, critical: true },
      // Number - supplies restocked
      { id: "item-3-4", text: "Number of supply items restocked", type: "number", completed: false, numberValue: null },
      // Yes/No - emergency equipment CRITICAL
      { id: "item-3-5", text: "Emergency equipment verified?", type: "yesno", completed: false, yesNoValue: null, critical: true },
      // Additional tick items
      { id: "item-3-6", text: "Check sharps container level", type: "tick", completed: false, critical: true },
      { id: "item-3-7", text: "Verify hand wash station stocked", type: "tick", completed: false },
    ],
  },
  {
    id: "checklist-4",
    title: "Weekly Medication Audit",
    description: "Weekly check of medication storage and expiry",
    categoryId: "nursing",
    recurring: "weekly",
    createdAt: new Date("2024-01-10"),
    createdBy: "Head Nurse",
    items: [
      // Yes/No with CRITICAL
      { id: "item-4-1", text: "All medications within expiry?", type: "yesno", completed: false, yesNoValue: null, critical: true },
      // Number - expired count
      { id: "item-4-2", text: "Number of expired items found", type: "number", completed: false, numberValue: null },
      // Number - fridge temp CRITICAL
      { id: "item-4-3", text: "Fridge temperature (°C)", type: "number", completed: false, numberValue: null, critical: true },
      { id: "item-4-4", text: "Low stock items reported?", type: "yesno", completed: false, yesNoValue: null },
      // Tick items
      { id: "item-4-5", text: "Controlled drugs register checked", type: "tick", completed: false, critical: true },
      { id: "item-4-6", text: "Storage areas organized", type: "tick", completed: false },
    ],
  },
  {
    id: "checklist-5",
    title: "Pre-Consultation Setup",
    description: "Doctor's preparation before patient consultations",
    categoryId: "doctors",
    recurring: "daily",
    createdAt: new Date("2024-01-08"),
    createdBy: "Dr. Smith",
    items: [
      { id: "item-5-1", text: "Review patient files", type: "tick", completed: false },
      { id: "item-5-2", text: "Lab results available?", type: "yesno", completed: false, yesNoValue: null },
      { id: "item-5-3", text: "Number of referral forms prepared", type: "number", completed: false, numberValue: null },
      { id: "item-5-4", text: "Prescription pad available?", type: "yesno", completed: false, yesNoValue: null },
      { id: "item-5-5", text: "Equipment calibrated?", type: "yesno", completed: false, yesNoValue: null, critical: true },
    ],
  },
  {
    id: "checklist-6",
    title: "Monthly Financial Review",
    description: "Manager's monthly financial checklist",
    categoryId: "manager",
    recurring: "monthly",
    createdAt: new Date("2024-01-15"),
    createdBy: "Practice Manager",
    items: [
      { id: "item-6-1", text: "Review revenue reports", type: "tick", completed: false },
      { id: "item-6-2", text: "Number of invoices approved", type: "number", completed: false, numberValue: null },
      { id: "item-6-3", text: "Payroll accurate?", type: "yesno", completed: false, yesNoValue: null, critical: true },
      { id: "item-6-4", text: "Budget forecasts updated?", type: "yesno", completed: false, yesNoValue: null },
      { id: "item-6-5", text: "Board report prepared?", type: "yesno", completed: false, yesNoValue: null },
      { id: "item-6-6", text: "Outstanding amount ($)", type: "number", completed: false, numberValue: null },
    ],
  },
  {
    id: "checklist-7",
    title: "Daily Cleaning Checklist",
    description: "Standard daily cleaning tasks",
    categoryId: "cleaners",
    recurring: "daily",
    createdAt: new Date("2024-01-01"),
    createdBy: "Cleaning Supervisor",
    items: [
      { id: "item-7-1", text: "Vacuum all carpeted areas", type: "tick", completed: true, completedBy: "John", completedAt: new Date() },
      { id: "item-7-2", text: "Mop hard floors", type: "tick", completed: true, completedBy: "John", completedAt: new Date() },
      { id: "item-7-3", text: "Bathrooms disinfected?", type: "yesno", completed: false, yesNoValue: null, critical: true },
      { id: "item-7-4", text: "Number of bins emptied", type: "number", completed: false, numberValue: null },
      { id: "item-7-5", text: "Wipe down common surfaces", type: "tick", completed: false },
      { id: "item-7-6", text: "Bathroom supplies restocked?", type: "yesno", completed: false, yesNoValue: null },
      { id: "item-7-7", text: "Clean glass doors and windows", type: "tick", completed: false },
    ],
  },
  {
    id: "checklist-8",
    title: "Weekly IT Maintenance",
    description: "Regular IT system checks",
    categoryId: "it-team",
    recurring: "weekly",
    createdAt: new Date("2024-01-12"),
    createdBy: "IT Admin",
    items: [
      { id: "item-8-1", text: "Backup completed successfully?", type: "yesno", completed: false, yesNoValue: null, critical: true },
      { id: "item-8-2", text: "Server health OK?", type: "yesno", completed: false, yesNoValue: null, critical: true },
      { id: "item-8-3", text: "Antivirus definitions updated?", type: "yesno", completed: false, yesNoValue: null },
      { id: "item-8-4", text: "Number of security issues found", type: "number", completed: false, numberValue: null },
      { id: "item-8-5", text: "Network connectivity OK?", type: "yesno", completed: false, yesNoValue: null },
      { id: "item-8-6", text: "Disk space remaining (GB)", type: "number", completed: false, numberValue: null },
      { id: "item-8-7", text: "Apply pending updates", type: "tick", completed: false },
    ],
  },
];
