import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/SearchInput";
import { ArrowLeft, Users } from "lucide-react";
import { StaffMember, Department } from "@/types/staff";
import { mockStaffMembers } from "@/data/mockStaff";
import { mockDepartments } from "@/data/mockDepartments";
import { StaffRow } from "@/components/staff/StaffRow";
import { StaffCard } from "@/components/staff/StaffCard";
import { AddStaffDialog } from "@/components/staff/AddStaffDialog";
import { EditStaffDialog } from "@/components/staff/EditStaffDialog";
import { StaffProfileDialog } from "@/components/staff/StaffProfileDialog";
import { DeleteStaffDialog } from "@/components/staff/DeleteStaffDialog";

import { DynamicIcon } from "@/components/DynamicIcon";
import { toast } from "@/hooks/use-toast";
import { ExportDropdown } from "@/components/ui/ExportDropdown";
import { exportStaffCSV, exportStaffPDF } from "@/utils/moduleExports";

export default function DepartmentDetail() {
  const { departmentId } = useParams<{ departmentId: string }>();
  const navigate = useNavigate();
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(mockStaffMembers);
  const [departments] = useState<Department[]>(mockDepartments);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "accepted" | "pending">("all");
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  

  const department = departments.find(d => d.id === departmentId);

  const deptStaff = useMemo(() => {
    return staffMembers
      .filter(s => s.departmentId === departmentId)
      .filter(s => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const name = `${s.firstName} ${s.lastName}`.toLowerCase();
        return name.includes(q) || s.email.toLowerCase().includes(q) || s.role.toLowerCase().includes(q);
      });
  }, [staffMembers, departmentId, searchQuery]);

  const filteredStaff = useMemo(() => {
    if (statusFilter === "all") return deptStaff;
    return deptStaff.filter(s => s.invitationStatus === statusFilter);
  }, [deptStaff, statusFilter]);

  const activeCount = deptStaff.filter(s => s.invitationStatus === "accepted").length;
  const pendingCount = deptStaff.filter(s => s.invitationStatus === "pending").length;

  const handleAddStaff = (newStaff: Omit<StaffMember, "id" | "createdAt" | "updatedAt">) => {
    const staff: StaffMember = { ...newStaff, id: `staff-${Date.now()}`, createdAt: new Date(), updatedAt: new Date() };
    setStaffMembers([staff, ...staffMembers]);
    toast({ title: "Staff Added", description: `${staff.firstName} ${staff.lastName} has been added.` });
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


  const staffActions = {
    onView: (s: StaffMember) => { setSelectedStaff(s); setViewDialogOpen(true); },
    onEdit: (s: StaffMember) => { setSelectedStaff(s); setEditDialogOpen(true); },
    onDelete: (s: StaffMember) => { setSelectedStaff(s); setDeleteDialogOpen(true); },
    onResendInvite: handleResendInvite,
  };

  if (!department) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
          <Users className="w-10 h-10 mb-3 opacity-50" />
          <p className="text-[14px]">Department not found</p>
          <Button variant="ghost" className="mt-3" onClick={() => navigate("/staff")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Staff
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Mobile Header */}
      <MobileHeader
        title={department.name}
        subtitle={`${filteredStaff.length} members`}
        actions={
          <AddStaffDialog departments={departments} onAddStaff={handleAddStaff} defaultDepartmentId={department.id} />
        }
      />

      {/* Mobile Search */}
      <div className="md:hidden sticky top-[56px] z-20 bg-card px-4 pt-4 pb-3 border-b border-border">
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search members..." />
      </div>

      {/* Mobile Content */}
      <div className="md:hidden p-3 space-y-2">
        {filteredStaff.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No members found</p>
          </div>
        ) : (
          filteredStaff.map(staff => (
            <StaffCard key={staff.id} staff={staff} department={department} {...staffActions} />
          ))
        )}
      </div>

      {/* Desktop */}
      <div className="hidden md:block px-8 pt-8 pb-2 max-w-4xl mx-auto">
        {/* Back + Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/staff")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className={`w-10 h-10 rounded-lg ${department.color}/15 flex items-center justify-center`}>
            <DynamicIcon name={department.icon} className={`w-5 h-5 ${department.color.replace("bg-", "text-")}`} />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{department.name}</h2>
            {department.description && (
              <p className="text-[13px] text-muted-foreground">{department.description}</p>
            )}
          </div>
          <span className={`ml-3 text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
            department.type === "internal"
              ? "bg-muted text-muted-foreground"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
          }`}>
            {department.type === "internal" ? "Internal" : "External"}
          </span>
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1 mb-5">
          {([
            { key: "all" as const, label: "All", count: deptStaff.length },
            { key: "accepted" as const, label: "Active", count: activeCount },
            { key: "pending" as const, label: "Pending", count: pendingCount },
          ]).map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                statusFilter === key
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {label}
              <span className="ml-1.5 text-[11px] opacity-70">{count}</span>
            </button>
          ))}
        </div>

        {/* Search + Add */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search members..." className="flex-1 max-w-sm" />
          <ExportDropdown
            onExportCSV={() => { exportStaffCSV(filteredStaff, department.name); toast({ title: "CSV exported" }); }}
            onExportPDF={() => exportStaffPDF(filteredStaff, department.name, department.name)}
          />
          <AddStaffDialog departments={departments} onAddStaff={handleAddStaff} defaultDepartmentId={department.id} />
        </div>

        {/* Staff List */}
        {filteredStaff.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-[14px]">No members found</p>
            <p className="text-[12px] mt-1">Add team members to this department</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border/50 overflow-hidden bg-card px-1 py-1">
            {filteredStaff.map(member => (
              <StaffRow key={member.id} staff={member} {...staffActions} />
            ))}
          </div>
        )}
      </div>

      <StaffProfileDialog staff={selectedStaff} department={department} open={viewDialogOpen} onOpenChange={setViewDialogOpen} onEdit={() => { setViewDialogOpen(false); setEditDialogOpen(true); }} onResendInvite={() => selectedStaff && handleResendInvite(selectedStaff)} />
      <EditStaffDialog staff={selectedStaff} departments={departments} open={editDialogOpen} onOpenChange={setEditDialogOpen} onSave={handleEditStaff} />
      <DeleteStaffDialog staff={selectedStaff} open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDeleteStaff} />
      
    </AdminLayout>
  );
}
