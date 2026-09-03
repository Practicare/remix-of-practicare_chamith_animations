import { MapPin } from "lucide-react";
import { SearchInput } from "@/components/ui/SearchInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StockLocation } from "./LocationManager";

interface StockFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  locations?: StockLocation[];
  selectedLocation?: string;
  onLocationChange?: (locationId: string) => void;
}

export function StockFilters({ 
  searchQuery, 
  onSearchChange,
  locations = [],
  selectedLocation = "all",
  onLocationChange,
}: StockFiltersProps) {
  return (
    <div className="flex items-center gap-2 md:gap-4">
      <SearchInput
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search stock..."
        className="flex-1"
      />
      
      {/* Location filter - hidden on mobile, shown in category dropdown instead */}
      {locations.length > 0 && onLocationChange && (
        <Select value={selectedLocation} onValueChange={onLocationChange}>
          <SelectTrigger className="hidden md:flex w-[200px]">
            <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filter by location" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-border shadow-lg z-50">
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location.id} value={location.name}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
