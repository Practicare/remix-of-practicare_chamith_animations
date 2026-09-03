import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Building, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { DayOperatingHours, DAYS_OF_WEEK } from "@/types/roster";
import { mockDepartments } from "@/data/mockRosters";
import { toast } from "sonner";

const defaultOrgHours: DayOperatingHours[] = DAYS_OF_WEEK.map((_, i) => ({
  dayOfWeek: i,
  isOpen: i >= 1 && i <= 5,
  openTime: "08:00",
  closeTime: "17:00",
}));

interface DeptHoursState {
  departmentId: string;
  departmentName: string;
  useOrgHours: boolean;
  operatingHours: DayOperatingHours[];
}

export function OperatingHoursTab() {
  const [orgHours, setOrgHours] = useState<DayOperatingHours[]>(defaultOrgHours);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [deptSettings, setDeptSettings] = useState<DeptHoursState[]>(
    mockDepartments.map((d) => ({
      departmentId: d.id,
      departmentName: d.name,
      useOrgHours: true,
      operatingHours: [...defaultOrgHours],
    }))
  );

  const selectedDept = deptSettings.find((d) => d.departmentId === selectedDeptId);

  const handleOrgHourChange = (dayOfWeek: number, field: keyof DayOperatingHours, value: string | boolean) => {
    setOrgHours((prev) =>
      prev.map((h) => (h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h))
    );
  };

  const handleDeptHourChange = (dayOfWeek: number, field: keyof DayOperatingHours, value: string | boolean) => {
    setDeptSettings((prev) =>
      prev.map((d) =>
        d.departmentId === selectedDeptId
          ? {
              ...d,
              operatingHours: d.operatingHours.map((h) =>
                h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h
              ),
            }
          : d
      )
    );
  };

  const handleDeptUseOrgHoursChange = (useOrgHours: boolean) => {
    setDeptSettings((prev) =>
      prev.map((d) =>
        d.departmentId === selectedDeptId ? { ...d, useOrgHours } : d
      )
    );
  };

  const openDaysCount = orgHours.filter((h) => h.isOpen).length;

  const handleSave = () => {
    toast.success("Operating hours saved successfully");
  };

  const renderHoursEditor = (
    hours: DayOperatingHours[],
    onChange: (dayOfWeek: number, field: keyof DayOperatingHours, value: string | boolean) => void,
    disabled = false
  ) => (
    <div className="space-y-2">
      {hours.map((day) => (
        <div
          key={day.dayOfWeek}
          className={cn(
            "flex items-center gap-3 md:gap-4 p-2.5 md:p-3 rounded-lg border transition-colors",
            day.isOpen ? "bg-card" : "bg-muted/30",
            disabled && "opacity-50 pointer-events-none"
          )}
        >
          <div className="w-20 md:w-24 shrink-0">
            <span className="text-sm font-medium">{DAYS_OF_WEEK[day.dayOfWeek].slice(0, 3)}</span>
            <span className="hidden md:inline text-sm font-medium">{DAYS_OF_WEEK[day.dayOfWeek].slice(3)}</span>
          </div>

          <Switch
            checked={day.isOpen}
            onCheckedChange={(checked) => onChange(day.dayOfWeek, "isOpen", checked)}
            disabled={disabled}
          />

          {day.isOpen ? (
            <div className="flex items-center gap-2 ml-auto">
              <Input
                type="time"
                value={day.openTime}
                onChange={(e) => onChange(day.dayOfWeek, "openTime", e.target.value)}
                className="w-[110px] md:w-[130px] h-8 text-xs"
                disabled={disabled}
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Input
                type="time"
                value={day.closeTime}
                onChange={(e) => onChange(day.dayOfWeek, "closeTime", e.target.value)}
                className="w-[110px] md:w-[130px] h-8 text-xs"
                disabled={disabled}
              />
            </div>
          ) : (
            <span className="text-xs text-muted-foreground ml-auto">Closed</span>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Organization Hours */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Practice Operating Hours
              </CardTitle>
              <CardDescription>Default hours for the whole practice. Departments can override these.</CardDescription>
            </div>
            <Badge variant="outline" className="gap-1 text-xs">
              <Clock className="h-3 w-3" />
              {openDaysCount} days open
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderHoursEditor(orgHours, handleOrgHourChange)}
          <div className="flex justify-end pt-2">
            <Button onClick={handleSave}>Save Hours</Button>
          </div>
        </CardContent>
      </Card>

      {/* Department Overrides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Department Hours
          </CardTitle>
          <CardDescription>Override practice hours for specific departments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedDeptId} onValueChange={setSelectedDeptId}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Select a department" />
            </SelectTrigger>
            <SelectContent>
              {deptSettings.map((dept) => (
                <SelectItem key={dept.departmentId} value={dept.departmentId}>
                  <span className="flex items-center gap-2">
                    {dept.departmentName}
                    {!dept.useOrgHours && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Custom</Badge>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedDept ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
                <Switch
                  checked={selectedDept.useOrgHours}
                  onCheckedChange={handleDeptUseOrgHoursChange}
                />
                <div>
                  <p className="text-sm font-medium">Use Practice Hours</p>
                  <p className="text-xs text-muted-foreground">
                    Inherit operating hours from practice defaults
                  </p>
                </div>
              </div>

              {selectedDept.useOrgHours ? (
                <>
                  <p className="text-xs text-muted-foreground">
                    This department uses the practice's default hours. Toggle off to set custom hours.
                  </p>
                  {renderHoursEditor(orgHours, () => {}, true)}
                </>
              ) : (
                <>
                  {renderHoursEditor(selectedDept.operatingHours, handleDeptHourChange)}
                  <div className="flex justify-end pt-2">
                    <Button onClick={handleSave}>Save Department Hours</Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Select a department to view or customise its hours</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
