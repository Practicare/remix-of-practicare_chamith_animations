import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MemoFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showMandatoryOnly: boolean;
  onMandatoryFilterChange: (value: boolean) => void;
  showUnreadOnly: boolean;
  onUnreadFilterChange: (value: boolean) => void;
}

export const MemoFilters = ({
  searchQuery,
  onSearchChange,
  showMandatoryOnly,
  onMandatoryFilterChange,
  showUnreadOnly,
  onUnreadFilterChange,
}: MemoFiltersProps) => {
  const hasFilters = searchQuery || showMandatoryOnly || showUnreadOnly;

  const clearFilters = () => {
    onSearchChange("");
    onMandatoryFilterChange(false);
    onUnreadFilterChange(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search memos..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select
        value={showMandatoryOnly ? "mandatory" : showUnreadOnly ? "unread" : "all"}
        onValueChange={(v) => {
          onMandatoryFilterChange(v === "mandatory");
          onUnreadFilterChange(v === "unread");
        }}
      >
        <SelectTrigger className="w-[180px]">
          <Filter className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Filter by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Memos</SelectItem>
          <SelectItem value="mandatory">Mandatory Only</SelectItem>
          <SelectItem value="unread">Unread Only</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
          <X className="w-4 h-4" />
          Clear
        </Button>
      )}
    </div>
  );
};
