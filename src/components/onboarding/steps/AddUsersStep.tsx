import { useState } from "react";
import { UserPlus, Trash2, Mail, Briefcase, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OnboardingData, OnboardingUser } from "@/types/onboarding";
import { mockDepartments } from "@/data/mockDepartments";
import { cn } from "@/lib/utils";

interface AddUsersStepProps {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
}

const ROLES = ["Manager", "Team Lead", "Staff Member", "Administrator"];

export function AddUsersStep({ data, onChange }: AddUsersStepProps) {
  const [newUser, setNewUser] = useState<Partial<OnboardingUser>>({
    name: "",
    email: "",
    role: "",
    department: "",
  });

  const handleAddUser = () => {
    if (newUser.name && newUser.email && newUser.role && newUser.department) {
      const user: OnboardingUser = {
        id: Date.now().toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
      };
      onChange({ users: [...data.users, user] });
      setNewUser({ name: "", email: "", role: "", department: "" });
    }
  };

  const handleRemoveUser = (id: string) => {
    onChange({ users: data.users.filter(u => u.id !== id) });
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <UserPlus className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Add your team members</h2>
        <p className="text-muted-foreground mt-2">Invite your colleagues to join the platform</p>
      </div>

      {/* Add user form */}
      <div className="bg-muted/30 rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Full Name</Label>
            <Input
              placeholder="John Doe"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="john@example.com"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="pl-10 h-11"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Role</Label>
            <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
              <SelectTrigger className="h-11">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <SelectValue placeholder="Select role" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {ROLES.map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Department</Label>
            <Select value={newUser.department} onValueChange={(value) => setNewUser({ ...newUser, department: value })}>
              <SelectTrigger className="h-11">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <SelectValue placeholder="Select department" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {mockDepartments.map(dept => (
                  <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button 
          onClick={handleAddUser} 
          className="w-full"
          disabled={!newUser.name || !newUser.email || !newUser.role || !newUser.department}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      {/* Users list */}
      {data.users.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Added Members ({data.users.length})</h3>
          <div className="space-y-2 max-h-[240px] overflow-y-auto">
            {data.users.map((user, index) => (
              <div 
                key={user.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border border-border bg-card",
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-semibold text-primary">
                      {user.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-foreground">{user.role}</p>
                    <p className="text-xs text-muted-foreground">{user.department}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemoveUser(user.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.users.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
          <UserPlus className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No team members added yet</p>
          <p className="text-sm text-muted-foreground">You can add them now or later from settings</p>
        </div>
      )}
    </div>
  );
}
