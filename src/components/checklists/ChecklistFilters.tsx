import { SearchInput } from "@/components/ui/SearchInput";

interface ChecklistFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const ChecklistFilters = ({
  searchQuery,
  onSearchChange,
}: ChecklistFiltersProps) => {
  return (
    <SearchInput
      value={searchQuery}
      onChange={onSearchChange}
      placeholder="Search checklists..."
      className="w-full"
    />
  );
};
