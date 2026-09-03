export type AccreditationStage =
  | "setup" | "documents" | "assessment" | "readiness"
  | "gap" | "planning" | "evidence" | "mock-audit" | "ready";

export const STAGE_LABELS: Record<AccreditationStage, string> = {
  setup: "Setup",
  documents: "Documents",
  assessment: "Business Assessment",
  readiness: "Readiness",
  gap: "Gap Analysis",
  planning: "Planning",
  evidence: "Evidence",
  "mock-audit": "Mock Audit",
  ready: "Ready",
};

export const STAGE_ORDER: AccreditationStage[] = [
  "setup", "documents", "assessment", "readiness",
  "gap", "planning", "evidence", "mock-audit", "ready",
];

export interface AccreditationProject {
  id: string;
  name: string;
  standard: string;
  auditDate: string;
  ownerName: string;
  ownerInitials: string;
  stage: AccreditationStage;
  readiness: number;
  evidencePct: number;
  compliancePct: number;
  tasksRemaining: number;
  status: "draft" | "in-progress" | "review" | "ready";
}

export interface AccreditationDoc {
  id: string;
  name: string;
  pages: number;
  status: "Ready" | "Processing" | "Learning" | "Needs Review";
  confidence: number;
  category: string;
}

export type GapSeverity = "critical" | "high" | "medium" | "low";

export interface AccreditationGap {
  id: string;
  title: string;
  standard: string;
  missing: string;
  severity: GapSeverity;
  owner: string;
  ownerInitials: string;
  due: string;
}

export interface AccreditationEvidenceItem {
  id: string;
  title: string;
  type: "photo" | "document" | "screenshot" | "certificate";
  status: "verified" | "missing" | "pending";
  standard: string;
}

export interface AccreditationInsight {
  id: string;
  icon: "risk" | "policy" | "task" | "training" | "trend";
  label: string;
  detail: string;
  tone: "critical" | "warning" | "info" | "success";
}

export const mockProjects: AccreditationProject[] = [
  {
    id: "racgp-6",
    name: "RACGP 6th Edition Accreditation",
    standard: "RACGP 6th Edition",
    auditDate: "2026-11-18",
    ownerName: "Sarah Chen",
    ownerInitials: "SC",
    stage: "gap",
    readiness: 72,
    evidencePct: 64,
    compliancePct: 81,
    tasksRemaining: 24,
    status: "in-progress",
  },
  {
    id: "nsqhs",
    name: "NSQHS Standards",
    standard: "NSQHS 2nd Edition",
    auditDate: "2027-03-04",
    ownerName: "Mark Patel",
    ownerInitials: "MP",
    stage: "setup",
    readiness: 12,
    evidencePct: 5,
    compliancePct: 40,
    tasksRemaining: 62,
    status: "draft",
  },
];

export const mockDocs: AccreditationDoc[] = [
  { id: "d1", name: "RACGP Standards 6th Ed.pdf", pages: 246, status: "Ready", confidence: 96, category: "Standard" },
  { id: "d2", name: "Infection Control Policy.docx", pages: 18, status: "Ready", confidence: 91, category: "Policy" },
  { id: "d3", name: "Emergency Response Plan.pdf", pages: 22, status: "Needs Review", confidence: 74, category: "Policy" },
  { id: "d4", name: "Cold Chain Log 2026.xlsx", pages: 5, status: "Processing", confidence: 62, category: "Evidence" },
  { id: "d5", name: "Staff Training Register.pdf", pages: 12, status: "Ready", confidence: 88, category: "Register" },
  { id: "d6", name: "Complaints Handling.docx", pages: 9, status: "Learning", confidence: 55, category: "Policy" },
  { id: "d7", name: "Clinical Governance Framework.pdf", pages: 34, status: "Ready", confidence: 93, category: "Policy" },
  { id: "d8", name: "Fire Warden Roster.pdf", pages: 3, status: "Ready", confidence: 82, category: "Register" },
];

export const mockGaps: AccreditationGap[] = [
  { id: "g1", title: "Missing anaphylaxis training records", standard: "QI 3.2", missing: "Evidence of annual training for 4 staff", severity: "critical", owner: "Sarah Chen", ownerInitials: "SC", due: "2026-07-30" },
  { id: "g2", title: "Cold chain breach protocol undocumented", standard: "GP 4.1", missing: "Written procedure + incident log", severity: "critical", owner: "Mark Patel", ownerInitials: "MP", due: "2026-08-05" },
  { id: "g3", title: "Complaints register not reviewed quarterly", standard: "QI 1.3", missing: "Q1/Q2 review minutes", severity: "high", owner: "Lena Ford", ownerInitials: "LF", due: "2026-08-20" },
  { id: "g4", title: "Emergency drill overdue", standard: "GP 5.2", missing: "Fire evacuation drill 2026", severity: "high", owner: "Sarah Chen", ownerInitials: "SC", due: "2026-09-01" },
  { id: "g5", title: "Privacy policy version outdated", standard: "GP 2.1", missing: "Update to 2025 OAIC guidelines", severity: "medium", owner: "Ann Kim", ownerInitials: "AK", due: "2026-09-15" },
  { id: "g6", title: "Sharps disposal signage missing in room 4", standard: "GP 4.3", missing: "Compliant signage", severity: "low", owner: "Mark Patel", ownerInitials: "MP", due: "2026-10-01" },
];

export const mockEvidence: AccreditationEvidenceItem[] = [
  { id: "e1", title: "Fridge temperature log — June", type: "document", status: "verified", standard: "GP 4.1" },
  { id: "e2", title: "Waiting room signage photo", type: "photo", status: "verified", standard: "GP 2.4" },
  { id: "e3", title: "CPR certificate — Dr Nguyen", type: "certificate", status: "verified", standard: "QI 3.2" },
  { id: "e4", title: "Room 3 emergency trolley", type: "photo", status: "verified", standard: "GP 5.1" },
  { id: "e5", title: "Fire evacuation plan diagram", type: "screenshot", status: "pending", standard: "GP 5.2" },
  { id: "e6", title: "Consent form template v4", type: "document", status: "verified", standard: "GP 2.3" },
  { id: "e7", title: "Sharps container photo — room 4", type: "photo", status: "missing", standard: "GP 4.3" },
  { id: "e8", title: "Cleaning schedule sign-off", type: "document", status: "verified", standard: "GP 4.2" },
  { id: "e9", title: "First aid kit inventory", type: "document", status: "pending", standard: "GP 5.1" },
  { id: "e10", title: "Immunisation cold chain diagram", type: "screenshot", status: "verified", standard: "GP 4.1" },
];

export const mockInsights: AccreditationInsight[] = [
  { id: "i1", icon: "risk", label: "3 High Risks", detail: "Anaphylaxis training, cold chain, drill overdue", tone: "critical" },
  { id: "i2", icon: "policy", label: "7 Policies Need Updating", detail: "Last reviewed > 12 months ago", tone: "warning" },
  { id: "i3", icon: "task", label: "12 Tasks Overdue", detail: "Across Gap Analysis workstream", tone: "warning" },
  { id: "i4", icon: "training", label: "2 Staff Training Expiring", detail: "Within next 30 days", tone: "info" },
  { id: "i5", icon: "trend", label: "Readiness +6% vs last week", detail: "Driven by evidence uploads", tone: "success" },
];

export const readinessCategories = [
  { category: "Governance", score: 82 },
  { category: "Policies", score: 71 },
  { category: "Risk", score: 55 },
  { category: "HR", score: 78 },
  { category: "Training", score: 61 },
  { category: "Facilities", score: 88 },
  { category: "Clinical", score: 74 },
  { category: "Emergency", score: 48 },
];

export const assessmentQuestions = [
  { id: "q1", prompt: "Does your practice have a documented cold chain policy?", type: "cards", options: ["Yes, current", "Yes, outdated", "In draft", "No"] },
  { id: "q2", prompt: "When was the last fire evacuation drill?", type: "dropdown", options: ["<3 months", "3–6 months", "6–12 months", ">12 months", "Never"] },
  { id: "q3", prompt: "Upload a photo of your emergency trolley.", type: "photo" },
  { id: "q4", prompt: "How does your practice handle patient complaints?", type: "text" },
  { id: "q5", prompt: "Record a verbal summary of your infection control approach.", type: "voice" },
];

export const reportTemplates = [
  { id: "r1", name: "Executive Summary", desc: "One-page board-ready overview", pages: 1 },
  { id: "r2", name: "Gap Analysis Report", desc: "All identified gaps with severity + owner", pages: 8 },
  { id: "r3", name: "Readiness Report", desc: "Readiness by category with recommendations", pages: 5 },
  { id: "r4", name: "Management Assessment", desc: "Governance and leadership review", pages: 12 },
  { id: "r5", name: "Knowledge Assessment", desc: "Staff competency snapshot", pages: 6 },
  { id: "r6", name: "Audit Pack", desc: "Full evidence bundle for surveyor", pages: 84 },
  { id: "r7", name: "Evidence Register", desc: "Every evidence artefact indexed", pages: 22 },
];

export const libraryStandards = [
  { id: "racgp6", name: "RACGP 6th Edition", authority: "RACGP", modules: 45, version: "6.1 (2024)" },
  { id: "nsqhs2", name: "NSQHS Standards", authority: "ACSQHC", modules: 8, version: "2nd Ed" },
  { id: "iso15189", name: "ISO 15189 Medical Labs", authority: "ISO", modules: 12, version: "2022" },
  { id: "agpal", name: "AGPAL Framework", authority: "AGPAL", modules: 32, version: "2024" },
  { id: "qip", name: "QIP General Practice", authority: "QIP", modules: 28, version: "2025" },
];
