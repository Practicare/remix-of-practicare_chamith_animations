import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useNavigate, useParams } from "react-router-dom";
import {
  Shield, ArrowLeft, Sparkles, Upload, Globe, FolderSync, Search, FileText,
  Camera, Mic, Check, X, Clock, ChevronLeft, ChevronRight, Save, Plus, Download,
  Eye, FileBarChart, Users, Settings as SettingsIcon, LayoutGrid,
} from "lucide-react";
import {
  mockProjects, mockDocs, mockGaps, mockEvidence, readinessCategories,
  assessmentQuestions, reportTemplates, GapSeverity,
} from "@/data/mockAccreditation";
import { ProjectTimeline } from "@/components/accreditation/ProjectTimeline";
import { InsightsSidebar } from "@/components/accreditation/InsightsSidebar";
import { FloatingAIButton, AIAssistantSheet } from "@/components/accreditation/AIAssistantSheet";
import { KpiCard } from "@/components/dashboard/KpiCard";
import {
  RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis,
  Radar, RadarChart, PolarGrid, PolarRadiusAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const severityTone: Record<GapSeverity, string> = {
  critical: "border-destructive/40 bg-destructive/5",
  high: "border-amber-500/40 bg-amber-500/5",
  medium: "border-blue-500/40 bg-blue-500/5",
  low: "border-muted-foreground/30 bg-muted/40",
};
const severityChip: Record<GapSeverity, string> = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-amber-500 text-white",
  medium: "bg-blue-500 text-white",
  low: "bg-muted-foreground/60 text-white",
};
const docStatusTone: Record<string, string> = {
  Ready: "bg-emerald-500/10 text-emerald-600",
  Processing: "bg-blue-500/10 text-blue-600",
  Learning: "bg-primary/10 text-primary",
  "Needs Review": "bg-amber-500/10 text-amber-600",
};

export default function AccreditationProject() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const project = useMemo(() => mockProjects.find((p) => p.id === projectId) ?? mockProjects[0], [projectId]);
  const [tab, setTab] = useState("overview");
  const [aiOpen, setAiOpen] = useState(false);
  const [openDoc, setOpenDoc] = useState<string | null>(null);
  const [assessStep, setAssessStep] = useState(0);
  const q = assessmentQuestions[assessStep];

  const gaugeData = [{ name: "readiness", value: project.readiness, fill: "hsl(var(--primary))" }];

  return (
    <AdminLayout>
      <MobileHeader title={project.name} subtitle={project.standard} />
      <PageHeader
        title={project.name}
        subtitle={project.standard}
        icon={Shield}
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => navigate("/accreditation")}>
              <ArrowLeft className="w-4 h-4 mr-1.5" /> All projects
            </Button>
            <Button size="sm" onClick={() => setAiOpen(true)}>
              <Sparkles className="w-4 h-4 mr-1.5" /> Ask AI
            </Button>
          </>
        }
      />

      <AnimatedPage>
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto pb-24">
            <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-6">
              {/* KPI strip */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <KpiCard label="Standard" value={project.standard.split(" ")[0]} sub={project.standard} icon={Shield} tone="primary" />
                <KpiCard label="Readiness" value={`${project.readiness}%`} delta={6} icon={Sparkles} tone="primary" />
                <KpiCard label="Tasks left" value={`${project.tasksRemaining}`} icon={Clock} tone="warning" />
                <KpiCard label="Evidence" value={`${project.evidencePct}%`} delta={4} icon={FileText} tone="success" />
                <KpiCard label="Compliance" value={`${project.compliancePct}%`} delta={-2} icon={Check} tone="accent" />
              </div>

              {/* Timeline */}
              <Card className="border-border/60">
                <CardContent className="p-2 md:p-3">
                  <ProjectTimeline current={project.stage} />
                </CardContent>
              </Card>

              {/* Tabs */}
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="w-full overflow-x-auto flex-nowrap justify-start h-auto p-1 scrollbar-hide">
                  {["overview", "documents", "assessment", "gap", "implementation", "evidence", "reports", "settings"].map((t) => (
                    <TabsTrigger key={t} value={t} className="text-[12px] capitalize px-3">
                      {t === "gap" ? "Gap Analysis" : t}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* OVERVIEW */}
                <TabsContent value="overview" className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="border-border/60">
                    <CardContent className="p-5 space-y-3">
                      <h3 className="text-sm font-semibold">Project summary</h3>
                      <dl className="text-[13px] divide-y divide-border/60">
                        {[
                          ["Accreditation", project.standard],
                          ["Audit date", new Date(project.auditDate).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })],
                          ["Practice", "Practicare Family Clinic"],
                          ["Owner", project.ownerName],
                          ["AI confidence", "92%"],
                          ["Last AI sync", "12 min ago"],
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between py-2">
                            <dt className="text-muted-foreground">{k}</dt>
                            <dd className="font-medium text-right">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    </CardContent>
                  </Card>

                  <Card className="border-border/60">
                    <CardContent className="p-5">
                      <h3 className="text-sm font-semibold mb-2">Readiness</h3>
                      <div className="h-40 relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadialBarChart innerRadius="70%" outerRadius="100%" data={gaugeData} startAngle={90} endAngle={-270}>
                            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                            <RadialBar background dataKey="value" cornerRadius={20} />
                          </RadialBarChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-3xl font-bold">{project.readiness}%</span>
                          <span className="text-[11px] text-muted-foreground">Ready</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/60 lg:col-span-2">
                    <CardContent className="p-5">
                      <h3 className="text-sm font-semibold mb-2">Category readiness</h3>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={readinessCategories}>
                            <PolarGrid stroke="hsl(var(--border))" />
                            <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* DOCUMENTS */}
                <TabsContent value="documents" className="mt-4 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm"><Upload className="w-4 h-4 mr-1.5" /> Upload</Button>
                    <Button size="sm" variant="outline"><Globe className="w-4 h-4 mr-1.5" /> Add Website</Button>
                    <Button size="sm" variant="outline"><FolderSync className="w-4 h-4 mr-1.5" /> Sync Folder</Button>
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input className="pl-8 h-9 text-[13px]" placeholder="Search documents…" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["All", "Standards", "Policies", "Evidence", "Registers"].map((c, i) => (
                      <Badge key={c} variant={i === 0 ? "default" : "outline"} className="cursor-pointer">{c}</Badge>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {mockDocs.map((d) => (
                      <Card key={d.id} className="border-border/60 hover:shadow-md hover:border-primary/40 transition-all cursor-pointer" onClick={() => setOpenDoc(d.id)}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[13px] font-semibold truncate">{d.name}</p>
                              <p className="text-[11px] text-muted-foreground">{d.pages} pages · {d.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className={cn("text-[10px] px-2 py-0.5 rounded-md font-semibold", docStatusTone[d.status])}>{d.status}</span>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-primary" /> {d.confidence}%
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* ASSESSMENT */}
                <TabsContent value="assessment" className="mt-4">
                  <Card className="border-border/60">
                    <CardContent className="p-6 space-y-5">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Step {assessStep + 1} of {assessmentQuestions.length}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ~{(assessmentQuestions.length - assessStep) * 2} min left</span>
                      </div>
                      <Progress value={((assessStep + 1) / assessmentQuestions.length) * 100} className="h-1.5" />

                      <div>
                        <p className="text-[11px] text-primary font-semibold uppercase tracking-wider">Business Assessment</p>
                        <h3 className="text-lg md:text-xl font-semibold leading-snug mt-1">{q.prompt}</h3>
                      </div>

                      {q.type === "cards" && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {q.options!.map((o) => (
                            <button key={o} className="border border-border/60 rounded-lg p-3 text-[13px] text-left hover:border-primary hover:bg-primary/5 transition-colors">
                              {o}
                            </button>
                          ))}
                        </div>
                      )}
                      {q.type === "dropdown" && (
                        <select className="w-full h-10 px-3 rounded-lg border border-border bg-background text-[13px]">
                          <option>Select an answer…</option>
                          {q.options!.map((o) => <option key={o}>{o}</option>)}
                        </select>
                      )}
                      {q.type === "text" && <Textarea placeholder="Type your answer…" className="min-h-[120px]" />}
                      {q.type === "photo" && (
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/30">
                          <Camera className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-[13px] font-medium">Drop a photo or click to upload</p>
                          <p className="text-[11px] text-muted-foreground mt-1">AI will auto-tag and link to the relevant standard</p>
                        </div>
                      )}
                      {q.type === "voice" && (
                        <div className="border border-border/60 rounded-lg p-6 text-center bg-muted/30">
                          <button className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto shadow-lg">
                            <Mic className="w-6 h-6" />
                          </button>
                          <p className="text-[12px] text-muted-foreground mt-3">Tap to record your answer</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-border/60">
                        <Button variant="ghost" size="sm" disabled={assessStep === 0} onClick={() => setAssessStep((s) => s - 1)}>
                          <ChevronLeft className="w-4 h-4 mr-1" /> Back
                        </Button>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm"><Save className="w-4 h-4 mr-1.5" /> Save draft</Button>
                          <Button size="sm" onClick={() => setAssessStep((s) => Math.min(assessmentQuestions.length - 1, s + 1))}>
                            Next <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* GAP ANALYSIS — Kanban */}
                <TabsContent value="gap" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {(["critical", "high", "medium", "low"] as GapSeverity[]).map((sev) => {
                      const items = mockGaps.filter((g) => g.severity === sev);
                      return (
                        <div key={sev} className="rounded-lg bg-muted/40 border border-border/40 p-2 min-h-[400px]">
                          <div className="flex items-center justify-between px-2 py-1.5">
                            <span className="text-[11px] font-semibold uppercase tracking-wider">{sev}</span>
                            <span className={cn("text-[10px] px-1.5 rounded-full font-semibold", severityChip[sev])}>{items.length}</span>
                          </div>
                          <div className="space-y-2 mt-1">
                            {items.map((g) => (
                              <div key={g.id} className={cn("rounded-lg border p-3 bg-card", severityTone[sev])}>
                                <p className="text-[10px] text-muted-foreground font-semibold">{g.standard}</p>
                                <p className="text-[13px] font-semibold leading-tight mt-0.5">{g.title}</p>
                                <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{g.missing}</p>
                                <div className="flex items-center justify-between mt-3">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[9px] font-semibold">
                                      {g.ownerInitials}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">
                                      {new Date(g.due).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex gap-1 mt-2 pt-2 border-t border-border/50">
                                  {["Assign", "Task", "Evidence"].map((a) => (
                                    <button
                                      key={a}
                                      onClick={() => toast.info(`${a} action — coming soon`)}
                                      className="text-[10px] px-1.5 py-0.5 rounded bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground"
                                    >
                                      {a}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>

                {/* IMPLEMENTATION — Gantt */}
                <TabsContent value="implementation" className="mt-4">
                  <Card className="border-border/60">
                    <CardContent className="p-4">
                      <div className="overflow-x-auto">
                        <div className="min-w-[720px]">
                          <div className="grid grid-cols-[180px_repeat(5,1fr)] gap-2 text-[11px] text-muted-foreground font-semibold pb-2 border-b border-border/60">
                            <span>Workstream</span>
                            {["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"].map((w) => <span key={w}>{w}</span>)}
                          </div>
                          {[
                            { name: "Policies review", start: 0, span: 2, tone: "bg-primary" },
                            { name: "Staff training", start: 1, span: 3, tone: "bg-blue-500" },
                            { name: "Evidence collection", start: 2, span: 3, tone: "bg-emerald-500" },
                            { name: "Mock audit prep", start: 3, span: 2, tone: "bg-amber-500" },
                            { name: "Final review", start: 4, span: 1, tone: "bg-destructive" },
                          ].map((row) => (
                            <div key={row.name} className="grid grid-cols-[180px_repeat(5,1fr)] gap-2 items-center py-2.5 border-b border-border/40">
                              <span className="text-[12px] font-medium">{row.name}</span>
                              {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-6 relative">
                                  {i === row.start && (
                                    <div className={cn("absolute inset-y-0 rounded-md", row.tone)} style={{ left: 0, right: `-${(row.span - 1) * 100}%` }} />
                                  )}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* EVIDENCE */}
                <TabsContent value="evidence" className="mt-4 space-y-4">
                  <div className="border-2 border-dashed border-primary/30 bg-primary/5 rounded-lg p-6 text-center">
                    <Upload className="w-6 h-6 mx-auto text-primary mb-2" />
                    <p className="text-[13px] font-medium">Drop evidence here or click to upload</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Photos, docs, screenshots — AI auto-links to standards</p>
                  </div>
                  <div className="columns-2 md:columns-3 lg:columns-4 gap-3 [&>*]:mb-3">
                    {mockEvidence.map((e, i) => (
                      <div key={e.id} className="break-inside-avoid rounded-lg border border-border/60 bg-card overflow-hidden group">
                        <div
                          className="w-full bg-gradient-to-br from-primary/20 via-primary/5 to-transparent flex items-center justify-center"
                          style={{ height: 80 + (i % 4) * 30 }}
                        >
                          {e.type === "photo" && <Camera className="w-8 h-8 text-primary/70" />}
                          {e.type === "document" && <FileText className="w-8 h-8 text-primary/70" />}
                          {e.type === "screenshot" && <LayoutGrid className="w-8 h-8 text-primary/70" />}
                          {e.type === "certificate" && <Shield className="w-8 h-8 text-primary/70" />}
                        </div>
                        <div className="p-2.5">
                          <p className="text-[12px] font-medium leading-tight line-clamp-2">{e.title}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] text-muted-foreground">{e.standard}</span>
                            {e.status === "verified" && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                            {e.status === "missing" && <X className="w-3.5 h-3.5 text-destructive" />}
                            {e.status === "pending" && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* REPORTS */}
                <TabsContent value="reports" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {reportTemplates.map((r) => (
                      <Card key={r.id} className="border-border/60">
                        <CardContent className="p-4 flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <FileBarChart className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13.5px] font-semibold">{r.name}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{r.desc} · ~{r.pages}pp</p>
                            <div className="flex gap-1.5 mt-3">
                              <Button size="sm" variant="default" className="h-7 text-[11px]"><Sparkles className="w-3 h-3 mr-1" /> Generate</Button>
                              <Button size="sm" variant="outline" className="h-7 text-[11px]"><Eye className="w-3 h-3 mr-1" /> Preview</Button>
                              <Button size="sm" variant="outline" className="h-7 text-[11px]"><Download className="w-3 h-3 mr-1" /> PDF</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* SETTINGS */}
                <TabsContent value="settings" className="mt-4 space-y-4">
                  <Card className="border-border/60">
                    <CardContent className="p-5 space-y-4">
                      <h3 className="text-sm font-semibold">Project settings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Accreditation type</label>
                          <Input defaultValue={project.standard} className="mt-1" />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Audit date</label>
                          <Input type="date" defaultValue={project.auditDate} className="mt-1" />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Notification frequency</label>
                          <select className="w-full h-10 px-3 mt-1 rounded-lg border border-border bg-background text-[13px]">
                            <option>Weekly digest</option><option>Daily</option><option>Only critical</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Primary owner</label>
                          <Input defaultValue={project.ownerName} className="mt-1" />
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border/60 space-y-2">
                        <p className="text-[12px] font-semibold">AI behaviour</p>
                        {[
                          "Auto-extract requirements from uploaded docs",
                          "Auto-suggest gap-closing tasks",
                          "Auto-analyse uploaded evidence",
                          "Weekly AI briefing email",
                        ].map((l) => (
                          <div key={l} className="flex items-center justify-between text-[13px]">
                            <span>{l}</span>
                            <Switch defaultChecked />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/60">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold flex items-center gap-2"><Users className="w-4 h-4" /> Team access</h3>
                        <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-1.5" /> Invite</Button>
                      </div>
                      <div className="divide-y divide-border/60 text-[13px]">
                        {[
                          ["Sarah Chen", "Owner", "SC"],
                          ["Mark Patel", "Editor", "MP"],
                          ["Lena Ford", "Viewer", "LF"],
                        ].map(([n, role, in_]) => (
                          <div key={n} className="flex items-center gap-3 py-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[11px] font-semibold">{in_}</div>
                            <span className="flex-1 font-medium">{n}</span>
                            <Badge variant="outline">{role}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <InsightsSidebar />
        </div>

        <FloatingAIButton onClick={() => setAiOpen(true)} />
        <AIAssistantSheet open={aiOpen} onOpenChange={setAiOpen} />

        {/* Document split view */}
        <Dialog open={!!openDoc} onOpenChange={(v) => !v && setOpenDoc(null)}>
          <DialogContent className="max-w-5xl h-[80vh] p-0 gap-0">
            <DialogHeader className="px-5 py-3 border-b">
              <DialogTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                {mockDocs.find((d) => d.id === openDoc)?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 h-full overflow-hidden">
              <div className="bg-muted/40 border-r flex items-center justify-center p-6">
                <div className="text-center text-muted-foreground">
                  <FileText className="w-16 h-16 mx-auto opacity-40" />
                  <p className="text-[12px] mt-2">PDF preview</p>
                </div>
              </div>
              <div className="overflow-y-auto p-5">
                <Tabs defaultValue="req">
                  <TabsList className="w-full">
                    <TabsTrigger value="req" className="flex-1 text-[11px]">Requirements</TabsTrigger>
                    <TabsTrigger value="ev" className="flex-1 text-[11px]">Evidence</TabsTrigger>
                    <TabsTrigger value="def" className="flex-1 text-[11px]">Definitions</TabsTrigger>
                    <TabsTrigger value="dep" className="flex-1 text-[11px]">Dependencies</TabsTrigger>
                    <TabsTrigger value="pol" className="flex-1 text-[11px]">Policies</TabsTrigger>
                  </TabsList>
                  <TabsContent value="req" className="mt-3 space-y-2">
                    {["GP 3.2 — Practice ensures cold chain integrity", "GP 4.1 — Written incident response plan", "QI 3.2 — Annual anaphylaxis training"].map((r) => (
                      <div key={r} className="rounded-lg border border-border/60 p-3 text-[12.5px]">
                        <p className="font-semibold">{r.split(" — ")[0]}</p>
                        <p className="text-muted-foreground mt-0.5">{r.split(" — ")[1]}</p>
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="ev" className="mt-3 text-[12px] text-muted-foreground">Evidence extracted from this document is linked here.</TabsContent>
                  <TabsContent value="def" className="mt-3 text-[12px] text-muted-foreground">Glossary terms defined by this standard.</TabsContent>
                  <TabsContent value="dep" className="mt-3 text-[12px] text-muted-foreground">Related standards and cross-references.</TabsContent>
                  <TabsContent value="pol" className="mt-3 text-[12px] text-muted-foreground">Practice policies mapped to this document.</TabsContent>
                </Tabs>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </AnimatedPage>
    </AdminLayout>
  );
}
