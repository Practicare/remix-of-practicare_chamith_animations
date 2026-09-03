import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Eye, Send, Mail, Phone } from "lucide-react";
import { StaffMember, Department, INVITATION_STATUS_COLORS, INVITATION_STATUS_LABELS } from "@/types/staff";
import { DynamicIcon } from "@/components/DynamicIcon";

interface StaffBoardProps {
  staff: StaffMember[];
  departments: Department[];
  onView: (staff: StaffMember) => void;
  onEdit: (staff: StaffMember) => void;
  onDelete: (staff: StaffMember) => void;
  onResendInvite: (staff: StaffMember) => void;
}

export function StaffBoard({
  staff,
  departments,
  onView,
  onEdit,
  onDelete,
  onResendInvite,
}: StaffBoardProps) {
  const getStaffByDepartment = (deptId: string) => staff.filter(s => s.departmentId === deptId);

  // Only show departments that have staff or all departments if showing all
  const activeDepartments = departments.filter(dept => getStaffByDepartment(dept.id).length > 0);

  if (staff.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No staff members found</p>
      </div>
    );
  }

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4 min-w-max">
        {activeDepartments.map((dept) => {
          const deptStaff = getStaffByDepartment(dept.id);
          
          return (
            <div key={dept.id} className="w-[300px] shrink-0">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <div className={`p-1.5 rounded ${dept.color} bg-opacity-20`}>
                      <DynamicIcon name={dept.icon} className="w-4 h-4" />
                    </div>
                    {dept.name}
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {deptStaff.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {deptStaff.map((member) => {
                    const fullName = `${member.firstName} ${member.lastName}`;
                    const initials = `${member.firstName[0]}${member.lastName[0]}`;

                    return (
                      <div
                        key={member.id}
                        className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => onView(member)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${dept.color}`}>
                              {initials}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{fullName}</p>
                              <p className="text-xs text-muted-foreground">{member.role}</p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreHorizontal className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(member); }}>
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(member); }}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              {member.invitationStatus === "pending" && (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onResendInvite(member); }}>
                                  <Send className="w-4 h-4 mr-2" />
                                  Resend
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={(e) => { e.stopPropagation(); onDelete(member); }}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            <span className="truncate max-w-[120px]">{member.email}</span>
                          </div>
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${INVITATION_STATUS_COLORS[member.invitationStatus]}`}>
                            {INVITATION_STATUS_LABELS[member.invitationStatus]}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
