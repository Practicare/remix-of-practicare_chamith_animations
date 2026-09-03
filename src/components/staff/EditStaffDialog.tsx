import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, X, Shield } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  StaffMember, 
  Department, 
  CulturalCelebration,
  StaffRoleLevel,
  StaffModulePermissions,
  STAFF_ROLE_LEVELS,
  MODULE_PERMISSIONS,
  getDefaultPermissionsForRole,
} from "@/types/staff";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface EditStaffDialogProps {
  staff: StaffMember | null;
  departments: Department[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<StaffMember>) => void;
}

export function EditStaffDialog({ staff, departments, open, onOpenChange, onSave }: EditStaffDialogProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [role, setRole] = useState("");
  const [birthday, setBirthday] = useState<Date>();
  const [address, setAddress] = useState("");
  
  // Emergency Contact
  const [ecName, setEcName] = useState("");
  const [ecRelationship, setEcRelationship] = useState("");
  const [ecPhone, setEcPhone] = useState("");
  const [ecEmail, setEcEmail] = useState("");
  
  // Next of Kin
  const [nokName, setNokName] = useState("");
  const [nokRelationship, setNokRelationship] = useState("");
  const [nokPhone, setNokPhone] = useState("");
  const [nokEmail, setNokEmail] = useState("");
  const [nokAddress, setNokAddress] = useState("");
  
  // Preferences
  const [dietary, setDietary] = useState("");
  const [workPreferences, setWorkPreferences] = useState("");
  const [communicationPref, setCommunicationPref] = useState<"email" | "phone" | "sms">("email");
  const [prefNotes, setPrefNotes] = useState("");
  
  // Likes & Dislikes
  const [likes, setLikes] = useState("");
  const [dislikes, setDislikes] = useState("");
  
  // Cultural Celebrations
  const [culturalCelebrations, setCulturalCelebrations] = useState<CulturalCelebration[]>([]);
  const [newCelebrationName, setNewCelebrationName] = useState("");
  const [newCelebrationDate, setNewCelebrationDate] = useState<Date>();
  
  // Role Level and Permissions
  const [roleLevel, setRoleLevel] = useState<StaffRoleLevel>("staff");
  const [modulePermissions, setModulePermissions] = useState<StaffModulePermissions[]>(
    getDefaultPermissionsForRole("staff")
  );

  useEffect(() => {
    if (staff) {
      setFirstName(staff.firstName);
      setLastName(staff.lastName);
      setEmail(staff.email);
      setPhone(staff.phone || "");
      setDepartmentId(staff.departmentId);
      setRole(staff.role);
      setRoleLevel(staff.roleLevel || "staff");
      setModulePermissions(staff.modulePermissions || getDefaultPermissionsForRole(staff.roleLevel || "staff"));
      setBirthday(staff.birthday);
      setAddress(staff.address || "");
      
      setEcName(staff.emergencyContact?.name || "");
      setEcRelationship(staff.emergencyContact?.relationship || "");
      setEcPhone(staff.emergencyContact?.phone || "");
      setEcEmail(staff.emergencyContact?.email || "");
      
      setNokName(staff.nextOfKin?.name || "");
      setNokRelationship(staff.nextOfKin?.relationship || "");
      setNokPhone(staff.nextOfKin?.phone || "");
      setNokEmail(staff.nextOfKin?.email || "");
      setNokAddress(staff.nextOfKin?.address || "");
      
      setDietary(staff.preferences?.dietaryRestrictions?.join(", ") || "");
      setWorkPreferences(staff.preferences?.workPreferences || "");
      setCommunicationPref(staff.preferences?.communicationPreference || "email");
      setPrefNotes(staff.preferences?.notes || "");
      
      setLikes(staff.likes?.join(", ") || "");
      setDislikes(staff.dislikes?.join(", ") || "");
      
      setCulturalCelebrations(staff.culturalCelebrations || []);
    }
  }, [staff]);

  // Update permissions when role level changes
  const handleRoleLevelChange = (newRole: StaffRoleLevel) => {
    setRoleLevel(newRole);
    setModulePermissions(getDefaultPermissionsForRole(newRole));
  };

  const toggleModulePermission = (module: string, field: "canView" | "canEdit") => {
    setModulePermissions(prev => prev.map(p => {
      if (p.module === module) {
        if (field === "canEdit" && !p.canView) {
          return { ...p, canView: true, canEdit: true };
        }
        if (field === "canView" && p.canView && p.canEdit) {
          return { ...p, canView: false, canEdit: false };
        }
        return { ...p, [field]: !p[field] };
      }
      return p;
    }));
  };

  const handleAddCelebration = () => {
    if (newCelebrationName.trim() && newCelebrationDate) {
      const newCelebration: CulturalCelebration = {
        id: `cc-${Date.now()}`,
        name: newCelebrationName.trim(),
        date: newCelebrationDate,
      };
      setCulturalCelebrations([...culturalCelebrations, newCelebration]);
      setNewCelebrationName("");
      setNewCelebrationDate(undefined);
    }
  };

  const handleRemoveCelebration = (id: string) => {
    setCulturalCelebrations(culturalCelebrations.filter(c => c.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!staff || !firstName.trim() || !lastName.trim() || !email.trim() || !departmentId || !role.trim()) {
      return;
    }

    const updates: Partial<StaffMember> = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      departmentId,
      role: role.trim(),
      roleLevel,
      modulePermissions,
      birthday: birthday || undefined,
      address: address.trim() || undefined,
      emergencyContact: ecName.trim() ? {
        name: ecName.trim(),
        relationship: ecRelationship.trim(),
        phone: ecPhone.trim(),
        email: ecEmail.trim() || undefined,
      } : undefined,
      nextOfKin: nokName.trim() ? {
        name: nokName.trim(),
        relationship: nokRelationship.trim(),
        phone: nokPhone.trim(),
        email: nokEmail.trim() || undefined,
        address: nokAddress.trim() || undefined,
      } : undefined,
      preferences: {
        dietaryRestrictions: dietary.trim() ? dietary.split(",").map(d => d.trim()) : undefined,
        workPreferences: workPreferences.trim() || undefined,
        communicationPreference: communicationPref,
        notes: prefNotes.trim() || undefined,
      },
      likes: likes.trim() ? likes.split(",").map(l => l.trim()) : undefined,
      dislikes: dislikes.trim() ? dislikes.split(",").map(d => d.trim()) : undefined,
      culturalCelebrations: culturalCelebrations.length > 0 ? culturalCelebrations : undefined,
      updatedAt: new Date(),
    };

    onSave(staff.id, updates);
    onOpenChange(false);
  };

  if (!staff) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Staff Profile</DialogTitle>
          <DialogDescription>
            Update {staff.firstName}'s profile information.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="emergency">Emergency</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="celebrations">Celebrations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editFirstName">First Name *</Label>
                  <Input
                    id="editFirstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editLastName">Last Name *</Label>
                  <Input
                    id="editLastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editEmail">Email *</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPhone">Phone</Label>
                  <Input
                    id="editPhone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department *</Label>
                  <Select value={departmentId} onValueChange={setDepartmentId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editRole">Role *</Label>
                  <Input
                    id="editRole"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="permissions" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Role Level *</Label>
                <Select value={roleLevel} onValueChange={(v) => handleRoleLevelChange(v as StaffRoleLevel)}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {STAFF_ROLE_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Admin role has full edit access to all modules. Other roles have view-only access by default.
                </p>
              </div>
              
              <div className="space-y-3">
                <Label>Module Permissions</Label>
                <div className="border rounded-lg divide-y">
                  <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 text-sm font-medium">
                    <span>Module</span>
                    <span className="text-center">View</span>
                    <span className="text-center">Edit</span>
                  </div>
                  {MODULE_PERMISSIONS.map((mod) => {
                    const permission = modulePermissions.find(p => p.module === mod.value);
                    return (
                      <div key={mod.value} className="grid grid-cols-3 gap-4 p-3 items-center">
                        <div>
                          <p className="font-medium text-sm">{mod.label}</p>
                          <p className="text-xs text-muted-foreground">{mod.description}</p>
                        </div>
                        <div className="flex justify-center">
                          <Checkbox 
                            checked={permission?.canView ?? true}
                            onCheckedChange={() => toggleModulePermission(mod.value, "canView")}
                          />
                        </div>
                        <div className="flex justify-center">
                          <Checkbox 
                            checked={permission?.canEdit ?? false}
                            onCheckedChange={() => toggleModulePermission(mod.value, "canEdit")}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="emergency" className="space-y-6 mt-4">
              <div className="space-y-4">
                <h4 className="font-medium">Emergency Contact</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={ecName}
                      onChange={(e) => setEcName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Relationship</Label>
                    <Input
                      value={ecRelationship}
                      onChange={(e) => setEcRelationship(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={ecPhone}
                      onChange={(e) => setEcPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={ecEmail}
                      onChange={(e) => setEcEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Next of Kin</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={nokName}
                      onChange={(e) => setNokName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Relationship</Label>
                    <Input
                      value={nokRelationship}
                      onChange={(e) => setNokRelationship(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={nokPhone}
                      onChange={(e) => setNokPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={nokEmail}
                      onChange={(e) => setNokEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={nokAddress}
                    onChange={(e) => setNokAddress(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="preferences" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Dietary Restrictions</Label>
                <Input
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                  placeholder="Comma separated"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Work Preferences</Label>
                <Textarea
                  value={workPreferences}
                  onChange={(e) => setWorkPreferences(e.target.value)}
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Communication Preference</Label>
                <Select value={communicationPref} onValueChange={(v) => setCommunicationPref(v as "email" | "phone" | "sms")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Additional Notes</Label>
                <Textarea
                  value={prefNotes}
                  onChange={(e) => setPrefNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="personal" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Birthday</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !birthday && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {birthday ? format(birthday, "PPP") : "Select birthday"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={birthday}
                      onSelect={setBirthday}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>Likes</Label>
                <Input
                  value={likes}
                  onChange={(e) => setLikes(e.target.value)}
                  placeholder="Comma separated"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Dislikes</Label>
                <Input
                  value={dislikes}
                  onChange={(e) => setDislikes(e.target.value)}
                  placeholder="Comma separated"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="celebrations" className="space-y-4 mt-4">
              <div className="space-y-4">
                <h4 className="font-medium">Cultural Celebrations</h4>
                
                {culturalCelebrations.length > 0 && (
                  <div className="space-y-2">
                    {culturalCelebrations.map((celebration) => (
                      <div key={celebration.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{celebration.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(celebration.date, "MMMM d")}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveCelebration(celebration.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="p-4 border border-dashed rounded-lg space-y-3">
                  <h5 className="text-sm font-medium">Add Celebration</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Celebration name"
                      value={newCelebrationName}
                      onChange={(e) => setNewCelebrationName(e.target.value)}
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !newCelebrationDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newCelebrationDate ? format(newCelebrationDate, "MMM d") : "Date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newCelebrationDate}
                          onSelect={setNewCelebrationDate}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCelebration}
                    disabled={!newCelebrationName.trim() || !newCelebrationDate}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
