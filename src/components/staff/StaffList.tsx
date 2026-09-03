import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Eye, Send, Mail, Phone } from "lucide-react";
import { StaffMember, Department, INVITATION_STATUS_COLORS, INVITATION_STATUS_LABELS } from "@/types/staff";
import { DynamicIcon } from "@/components/DynamicIcon";
import { format } from "date-fns";

interface StaffListProps {
  staff: StaffMember[];
  departments: Department[];
  onView: (staff: StaffMember) => void;
  onEdit: (staff: StaffMember) => void;
  onDelete: (staff: StaffMember) => void;
  onResendInvite: (staff: StaffMember) => void;
}

export function StaffList({
  staff,
  departments,
  onView,
  onEdit,
  onDelete,
  onResendInvite,
}: StaffListProps) {
  const getDepartment = (id: string) => departments.find(d => d.id === id);

  if (staff.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No staff members found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Birthday</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map((member) => {
            const dept = getDepartment(member.departmentId);
            const fullName = `${member.firstName} ${member.lastName}`;
            const initials = `${member.firstName[0]}${member.lastName[0]}`;

            return (
              <TableRow key={member.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onView(member)}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${dept?.color || "bg-primary"}`}>
                      {initials}
                    </div>
                    <span className="font-medium">{fullName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {dept && (
                    <div className="flex items-center gap-1.5">
                      <DynamicIcon name={dept.icon} className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm">{dept.name}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-sm">{member.role}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {member.email}
                    </span>
                    {member.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {member.phone}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs ${INVITATION_STATUS_COLORS[member.invitationStatus]}`}>
                    {INVITATION_STATUS_LABELS[member.invitationStatus]}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {member.birthday ? format(member.birthday, "MMM d") : "-"}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                      onClick={() => onView(member)}
                      title="View Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                      onClick={() => onEdit(member)}
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    {member.invitationStatus === "pending" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-amber-500/10 hover:text-amber-600"
                        onClick={() => onResendInvite(member)}
                        title="Resend Invite"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onDelete(member)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
