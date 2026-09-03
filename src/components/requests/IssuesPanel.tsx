import { useMemo, useState } from "react";
import { Issue, IssueStatus, useIssues } from "@/contexts/IssuesContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/SearchInput";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertTriangle, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { AddIssueDialog } from "./AddIssueDialog";
import { mockDepartments } from "@/data/mockDepartments";
import { DEFAULT_STOCK_CATEGORIES } from "@/types/stock";

const STATUS_STYLES: Record<IssueStatus, string> = {
  open: "bg-primary/10 text-primary border-primary/20",
  "in-progress": "bg-warning/10 text-warning border-warning/20",
  resolved: "bg-success/10 text-success border-success/20",
  closed: "bg-muted text-muted-foreground border-border",
};

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  high: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const STATUS_LABEL: Record<IssueStatus, string> = {
  open: "Open",
  "in-progress": "In progress",
  resolved: "Resolved",
  closed: "Closed",
};

export function IssuesPanel() {
  const { issues, updateIssue, deleteIssue } = useIssues();
  const [addOpen, setAddOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | IssueStatus>("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const c = { all: issues.length, open: 0, "in-progress": 0, resolved: 0, closed: 0 } as Record<string, number>;
    for (const i of issues) c[i.status]++;
    return c;
  }, [issues]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return issues.filter((i) => {
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      if (!q) return true;
      return (
        i.title.toLowerCase().includes(q) ||
        (i.description ?? "").toLowerCase().includes(q) ||
        (i.assignedTo ?? "").toLowerCase().includes(q) ||
        (i.roomName ?? "").toLowerCase().includes(q)
      );
    });
  }, [issues, statusFilter, query]);

  const chips: { key: "all" | IssueStatus; label: string }[] = [
    { key: "all", label: "All" },
    { key: "open", label: "Open" },
    { key: "in-progress", label: "In progress" },
    { key: "resolved", label: "Resolved" },
    { key: "closed", label: "Closed" },
  ];

  const deptName = (id?: string) => mockDepartments.find((d) => d.id === id)?.name;
  const catName = (id?: string) => DEFAULT_STOCK_CATEGORIES.find((c) => c.id === id)?.displayName;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 flex-wrap">
        {chips.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors",
              statusFilter === key ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {label}
            <span className="ml-1.5 text-[11px] opacity-70">{counts[key] ?? 0}</span>
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <SearchInput value={query} onChange={setQuery} placeholder="Search issues..." className="w-56" />
          <Button size="sm" onClick={() => setAddOpen(true)} className="h-8 gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Report issue
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-xl">
          <AlertTriangle className="w-8 h-8 text-muted-foreground/50 mb-2" />
          <p className="text-sm font-medium">No issues reported</p>
          <p className="text-xs text-muted-foreground mt-1">
            Report an issue and link it to a department, room, or stock category.
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold text-foreground">Date</TableHead>
                <TableHead className="font-semibold text-foreground">Issue</TableHead>
                <TableHead className="font-semibold text-foreground">Assigned to</TableHead>
                <TableHead className="font-semibold text-foreground">Linked</TableHead>
                <TableHead className="font-semibold text-foreground">Priority</TableHead>
                <TableHead className="font-semibold text-foreground">Status</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((i) => {
                const links: string[] = [];
                if (i.departmentId) links.push(`Dept: ${deptName(i.departmentId) ?? i.departmentId}`);
                if (i.roomName) links.push(`Room: ${i.roomName}`);
                if (i.stockCategoryId) links.push(`Stock: ${catName(i.stockCategoryId) ?? i.stockCategoryId}`);
                return (
                  <TableRow key={i.id} className="hover:bg-muted/30">
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(i.createdAt), "dd MMM yy")}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="font-medium">{i.title}</div>
                      {i.description && (
                        <div className="text-muted-foreground text-[11px] mt-0.5 line-clamp-1">{i.description}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{i.assignedTo ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex flex-col gap-0.5">
                        {links.length === 0 ? "—" : links.map((l) => <span key={l}>{l}</span>)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[11px] capitalize", PRIORITY_STYLES[i.priority])}>
                        {i.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[11px]", STATUS_STYLES[i.status])}>
                        {STATUS_LABEL[i.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline" className="h-8 text-xs">Status</Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {(["open", "in-progress", "resolved", "closed"] as IssueStatus[]).map((s) => (
                              <DropdownMenuItem
                                key={s}
                                disabled={s === i.status}
                                onClick={() => { updateIssue(i.id, { status: s }); toast.success(`Marked ${STATUS_LABEL[s]}`); }}
                              >
                                {STATUS_LABEL[s]}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => { deleteIssue(i.id); toast.success("Issue deleted"); }}
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <AddIssueDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
