import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  Heart,
  AlertCircle,
  Users,
  Edit,
  Save,
  X,
  Cake,
  Gift,
  Shield,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { StaffMember } from "@/types/staff";
import { getDepartmentById, DEFAULT_DEPARTMENTS } from "@/types/departments";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfileDialog({ open, onOpenChange }: UserProfileDialogProps) {
  const { currentUser, setCurrentUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  
  // Form state
  const [formData, setFormData] = useState<Partial<StaffMember>>({});

  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        phone: currentUser.phone || "",
        address: currentUser.address || "",
        birthday: currentUser.birthday,
        emergencyContact: currentUser.emergencyContact || {
          name: "",
          relationship: "",
          phone: "",
          email: "",
        },
        nextOfKin: currentUser.nextOfKin || {
          name: "",
          relationship: "",
          phone: "",
          email: "",
          address: "",
        },
        preferences: currentUser.preferences || {
          dietaryRestrictions: [],
          workPreferences: "",
          communicationPreference: "email",
          notes: "",
        },
        likes: currentUser.likes || [],
        dislikes: currentUser.dislikes || [],
      });
    }
  }, [currentUser, open]);

  if (!currentUser) return null;

  const department = getDepartmentById(DEFAULT_DEPARTMENTS, currentUser.departmentId);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleSave = () => {
    if (currentUser) {
      const updatedUser: StaffMember = {
        ...currentUser,
        ...formData,
        updatedAt: new Date(),
      };
      setCurrentUser(updatedUser);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        phone: currentUser.phone || "",
        address: currentUser.address || "",
      });
    }
  };

  const updateFormField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev as any)[parent],
        [field]: value,
      },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-5 text-primary-foreground">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary-foreground/20">
                <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-xl font-semibold">
                  {getInitials(currentUser.firstName, currentUser.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">
                  {currentUser.firstName} {currentUser.lastName}
                </h2>
                <p className="text-primary-foreground/80">{currentUser.role}</p>
                <div className="flex items-center gap-2 mt-1">
                  {department && (
                    <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0 text-xs">
                      <Building2 className="w-3 h-3 mr-1" />
                      {department.name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="gap-1.5"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    className="text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSave}
                    className="gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-4 border-b">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="personal" className="gap-1.5">
                <User className="w-4 h-4" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="emergency" className="gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Emergency
              </TabsTrigger>
              <TabsTrigger value="preferences" className="gap-1.5">
                <Heart className="w-4 h-4" />
                Preferences
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 px-6 py-4">
            {/* Personal Info Tab */}
            <TabsContent value="personal" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={formData.firstName || ""}
                      onChange={(e) => updateFormField("firstName", e.target.value)}
                    />
                  ) : (
                    <p className="text-sm py-2 px-3 bg-muted rounded-md">{currentUser.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      value={formData.lastName || ""}
                      onChange={(e) => updateFormField("lastName", e.target.value)}
                    />
                  ) : (
                    <p className="text-sm py-2 px-3 bg-muted rounded-md">{currentUser.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Email
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => updateFormField("email", e.target.value)}
                  />
                ) : (
                  <p className="text-sm py-2 px-3 bg-muted rounded-md">{currentUser.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  Phone
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone || ""}
                    onChange={(e) => updateFormField("phone", e.target.value)}
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="text-sm py-2 px-3 bg-muted rounded-md">
                    {currentUser.phone || "Not provided"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  Address
                </Label>
                {isEditing ? (
                  <Textarea
                    id="address"
                    value={formData.address || ""}
                    onChange={(e) => updateFormField("address", e.target.value)}
                    placeholder="Enter your address"
                    rows={2}
                  />
                ) : (
                  <p className="text-sm py-2 px-3 bg-muted rounded-md">
                    {currentUser.address || "Not provided"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Cake className="w-4 h-4 text-muted-foreground" />
                  Birthday
                </Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={formData.birthday ? format(formData.birthday, "yyyy-MM-dd") : ""}
                    onChange={(e) => updateFormField("birthday", e.target.value ? new Date(e.target.value) : undefined)}
                  />
                ) : (
                  <p className="text-sm py-2 px-3 bg-muted rounded-md">
                    {currentUser.birthday ? format(currentUser.birthday, "MMMM d, yyyy") : "Not provided"}
                  </p>
                )}
              </div>
            </TabsContent>

            {/* Emergency Contact Tab */}
            <TabsContent value="emergency" className="mt-0 space-y-6">
              <div>
                <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  Emergency Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    {isEditing ? (
                      <Input
                        value={formData.emergencyContact?.name || ""}
                        onChange={(e) => updateNestedField("emergencyContact", "name", e.target.value)}
                        placeholder="Contact name"
                      />
                    ) : (
                      <p className="text-sm py-2 px-3 bg-muted rounded-md">
                        {currentUser.emergencyContact?.name || "Not provided"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Relationship</Label>
                    {isEditing ? (
                      <Input
                        value={formData.emergencyContact?.relationship || ""}
                        onChange={(e) => updateNestedField("emergencyContact", "relationship", e.target.value)}
                        placeholder="e.g., Spouse, Parent"
                      />
                    ) : (
                      <p className="text-sm py-2 px-3 bg-muted rounded-md">
                        {currentUser.emergencyContact?.relationship || "Not provided"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    {isEditing ? (
                      <Input
                        type="tel"
                        value={formData.emergencyContact?.phone || ""}
                        onChange={(e) => updateNestedField("emergencyContact", "phone", e.target.value)}
                        placeholder="Phone number"
                      />
                    ) : (
                      <p className="text-sm py-2 px-3 bg-muted rounded-md">
                        {currentUser.emergencyContact?.phone || "Not provided"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={formData.emergencyContact?.email || ""}
                        onChange={(e) => updateNestedField("emergencyContact", "email", e.target.value)}
                        placeholder="Email address"
                      />
                    ) : (
                      <p className="text-sm py-2 px-3 bg-muted rounded-md">
                        {currentUser.emergencyContact?.email || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Next of Kin
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    {isEditing ? (
                      <Input
                        value={formData.nextOfKin?.name || ""}
                        onChange={(e) => updateNestedField("nextOfKin", "name", e.target.value)}
                        placeholder="Name"
                      />
                    ) : (
                      <p className="text-sm py-2 px-3 bg-muted rounded-md">
                        {currentUser.nextOfKin?.name || "Not provided"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Relationship</Label>
                    {isEditing ? (
                      <Input
                        value={formData.nextOfKin?.relationship || ""}
                        onChange={(e) => updateNestedField("nextOfKin", "relationship", e.target.value)}
                        placeholder="Relationship"
                      />
                    ) : (
                      <p className="text-sm py-2 px-3 bg-muted rounded-md">
                        {currentUser.nextOfKin?.relationship || "Not provided"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    {isEditing ? (
                      <Input
                        type="tel"
                        value={formData.nextOfKin?.phone || ""}
                        onChange={(e) => updateNestedField("nextOfKin", "phone", e.target.value)}
                        placeholder="Phone"
                      />
                    ) : (
                      <p className="text-sm py-2 px-3 bg-muted rounded-md">
                        {currentUser.nextOfKin?.phone || "Not provided"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={formData.nextOfKin?.email || ""}
                        onChange={(e) => updateNestedField("nextOfKin", "email", e.target.value)}
                        placeholder="Email"
                      />
                    ) : (
                      <p className="text-sm py-2 px-3 bg-muted rounded-md">
                        {currentUser.nextOfKin?.email || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <Label>Address</Label>
                  {isEditing ? (
                    <Textarea
                      value={formData.nextOfKin?.address || ""}
                      onChange={(e) => updateNestedField("nextOfKin", "address", e.target.value)}
                      placeholder="Address"
                      rows={2}
                    />
                  ) : (
                    <p className="text-sm py-2 px-3 bg-muted rounded-md">
                      {currentUser.nextOfKin?.address || "Not provided"}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="mt-0 space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-muted-foreground" />
                  Likes
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.likes?.join(", ") || ""}
                    onChange={(e) => updateFormField("likes", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                    placeholder="Coffee, Books, Music (comma separated)"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {currentUser.likes && currentUser.likes.length > 0 ? (
                      currentUser.likes.map((like, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {like}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Not provided</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <X className="w-4 h-4 text-muted-foreground" />
                  Dislikes
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.dislikes?.join(", ") || ""}
                    onChange={(e) => updateFormField("dislikes", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                    placeholder="Loud noises, Crowds (comma separated)"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {currentUser.dislikes && currentUser.dislikes.length > 0 ? (
                      currentUser.dislikes.map((dislike, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {dislike}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Not provided</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Dietary Restrictions</Label>
                {isEditing ? (
                  <Input
                    value={formData.preferences?.dietaryRestrictions?.join(", ") || ""}
                    onChange={(e) => updateNestedField("preferences", "dietaryRestrictions", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                    placeholder="Vegetarian, Gluten-free (comma separated)"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {currentUser.preferences?.dietaryRestrictions && currentUser.preferences.dietaryRestrictions.length > 0 ? (
                      currentUser.preferences.dietaryRestrictions.map((restriction, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {restriction}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">None specified</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Work Preferences</Label>
                {isEditing ? (
                  <Textarea
                    value={formData.preferences?.workPreferences || ""}
                    onChange={(e) => updateNestedField("preferences", "workPreferences", e.target.value)}
                    placeholder="Preferred working hours, environment preferences..."
                    rows={3}
                  />
                ) : (
                  <p className="text-sm py-2 px-3 bg-muted rounded-md">
                    {currentUser.preferences?.workPreferences || "Not provided"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Additional Notes</Label>
                {isEditing ? (
                  <Textarea
                    value={formData.preferences?.notes || ""}
                    onChange={(e) => updateNestedField("preferences", "notes", e.target.value)}
                    placeholder="Any other information you'd like to share..."
                    rows={3}
                  />
                ) : (
                  <p className="text-sm py-2 px-3 bg-muted rounded-md">
                    {currentUser.preferences?.notes || "Not provided"}
                  </p>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/30 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Last updated: {format(currentUser.updatedAt, "MMM d, yyyy")}
          </p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
