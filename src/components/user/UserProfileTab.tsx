import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar as CalendarIcon,
  Heart,
  AlertCircle,
  Users,
  Edit,
  Save,
  X,
  Cake,
  Gift,
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  Sparkles,
  Plus,
  Trash2,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { StaffMember, CulturalCelebration } from "@/types/staff";
import { getDepartmentById, DEFAULT_DEPARTMENTS } from "@/types/departments";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function UserProfileTab() {
  const { currentUser, setCurrentUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  
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
        culturalCelebrations: currentUser.culturalCelebrations || [],
        likes: currentUser.likes || [],
        dislikes: currentUser.dislikes || [],
      });
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const department = getDepartmentById(DEFAULT_DEPARTMENTS, currentUser.departmentId);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleSave = () => {
    if (currentUser && formData) {
      const emailChanged = formData.email !== currentUser.email;
      
      if (emailChanged && formData.email) {
        setPendingEmail(formData.email);
        toast.info("A verification email has been sent to your new email address.");
        
        const updatedUser: StaffMember = {
          ...currentUser,
          ...formData,
          email: currentUser.email,
          updatedAt: new Date(),
        };
        setCurrentUser(updatedUser);
      } else {
        const updatedUser: StaffMember = {
          ...currentUser,
          ...formData,
          updatedAt: new Date(),
        };
        setCurrentUser(updatedUser);
        toast.success("Profile updated successfully!");
      }
      
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
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

  const handleResendVerification = () => {
    toast.success("Verification email resent!");
  };

  const handleCancelEmailChange = () => {
    setPendingEmail(null);
    setFormData(prev => ({ ...prev, email: currentUser.email }));
    toast.info("Email change cancelled");
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

  const addCelebration = () => {
    const newCelebration: CulturalCelebration = {
      id: `celebration-${Date.now()}`,
      name: "",
      date: new Date(),
    };
    setFormData(prev => ({
      ...prev,
      culturalCelebrations: [...(prev.culturalCelebrations || []), newCelebration],
    }));
  };

  const updateCelebration = (id: string, field: keyof CulturalCelebration, value: any) => {
    setFormData(prev => ({
      ...prev,
      culturalCelebrations: (prev.culturalCelebrations || []).map(c =>
        c.id === id ? { ...c, [field]: value } : c
      ),
    }));
  };

  const removeCelebration = (id: string) => {
    setFormData(prev => ({
      ...prev,
      culturalCelebrations: (prev.culturalCelebrations || []).filter(c => c.id !== id),
    }));
  };

  // Shared input class for touch-friendly sizing on mobile
  const inputClass = "h-11 md:h-10 text-base md:text-sm";
  const textareaClass = "text-base md:text-sm min-h-[44px]";
  const readOnlyClass = "text-sm py-2.5 px-3 bg-muted rounded-lg min-h-[44px] md:min-h-0 flex items-center";

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Profile Header Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary/80 px-4 py-5 md:px-6 md:py-6">
          <div className="flex items-center gap-3 md:gap-4">
            <Avatar className="h-14 w-14 md:h-20 md:w-20 border-3 md:border-4 border-primary-foreground/20 shrink-0">
              <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-lg md:text-2xl font-semibold">
                {getInitials(currentUser.firstName, currentUser.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-primary-foreground">
              <h2 className="text-lg md:text-2xl font-bold truncate">
                {currentUser.firstName} {currentUser.lastName}
              </h2>
              <p className="text-primary-foreground/80 text-sm md:text-base truncate">{currentUser.role}</p>
              {department && (
                <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0 text-[11px] md:text-xs mt-1.5">
                  <Building2 className="w-3 h-3 mr-1" />
                  {department.name}
                </Badge>
              )}
            </div>
          </div>
          {/* Edit/Save buttons below on mobile, inline on desktop */}
          <div className="flex items-center gap-2 mt-4 md:mt-0 md:absolute md:top-6 md:right-6">
            {!isEditing ? (
              <Button
                variant="secondary"
                onClick={() => setIsEditing(true)}
                className="gap-2 w-full md:w-auto h-11 md:h-10 active:scale-[0.97]"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  className="text-primary-foreground hover:bg-primary-foreground/10 flex-1 md:flex-none h-11 md:h-10 active:scale-[0.97]"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleSave}
                  className="gap-2 flex-1 md:flex-none h-11 md:h-10 active:scale-[0.97]"
                >
                  <Save className="w-4 h-4" />
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Pending Email Verification Alert */}
      {pendingEmail && (
        <Alert className="border-warning bg-warning/10">
          <Clock className="h-4 w-4 text-warning" />
          <AlertDescription className="flex flex-col gap-3">
            <div>
              <span className="font-medium">Email verification pending:</span>{" "}
              <span className="text-muted-foreground break-all">{pendingEmail}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleResendVerification} className="gap-1.5 h-10 md:h-8 active:scale-[0.97]">
                <Send className="w-3.5 h-3.5" />
                Resend
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCancelEmailChange} className="text-destructive hover:text-destructive h-10 md:h-8">
                Cancel
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                {isEditing ? (
                  <Input id="firstName" value={formData.firstName || ""} onChange={(e) => updateFormField("firstName", e.target.value)} className={inputClass} />
                ) : (
                  <p className={readOnlyClass}>{currentUser.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                {isEditing ? (
                  <Input id="lastName" value={formData.lastName || ""} onChange={(e) => updateFormField("lastName", e.target.value)} className={inputClass} />
                ) : (
                  <p className={readOnlyClass}>{currentUser.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email
                {pendingEmail && (
                  <Badge variant="outline" className="text-[10px] md:text-xs text-warning border-warning">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending
                  </Badge>
                )}
              </Label>
              {isEditing ? (
                <div className="space-y-1">
                  <Input id="email" type="email" value={formData.email || ""} onChange={(e) => updateFormField("email", e.target.value)} className={inputClass} />
                  {formData.email !== currentUser.email && (
                    <p className="text-xs text-muted-foreground">A verification email will be sent to confirm this change</p>
                  )}
                </div>
              ) : (
                <p className={cn(readOnlyClass, "gap-2")}>
                  <span className="truncate">{currentUser.email}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                Phone
              </Label>
              {isEditing ? (
                <Input id="phone" type="tel" value={formData.phone || ""} onChange={(e) => updateFormField("phone", e.target.value)} placeholder="Enter phone number" className={inputClass} />
              ) : (
                <p className={readOnlyClass}>{currentUser.phone || "Not provided"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Address
              </Label>
              {isEditing ? (
                <Textarea id="address" value={formData.address || ""} onChange={(e) => updateFormField("address", e.target.value)} placeholder="Enter your address" rows={2} className={textareaClass} />
              ) : (
                <p className={readOnlyClass}>{currentUser.address || "Not provided"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Cake className="w-4 h-4 text-muted-foreground" />
                Birthday
              </Label>
              {isEditing ? (
                <Input type="date" value={formData.birthday ? format(formData.birthday, "yyyy-MM-dd") : ""} onChange={(e) => updateFormField("birthday", e.target.value ? new Date(e.target.value) : undefined)} className={inputClass} />
              ) : (
                <p className={readOnlyClass}>{currentUser.birthday ? format(currentUser.birthday, "MMMM d, yyyy") : "Not provided"}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card>
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                {isEditing ? (
                  <Input value={formData.emergencyContact?.name || ""} onChange={(e) => updateNestedField("emergencyContact", "name", e.target.value)} placeholder="Contact name" className={inputClass} />
                ) : (
                  <p className={readOnlyClass}>{currentUser.emergencyContact?.name || "Not provided"}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Relationship</Label>
                {isEditing ? (
                  <Input value={formData.emergencyContact?.relationship || ""} onChange={(e) => updateNestedField("emergencyContact", "relationship", e.target.value)} placeholder="e.g., Spouse" className={inputClass} />
                ) : (
                  <p className={readOnlyClass}>{currentUser.emergencyContact?.relationship || "Not provided"}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                {isEditing ? (
                  <Input type="tel" value={formData.emergencyContact?.phone || ""} onChange={(e) => updateNestedField("emergencyContact", "phone", e.target.value)} placeholder="Phone number" className={inputClass} />
                ) : (
                  <p className={readOnlyClass}>{currentUser.emergencyContact?.phone || "Not provided"}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                {isEditing ? (
                  <Input type="email" value={formData.emergencyContact?.email || ""} onChange={(e) => updateNestedField("emergencyContact", "email", e.target.value)} placeholder="Email" className={inputClass} />
                ) : (
                  <p className={readOnlyClass}>{currentUser.emergencyContact?.email || "Not provided"}</p>
                )}
              </div>
            </div>

            <Separator className="my-3" />

            <h4 className="font-medium text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Next of Kin
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                {isEditing ? (
                  <Input value={formData.nextOfKin?.name || ""} onChange={(e) => updateNestedField("nextOfKin", "name", e.target.value)} placeholder="Name" className={inputClass} />
                ) : (
                  <p className={readOnlyClass}>{currentUser.nextOfKin?.name || "Not provided"}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Relationship</Label>
                {isEditing ? (
                  <Input value={formData.nextOfKin?.relationship || ""} onChange={(e) => updateNestedField("nextOfKin", "relationship", e.target.value)} placeholder="e.g., Parent, Sibling" className={inputClass} />
                ) : (
                  <p className={readOnlyClass}>{currentUser.nextOfKin?.relationship || "Not provided"}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                {isEditing ? (
                  <Input type="tel" value={formData.nextOfKin?.phone || ""} onChange={(e) => updateNestedField("nextOfKin", "phone", e.target.value)} placeholder="Phone" className={inputClass} />
                ) : (
                  <p className={readOnlyClass}>{currentUser.nextOfKin?.phone || "Not provided"}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                {isEditing ? (
                  <Input type="email" value={formData.nextOfKin?.email || ""} onChange={(e) => updateNestedField("nextOfKin", "email", e.target.value)} placeholder="Email" className={inputClass} />
                ) : (
                  <p className={readOnlyClass}>{currentUser.nextOfKin?.email || "Not provided"}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Address
              </Label>
              {isEditing ? (
                <Textarea value={formData.nextOfKin?.address || ""} onChange={(e) => updateNestedField("nextOfKin", "address", e.target.value)} placeholder="Full address" rows={2} className={textareaClass} />
              ) : (
                <p className={readOnlyClass}>{currentUser.nextOfKin?.address || "Not provided"}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cultural Celebrations */}
        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3 md:pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Cultural Celebrations
            </CardTitle>
            <Button variant="outline" size="sm" onClick={addCelebration} className="gap-1.5 h-10 md:h-8 active:scale-[0.97]">
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {(formData.culturalCelebrations || []).length > 0 ? (
              (formData.culturalCelebrations || []).map((celebration) => (
                <div key={celebration.id} className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <Input
                      value={celebration.name}
                      onChange={(e) => updateCelebration(celebration.id, "name", e.target.value)}
                      placeholder="Celebration name"
                      className={cn(inputClass, "flex-1")}
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-11 md:h-10",
                            !celebration.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                          <span className="truncate">
                            {celebration.date ? format(celebration.date, "MMM d") : "Pick date"}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={celebration.date}
                          onSelect={(date) => date && updateCelebration(celebration.id, "date", date)}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive shrink-0 h-11 w-11 md:h-10 md:w-10 active:scale-[0.95]"
                    onClick={() => removeCelebration(celebration.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No celebrations added</p>
            )}
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-muted-foreground" />
                    Likes
                  </Label>
                  {isEditing ? (
                    <Input
                      value={formData.likes?.join(", ") || ""}
                      onChange={(e) => updateFormField("likes", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                      placeholder="Coffee, Books, Music"
                      className={inputClass}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2 min-h-[44px] md:min-h-0 items-center">
                      {currentUser.likes && currentUser.likes.length > 0 ? (
                        currentUser.likes.map((like, i) => (
                          <Badge key={i} variant="secondary" className="text-xs py-1">{like}</Badge>
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
                      placeholder="Loud noises"
                      className={inputClass}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2 min-h-[44px] md:min-h-0 items-center">
                      {currentUser.dislikes && currentUser.dislikes.length > 0 ? (
                        currentUser.dislikes.map((dislike, i) => (
                          <Badge key={i} variant="outline" className="text-xs py-1">{dislike}</Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Not provided</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Dietary Restrictions</Label>
                  {isEditing ? (
                    <Input
                      value={formData.preferences?.dietaryRestrictions?.join(", ") || ""}
                      onChange={(e) => updateNestedField("preferences", "dietaryRestrictions", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                      placeholder="Vegetarian, Gluten-free"
                      className={inputClass}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2 min-h-[44px] md:min-h-0 items-center">
                      {currentUser.preferences?.dietaryRestrictions && currentUser.preferences.dietaryRestrictions.length > 0 ? (
                        currentUser.preferences.dietaryRestrictions.map((r, i) => (
                          <Badge key={i} variant="secondary" className="text-xs py-1">{r}</Badge>
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
                      placeholder="Preferred hours, environment..."
                      rows={2}
                      className={textareaClass}
                    />
                  ) : (
                    <p className={readOnlyClass}>{currentUser.preferences?.workPreferences || "Not provided"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    Preferred Contact Method
                  </Label>
                  {isEditing ? (
                    <Select
                      value={formData.preferences?.communicationPreference || "email"}
                      onValueChange={(value) => updateNestedField("preferences", "communicationPreference", value)}
                    >
                      <SelectTrigger className="h-11 md:h-10 text-base md:text-sm">
                        <SelectValue placeholder="Select preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone Call</SelectItem>
                        <SelectItem value="sms">SMS / Text</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className={cn(readOnlyClass, "capitalize")}>{currentUser.preferences?.communicationPreference || "Email"}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <p className="text-xs text-muted-foreground text-center pb-4">
        Last updated: {format(currentUser.updatedAt, "MMMM d, yyyy 'at' h:mm a")}
      </p>
    </div>
  );
}