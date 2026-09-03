import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/SearchInput";
import {
  Users, Bell, LayoutGrid, Layers, List, Kanban, ChevronDown, ChevronRight, UserCheck, Clock, Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageIntro } from "@/components/layout/PageIntro";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { StaffMember, Department } from "@/types/staff";
import { mockStaffMembers } from "@/data/mockStaff";
import { mockDepartments } from "@/data/mockDepartments";
import { AddStaffDialog } from "@/components/staff/AddStaffDialog";
import { EditStaffDialog } from "@/components/staff/EditStaffDialog";
import { StaffProfileDialog } from "@/components/staff/StaffProfileDialog";
import { DeleteStaffDialog } from "@/components/staff/DeleteStaffDialog";

import { AddDepartmentDialog } from "@/components/staff/AddDepartmentDialog";
import { StaffCard } from "@/components/staff/StaffCard";
import { StaffRow } from "@/components/staff/StaffRow";
import { StaffList } from "@/components/staff/StaffList";
import { StaffBoard } from "@/components/staff/StaffBoard";
import { DepartmentCard } from "@/components/staff/DepartmentCard";
import { DynamicIcon } from "@/components/DynamicIcon";
import { toast } from "@/hooks/use-toast";
import { ExportDropdown } from "@/components/ui/ExportDropdown";
import { exportStaffCSV, exportStaffPDF } from "@/utils/moduleExports";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type StatusFilter = "all" | "accepted" | "pending";

export default function Staff() {
  const navigate = useNavigate();
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(mockStaffMembers);
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [collapsedDepts, setCollapsedDepts] = useState<Set<string>>(new Set());

  // Mobile-only state
  const [activeDepartment, setActiveDepartment] = useState("all");

  const filteredStaff = useMemo(() => {
    return staffMembers.filter((staff) => {
      const fullName = `${staff.firstName} ${staff.lastName}`.toLowerCase();
      const query = searchQuery.toLowerCase();
      if (!fullName.includes(query) && !staff.email.toLowerCase().includes(query) && !staff.role.toLowerCase().includes(query)) return false;
      if (statusFilter === "accepted" && staff.invitationStatus !== "accepted") return false;
      if (statusFilter === "pending" && staff.invitationStatus !== "pending") return false;
      return true;
    });
  }, [staffMembers, searchQuery, statusFilter]);

  const mobileFilteredStaff = useMemo(() => {
    return filteredStaff.filter((staff) => {
      if (activeDepartment !== "all" && staff.departmentId !== activeDepartment) return false;
      return true;
    });
  }, [filteredStaff, activeDepartment]);

  const staffByStatus = {
    all: filteredStaff,
    accepted: filteredStaff.filter(s => s.invitationStatus === "accepted"),
    pending: filteredStaff.filter(s => s.invitationStatus === "pending"),
  };

  // Group staff by department for desktop grouped view
  const departmentsWithStaff = useMemo(() => {
    return departments
      .map(dept => ({
        department: dept,
        staff: filteredStaff.filter(s => s.departmentId === dept.id),
      }))
      .filter(group => group.staff.length > 0);
  }, [departments, filteredStaff]);

  const unassignedStaff = useMemo(() => {
    const deptIds = new Set(departments.map(d => d.id));
    return filteredStaff.filter(s => !deptIds.has(s.departmentId));
  }, [departments, filteredStaff]);

  const handleAddStaff = (newStaff: Omit<StaffMember, "id" | "createdAt" | "updatedAt">) => {
    const staff: StaffMember = { ...newStaff, id: `staff-${Date.now()}`, createdAt: new Date(), updatedAt: new Date() };
    setStaffMembers([staff, ...staffMembers]);
    toast({ title: "Staff Added", description: `${staff.firstName} ${staff.lastName} has been added.${newStaff.invitationStatus === "pending" ? " Invitation email sent." : ""}` });
  };

  const handleEditStaff = (id: string, updates: Partial<StaffMember>) => {
    setStaffMembers(staffMembers.map(s => s.id === id ? { ...s, ...updates } : s));
    toast({ title: "Profile Updated", description: "Staff profile has been updated." });
  };

  const handleDeleteStaff = () => {
    if (!selectedStaff) return;
    setStaffMembers(staffMembers.filter(s => s.id !== selectedStaff.id));
    toast({ title: "Staff Deleted", description: `${selectedStaff.firstName} ${selectedStaff.lastName} has been removed.` });
    setDeleteDialogOpen(false);
    setSelectedStaff(null);
  };

  const handleResendInvite = (staff: StaffMember) => {
    toast({ title: "Invitation Sent", description: `Invitation email resent to ${staff.email}.` });
  };

  const handleAddDepartment = (dept: Omit<Department, "id" | "isDefault">) => {
    const newDept: Department = { ...dept, id: `dept-${Date.now()}`, isDefault: false };
    setDepartments([...departments, newDept]);
    toast({ title: "Department Added", description: `${dept.name} has been created.` });
  };

  const getDepartment = (id: string) => departments.find(d => d.id === id);
  const pendingCount = staffMembers.filter(s => s.invitationStatus === "pending").length;


  const staffActions = {
    onView: (s: StaffMember) => { setSelectedStaff(s); setViewDialogOpen(true); },
    onEdit: (s: StaffMember) => { setSelectedStaff(s); setEditDialogOpen(true); },
    onDelete: (s: StaffMember) => { setSelectedStaff(s); setDeleteDialogOpen(true); },
    onResendInvite: handleResendInvite,
  };

  const toggleDeptCollapse = (deptId: string) => {
    setCollapsedDepts(prev => {
      const next = new Set(prev);
      if (next.has(deptId)) next.delete(deptId);
      else next.add(deptId);
      return next;
    });
  };

  const getDepartmentName = () => {
    if (activeDepartment === "all") return "All Departments";
    return departments.find(d => d.id === activeDepartment)?.name || "Department";
  };

  return (
    <AdminLayout>
      {/* Mobile Header */}
      <MobileHeader
        title="Staff"
        subtitle="Team management"
        actions={
          <Button 
            variant="outline" 
            size="icon" 
            className="relative h-9 w-9 shrink-0"
          >
            <Bell className="w-4 h-4" />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-destructive text-destructive-foreground text-[10px] font-medium rounded-md flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </Button>
        }
      />

      {/* Mobile: Sticky sub-header */}
      <div className="md:hidden sticky top-[56px] z-20 bg-card">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-2">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search staff..."
              className="flex-1"
            />
            <AddStaffDialog departments={departments} onAddStaff={handleAddStaff} />
          </div>
        </div>

        {/* Department filter row */}
        <div className="flex items-center px-4 pb-3 border-b border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 text-[13px] font-medium">
                <span className="text-foreground">{getDepartmentName()}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-popover border border-border shadow-lg z-50 min-w-[200px]">
              <DropdownMenuItem 
                onClick={() => setActiveDepartment("all")}
                className="cursor-pointer py-2.5"
              >
                <Layers className="w-4 h-4 mr-2" />
                All Departments ({staffMembers.length})
              </DropdownMenuItem>
              {departments.map((dept) => (
                <DropdownMenuItem 
                  key={dept.id}
                  onClick={() => setActiveDepartment(dept.id)}
                  className="cursor-pointer py-2.5"
                >
                  <DynamicIcon name={dept.icon} className="w-4 h-4 mr-2" />
                  {dept.name} ({staffMembers.filter(s => s.departmentId === dept.id).length})
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="md:hidden p-3 space-y-2">
        {mobileFilteredStaff.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No staff members found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {mobileFilteredStaff.map((staff) => (
              <StaffCard
                key={staff.id}
                staff={staff}
                department={getDepartment(staff.departmentId)}
                {...staffActions}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop Header */}
      <PageHeader
        title="Staff"
        subtitle="Staff Directory"
        icon={Users}
        actions={
          <ExportDropdown
            onExportCSV={() => { exportStaffCSV(filteredStaff); toast({ title: "CSV exported" }); }}
            onExportPDF={() => exportStaffPDF(filteredStaff)}
          />
        }
      />

      {/* Desktop Content */}
      <div className="hidden md:block px-8 py-4 max-w-4xl mx-auto space-y-6">
        <PageIntro
          highlight="View and manage all team members."
          description="Invite your staff members to create their own free account. Invited members will get an email to accept, create a Practicare account and join your practice account. Filter by department or status, or search by name."
        />

        {/* Search */}
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search departments..."
          className="max-w-sm"
        />

        {/* Section label */}
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">Departments</h3>
          <span className="text-[12px] text-muted-foreground">{departments.length} departments · {staffMembers.length} total staff</span>
        </div>

        {/* Department Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {departments.map((dept) => {
            const deptStaff = filteredStaff.filter(s => s.departmentId === dept.id);
            return (
              <DepartmentCard key={dept.id} department={dept} staffMembers={deptStaff} />
            );
          })}
        </div>

        {unassignedStaff.length > 0 && (
          <div className="rounded-xl border border-border/50 bg-card overflow-hidden px-1 py-1 mt-4">
            <div className="px-3 py-2 text-[13px] font-semibold text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Unassigned ({unassignedStaff.length})
            </div>
            {unassignedStaff.map((member) => (
              <StaffRow key={member.id} staff={member} {...staffActions} />
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 mt-2">
          <AddDepartmentDialog onAddDepartment={handleAddDepartment} />
        </div>
      </div>

      <StaffProfileDialog staff={selectedStaff} department={getDepartment(selectedStaff?.departmentId || "")} open={viewDialogOpen} onOpenChange={setViewDialogOpen} onEdit={() => { setViewDialogOpen(false); setEditDialogOpen(true); }} onResendInvite={() => selectedStaff && handleResendInvite(selectedStaff)} />
      <EditStaffDialog staff={selectedStaff} departments={departments} open={editDialogOpen} onOpenChange={setEditDialogOpen} onSave={handleEditStaff} />
      <DeleteStaffDialog staff={selectedStaff} open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDeleteStaff} />
      
    </AdminLayout>
  );
}
