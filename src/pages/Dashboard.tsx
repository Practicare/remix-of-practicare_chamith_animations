import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  CheckSquare,
  Clock,
  AlertCircle,
  Package,
  ShieldCheck,
  ChevronRight,
  Plus,
  UserPlus,
  FileText,
  Calendar,
  Newspaper,
  TrendingUp,
  TrendingDown,
  Sparkles,
  X,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskCompleteTick } from "@/components/tasks/TaskCompleteTick";
import { useNavigate } from "react-router-dom";
import { format, isPast, isToday, isTomorrow, addDays, subDays, formatDistanceToNow } from "date-fns";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { AlertItemsDialog, AlertType } from "@/components/dashboard/AlertItemsDialog";
import { WelcomeWizard } from "@/components/dashboard/WelcomeWizard";
import { mockMemos } from "@/data/mockMemos";
import { mockTasks } from "@/data/mockTasks";
import { startOfDay, isBefore } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryIntelligencePanel } from "@/components/stock/InventoryIntelligencePanel";
import { PracticeHealthHeader } from "@/components/dashboard/PracticeHealthHeader";
import { CriticalAlertsStrip } from "@/components/dashboard/CriticalAlertsStrip";
import { KpiStrip } from "@/components/dashboard/KpiStrip";
import { KpiTrackerPanel } from "@/components/kpi/KpiTrackerPanel";
import { TasksPerformancePanel } from "@/components/dashboard/TasksPerformancePanel";
import { ChecklistsPerformancePanel } from "@/components/dashboard/ChecklistsPerformancePanel";
import { StockExpiryPanel } from "@/components/dashboard/StockExpiryPanel";
import { StaffCompliancePanel } from "@/components/dashboard/StaffCompliancePanel";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { InviteFriendCard } from "@/components/dashboard/InviteFriendCard";
import { WeeklyReportsPanel } from "@/components/dashboard/WeeklyReportsPanel";
import type { Period } from "@/utils/dashboardMetrics";

// ── Greeting ──
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// ── Task metrics ──
function getTaskMetrics() {
  const today = startOfDay(new Date());
  const completed = mockTasks.filter((t) => t.completed).length;
  const overdue = mockTasks.filter((t) => !t.completed && isBefore(startOfDay(t.dueDate), today)).length;
  const inProgress = mockTasks.filter((t) => !t.completed && !isBefore(startOfDay(t.dueDate), today)).length;
  return { completed, overdue, inProgress, total: mockTasks.length };
}

// ── Mock assignments ──
const myTasks = [
  { id: "1", title: "Review staff credentials", dueDate: new Date(), category: "Staff" },
  { id: "2", title: "Approve leave requests", dueDate: new Date(), category: "HR" },
  { id: "3", title: "Submit weekly report", dueDate: addDays(new Date(), 1), category: "Reporting" },
  { id: "4", title: "Schedule compliance training", dueDate: addDays(new Date(), 3), category: "Compliance" },
  { id: "5", title: "Call insurance provider", dueDate: subDays(new Date(), 1), category: "Admin" },
];

const myChecklists = [
  { id: "cl-1", title: "Morning Opening Procedures", done: 6, total: 15, due: "09:00" },
  { id: "cl-2", title: "End of Day Closing", done: 0, total: 7 },
  { id: "cl-3", title: "Weekly Medication Audit", done: 0, total: 6 },
];

function formatDue(date: Date) {
  if (isPast(date) && !isToday(date)) return { text: "Overdue", urgent: true, overdue: true };
  if (isToday(date)) return { text: "Today", urgent: true, overdue: false };
  if (isTomorrow(date)) return { text: "Tomorrow", urgent: false, overdue: false };
  return { text: format(date, "MMM d"), urgent: false, overdue: false };
}

// ── Dashboard ──
const Dashboard = () => {
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [selectedAlertType, setSelectedAlertType] = useState<AlertType | null>(null);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);
  const [period, setPeriod] = useState<Period>("7d");
  const [activeTab, setActiveTab] = useState<"practice" | "my" | "kpi" | "inventory" | "reports">("practice");

  useEffect(() => {
    const seen = localStorage.getItem("admin_welcome_seen");
    if (!seen) setShowWelcome(true);
  }, []);

  const taskMetrics = getTaskMetrics();
  const completionPct = Math.round((taskMetrics.completed / taskMetrics.total) * 100);

  const handleAlertClick = (type: AlertType) => {
    setSelectedAlertType(type);
    setAlertDialogOpen(true);
  };

  const pendingTasks = myTasks.filter((t) => !completedTasks.includes(t.id));

  // Metrics data
  const metrics = [
    {
      label: "Tasks",
      value: taskMetrics.total,
      sub: `${taskMetrics.completed} completed`,
      icon: ClipboardList,
      color: "text-primary",
      bg: "bg-primary/8",
      trend: completionPct,
      onClick: () => navigate("/tasks"),
    },
    {
      label: "Compliance",
      value: "63%",
      sub: "1 expired item",
      icon: ShieldCheck,
      color: "text-warning",
      bg: "bg-warning/8",
      trend: -5,
      onClick: () => navigate("/compliance"),
    },
    {
      label: "Checklists",
      value: "75%",
      sub: "18/24 completed today",
      icon: CheckSquare,
      color: "text-success",
      bg: "bg-success/8",
      trend: 5,
      onClick: () => navigate("/checklists"),
    },
    {
      label: "Stock Health",
      value: "91%",
      sub: "3 items expiring",
      icon: Package,
      color: "text-accent",
      bg: "bg-accent/8",
      trend: -2,
      onClick: () => navigate("/stock"),
    },
  ];

  // Alerts
  const alerts = [
    { label: "Expired Items", count: 1, severity: "critical" as const, type: "expired" as AlertType },
    { label: "Expiring Soon", count: 5, severity: "warning" as const, type: "expiring" as AlertType },
    { label: "Overdue Tasks", count: taskMetrics.overdue, severity: "warning" as const, type: "overdue-tasks" as AlertType },
    { label: "Stock Alerts", count: 3, severity: "info" as const, type: "stock-alerts" as AlertType },
  ];

  const criticalCount = alerts.filter((a) => a.severity === "critical").reduce((s, a) => s + a.count, 0);

  // Insights
  const allInsights = [
    { id: "i1", title: "Fire Safety Inspection expired 9 days ago", severity: "high" as const, category: "Compliance" },
    { id: "i2", title: "Task completion rate dropped 15% this fortnight", severity: "medium" as const, category: "Tasks" },
    { id: "i3", title: "3 vaccines expiring within 60 days", severity: "medium" as const, category: "Stock" },
  ];
  const insights = allInsights.filter((i) => !dismissedInsights.includes(i.id));

  // Recent memos
  const recentMemos = [...mockMemos]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // Quick actions
  const quickActions = [
    { label: "Add Staff", icon: UserPlus, path: "/staff" },
    { label: "Create Task", icon: Plus, path: "/tasks" },
    { label: "New Checklist", icon: CheckSquare, path: "/checklists" },
    { label: "Post Memo", icon: FileText, path: "/memos" },
    { label: "View Roster", icon: Calendar, path: "/roster" },
    { label: "Stock", icon: Package, path: "/stock" },
  ];

  return (
    <AdminLayout>
      <WelcomeWizard open={showWelcome} onClose={() => { setShowWelcome(false); localStorage.setItem("admin_welcome_seen", "true"); }} />
      
      <MobileHeader title="Dashboard" subtitle="What needs attention today" />

      {/* Desktop Header */}
      <header className="hidden md:flex min-h-[64px] bg-card border-b px-10 items-center justify-between sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{getGreeting()}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {format(new Date(), "EEEE, d MMMM yyyy")}
          </p>
        </div>
      </header>

      <div className="p-4 md:px-8 md:py-6 max-w-4xl mx-auto space-y-6">

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "practice" | "my" | "kpi" | "inventory" | "reports")}>
          <TabsList className="grid w-full max-w-3xl grid-cols-5 rounded-lg">
            <TabsTrigger value="practice" className="rounded-lg text-xs">Practice Dashboard</TabsTrigger>
            <TabsTrigger value="my" className="rounded-lg text-xs">My Dashboard</TabsTrigger>
            <TabsTrigger value="kpi" className="rounded-lg text-xs">KPI Tracker</TabsTrigger>
            <TabsTrigger value="inventory" className="rounded-lg text-xs">Inventory</TabsTrigger>
            <TabsTrigger value="reports" className="rounded-lg text-xs">Reports</TabsTrigger>
          </TabsList>

          {/* ═══ PRACTICE DASHBOARD ═══ */}
          <TabsContent value="practice" className="space-y-6 mt-6">
            <InviteFriendCard />
            <PracticeHealthHeader period={period} onPeriodChange={setPeriod} />
            <CriticalAlertsStrip period={period} />
            <KpiStrip period={period} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TasksPerformancePanel period={period} />
              <ChecklistsPerformancePanel period={period} />
              <StockExpiryPanel period={period} />
              <StaffCompliancePanel period={period} />
            </div>
            <ActivityFeed />
          </TabsContent>

          {/* ═══ MY DASHBOARD (existing personal content) ═══ */}
          <TabsContent value="my" className="space-y-6 mt-6">
            <KpiTrackerPanel title="My KPI tracking" showOwner={false} />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {metrics.map((m) => (
            <Card
              key={m.label}
              className="cursor-pointer hover:shadow-md transition-shadow border-border/60"
              onClick={m.onClick}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("p-2 rounded-lg", m.bg)}>
                    <m.icon className={cn("w-4 h-4", m.color)} />
                  </div>
                  {typeof m.trend === "number" && m.trend !== completionPct && (
                    <span className={cn(
                      "flex items-center gap-0.5 text-[11px] font-medium",
                      m.trend > 0 ? "text-success" : "text-destructive"
                    )}>
                      {m.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(m.trend)}%
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold tracking-tight">{m.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{m.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Alerts Strip ── */}
        {(criticalCount > 0 || insights.some(i => i.severity === "high")) && (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-destructive/20 bg-destructive/5">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
            <p className="text-sm flex-1">
              <span className="font-medium text-destructive">{criticalCount} critical</span>
              <span className="text-muted-foreground"> item{criticalCount !== 1 ? "s" : ""} need attention</span>
            </p>
            <Button variant="outline" size="sm" className="text-xs h-7 border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => handleAlertClick("expired")}>
              Review
            </Button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Main Column ── */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* My Tasks */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-muted-foreground" />
                  My Tasks
                  <Badge variant="secondary" className="text-[10px] ml-1">{pendingTasks.length}</Badge>
                </h3>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7 gap-1" onClick={() => navigate("/tasks")}>
                  All tasks <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
              <div className="space-y-1.5">
                {pendingTasks.slice(0, 5).map((task) => {
                  const due = formatDue(task.dueDate);
                  const checked = completedTasks.includes(task.id);
                  return (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-all",
                        checked && "opacity-50",
                        due.overdue && !checked && "bg-destructive/[0.03] border-destructive/15",
                        !due.overdue && !checked && "hover:bg-muted/40"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium truncate", checked && "line-through text-muted-foreground")}>{task.title}</p>
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 mt-0.5">{task.category}</Badge>
                      </div>
                      <Badge
                        variant={due.overdue ? "destructive" : due.urgent ? "outline" : "secondary"}
                        className={cn("text-[10px] shrink-0", due.urgent && !due.overdue && "border-warning text-warning")}
                      >
                        {due.overdue && <AlertCircle className="w-2.5 h-2.5 mr-0.5" />}
                        {due.text}
                      </Badge>
                      <TaskCompleteTick
                        completed={checked}
                        onToggle={() => setCompletedTasks((p) => p.includes(task.id) ? p.filter((id) => id !== task.id) : [...p, task.id])}
                      />
                    </div>
                  );
                })}
              </div>
            </section>

            {/* My Checklists */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-muted-foreground" />
                  My Checklists
                  <Badge variant="secondary" className="text-[10px] ml-1">{myChecklists.length}</Badge>
                </h3>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7 gap-1" onClick={() => navigate("/checklists")}>
                  All checklists <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
              <div className="space-y-1.5">
                {myChecklists.map((cl) => {
                  const pct = Math.round((cl.done / cl.total) * 100);
                  return (
                    <div key={cl.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => navigate("/checklists")}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{cl.title}</p>
                          {cl.due && (
                            <Badge variant="outline" className="text-[9px] gap-0.5 shrink-0">
                              <Clock className="w-2.5 h-2.5" />
                              {cl.due}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Progress value={pct} className="h-1.5 flex-1" />
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">{cl.done}/{cl.total}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Insights */}
            {insights.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold">Insights</h3>
                </div>
                <div className="space-y-2">
                  {insights.map((insight) => (
                    <div
                      key={insight.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border-l-2",
                        insight.severity === "high" && "border-l-destructive bg-destructive/[0.03]",
                        insight.severity === "medium" && "border-l-warning bg-warning/[0.03]"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[9px]">{insight.category}</Badge>
                        </div>
                        <p className="text-sm mt-1">{insight.title}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                        onClick={() => setDismissedInsights((p) => [...p, insight.id])}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="lg:w-[300px] shrink-0 space-y-6">
            
            {/* Quick Actions */}
            <section>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h3>
              <div className="grid grid-cols-3 gap-2">
                {quickActions.map((a) => (
                  <button
                    key={a.label}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border/60 bg-card hover:bg-muted/50 transition-colors text-center"
                    onClick={() => navigate(a.path)}
                  >
                    <a.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[10px] font-medium text-muted-foreground leading-tight">{a.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Alerts */}
            <section>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-destructive/70" />
                Alerts
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {alerts.map((alert) => (
                  <button
                    key={alert.label}
                    className={cn(
                      "p-3 rounded-lg border text-left transition-colors",
                      alert.severity === "critical" && "hover:bg-destructive/5",
                      alert.severity === "warning" && "hover:bg-warning/5",
                      alert.severity === "info" && "hover:bg-primary/5"
                    )}
                    onClick={() => handleAlertClick(alert.type)}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        alert.severity === "critical" && "bg-destructive",
                        alert.severity === "warning" && "bg-warning",
                        alert.severity === "info" && "bg-primary"
                      )} />
                      <span className="text-[10px] text-muted-foreground font-medium">{alert.label}</span>
                    </div>
                    <p className={cn(
                      "text-xl font-bold",
                      alert.severity === "critical" && "text-destructive",
                      alert.severity === "warning" && "text-warning",
                      alert.severity === "info" && "text-primary"
                    )}>{alert.count}</p>
                  </button>
                ))}
              </div>
            </section>

            {/* Recent Memos */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Newspaper className="w-3 h-3 text-primary" />
                  Memos & News
                </h3>
                <Button variant="ghost" size="sm" className="text-[10px] text-muted-foreground h-6 px-1.5 gap-0.5" onClick={() => navigate("/memos")}>
                  View all <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
              <div className="space-y-1">
                {recentMemos.map((memo) => {
                  const isNew = Date.now() - new Date(memo.createdAt).getTime() < 86400000;
                  return (
                    <div
                      key={memo.id}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-muted/40 cursor-pointer transition-colors"
                      onClick={() => navigate("/memos")}
                    >
                      <div className="pt-1 w-2 shrink-0">
                        {(memo.mandatoryRead || isNew) && (
                          <span className={cn(
                            "block w-1.5 h-1.5 rounded-full",
                            memo.mandatoryRead ? "bg-destructive" : "bg-primary"
                          )} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium line-clamp-2 leading-snug">{memo.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(memo.createdAt, { addSuffix: true })}</span>
                          {memo.mandatoryRead && <span className="text-[10px] font-medium text-destructive">Required</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Task Completion Overview */}
            <section>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Task Completion</h3>
              <Card className="border-border/60">
                <CardContent className="p-4">
                  <div className="flex items-end justify-between mb-2">
                    <p className="text-3xl font-bold tracking-tight">{completionPct}%</p>
                    <span className="text-[11px] text-muted-foreground">{taskMetrics.completed}/{taskMetrics.total} tasks</span>
                  </div>
                  <Progress value={completionPct} className="h-2" />
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t">
                    <div className="text-center">
                      <p className="text-sm font-semibold text-success">{taskMetrics.completed}</p>
                      <p className="text-[9px] text-muted-foreground">Done</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-primary">{taskMetrics.inProgress}</p>
                      <p className="text-[9px] text-muted-foreground">Active</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-destructive">{taskMetrics.overdue}</p>
                      <p className="text-[9px] text-muted-foreground">Overdue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
          </TabsContent>

          {/* ═══ INVENTORY ═══ */}
          <TabsContent value="kpi" className="space-y-6 mt-6">
            <KpiTrackerPanel title="Team KPI tracker" />
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6 mt-6">
            <InventoryIntelligencePanel />
          </TabsContent>

          {/* ═══ REPORTS ═══ */}
          <TabsContent value="reports" className="space-y-6 mt-6">
            <WeeklyReportsPanel />
          </TabsContent>
        </Tabs>
      </div>

      <AlertItemsDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen} alertType={selectedAlertType} />
    </AdminLayout>
  );
};

export default Dashboard;
