import { Department } from "@/types/departments";
import { StaffMember } from "@/types/staff";
import { DynamicIcon } from "@/components/DynamicIcon";
import { ChevronRight, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DepartmentCardProps {
  department: Department;
  staffMembers: StaffMember[];
}

export function DepartmentCard({ department, staffMembers }: DepartmentCardProps) {
  const navigate = useNavigate();
  const activeCount = staffMembers.filter(s => s.invitationStatus === "accepted").length;
  const pendingCount = staffMembers.filter(s => s.invitationStatus === "pending").length;
  const previewStaff = staffMembers.slice(0, 5);

  return (
    <div
      onClick={() => navigate(`/staff/department/${department.id}`)}
      className="group rounded-xl border border-border/50 bg-card p-4 hover:border-border hover:shadow-sm transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-lg ${department.color}/15 flex items-center justify-center`}>
            <DynamicIcon name={department.icon} className={`w-4 h-4 ${department.color.replace("bg-", "text-")}`} />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold leading-tight">{department.name}</h3>
            {department.description && (
              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{department.description}</p>
            )}
          </div>
        </div>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
          department.type === "internal" 
            ? "bg-muted text-muted-foreground" 
            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
        }`}>
          {department.type === "internal" ? "Internal" : "External"}
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1.5 text-[12px]">
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="font-medium">{staffMembers.length}</span>
          <span className="text-muted-foreground">members</span>
        </div>
        {pendingCount > 0 && (
          <span className="text-[11px] text-amber-600 dark:text-amber-400">
            {pendingCount} pending
          </span>
        )}
      </div>

      {/* Avatar stack + View more */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {previewStaff.length > 0 ? (
            <div className="flex -space-x-2">
              {previewStaff.map((member) => (
                <div
                  key={member.id}
                  className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[9px] font-semibold text-muted-foreground"
                  title={`${member.firstName} ${member.lastName}`}
                >
                  {member.firstName[0]}{member.lastName[0]}
                </div>
              ))}
              {staffMembers.length > 5 && (
                <div className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[9px] font-medium text-muted-foreground">
                  +{staffMembers.length - 5}
                </div>
              )}
            </div>
          ) : (
            <span className="text-[11px] text-muted-foreground">No members yet</span>
          )}
        </div>

        <span className="flex items-center gap-1 text-[12px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          View
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}
