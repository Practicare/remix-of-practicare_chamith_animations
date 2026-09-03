import { format } from "date-fns";
import { downloadCSV, openPrintPDF, wrapPDFPage, exportTimestamp, exportSubtitleDate } from "./exportUtils";
import { StaffMember } from "@/types/staff";
import { Memo, MEMO_TYPE_LABELS } from "@/types/memos";
import { ComplianceItem } from "@/types/compliance";
import { Checklist } from "@/types/checklists";
import { Room, Instrument } from "@/types/rooms";
import { CommunicationNote } from "@/types/communicationBook";

// ===== STAFF =====
export function exportStaffCSV(staff: StaffMember[], departmentName?: string) {
  const headers = ["Name", "Email", "Phone", "Department", "Role", "Status", "Birthday"];
  const rows = staff.map(s => [
    `${s.firstName} ${s.lastName}`,
    s.email,
    s.phone || "-",
    departmentName || s.departmentId,
    s.role,
    s.invitationStatus,
    s.birthday ? format(s.birthday, "MMM d, yyyy") : "-",
  ]);
  downloadCSV(headers, rows, `staff-${exportTimestamp()}`);
}

export function exportStaffPDF(staff: StaffMember[], title = "Staff Members", departmentName?: string) {
  const tableRows = staff.map(s => `
    <tr>
      <td>${s.firstName} ${s.lastName}</td>
      <td>${s.email}</td>
      <td>${s.phone || "-"}</td>
      <td>${s.role}</td>
      <td>${s.invitationStatus}</td>
    </tr>
  `).join("");

  const html = wrapPDFPage({
    title,
    subtitle: `${departmentName ? departmentName + " · " : ""}${staff.length} members · ${exportSubtitleDate()}`,
    bodyHtml: `
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    `,
  });
  openPrintPDF(html);
}

// ===== MEMOS =====
export function exportMemosCSV(memos: Memo[]) {
  const headers = ["Title", "Type", "Priority", "Author", "Mandatory", "Created", "Read Count"];
  const rows = memos.map(m => [
    m.title,
    MEMO_TYPE_LABELS[m.type],
    m.priority,
    m.author,
    m.mandatoryRead ? "Yes" : "No",
    format(m.createdAt, "MMM d, yyyy"),
    String(m.readBy.length),
  ]);
  downloadCSV(headers, rows, `memos-${exportTimestamp()}`);
}

export function exportMemosPDF(memos: Memo[]) {
  const tableRows = memos.map(m => `
    <tr>
      <td>${m.title}</td>
      <td>${MEMO_TYPE_LABELS[m.type]}</td>
      <td>${m.priority}</td>
      <td>${m.author}</td>
      <td>${m.mandatoryRead ? "Yes" : "No"}</td>
      <td>${format(m.createdAt, "MMM d, yyyy")}</td>
      <td>${m.readBy.length}</td>
    </tr>
  `).join("");

  const html = wrapPDFPage({
    title: "Memos & Practice News",
    subtitle: `${memos.length} memos · ${exportSubtitleDate()}`,
    bodyHtml: `
      <table>
        <thead><tr><th>Title</th><th>Type</th><th>Priority</th><th>Author</th><th>Mandatory</th><th>Created</th><th>Read</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    `,
  });
  openPrintPDF(html);
}

// ===== COMPLIANCE =====
export function exportComplianceCSV(items: ComplianceItem[], categoryName?: string) {
  const headers = ["Title", "Assignee", "Status", "Expiry Date", "Details"];
  const rows = items.map(i => [
    i.title,
    i.assignee || "-",
    i.status,
    format(i.expiryDate, "MMM d, yyyy"),
    i.details,
  ]);
  downloadCSV(headers, rows, `compliance-${categoryName ? categoryName.toLowerCase().replace(/\s+/g, "-") + "-" : ""}${exportTimestamp()}`);
}

export function exportCompliancePDF(items: ComplianceItem[], categoryName = "Compliance") {
  const tableRows = items.map(i => `
    <tr>
      <td>${i.title}</td>
      <td>${i.assignee || "-"}</td>
      <td>${i.status}</td>
      <td>${format(i.expiryDate, "MMM d, yyyy")}</td>
    </tr>
  `).join("");

  const html = wrapPDFPage({
    title: categoryName,
    subtitle: `${items.length} items · ${exportSubtitleDate()}`,
    bodyHtml: `
      <table>
        <thead><tr><th>Title</th><th>Assignee</th><th>Status</th><th>Expiry Date</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    `,
  });
  openPrintPDF(html);
}

// ===== CHECKLISTS =====
export function exportChecklistsCSV(checklists: Checklist[]) {
  const headers = ["Title", "Category", "Items", "Completed", "Progress", "Recurring"];
  const rows = checklists.map(c => {
    const completed = c.items.filter(i => i.completed).length;
    const total = c.items.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return [
      c.title,
      c.categoryId,
      String(total),
      String(completed),
      `${pct}%`,
      c.recurring || "None",
    ];
  });
  downloadCSV(headers, rows, `checklists-${exportTimestamp()}`);
}

export function exportChecklistsPDF(checklists: Checklist[]) {
  const tableRows = checklists.map(c => {
    const completed = c.items.filter(i => i.completed).length;
    const total = c.items.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return `
      <tr>
        <td>${c.title}</td>
        <td>${c.categoryId}</td>
        <td>${completed}/${total}</td>
        <td>${pct}%</td>
        <td>${c.recurring || "None"}</td>
      </tr>
    `;
  }).join("");

  const html = wrapPDFPage({
    title: "Checklists",
    subtitle: `${checklists.length} checklists · ${exportSubtitleDate()}`,
    bodyHtml: `
      <table>
        <thead><tr><th>Title</th><th>Category</th><th>Progress</th><th>%</th><th>Recurring</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    `,
  });
  openPrintPDF(html);
}

// ===== ROOMS =====
export function exportRoomsCSV(rooms: Room[]) {
  const headers = ["Room Name", "Room #", "Description", "Items Count"];
  const rows = rooms.map(r => [
    r.roomName,
    r.roomNumber,
    r.description || "-",
    String(r.instruments.length),
  ]);
  downloadCSV(headers, rows, `rooms-${exportTimestamp()}`);
}

export function exportRoomsPDF(rooms: Room[]) {
  const tableRows = rooms.map(r => `
    <tr>
      <td>${r.roomName}</td>
      <td>${r.roomNumber}</td>
      <td>${r.description || "-"}</td>
      <td>${r.instruments.length}</td>
    </tr>
  `).join("");

  const html = wrapPDFPage({
    title: "Room Setup",
    subtitle: `${rooms.length} rooms · ${exportSubtitleDate()}`,
    bodyHtml: `
      <table>
        <thead><tr><th>Room Name</th><th>Room #</th><th>Description</th><th>Items</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    `,
  });
  openPrintPDF(html);
}

// ===== ROOM INSTRUMENTS =====
export function exportInstrumentsCSV(instruments: Instrument[], roomName: string) {
  const headers = ["Name", "Item #", "Category", "Status", "Notes"];
  const rows = instruments.map(i => [
    i.name,
    i.instrumentNumber,
    i.category,
    i.status,
    i.notes || "-",
  ]);
  downloadCSV(headers, rows, `${roomName.toLowerCase().replace(/\s+/g, "-")}-items-${exportTimestamp()}`);
}

export function exportInstrumentsPDF(instruments: Instrument[], roomName: string) {
  const tableRows = instruments.map(i => `
    <tr>
      <td>${i.name}</td>
      <td>${i.instrumentNumber}</td>
      <td>${i.category}</td>
      <td>${i.status}</td>
    </tr>
  `).join("");

  const html = wrapPDFPage({
    title: `${roomName} — Items`,
    subtitle: `${instruments.length} items · ${exportSubtitleDate()}`,
    bodyHtml: `
      <table>
        <thead><tr><th>Name</th><th>Item #</th><th>Category</th><th>Status</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    `,
  });
  openPrintPDF(html);
}

// ===== TRAINING =====
interface TrainingVideo {
  title: string;
  description: string;
  duration: string;
  category: string;
}

interface TrainingGuide {
  title: string;
  description: string;
  category: string;
  type: string;
}

export function exportTrainingCSV(videos: TrainingVideo[], guides: TrainingGuide[]) {
  const headers = ["Title", "Type", "Category", "Duration/Format"];
  const rows = [
    ...videos.map(v => [v.title, "Video", v.category, v.duration]),
    ...guides.map(g => [g.title, "Guide", g.category, g.type.toUpperCase()]),
  ];
  downloadCSV(headers, rows, `training-resources-${exportTimestamp()}`);
}

export function exportTrainingPDF(videos: TrainingVideo[], guides: TrainingGuide[]) {
  const videoRows = videos.map(v => `
    <tr><td>${v.title}</td><td>Video</td><td>${v.category}</td><td>${v.duration}</td></tr>
  `).join("");
  const guideRows = guides.map(g => `
    <tr><td>${g.title}</td><td>Guide</td><td>${g.category}</td><td>${g.type.toUpperCase()}</td></tr>
  `).join("");

  const html = wrapPDFPage({
    title: "Training & Resources",
    subtitle: `${videos.length} videos · ${guides.length} guides · ${exportSubtitleDate()}`,
    bodyHtml: `
      <table>
        <thead><tr><th>Title</th><th>Type</th><th>Category</th><th>Duration/Format</th></tr></thead>
        <tbody>${videoRows}${guideRows}</tbody>
      </table>
    `,
  });
  openPrintPDF(html);
}

// ===== COMMUNICATION BOOK =====
export function exportCommNotesCSV(notes: CommunicationNote[]) {
  const headers = ["Date", "Time", "Author", "Role", "Department", "Note", "Seen By"];
  const rows = notes.map(n => [
    format(n.createdAt, "MMM d, yyyy"),
    format(n.createdAt, "h:mm a"),
    n.authorName,
    n.authorRole,
    n.authorDepartment,
    n.content,
    n.seenBy.map(s => s.userName).join(", ") || "None",
  ]);
  downloadCSV(headers, rows, `communication-book-${exportTimestamp()}`);
}

export function exportCommNotesPDF(notes: CommunicationNote[]) {
  const tableRows = notes.map(n => `
    <tr>
      <td>${format(n.createdAt, "MMM d, yyyy")}</td>
      <td>${format(n.createdAt, "h:mm a")}</td>
      <td>${n.authorName}</td>
      <td>${n.authorRole}</td>
      <td style="max-width:300px;word-wrap:break-word">${n.content}</td>
      <td>${n.seenBy.length}</td>
    </tr>
  `).join("");

  const html = wrapPDFPage({
    title: "Communication Book",
    subtitle: `${notes.length} notes · ${exportSubtitleDate()}`,
    bodyHtml: `
      <table>
        <thead><tr><th>Date</th><th>Time</th><th>Author</th><th>Role</th><th>Note</th><th>Seen</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    `,
  });
  openPrintPDF(html);
}
