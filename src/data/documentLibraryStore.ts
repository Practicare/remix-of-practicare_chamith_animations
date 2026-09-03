import { DocumentFolder, DocumentFile } from "@/types/documentLibrary";

const seedFolders: DocumentFolder[] = [
  { id: "policies", name: "Policies", description: "Practice policies and procedures", icon: "ShieldCheck", createdAt: new Date().toISOString() },
  { id: "contracts", name: "Contracts", description: "Legal agreements and vendor contracts", icon: "FileSignature", createdAt: new Date().toISOString() },
  { id: "clinical", name: "Clinical Guidelines", description: "Clinical protocols and guidelines", icon: "Stethoscope", createdAt: new Date().toISOString() },
  { id: "training-docs", name: "Training Materials", description: "Onboarding and training documents", icon: "GraduationCap", createdAt: new Date().toISOString() },
];

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

const seedFiles: DocumentFile[] = [
  // Policies
  { id: "doc-p1", folderId: "policies", name: "Infection Control Policy.pdf", type: "application/pdf", size: 245_000, dataUrl: "", tags: ["policy", "infection", "clinical"], description: "Standard precautions and infection prevention protocols.", shareToKnowledge: true, knowledgeDocId: "kb-doc-p1", uploadedAt: daysAgo(4), uploadedBy: "Dr. Sarah Chen" },
  { id: "doc-p2", folderId: "policies", name: "Privacy & Confidentiality Policy.docx", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 88_500, dataUrl: "", tags: ["privacy", "hipaa"], description: "Patient data handling and confidentiality rules.", shareToKnowledge: true, knowledgeDocId: "kb-doc-p2", uploadedAt: daysAgo(12), uploadedBy: "Emma Rodriguez", taskId: "t-101", taskTitle: "Review privacy policy annually" },
  { id: "doc-p3", folderId: "policies", name: "Workplace Health & Safety.pdf", type: "application/pdf", size: 512_000, dataUrl: "", tags: ["safety", "whs"], description: "WHS obligations for all practice staff.", shareToKnowledge: false, uploadedAt: daysAgo(30), uploadedBy: "James Wilson" },
  { id: "doc-p4", folderId: "policies", name: "Complaints Handling Procedure.pdf", type: "application/pdf", size: 132_400, dataUrl: "", tags: ["policy", "quality"], shareToKnowledge: true, knowledgeDocId: "kb-doc-p4", uploadedAt: daysAgo(45), uploadedBy: "Dr. Sarah Chen" },

  // Contracts
  { id: "doc-c1", folderId: "contracts", name: "Cleaning Services Agreement 2026.pdf", type: "application/pdf", size: 420_000, dataUrl: "", tags: ["vendor", "cleaning"], description: "Annual cleaning contract with SparkleCare Pty Ltd.", shareToKnowledge: false, uploadedAt: daysAgo(7), uploadedBy: "Emma Rodriguez", taskId: "t-201", taskTitle: "Renew cleaning contract by Dec" },
  { id: "doc-c2", folderId: "contracts", name: "Medical Waste Disposal Contract.pdf", type: "application/pdf", size: 380_000, dataUrl: "", tags: ["vendor", "compliance"], shareToKnowledge: false, uploadedAt: daysAgo(60), uploadedBy: "James Wilson" },
  { id: "doc-c3", folderId: "contracts", name: "Software License - PracticeSuite.pdf", type: "application/pdf", size: 210_000, dataUrl: "", tags: ["software", "license"], description: "3-year enterprise software license.", shareToKnowledge: false, uploadedAt: daysAgo(90), uploadedBy: "Admin" },

  // Clinical Guidelines
  { id: "doc-cl1", folderId: "clinical", name: "CPR Protocol 2026.pdf", type: "application/pdf", size: 640_000, dataUrl: "", tags: ["clinical", "emergency", "cpr"], description: "Updated ANZCOR guidelines for cardiac arrest response.", shareToKnowledge: true, knowledgeDocId: "kb-doc-cl1", uploadedAt: daysAgo(2), uploadedBy: "Dr. Sarah Chen", taskId: "t-301", taskTitle: "All clinical staff to review CPR protocol" },
  { id: "doc-cl2", folderId: "clinical", name: "Anaphylaxis Management.pdf", type: "application/pdf", size: 285_000, dataUrl: "", tags: ["clinical", "emergency", "allergy"], shareToKnowledge: true, knowledgeDocId: "kb-doc-cl2", uploadedAt: daysAgo(15), uploadedBy: "Dr. Priya Patel" },
  { id: "doc-cl3", folderId: "clinical", name: "Vaccination Cold Chain Guide.docx", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 145_000, dataUrl: "", tags: ["vaccination", "cold-chain"], description: "Cold chain monitoring and breach response.", shareToKnowledge: true, knowledgeDocId: "kb-doc-cl3", uploadedAt: daysAgo(22), uploadedBy: "Nurse Amelia Grant" },
  { id: "doc-cl4", folderId: "clinical", name: "Wound Care Reference Chart.png", type: "image/png", size: 780_000, dataUrl: "", tags: ["clinical", "wound-care"], shareToKnowledge: false, uploadedAt: daysAgo(40), uploadedBy: "Nurse Amelia Grant" },
  { id: "doc-cl5", folderId: "clinical", name: "Diabetes Management Pathway.pdf", type: "application/pdf", size: 512_000, dataUrl: "", tags: ["clinical", "chronic-disease"], shareToKnowledge: true, knowledgeDocId: "kb-doc-cl5", uploadedAt: daysAgo(55), uploadedBy: "Dr. Priya Patel" },

  // Training Materials
  { id: "doc-t1", folderId: "training-docs", name: "New Staff Onboarding Handbook.pdf", type: "application/pdf", size: 1_240_000, dataUrl: "", tags: ["onboarding", "training"], description: "First-week orientation guide for new hires.", shareToKnowledge: true, knowledgeDocId: "kb-doc-t1", uploadedAt: daysAgo(3), uploadedBy: "Emma Rodriguez", taskId: "t-401", taskTitle: "Assign to all new starters" },
  { id: "doc-t2", folderId: "training-docs", name: "Reception Front Desk SOP.docx", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 96_000, dataUrl: "", tags: ["reception", "sop"], shareToKnowledge: true, knowledgeDocId: "kb-doc-t2", uploadedAt: daysAgo(18), uploadedBy: "Lisa Nguyen" },
  { id: "doc-t3", folderId: "training-docs", name: "Fire Safety Training Slides.pptx", type: "application/vnd.openxmlformats-officedocument.presentationml.presentation", size: 2_100_000, dataUrl: "", tags: ["safety", "fire", "training"], shareToKnowledge: false, uploadedAt: daysAgo(35), uploadedBy: "James Wilson" },
  { id: "doc-t4", folderId: "training-docs", name: "Manual Handling Quick Reference.pdf", type: "application/pdf", size: 320_000, dataUrl: "", tags: ["safety", "training"], shareToKnowledge: true, knowledgeDocId: "kb-doc-t4", uploadedAt: daysAgo(70), uploadedBy: "Emma Rodriguez" },
];

let folders: DocumentFolder[] = [...seedFolders];
let files: DocumentFile[] = [...seedFiles];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const documentLibraryStore = {
  getFolders: () => folders,
  getFiles: () => files,
  getFolderFiles: (folderId: string) => files.filter((f) => f.folderId === folderId),
  addFolder: (folder: DocumentFolder) => { folders = [folder, ...folders]; emit(); },
  updateFolder: (folder: DocumentFolder) => { folders = folders.map((f) => f.id === folder.id ? folder : f); emit(); },
  removeFolder: (id: string) => {
    folders = folders.filter((f) => f.id !== id);
    files = files.filter((f) => f.folderId !== id);
    emit();
  },
  addFile: (file: DocumentFile) => { files = [file, ...files]; emit(); },
  updateFile: (file: DocumentFile) => { files = files.map((f) => f.id === file.id ? file : f); emit(); },
  removeFile: (id: string) => { files = files.filter((f) => f.id !== id); emit(); },
  removeFiles: (ids: string[]) => { files = files.filter((f) => !ids.includes(f.id)); emit(); },
  removeFolderFiles: (folderId: string) => { files = files.filter((f) => f.folderId !== folderId); emit(); },
  subscribe: (fn: () => void) => { listeners.add(fn); return () => listeners.delete(fn); },
};
