import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  DoorOpen, 
  Plus, 
  ChevronDown, 
  ChevronUp,
  Monitor,
  Printer,
  ShoppingCart,
  Trash2,
  Package,
  Scale,
  Activity,
  HeartPulse,
  BedDouble,
  Zap,
  Wind,
  Sparkles,
  Thermometer,
  Box,
  MoreHorizontal,
  Pencil,
  Trash,
} from "lucide-react";
import { Room, Instrument, InstrumentCategory } from "@/types/rooms";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categoryIcons: Record<InstrumentCategory, React.ElementType> = {
  "Computer": Monitor,
  "Printer": Printer,
  "Trolley": ShoppingCart,
  "Sharps Bin": Trash2,
  "Clinical Waste": Package,
  "Scale": Scale,
  "BP Machine": Activity,
  "ECG Machine": HeartPulse,
  "Examination Couch": BedDouble,
  "Defibrillator": Zap,
  "Oxygen Equipment": Wind,
  "Sterilizer": Sparkles,
  "Refrigerator": Thermometer,
  "Other": Box,
};

const instrumentCategories: InstrumentCategory[] = [
  "Computer",
  "Printer",
  "Trolley",
  "Sharps Bin",
  "Clinical Waste",
  "Scale",
  "BP Machine",
  "ECG Machine",
  "Examination Couch",
  "Defibrillator",
  "Oxygen Equipment",
  "Sterilizer",
  "Refrigerator",
  "Other",
];

const statusColors = {
  active: "bg-success/10 text-success border-success/20",
  maintenance: "bg-warning/10 text-warning border-warning/20",
  inactive: "bg-muted text-muted-foreground border-muted",
};

interface RoomCardProps {
  room: Room;
  onAddInstrument: (roomId: string) => void;
  onEditRoom: (room: Room) => void;
  onDeleteRoom: (roomId: string) => void;
  onEditInstrument: (roomId: string, instrument: Instrument) => void;
  onDeleteInstrument: (roomId: string, instrumentId: string) => void;
}

export function RoomCard({ 
  room, 
  onAddInstrument, 
  onEditRoom,
  onDeleteRoom, 
  onEditInstrument,
  onDeleteInstrument 
}: RoomCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card className="border shadow-card hover:shadow-elevated transition-all overflow-hidden">
      {/* Mobile Layout */}
      <div className="md:hidden">
        <CardHeader className="p-3 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 shrink-0">
                <DoorOpen className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant="outline" className="font-mono text-[9px] px-1 shrink-0">
                    #{room.roomNumber}
                  </Badge>
                  <h3 className="font-semibold text-sm truncate">{room.roomName}</h3>
                </div>
                {room.description && (
                  <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{room.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1 shrink-0">
              <Badge variant="secondary" className="text-[9px] px-1">
                {room.instruments.length}
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEditRoom(room)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Room
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAddInstrument(room.id)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => onDeleteRoom(room.id)}
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Delete Room
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="px-3 pb-3 pt-0">
            <div className="space-y-1.5">
              {room.instruments.length > 0 ? (
                <div className="space-y-1.5">
                  {room.instruments.map((instrument) => (
                    <MobileInstrumentRow 
                      key={instrument.id} 
                      instrument={instrument}
                      roomId={room.id}
                      onEdit={() => onEditInstrument(room.id, instrument)}
                      onDelete={() => onDeleteInstrument(room.id, instrument.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground bg-muted/30 rounded-lg">
                  <Package className="w-6 h-6 mx-auto mb-1 opacity-50" />
                  <p className="text-[10px]">No items added</p>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2 border-dashed h-8 text-xs"
              onClick={() => onAddInstrument(room.id)}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Item
            </Button>
          </CardContent>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                <DoorOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    #{room.roomNumber}
                  </Badge>
                  <h3 className="font-semibold text-lg">{room.roomName}</h3>
                </div>
                {room.description && (
                  <p className="text-sm text-muted-foreground mt-1">{room.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {room.instruments.length} item{room.instruments.length !== 1 ? "s" : ""}
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEditRoom(room)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Room
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAddInstrument(room.id)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => onDeleteRoom(room.id)}
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Delete Room
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0">
            <div className="space-y-2">
              {room.instruments.length > 0 ? (
                <div className="grid gap-2">
                  {room.instruments.map((instrument) => (
                    <InstrumentRow 
                      key={instrument.id} 
                      instrument={instrument}
                      roomId={room.id}
                      onSave={(updated) => onEditInstrument(room.id, updated)}
                      onDelete={() => onDeleteInstrument(room.id, instrument.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground bg-muted/30 rounded-lg">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No items added yet</p>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              className="w-full mt-4 border-dashed"
              onClick={() => onAddInstrument(room.id)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </CardContent>
        )}
      </div>
    </Card>
  );
}

// Compact mobile instrument row
function MobileInstrumentRow({ 
  instrument, 
  roomId,
  onEdit,
  onDelete 
}: { 
  instrument: Instrument; 
  roomId: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const Icon = categoryIcons[instrument.category] || Box;
  
  return (
    <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="p-1.5 rounded-md bg-background border shrink-0">
          <Icon className="w-3 h-3 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="font-medium text-xs truncate">{instrument.name}</span>
            <Badge variant="outline" className="font-mono text-[8px] px-1 shrink-0">
              {instrument.instrumentNumber}
            </Badge>
          </div>
          <span className="text-[9px] text-muted-foreground">{instrument.category}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-1 shrink-0">
        <Badge 
          variant="outline" 
          className={cn("text-[8px] px-1 capitalize", statusColors[instrument.status])}
        >
          {instrument.status === "active" ? "✓" : instrument.status === "maintenance" ? "⚠" : "○"}
        </Badge>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onEdit}
        >
          <Pencil className="w-3 h-3" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

function InstrumentRow({ 
  instrument, 
  roomId,
  onSave,
  onDelete 
}: { 
  instrument: Instrument; 
  roomId: string;
  onSave: (updated: Instrument) => void;
  onDelete: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [editData, setEditData] = useState<Instrument>(instrument);
  
  const Icon = categoryIcons[instrument.category] || Box;

  const handleSave = () => {
    onSave(editData);
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setEditData(instrument);
    }
    setIsOpen(open);
  };
  
  return (
    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-background border">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{instrument.name}</span>
            <Badge variant="outline" className="font-mono text-[10px] px-1.5">
              {instrument.instrumentNumber}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">{instrument.category}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Badge 
          variant="outline" 
          className={cn("text-[10px] capitalize", statusColors[instrument.status])}
        >
          {instrument.status}
        </Badge>
        
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Edit Instrument</h4>
                <p className="text-xs text-muted-foreground">
                  Update the instrument details below.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Category</Label>
                  <Select
                    value={editData.category}
                    onValueChange={(value) => setEditData({ ...editData, category: value as InstrumentCategory })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {instrumentCategories.map((cat) => (
                        <SelectItem key={cat} value={cat} className="text-xs">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-xs">Identification Number</Label>
                  <Input
                    value={editData.instrumentNumber}
                    onChange={(e) => setEditData({ ...editData, instrumentNumber: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-xs">Status</Label>
                  <Select
                    value={editData.status}
                    onValueChange={(value) => setEditData({ ...editData, status: value as Instrument["status"] })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active" className="text-xs">Active</SelectItem>
                      <SelectItem value="maintenance" className="text-xs">Maintenance</SelectItem>
                      <SelectItem value="inactive" className="text-xs">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-xs">Notes</Label>
                  <Textarea
                    value={editData.notes || ""}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    className="text-xs min-h-[60px] resize-none"
                    placeholder="Add notes about this instrument..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                >
                  Save
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
