import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Calendar as CalendarIcon, User, Users, ListTodo, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ComplianceItem, ComplianceCategory, ComplianceLevel } from "@/types/compliance";
import { Department, DEFAULT_DEPARTMENTS } from "@/types/departments";
import { mockStaffMembers } from "@/data/mockStaff";
import { ScrollArea } from "@/components/ui/scroll-area";

import { toast } from "sonner";

type AssignmentMode = "individual" | "department";

interface CreateComplianceDialogProps {
  categories: ComplianceCategory[];
  onCreateItem: (item: Omit<ComplianceItem, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  defaultCategoryId?: string;
  departments?: Department[];
  onCreateTask?: (task: { title: string; assignee: string; dueDate: Date; categoryId: string; important?: boolean; reminder?: { email: boolean; sms: boolean } }) => void;
}

export function CreateComplianceDialog({ 
  categories, 
  onCreateItem, 
  defaultCategoryId,
  departments = DEFAULT_DEPARTMENTS,
  onCreateTask
}: CreateComplianceDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [categoryId, setCategoryId] = useState(defaultCategoryId || "");
  const [level, setLevel] = useState<ComplianceLevel>("user");
  const [assignmentMode, setAssignmentMode] = useState<AssignmentMode>("individual");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [expiryDate, setExpiryDate] = useState<Date>();
  const [reminderEmail, setReminderEmail] = useState(true);
  const [reminderSms, setReminderSms] = useState(false);
  const [autoCreateTask, setAutoCreateTask] = useState(false);
  
  // Task creation inline state
  const [taskCategoryId, setTaskCategoryId] = useState("");
  const [taskReminderEmail, setTaskReminderEmail] = useState(false);
  const [taskReminderSms, setTaskReminderSms] = useState(false);
  const [taskIsImportant, setTaskIsImportant] = useState(false);

  // Get departments for task assignment
  const taskDepartments = departments;

  // Filter out "All" from selectable categories
  const selectableCategories = categories.filter((c) => c.id !== "all");

  // Check if category is fixed
  const isFixedCategory = !!defaultCategoryId;
  const fixedCategoryName = categories.find((c) => c.id === defaultCategoryId)?.name;

  // Get staff members grouped by department
  const staffByDepartment = useMemo(() => {
    const grouped: Record<string, typeof mockStaffMembers> = {};
    mockStaffMembers.forEach(staff => {
      if (!grouped[staff.departmentId]) {
        grouped[staff.departmentId] = [];
      }
      grouped[staff.departmentId].push(staff);
    });
    return grouped;
  }, []);

  // Get department members when department is selected
  const departmentMembers = useMemo(() => {
    if (!selectedDepartmentId) return [];
    return staffByDepartment[selectedDepartmentId] || [];
  }, [selectedDepartmentId, staffByDepartment]);

  // Update categoryId when defaultCategoryId changes
  useEffect(() => {
    if (defaultCategoryId) {
      setCategoryId(defaultCategoryId);
    }
  }, [defaultCategoryId]);

  const resetForm = () => {
    setTitle("");
    setDetails("");
    setCategoryId(defaultCategoryId || "");
    setLevel("user");
    setAssignmentMode("individual");
    setSelectedUserId("");
    setSelectedDepartmentId("");
    setExpiryDate(undefined);
    setReminderEmail(true);
    setReminderSms(false);
    setAutoCreateTask(false);
  };

  const resetTaskForm = () => {
    setTaskCategoryId("");
    setTaskReminderEmail(false);
    setTaskReminderSms(false);
    setTaskIsImportant(false);
  };

  const handleSubmit = () => {
    if (!title.trim() || !expiryDate || !categoryId) return;
    
    const category = categories.find(c => c.id === categoryId);
    let assigneeName = "";
    
    if (level === "user") {
      if (assignmentMode === "individual") {
        if (!selectedUserId) return;
        const selectedUser = mockStaffMembers.find(s => s.id === selectedUserId);
        if (!selectedUser) return;
        assigneeName = `${selectedUser.firstName} ${selectedUser.lastName}`;
        
        onCreateItem({
          categoryId,
          categoryName: category?.name || "",
          title: title.trim(),
          details: details.trim(),
          level,
          assignee: assigneeName,
          expiryDate,
          reminder: {
            enabled: reminderEmail || reminderSms,
            type: reminderEmail ? "email" : "sms",
            daysBefore: 30,
          },
        });
      } else {
        // Department mode - create item for each member
        if (!selectedDepartmentId || departmentMembers.length === 0) return;
        
        departmentMembers.forEach(member => {
          onCreateItem({
            categoryId,
            categoryName: category?.name || "",
            title: title.trim(),
            details: details.trim(),
            level,
            assignee: `${member.firstName} ${member.lastName}`,
            expiryDate,
            reminder: {
              enabled: reminderEmail || reminderSms,
              type: reminderEmail ? "email" : "sms",
              daysBefore: 30,
            },
          });
        });
        // For department mode, we'll use the first member for the task
        if (departmentMembers.length > 0) {
          assigneeName = `${departmentMembers[0].firstName} ${departmentMembers[0].lastName}`;
        }
      }
    } else {
      // Practice level
      onCreateItem({
        categoryId,
        categoryName: category?.name || "",
        title: title.trim(),
        details: details.trim(),
        level,
        expiryDate,
        reminder: {
          enabled: reminderEmail || reminderSms,
          type: reminderEmail ? "email" : "sms",
          daysBefore: 30,
        },
      });
      assigneeName = "Practice Admin";
    }

    // Handle auto-create task
    if (autoCreateTask && onCreateTask && taskCategoryId) {
      const category = categories.find(c => c.id === categoryId);
      onCreateTask({
        title: `${category?.name || "Compliance"}: ${title.trim()}`,
        assignee: assigneeName,
        dueDate: expiryDate,
        categoryId: taskCategoryId,
        important: taskIsImportant,
        reminder: (taskReminderEmail || taskReminderSms) ? { email: taskReminderEmail, sms: taskReminderSms } : undefined,
      });
      toast.success("Compliance item and task created successfully");
    } else {
      toast.success("Compliance item created successfully");
    }

    resetTaskForm();
    resetForm();
    setOpen(false);
  };

  const handleCancel = () => {
    resetForm();
    resetTaskForm();
    setOpen(false);
  };

  const isValid = useMemo(() => {
    if (!title.trim() || !expiryDate || !categoryId) return false;
    if (level === "practice") return true;
    if (assignmentMode === "individual") return !!selectedUserId;
    return !!selectedDepartmentId && departmentMembers.length > 0;
  }, [title, expiryDate, categoryId, level, assignmentMode, selectedUserId, selectedDepartmentId, departmentMembers]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleCancel(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Compliance Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add New Compliance Item</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-4 pb-2">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category */}
              <div className="space-y-2">
                <Label>Category {!isFixedCategory && "*"}</Label>
                {isFixedCategory ? (
                  <div className="h-10 px-3 py-2 rounded-md border border-input bg-muted text-sm flex items-center">
                    {fixedCategoryName}
                  </div>
                ) : (
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectableCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., CPR Certification"
                />
              </div>

              {/* Level */}
              <div className="space-y-2">
                <Label>Level *</Label>
                <Select value={level} onValueChange={(v) => {
                  setLevel(v as ComplianceLevel);
                  // Reset assignment when changing level
                  setSelectedUserId("");
                  setSelectedDepartmentId("");
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User-specific</SelectItem>
                    <SelectItem value="practice">Practice-level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Assignment Section - only show for user level */}
              {level === "user" && (
                <div className="space-y-2 md:col-span-2">
                  <Label>Assign to *</Label>
                  <div className="flex items-center gap-3">
                    {/* Mode Toggle */}
                    <div className="inline-flex rounded-lg border border-input bg-muted/30 p-1">
                      <button
                        type="button"
                        onClick={() => {
                          setAssignmentMode("individual");
                          setSelectedDepartmentId("");
                        }}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                          assignmentMode === "individual"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        <User className="h-3.5 w-3.5" />
                        Individual
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAssignmentMode("department");
                          setSelectedUserId("");
                        }}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                          assignmentMode === "department"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        <Users className="h-3.5 w-3.5" />
                        Department
                      </button>
                    </div>

                    {/* User/Department Selector */}
                    <div className="flex-1 max-w-xs">
                      {assignmentMode === "individual" ? (
                        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a user" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockStaffMembers.map((staff) => (
                              <SelectItem key={staff.id} value={staff.id}>
                                {staff.firstName} {staff.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => {
                              const memberCount = staffByDepartment[dept.id]?.length || 0;
                              return (
                                <SelectItem key={dept.id} value={dept.id}>
                                  {dept.name} ({memberCount} {memberCount === 1 ? 'member' : 'members'})
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                  {/* Department members preview */}
                  {assignmentMode === "department" && selectedDepartmentId && departmentMembers.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Will create {departmentMembers.length} compliance {departmentMembers.length === 1 ? 'item' : 'items'} for: {departmentMembers.map(m => `${m.firstName} ${m.lastName}`).join(', ')}
                    </p>
                  )}
                </div>
              )}

              {/* Expiry Date */}
              <div className="space-y-2">
                <Label>Expiry Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !expiryDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expiryDate ? format(expiryDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={expiryDate} onSelect={setExpiryDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Details */}
              <div className="space-y-2 md:col-span-2 lg:col-span-1">
                <Label htmlFor="details">Details</Label>
                <Textarea
                  id="details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Additional details"
                  rows={1}
                  className="min-h-[40px]"
                />
              </div>
            </div>

            {/* Reminder */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <Label>Reminder</Label>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="reminder-email"
                    checked={reminderEmail}
                    onCheckedChange={(checked) => setReminderEmail(checked === true)}
                  />
                  <Label htmlFor="reminder-email" className="text-sm font-normal cursor-pointer">
                    Email
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="reminder-sms"
                    checked={reminderSms}
                    onCheckedChange={(checked) => setReminderSms(checked === true)}
                  />
                  <Label htmlFor="reminder-sms" className="text-sm font-normal cursor-pointer">
                    SMS
                  </Label>
                </div>
              </div>
            </div>

            {/* Auto-create Task Option */}
            {onCreateTask && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <Checkbox
                    id="auto-create-task"
                    checked={autoCreateTask}
                    onCheckedChange={(checked) => setAutoCreateTask(checked === true)}
                  />
                  <div className="flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-primary" />
                    <Label htmlFor="auto-create-task" className="text-sm font-medium cursor-pointer">
                      Also create a task for this compliance item
                    </Label>
                  </div>
                </div>

                {/* Inline Task Creation Fields */}
                {autoCreateTask && (
                  <div className="border border-primary/30 rounded-lg p-4 bg-primary/5 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-primary/20">
                      <ListTodo className="w-4 h-4 text-primary" />
                      <h4 className="font-medium text-sm">Task Details</h4>
                    </div>

                    {/* Pre-filled info preview */}
                    <div className="p-3 bg-muted/50 rounded-lg space-y-1.5">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Task title:</span>{" "}
                        <span className="font-medium">
                          {categoryId ? `${categories.find(c => c.id === categoryId)?.name || "Compliance"}: ` : ""}{title || "(enter title above)"}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Assigned to:</span>{" "}
                        <span className="font-medium">
                          {level === "user" && assignmentMode === "individual" && selectedUserId
                            ? (() => {
                                const user = mockStaffMembers.find(s => s.id === selectedUserId);
                                return user ? `${user.firstName} ${user.lastName}` : "(select assignee above)";
                              })()
                            : level === "user" && assignmentMode === "department" && departmentMembers.length > 0
                            ? `${departmentMembers[0].firstName} ${departmentMembers[0].lastName}`
                            : level === "practice"
                            ? "Practice Admin"
                            : "(select assignee above)"}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Due date:</span>{" "}
                        <span className="font-medium">
                          {expiryDate ? format(expiryDate, "PPP") : "(select date above)"}
                        </span>
                      </div>
                    </div>

                    {/* Task Category */}
                    <div className="space-y-2">
                      <Label>Task Department</Label>
                      <Select value={taskCategoryId} onValueChange={setTaskCategoryId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {taskDepartments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Important Task */}
                    <div className="flex items-center gap-3 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                      <Checkbox
                        id="task-important"
                        checked={taskIsImportant}
                        onCheckedChange={(checked) => setTaskIsImportant(checked === true)}
                      />
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        <Label htmlFor="task-important" className="text-sm font-medium cursor-pointer">
                          Mark as Important Task
                        </Label>
                      </div>
                    </div>

                    {/* Task Reminder */}
                    <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
                      <Label>Task Reminder</Label>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="task-reminder-email"
                            checked={taskReminderEmail}
                            onCheckedChange={(checked) => setTaskReminderEmail(checked === true)}
                          />
                          <Label htmlFor="task-reminder-email" className="text-sm font-normal cursor-pointer">
                            Email
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="task-reminder-sms"
                            checked={taskReminderSms}
                            onCheckedChange={(checked) => setTaskReminderSms(checked === true)}
                          />
                          <Label htmlFor="task-reminder-sms" className="text-sm font-normal cursor-pointer">
                            SMS
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!isValid || (autoCreateTask && !taskCategoryId)}
              >
                {level === "user" && assignmentMode === "department" && departmentMembers.length > 1
                  ? `Add ${departmentMembers.length} Items${autoCreateTask ? " + Task" : ""}`
                  : autoCreateTask ? "Add Item + Task" : "Add Item"
                }
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
