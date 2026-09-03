import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckSquare,
  ClipboardList,
  Shield,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  BarChart3,
  ExternalLink,
} from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { mockTasks } from "@/data/mockTasks";
import { mockChecklistSubmissions } from "@/data/mockChecklistSubmissions";
import { mockComplianceItems } from "@/data/mockCompliance";
import { StaffMember } from "@/types/staff";

interface StaffProfileActivityProps {
  staff: StaffMember;
}

export function StaffProfileActivity({ staff }: StaffProfileActivityProps) {
  const navigate = useNavigate();
  const fullName = `${staff.firstName} ${staff.lastName}`;

  // === Tasks ===
  const assignedTasks = useMemo(
    () => mockTasks.filter((t) => t.assignee === fullName),
    [fullName]
  );
  const completedTasks = assignedTasks.filter((t) => t.completed);
  const pendingTasks = assignedTasks.filter((t) => !t.completed);
  const overdueTasks = pendingTasks.filter(
    (t) => isPast(t.dueDate) && !isToday(t.dueDate)
  );
  const taskCompletionRate =
    assignedTasks.length > 0
      ? Math.round((completedTasks.length / assignedTasks.length) * 100)
      : 0;

  // === Checklist Submissions ===
  const submissions = useMemo(
    () => mockChecklistSubmissions.filter((s) => s.submittedBy === fullName),
    [fullName]
  );
  const avgChecklistCompletion =
    submissions.length > 0
      ? Math.round(
          submissions.reduce((sum, s) => sum + s.completionPercentage, 0) /
            submissions.length
        )
      : 0;
  const perfectSubmissions = submissions.filter(
    (s) => s.completionPercentage === 100
  );

  // === Compliance Items ===
  const complianceItems = useMemo(
    () => mockComplianceItems.filter((c) => c.assignee === fullName),
    [fullName]
  );
  const validCompliance = complianceItems.filter((c) => c.status === "valid");
  const expiringCompliance = complianceItems.filter(
    (c) => c.status === "expiring"
  );
  const expiredCompliance = complianceItems.filter(
    (c) => c.status === "expired"
  );

  return (
    <div className="space-y-4">
      {/* Performance Overview */}
      <h3 className="text-[15px] font-semibold flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-muted-foreground" />
        Activity & Performance
      </h3>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Task Completion"
          value={`${taskCompletionRate}%`}
          sub={`${completedTasks.length}/${assignedTasks.length} tasks`}
          progress={taskCompletionRate}
          icon={CheckSquare}
        />
        <StatCard
          label="Checklist Avg"
          value={`${avgChecklistCompletion}%`}
          sub={`${submissions.length} submissions`}
          progress={avgChecklistCompletion}
          icon={ClipboardList}
        />
        <StatCard
          label="Overdue Tasks"
          value={`${overdueTasks.length}`}
          sub={overdueTasks.length > 0 ? "Needs attention" : "All on track"}
          icon={AlertTriangle}
          alert={overdueTasks.length > 0}
        />
        <StatCard
          label="Compliance"
          value={
            complianceItems.length > 0
              ? `${validCompliance.length}/${complianceItems.length}`
              : "—"
          }
          sub={
            expiredCompliance.length > 0
              ? `${expiredCompliance.length} expired`
              : complianceItems.length > 0
              ? "All valid"
              : "No items"
          }
          icon={Shield}
          alert={expiredCompliance.length > 0}
        />
      </div>

      {/* Assigned Tasks */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[14px] flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-muted-foreground" />
              Assigned Tasks
              <Badge variant="secondary" className="text-[11px]">
                {assignedTasks.length}
              </Badge>
            </CardTitle>
            <button
              onClick={() => navigate("/tasks")}
              className="text-[11px] text-primary hover:underline flex items-center gap-1"
            >
              View all <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {assignedTasks.length === 0 ? (
            <p className="text-[12px] text-muted-foreground italic">
              No tasks assigned
            </p>
          ) : (
            <div className="space-y-2">
              {assignedTasks.map((task) => {
                const isOverdue =
                  !task.completed &&
                  isPast(task.dueDate) &&
                  !isToday(task.dueDate);
                return (
                  <div
                    key={task.id}
                    onClick={() => navigate("/tasks")}
                    className="flex items-center gap-3 text-[13px] py-1.5 border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1 transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                    ) : isOverdue ? (
                      <XCircle className="w-4 h-4 text-destructive shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                    <span
                      className={`flex-1 ${
                        task.completed
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      {task.title}
                    </span>
                    {task.important && (
                      <Badge
                        variant="destructive"
                        className="text-[10px] px-1.5 py-0"
                      >
                        Critical
                      </Badge>
                    )}
                    <span
                      className={`text-[11px] shrink-0 ${
                        isOverdue
                          ? "text-destructive font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {format(task.dueDate, "MMM d")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Checklist Submissions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[14px] flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-muted-foreground" />
              Checklist Submissions
              <Badge variant="secondary" className="text-[11px]">
                {submissions.length}
              </Badge>
            </CardTitle>
            <button
              onClick={() => navigate("/checklists")}
              className="text-[11px] text-primary hover:underline flex items-center gap-1"
            >
              View all <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p className="text-[12px] text-muted-foreground italic">
              No submissions
            </p>
          ) : (
            <div className="space-y-2">
              {submissions.slice(0, 10).map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => navigate(`/checklists/${sub.checklistId}`)}
                  className="flex items-center gap-3 text-[13px] py-1.5 border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">
                      {sub.checklistTitle}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {format(sub.submittedAt, "MMM d, h:mm a")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Progress
                      value={sub.completionPercentage}
                      className="w-16 h-1.5"
                    />
                    <span
                      className={`text-[11px] font-medium w-8 text-right ${
                        sub.completionPercentage === 100
                          ? "text-success"
                          : sub.completionPercentage >= 80
                          ? "text-foreground"
                          : "text-destructive"
                      }`}
                    >
                      {sub.completionPercentage}%
                    </span>
                  </div>
                </div>
              ))}
              {submissions.length > 10 && (
                <p className="text-[11px] text-muted-foreground text-center pt-1">
                  +{submissions.length - 10} more submissions
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance Items */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[14px] flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              Compliance Items
              <Badge variant="secondary" className="text-[11px]">
                {complianceItems.length}
              </Badge>
            </CardTitle>
            <button
              onClick={() => navigate("/compliance")}
              className="text-[11px] text-primary hover:underline flex items-center gap-1"
            >
              View all <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {complianceItems.length === 0 ? (
            <p className="text-[12px] text-muted-foreground italic">
              No compliance items assigned
            </p>
          ) : (
            <div className="space-y-2">
              {complianceItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/compliance/${item.categoryId}`)}
                  className="flex items-center gap-3 text-[13px] py-1.5 border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {item.categoryName}
                    </p>
                  </div>
                  <Badge
                    variant={
                      item.status === "valid"
                        ? "secondary"
                        : item.status === "expiring"
                        ? "outline"
                        : "destructive"
                    }
                    className="text-[10px] shrink-0"
                  >
                    {item.status === "valid"
                      ? "Valid"
                      : item.status === "expiring"
                      ? "Expiring"
                      : "Expired"}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {format(item.expiryDate, "MMM d, yyyy")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Small stat card component
function StatCard({
  label,
  value,
  sub,
  progress,
  icon: Icon,
  alert,
}: {
  label: string;
  value: string;
  sub: string;
  progress?: number;
  icon: React.ComponentType<{ className?: string }>;
  alert?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon
            className={`w-4 h-4 ${
              alert ? "text-destructive" : "text-muted-foreground"
            }`}
          />
          <span className="text-[11px] text-muted-foreground">{label}</span>
        </div>
        <p
          className={`text-xl font-bold ${
            alert ? "text-destructive" : "text-foreground"
          }`}
        >
          {value}
        </p>
        {progress !== undefined && (
          <Progress value={progress} className="h-1.5 mt-2 mb-1" />
        )}
        <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}
