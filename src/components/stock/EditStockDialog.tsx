import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  StockItem, 
  StockCategory, 
  VaccineFundingType,
  CATEGORY_FIELD_CONFIG,
  DEFAULT_FIELD_CONFIG,
  VACCINE_FUNDING_LABELS
} from "@/types/stock";
import { mockTeamMembers } from "@/data/mockTeamMembers";
import { toast } from "sonner";

interface EditStockDialogProps {
  item: StockItem | null;
  categories: StockCategory[];
  onUpdateItem: (itemId: string, updates: Partial<StockItem>) => void;
  onClose: () => void;
  isRenewMode?: boolean;
}

export function EditStockDialog({
  item,
  categories,
  onUpdateItem,
  onClose,
  isRenewMode = false,
}: EditStockDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState<Date>();
  const [calibrationDate, setCalibrationDate] = useState<Date>();
  const [nextCalibrationDate, setNextCalibrationDate] = useState<Date>();
  const [inspectionDate, setInspectionDate] = useState<Date>();
  const [reviewDate, setReviewDate] = useState<Date>();
  const [vaccineFundingType, setVaccineFundingType] = useState<VaccineFundingType>();
  const [leadId, setLeadId] = useState("");
  const [imageUrl, setImageUrl] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fieldConfig = useMemo(() => {
    return CATEGORY_FIELD_CONFIG[categoryId] || DEFAULT_FIELD_CONFIG;
  }, [categoryId]);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setDescription(item.description || "");
      setCategoryId(item.categoryId);
      setQuantity(item.quantity);
      setLocation(item.location || "");
      setBatchNumber(item.batchNumber || "");
      setExpiryDate(item.expiryDate);
      setCalibrationDate(item.calibrationDate);
      setNextCalibrationDate(item.nextCalibrationDate);
      setInspectionDate(item.inspectionDate);
      setReviewDate(item.reviewDate);
      setVaccineFundingType(item.vaccineFundingType);
      setLeadId(item.leadId || "");
      setImageUrl(item.imageUrl);
    }
  }, [item]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!item || !name.trim() || !categoryId) return;
    const selectedMember = mockTeamMembers.find(m => m.id === leadId);

    onUpdateItem(item.id, {
      name: name.trim(),
      description: description.trim(),
      categoryId,
      quantity,
      location: location.trim() || undefined,
      batchNumber: batchNumber.trim() || undefined,
      expiryDate,
      calibrationDate,
      nextCalibrationDate,
      inspectionDate,
      reviewDate,
      leadId: leadId || undefined,
      leadName: selectedMember?.name || undefined,
      imageUrl,
      vaccineFundingType,
      updatedAt: new Date(),
    });

    toast.success(isRenewMode ? "Stock item renewed successfully" : "Stock item updated successfully");
    onClose();
  };

  const isValid = useMemo(() => {
    if (!name.trim() || !categoryId) return false;
    if (fieldConfig.expiryRequired && !expiryDate) return false;
    return true;
  }, [name, categoryId, expiryDate, fieldConfig]);

  if (!item) return null;

  const DatePickerField = ({ label, value, onChange, highlighted = false }: { label: string; value?: Date; onChange: (d?: Date) => void; highlighted?: boolean }) => (
    <div className={cn("space-y-2", highlighted && "ring-2 ring-primary ring-offset-2 rounded-lg p-2 -m-2")}>
      <Label className={highlighted ? "text-primary font-semibold" : ""}>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground", highlighted && "border-primary")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : "Select date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar mode="single" selected={value} onSelect={onChange} initialFocus className="p-3 pointer-events-auto" />
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isRenewMode ? "Renew Stock Item" : "Edit Stock Item"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Image upload */}
          <div className="space-y-2">
            <Label>Item Image</Label>
            <div className="flex items-center gap-3">
              {imageUrl ? (
                <div className="relative">
                  <img src={imageUrl} alt="Item" className="w-20 h-20 rounded-lg object-cover border border-border" />
                  <button
                    onClick={() => setImageUrl(undefined)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 transition-colors"
                >
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Upload</span>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              {imageUrl && (
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>Change</Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Paracetamol 500mg" />
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="edit-quantity">Quantity *</Label>
              <Input id="edit-quantity" type="number" min={0} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 0)} />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location / Room</Label>
              <Input id="edit-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Treatment Room 1" />
            </div>

            {/* Batch Number */}
            {fieldConfig.showBatchNumber && (
              <div className="space-y-2">
                <Label htmlFor="edit-batch">Serial / Batch Number</Label>
                <Input id="edit-batch" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} placeholder="e.g., LOT123456" />
              </div>
            )}

            {/* Vaccine Funding Type */}
            {fieldConfig.showVaccineFunding && (
              <div className="space-y-2">
                <Label>Funding Type</Label>
                <Select value={vaccineFundingType || ""} onValueChange={(v) => setVaccineFundingType(v as VaccineFundingType)}>
                  <SelectTrigger><SelectValue placeholder="Select funding type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="government">{VACCINE_FUNDING_LABELS.government}</SelectItem>
                    <SelectItem value="private">{VACCINE_FUNDING_LABELS.private}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Lead */}
            <div className="space-y-2">
              <Label>Lead (Supervisor)</Label>
              <Select value={leadId || "none"} onValueChange={(value) => setLeadId(value === "none" ? "" : value)}>
                <SelectTrigger><SelectValue placeholder="Assign a lead" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {mockTeamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Expiry Date */}
            {fieldConfig.showExpiry && (
              <DatePickerField
                label={isRenewMode ? "New Expiry Date *" : `Expiry Date ${fieldConfig.expiryRequired ? "*" : ""}`}
                value={expiryDate}
                onChange={setExpiryDate}
                highlighted={isRenewMode}
              />
            )}

            {/* Calibration Dates */}
            {fieldConfig.showCalibration && (
              <>
                <DatePickerField label="Last Calibration Date" value={calibrationDate} onChange={setCalibrationDate} />
                <DatePickerField
                  label={isRenewMode ? "New Calibration Due Date" : "Next Calibration Date"}
                  value={nextCalibrationDate}
                  onChange={setNextCalibrationDate}
                  highlighted={isRenewMode && fieldConfig.showCalibration}
                />
              </>
            )}

            {/* Inspection Date */}
            <DatePickerField label="Inspection Date" value={inspectionDate} onChange={setInspectionDate} />

            {/* Review Date */}
            <DatePickerField label="Review Date" value={reviewDate} onChange={setReviewDate} />

            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Additional details about this item" rows={2} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            {isRenewMode ? "Renew Item" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
