import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Mail,
  ShieldCheck,
  PlayCircle,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  Sparkles,
  Shield,
  KeyRound,
  Pencil,
  Lock,
  CheckSquare,
  Search,
  Building2,
  CheckCircle2,
  Clock,
  CircleDot,
  DoorOpen,
  Wand2,
  Package,
  FileText,
  Upload,
  Image as ImageIcon,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import practicareLogoAsset from "@/assets/practicare-logo.png.asset.json";
import { mockDepartments } from "@/data/mockDepartments";

const practicareLogo = practicareLogoAsset.url;

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: number;
  system?: boolean;
}

const INITIAL_ROLES: Role[] = [
  { id: "r1", name: "Admin Assistant", description: "Office staff", permissions: 41 },
  { id: "r2", name: "Cleaner", description: "Cleaning staff", permissions: 8 },
  { id: "r3", name: "Doctor", description: "Medical practitioners", permissions: 24 },
  { id: "r4", name: "Nurse", description: "Registered nurses", permissions: 22 },
  { id: "r5", name: "Owner", description: "Practice owner with full access", permissions: 1, system: true },
  { id: "r6", name: "Receptionist", description: "Front desk staff", permissions: 15 },
];

type InviteeStatus = "pending" | "accepted";

interface Invitee {
  id: string;
  name: string;
  email: string;
  department: string;
  status: InviteeStatus;
}

interface RoomDraft {
  id: string;
  number: string;
  name: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  kind: "doc" | "image" | "sheet";
}

const STEPS = [
  { id: 1, title: "Watch the video", subtitle: "See how AI imports your checklists", icon: PlayCircle },
  { id: 2, title: "Set permissions", subtitle: "Define what each role can do", icon: ShieldCheck },
  { id: 3, title: "Add your team", subtitle: "Invite teammates by email", icon: UserPlus },
  { id: 4, title: "Set up rooms", subtitle: "Add rooms manually or with AI", icon: DoorOpen },
  { id: 5, title: "Set up stock", subtitle: "AI-import your inventory", icon: Package },
  { id: 6, title: "Add documents", subtitle: "Bring policies, FAQs & more", icon: FileText },
];

const TOTAL_STEPS = STEPS.length;

function fileKind(name: string): UploadedFile["kind"] {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "webp", "heic", "gif"].includes(ext)) return "image";
  if (["xls", "xlsx", "csv", "numbers"].includes(ext)) return "sheet";
  return "doc";
}

function KindIcon({ kind, className }: { kind: UploadedFile["kind"]; className?: string }) {
  if (kind === "image") return <ImageIcon className={className} />;
  if (kind === "sheet") return <FileSpreadsheet className={className} />;
  return <FileText className={className} />;
}

export default function TeamOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Roles state (step 2)
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);

  // Invitees state (step 3)
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [draft, setDraft] = useState({ name: "", email: "", department: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | InviteeStatus>("all");

  const addInvitee = () => {
    if (!draft.name.trim() || !draft.email.trim()) return;
    setInvitees((p) => [
      ...p,
      { id: crypto.randomUUID(), name: draft.name, email: draft.email, department: draft.department || "Unassigned", status: "pending" },
    ]);
    setDraft({ name: "", email: "", department: "" });
    setShowAddForm(false);
  };


  const removeInvitee = (id: string) =>
    setInvitees((p) => p.filter((i) => i.id !== id));

  // Rooms state (step 4)
  const [rooms, setRooms] = useState<RoomDraft[]>([]);
  const [roomCount, setRoomCount] = useState("");
  const [aiPracticeType, setAiPracticeType] = useState("General Practice");
  const [aiGenerating, setAiGenerating] = useState(false);

  const generateRooms = (count: number, prefix = "Room") => {
    const created: RoomDraft[] = Array.from({ length: count }, (_, i) => ({
      id: crypto.randomUUID(),
      number: String(i + 1).padStart(2, "0"),
      name: `${prefix} ${i + 1}`,
    }));
    setRooms((p) => [...p, ...created]);
  };

  const handleManualCreate = () => {
    const n = parseInt(roomCount, 10);
    if (!n || n < 1) {
      toast.error("Enter a valid number of rooms.");
      return;
    }
    if (n > 50) {
      toast.error("Please add 50 rooms or fewer at a time.");
      return;
    }
    generateRooms(n);
    setRoomCount("");
    toast.success(`Created ${n} room${n > 1 ? "s" : ""}. Rename them below.`);
  };

  const handleAIGenerate = async () => {
    setAiGenerating(true);
    await new Promise((r) => setTimeout(r, 900));
    const suggestions: Record<string, string[]> = {
      "General Practice": ["Reception", "Waiting Room", "Consult Room 1", "Consult Room 2", "Treatment Room", "Nurse Station", "Sterilisation", "Staff Room"],
      "Dental": ["Reception", "Waiting Room", "Surgery 1", "Surgery 2", "X-Ray Room", "Sterilisation", "Staff Room"],
      "Allied Health": ["Reception", "Waiting Room", "Consult Room 1", "Consult Room 2", "Rehab Gym", "Staff Room"],
      "Specialist": ["Reception", "Waiting Room", "Consult Room 1", "Procedure Room", "Recovery Room", "Staff Room"],
    };
    const list = suggestions[aiPracticeType] ?? suggestions["General Practice"];
    setRooms((p) => [
      ...p,
      ...list.map((name, i) => ({ id: crypto.randomUUID(), number: String(p.length + i + 1).padStart(2, "0"), name })),
    ]);
    setAiGenerating(false);
    toast.success(`AI suggested ${list.length} rooms for ${aiPracticeType}.`);
  };

  const updateRoom = (id: string, patch: Partial<RoomDraft>) =>
    setRooms((p) => p.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const removeRoom = (id: string) => setRooms((p) => p.filter((r) => r.id !== id));

  // Stock (step 5) & Documents (step 6)
  const [stockFiles, setStockFiles] = useState<UploadedFile[]>([]);
  const [docFiles, setDocFiles] = useState<UploadedFile[]>([]);
  const stockInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const ingestFiles = (files: FileList | null, target: "stock" | "doc") => {
    if (!files || files.length === 0) return;
    const items: UploadedFile[] = Array.from(files).map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      kind: fileKind(f.name),
    }));
    if (target === "stock") {
      setStockFiles((p) => [...p, ...items]);
      toast.success(`${items.length} file${items.length > 1 ? "s" : ""} queued. AI will extract items.`);
    } else {
      setDocFiles((p) => [...p, ...items]);
      toast.success(`${items.length} document${items.length > 1 ? "s" : ""} added.`);
    }
  };

  const removeStockFile = (id: string) => setStockFiles((p) => p.filter((f) => f.id !== id));
  const removeDocFile = (id: string) => setDocFiles((p) => p.filter((f) => f.id !== id));

  const next = () => setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));
  const finish = () => {
    toast.success("You're all set! Welcome to Practicare.");
    navigate("/dashboard");
  };


  const progress = (step / STEPS.length) * 100;

  const filteredInvitees = useMemo(() => {
    return invitees.filter((i) => {
      if (searchQuery && !i.name.toLowerCase().includes(searchQuery.toLowerCase()) && !i.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (deptFilter !== "all" && i.department !== deptFilter) return false;
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      return true;
    });
  }, [invitees, searchQuery, deptFilter, statusFilter]);

  const deleteRole = (id: string) => setRoles((r) => r.filter((x) => x.id !== id));
  const addRole = () => {
    const name = prompt("Role name?");
    if (!name) return;
    setRoles((r) => [...r, { id: crypto.randomUUID(), name, description: "Custom role", permissions: 0 }]);
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-8 py-4 flex items-center justify-between">
          <img src={practicareLogo} alt="Practicare" className="h-9" />
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Getting started
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Let's set up your team
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Three quick steps to get your practice running on Practicare.
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => {
              const active = step === s.id;
              const done = step > s.id;
              const Icon = s.icon;
              return (
                <div key={s.id} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-11 h-11 rounded-lg flex items-center justify-center border-2 transition-all ${
                        done
                          ? "bg-primary border-primary text-primary-foreground"
                          : active
                          ? "bg-primary/10 border-primary text-primary scale-110"
                          : "bg-background border-border text-muted-foreground"
                      }`}
                    >
                      {done ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div className="mt-2 text-center hidden sm:block">
                      <div className={`text-xs font-semibold ${active || done ? "text-foreground" : "text-muted-foreground"}`}>
                        Step {s.id}
                      </div>
                      <div className={`text-xs ${active ? "text-primary" : "text-muted-foreground"}`}>
                        {s.title}
                      </div>
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-2 -mt-8 transition-colors ${step > s.id ? "bg-primary" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="h-1 w-full bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="bg-card border rounded-lg shadow-sm overflow-hidden"
          >
            {step === 1 && (
              <div className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">Bring your checklists into Practicare</h2>
                    <p className="text-muted-foreground mt-1">
                      Watch a short intro on how to transfer your current checklists into Practicare using AI —
                      it takes minutes, not hours.
                    </p>
                  </div>
                </div>

                <div className="relative rounded-lg overflow-hidden bg-foreground aspect-video group cursor-pointer mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-foreground to-foreground" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-background/95 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-12 h-12 text-primary fill-primary/20" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-background">
                    <div className="text-xs uppercase tracking-wider opacity-80">Intro · 2 min</div>
                    <div className="font-semibold">Import checklists with PractiCare AI</div>
                  </div>
                </div>

                <div className="bg-muted/40 rounded-lg p-4 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Tip:</span>{" "}
                  Upload a PDF, photo, or paste text — PractiCare AI will structure it into a ready-to-use checklist.
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="p-6 space-y-4">
                <div className="rounded-lg border bg-muted/30 px-4 py-3 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-sm">Role-Based Permissions</div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Create roles for your practice, assign granular permissions to each role, then assign roles to staff members.
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border bg-card">
                  <div className="flex items-center justify-between px-5 py-4 border-b">
                    <div className="flex items-start gap-2">
                      <KeyRound className="w-5 h-5 text-foreground mt-0.5" />
                      <div>
                        <div className="text-lg font-semibold leading-tight">Roles</div>
                        <p className="text-xs text-muted-foreground">Create and manage roles for your practice</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={addRole}>
                      <Plus className="w-4 h-4 mr-1" /> Add Role
                    </Button>
                  </div>

                  <div className="p-3 space-y-2">
                    {roles.map((role) => (
                      <div
                        key={role.id}
                        className="flex items-center justify-between rounded-lg border bg-background px-4 py-3 hover:border-primary/40 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Shield className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm">{role.name}</span>
                              {role.system && (
                                <Badge variant="secondary" className="h-5 text-[10px] gap-1">
                                  <Lock className="w-3 h-3" /> System
                                </Badge>
                              )}
                              <Badge variant="outline" className="h-5 text-[10px] gap-1 font-normal">
                                <CheckSquare className="w-3 h-3" />
                                {role.permissions} permission{role.permissions === 1 ? "" : "s"}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">{role.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => window.open("/settings", "_blank")}
                          >
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => !role.system && deleteRole(role.id)}
                            disabled={role.system}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="p-6 space-y-4">
                <div className="rounded-lg border bg-muted/30 px-4 py-3">
                  <div className="font-semibold text-sm">Staff Directory</div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    View and manage all team members. Filter by department or status, or search by name.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search staff..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button onClick={() => setShowAddForm((s) => !s)}>
                    <Plus className="w-4 h-4 mr-1" /> Add Staff
                  </Button>
                </div>

                <div className="rounded-lg border bg-card p-4 space-y-3">
                  <div className="font-semibold text-sm">Filter Staff</div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Department</Label>
                    <Select value={deptFilter} onValueChange={setDeptFilter}>
                      <SelectTrigger className="mt-1">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <SelectValue placeholder="All Departments" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {mockDepartments.map((d) => (
                          <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {([
                        { v: "all", label: "All", Icon: CircleDot },
                        { v: "accepted", label: "Accepted", Icon: CheckCircle2 },
                        { v: "pending", label: "Pending", Icon: Clock },
                      ] as const).map(({ v, label, Icon }) => {
                        const active = statusFilter === v;
                        return (
                          <button
                            key={v}
                            onClick={() => setStatusFilter(v as typeof statusFilter)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                              active
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background text-foreground border-border hover:border-foreground/30"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" /> {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {showAddForm && (
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">Full name</Label>
                        <Input
                          value={draft.name}
                          onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                          placeholder="e.g. Sarah Chen"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Email</Label>
                        <Input
                          type="email"
                          value={draft.email}
                          onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))}
                          placeholder="sarah@yourpractice.com"
                          onKeyDown={(e) => e.key === "Enter" && addInvitee()}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Department</Label>
                        <Select
                          value={draft.department}
                          onValueChange={(v) => setDraft((p) => ({ ...p, department: v }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockDepartments.map((d) => (
                              <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-3">
                      <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
                      <Button size="sm" onClick={addInvitee}>
                        <Plus className="w-4 h-4 mr-1" /> Add member
                      </Button>
                    </div>
                  </div>
                )}

                {filteredInvitees.length > 0 ? (
                  <div className="border rounded-lg divide-y bg-card">
                    {filteredInvitees.map((i) => (
                      <div key={i.id} className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                            {i.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-sm truncate">{i.name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3" /> {i.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-[10px]">{i.department}</Badge>
                          <Badge variant={i.status === "accepted" ? "default" : "secondary"} className="text-[10px] capitalize">
                            {i.status}
                          </Badge>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeInvitee(i.id)}>
                            <Trash2 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-sm text-muted-foreground border rounded-lg bg-card">
                    No staff members found
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="p-6 space-y-4">
                <div className="rounded-lg border bg-muted/30 px-4 py-3 flex items-start gap-3">
                  <DoorOpen className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-sm">Let's set up your rooms</div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Add rooms in bulk or let AI suggest a layout based on your practice type. You can rename any room.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* AI generate */}
                  <div className="rounded-lg border bg-card p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <Wand2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">AI generated rooms</div>
                        <div className="text-xs text-muted-foreground">Suggested by practice type</div>
                      </div>
                    </div>
                    <Select value={aiPracticeType} onValueChange={setAiPracticeType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General Practice">General Practice</SelectItem>
                        <SelectItem value="Dental">Dental</SelectItem>
                        <SelectItem value="Allied Health">Allied Health</SelectItem>
                        <SelectItem value="Specialist">Specialist</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAIGenerate} disabled={aiGenerating} className="w-full">
                      {aiGenerating ? (<><Sparkles className="w-4 h-4 mr-1 animate-pulse" /> Generating…</>) : (<><Sparkles className="w-4 h-4 mr-1" /> Generate rooms</>)}
                    </Button>
                  </div>

                  {/* Manual bulk */}
                  <div className="rounded-lg border bg-card p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-muted text-foreground flex items-center justify-center">
                        <Plus className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">Add rooms manually</div>
                        <div className="text-xs text-muted-foreground">Auto-create then rename</div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Number of rooms</Label>
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        value={roomCount}
                        onChange={(e) => setRoomCount(e.target.value)}
                        placeholder="e.g. 6"
                        className="mt-1"
                      />
                    </div>
                    <Button variant="outline" onClick={handleManualCreate} className="w-full">
                      <Plus className="w-4 h-4 mr-1" /> Create rooms
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border bg-card">
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div className="font-semibold text-sm">Your rooms ({rooms.length})</div>
                    {rooms.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => setRooms([])}>Clear all</Button>
                    )}
                  </div>
                  {rooms.length === 0 ? (
                    <div className="text-center py-10 text-sm text-muted-foreground">
                      No rooms yet — generate with AI or add manually above.
                    </div>
                  ) : (
                    <div className="p-3 space-y-2">
                      {rooms.map((r) => (
                        <div key={r.id} className="flex items-center gap-2">
                          <Input
                            className="w-24"
                            value={r.number}
                            onChange={(e) => updateRoom(r.id, { number: e.target.value })}
                            placeholder="No."
                          />
                          <Input
                            className="flex-1"
                            value={r.name}
                            onChange={(e) => updateRoom(r.id, { name: e.target.value })}
                            placeholder="Room name"
                          />
                          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => removeRoom(r.id)}>
                            <Trash2 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="p-6 space-y-4">
                <div className="rounded-lg border bg-muted/30 px-4 py-3 flex items-start gap-3">
                  <Package className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-sm">Let's set up your stock now</div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Upload invoices, receipts, inventory sheets, or photos of your storage. PractiCare AI will extract items,
                      quantities and categories automatically.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => stockInputRef.current?.click()}
                  className="w-full rounded-lg border-2 border-dashed border-border hover:border-primary/60 hover:bg-primary/5 transition-colors p-8 text-center"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="font-semibold text-sm">Drop files or click to upload</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Invoices · Receipts · Photos · CSV / Excel inventory
                  </div>
                </button>
                <input
                  ref={stockInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  accept="image/*,.pdf,.csv,.xls,.xlsx"
                  onChange={(e) => { ingestFiles(e.target.files, "stock"); e.target.value = ""; }}
                />

                {stockFiles.length > 0 && (
                  <div className="rounded-lg border bg-card">
                    <div className="px-4 py-3 border-b font-semibold text-sm">
                      Queued for AI import ({stockFiles.length})
                    </div>
                    <div className="divide-y">
                      {stockFiles.map((f) => (
                        <div key={f.id} className="flex items-center justify-between px-4 py-2.5">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <KindIcon kind={f.kind} className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">{f.name}</div>
                              <div className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(1)} KB</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px] gap-1">
                              <Sparkles className="w-3 h-3" /> AI ready
                            </Badge>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeStockFile(f.id)}>
                              <Trash2 className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 6 && (
              <div className="p-6 space-y-4">
                <div className="rounded-lg border bg-muted/30 px-4 py-3 flex items-start gap-3">
                  <FileText className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-sm">Add your other documents</div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Upload compliance documents, policies, FAQs and anything else you have. PractiCare's AI makes the
                      transition from paper and Excel to digital easy.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { label: "Compliance", Icon: Shield },
                    { label: "Policies", Icon: CheckSquare },
                    { label: "FAQs", Icon: FileText },
                    { label: "Other", Icon: FileSpreadsheet },
                  ].map(({ label, Icon }) => (
                    <div key={label} className="rounded-lg border bg-card px-3 py-2.5 flex items-center gap-2">
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium">{label}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  className="w-full rounded-lg border-2 border-dashed border-border hover:border-primary/60 hover:bg-primary/5 transition-colors p-8 text-center"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="font-semibold text-sm">Drop documents or click to upload</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    PDF · Word · Excel · Images — AI will categorise & tag
                  </div>
                </button>
                <input
                  ref={docInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
                  onChange={(e) => { ingestFiles(e.target.files, "doc"); e.target.value = ""; }}
                />

                {docFiles.length > 0 && (
                  <div className="rounded-lg border bg-card">
                    <div className="px-4 py-3 border-b font-semibold text-sm">
                      Uploaded documents ({docFiles.length})
                    </div>
                    <div className="divide-y">
                      {docFiles.map((f) => (
                        <div key={f.id} className="flex items-center justify-between px-4 py-2.5">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <KindIcon kind={f.kind} className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">{f.name}</div>
                              <div className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(1)} KB</div>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeDocFile(f.id)}>
                            <Trash2 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer actions */}
        <div className="flex items-center justify-between mt-6">
          <Button variant="ghost" onClick={back} disabled={step === 1}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div className="text-xs text-muted-foreground">
            Step {step} of {TOTAL_STEPS}
          </div>
          {step === TOTAL_STEPS ? (
            <Button onClick={finish}>
              <Check className="w-4 h-4 mr-1" /> Finish setup
            </Button>
          ) : (
            <Button onClick={next}>
              Continue <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </main>

    </div>
  );
}
