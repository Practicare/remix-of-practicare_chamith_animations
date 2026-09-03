import { useState, useMemo, ComponentType, ReactNode } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ExportDropdown } from "@/components/ui/ExportDropdown";
import {
  Package, ClipboardList, CheckSquare, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, XCircle, Clock, BarChart3, Users,
  ArrowUpRight, ArrowDownRight, Minus,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend,
  AreaChart, Area,
} from "recharts";
import { downloadCSV, openPrintPDF, wrapPDFPage, exportTimestamp, exportSubtitleDate } from "@/utils/exportUtils";
import { toast } from "@/hooks/use-toast";

type ReportTab = "stock" | "tasks" | "checklists";

// --- Mock report data ---

const stockMonthlyData = [
  { month: "Jan", valid: 142, expiring: 18, expired: 5 },
  { month: "Feb", valid: 138, expiring: 22, expired: 8 },
  { month: "Mar", valid: 150, expiring: 15, expired: 3 },
  { month: "Apr", valid: 155, expiring: 12, expired: 2 },
  { month: "May", valid: 148, expiring: 20, expired: 6 },
  { month: "Jun", valid: 160, expiring: 10, expired: 1 },
];

const stockCategoryBreakdown = [
  { name: "Drug Cupboard", value: 45 },
  { name: "Consumables", value: 32 },
  { name: "Vaccines", value: 28 },
  { name: "Instruments", value: 20 },
  { name: "Emergency", value: 15 },
  { name: "Other", value: 12 },
];

const taskWeeklyData = [
  { week: "W1", created: 24, completed: 20, overdue: 4 },
  { week: "W2", created: 30, completed: 28, overdue: 2 },
  { week: "W3", created: 18, completed: 15, overdue: 3 },
  { week: "W4", created: 35, completed: 30, overdue: 5 },
];

const taskByDepartment = [
  { name: "Nursing", completed: 85, pending: 12, overdue: 3 },
  { name: "Admin", completed: 42, pending: 8, overdue: 1 },
  { name: "Reception", completed: 28, pending: 5, overdue: 2 },
  { name: "Lab", completed: 35, pending: 6, overdue: 0 },
];

const checklistCompletionData = [
  { month: "Jan", rate: 82 },
  { month: "Feb", rate: 87 },
  { month: "Mar", rate: 91 },
  { month: "Apr", rate: 88 },
  { month: "May", rate: 94 },
  { month: "Jun", rate: 96 },
];

const checklistByType = [
  { name: "Daily", total: 120, completed: 112, rate: 93 },
  { name: "Weekly", total: 48, completed: 42, rate: 88 },
  { name: "Monthly", total: 12, completed: 11, rate: 92 },
  { name: "Custom", total: 8, completed: 6, rate: 75 },
];

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--muted-foreground))",
];

const PIE_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#6b7280"];

function StatCard({ title, value, change, changeLabel, icon: Icon, trend }: {
  title: string; value: string | number; change?: number; changeLabel?: string;
  icon: typeof Package; trend?: "up" | "down" | "flat";
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 text-xs">
                {trend === "up" ? (
                  <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                ) : trend === "down" ? (
                  <ArrowDownRight className="w-3 h-3 text-destructive" />
                ) : (
                  <Minus className="w-3 h-3 text-muted-foreground" />
                )}
                <span className={trend === "up" ? "text-emerald-600" : trend === "down" ? "text-destructive" : "text-muted-foreground"}>
                  {change > 0 ? "+" : ""}{change}%
                </span>
                {changeLabel && <span className="text-muted-foreground">{changeLabel}</span>}
              </div>
            )}
          </div>
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StockReport() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Items" value={165} change={5} changeLabel="vs last month" icon={Package} trend="up" />
        <StatCard title="Valid Items" value={148} change={3} changeLabel="vs last month" icon={CheckCircle} trend="up" />
        <StatCard title="Expiring Soon" value={12} change={-8} changeLabel="vs last month" icon={AlertTriangle} trend="up" />
        <StatCard title="Expired" value={5} change={-40} changeLabel="vs last month" icon={XCircle} trend="up" />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Stock Status Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={stockMonthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <RechartsTooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="valid" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Valid" />
                <Area type="monotone" dataKey="expiring" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="Expiring" />
                <Area type="monotone" dataKey="expired" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Expired" />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Items by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={stockCategoryBreakdown} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {stockCategoryBreakdown.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TaskReport() {
  const totalCreated = taskWeeklyData.reduce((s, w) => s + w.created, 0);
  const totalCompleted = taskWeeklyData.reduce((s, w) => s + w.completed, 0);
  const totalOverdue = taskWeeklyData.reduce((s, w) => s + w.overdue, 0);
  const completionRate = Math.round((totalCompleted / totalCreated) * 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Tasks Created" value={totalCreated} change={12} changeLabel="vs last period" icon={ClipboardList} trend="up" />
        <StatCard title="Completed" value={totalCompleted} change={8} changeLabel="vs last period" icon={CheckCircle} trend="up" />
        <StatCard title="Completion Rate" value={`${completionRate}%`} change={3} changeLabel="vs last period" icon={TrendingUp} trend="up" />
        <StatCard title="Overdue" value={totalOverdue} change={-15} changeLabel="vs last period" icon={Clock} trend="up" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Weekly Task Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={taskWeeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="week" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <RechartsTooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" />
                <Bar dataKey="overdue" fill="#ef4444" radius={[4, 4, 0, 0]} name="Overdue" />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Tasks by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={taskByDepartment} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <RechartsTooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="completed" fill="#10b981" radius={[0, 4, 4, 0]} name="Completed" />
                <Bar dataKey="pending" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Pending" />
                <Bar dataKey="overdue" fill="#ef4444" radius={[0, 4, 4, 0]} name="Overdue" />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ChecklistReport() {
  const avgRate = Math.round(checklistCompletionData.reduce((s, d) => s + d.rate, 0) / checklistCompletionData.length);
  const totalChecklists = checklistByType.reduce((s, t) => s + t.total, 0);
  const totalCompleted = checklistByType.reduce((s, t) => s + t.completed, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Checklists" value={totalChecklists} change={6} changeLabel="vs last month" icon={CheckSquare} trend="up" />
        <StatCard title="Completed" value={totalCompleted} change={9} changeLabel="vs last month" icon={CheckCircle} trend="up" />
        <StatCard title="Avg Completion" value={`${avgRate}%`} change={4} changeLabel="vs last month" icon={TrendingUp} trend="up" />
        <StatCard title="Overdue" value={totalChecklists - totalCompleted} change={-20} changeLabel="vs last month" icon={AlertTriangle} trend="up" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Completion Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={checklistCompletionData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis domain={[70, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <RechartsTooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: "hsl(var(--primary))", r: 4 }} name="Completion %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Performance by Frequency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 pt-2">
              {checklistByType.map(type => (
                <div key={type.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{type.name}</span>
                    <span className="text-muted-foreground">{type.completed}/{type.total} ({type.rate}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${type.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Reports({ Layout = AdminLayout }: { Layout?: ComponentType<{ children: ReactNode }> }) {
  const [activeTab, setActiveTab] = useState<ReportTab>("stock");

  return (
    <Layout>
      <MobileHeader title="Reports" subtitle="Performance analytics" />

      {/* Mobile tabs */}
      <div className="md:hidden sticky top-[56px] z-20 bg-card px-4 pt-3 pb-3">
        <SegmentedControl
          options={[
            { id: "stock" as const, label: "Stock", icon: Package },
            { id: "tasks" as const, label: "Tasks", icon: ClipboardList },
            { id: "checklists" as const, label: "Checklists", icon: CheckSquare },
          ]}
          value={activeTab}
          onChange={(val) => setActiveTab(val as ReportTab)}
          size="sm"
          fullWidth
        />
      </div>

      {/* Mobile content */}
      <div className="md:hidden p-4 space-y-4">
        {activeTab === "stock" && <StockReport />}
        {activeTab === "tasks" && <TaskReport />}
        {activeTab === "checklists" && <ChecklistReport />}
      </div>

      {/* Desktop */}
      <PageHeader
        title="Reports"
        subtitle="Performance analytics across stock, tasks, and checklists"
        icon={BarChart3}
        actions={
          <ExportDropdown
            onExportCSV={() => toast({ title: "CSV Export", description: "Report data exported." })}
            onExportPDF={() => toast({ title: "PDF Export", description: "Report exported as PDF." })}
          />
        }
      />
      <div className="hidden md:block px-8 pt-4 max-w-5xl mx-auto">
        <SegmentedControl
          options={[
            { id: "stock" as const, label: "Stock Performance", icon: Package },
            { id: "tasks" as const, label: "Task Performance", icon: ClipboardList },
            { id: "checklists" as const, label: "Checklist Performance", icon: CheckSquare },
          ]}
          value={activeTab}
          onChange={(val) => setActiveTab(val as ReportTab)}
        />
      </div>

      <div className="hidden md:block px-8 py-6 max-w-5xl mx-auto">
        {activeTab === "stock" && <StockReport />}
        {activeTab === "tasks" && <TaskReport />}
        {activeTab === "checklists" && <ChecklistReport />}
      </div>
    </Layout>
  );
}
