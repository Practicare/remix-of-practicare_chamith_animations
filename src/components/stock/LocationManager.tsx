import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MapPin, Plus, ChevronDown, MoreHorizontal, Pencil, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StockLocation {
  id: string;
  name: string;
}

interface LocationManagerProps {
  locations: StockLocation[];
  selectedLocation: string;
  onSelectLocation: (location: string) => void;
  onAddLocation: (name: string) => void;
  onEditLocation: (id: string, name: string) => void;
  onDeleteLocation: (id: string) => void;
}

export function LocationManager({
  locations,
  selectedLocation,
  onSelectLocation,
  onAddLocation,
  onEditLocation,
  onDeleteLocation,
}: LocationManagerProps) {
  const [open, setOpen] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<StockLocation | null>(null);
  const [editName, setEditName] = useState("");

  const handleAddLocation = () => {
    if (newLocationName.trim()) {
      onAddLocation(newLocationName.trim());
      setNewLocationName("");
      setIsAdding(false);
    }
  };

  const handleStartEdit = (location: StockLocation) => {
    setEditingLocation(location);
    setEditName(location.name);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingLocation && editName.trim()) {
      onEditLocation(editingLocation.id, editName.trim());
      setEditDialogOpen(false);
      setEditingLocation(null);
    }
  };

  const handleDelete = (id: string) => {
    onDeleteLocation(id);
    if (selectedLocation === locations.find(l => l.id === id)?.name) {
      onSelectLocation("");
    }
  };

  const selectedLocationObj = locations.find(l => l.name === selectedLocation);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between font-normal",
              !selectedLocation && "text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {selectedLocation || "Select location"}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0 bg-popover border border-border shadow-lg z-50" align="start">
          <div className="p-2 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground px-2 py-1">Storage Locations</p>
          </div>
          
          <div className="max-h-[200px] overflow-y-auto p-1">
            {locations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No locations added yet</p>
            ) : (
              locations.map((location) => (
                <div
                  key={location.id}
                  className="flex items-center justify-between group hover:bg-muted rounded-md"
                >
                  <button
                    className="flex-1 flex items-center gap-2 px-2 py-2 text-sm text-left"
                    onClick={() => {
                      onSelectLocation(location.name);
                      setOpen(false);
                    }}
                  >
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1">{location.name}</span>
                    {selectedLocation === location.name && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border border-border shadow-lg z-50">
                      <DropdownMenuItem onClick={() => handleStartEdit(location)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(location.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            )}
          </div>

          <div className="p-2 border-t border-border">
            {isAdding ? (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Location name"
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddLocation();
                    if (e.key === "Escape") {
                      setIsAdding(false);
                      setNewLocationName("");
                    }
                  }}
                  autoFocus
                  className="h-8 text-sm"
                />
                <Button size="sm" className="h-8" onClick={handleAddLocation}>
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8"
                  onClick={() => {
                    setIsAdding(false);
                    setNewLocationName("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-muted-foreground"
                onClick={() => setIsAdding(true)}
              >
                <Plus className="w-4 h-4" />
                Add new location
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Location name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit();
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={!editName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
