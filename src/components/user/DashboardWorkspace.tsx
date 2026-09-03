import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckSquare,
  ClipboardList,
  Newspaper,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Check,
  ChevronRight,
  ChevronLeft,
  User,
  FileText,
  Bell,
  Megaphone,
  AlertCircle,
  Plus,
  AlertTriangle,
  Hash,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { mockChecklists } from "@/data/mockChecklists";
import { mockTasks } from "@/data/mockTasks";
import { mockMemos } from "@/data/mockMemos";
import { Checklist, ChecklistItem } from "@/types/checklists";
import { Task } from "@/types/tasks";
import { Memo } from "@/types/memos";
import { format, formatDistanceToNow, isToday, isTomorrow, isPast, addDays, subDays, startOfWeek, endOfWeek } from "date-fns";
import { getDepartmentById, DEFAULT_DEPARTMENTS } from "@/types/departments";
import { CommunicationBookFeed } from "@/components/user/CommunicationBookFeed";
import { CreateUserTaskDialog } from "@/components/user/CreateUserTaskDialog";
import { KpiTrackerPanel } from "@/components/kpi/KpiTrackerPanel";

export function DashboardWorkspace() {
  const { currentUser } = useUser();
  
  // State for checklists
  const [checklists, setChecklists] = useState<Checklist[]>(mockChecklists);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  
  // State for tasks
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskNote, setTaskNote] = useState("");
  const [showCreateTask, setShowCreateTask] = useState(false);
  
  // State for memos
  const [memos, setMemos] = useState<Memo[]>(mockMemos);
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  

  if (!currentUser) return null;

  // Filter data for current user
  const userChecklists = checklists.filter((checklist) => {
    if (checklist.assignment?.type === "all") return true;
    if (checklist.assignment?.type === "department") {
      return checklist.assignment.departmentIds?.includes(currentUser.departmentId);
    }
    if (checklist.assignment?.type === "users") {
      return checklist.assignment.userIds?.includes(currentUser.id);
    }
    return checklist.categoryId === currentUser.departmentId;
  }).slice(0, 3);

  const userTasks = tasks.filter(
    (task) =>
      task.assignee.toLowerCase().includes(currentUser.firstName.toLowerCase()) ||
      task.assignee.toLowerCase().includes(currentUser.lastName.toLowerCase())
  ).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  }).slice(0, 6);

  const userMemos = memos.filter((memo) => {
    if (memo.targetDepartments.length === 0) return true;
    return memo.targetDepartments.includes(currentUser.departmentId);
  }).sort((a, b) => {
    const aRead = a.readBy.some((r) => r.userId === currentUser.id);
    const bRead = b.readBy.some((r) => r.userId === currentUser.id);
    if (aRead !== bRead) return aRead ? 1 : -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }).slice(0, 4);

  // Checklist handlers
  const handleToggleChecklistItem = (checklistId: string, itemId: string) => {
    setChecklists((prev) =>
      prev.map((checklist) =>
        checklist.id === checklistId
          ? {
              ...checklist,
              items: checklist.items.map((item) =>
                item.id === itemId && item.type === "tick"
                  ? {
                      ...item,
                      completed: !item.completed,
                      completedAt: !item.completed ? new Date() : undefined,
                      completedBy: !item.completed ? currentUser.firstName : undefined,
                    }
                  : item
              ),
            }
          : checklist
      )
    );
  };

  const handleYesNoChange = (checklistId: string, itemId: string, value: "yes" | "no") => {
    setChecklists((prev) =>
      prev.map((checklist) =>
        checklist.id === checklistId
          ? {
              ...checklist,
              items: checklist.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      yesNoValue: item.yesNoValue === value ? null : value,
                      completed: item.yesNoValue === value ? false : true,
                      completedAt: item.yesNoValue === value ? undefined : new Date(),
                      completedBy: item.yesNoValue === value ? undefined : currentUser.firstName,
                    }
                  : item
              ),
            }
          : checklist
      )
    );
  };

  const handleNumberChange = (checklistId: string, itemId: string, value: string) => {
    setChecklists((prev) =>
      prev.map((checklist) =>
        checklist.id === checklistId
          ? {
              ...checklist,
              items: checklist.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      numberValue: value,
                      completed: value.trim() !== "",
                      completedAt: value.trim() !== "" ? new Date() : undefined,
                      completedBy: value.trim() !== "" ? currentUser.firstName : undefined,
                    }
                  : item
              ),
            }
          : checklist
      )
    );
  };

  const getChecklistProgress = (checklist: Checklist) => {
    const completed = checklist.items.filter((item) => item.completed).length;
    return { completed, total: checklist.items.length, percentage: (completed / checklist.items.length) * 100 };
  };

  const hasCriticalIncomplete = (checklist: Checklist) => {
    return checklist.items.some(item => item.critical && !item.completed);
  };

  // Task handlers
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task
      )
    );
    const task = tasks.find((t) => t.id === taskId);
    if (task && !task.completed) {
      toast.success("Task completed!");
    }
  };

  const handleCompleteTaskWithNote = () => {
    if (selectedTask) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === selectedTask.id
            ? { ...task, completed: true }
            : task
        )
      );
      toast.success("Task completed!");
      setSelectedTask(null);
      setTaskNote("");
    }
  };

  const handleCreateTask = (taskData: { title: string; description: string; priority: string; dueDate: Date; assignee: string }) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskData.title,
      description: taskData.description,
      dueDate: taskData.dueDate,
      assignee: taskData.assignee,
      completed: false,
      important: taskData.priority === "high" || taskData.priority === "urgent",
      createdAt: new Date(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  // Memo handlers
  const isMemoRead = (memo: Memo) => memo.readBy.some((r) => r.userId === currentUser.id);

  const handleMarkMemoRead = (memoId: string) => {
    setMemos((prev) =>
      prev.map((memo) =>
        memo.id === memoId
          ? {
              ...memo,
              readBy: [
                ...memo.readBy,
                {
                  userId: currentUser.id,
                  userName: `${currentUser.firstName} ${currentUser.lastName}`,
                  readAt: new Date(),
                },
              ],
            }
          : memo
      )
    );
    toast.success("Marked as read");
  };

  const getMemoIcon = (type: Memo["type"]) => {
    switch (type) {
      case "policy": return <FileText className="w-4 h-4" />;
      case "news": return <Newspaper className="w-4 h-4" />;
      case "announcement": return <Megaphone className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  // Stats
  const stats = {
    tasks: userTasks.length,
    tasksPending: userTasks.filter(t => !t.completed).length,
    tasksCompleted: userTasks.filter(t => t.completed).length,
    unreadMemos: userMemos.filter(m => !isMemoRead(m)).length,
  };

  return (
    <div className="space-y-5">
      {/* My KPI tracking */}
      <KpiTrackerPanel
        memberId={currentUser?.id}
        title="My KPI tracking"
        emptyMessage="No KPIs have been set for you yet."
        showOwner={false}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Tasks</p>
            <p className="text-2xl font-bold mt-1">{stats.tasks}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Pending</p>
            <p className="text-2xl font-bold mt-1 text-warning">{stats.tasksPending}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Completed</p>
            <p className="text-2xl font-bold mt-1 text-primary">{stats.tasksCompleted}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Unread Memos</p>
            <p className="text-2xl font-bold mt-1 text-destructive">{stats.unreadMemos}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tasks Section */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3 px-4 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-primary" />
                Active Tasks
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {stats.tasksPending} pending
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setShowCreateTask(true)}
                >
                  <Plus className="w-3 h-3" />
                  New
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="space-y-1">
              {userTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0"
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleToggleTask(task.id)}
                    className="shrink-0"
                  />
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => !task.completed && setSelectedTask(task)}
                  >
                    <p className={cn(
                      "text-sm font-medium truncate",
                      task.completed && "line-through text-muted-foreground"
                    )}>
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{task.assignee}</p>
                  </div>
                  <div className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    task.completed ? "bg-success" : 
                    isPast(task.dueDate) && !isToday(task.dueDate) ? "bg-destructive" :
                    "bg-primary"
                  )} />
                </div>
              ))}
              {userTasks.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No tasks assigned</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 gap-1.5"
                    onClick={() => setShowCreateTask(true)}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create a task
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Checklists Section */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-primary" />
              My Checklists
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="space-y-3">
              {userChecklists.map((checklist) => {
                const prog = getChecklistProgress(checklist);
                return (
                  <div
                    key={checklist.id}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-all",
                      prog.percentage === 100
                        ? "bg-success/5 border-success/30"
                        : "bg-muted/30 border-border hover:border-primary/50"
                    )}
                    onClick={() => setSelectedChecklist(checklist)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {prog.percentage === 100 ? (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="text-sm font-medium">{checklist.title}</span>
                      </div>
                      <span className="text-xs font-medium">
                        {prog.completed}/{prog.total}
                      </span>
                    </div>
                    <Progress 
                      value={prog.percentage} 
                      className={cn("h-1.5", prog.percentage === 100 && "[&>div]:bg-success")}
                    />
                  </div>
                );
              })}
              {userChecklists.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No checklists assigned</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Memos Section */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3 px-4 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-primary" />
                Memos & News
              </CardTitle>
              {stats.unreadMemos > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {stats.unreadMemos} unread
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="space-y-2">
              {userMemos.map((memo) => {
                const read = isMemoRead(memo);
                return (
                  <div
                    key={memo.id}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-all",
                      read
                        ? "bg-card border-border"
                        : "bg-primary/5 border-primary/30 hover:border-primary/50"
                    )}
                    onClick={() => setSelectedMemo(memo)}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={cn(
                        "p-1.5 rounded-lg shrink-0",
                        read ? "bg-muted" : memo.mandatoryRead ? "bg-destructive/10" : "bg-primary/10"
                      )}>
                        {getMemoIcon(memo.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className={cn(
                            "text-sm font-medium line-clamp-1 flex-1",
                            !read && "font-semibold"
                          )}>
                            {memo.title}
                          </h4>
                          {!read && (
                            <span className={cn(
                              "w-2 h-2 rounded-full shrink-0",
                              memo.mandatoryRead ? "bg-destructive" : "bg-primary"
                            )} />
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {memo.content}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(memo.createdAt, { addSuffix: true })}
                          </span>
                          {!read ? (
                            <Button
                              variant={memo.mandatoryRead ? "destructive" : "outline"}
                              size="sm"
                              className="h-6 text-[10px] px-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkMemoRead(memo.id);
                              }}
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              {memo.mandatoryRead ? "Acknowledge" : "Mark Read"}
                            </Button>
                          ) : (
                            <Badge variant="secondary" className="text-[9px] h-5 bg-success/10 text-success">
                              <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                              Read
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {userMemos.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No memos</p>
              )}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Communication Book Section */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3 px-4 pt-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Communication Book
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <CommunicationBookFeed compact />
        </CardContent>
      </Card>

      {/* Create Task Dialog */}
      <CreateUserTaskDialog
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
        onCreateTask={handleCreateTask}
      />

      {/* Checklist Detail Dialog */}
      <Dialog open={!!selectedChecklist} onOpenChange={(open) => !open && setSelectedChecklist(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-0" aria-describedby={undefined}>
          <DialogHeader className="p-6 pb-3 border-b shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" />
              {selectedChecklist?.title}
            </DialogTitle>
            {selectedChecklist && (
              <>
                <div className="flex items-center gap-2 mt-2">
                  <Progress 
                    value={getChecklistProgress(checklists.find(c => c.id === selectedChecklist.id) || selectedChecklist).percentage} 
                    className="flex-1 h-2"
                  />
                  <span className="text-sm font-medium text-muted-foreground">
                    {getChecklistProgress(checklists.find(c => c.id === selectedChecklist.id) || selectedChecklist).completed}/
                    {getChecklistProgress(checklists.find(c => c.id === selectedChecklist.id) || selectedChecklist).total}
                  </span>
                </div>
                {hasCriticalIncomplete(checklists.find(c => c.id === selectedChecklist.id) || selectedChecklist) && (
                  <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-destructive/10 border border-destructive/30">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <span className="text-xs text-destructive font-medium">Critical items require attention</span>
                  </div>
                )}
              </>
            )}
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto min-h-0 px-6">
            <div className="space-y-2 py-3">
              {(checklists.find(c => c.id === selectedChecklist?.id) || selectedChecklist)?.items.map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    "p-3 rounded-lg border transition-all",
                    item.completed
                      ? "bg-success/5 border-success/30"
                      : item.critical
                        ? "bg-destructive/5 border-destructive/30"
                        : "bg-card border-border"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                      <span className="text-xs text-muted-foreground font-mono w-5 text-center">{index + 1}</span>
                      {item.critical && (
                        <AlertTriangle className={cn(
                          "w-3.5 h-3.5",
                          item.completed ? "text-muted-foreground" : "text-destructive"
                        )} />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm",
                        item.completed && "line-through text-muted-foreground"
                      )}>
                        {item.text}
                      </p>
                      {item.completed && item.completedBy && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                          <User className="w-2.5 h-2.5" />
                          {item.completedBy} • {item.completedAt && format(item.completedAt, "h:mm a")}
                        </p>
                      )}
                    </div>
                    
                    <div className="shrink-0">
                      {item.type === "tick" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (selectedChecklist) {
                              handleToggleChecklistItem(selectedChecklist.id, item.id);
                            }
                          }}
                          className={cn(
                            "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors",
                            item.completed
                              ? "bg-success border-success"
                              : "border-muted-foreground/30 hover:border-primary"
                          )}
                        >
                          {item.completed && <Check className="w-4 h-4 text-success-foreground" />}
                        </button>
                      )}
                      
                      {item.type === "yesno" && (
                        <div className="flex gap-1">
                          <Button
                            variant={item.yesNoValue === "yes" ? "default" : "outline"}
                            size="sm"
                            className={cn(
                              "h-7 px-2 text-xs",
                              item.yesNoValue === "yes" && "bg-success hover:bg-success/90"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (selectedChecklist) handleYesNoChange(selectedChecklist.id, item.id, "yes");
                            }}
                          >
                            Yes
                          </Button>
                          <Button
                            variant={item.yesNoValue === "no" ? "default" : "outline"}
                            size="sm"
                            className={cn(
                              "h-7 px-2 text-xs",
                              item.yesNoValue === "no" && "bg-destructive hover:bg-destructive/90"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (selectedChecklist) handleYesNoChange(selectedChecklist.id, item.id, "no");
                            }}
                          >
                            No
                          </Button>
                        </div>
                      )}
                      
                      {item.type === "number" && (
                        <div className="flex items-center gap-1">
                          <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                          <Input
                            type="number"
                            value={item.numberValue || ""}
                            onChange={(e) => {
                              if (selectedChecklist) handleNumberChange(selectedChecklist.id, item.id, e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-20 h-7 text-xs"
                            placeholder="Enter"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t p-6 pt-4 flex justify-end gap-2 shrink-0">
            <Button variant="outline" onClick={() => setSelectedChecklist(null)}>Close</Button>
            {selectedChecklist && getChecklistProgress(checklists.find(c => c.id === selectedChecklist.id) || selectedChecklist).percentage === 100 && (
              <Button onClick={() => {
                toast.success("Checklist submitted!");
                setSelectedChecklist(null);
              }}>
                Submit Checklist
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Task Detail Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              Task Details
            </DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedTask.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Due: {format(selectedTask.dueDate, "EEEE, MMMM d, yyyy")}
                  </span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-muted/50 border">
                <label className="text-sm font-medium mb-2 block">Completion Note (Optional)</label>
                <Textarea
                  placeholder="Add any notes about completing this task..."
                  value={taskNote}
                  onChange={(e) => setTaskNote(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setSelectedTask(null)}>Cancel</Button>
            <Button onClick={handleCompleteTaskWithNote}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Mark Complete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Memo Detail Dialog */}
      <Dialog open={!!selectedMemo} onOpenChange={(open) => !open && setSelectedMemo(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col" aria-describedby={undefined}>
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                {selectedMemo && getMemoIcon(selectedMemo.type)}
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg">{selectedMemo?.title}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-[10px] capitalize">{selectedMemo?.type}</Badge>
                  {selectedMemo?.mandatoryRead && (
                    <Badge variant="destructive" className="text-[10px]">Mandatory</Badge>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>
          <ScrollArea className="flex-1">
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground p-3 rounded-lg bg-muted/50">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {selectedMemo?.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {selectedMemo && format(selectedMemo.createdAt, "MMM d, yyyy")}
                </span>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedMemo?.content}</p>
              </div>
              {selectedMemo && isMemoRead(selectedMemo) && (
                <div className="flex items-center gap-2 text-xs text-success p-3 rounded-lg bg-success/10 border border-success/30">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>You have read this memo</span>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="border-t pt-4 flex justify-end gap-2">
            {selectedMemo && !isMemoRead(selectedMemo) && (
              <Button
                variant={selectedMemo.mandatoryRead ? "destructive" : "default"}
                onClick={() => {
                  handleMarkMemoRead(selectedMemo.id);
                  setSelectedMemo(null);
                }}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {selectedMemo.mandatoryRead ? "I have read this memo" : "Mark as Read"}
              </Button>
            )}
            <Button variant="outline" onClick={() => setSelectedMemo(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
