import { format } from "date-fns";
import { Roster, Shift } from "@/types/roster";
import { APP_BRAND, APP_COLORS } from "@/config/branding";
import brandMark from "@/assets/practicare-mark.jpg.asset.json";
import { memberColor, memberInitials } from "@/lib/memberColors";
import { downloadCSV, openPrintPDF, exportSubtitleDate } from "./exportUtils";

const esc = (v?: string) =>
  String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Minutes between two "HH:mm" strings (handles overnight shifts). */
function shiftMinutes(shift: Shift): number {
  const [sh, sm] = shift.startTime.split(":").map(Number);
  const [eh, em] = shift.endTime.split(":").map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  const breakMins = (shift.breaks || []).reduce((sum, b) => {
    const [bsh, bsm] = b.startTime.split(":").map(Number);
    const [beh, bem] = b.endTime.split(":").map(Number);
    let d = beh * 60 + bem - (bsh * 60 + bsm);
    if (d < 0) d += 24 * 60;
    return sum + (b.isPaid ? 0 : d);
  }, 0);
  return Math.max(0, mins - breakMins);
}

const hrs = (mins: number) => `${(mins / 60).toFixed(mins % 60 === 0 ? 0 : 1)}h`;

const to12h = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")}${suffix}`;
};

export function exportRosterCSV(roster: Roster) {
  const headers = ["Date", "Team member", "Start", "End", "Hours", "Role", "Location", "Notes"];
  const rows = [...roster.shifts]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.startTime.localeCompare(b.startTime))
    .map((s) => [
      format(new Date(s.date), "yyyy-MM-dd"),
      s.teamMemberName,
      s.startTime,
      s.endTime,
      (shiftMinutes(s) / 60).toFixed(2),
      s.role || "",
      s.location || "",
      s.notes || "",
    ]);
  downloadCSV(headers, rows, `roster-${roster.name.replace(/\s+/g, "-").toLowerCase()}`);
}

export interface PracticeDetails {
  /** Site / practice name */
  name: string;
  /** Parent organisation name */
  organisation?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export function exportRosterPDF(roster: Roster, practice?: PracticeDetails) {
  const shifts = [...roster.shifts].sort(
    (a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime() || a.startTime.localeCompare(b.startTime),
  );

  const totalMins = shifts.reduce((s, sh) => s + shiftMinutes(sh), 0);
  const people = new Map<string, { name: string; mins: number; count: number }>();
  shifts.forEach((s) => {
    const key = s.teamMemberId || s.teamMemberName;
    const prev = people.get(key) || { name: s.teamMemberName, mins: 0, count: 0 };
    people.set(key, { name: s.teamMemberName, mins: prev.mins + shiftMinutes(s), count: prev.count + 1 });
  });

  // Group by day
  const days = new Map<string, Shift[]>();
  shifts.forEach((s) => {
    const key = format(new Date(s.date), "yyyy-MM-dd");
    days.set(key, [...(days.get(key) || []), s]);
  });

  const dayBlocks = [...days.entries()]
    .map(([key, list]) => {
      const dayMins = list.reduce((sum, s) => sum + shiftMinutes(s), 0);
      const rows = list
        .map((s) => {
          const c = memberColor(s.teamMemberId || s.teamMemberName);
          const initials = memberInitials(s.teamMemberName);
          return `<tr>
            <td class="person">
              <span class="avatar" style="background:${c.bg};">${esc(initials)}</span>
              <span>${esc(s.teamMemberName)}</span>
            </td>
            <td class="time"><span class="pill" style="background:${c.soft};color:${c.bg};">${to12h(s.startTime)} – ${to12h(s.endTime)}</span></td>
            <td>${hrs(shiftMinutes(s))}</td>
            <td>${esc(s.role) || "—"}</td>
            <td>${esc(s.location) || "—"}</td>
            <td class="notes">${esc(s.notes) || "—"}</td>
          </tr>`;
        })
        .join("");

      return `<section class="day">
        <div class="day-head">
          <div class="day-date">
            <span class="dow">${format(new Date(key), "EEEE")}</span>
            <span class="dnum">${format(new Date(key), "d MMM yyyy")}</span>
          </div>
          <div class="day-meta">${list.length} shift${list.length === 1 ? "" : "s"} · ${hrs(dayMins)}</div>
        </div>
        <table>
          <thead><tr><th>Team member</th><th>Time</th><th>Hours</th><th>Role</th><th>Location</th><th>Notes</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </section>`;
    })
    .join("");

  const summaryRows = [...people.values()]
    .sort((a, b) => b.mins - a.mins)
    .map((p) => {
      const c = memberColor(p.name);
      return `<div class="sum-row">
        <span class="dot" style="background:${c.bg};"></span>
        <span class="sum-name">${esc(p.name)}</span>
        <span class="sum-val">${p.count} shift${p.count === 1 ? "" : "s"} · ${hrs(p.mins)}</span>
      </div>`;
    })
    .join("");

  const markUrl = `${window.location.origin}${brandMark.url}`;

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${esc(roster.name)} — Roster</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Arial, sans-serif; margin: 0; color: #14211f; background: #fff; }
  .page { padding: 36px 40px 96px; }
  .brandbar {
    position: relative; overflow: hidden;
    display: flex; align-items: center; justify-content: space-between; gap: 24px;
    background: linear-gradient(120deg, ${APP_COLORS.primaryDark} 0%, ${APP_COLORS.primary} 62%, #2ba79a 100%);
    color: #fff; border-radius: 14px; padding: 26px 28px;
  }
  .brandbar::after {
    content: ""; position: absolute; right: -60px; top: -70px; height: 230px; width: 230px;
    border-radius: 50%; background: rgba(255,255,255,.07);
  }
  .brandbar::before {
    content: ""; position: absolute; right: 40px; bottom: -110px; height: 190px; width: 190px;
    border-radius: 50%; background: rgba(255,255,255,.05);
  }
  .bb-left { position: relative; z-index: 1; display: flex; align-items: center; gap: 16px; }
  .mark { height: 54px; width: 54px; border-radius: 14px; background: #fff; padding: 6px;
    display: flex; align-items: center; justify-content: center; flex: none; }
  .mark img { height: 100%; width: 100%; object-fit: contain; }
  .eyebrow { font-size: 10.5px; text-transform: uppercase; letter-spacing: 1.6px; opacity: .8; margin-bottom: 3px; }
  .brandbar h1 { font-size: 23px; margin: 0 0 5px; letter-spacing: -0.3px; }
  .brandbar .sub { font-size: 12.5px; opacity: 0.9; }
  .bb-right { position: relative; z-index: 1; text-align: right; }
  .bb-right .wordmark { font-size: 15px; font-weight: 700; letter-spacing: .3px; }
  .bb-right .domain { font-size: 11px; opacity: .8; margin-top: 2px; }
  .badge { display:inline-block; margin-top:10px; font-size: 11px; font-weight: 600; letter-spacing: .6px; text-transform: uppercase;
    background: rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.35); border-radius: 999px; padding: 3px 10px; }
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 20px 0 24px; }
  .stat { border: 1px solid #e3ebea; border-radius: 10px; padding: 12px 14px; background: ${APP_COLORS.primaryLight}55; }
  .stat strong { display: block; font-size: 20px; color: ${APP_COLORS.primaryDark}; }
  .stat span { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #6b7c7a; }
  h2.section { font-size: 13px; text-transform: uppercase; letter-spacing: .8px; color: #6b7c7a; margin: 0 0 10px; }
  .summary { border: 1px solid #e3ebea; border-radius: 10px; padding: 14px 16px; margin-bottom: 26px; }
  .sum-row { display: flex; align-items: center; gap: 8px; padding: 5px 0; font-size: 13px; border-bottom: 1px solid #f1f5f4; }
  .sum-row:last-child { border-bottom: none; }
  .sum-name { font-weight: 600; }
  .sum-val { margin-left: auto; color: #6b7c7a; font-size: 12.5px; }
  .dot { height: 9px; width: 9px; border-radius: 999px; display:inline-block; }
  .day { border: 1px solid #e3ebea; border-radius: 10px; margin-bottom: 14px; overflow: hidden; page-break-inside: avoid; }
  .day-head { display: flex; align-items: baseline; gap: 10px; padding: 10px 14px; background: #f7faf9; border-bottom: 1px solid #e3ebea; }
  .dow { font-weight: 700; font-size: 14px; }
  .dnum { font-size: 12.5px; color: #6b7c7a; margin-left: 6px; }
  .day-meta { margin-left: auto; font-size: 12px; color: ${APP_COLORS.primaryDark}; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-size: 10.5px; text-transform: uppercase; letter-spacing: .5px; color: #8b9a98; padding: 8px 14px; border-bottom: 1px solid #eef3f2; }
  td { padding: 9px 14px; font-size: 12.5px; border-bottom: 1px solid #f2f6f5; vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  .person { display: flex; align-items: center; gap: 8px; font-weight: 600; }
  .avatar { height: 22px; width: 22px; border-radius: 999px; color: #fff; font-size: 10px; font-weight: 700;
    display: inline-flex; align-items: center; justify-content: center; }
  .pill { display: inline-block; border-radius: 8px; padding: 3px 9px; font-weight: 600; font-size: 12px; white-space: nowrap; }
  .notes { color: #6b7c7a; }
  .empty { border: 1px dashed #d7e2e0; border-radius: 10px; padding: 28px; text-align: center; color: #8b9a98; font-size: 13px; }
  .foot { position: fixed; bottom: 0; left: 0; right: 0; padding: 12px 40px; border-top: 1px solid #e3ebea;
    display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #8b9a98; background: #fff; }
  .foot strong { color: ${APP_COLORS.primaryDark}; }
  .foot .fmark { height: 18px; width: 18px; border-radius: 5px; object-fit: contain; vertical-align: -4px; margin: 0 6px; }
  .foot-right { display: flex; align-items: center; gap: 6px; }
  .prac-name { font-size: 15px; font-weight: 700; letter-spacing: .2px; }
  .prac-org { font-size: 11.5px; opacity: .85; margin-top: 2px; }
  .practice { border: 1px solid #e3ebea; border-left: 3px solid ${APP_COLORS.primary}; border-radius: 10px;
    padding: 14px 16px; margin-bottom: 20px; background: #fbfdfd; }
  .practice-head { font-size: 10.5px; text-transform: uppercase; letter-spacing: .9px; color: ${APP_COLORS.primaryDark};
    font-weight: 700; margin-bottom: 10px; }
  .practice-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px 20px; }
  .practice-grid span { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: .5px; color: #8b9a98; }
  .practice-grid strong { font-size: 12.5px; font-weight: 600; color: #14211f; }
  .rule { height: 3px; border-radius: 3px; margin: 0 0 18px;
    background: linear-gradient(90deg, ${APP_COLORS.primary}, ${APP_COLORS.primary}00); }
  @page { margin: 12mm; }
  @media print { .page { padding: 0 0 80px; } }
</style>
</head>
<body>
  <div class="page">
    <div class="brandbar">
      <div class="bb-left">
        <span class="mark"><img src="${markUrl}" alt="${APP_BRAND.name}" /></span>
        <div>
          <div class="eyebrow">${esc(roster.departmentName) || "All departments"} · Team roster</div>
          <h1>${esc(roster.name)}</h1>
          <div class="sub">${format(new Date(roster.startDate), "d MMM yyyy")} – ${format(new Date(roster.endDate), "d MMM yyyy")}</div>
          <div class="badge">${roster.published ? "Published roster" : "Draft roster"}</div>
        </div>
      </div>
      <div class="bb-right">
        ${
          practice
            ? `<div class="prac-name">${esc(practice.name)}</div>
               ${practice.organisation ? `<div class="prac-org">${esc(practice.organisation)}</div>` : ""}`
            : `<div class="prac-name">${APP_BRAND.name}</div><div class="prac-org">${APP_BRAND.domain}</div>`
        }
      </div>
    </div>
    <div style="height:18px"></div>
    ${
      practice
        ? `<div class="practice">
             <div class="practice-head">Practice details</div>
             <div class="practice-grid">
               <div><span>Practice</span><strong>${esc(practice.name)}</strong></div>
               ${practice.organisation ? `<div><span>Organisation</span><strong>${esc(practice.organisation)}</strong></div>` : ""}
               ${practice.address ? `<div><span>Address</span><strong>${esc(practice.address)}</strong></div>` : ""}
               ${practice.phone ? `<div><span>Phone</span><strong>${esc(practice.phone)}</strong></div>` : ""}
               ${practice.email ? `<div><span>Email</span><strong>${esc(practice.email)}</strong></div>` : ""}
               ${roster.departmentName ? `<div><span>Department</span><strong>${esc(roster.departmentName)}</strong></div>` : ""}
             </div>
           </div>`
        : ""
    }

    <div class="stats">
      <div class="stat"><strong>${shifts.length}</strong><span>Shifts</span></div>
      <div class="stat"><strong>${people.size}</strong><span>Team members</span></div>
      <div class="stat"><strong>${hrs(totalMins)}</strong><span>Total hours</span></div>
      <div class="stat"><strong>${days.size}</strong><span>Days covered</span></div>
    </div>

    ${
      shifts.length
        ? `<div class="rule"></div>
           <h2 class="section">Hours by team member</h2>
           <div class="summary">${summaryRows}</div>
           <h2 class="section">Schedule</h2>
           ${dayBlocks}`
        : `<div class="empty">No shifts scheduled for this roster yet.</div>`
    }
  </div>
  <div class="foot">
    <span>Generated ${exportSubtitleDate()}</span>
    <span class="foot-right">Powered by<img class="fmark" src="${markUrl}" alt="${APP_BRAND.name}" /><strong>${APP_BRAND.name}</strong>&nbsp;· ${APP_BRAND.domain}</span>
  </div>
</body>
</html>`;

  openPrintPDF(html);
}
