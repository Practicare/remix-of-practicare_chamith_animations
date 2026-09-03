import { Room, Instrument, InstrumentCategory } from "@/types/rooms";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/SearchInput";
import { useState } from "react";
import {
  DoorOpen,
  Plus,
  Package,
  Pencil,
  Trash2,
  MoreHorizontal,
  Monitor,
  Printer,
  ShoppingCart,
  Scale,
  Activity,
  HeartPulse,
  BedDouble,
  Zap,
  Wind,
  Sparkles,
  Thermometer,
  Box,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const statusColors = {
  active: "bg-success/10 text-success border-success/20",
  maintenance: "bg-warning/10 text-warning border-warning/20",
  inactive: "bg-muted text-muted-foreground border-muted",
};

interface RoomDetailViewProps {
  room: Room;
  onBack: () => void;
  onAddInstrument: (roomId: string) => void;
  onEditRoom: (room: Room) => void;
  onDeleteRoom: (roomId: string) => void;
  onEditInstrument: (roomId: string, instrument: Instrument) => void;
  onDeleteInstrument: (roomId: string, instrumentId: string) => void;
}

export function RoomDetailView({
  room,
  onBack,
  onAddInstrument,
  onEditRoom,
  onDeleteRoom,
  onEditInstrument,
  onDeleteInstrument,
}: RoomDetailViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInstruments = room.instruments.filter(inst => {
    const q = searchQuery.toLowerCase();
    return (
      inst.name.toLowerCase().includes(q) ||
      inst.instrumentNumber.toLowerCase().includes(q) ||
      inst.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Back + room header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            ← Back to Rooms
          </button>
          <span className="text-muted-foreground hidden md:inline">/</span>
          <div className="hidden md:flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">#{room.roomNumber}</Badge>
            <span className="text-[13px] font-semibold">{room.roomName}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditRoom(room)}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit Room
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => onDeleteRoom(room.id)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Room
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile room title */}
      <div className="md:hidden flex items-center gap-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <DoorOpen className="w-4 h-4 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="font-mono text-[10px] px-1">#{room.roomNumber}</Badge>
            <h3 className="font-semibold text-sm">{room.roomName}</h3>
          </div>
          {room.description && (
            <p className="text-[11px] text-muted-foreground">{room.description}</p>
          )}
        </div>
      </div>

      {/* Search + Add */}
      <div className="flex items-center gap-3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search items..."
          className="flex-1 max-w-sm"
        />
        <Button size="sm" onClick={() => onAddInstrument(room.id)} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          Add Item
        </Button>
      </div>

      {/* Items list */}
      {filteredInstruments.length > 0 ? (
        <div className="space-y-2">
          {filteredInstruments.map((instrument) => {
            const Icon = categoryIcons[instrument.category] || Box;
            return (
              <div
                key={instrument.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="p-2 rounded-lg bg-background border shrink-0">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{instrument.name}</span>
                      <Badge variant="outline" className="font-mono text-[10px] px-1.5">
                        {instrument.instrumentNumber}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{instrument.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] capitalize", statusColors[instrument.status])}
                  >
                    {instrument.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onEditInstrument(room.id, instrument)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => onDeleteInstrument(room.id, instrument.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
          <Package className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
          <h3 className="text-sm font-semibold mb-1">
            {searchQuery ? "No items match your search" : "No items yet"}
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            {searchQuery ? "Try adjusting your search" : "Add equipment and instruments to this room"}
          </p>
          {!searchQuery && (
            <Button size="sm" onClick={() => onAddInstrument(room.id)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add First Item
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
