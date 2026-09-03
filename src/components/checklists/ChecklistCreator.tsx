import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Trash2,
  CheckSquare,
  ToggleLeft,
  Hash,
  AlertTriangle,
  ClipboardList,
  Users,
  Send,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Clock,
  Calendar,
  CalendarDays,
  CalendarRange,
  Repeat,
  Sun,
  Moon,
  UsersRound,
  User,
  Layers,
  DoorOpen,
  Search,
} from "lucide-react";
import {
  ChecklistCategory,
  Checklist,
  ChecklistItem,
  ChecklistItemType,
  FrequencyType,
  DailyTimeSlot,
  WeekDay,
  CustomFrequencyUnit,
  ChecklistFrequency,
} from "@/types/checklists";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { mockStaffMembers } from "@/data/mockStaff";
import { mockDepartments } from "@/data/mockDepartments";
import { mockRooms } from "@/data/mockRooms";
import { AIChecklistDialog } from "./AIChecklistDialog";

interface ItemEntry {
  text: string;
  type: ChecklistItemType;
  critical: boolean;
}

interface ChecklistCreatorProps {
  categories: ChecklistCategory[];
  onCreateChecklist: (checklist: Omit<Checklist, "id" | "createdAt">) => string;
  defaultCategoryId?: string;
  defaultItems?: ItemEntry[];
  title?: string;
  headerLabel?: string;
}

type Step = 1 | 2 | 3 | 4 | 5;

type ChecklistTypeOption = "general" | "room-setup";

const FREQUENCY_OPTIONS: { id: FrequencyType; label: string; icon: any; description: string }[] = [
  { id: "daily", label: "Daily", icon: Sun, description: "Repeats every day" },
  { id: "weekly", label: "Weekly", icon: Calendar, description: "Repeats every week" },
  { id: "monthly", label: "Monthly", icon: CalendarDays, description: "Repeats every month" },
  { id: "quarterly", label: "Quarterly", icon: CalendarRange, description: "Every 3 months" },
  { id: "yearly", label: "Yearly", icon: CalendarRange, description: "Repeats every year" },
  { id: "custom", label: "Custom", icon: Repeat, description: "Set your own interval" },
];

const WEEK_DAYS: { id: WeekDay | "any"; label: string; short: string }[] = [
  { id: "any", label: "Any Day", short: "Any" },
  { id: "monday", label: "Monday", short: "Mon" },
  { id: "tuesday", label: "Tuesday", short: "Tue" },
  { id: "wednesday", label: "Wednesday", short: "Wed" },
  { id: "thursday", label: "Thursday", short: "Thu" },
  { id: "friday", label: "Friday", short: "Fri" },
  { id: "saturday", label: "Saturday", short: "Sat" },
  { id: "sunday", label: "Sunday", short: "Sun" },
];

export const ChecklistCreator = ({
  categories,
  onCreateChecklist,
  defaultCategoryId,
  defaultItems,
  title: defaultTitle,
  headerLabel,
}: ChecklistCreatorProps) => {
  const [step, setStep] = useState<Step>(1);
  const [title, setTitle] = useState(defaultTitle || "");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(defaultCategoryId || "");

  // Step 1 - Frequency
  const [frequencyType, setFrequencyType] = useState<FrequencyType>("daily");
  const [dailyTimeSlot, setDailyTimeSlot] = useState<DailyTimeSlot>("am");
  const [customTime, setCustomTime] = useState("09:00");
  const [weekDay, setWeekDay] = useState<WeekDay | "any">("any");
  const [customInterval, setCustomInterval] = useState(1);
  const [customUnit, setCustomUnit] = useState<CustomFrequencyUnit>("days");

  // Step 2 - Checklist Type
  const [checklistType, setChecklistType] = useState<ChecklistTypeOption>("general");
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [roomSearch, setRoomSearch] = useState("");

  // Step 3 - Items
  const [items, setItems] = useState<ItemEntry[]>(
    defaultItems || [
      { text: "", type: "tick", critical: false },
      { text: "", type: "tick", critical: false },
      { text: "", type: "tick", critical: false },
    ]
  );

  // Step 4 - Assignment
  const [assignMode, setAssignMode] = useState<"group" | "individual">("group");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedIndividual, setSelectedIndividual] = useState<string>("");

  // Step 5 - Instructions
  const [instructions, setInstructions] = useState("");

  const selectableCategories = categories.filter((c) => c.id !== "all");

  useEffect(() => {
    if (defaultCategoryId) setCategoryId(defaultCategoryId);
  }, [defaultCategoryId]);

  const resetForm = () => {
    setStep(1);
    setTitle("");
    setDescription("");
    setCategoryId(defaultCategoryId || "");
    setFrequencyType("daily");
    setDailyTimeSlot("am");
    setCustomTime("09:00");
    setWeekDay("any");
    setCustomInterval(1);
    setCustomUnit("days");
    setChecklistType("general");
    setSelectedRooms([]);
    setRoomSearch("");
    setItems([
      { text: "", type: "tick", critical: false },
      { text: "", type: "tick", critical: false },
      { text: "", type: "tick", critical: false },
    ]);
    setAssignMode("group");
    setSelectedDepartment("");
    setSelectedMembers([]);
    setSelectedIndividual("");
    setInstructions("");
  };

  const buildFrequency = (): ChecklistFrequency => {
    const freq: ChecklistFrequency = { type: frequencyType };
    if (frequencyType === "daily") {
      freq.dailyTimeSlot = dailyTimeSlot;
      if (dailyTimeSlot === "custom") freq.customTime = customTime;
    } else if (frequencyType === "weekly") {
      freq.weekDay = weekDay;
    } else if (frequencyType === "custom") {
      freq.customInterval = customInterval;
      freq.customUnit = customUnit;
    }
    return freq;
  };

  const getRecurringLegacy = (): "daily" | "weekly" | "monthly" | null => {
    if (frequencyType === "daily") return "daily";
    if (frequencyType === "weekly") return "weekly";
    if (frequencyType === "monthly") return "monthly";
    return null;
  };

  const handleSubmit = () => {
    const filledItems = items.filter((item) => item.text.trim());
    const checklistItems: ChecklistItem[] = filledItems.map((item, index) => ({
      id: `temp-${index}`,
      text: item.text.trim(),
      type: item.type,
      completed: false,
      critical: item.critical,
      yesNoValue: item.type === "yesno" ? null : undefined,
      numberValue: item.type === "number" ? null : undefined,
    }));

    onCreateChecklist({
      title: title.trim(),
      description: description.trim() || instructions.trim() || undefined,
      categoryId,
      items: checklistItems,
      createdBy: "Current User",
      recurring: getRecurringLegacy(),
      frequency: buildFrequency(),
      assignment: assignMode === "individual"
        ? { type: "users" as const, userIds: selectedIndividual ? [selectedIndividual] : undefined }
        : {
            type: selectedDepartment ? "users" as const : "all" as const,
            departmentIds: selectedDepartment ? [selectedDepartment] : undefined,
            userIds: selectedMembers.length > 0 ? selectedMembers : undefined,
          },
    });

    resetForm();
    toast.success("Checklist published successfully");
  };

  const addRow = () => setItems([...items, { text: "", type: "tick", critical: false }]);

  const updateItemText = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index].text = value;
    setItems(newItems);
  };

  const updateItemType = (index: number, type: ChecklistItemType) => {
    const newItems = [...items];
    newItems[index].type = type;
    setItems(newItems);
  };

  const toggleItemCritical = (index: number) => {
    const newItems = [...items];
    newItems[index].critical = !newItems[index].critical;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  const getTypeLabel = (type: ChecklistItemType) => {
    switch (type) {
      case "tick": return "Tick";
      case "yesno": return "Yes / No";
      case "number": return "Number";
    }
  };

  const getTypeIcon = (type: ChecklistItemType) => {
    switch (type) {
      case "tick": return <CheckSquare className="w-3.5 h-3.5" />;
      case "yesno": return <ToggleLeft className="w-3.5 h-3.5" />;
      case "number": return <Hash className="w-3.5 h-3.5" />;
    }
  };

  const filledCount = items.filter((i) => i.text.trim()).length;
  const canProceedStep2 = title.trim() && filledCount > 0;
  const canProceedStep3 = assignMode === "individual" ? !!selectedIndividual : selectedMembers.length > 0;

  const deptMembers = selectedDepartment === "all"
    ? mockStaffMembers
    : selectedDepartment
    ? mockStaffMembers.filter((m) => m.departmentId === selectedDepartment)
    : [];
  const allDeptSelected = deptMembers.length > 0 && deptMembers.every((m) => selectedMembers.includes(m.id));

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const getFrequencySummary = (): string => {
    switch (frequencyType) {
      case "daily":
        if (dailyTimeSlot === "am") return "Daily (AM)";
        if (dailyTimeSlot === "pm") return "Daily (PM)";
        return `Daily at ${customTime}`;
      case "weekly":
        return weekDay === "any" ? "Weekly (Any day)" : `Weekly (${weekDay.charAt(0).toUpperCase() + weekDay.slice(1)})`;
      case "monthly": return "Monthly";
      case "quarterly": return "Quarterly";
      case "yearly": return "Yearly";
      case "custom":
        return `Every ${customInterval} ${customUnit}`;
      default: return "";
    }
  };

  const getAssignmentSummary = (): string => {
    if (assignMode === "individual") {
      if (!selectedIndividual) return "Not assigned";
      const member = mockStaffMembers.find((m) => m.id === selectedIndividual);
      return member ? `${member.firstName} ${member.lastName}` : "1 person";
    }
    if (!selectedDepartment) return "Not assigned";
    const deptName = selectedDepartment === "all" ? "All Departments" : mockDepartments.find(d => d.id === selectedDepartment)?.name || selectedDepartment;
    return `${selectedMembers.length} member${selectedMembers.length !== 1 ? "s" : ""} from ${deptName}`;
  };

  const steps = [
    { num: 1, label: "Frequency", icon: Clock },
    { num: 2, label: "Type", icon: Layers },
    { num: 3, label: "Items", icon: ClipboardList },
    { num: 4, label: "Assign", icon: Users },
    { num: 5, label: "Publish", icon: Send },
  ] as const;

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            {headerLabel || "Create New Checklist"}
          </CardTitle>
          <AIChecklistDialog
            categories={categories}
            onCreateChecklist={(checklist) => {
              onCreateChecklist(checklist);
              resetForm();
            }}
            defaultCategoryId={defaultCategoryId}
          />
        </div>
        {/* Step Indicator */}
        <div className="flex items-center gap-2 pt-2 flex-wrap">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (s.num < step) setStep(s.num as Step);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  step === s.num
                    ? "bg-primary text-primary-foreground"
                    : step > s.num
                    ? "bg-primary/15 text-primary cursor-pointer hover:bg-primary/25"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {step > s.num ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <s.icon className="w-3.5 h-3.5" />
                )}
                {s.label}
              </button>
              {i < steps.length - 1 && (
                <div className={cn(
                  "w-8 h-px",
                  step > s.num ? "bg-primary/40" : "bg-border"
                )} />
              )}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ========== STEP 1: Frequency ========== */}
        {step === 1 && (
          <>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">How often should this checklist be completed?</h3>
              <p className="text-xs text-muted-foreground">Choose the frequency and timing for this checklist</p>
            </div>

            {/* Frequency Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {FREQUENCY_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isActive = frequencyType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFrequencyType(opt.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center",
                      isActive
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/30 hover:bg-muted/50"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                    <span className={cn("text-sm font-medium", isActive ? "text-primary" : "text-foreground")}>{opt.label}</span>
                    <span className="text-[11px] text-muted-foreground">{opt.description}</span>
                  </button>
                );
              })}
            </div>

            {/* Daily Sub-options */}
            {frequencyType === "daily" && (
              <div className="space-y-3 border border-border rounded-lg p-4 bg-muted/20">
                <Label className="text-xs font-medium text-muted-foreground">Time of Day</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "am" as DailyTimeSlot, label: "AM (Morning)", icon: Sun },
                    { id: "pm" as DailyTimeSlot, label: "PM (Afternoon)", icon: Moon },
                    { id: "custom" as DailyTimeSlot, label: "Custom Time", icon: Clock },
                  ].map((slot) => {
                    const Icon = slot.icon;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setDailyTimeSlot(slot.id)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all",
                          dailyTimeSlot === slot.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
                {dailyTimeSlot === "custom" && (
                  <div className="space-y-1.5 max-w-[200px]">
                    <Label className="text-xs text-muted-foreground">Select time</Label>
                    <Input
                      type="time"
                      value={customTime}
                      onChange={(e) => setCustomTime(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Weekly Sub-options */}
            {frequencyType === "weekly" && (
              <div className="space-y-3 border border-border rounded-lg p-4 bg-muted/20">
                <Label className="text-xs font-medium text-muted-foreground">Select Day</Label>
                <div className="flex flex-wrap gap-2">
                  {WEEK_DAYS.map((day) => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => setWeekDay(day.id)}
                      className={cn(
                        "px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                        weekDay === day.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {day.short}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Sub-options */}
            {frequencyType === "custom" && (
              <div className="space-y-3 border border-border rounded-lg p-4 bg-muted/20">
                <Label className="text-xs font-medium text-muted-foreground">Repeat every</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={customInterval}
                    onChange={(e) => setCustomInterval(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20"
                  />
                  <Select value={customUnit} onValueChange={(v) => setCustomUnit(v as CustomFrequencyUnit)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                      <SelectItem value="years">Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  This checklist will repeat every {customInterval} {customUnit}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground font-medium">
                {getFrequencySummary()}
              </span>
              <Button size="sm" onClick={() => setStep(2)} className="gap-1.5">
                Next
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </>
        )}

        {/* ========== STEP 2: Checklist Type ========== */}
        {step === 2 && (
          <>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">What type of checklist is this?</h3>
              <p className="text-xs text-muted-foreground">Choose whether this is a general checklist or specific to room setup</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setChecklistType("general"); setSelectedRooms([]); }}
                className={cn(
                  "flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all text-center",
                  checklistType === "general"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/30 hover:bg-muted/50"
                )}
              >
                <Layers className={cn("w-6 h-6", checklistType === "general" ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-sm font-medium", checklistType === "general" ? "text-primary" : "text-foreground")}>General</span>
                <span className="text-[11px] text-muted-foreground leading-tight">Standard checklist for tasks, compliance, operations, etc.</span>
              </button>
              <button
                type="button"
                onClick={() => setChecklistType("room-setup")}
                className={cn(
                  "flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all text-center",
                  checklistType === "room-setup"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/30 hover:bg-muted/50"
                )}
              >
                <DoorOpen className={cn("w-6 h-6", checklistType === "room-setup" ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-sm font-medium", checklistType === "room-setup" ? "text-primary" : "text-foreground")}>Room Setup</span>
                <span className="text-[11px] text-muted-foreground leading-tight">Linked to specific rooms for setup & preparation checks</span>
              </button>
            </div>

            {/* Room Selection for Room Setup */}
            {checklistType === "room-setup" && (
              <div className="space-y-3 border border-border rounded-lg p-4 bg-muted/20">
                <Label className="text-xs font-medium text-muted-foreground">Select Rooms</Label>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search rooms..."
                    value={roomSearch}
                    onChange={(e) => setRoomSearch(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                {/* Room List with checkboxes */}
                <div className="border border-border rounded-lg overflow-hidden bg-background">
                  {/* Select All */}
                  <label className="flex items-center gap-3 py-2.5 px-3 bg-muted/50 border-b border-border cursor-pointer hover:bg-muted/70">
                    <Checkbox
                      checked={mockRooms.length > 0 && selectedRooms.length === mockRooms.length}
                      onCheckedChange={() => {
                        if (selectedRooms.length === mockRooms.length) {
                          setSelectedRooms([]);
                        } else {
                          setSelectedRooms(mockRooms.map((r) => r.id));
                        }
                      }}
                    />
                    <span className="text-sm font-medium">Select all rooms</span>
                    <span className="text-xs text-muted-foreground ml-auto">{selectedRooms.length}/{mockRooms.length} selected</span>
                  </label>
                  <div className="max-h-48 overflow-y-auto divide-y divide-border">
                    {mockRooms
                      .filter((room) =>
                        !roomSearch ||
                        room.roomName.toLowerCase().includes(roomSearch.toLowerCase()) ||
                        room.roomNumber.toLowerCase().includes(roomSearch.toLowerCase())
                      )
                      .map((room) => (
                        <label key={room.id} className="flex items-center gap-3 py-2 px-3 hover:bg-muted/30 cursor-pointer">
                          <Checkbox
                            checked={selectedRooms.includes(room.id)}
                            onCheckedChange={() => {
                              setSelectedRooms((prev) =>
                                prev.includes(room.id) ? prev.filter((id) => id !== room.id) : [...prev, room.id]
                              );
                            }}
                          />
                          <div className="flex items-center gap-2 min-w-0">
                            <DoorOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="text-sm font-medium truncate">{room.roomName}</span>
                            <span className="text-xs text-muted-foreground shrink-0">#{room.roomNumber}</span>
                          </div>
                        </label>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2">
              <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </Button>
              <Button
                size="sm"
                onClick={() => setStep(3)}
                disabled={checklistType === "room-setup" && selectedRooms.length === 0}
                className="gap-1.5"
              >
                Next
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </>
        )}

        {/* ========== STEP 3: Items ========== */}
        {step === 3 && (
          <>
            {/* Metadata Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Title *</Label>
                <Input
                  placeholder="e.g. Morning Opening"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Description</Label>
                <Input
                  placeholder="Brief description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-12 text-center text-xs">#</TableHead>
                    <TableHead className="text-xs">Item</TableHead>
                    <TableHead className="w-36 text-xs">Action Type</TableHead>
                    <TableHead className="w-20 text-center text-xs">Critical</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index} className={cn("group", item.critical && "bg-destructive/[0.03]")}>
                      <TableCell className="text-center text-xs text-muted-foreground font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <Input
                          className={cn("h-8 text-sm px-2 border-input bg-background focus-visible:ring-1", item.critical && "border-destructive/30")}
                          placeholder=""
                          value={item.text}
                          onChange={(e) => updateItemText(index, e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRow(); } }}
                        />
                      </TableCell>
                      <TableCell>
                        <Select value={item.type} onValueChange={(v) => updateItemType(index, v as ChecklistItemType)}>
                          <SelectTrigger className="h-8 text-xs border-0 shadow-none bg-transparent focus:ring-1">
                            <div className="flex items-center gap-1.5">
                              {getTypeIcon(item.type)}
                              <span>{getTypeLabel(item.type)}</span>
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tick"><div className="flex items-center gap-2"><CheckSquare className="w-3.5 h-3.5" />Tick</div></SelectItem>
                            <SelectItem value="yesno"><div className="flex items-center gap-2"><ToggleLeft className="w-3.5 h-3.5" />Yes / No</div></SelectItem>
                            <SelectItem value="number"><div className="flex items-center gap-2"><Hash className="w-3.5 h-3.5" />Number</div></SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button type="button" variant="ghost" size="icon" className={cn("h-7 w-7", item.critical && "text-destructive hover:text-destructive")} onClick={() => toggleItemCritical(index)} title={item.critical ? "Remove critical flag" : "Mark as critical"}>
                          <AlertTriangle className={cn("w-3.5 h-3.5", item.critical ? "fill-destructive/20" : "text-muted-foreground/40")} />
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        {items.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(index)}>
                            <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="border-t border-border bg-muted/30 px-4 py-2">
                <Button type="button" variant="ghost" size="sm" onClick={addRow} className="text-xs text-muted-foreground hover:text-foreground gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Add Row
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2">
              <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{filledCount} item{filledCount !== 1 ? "s" : ""}</span>
                <Button size="sm" onClick={() => setStep(4)} disabled={!canProceedStep2} className="gap-1.5">
                  Next
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}

        {/* ========== STEP 4: Assignment ========== */}
        {step === 4 && (
          <>
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">Assign To</h3>
                <p className="text-xs text-muted-foreground">Choose whether this checklist is for a group or an individual</p>
              </div>

              {/* Group vs Individual Toggle */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { setAssignMode("group"); setSelectedIndividual(""); }}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center",
                    assignMode === "group"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/30 hover:bg-muted/50"
                  )}
                >
                  <UsersRound className={cn("w-5 h-5", assignMode === "group" ? "text-primary" : "text-muted-foreground")} />
                  <span className={cn("text-sm font-medium", assignMode === "group" ? "text-primary" : "text-foreground")}>Group</span>
                  <span className="text-[11px] text-muted-foreground">Assign to a department or selected team members</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setAssignMode("individual"); setSelectedDepartment(""); setSelectedMembers([]); }}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center",
                    assignMode === "individual"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/30 hover:bg-muted/50"
                  )}
                >
                  <User className={cn("w-5 h-5", assignMode === "individual" ? "text-primary" : "text-muted-foreground")} />
                  <span className={cn("text-sm font-medium", assignMode === "individual" ? "text-primary" : "text-foreground")}>Individual</span>
                  <span className="text-[11px] text-muted-foreground">Assign to a single person only</span>
                </button>
              </div>

              {/* Group Assignment */}
              {assignMode === "group" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Department</Label>
                    <Select
                      value={selectedDepartment || "none"}
                      onValueChange={(v) => {
                        const newDept = v === "none" ? "" : v;
                        setSelectedDepartment(newDept);
                        if (newDept === "all") {
                          setSelectedMembers(mockStaffMembers.map((m) => m.id));
                        } else if (newDept) {
                          const members = mockStaffMembers.filter((m) => m.departmentId === newDept);
                          setSelectedMembers(members.map((m) => m.id));
                        } else {
                          setSelectedMembers([]);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a department..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="none">Select a department...</SelectItem>
                        <SelectItem value="all">All Departments</SelectItem>
                        {mockDepartments.map((dept) => {
                          const count = mockStaffMembers.filter((m) => m.departmentId === dept.id).length;
                          if (count === 0) return null;
                          return (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name} ({count})
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedDepartment && deptMembers.length > 0 && (
                    <div className="border border-border rounded-lg overflow-hidden">
                      <label className="flex items-center gap-3 py-2.5 px-3 bg-muted/50 border-b border-border cursor-pointer hover:bg-muted/70">
                        <Checkbox
                          checked={allDeptSelected}
                          onCheckedChange={() => {
                            if (allDeptSelected) {
                              setSelectedMembers([]);
                            } else {
                              setSelectedMembers(deptMembers.map((m) => m.id));
                            }
                          }}
                        />
                        <span className="text-sm font-medium">Select all</span>
                        <span className="text-xs text-muted-foreground ml-auto">{selectedMembers.length}/{deptMembers.length} selected</span>
                      </label>
                      <div className="max-h-48 overflow-y-auto divide-y divide-border">
                        {deptMembers.map((member) => (
                          <label key={member.id} className="flex items-center gap-3 py-2 px-3 hover:bg-muted/30 cursor-pointer">
                            <Checkbox checked={selectedMembers.includes(member.id)} onCheckedChange={() => toggleMember(member.id)} />
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-sm font-medium truncate">{member.firstName} {member.lastName}</span>
                              <span className="text-xs text-muted-foreground shrink-0">{member.role}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Individual Assignment */}
              {assignMode === "individual" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Select Person</Label>
                  <Select value={selectedIndividual || "none"} onValueChange={(v) => setSelectedIndividual(v === "none" ? "" : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a team member..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50 max-h-60">
                      <SelectItem value="none">Select a team member...</SelectItem>
                      {mockStaffMembers.map((member) => {
                        const dept = mockDepartments.find((d) => d.id === member.departmentId);
                        return (
                          <SelectItem key={member.id} value={member.id}>
                            {member.firstName} {member.lastName} {dept ? `(${dept.name})` : ""}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="ghost" size="sm" onClick={() => setStep(3)} className="gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </Button>
              <Button size="sm" onClick={() => setStep(5)} disabled={!canProceedStep3} className="gap-1.5">
                Next
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </>
        )}

        {/* ========== STEP 5: Instructions & Publish ========== */}
        {step === 5 && (
          <>
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">Instructions</h3>
                <p className="text-xs text-muted-foreground">Add any instructions or notes for completing this checklist</p>
              </div>

              <Textarea
                placeholder="E.g. Complete all items before the end of the shift. Contact your supervisor for any issues."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={4}
                className="resize-none"
              />

              {/* Summary */}
              <div className="border border-border rounded-lg p-4 bg-muted/30 space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Summary</h4>
                <div className="grid grid-cols-2 gap-y-1.5 text-sm">
                  <span className="text-muted-foreground">Title</span>
                  <span className="font-medium">{title}</span>
                  <span className="text-muted-foreground">Items</span>
                  <span className="font-medium">{filledCount} items</span>
                  <span className="text-muted-foreground">Frequency</span>
                  <span className="font-medium">{getFrequencySummary()}</span>
                  <span className="text-muted-foreground">Checklist Type</span>
                  <span className="font-medium">{checklistType === "room-setup" ? `Room Setup (${selectedRooms.length} room${selectedRooms.length !== 1 ? "s" : ""})` : "General"}</span>
                  <span className="text-muted-foreground">Assignment</span>
                  <span className="font-medium capitalize">{assignMode}</span>
                  <span className="text-muted-foreground">Assigned to</span>
                  <span className="font-medium">{getAssignmentSummary()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="ghost" size="sm" onClick={() => setStep(4)} className="gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </Button>
              <Button size="sm" onClick={handleSubmit} className="gap-1.5">
                <Send className="w-3.5 h-3.5" />
                Publish Checklist
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
