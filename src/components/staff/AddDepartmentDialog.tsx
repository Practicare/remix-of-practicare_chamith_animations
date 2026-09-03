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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus, Users, Heart, Stethoscope, FileText, Briefcase, Monitor,
  Building2, Phone, Shield, Wrench, Truck, Package, Crown, Calculator,
  SprayCan, GraduationCap, Microscope, Pill, Syringe, Baby, Brain,
  Eye, Ear, Bone, Activity, Clipboard, FolderOpen, Settings, Star,
  Zap, Coffee, Leaf, Globe, Lock, Mail, type LucideIcon,
} from "lucide-react";
import { Department, DepartmentType } from "@/types/departments";
import { ScrollArea } from "@/components/ui/scroll-area";

const ICON_OPTIONS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "Users", label: "Users", icon: Users },
  { value: "Heart", label: "Heart", icon: Heart },
  { value: "Stethoscope", label: "Stethoscope", icon: Stethoscope },
  { value: "FileText", label: "File Text", icon: FileText },
  { value: "Briefcase", label: "Briefcase", icon: Briefcase },
  { value: "Monitor", label: "Monitor", icon: Monitor },
  { value: "Building2", label: "Building", icon: Building2 },
  { value: "Phone", label: "Phone", icon: Phone },
  { value: "Shield", label: "Shield", icon: Shield },
  { value: "Wrench", label: "Wrench", icon: Wrench },
  { value: "Truck", label: "Truck", icon: Truck },
  { value: "Package", label: "Package", icon: Package },
  { value: "Crown", label: "Crown", icon: Crown },
  { value: "Calculator", label: "Calculator", icon: Calculator },
  { value: "SprayCan", label: "Spray Can", icon: SprayCan },
  { value: "GraduationCap", label: "Graduation", icon: GraduationCap },
  { value: "Microscope", label: "Microscope", icon: Microscope },
  { value: "Pill", label: "Pill", icon: Pill },
  { value: "Syringe", label: "Syringe", icon: Syringe },
  { value: "Baby", label: "Baby", icon: Baby },
  { value: "Brain", label: "Brain", icon: Brain },
  { value: "Eye", label: "Eye", icon: Eye },
  { value: "Ear", label: "Ear", icon: Ear },
  { value: "Bone", label: "Bone", icon: Bone },
  { value: "Activity", label: "Activity", icon: Activity },
  { value: "Clipboard", label: "Clipboard", icon: Clipboard },
  { value: "FolderOpen", label: "Folder", icon: FolderOpen },
  { value: "Settings", label: "Settings", icon: Settings },
  { value: "Star", label: "Star", icon: Star },
  { value: "Zap", label: "Zap", icon: Zap },
  { value: "Coffee", label: "Coffee", icon: Coffee },
  { value: "Leaf", label: "Leaf", icon: Leaf },
  { value: "Globe", label: "Globe", icon: Globe },
  { value: "Lock", label: "Lock", icon: Lock },
  { value: "Mail", label: "Mail", icon: Mail },
];

const COLOR_OPTIONS = [
  { value: "bg-blue-500", label: "Blue" },
  { value: "bg-pink-500", label: "Pink" },
  { value: "bg-green-500", label: "Green" },
  { value: "bg-purple-500", label: "Purple" },
  { value: "bg-orange-500", label: "Orange" },
  { value: "bg-cyan-500", label: "Cyan" },
  { value: "bg-gray-500", label: "Gray" },
  { value: "bg-red-500", label: "Red" },
  { value: "bg-yellow-500", label: "Yellow" },
  { value: "bg-indigo-500", label: "Indigo" },
];

interface AddDepartmentDialogProps {
  onAddDepartment: (department: Omit<Department, "id" | "isDefault">) => void;
}

export function AddDepartmentDialog({ onAddDepartment }: AddDepartmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Users");
  const [color, setColor] = useState("bg-blue-500");
  const [type, setType] = useState<DepartmentType>("internal");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    onAddDepartment({
      name: name.trim(),
      description: description.trim() || undefined,
      icon,
      color,
      type,
    });

    setName("");
    setDescription("");
    setIcon("Users");
    setColor("bg-blue-500");
    setOpen(false);
  };

  const SelectedIcon = ICON_OPTIONS.find(o => o.value === icon)?.icon || Users;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="px-3.5 py-1.5 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Department</DialogTitle>
          <DialogDescription>
            Create a new department for organizing staff members.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deptName">Department Name *</Label>
            <Input
              id="deptName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Laboratory"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="deptDesc">Description</Label>
            <Textarea
              id="deptDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this department"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <ScrollArea className="h-[140px] rounded-lg border border-border p-2">
              <div className="grid grid-cols-7 gap-1.5">
                {ICON_OPTIONS.map((opt) => {
                  const IconComp = opt.icon;
                  const isSelected = icon === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setIcon(opt.value)}
                      title={opt.label}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-foreground text-background"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-border">
                {COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setColor(opt.value)}
                    title={opt.label}
                    className={`w-7 h-7 rounded-full ${opt.value} transition-all ${
                      color === opt.value
                        ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110"
                        : "opacity-70 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as DepartmentType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="external">External</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Department</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
