import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { format } from "date-fns";
import { CalendarIcon, Download, Printer, Eye, FileText, Mail, ClipboardCheck, ListTodo, AlertTriangle, ShieldAlert, Package, DoorOpen, HelpCircle, Building2, TrendingUp, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockDepartments } from "@/data/mockDepartments";
import logoAsset from "@/assets/practicare-logo.png.asset.json";
import markAsset from "@/assets/practicare-mark.jpg.asset.json";

type WeeklyReport = {
  id: string;
  weekStart: Date;
  weekEnd: Date;
  departmentId: string | "all";
  emailedTo: string[];
  checklist: { overall: number; byDept: { dept: string; score: number }[] };
  tasks: { dueThisWeek: string[]; overdue: string[] };
  compliance: string[];
  expiringStock: { categories: string[]; rooms: string[] };
  questions: string[];
};

const seedReports = (): WeeklyReport[] => {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  const monday = (offsetWeeks: number) => {
    const d = new Date(base);
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    d.setDate(d.getDate() + diff - offsetWeeks * 7);
    return d;
  };
  const sunday = (m: Date) => {
    const d = new Date(m);
    d.setDate(d.getDate() + 6);
    return d;
  };
  const depts: (string | "all")[] = ["all", "nursing", "reception", "doctors", "admin", "all", "nursing", "all"];
  return depts.map((dept, i) => {
    const ws = monday(i);
    return {
      id: `wr-${i}`,
      weekStart: ws,
      weekEnd: sunday(ws),
      departmentId: dept,
      emailedTo: ["manager@abcpractice.com.au", "peter@abcpractice.com.au"],
      checklist: {
        overall: 78 + ((i * 3) % 18),
        byDept: [
          { dept: "Nursing", score: 82 + (i % 10) },
          { dept: "Reception", score: 74 + (i % 12) },
          { dept: "Doctors", score: 90 - (i % 8) },
          { dept: "Admin", score: 68 + (i % 14) },
        ],
      },
      tasks: {
        dueThisWeek: ["Order fridge thermometer", "Audit drug cupboard", "Update vaccine register"],
        overdue: i % 2 === 0 ? ["Fire drill log", "Defib battery check"] : ["RACGP accreditation prep"],
      },
      compliance: ["Fire Safety Inspection expired", "First Aid cert renewal — 2 staff"],
      expiringStock: {
        categories: ["Doctor's bag", "Drug cupboard"],
        rooms: ["Consult Room 1", "Treatment Room 3"],
      },
      questions: [
        "Where to find the emergency trolley",
        "What is the file transfer policy",
        "How to log a sharps incident",
      ],
    };
  });
};

const REPORTS = seedReports();

const deptLabel = (id: string) =>
  id === "all" ? "All Departments" : mockDepartments.find((d) => d.id === id)?.name ?? id;

export function WeeklyReportsPanel() {
  const [from, setFrom] = useState<Date | undefined>();
  const [to, setTo] = useState<Date | undefined>();
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [viewing, setViewing] = useState<WeeklyReport | null>(null);

  const filtered = useMemo(() => {
    return REPORTS.filter((r) => {
      if (from && r.weekEnd < from) return false;
      if (to && r.weekStart > to) return false;
      if (deptFilter !== "all" && r.departmentId !== deptFilter && r.departmentId !== "all") return false;
      return true;
    });
  }, [from, to, deptFilter]);

  const handlePrint = (r: WeeklyReport) => {
    const html = buildReportHTML(r);
    const w = window.open("", "_blank", "width=900,height=1200");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.onload = () => {
      w.focus();
      w.print();
    };
  };

  const handleDownload = (r: WeeklyReport) => {
    const html = buildReportHTML(r);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Practicare-Weekly-Report-${format(r.weekStart, "yyyy-MM-dd")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="border-border/60">
        <CardContent className="p-4 flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">From</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("rounded-lg w-[160px] justify-start", !from && "text-muted-foreground")}>
                  <CalendarIcon className="w-3.5 h-3.5 mr-2" />
                  {from ? format(from, "d MMM yyyy") : "Start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={from} onSelect={setFrom} initialFocus className="pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">To</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("rounded-lg w-[160px] justify-start", !to && "text-muted-foreground")}>
                  <CalendarIcon className="w-3.5 h-3.5 mr-2" />
                  {to ? format(to, "d MMM yyyy") : "End date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={to} onSelect={setTo} initialFocus className="pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">Department</label>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="rounded-lg w-[200px] h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                {mockDepartments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(from || to || deptFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-lg text-xs"
              onClick={() => { setFrom(undefined); setTo(undefined); setDeptFilter("all"); }}
            >
              Clear
            </Button>
          )}
          <div className="ml-auto text-xs text-muted-foreground">
            {filtered.length} report{filtered.length === 1 ? "" : "s"}
          </div>
        </CardContent>
      </Card>

      {/* Reports list */}
      <Card className="border-border/60">
        <CardContent className="p-0 divide-y">
          {filtered.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No reports match the selected filters.
            </div>
          )}
          {filtered.map((r) => (
            <div key={r.id} className="flex items-center gap-4 p-4 hover:bg-muted/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">
                    Week of {format(r.weekStart, "d MMM")} – {format(r.weekEnd, "d MMM yyyy")}
                  </span>
                  <Badge variant="outline" className="rounded-md text-[10px]">{deptLabel(r.departmentId)}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                  <Mail className="w-3 h-3" />
                  Emailed to {r.emailedTo.length} recipient{r.emailedTo.length === 1 ? "" : "s"} · Checklist {r.checklist.overall}%
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button size="sm" variant="ghost" className="rounded-lg h-8 px-2" onClick={() => setViewing(r)}>
                  <Eye className="w-3.5 h-3.5 mr-1" />View
                </Button>
                <Button size="sm" variant="ghost" className="rounded-lg h-8 px-2" onClick={() => handleDownload(r)}>
                  <Download className="w-3.5 h-3.5 mr-1" />Download
                </Button>
                <Button size="sm" variant="ghost" className="rounded-lg h-8 px-2" onClick={() => handlePrint(r)}>
                  <Printer className="w-3.5 h-3.5 mr-1" />Print
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Viewer */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-lg">
          {viewing && (
            <>
              <div className="sticky top-0 z-10 flex items-center justify-start gap-2 p-3 pr-14 bg-background border-b">
                <Button size="sm" variant="outline" className="rounded-lg" onClick={() => handleDownload(viewing)}>
                  <Download className="w-3.5 h-3.5 mr-1.5" />Download
                </Button>
                <Button size="sm" className="rounded-lg" onClick={() => handlePrint(viewing)}>
                  <Printer className="w-3.5 h-3.5 mr-1.5" />Print
                </Button>
              </div>
              <BrandedReport report={viewing} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------- Branded report (in-app preview) ---------- */
const BRAND = "#229186";
const BRAND_DARK = "#1a6e66";

function BrandedReport({ report }: { report: WeeklyReport }) {
  const overdueCount = report.tasks.overdue.length;
  const expiringCount = report.expiringStock.categories.length + report.expiringStock.rooms.length;
  return (
    <div className="bg-white text-slate-900 font-sans">
      {/* Branded header band */}
      <header
        className="px-10 pt-8 pb-7 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${BRAND_DARK} 0%, ${BRAND} 100%)` }}
      >
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full opacity-15" style={{ background: "white" }} />
        <div className="absolute -right-8 bottom-0 w-40 h-40 rounded-full opacity-10" style={{ background: "white" }} />
        <div className="relative flex items-center justify-between gap-6">
          <img src={logoAsset.url} alt="Practicare" className="h-24 brightness-0 invert" />
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-[0.25em] opacity-80">Confidential · Practice Operations</div>
            <div className="text-[11px] mt-1 opacity-90">Report ID · {report.id.toUpperCase()}</div>
          </div>
        </div>
        <div className="relative mt-7">
          <div className="text-[11px] uppercase tracking-[0.22em] font-semibold opacity-90">Weekly Performance Report</div>
          <h1 className="mt-1.5 text-[34px] font-bold tracking-tight leading-tight">
            {format(report.weekStart, "d MMM")} – {format(report.weekEnd, "d MMM yyyy")}
          </h1>
          <div className="mt-2 flex items-center gap-4 text-[12px] opacity-95">
            <span className="inline-flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{deptLabel(report.departmentId)}</span>
            <span className="opacity-50">|</span>
            <span className="inline-flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{report.emailedTo.length} recipients</span>
          </div>
        </div>
      </header>

      <div className="px-10 py-8">
        {/* Executive KPI strip */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <KpiCard icon={TrendingUp} label="Checklist Score" value={`${report.checklist.overall}%`} tone="brand" />
          <KpiCard icon={AlertTriangle} label="Overdue Tasks" value={String(overdueCount)} tone={overdueCount > 0 ? "warn" : "neutral"} />
          <KpiCard icon={Package} label="Expiring Items" value={String(expiringCount)} tone={expiringCount > 0 ? "warn" : "neutral"} />
        </div>

        <Section icon={ClipboardCheck} title="Checklist Performance" subtitle="Completion rate by department">
          <div className="rounded-xl border border-slate-200 p-5">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Overall completion</div>
                <div className="text-3xl font-bold" style={{ color: BRAND }}>{report.checklist.overall}%</div>
              </div>
              <div className="text-[11px] text-slate-500">{report.checklist.byDept.length} departments tracked</div>
            </div>
            <div className="space-y-2.5">
              {report.checklist.byDept.map((d) => (
                <div key={d.dept}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-700 font-medium">{d.dept}</span>
                    <span className="font-semibold text-slate-900">{d.score}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${d.score}%`, background: `linear-gradient(90deg, ${BRAND_DARK}, ${BRAND})` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section icon={ListTodo} title="Tasks Due This Week">
          <BrandedList items={report.tasks.dueThisWeek} />
        </Section>

        <Section icon={AlertTriangle} title="Tasks Overdue" tone="warn">
          <BrandedList items={report.tasks.overdue} tone="warn" />
        </Section>

        <Section icon={ShieldAlert} title="Compliance Alerts" tone="warn">
          <BrandedList items={report.compliance} tone="warn" />
        </Section>

        <Section icon={Package} title="Stock Categories Expiring This Week">
          <BrandedList items={report.expiringStock.categories} numbered />
        </Section>

        <Section icon={DoorOpen} title="Rooms With Expiring Items">
          <BrandedList items={report.expiringStock.rooms} numbered />
        </Section>

        <Section icon={HelpCircle} title="Staff Resource Centre" subtitle="Top questions asked this week">
          <BrandedList items={report.questions.map((q) => `“${q}”`)} numbered />
        </Section>

        <footer className="mt-12 pt-5 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src={markAsset.url} alt="Practicare" className="h-9 w-9" />
              <div className="text-[10px] text-slate-500 leading-tight">
                <div className="font-semibold" style={{ color: BRAND }}>Powered by Practicare.io</div>
                <div>© Practicare Australia</div>
              </div>
            </div>
            <div className="text-[10px] text-slate-400">Generated {format(new Date(), "d MMM yyyy")}</div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string; tone: "brand" | "warn" | "neutral" }) {
  const styles = {
    brand: { bg: "#ffffff", border: BRAND, iconBg: `${BRAND}15`, iconColor: BRAND, valueColor: BRAND },
    warn: { bg: "#ffffff", border: "#f59e0b", iconBg: "#fef3c7", iconColor: "#b45309", valueColor: "#b45309" },
    neutral: { bg: "#ffffff", border: "#e2e8f0", iconBg: "#f1f5f9", iconColor: "#64748b", valueColor: "#0f172a" },
  }[tone];
  return (
    <div className="rounded-xl p-4 shadow-sm" style={{ background: styles.bg, border: `1px solid ${styles.border}40` }}>
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: styles.iconBg }}>
          <Icon className="w-4.5 h-4.5" style={{ color: styles.iconColor, width: 18, height: 18 }} />
        </div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">{label}</div>
      </div>
      <div className="mt-2 text-2xl font-bold" style={{ color: styles.valueColor }}>{value}</div>
    </div>
  );
}

function Section({ icon: Icon, title, subtitle, tone = "brand", children }: { icon: LucideIcon; title: string; subtitle?: string; tone?: "brand" | "warn"; children: React.ReactNode }) {
  const color = tone === "warn" ? "#b45309" : BRAND;
  const bg = tone === "warn" ? "#fef3c7" : `${BRAND}15`;
  return (
    <section className="mt-7">
      <div className="flex items-center gap-3 mb-3 pb-2 border-b border-slate-200">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg }}>
          <Icon style={{ color, width: 16, height: 16 }} />
        </div>
        <div className="min-w-0">
          <h3 className="text-[13px] font-bold uppercase tracking-wider" style={{ color }}>{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function BrandedList({ items, numbered = false, tone = "brand" }: { items: string[]; numbered?: boolean; tone?: "brand" | "warn" }) {
  const dotColor = tone === "warn" ? "#f59e0b" : BRAND;
  return (
    <ul className="space-y-1.5">
      {items.map((t, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[12px] text-slate-700 leading-relaxed">
          {numbered ? (
            <span
              className="shrink-0 w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center"
              style={{ background: `${dotColor}15`, color: dotColor }}
            >
              {i + 1}
            </span>
          ) : (
            <span className="shrink-0 w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: dotColor }} />
          )}
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}


/* ---------- Print/download HTML (standalone, self-contained) ---------- */
function buildReportHTML(r: WeeklyReport): string {
  const logoUrl = `${window.location.origin}${logoAsset.url}`;
  const markUrl = `${window.location.origin}${markAsset.url}`;
  const overdueCount = r.tasks.overdue.length;
  const expiringCount = r.expiringStock.categories.length + r.expiringStock.rooms.length;

  // Inline SVG icons (printable, no font dependency)
  const icon = (path: string, color = BRAND) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
  const ICONS: Record<string, string> = {
    checklist: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    tasks: '<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 14l2 2 4-4"/>',
    warn: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
    package: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
    door: '<path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h3"/><path d="M13 20h9"/><path d="M10 12v.01"/><path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561z"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    trend: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>',
    mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
  };

  const section = (iconKey: string, title: string, subtitle: string, body: string, tone: "brand" | "warn" = "brand") => {
    const color = tone === "warn" ? "#b45309" : BRAND;
    const bg = tone === "warn" ? "#fef3c7" : `${BRAND}15`;
    return `
    <section style="margin-top:26px;page-break-inside:avoid">
      <div style="display:flex;align-items:center;gap:12px;padding-bottom:8px;margin-bottom:12px;border-bottom:1px solid #e2e8f0">
        <div style="width:32px;height:32px;border-radius:8px;background:${bg};display:flex;align-items:center;justify-content:center;flex-shrink:0">
          ${icon(ICONS[iconKey], color)}
        </div>
        <div>
          <h3 style="font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${color};margin:0">${title}</h3>
          ${subtitle ? `<p style="font-size:11px;color:#64748b;margin:2px 0 0">${subtitle}</p>` : ""}
        </div>
      </div>
      ${body}
    </section>`;
  };

  const list = (items: string[], { numbered = false, tone = "brand" }: { numbered?: boolean; tone?: "brand" | "warn" } = {}) => {
    const dot = tone === "warn" ? "#f59e0b" : BRAND;
    return `<ul style="list-style:none;margin:0;padding:0">
      ${items.map((t, i) => `
        <li style="display:flex;align-items:flex-start;gap:10px;font-size:12px;color:#334155;line-height:1.6;margin-bottom:6px">
          ${numbered
            ? `<span style="flex-shrink:0;width:20px;height:20px;border-radius:6px;background:${dot}20;color:${dot};font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center">${i + 1}</span>`
            : `<span style="flex-shrink:0;width:6px;height:6px;border-radius:999px;background:${dot};margin-top:7px"></span>`}
          <span>${t}</span>
        </li>`).join("")}
    </ul>`;
  };

  const kpi = (iconKey: string, label: string, value: string, tone: "brand" | "warn" | "neutral") => {
    const cfg = {
      brand: { border: BRAND, iconBg: `${BRAND}15`, iconColor: BRAND, valueColor: BRAND },
      warn: { border: "#f59e0b", iconBg: "#fef3c7", iconColor: "#b45309", valueColor: "#b45309" },
      neutral: { border: "#e2e8f0", iconBg: "#f1f5f9", iconColor: "#64748b", valueColor: "#0f172a" },
    }[tone];
    return `<div style="background:#fff;border:1px solid ${cfg.border}40;border-radius:12px;padding:14px;box-shadow:0 1px 2px rgba(0,0,0,.04)">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:34px;height:34px;border-radius:8px;background:${cfg.iconBg};display:flex;align-items:center;justify-content:center">${icon(ICONS[iconKey], cfg.iconColor)}</div>
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#64748b;font-weight:500">${label}</div>
      </div>
      <div style="font-size:24px;font-weight:700;color:${cfg.valueColor};margin-top:8px">${value}</div>
    </div>`;
  };

  return `<!doctype html><html><head><meta charset="utf-8"/>
<title>Practicare Weekly Report — ${format(r.weekStart, "d MMM yyyy")}</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif; color: #0f172a; margin: 0; padding: 0; background: #fff; }
  .wrap { max-width: 820px; margin: 0 auto; }
  .hero { position: relative; padding: 32px 40px 32px; color: #fff; background: linear-gradient(135deg, ${BRAND_DARK} 0%, ${BRAND} 100%); overflow: hidden; }
  .hero::before { content: ""; position: absolute; right: -64px; top: -64px; width: 288px; height: 288px; border-radius: 50%; background: rgba(255,255,255,.12); }
  .hero-top { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
  .hero-top img { height: 96px; filter: brightness(0) invert(1); }
  .hero-meta { text-align: right; font-size: 11px; opacity: .9; }
  .hero-meta .conf { font-size: 10px; text-transform: uppercase; letter-spacing: .25em; opacity: .8; }
  .hero-body { position: relative; margin-top: 28px; }
  .hero-body .eyebrow { font-size: 11px; font-weight: 600; letter-spacing: .22em; text-transform: uppercase; opacity: .9; }
  .hero-body h1 { font-size: 32px; font-weight: 700; margin: 6px 0 0; letter-spacing: -.01em; line-height: 1.1; }
  .hero-tags { margin-top: 10px; display: flex; gap: 16px; font-size: 12px; opacity: .95; }
  .hero-tags span { display: inline-flex; align-items: center; gap: 6px; }
  .hero-tags svg { stroke: #fff; }
  .body { padding: 32px 40px 36px; }
  .kpi-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin: 0 0 28px; }
  .chart-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; }
  .chart-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 14px; }
  .chart-head .lbl { font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: #64748b; }
  .chart-head .num { font-size: 26px; font-weight: 700; color: ${BRAND}; }
  .bar-row { margin-bottom: 10px; }
  .bar-row .top { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px; }
  .bar-row .top .d { color: #334155; font-weight: 500; }
  .bar-row .top .s { color: #0f172a; font-weight: 600; }
  .bar { height: 8px; border-radius: 999px; background: #f1f5f9; overflow: hidden; }
  .bar > div { height: 100%; border-radius: 999px; background: linear-gradient(90deg, ${BRAND_DARK}, ${BRAND}); }
  footer { margin-top: 40px; padding-top: 18px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
  footer .left { display: flex; align-items: center; gap: 10px; }
  footer .left img { height: 30px; opacity: .8; }
  footer .brand { font-weight: 600; color: ${BRAND}; font-size: 11px; }
  footer .copy { font-size: 10px; color: #64748b; }
  footer .gen { font-size: 10px; color: #94a3b8; }
  @media print { .wrap { max-width: none; } }
</style></head>
<body><div class="wrap">
  <header class="hero">
    <div class="hero-top">
      <img src="${logoUrl}" alt="Practicare"/>
      <div class="hero-meta">
        <div class="conf">Confidential · Practice Operations</div>
        <div style="margin-top:4px">Report ID · ${r.id.toUpperCase()}</div>
      </div>
    </div>
    <div class="hero-body">
      <div class="eyebrow">Weekly Performance Report</div>
      <h1>${format(r.weekStart, "d MMM")} – ${format(r.weekEnd, "d MMM yyyy")}</h1>
      <div class="hero-tags">
        <span>${icon(ICONS.building, "#fff")}${deptLabel(r.departmentId)}</span>
        <span style="opacity:.5">|</span>
        <span>${icon(ICONS.mail, "#fff")}${r.emailedTo.length} recipients</span>
      </div>
    </div>
  </header>

  <div class="body">
    <div class="kpi-row">
      ${kpi("trend", "Checklist Score", `${r.checklist.overall}%`, "brand")}
      ${kpi("warn", "Overdue Tasks", String(overdueCount), overdueCount > 0 ? "warn" : "neutral")}
      ${kpi("package", "Expiring Items", String(expiringCount), expiringCount > 0 ? "warn" : "neutral")}
    </div>

    ${section("checklist", "Checklist Performance", "Completion rate by department", `
      <div class="chart-card">
        <div class="chart-head">
          <div>
            <div class="lbl">Overall completion</div>
            <div class="num">${r.checklist.overall}%</div>
          </div>
          <div style="font-size:11px;color:#64748b">${r.checklist.byDept.length} departments tracked</div>
        </div>
        ${r.checklist.byDept.map((d) => `
          <div class="bar-row">
            <div class="top"><span class="d">${d.dept}</span><span class="s">${d.score}%</span></div>
            <div class="bar"><div style="width:${d.score}%"></div></div>
          </div>`).join("")}
      </div>`)}

    ${section("tasks", "Tasks Due This Week", "", list(r.tasks.dueThisWeek))}
    ${section("warn", "Tasks Overdue", "", list(r.tasks.overdue, { tone: "warn" }), "warn")}
    ${section("shield", "Compliance Alerts", "", list(r.compliance, { tone: "warn" }), "warn")}
    ${section("package", "Stock Categories Expiring This Week", "", list(r.expiringStock.categories, { numbered: true }))}
    ${section("door", "Rooms With Expiring Items", "", list(r.expiringStock.rooms, { numbered: true }))}
    ${section("help", "Staff Resource Centre", "Top questions asked this week", list(r.questions.map((q) => `&ldquo;${q}&rdquo;`), { numbered: true }))}

    <footer>
      <div class="left">
        <img src="${markUrl}" alt="Practicare" style="height:36px;width:36px;opacity:1;"/>
        <div>
          <div class="brand">Powered by Practicare.io</div>
          <div class="copy">© Practicare Australia</div>
        </div>
      </div>
      <div class="gen">Generated ${format(new Date(), "d MMM yyyy")}</div>
    </footer>
  </div>
</div></body></html>`;
}

