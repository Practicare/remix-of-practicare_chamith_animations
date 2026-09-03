import { ChecklistSubmission, SubmissionRevision } from "@/types/checklistSubmissions";
import { mockChecklists } from "./mockChecklists";

// Helper to generate past dates
const daysAgo = (days: number, hours = 0, minutes = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

// Staff members for realistic attribution
const staffMembers = [
  { id: "user-1", name: "Sarah Johnson" },
  { id: "user-2", name: "Emma Wilson" },
  { id: "user-3", name: "Mike Thompson" },
  { id: "user-4", name: "John Davis" },
  { id: "user-5", name: "Dr. Smith" },
  { id: "user-6", name: "Practice Manager" },
  { id: "user-7", name: "IT Admin" },
  { id: "user-8", name: "Lisa Chen" },
  { id: "user-9", name: "David Brown" },
  { id: "user-10", name: "Amy Rodriguez" },
];

// Generate mock submissions from existing checklists
export const mockChecklistSubmissions: ChecklistSubmission[] = [
  // ============ Morning Opening Procedures - Daily ============
  {
    id: "sub-1",
    checklistId: "checklist-1",
    checklistTitle: "Morning Opening Procedures",
    categoryId: "reception",
    submittedAt: daysAgo(0, 8, 15),
    submittedBy: "Sarah Johnson",
    submittedById: "user-1",
    completionPercentage: 100,
    totalItems: 15,
    completedItems: 15,
    criticalItemsCompleted: 3,
    criticalItemsTotal: 3,
    itemsSnapshot: mockChecklists[0].items.map(item => ({ ...item, completed: true, completedAt: daysAgo(0, 8), completedBy: "Sarah Johnson" })),
    notes: "All systems operational. Busy day ahead with 24 patients.",
  },
  {
    id: "sub-2",
    checklistId: "checklist-1",
    checklistTitle: "Morning Opening Procedures",
    categoryId: "reception",
    submittedAt: daysAgo(1, 7, 55),
    submittedBy: "Emma Wilson",
    submittedById: "user-2",
    completionPercentage: 100,
    totalItems: 15,
    completedItems: 15,
    criticalItemsCompleted: 3,
    criticalItemsTotal: 3,
    itemsSnapshot: mockChecklists[0].items.map(item => ({ ...item, completed: true, completedAt: daysAgo(1, 8), completedBy: "Emma Wilson" })),
  },
  {
    id: "sub-3",
    checklistId: "checklist-1",
    checklistTitle: "Morning Opening Procedures",
    categoryId: "reception",
    submittedAt: daysAgo(2, 8, 30),
    submittedBy: "Sarah Johnson",
    submittedById: "user-1",
    completionPercentage: 93,
    totalItems: 15,
    completedItems: 14,
    criticalItemsCompleted: 3,
    criticalItemsTotal: 3,
    itemsSnapshot: mockChecklists[0].items.map((item, idx) => ({ 
      ...item, 
      completed: idx !== 14, 
      completedAt: idx !== 14 ? daysAgo(2, 8) : undefined, 
      completedBy: idx !== 14 ? "Sarah Johnson" : undefined 
    })),
    notes: "Temperature sensor was not working - reported to maintenance.",
  },
  {
    id: "sub-4",
    checklistId: "checklist-1",
    checklistTitle: "Morning Opening Procedures",
    categoryId: "reception",
    submittedAt: daysAgo(3, 8, 10),
    submittedBy: "Mike Thompson",
    submittedById: "user-3",
    completionPercentage: 100,
    totalItems: 15,
    completedItems: 15,
    criticalItemsCompleted: 3,
    criticalItemsTotal: 3,
    itemsSnapshot: mockChecklists[0].items.map(item => ({ ...item, completed: true, completedAt: daysAgo(3, 8), completedBy: "Mike Thompson" })),
  },
  {
    id: "sub-5",
    checklistId: "checklist-1",
    checklistTitle: "Morning Opening Procedures",
    categoryId: "reception",
    submittedAt: daysAgo(4, 8, 5),
    submittedBy: "Emma Wilson",
    submittedById: "user-2",
    completionPercentage: 100,
    totalItems: 15,
    completedItems: 15,
    criticalItemsCompleted: 3,
    criticalItemsTotal: 3,
    itemsSnapshot: mockChecklists[0].items.map(item => ({ ...item, completed: true, completedAt: daysAgo(4, 8), completedBy: "Emma Wilson" })),
  },
  {
    id: "sub-5a",
    checklistId: "checklist-1",
    checklistTitle: "Morning Opening Procedures",
    categoryId: "reception",
    submittedAt: daysAgo(5, 8, 20),
    submittedBy: "Lisa Chen",
    submittedById: "user-8",
    completionPercentage: 87,
    totalItems: 15,
    completedItems: 13,
    criticalItemsCompleted: 3,
    criticalItemsTotal: 3,
    itemsSnapshot: mockChecklists[0].items.map((item, idx) => ({ 
      ...item, 
      completed: idx < 13, 
      completedAt: idx < 13 ? daysAgo(5, 8) : undefined, 
      completedBy: idx < 13 ? "Lisa Chen" : undefined 
    })),
    notes: "Short staffed today - completed critical items first.",
  },
  {
    id: "sub-5b",
    checklistId: "checklist-1",
    checklistTitle: "Morning Opening Procedures",
    categoryId: "reception",
    submittedAt: daysAgo(6, 8, 0),
    submittedBy: "Sarah Johnson",
    submittedById: "user-1",
    completionPercentage: 100,
    totalItems: 15,
    completedItems: 15,
    criticalItemsCompleted: 3,
    criticalItemsTotal: 3,
    itemsSnapshot: mockChecklists[0].items.map(item => ({ ...item, completed: true, completedAt: daysAgo(6, 8), completedBy: "Sarah Johnson" })),
  },
  
  // ============ End of Day Closing - Daily ============
  {
    id: "sub-6",
    checklistId: "checklist-2",
    checklistTitle: "End of Day Closing",
    categoryId: "reception",
    submittedAt: daysAgo(0, 18, 30),
    submittedBy: "John Davis",
    submittedById: "user-4",
    completionPercentage: 100,
    totalItems: 4,
    completedItems: 4,
    criticalItemsCompleted: 2,
    criticalItemsTotal: 2,
    itemsSnapshot: mockChecklists[1].items.map(item => ({ ...item, completed: true, completedAt: daysAgo(0, 18), completedBy: "John Davis" })),
  },
  {
    id: "sub-7",
    checklistId: "checklist-2",
    checklistTitle: "End of Day Closing",
    categoryId: "reception",
    submittedAt: daysAgo(1, 18, 45),
    submittedBy: "Sarah Johnson",
    submittedById: "user-1",
    completionPercentage: 100,
    totalItems: 4,
    completedItems: 4,
    criticalItemsCompleted: 2,
    criticalItemsTotal: 2,
    itemsSnapshot: mockChecklists[1].items.map(item => ({ ...item, completed: true, completedAt: daysAgo(1, 18), completedBy: "Sarah Johnson" })),
  },
  {
    id: "sub-7a",
    checklistId: "checklist-2",
    checklistTitle: "End of Day Closing",
    categoryId: "reception",
    submittedAt: daysAgo(2, 19, 0),
    submittedBy: "Emma Wilson",
    submittedById: "user-2",
    completionPercentage: 75,
    totalItems: 4,
    completedItems: 3,
    criticalItemsCompleted: 2,
    criticalItemsTotal: 2,
    itemsSnapshot: mockChecklists[1].items.map((item, idx) => ({ 
      ...item, 
      completed: idx !== 2, 
      completedAt: idx !== 2 ? daysAgo(2, 19) : undefined, 
      completedBy: idx !== 2 ? "Emma Wilson" : undefined 
    })),
    notes: "Alarm system had technical issue - IT notified.",
  },
  {
    id: "sub-7b",
    checklistId: "checklist-2",
    checklistTitle: "End of Day Closing",
    categoryId: "reception",
    submittedAt: daysAgo(3, 18, 15),
    submittedBy: "David Brown",
    submittedById: "user-9",
    completionPercentage: 100,
    totalItems: 4,
    completedItems: 4,
    criticalItemsCompleted: 2,
    criticalItemsTotal: 2,
    itemsSnapshot: mockChecklists[1].items.map(item => ({ ...item, completed: true, completedAt: daysAgo(3, 18), completedBy: "David Brown" })),
  },
  {
    id: "sub-7c",
    checklistId: "checklist-2",
    checklistTitle: "End of Day Closing",
    categoryId: "reception",
    submittedAt: daysAgo(4, 18, 20),
    submittedBy: "Amy Rodriguez",
    submittedById: "user-10",
    completionPercentage: 100,
    totalItems: 4,
    completedItems: 4,
    criticalItemsCompleted: 2,
    criticalItemsTotal: 2,
    itemsSnapshot: mockChecklists[1].items.map(item => ({ ...item, completed: true, completedAt: daysAgo(4, 18), completedBy: "Amy Rodriguez" })),
  },

  // ============ Patient Room Preparation - Daily, multiple per day ============
  {
    id: "sub-8",
    checklistId: "checklist-3",
    checklistTitle: "Patient Room Preparation",
    categoryId: "nursing",
    submittedAt: daysAgo(0, 9, 15),
    submittedBy: "Emma Wilson",
    submittedById: "user-2",
    completionPercentage: 100,
    totalItems: 5,
    completedItems: 5,
    criticalItemsCompleted: 0,
    criticalItemsTotal: 0,
    itemsSnapshot: mockChecklists[2].items.map(item => ({ ...item, completed: true, completedAt: daysAgo(0, 9), completedBy: "Emma Wilson" })),
    notes: "Room 1 prepared for morning patients.",
  },
  {
    id: "sub-9",
    checklistId: "checklist-3",
    checklistTitle: "Patient Room Preparation",
    categoryId: "nursing",
    submittedAt: daysAgo(0, 13, 30),
    submittedBy: "Emma Wilson",
    submittedById: "user-2",
    completionPercentage: 100,
    totalItems: 5,
    completedItems: 5,
    criticalItemsCompleted: 0,
    criticalItemsTotal: 0,
    itemsSnapshot: mockChecklists[2].items.map(item => ({ ...item, completed: true, completedAt: daysAgo(0, 13), completedBy: "Emma Wilson" })),
    notes: "Room 2 prepared after lunch.",
  },
  {
    id: "sub-9a",
    checklistId: "checklist-3",
    checklistTitle: "Patient Room Preparation",
    categoryId: "nursing",
    submittedAt: daysAgo(0, 16, 0),
    submittedBy: "Lisa Chen",
    submittedById: "user-8",
    completionPercentage: 100,
    totalItems: 5,
    completedItems: 5,
    criticalItemsCompleted: 0,
    criticalItemsTotal: 0,
    itemsSnapshot: mockChecklists[2].items.map(item => ({ ...item, completed: true, completedAt: daysAgo(0, 16), completedBy: "Lisa Chen" })),
    notes: "Room 3 - afternoon session.",
  },
  {
    id: "sub-10",
    checklistId: "checklist-3",
    checklistTitle: "Patient Room Preparation",
    categoryId: "nursing",
    submittedAt: daysAgo(1, 10, 0),
    submittedBy: "Mike Thompson",
    submittedById: "user-3",
    completionPercentage: 80,
    totalItems: 5,
    completedItems: 4,
    criticalItemsCompleted: 0,
    criticalItemsTotal: 0,
    itemsSnapshot: mockChecklists[2].items.map((item, idx) => ({ 
      ...item, 
      completed: idx !== 3, 
      completedAt: idx !== 3 ? daysAgo(1, 10) : undefined, 
      completedBy: idx !== 3 ? "Mike Thompson" : undefined 
    })),
    notes: "Supplies running low - restocking delayed.",
  },
  {
    id: "sub-10a",
    checklistId: "checklist-3",
    checklistTitle: "Patient Room Preparation",
    categoryId: "nursing",
    submittedAt: daysAgo(1, 14, 30),
    submittedBy: "Emma Wilson",
    submittedById: "user-2",
    completionPercentage: 100,
    totalItems: 5,
    completedItems: 5,
    criticalItemsCompleted: 0,
    criticalItemsTotal: 0,
    itemsSnapshot: mockChecklists[2].items.map(item => ({ ...item, completed: true, completedAt: daysAgo(1, 14), completedBy: "Emma Wilson" })),
  },
  {
    id: "sub-10b",
    checklistId: "checklist-3",
    checklistTitle: "Patient Room Preparation",
    categoryId: "nursing",
    submittedAt: daysAgo(2, 9, 45),
    submittedBy: "Amy Rodriguez",
    submittedById: "user-10",
    completionPercentage: 100,
    totalItems: 5,
    completedItems: 5,
    criticalItemsCompleted: 0,
    criticalItemsTotal: 0,
    itemsSnapshot: mockChecklists[2].items.map(item => ({ ...item, completed: true, completedAt: daysAgo(2, 9), completedBy: "Amy Rodriguez" })),
  },
  {
    id: "sub-10c",
    checklistId: "checklist-3",
    checklistTitle: "Patient Room Preparation",
    categoryId: "nursing",
    submittedAt: daysAgo(3, 10, 15),
    submittedBy: "Lisa Chen",
    submittedById: "user-8",
    completionPercentage: 60,
    totalItems: 5,
    completedItems: 3,
    criticalItemsCompleted: 0,
    criticalItemsTotal: 0,
    itemsSnapshot: mockChecklists[2].items.map((item, idx) => ({ 
      ...item, 
      completed: idx < 3, 
      completedAt: idx < 3 ? daysAgo(3, 10) : undefined, 
      completedBy: idx < 3 ? "Lisa Chen" : undefined 
    })),
    notes: "Emergency situation - had to leave mid-checklist.",
  },

  // ============ Weekly Medication Audit - Weekly ============
  {
    id: "sub-11",
    checklistId: "checklist-4",
    checklistTitle: "Weekly Medication Audit",
    categoryId: "nursing",
    submittedAt: daysAgo(0, 11, 30),
    submittedBy: "Dr. Smith",
    submittedById: "user-5",
    completionPercentage: 100,
    totalItems: 4,
    completedItems: 4,
    criticalItemsCompleted: 0,
    criticalItemsTotal: 0,
    itemsSnapshot: mockChecklists[3].items.map(item => ({ ...item, completed: true, completedAt: daysAgo(0, 11), completedBy: "Dr. Smith" })),
    notes: "No expired medications found. Fridge at 4°C.",
  },
  {
    id: "sub-12",
    checklistId: "checklist-4",
    checklistTitle: "Weekly Medication Audit",
    categoryId: "nursing",
    submittedAt: daysAgo(7, 11, 0),
    submittedBy: "Emma Wilson",
    submittedById: "user-2",
    completionPercentage: 100,
    totalItems: 4,
    completedItems: 4,
    criticalItemsCompleted: 0,
    criticalItemsTotal: 0,
    itemsSnapshot: mockChecklists[3].items.map(item => ({ ...item, completed: true, completedAt: daysAgo(7, 11), completedBy: "Emma Wilson" })),
    notes: "2 items expired and disposed. Reported to manager.",
  },
  {
    id: "sub-13",
    checklistId: "checklist-4",
    checklistTitle: "Weekly Medication Audit",
    categoryId: "nursing",
    submittedAt: daysAgo(14, 11, 45),
    submittedBy: "Dr. Smith",
    submittedById: "user-5",
    completionPercentage: 100,
    totalItems: 4,
    completedItems: 4,
    criticalItemsCompleted: 0,
    criticalItemsTotal: 0,
    itemsSnapshot: mockChecklists[3].items.map(item => ({ ...item, completed: true, completedAt: daysAgo(14, 11), completedBy: "Dr. Smith" })),
  },
  {
    id: "sub-13a",
    checklistId: "checklist-4",
    checklistTitle: "Weekly Medication Audit",
    categoryId: "nursing",
    submittedAt: daysAgo(21, 10, 30),
    submittedBy: "Mike Thompson",
    submittedById: "user-3",
    completionPercentage: 75,
    totalItems: 4,
    completedItems: 3,
    criticalItemsCompleted: 0,
    criticalItemsTotal: 0,
    itemsSnapshot: mockChecklists[3].items.map((item, idx) => ({ 
      ...item, 
      completed: idx !== 2, 
      completedAt: idx !== 2 ? daysAgo(21, 10) : undefined, 
      completedBy: idx !== 2 ? "Mike Thompson" : undefined 
    })),
    notes: "Fridge temperature log unavailable - escalated.",
  },

  // ============ Daily Cleaning Checklist - Daily ============
  {
    id: "sub-14",
    checklistId: "checklist-7",
    checklistTitle: "Daily Cleaning Checklist",
    categoryId: "cleaners",
    submittedAt: daysAgo(0, 19, 15),
    submittedBy: "John Davis",
    submittedById: "user-4",
    completionPercentage: 100,
    totalItems: 6,
    completedItems: 6,
    criticalItemsCompleted: 0,
    criticalItemsTotal: 0,
    itemsSnapshot: mockChecklists[6].items.map(item => ({ ...item, completed: true, completedAt: daysAgo(0, 19), completedBy: "John Davis" })),
  },
  {
    id: "sub-15",
    checklistId: "checklist-7",
    checklistTitle: "Daily Cleaning Checklist",
    categoryId: "cleaners",
    submittedAt: daysAgo(1, 19, 30),
    submittedBy: "John Davis",
    submittedById: "user-4",
    completionPercentage: 100,
    totalItems: 6,
    completedItems: 6,
    criticalItemsCompleted: 0,
    criticalItemsTotal: 0,
    itemsSnapshot: mockChecklists[6].items.map(item => ({ ...item, completed: true, completedAt: daysAgo(1, 19), completedBy: "John Davis" })),
  },
  {
    id: "sub-15a",
    checklistId: "checklist-7",
    checklistTitle: "Daily Cleaning Checklist",
    categoryId: "cleaners",
    submittedAt: daysAgo(2, 19, 0),
    submittedBy: "David Brown",
    submittedById: "user-9",
    completionPercentage: 83,
    totalItems: 6,
    completedItems: 5,
    criticalItemsCompleted: 0,
    criticalItemsTotal: 0,
    itemsSnapshot: mockChecklists[6].items.map((item, idx) => ({ 
      ...item, 
      completed: idx !== 4, 
      completedAt: idx !== 4 ? daysAgo(2, 19) : undefined, 
      completedBy: idx !== 4 ? "David Brown" : undefined 
    })),
    notes: "Deep cleaning deferred to weekend.",
  },
  {
    id: "sub-15b",
    checklistId: "checklist-7",
    checklistTitle: "Daily Cleaning Checklist",
    categoryId: "cleaners",
    submittedAt: daysAgo(3, 18, 45),
    submittedBy: "John Davis",
    submittedById: "user-4",
    completionPercentage: 100,
    totalItems: 6,
    completedItems: 6,
    criticalItemsCompleted: 0,
    criticalItemsTotal: 0,
    itemsSnapshot: mockChecklists[6].items.map(item => ({ ...item, completed: true, completedAt: daysAgo(3, 18), completedBy: "John Davis" })),
  },
  {
    id: "sub-15c",
    checklistId: "checklist-7",
    checklistTitle: "Daily Cleaning Checklist",
    categoryId: "cleaners",
    submittedAt: daysAgo(4, 19, 10),
    submittedBy: "David Brown",
    submittedById: "user-9",
    completionPercentage: 100,
    totalItems: 6,
    completedItems: 6,
    criticalItemsCompleted: 0,
    criticalItemsTotal: 0,
    itemsSnapshot: mockChecklists[6].items.map(item => ({ ...item, completed: true, completedAt: daysAgo(4, 19), completedBy: "David Brown" })),
  },
  {
    id: "sub-15d",
    checklistId: "checklist-7",
    checklistTitle: "Daily Cleaning Checklist",
    categoryId: "cleaners",
    submittedAt: daysAgo(5, 19, 20),
    submittedBy: "John Davis",
    submittedById: "user-4",
    completionPercentage: 100,
    totalItems: 6,
    completedItems: 6,
    criticalItemsCompleted: 0,
    criticalItemsTotal: 0,
    itemsSnapshot: mockChecklists[6].items.map(item => ({ ...item, completed: true, completedAt: daysAgo(5, 19), completedBy: "John Davis" })),
  },

  // ============ Monthly Financial Review ============
  {
    id: "sub-16",
    checklistId: "checklist-6",
    checklistTitle: "Monthly Financial Review",
    categoryId: "manager",
    submittedAt: daysAgo(2, 15, 30),
    submittedBy: "Practice Manager",
    submittedById: "user-6",
    completionPercentage: 100,
    totalItems: 5,
    completedItems: 5,
    criticalItemsCompleted: 0,
    criticalItemsTotal: 0,
    itemsSnapshot: mockChecklists[5].items.map(item => ({ ...item, completed: true, completedAt: daysAgo(2, 15), completedBy: "Practice Manager" })),
    notes: "Q4 review completed. Budget on track.",
  },
  {
    id: "sub-17",
    checklistId: "checklist-6",
    checklistTitle: "Monthly Financial Review",
    categoryId: "manager",
    submittedAt: daysAgo(32, 15, 0),
    submittedBy: "Practice Manager",
    submittedById: "user-6",
    completionPercentage: 100,
    totalItems: 5,
    completedItems: 5,
    criticalItemsCompleted: 0,
    criticalItemsTotal: 0,
    itemsSnapshot: mockChecklists[5].items.map(item => ({ ...item, completed: true, completedAt: daysAgo(32, 15), completedBy: "Practice Manager" })),
    notes: "End of month reconciliation done.",
  },
  {
    id: "sub-17a",
    checklistId: "checklist-6",
    checklistTitle: "Monthly Financial Review",
    categoryId: "manager",
    submittedAt: daysAgo(62, 16, 0),
    submittedBy: "Practice Manager",
    submittedById: "user-6",
    completionPercentage: 80,
    totalItems: 5,
    completedItems: 4,
    criticalItemsCompleted: 0,
    criticalItemsTotal: 0,
    itemsSnapshot: mockChecklists[5].items.map((item, idx) => ({ 
      ...item, 
      completed: idx !== 3, 
      completedAt: idx !== 3 ? daysAgo(62, 16) : undefined, 
      completedBy: idx !== 3 ? "Practice Manager" : undefined 
    })),
    notes: "Waiting on vendor invoice - will follow up.",
  },

  // ============ Weekly IT Maintenance ============
  {
    id: "sub-18",
    checklistId: "checklist-8",
    checklistTitle: "Weekly IT Maintenance",
    categoryId: "it-team",
    submittedAt: daysAgo(1, 16, 0),
    submittedBy: "IT Admin",
    submittedById: "user-7",
    completionPercentage: 100,
    totalItems: 5,
    completedItems: 5,
    criticalItemsCompleted: 0,
    criticalItemsTotal: 0,
    itemsSnapshot: mockChecklists[7].items.map(item => ({ ...item, completed: true, completedAt: daysAgo(1, 16), completedBy: "IT Admin" })),
    notes: "All backups verified. No security issues.",
  },
  {
    id: "sub-19",
    checklistId: "checklist-8",
    checklistTitle: "Weekly IT Maintenance",
    categoryId: "it-team",
    submittedAt: daysAgo(8, 16, 30),
    submittedBy: "IT Admin",
    submittedById: "user-7",
    completionPercentage: 80,
    totalItems: 5,
    completedItems: 4,
    criticalItemsCompleted: 0,
    criticalItemsTotal: 0,
    itemsSnapshot: mockChecklists[7].items.map((item, idx) => ({ 
      ...item, 
      completed: idx !== 3, 
      completedAt: idx !== 3 ? daysAgo(8, 16) : undefined, 
      completedBy: idx !== 3 ? "IT Admin" : undefined 
    })),
    notes: "1 minor security issue found and escalated.",
  },
  {
    id: "sub-19a",
    checklistId: "checklist-8",
    checklistTitle: "Weekly IT Maintenance",
    categoryId: "it-team",
    submittedAt: daysAgo(15, 15, 45),
    submittedBy: "IT Admin",
    submittedById: "user-7",
    completionPercentage: 100,
    totalItems: 5,
    completedItems: 5,
    criticalItemsCompleted: 0,
    criticalItemsTotal: 0,
    itemsSnapshot: mockChecklists[7].items.map(item => ({ ...item, completed: true, completedAt: daysAgo(15, 15), completedBy: "IT Admin" })),
    notes: "Scheduled maintenance completed successfully.",
  },
  {
    id: "sub-19b",
    checklistId: "checklist-8",
    checklistTitle: "Weekly IT Maintenance",
    categoryId: "it-team",
    submittedAt: daysAgo(22, 16, 15),
    submittedBy: "David Brown",
    submittedById: "user-9",
    completionPercentage: 100,
    totalItems: 5,
    completedItems: 5,
    criticalItemsCompleted: 0,
    criticalItemsTotal: 0,
    itemsSnapshot: mockChecklists[7].items.map(item => ({ ...item, completed: true, completedAt: daysAgo(22, 16), completedBy: "David Brown" })),
    notes: "Covered for IT Admin - all checks passed.",
  },

  // ============ Equipment Safety Check (if exists) ============
  {
    id: "sub-20",
    checklistId: "checklist-5",
    checklistTitle: "Equipment Safety Check",
    categoryId: "nursing",
    submittedAt: daysAgo(0, 14, 0),
    submittedBy: "Dr. Smith",
    submittedById: "user-5",
    completionPercentage: 100,
    totalItems: 4,
    completedItems: 4,
    criticalItemsCompleted: 2,
    criticalItemsTotal: 2,
    itemsSnapshot: mockChecklists[4]?.items?.map(item => ({ ...item, completed: true, completedAt: daysAgo(0, 14), completedBy: "Dr. Smith" })) || [],
    notes: "All equipment calibrated and functional.",
  },
  {
    id: "sub-21",
    checklistId: "checklist-5",
    checklistTitle: "Equipment Safety Check",
    categoryId: "nursing",
    submittedAt: daysAgo(7, 14, 30),
    submittedBy: "Emma Wilson",
    submittedById: "user-2",
    completionPercentage: 75,
    totalItems: 4,
    completedItems: 3,
    criticalItemsCompleted: 1,
    criticalItemsTotal: 2,
    itemsSnapshot: mockChecklists[4]?.items?.map((item, idx) => ({ 
      ...item, 
      completed: idx !== 1, 
      completedAt: idx !== 1 ? daysAgo(7, 14) : undefined, 
      completedBy: idx !== 1 ? "Emma Wilson" : undefined 
    })) || [],
    notes: "Defibrillator needs battery replacement - ordered.",
  },
  {
    id: "sub-22",
    checklistId: "checklist-5",
    checklistTitle: "Equipment Safety Check",
    categoryId: "nursing",
    submittedAt: daysAgo(14, 13, 45),
    submittedBy: "Mike Thompson",
    submittedById: "user-3",
    completionPercentage: 100,
    totalItems: 4,
    completedItems: 4,
    criticalItemsCompleted: 2,
    criticalItemsTotal: 2,
    itemsSnapshot: mockChecklists[4]?.items?.map(item => ({ ...item, completed: true, completedAt: daysAgo(14, 13), completedBy: "Mike Thompson" })) || [],
  },
];

// Helper to get submissions for a specific checklist
export const getSubmissionsByChecklistId = (checklistId: string): ChecklistSubmission[] => {
  return mockChecklistSubmissions
    .filter(s => s.checklistId === checklistId)
    .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
};

// Helper to get all unique checklists that have submissions
export const getChecklistsWithSubmissions = () => {
  const unique = new Map<string, { id: string; title: string; categoryId: string; count: number }>();
  mockChecklistSubmissions.forEach(s => {
    const existing = unique.get(s.checklistId);
    if (existing) {
      existing.count++;
    } else {
      unique.set(s.checklistId, {
        id: s.checklistId,
        title: s.checklistTitle,
        categoryId: s.categoryId,
        count: 1,
      });
    }
  });
  return Array.from(unique.values());
};

// Helper to get submission stats
export const getSubmissionStats = () => {
  const total = mockChecklistSubmissions.length;
  const complete = mockChecklistSubmissions.filter(s => s.completionPercentage === 100).length;
  const avgCompletion = mockChecklistSubmissions.reduce((acc, s) => acc + s.completionPercentage, 0) / total;
  const uniqueUsers = new Set(mockChecklistSubmissions.map(s => s.submittedById)).size;
  
  return { total, complete, avgCompletion: Math.round(avgCompletion), uniqueUsers };
};

// ============ Revision history (edits) ============
// Some submissions get edited after being submitted. We synthesise a realistic
// version trail: each earlier version has fewer completed items than the next.
const REVISION_EDITORS = [
  { id: "user-6", name: "Practice Manager" },
  { id: "user-5", name: "Dr. Smith" },
];

const buildRevisions = (submission: ChecklistSubmission, count: number): SubmissionRevision[] => {
  const revisions: SubmissionRevision[] = [];
  const total = submission.itemsSnapshot.length;
  if (total === 0) return revisions;

  for (let v = 1; v <= count; v++) {
    const isLatest = v === count;
    // Older versions have progressively fewer completed items
    const rollback = isLatest ? 0 : (count - v) * 2;
    const items = submission.itemsSnapshot.map((item, idx) => {
      if (!isLatest && idx >= total - rollback) {
        return { ...item, completed: false, yesNoValue: undefined, numberValue: undefined, completedBy: undefined, completedAt: undefined };
      }
      return { ...item };
    });
    const completedItems = items.filter(i => i.completed).length;
    const editor = v === 1
      ? { id: submission.submittedById, name: submission.submittedBy }
      : REVISION_EDITORS[(v - 2) % REVISION_EDITORS.length];
    const editedAt = new Date(submission.submittedAt.getTime() + (v - 1) * 45 * 60 * 1000);

    revisions.push({
      id: `${submission.id}-v${v}`,
      version: v,
      editedAt,
      editedBy: editor.name,
      editedById: editor.id,
      changeSummary:
        v === 1
          ? "Original submission"
          : isLatest
            ? `Completed ${rollback === 0 ? "remaining" : rollback} outstanding item${total > 1 ? "s" : ""} and finalised the record`
            : `Updated ${2} item response${2 > 1 ? "s" : ""}`,
      completionPercentage: Math.round((completedItems / total) * 100),
      completedItems,
      totalItems: total,
      itemsSnapshot: items,
      notes: v === 1 ? undefined : submission.notes,
    });
  }

  return revisions;
};

// Attach revisions to a deterministic subset of submissions
mockChecklistSubmissions.forEach((submission, index) => {
  if (index % 3 !== 0) return;
  const versionCount = (index % 2 === 0) ? 3 : 2;
  submission.revisions = buildRevisions(submission, versionCount);
});
