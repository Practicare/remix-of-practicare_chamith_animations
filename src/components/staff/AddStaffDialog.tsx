import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Plus, CalendarIcon, Mail, X, Shield, Check, ChevronsUpDown, UserPlus } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

// Default roles list
const DEFAULT_ROLES = [
  "Practice Manager",
  "Senior Nurse",
  "Registered Nurse",
  "Enrolled Nurse",
  "Receptionist",
  "Senior Receptionist",
  "General Practitioner",
  "Specialist",
  "Practice Nurse",
  "Clinical Assistant",
  "Administration Officer",
  "Cleaner",
  "IT Support",
];

interface AddStaffDialogProps {
  departments: Department[];
  onAddStaff: (staff: Omit<StaffMember, "id" | "createdAt" | "updatedAt">) => void;
  defaultDepartmentId?: string;
  triggerLabel?: string;
  triggerVariant?: "default" | "ghost" | "outline";
  triggerSize?: "default" | "sm" | "icon";
}

export function AddStaffDialog({ departments, onAddStaff, defaultDepartmentId, triggerLabel = "Add Staff", triggerVariant = "default", triggerSize = "default" }: AddStaffDialogProps) {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [departmentId, setDepartmentId] = useState(defaultDepartmentId || "");
  const [role, setRole] = useState("");
  const [rolePopoverOpen, setRolePopoverOpen] = useState(false);
  const [customRoles, setCustomRoles] = useState<string[]>([]);
  const [newRoleInput, setNewRoleInput] = useState("");
  const [isAddingNewRole, setIsAddingNewRole] = useState(false);
  const [birthday, setBirthday] = useState<Date>();
  const [address, setAddress] = useState("");
  
  // All available roles (default + custom)
  const allRoles = [...DEFAULT_ROLES, ...customRoles].sort();
  
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
  
  // Send invite
  const [sendInvite, setSendInvite] = useState(true);

  // Handle adding a new custom role
  const handleAddNewRole = () => {
    if (newRoleInput.trim() && !allRoles.includes(newRoleInput.trim())) {
      setCustomRoles(prev => [...prev, newRoleInput.trim()]);
      setRole(newRoleInput.trim());
      setNewRoleInput("");
      setIsAddingNewRole(false);
      setRolePopoverOpen(false);
      toast.success(`Role "${newRoleInput.trim()}" added`);
    } else if (allRoles.includes(newRoleInput.trim())) {
      toast.error("This role already exists");
    }
  };

  // Update permissions when role level changes
  const handleRoleLevelChange = (newRole: StaffRoleLevel) => {
    setRoleLevel(newRole);
    setModulePermissions(getDefaultPermissionsForRole(newRole));
  };

  const toggleModulePermission = (module: string, field: "canView" | "canEdit") => {
    setModulePermissions(prev => prev.map(p => {
      if (p.module === module) {
        if (field === "canEdit" && !p.canView) {
          // If enabling edit, also enable view
          return { ...p, canView: true, canEdit: true };
        }
        if (field === "canView" && p.canView && p.canEdit) {
          // If disabling view, also disable edit
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
    
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !departmentId || !role.trim()) {
      return;
    }

    const newStaff: Omit<StaffMember, "id" | "createdAt" | "updatedAt"> = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      departmentId,
      role: role.trim(),
      roleLevel,
      modulePermissions,
      invitationStatus: sendInvite ? "pending" : "accepted",
      invitedAt: sendInvite ? new Date() : undefined,
      acceptedAt: sendInvite ? undefined : new Date(),
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
    };

    onAddStaff(newStaff);
    resetForm();
    setOpen(false);
  };

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setDepartmentId("");
    setRole("");
    setRoleLevel("staff");
    setModulePermissions(getDefaultPermissionsForRole("staff"));
    setBirthday(undefined);
    setAddress("");
    setEcName("");
    setEcRelationship("");
    setEcPhone("");
    setEcEmail("");
    setNokName("");
    setNokRelationship("");
    setNokPhone("");
    setNokEmail("");
    setNokAddress("");
    setDietary("");
    setWorkPreferences("");
    setCommunicationPref("email");
    setPrefNotes("");
    setLikes("");
    setDislikes("");
    setCulturalCelebrations([]);
    setNewCelebrationName("");
    setNewCelebrationDate(undefined);
    setSendInvite(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" variant={triggerVariant} size={triggerSize}>
          <Plus className="w-4 h-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new staff member to your practice.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="emergency">Emergency</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="celebrations">Celebrations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0412 345 678"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select value={departmentId} onValueChange={setDepartmentId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
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
                  <Label htmlFor="role">Role *</Label>
                  <Popover open={rolePopoverOpen} onOpenChange={setRolePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={rolePopoverOpen}
                        className="w-full justify-between font-normal"
                      >
                        {role || "Select or add role..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      {isAddingNewRole ? (
                        <div className="p-3 space-y-3">
                          <Label className="text-sm font-medium">New Role Name</Label>
                          <Input
                            value={newRoleInput}
                            onChange={(e) => setNewRoleInput(e.target.value)}
                            placeholder="Enter new role name"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddNewRole();
                              }
                              if (e.key === "Escape") {
                                setIsAddingNewRole(false);
                                setNewRoleInput("");
                              }
                            }}
                          />
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => {
                                setIsAddingNewRole(false);
                                setNewRoleInput("");
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              className="flex-1"
                              onClick={handleAddNewRole}
                              disabled={!newRoleInput.trim()}
                            >
                              Add Role
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Command>
                          <CommandInput placeholder="Search roles..." />
                          <CommandList>
                            <CommandEmpty>No role found.</CommandEmpty>
                            <CommandGroup>
                              {allRoles.map((r) => (
                                <CommandItem
                                  key={r}
                                  value={r}
                                  onSelect={() => {
                                    setRole(r);
                                    setRolePopoverOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      role === r ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {r}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                            <CommandSeparator />
                            <CommandGroup>
                              <CommandItem
                                onSelect={() => setIsAddingNewRole(true)}
                                className="text-primary"
                              >
                                <UserPlus className="mr-2 h-4 w-4" />
                                Add new role...
                              </CommandItem>
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter address"
                />
              </div>
              
              <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                <input
                  type="checkbox"
                  id="sendInvite"
                  checked={sendInvite}
                  onChange={(e) => setSendInvite(e.target.checked)}
                  className="rounded border-border"
                />
                <Label htmlFor="sendInvite" className="flex items-center gap-2 cursor-pointer">
                  <Mail className="w-4 h-4" />
                  Send invitation email to staff member
                </Label>
              </div>
            </TabsContent>
            
            <TabsContent value="permissions" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Admin Category *</Label>
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
                      placeholder="Contact name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Relationship</Label>
                    <Input
                      value={ecRelationship}
                      onChange={(e) => setEcRelationship(e.target.value)}
                      placeholder="e.g. Spouse, Parent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={ecPhone}
                      onChange={(e) => setEcPhone(e.target.value)}
                      placeholder="Contact phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={ecEmail}
                      onChange={(e) => setEcEmail(e.target.value)}
                      placeholder="Contact email"
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
                      placeholder="Next of kin name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Relationship</Label>
                    <Input
                      value={nokRelationship}
                      onChange={(e) => setNokRelationship(e.target.value)}
                      placeholder="e.g. Spouse, Parent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={nokPhone}
                      onChange={(e) => setNokPhone(e.target.value)}
                      placeholder="Next of kin phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={nokEmail}
                      onChange={(e) => setNokEmail(e.target.value)}
                      placeholder="Next of kin email"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={nokAddress}
                    onChange={(e) => setNokAddress(e.target.value)}
                    placeholder="Next of kin address"
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
                  placeholder="e.g. Vegetarian, Gluten-free (comma separated)"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Work Preferences</Label>
                <Textarea
                  value={workPreferences}
                  onChange={(e) => setWorkPreferences(e.target.value)}
                  placeholder="e.g. Prefers morning shifts, No weekends"
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
                  placeholder="Any other preferences or notes"
                  rows={2}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="personal" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Likes</Label>
                <Input
                  value={likes}
                  onChange={(e) => setLikes(e.target.value)}
                  placeholder="e.g. Coffee, Team events, Plants (comma separated)"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Dislikes</Label>
                <Input
                  value={dislikes}
                  onChange={(e) => setDislikes(e.target.value)}
                  placeholder="e.g. Late meetings, Loud music (comma separated)"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="celebrations" className="space-y-4 mt-4">
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
              
              <div className="space-y-4">
                <h4 className="font-medium">Cultural Celebrations</h4>
                <p className="text-sm text-muted-foreground">
                  Add cultural or religious celebrations that are important to this staff member.
                </p>
                
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
                      placeholder="e.g. Diwali, Eid, Hanukkah"
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
                          {newCelebrationDate ? format(newCelebrationDate, "MMM d") : "Select date"}
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
                    Add Celebration
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {sendInvite ? "Add & Send Invite" : "Add Staff Member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
