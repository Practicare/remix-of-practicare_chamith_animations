import { useState } from "react";
import { ChevronDown, ChevronRight, Mail, RotateCcw, Trash2, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TeamMember, MemberStatus, MEMBER_STATUS_COLORS } from "@/types/teamMembers";
import { Department } from "@/types/departments";

interface TeamMembersSectionProps {
  members: TeamMember[];
  departments: Department[];
  onInvite: (memberId: string) => void;
  onReinvite: (memberId: string) => void;
  onRemove: (memberId: string) => void;
}

export const TeamMembersSection = ({
  members,
  departments,
  onInvite,
  onReinvite,
  onRemove,
}: TeamMembersSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getMembersByDepartment = (departmentId: string) => {
    return members.filter((m) => m.categoryId === departmentId);
  };

  const getStatusBadge = (status: MemberStatus) => {
    const labels: Record<MemberStatus, string> = {
      pending: "Pending",
      accepted: "Accepted",
      invited: "Invited",
      confirmed: "Confirmed",
    };
    return (
      <Badge variant="secondary" className={MEMBER_STATUS_COLORS[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getActionButton = (member: TeamMember) => {
    switch (member.status) {
      case "pending":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onInvite(member.id)}
            className="gap-1.5"
          >
            <Send className="w-3 h-3" />
            Invite
          </Button>
        );
      case "invited":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReinvite(member.id)}
            className="gap-1.5"
          >
            <RotateCcw className="w-3 h-3" />
            Reinvite
          </Button>
        );
      case "accepted":
      case "confirmed":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRemove(member.id)}
            className="gap-1.5 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-3 h-3" />
            Remove
          </Button>
        );
      default:
        return null;
    }
  };

  // Filter departments that have members
  const departmentsWithMembers = departments.filter((dept) => {
    return getMembersByDepartment(dept.id).length > 0;
  });

  const totalMembers = departmentsWithMembers.reduce(
    (acc, dept) => acc + getMembersByDepartment(dept.id).length,
    0
  );

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-card rounded-lg border border-border">
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-t-lg">
            <div className="flex items-center gap-3">
              {isOpen ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
              <Users className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Team Members</h3>
            </div>
            <span className="text-sm text-muted-foreground">
              {totalMembers} member{totalMembers !== 1 ? "s" : ""}
            </span>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="divide-y divide-border border-t border-border">
            {departmentsWithMembers.map((department) => {
              const departmentMembers = getMembersByDepartment(department.id);
              const isInternal = department.type === "internal";

              return (
                <div key={department.id}>
                  <div className="flex items-center justify-between p-4 bg-muted/30">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{department.name}</span>
                      <Badge
                        variant="secondary"
                        className={
                          isInternal
                            ? "bg-muted text-muted-foreground"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                        }
                      >
                        {isInternal ? "Internal" : "External"}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {departmentMembers.length} member{departmentMembers.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="px-4 pb-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {departmentMembers.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">{member.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                {member.email}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(member.status)}</TableCell>
                            <TableCell className="text-right">
                              {getActionButton(member)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
