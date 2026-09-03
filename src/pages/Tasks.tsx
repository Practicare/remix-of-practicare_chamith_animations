import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ExportDropdown } from "@/components/ui/ExportDropdown";
import {
  Bell,
  List,
  Kanban,
  LayoutGrid,
  ClipboardList,
  Plus,
  ListChecks,
  History,
  ListTodo,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { PageHeader } from "@/components/layout/PageHeader";

import { ComponentType, ReactNode } from "react";
import { mockTasks } from "@/data/mockTasks";
import { getStockIntakeTasks } from "@/data/stockIntakeStore";
import { getKpiGeneratedTasks } from "@/data/kpiStore";

import { Task } from "@/types/tasks";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskTable } from "@/components/tasks/TaskTable";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { CreateTodoListDialog } from "@/components/tasks/CreateTodoListDialog";
import { EditTaskDialog } from "@/components/tasks/EditTaskDialog";

import { TaskKanbanBoard } from "@/components/tasks/TaskKanbanBoard";
import { TaskBoard } from "@/components/tasks/TaskBoard";
import { TaskViewSelector, ViewMode } from "@/components/tasks/TaskViewSelector";
import { TaskHistoryFilters } from "@/components/tasks/TaskHistoryFilters";

import { isPast, isToday, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { toast } from "sonner";
import { exportTasksCSV, exportTasksPDF } from "@/utils/taskExport";
import { mockStaffMembers } from "@/data/mockStaff";
import { mockDepartments } from "@/data/mockDepartments";
import { PageIntro } from "@/components/layout/PageIntro";
import { TASKS_PRACTICE_TIPS } from "@/components/tasks/tasksPracticeTips";

const Tasks = ({ Layout = AdminLayout }: { Layout?: ComponentType<{ children: ReactNode }> }) => {
  const [tasks, setTasks] = useState<Task[]>(() => [...getKpiGeneratedTasks(), ...getStockIntakeTasks(), ...mockTasks]);
  const [searchQuery, setSearchQuery] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  // View state
  const [displayMode, setDisplayMode] = useState<"list" | "cards" | "board">("list");
  const [statusFilter, setStatusFilter] = useState<"today" | "all" | "pending" | "overdue">("all");
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [customDateRange, setCustomDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  const [desktopTab, setDesktopTab] = useState<"creation" | "library" | "history">("library");
  const [mobileTab, setMobileTab] = useState<"creation" | "library" | "history">("library");
  const [createType, setCreateType] = useState<"task" | "todo">("task");
  
  // Edit task state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // History filters
  const [historyDateRange, setHistoryDateRange] = useState<{ start: Date | undefined; end: Date | undefined }>({ start: undefined, end: undefined });
  const [historyDeptFilter, setHistoryDeptFilter] = useState("");
  const [historyUserFilter, setHistoryUserFilter] = useState("");

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (
        searchQuery &&
        !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !task.assignee.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (assigneeFilter && task.assignee !== assigneeFilter) {
        return false;
      }
      return true;
    });
  }, [tasks, searchQuery, assigneeFilter]);

  const handleToggleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  const handleToggleImportant = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, important: !task.important } : task
      )
    );
    toast.success("Task updated");
  };

  const handleCreateTask = (newTask: Omit<Task, "id" | "createdAt" | "completed">) => {
    const task: Task = {
      ...newTask,
      id: `task-${Date.now()}`,
      createdAt: new Date(),
      completed: false,
    };
    setTasks((prev) => [task, ...prev]);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    toast.success("Task deleted");
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setAssigneeFilter("");
  };

  // Group tasks by status
  const tasksByStatus = {
    today: filteredTasks.filter((t) => isToday(t.dueDate)),
    all: filteredTasks,
    pending: filteredTasks.filter((t) => !t.completed),
    completed: filteredTasks.filter((t) => t.completed),
    overdue: filteredTasks.filter((t) => !t.completed && isPast(t.dueDate) && !isToday(t.dueDate)),
  };

  // Unique assignees for history filter
  const allAssignees = useMemo(() => {
    return [...new Set(tasks.filter(t => t.completed).map(t => t.assignee))].sort();
  }, [tasks]);

  // Filtered completed tasks for history
  const filteredCompletedTasks = useMemo(() => {
    return tasksByStatus.completed.filter((task) => {
      if (historyDateRange.start && historyDateRange.end) {
        const taskDate = new Date(task.dueDate);
        if (!isWithinInterval(taskDate, { start: startOfDay(historyDateRange.start), end: endOfDay(historyDateRange.end) })) {
          return false;
        }
      }
      if (historyDeptFilter && historyDeptFilter !== "all") {
        // Match department by checking assignee against staff members
        const staffMember = mockStaffMembers.find(s =>
          task.assignee.toLowerCase().includes(s.firstName.toLowerCase()) &&
          task.assignee.toLowerCase().includes(s.lastName.toLowerCase())
        );
        if (!staffMember || staffMember.departmentId !== historyDeptFilter) return false;
      }
      if (historyUserFilter && historyUserFilter !== "all") {
        if (task.assignee !== historyUserFilter) return false;
      }
      return true;
    });
  }, [tasksByStatus.completed, historyDateRange, historyDeptFilter, historyUserFilter]);

  return (
    <Layout>
      {/* Mobile Header */}
      <MobileHeader
        title="Tasks"
        subtitle="Manage and track tasks"
        actions={
          <Button 
            variant="outline" 
            size="icon" 
            className="relative h-9 w-9 shrink-0 border-primary/30 bg-primary/5 hover:bg-primary/10"
          >
            <Bell className="w-4 h-4 text-primary" />
            {tasksByStatus.overdue.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-destructive text-destructive-foreground text-xs font-medium rounded-full flex items-center justify-center">
                {tasksByStatus.overdue.length}
              </span>
            )}
          </Button>
        }
      />

      <PageHeader
        title="Tasks"
        subtitle="Manage and track tasks across the practice"
        icon={ClipboardList}
      />

      {/* Mobile: Navigation tabs below header */}
      <div className="md:hidden sticky top-[56px] z-20 bg-card">
        <div className="px-4 pt-4 pb-3">
          <SegmentedControl
            options={[
              { id: "creation" as const, label: "Create", icon: Plus },
              { id: "library" as const, label: "Tasks", icon: ListChecks },
              { id: "history" as const, label: "History", icon: History },
            ]}
            value={mobileTab}
            onChange={(val) => setMobileTab(val)}
            size="sm"
            fullWidth
          />
        </div>
      </div>

      {/* Mobile Content */}
      <div className="md:hidden p-4 space-y-4">
        {mobileTab === "creation" && (
          <div className="space-y-4">
            <SegmentedControl
              options={[
                { id: "task" as const, label: "Task", icon: ClipboardList },
                { id: "todo" as const, label: "To-do List", icon: ListTodo },
              ]}
              value={createType}
              onChange={(val) => setCreateType(val)}
              size="sm"
              fullWidth
            />
            {createType === "task" ? (
              <CreateTaskDialog onCreateTask={handleCreateTask} />
            ) : (
              <CreateTodoListDialog onCreateTask={handleCreateTask} />
            )}
          </div>
        )}

        {mobileTab === "library" && (
          <>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <TaskFilters
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  assigneeFilter={assigneeFilter}
                  onAssigneeFilterChange={setAssigneeFilter}
                  onClearFilters={clearFilters}
                />
              </div>
            </div>
            <SegmentedControl
              options={[
                { id: "today" as const, label: "Today", badge: tasksByStatus.today.length },
                { id: "all" as const, label: "All", badge: tasksByStatus.all.length },
                { id: "pending" as const, label: "Pending", badge: tasksByStatus.pending.length },
                { id: "overdue" as const, label: "Late", badge: tasksByStatus.overdue.length },
              ]}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              size="sm"
              fullWidth
            />
            {tasksByStatus[statusFilter].length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No tasks found</p>
              </div>
            ) : (
              tasksByStatus[statusFilter].map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={handleToggleComplete}
                  onUpdateTask={handleUpdateTask}
                  onToggleImportant={handleToggleImportant}
                />
              ))
            )}
          </>
        )}

        {mobileTab === "history" && (
          <div className="space-y-4">
            <TaskHistoryFilters
              dateRange={historyDateRange}
              onDateRangeChange={setHistoryDateRange}
              departmentFilter={historyDeptFilter}
              onDepartmentFilterChange={setHistoryDeptFilter}
              userFilter={historyUserFilter}
              onUserFilterChange={setHistoryUserFilter}
              assignees={allAssignees}
            />
            {filteredCompletedTasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <History className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No completed tasks found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCompletedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onUpdateTask={handleUpdateTask}
                    onToggleImportant={handleToggleImportant}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop Content */}
      <div className="hidden md:block px-8 py-4 max-w-4xl mx-auto space-y-6">
        <PageIntro
          highlight="Turn to-dos into accountable action."
          description="Create tasks and to-do lists, assign owners, set due dates, and follow every job from creation through to a full completion history — all in one place."
        />
        {/* Top Navigation Tabs */}
        <SegmentedControl
          options={[
            { id: "creation" as const, label: "Create", icon: Plus },
            { id: "library" as const, label: "Tasks", icon: ListChecks },
            { id: "history" as const, label: "History", icon: History },
          ]}
          value={desktopTab}
          onChange={(val) => setDesktopTab(val)}
        />

        {/* ========== CREATION TAB ========== */}
        {desktopTab === "creation" && (
          <div className="space-y-6">
            <SegmentedControl
              options={[
                { id: "task" as const, label: "Task", icon: ClipboardList },
                { id: "todo" as const, label: "To-do List", icon: ListTodo },
              ]}
              value={createType}
              onChange={(val) => setCreateType(val)}
            />
            {createType === "task" ? (
              <CreateTaskDialog onCreateTask={handleCreateTask} />
            ) : (
              <CreateTodoListDialog onCreateTask={handleCreateTask} />
            )}
          </div>
        )}

        {/* ========== LIBRARY TAB ========== */}
        {desktopTab === "library" && (
          <div className="space-y-6">
            {/* Search and Actions Row */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-[200px] max-w-lg">
                <TaskFilters
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  assigneeFilter={assigneeFilter}
                  onAssigneeFilterChange={setAssigneeFilter}
                  onClearFilters={clearFilters}
                />
              </div>
              <div className="flex items-center gap-3">
                <SegmentedControl
                  options={[
                    { id: "list", label: "List", icon: List },
                    { id: "cards", label: "Cards", icon: LayoutGrid },
                    { id: "board", label: "Board", icon: Kanban },
                  ]}
                  value={displayMode}
                  onChange={(mode) => setDisplayMode(mode as "list" | "cards" | "board")}
                  size="sm"
                />
                <ExportDropdown
                  onExportCSV={() => { exportTasksCSV(filteredTasks); toast.success("CSV exported"); }}
                  onExportPDF={() => exportTasksPDF(filteredTasks)}
                />
              </div>
            </div>

            {/* Cards View (Kanban) */}
            {displayMode === "cards" && (
              <>
                <TaskViewSelector
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  customDateRange={customDateRange}
                  onCustomDateRangeChange={setCustomDateRange}
                />
                <TaskKanbanBoard
                  tasks={filteredTasks}
                  onToggleComplete={handleToggleComplete}
                  onUpdateTask={handleUpdateTask}
                  onToggleImportant={handleToggleImportant}
                  viewMode={viewMode}
                  selectedDate={selectedDate}
                  customDateRange={customDateRange}
                />
              </>
            )}

            {/* Board View */}
            {displayMode === "board" && (
              <TaskBoard
                tasks={filteredTasks}
                onToggleComplete={handleToggleComplete}
                onUpdateTask={handleUpdateTask}
                onToggleImportant={handleToggleImportant}
              />
            )}

            {/* List View */}
            {displayMode === "list" && (
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="today">Today ({tasksByStatus.today.length})</TabsTrigger>
                  <TabsTrigger value="all">All ({tasksByStatus.all.length})</TabsTrigger>
                  <TabsTrigger value="pending">Pending ({tasksByStatus.pending.length})</TabsTrigger>
                  <TabsTrigger value="overdue" className="text-destructive">Overdue ({tasksByStatus.overdue.length})</TabsTrigger>
                  <TabsTrigger value="completed">Done ({tasksByStatus.completed.length})</TabsTrigger>
                </TabsList>

                {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
                  <TabsContent key={status} value={status}>
                    <TaskTable
                      tasks={statusTasks}
                      onToggleComplete={handleToggleComplete}
                      onUpdateTask={handleUpdateTask}
                      onToggleImportant={handleToggleImportant}
                      onDeleteTask={handleDeleteTask}
                      onEditTask={handleEditTask}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>
        )}

        {/* ========== HISTORY TAB ========== */}
        {desktopTab === "history" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <TaskHistoryFilters
                dateRange={historyDateRange}
                onDateRangeChange={setHistoryDateRange}
                departmentFilter={historyDeptFilter}
                onDepartmentFilterChange={setHistoryDeptFilter}
                userFilter={historyUserFilter}
                onUserFilterChange={setHistoryUserFilter}
                assignees={allAssignees}
              />
              <ExportDropdown
                onExportCSV={() => { exportTasksCSV(filteredCompletedTasks); toast.success("CSV exported"); }}
                onExportPDF={() => exportTasksPDF(filteredCompletedTasks)}
                disabled={filteredCompletedTasks.length === 0}
              />
            </div>

            {filteredCompletedTasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No completed tasks found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              <TaskTable
                tasks={filteredCompletedTasks}
                onToggleComplete={handleToggleComplete}
                onUpdateTask={handleUpdateTask}
                onToggleImportant={handleToggleImportant}
                onDeleteTask={handleDeleteTask}
                onEditTask={handleEditTask}
              />
            )}
          </div>
        )}
      </div>

      {/* Edit Task Dialog */}
      <EditTaskDialog
        task={editingTask}
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        onUpdateTask={handleUpdateTask}
      />
    </Layout>
  );
};

export default Tasks;
