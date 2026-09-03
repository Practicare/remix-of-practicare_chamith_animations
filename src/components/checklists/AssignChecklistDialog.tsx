import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Building2, User, Globe, ChevronRight, ArrowLeft } from "lucide-react";
import { ChecklistAssignment, AssignmentType, DEFAULT_CHECKLIST_CATEGORIES } from "@/types/checklists";
import { TeamMember } from "@/types/teamMembers";
import { cn } from "@/lib/utils";

type Step = "scope" | "department" | "users";

interface AssignChecklistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAssignment?: ChecklistAssignment;
  onSave: (assignment: ChecklistAssignment) => void;
  teamMembers: TeamMember[];
  checklistTitle: string;
}

export const AssignChecklistDialog = ({
  open,
  onOpenChange,
  currentAssignment,
  onSave,
  teamMembers,
  checklistTitle,
}: AssignChecklistDialogProps) => {
  const [step, setStep] = useState<Step>("scope");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [assignAllInDepartment, setAssignAllInDepartment] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setStep("scope");
      setSelectedDepartment(null);
      setAssignAllInDepartment(true);
      setSelectedUsers(currentAssignment?.userIds || []);
      
      // Restore previous state if exists
      if (currentAssignment?.type === "department" && currentAssignment.departmentIds?.length === 1) {
        setSelectedDepartment(currentAssignment.departmentIds[0]);
      }
    }
  }, [open, currentAssignment]);

  const departments = DEFAULT_CHECKLIST_CATEGORIES.filter(
    (cat) => cat.id !== "all"
  );

  const getUsersByDepartment = (departmentId: string) => {
    return teamMembers.filter((member) => member.categoryId === departmentId);
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAllDepartments = () => {
    const assignment: ChecklistAssignment = {
      type: "all",
    };
    onSave(assignment);
    onOpenChange(false);
  };

  const handleSelectDepartment = (deptId: string) => {
    setSelectedDepartment(deptId);
    setStep("department");
    setSelectedUsers([]);
    setAssignAllInDepartment(true);
  };

  const handleDepartmentChoice = () => {
    if (!selectedDepartment) return;
    
    if (assignAllInDepartment) {
      // Assign to all users in this department
      const assignment: ChecklistAssignment = {
        type: "department",
        departmentIds: [selectedDepartment],
      };
      onSave(assignment);
      onOpenChange(false);
    } else {
      // Go to user selection
      setStep("users");
    }
  };

  const handleSaveUsers = () => {
    if (selectedUsers.length === 0) return;
    const assignment: ChecklistAssignment = {
      type: "users",
      userIds: selectedUsers,
      departmentIds: selectedDepartment ? [selectedDepartment] : undefined,
    };
    onSave(assignment);
    onOpenChange(false);
  };

  const goBack = () => {
    if (step === "users") {
      setStep("department");
    } else if (step === "department") {
      setStep("scope");
      setSelectedDepartment(null);
    }
  };

  const selectedDeptData = departments.find((d) => d.id === selectedDepartment);
  const deptMembers = selectedDepartment ? getUsersByDepartment(selectedDepartment) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step !== "scope" && (
              <Button variant="ghost" size="icon" className="h-8 w-8 mr-1" onClick={goBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <Users className="w-5 h-5" />
            Assign Checklist
          </DialogTitle>
          <DialogDescription>
            {step === "scope" && `Choose assignment scope for "${checklistTitle}"`}
            {step === "department" && `Configure assignment for ${selectedDeptData?.name}`}
            {step === "users" && `Select users from ${selectedDeptData?.name}`}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Step 1: Scope Selection */}
          {step === "scope" && (
            <div className="space-y-3">
              {/* All Departments Option */}
              <div
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all",
                  "border-border hover:border-primary/50 hover:bg-primary/5"
                )}
                onClick={handleSelectAllDepartments}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">All Departments</p>
                    <p className="text-sm text-muted-foreground">
                      Everyone in the organization
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">{teamMembers.length} users</Badge>
              </div>

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-3 text-sm text-muted-foreground">
                    or select a department
                  </span>
                </div>
              </div>

              {/* Department List */}
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {departments.map((dept) => {
                    const memberCount = getUsersByDepartment(dept.id).length;
                    const isInternal = dept.type === "internal";
                    return (
                      <div
                        key={dept.id}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all",
                          "border-border hover:border-primary/50 hover:bg-primary/5"
                        )}
                        onClick={() => handleSelectDepartment(dept.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            isInternal 
                              ? "bg-gradient-to-br from-green-500 to-green-600" 
                              : "bg-gradient-to-br from-amber-500 to-amber-600"
                          )}>
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold">{dept.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {isInternal ? "Internal" : "External"} department
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {memberCount} {memberCount === 1 ? "user" : "users"}
                          </Badge>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Step 2: Department Configuration */}
          {step === "department" && selectedDeptData && (
            <div className="space-y-4">
              {/* Department Header */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center",
                  selectedDeptData.type === "internal"
                    ? "bg-gradient-to-br from-green-500 to-green-600"
                    : "bg-gradient-to-br from-amber-500 to-amber-600"
                )}>
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{selectedDeptData.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {deptMembers.length} team {deptMembers.length === 1 ? "member" : "members"}
                  </p>
                </div>
              </div>

              {/* Assignment Options */}
              <RadioGroup
                value={assignAllInDepartment ? "all" : "specific"}
                onValueChange={(value) => setAssignAllInDepartment(value === "all")}
                className="space-y-3"
              >
                <div
                  className={cn(
                    "flex items-center space-x-3 rounded-xl border-2 p-4 cursor-pointer transition-all",
                    assignAllInDepartment
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => setAssignAllInDepartment(true)}
                >
                  <RadioGroupItem value="all" id="assign-all" />
                  <Label htmlFor="assign-all" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">All users in {selectedDeptData.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Assign to all {deptMembers.length} members of this department
                    </p>
                  </Label>
                </div>

                <div
                  className={cn(
                    "flex items-center space-x-3 rounded-xl border-2 p-4 cursor-pointer transition-all",
                    !assignAllInDepartment
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => setAssignAllInDepartment(false)}
                >
                  <RadioGroupItem value="specific" id="assign-specific" />
                  <Label htmlFor="assign-specific" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Select specific users</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Choose individual team members from this department
                    </p>
                  </Label>
                </div>
              </RadioGroup>

              <DialogFooter className="pt-4">
                <Button variant="outline" onClick={goBack}>
                  Back
                </Button>
                <Button onClick={handleDepartmentChoice}>
                  {assignAllInDepartment ? "Assign to Department" : "Select Users"}
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* Step 3: User Selection */}
          {step === "users" && selectedDeptData && (
            <div className="space-y-4">
              {/* Department Header */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Building2 className="w-5 h-5 text-muted-foreground" />
                <p className="font-medium text-sm">{selectedDeptData.name}</p>
                <Badge variant="secondary" className="text-xs ml-auto">
                  {selectedUsers.length} selected
                </Badge>
              </div>

              {/* User List */}
              <ScrollArea className="h-64 rounded-lg border border-border p-3">
                <div className="space-y-1">
                  {deptMembers.map((member) => (
                    <div
                      key={member.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
                        selectedUsers.includes(member.id)
                          ? "bg-primary/10 border border-primary/30"
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => handleUserToggle(member.id)}
                    >
                      <Checkbox
                        checked={selectedUsers.includes(member.id)}
                        onCheckedChange={() => handleUserToggle(member.id)}
                      />
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">
                          {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <DialogFooter className="pt-2">
                <Button variant="outline" onClick={goBack}>
                  Back
                </Button>
                <Button onClick={handleSaveUsers} disabled={selectedUsers.length === 0}>
                  Assign to {selectedUsers.length} {selectedUsers.length === 1 ? "User" : "Users"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </div>

        {/* Footer only for scope step */}
        {step === "scope" && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
