import { useState, useMemo } from "react";
import { format, isToday, isYesterday, isSameDay, isWithinInterval, startOfDay, endOfDay, subDays } from "date-fns";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { ComponentType, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SearchInput } from "@/components/ui/SearchInput";
import { ExportDropdown } from "@/components/ui/ExportDropdown";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  BookOpen,
  Send,
  Eye,
  Clock,
  CalendarIcon,
  Pencil,
  Trash2,
  Plus,
  X,
  Users,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { mockCommunicationNotes } from "@/data/mockCommunicationBook";
import { CommunicationNote, SeenBy } from "@/types/communicationBook";
import { toast } from "sonner";
import { exportCommNotesCSV, exportCommNotesPDF } from "@/utils/moduleExports";
import { PageIntro } from "@/components/layout/PageIntro";
import { COMMUNICATION_BOOK_PRACTICE_TIP } from "@/components/communicationBook/communicationBookPracticeTip";
import { DEFAULT_DEPARTMENTS } from "@/types/departments";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DynamicIcon } from "@/components/DynamicIcon";

const BOOKS_STORAGE_KEY = "communicationBook.enabledBookIds";
const GENERAL_BOOK = { id: "general", name: "General", icon: "BookOpen", color: "bg-primary" };

const CommunicationBook = ({ Layout = AdminLayout }: { Layout?: ComponentType<{ children: ReactNode }> }) => {
  const { currentUser } = useUser();
  const CURRENT_USER_ID = currentUser?.id || "current-user";
  const CURRENT_USER_NAME = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : "Admin User";
  const CURRENT_USER_INITIALS = currentUser
    ? `${currentUser.firstName[0]}${currentUser.lastName[0]}`
    : "AU";
  const CURRENT_USER_ROLE = currentUser?.role || "Practice Manager";
  const CURRENT_USER_DEPT = currentUser?.departmentId || "Admin";

  const [notes, setNotes] = useState<CommunicationNote[]>(mockCommunicationNotes);
  const [newNote, setNewNote] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateMode, setDateMode] = useState<"all" | "today" | "7days" | "custom">("all");
  const [customFrom, setCustomFrom] = useState<Date | undefined>();
  const [customTo, setCustomTo] = useState<Date | undefined>();

  // Books: persisted list of enabled department books (in addition to General)
  const [enabledBookIds, setEnabledBookIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(BOOKS_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });
  const [activeBookId, setActiveBookId] = useState<string>("general");
  const [addBookOpen, setAddBookOpen] = useState(false);
  const [removeBookId, setRemoveBookId] = useState<string | null>(null);

  const persistBooks = (ids: string[]) => {
    setEnabledBookIds(ids);
    try { localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(ids)); } catch {}
  };

  const books = useMemo(() => {
    const deptBooks = enabledBookIds
      .map((id) => DEFAULT_DEPARTMENTS.find((d) => d.id === id))
      .filter(Boolean)
      .map((d) => ({ id: d!.id, name: d!.name, icon: d!.icon, color: d!.color }));
    return [GENERAL_BOOK, ...deptBooks];
  }, [enabledBookIds]);

  const availableToAdd = useMemo(
    () => DEFAULT_DEPARTMENTS.filter((d) => !enabledBookIds.includes(d.id)),
    [enabledBookIds]
  );

  const activeBook = books.find((b) => b.id === activeBookId) ?? GENERAL_BOOK;

  // Mark as seen when opening/viewing a note
  const markAsSeen = (noteId: string) => {
    setNotes((prev) =>
      prev.map((note) => {
        if (note.id !== noteId) return note;
        if (note.authorId === CURRENT_USER_ID) return note;
        const alreadySeen = note.seenBy.some((s) => s.userId === CURRENT_USER_ID);
        if (alreadySeen) return note;
        return {
          ...note,
          seenBy: [
            ...note.seenBy,
            {
              userId: CURRENT_USER_ID,
              userName: CURRENT_USER_NAME,
              seenAt: new Date(),
              avatarInitials: CURRENT_USER_INITIALS,
            },
          ],
        };
      })
    );
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note: CommunicationNote = {
      id: `cn-${Date.now()}`,
      content: newNote.trim(),
      authorId: CURRENT_USER_ID,
      authorName: CURRENT_USER_NAME,
      authorRole: CURRENT_USER_ROLE,
      authorDepartment: CURRENT_USER_DEPT,
      authorInitials: CURRENT_USER_INITIALS,
      createdAt: new Date(),
      seenBy: [],
      bookId: activeBookId,
    };
    setNotes((prev) => [note, ...prev]);
    setNewNote("");
    toast.success(`Note added to ${activeBook.name}`);
  };

  const handleEditNote = (noteId: string, newContent: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, content: newContent } : n))
    );
    toast.success("Note updated");
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    toast.success("Note deleted");
  };

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      // Book scope: notes without bookId fall under "general"
      const noteBook = n.bookId ?? "general";
      if (noteBook !== activeBookId) return false;
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!n.content.toLowerCase().includes(q) && !n.authorName.toLowerCase().includes(q)) return false;
      }
      // Date filter
      if (dateMode === "today" && !isToday(n.createdAt)) return false;
      if (dateMode === "7days" && n.createdAt < startOfDay(subDays(new Date(), 7))) return false;
      if (dateMode === "custom") {
        if (customFrom && n.createdAt < startOfDay(customFrom)) return false;
        if (customTo && n.createdAt > endOfDay(customTo)) return false;
      }
      return true;
    });
  }, [notes, searchQuery, dateMode, customFrom, customTo, activeBookId]);

  // Group notes by date
  const groupedNotes = useMemo(() => {
    const groups: { label: string; date: Date; notes: CommunicationNote[] }[] = [];
    const sorted = [...filteredNotes].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    sorted.forEach((note) => {
      const existing = groups.find((g) => isSameDay(g.date, note.createdAt));
      if (existing) {
        existing.notes.push(note);
      } else {
        let label = format(note.createdAt, "EEEE, d MMMM yyyy");
        if (isToday(note.createdAt)) label = "Today";
        else if (isYesterday(note.createdAt)) label = "Yesterday";
        groups.push({ label, date: note.createdAt, notes: [note] });
      }
    });
    return groups;
  }, [filteredNotes]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddNote();
    }
  };

  return (
    <Layout>
      <MobileHeader
        title="Communication Book"
        subtitle="Team notes & updates"
      />

      {/* Desktop Header */}
      <PageHeader
        title="Digital Communication Book"
        subtitle="Leave notes for the team — everyone can see who has read each entry"
        icon={BookOpen}
      />

      <div className="px-4 md:px-8 py-4 max-w-4xl mx-auto space-y-4">
        <PageIntro
          highlight="A shared notebook for the whole team."
          description="Capture shift handovers, patient notes and quick messages in one running log — no more sticky notes or missed conversations."
        />


        {/* Communication Book Tabs */}
        <div className="flex items-center gap-2 flex-wrap border-b border-border/60 pb-2">
          {books.map((b) => {
            const isActive = b.id === activeBookId;
            const count = notes.filter((n) => (n.bookId ?? "general") === b.id).length;
            return (
              <div key={b.id} className="relative group">
                <button
                  onClick={() => setActiveBookId(b.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground/70 hover:bg-muted/70"
                  )}
                >
                  <DynamicIcon name={b.icon} className="w-3.5 h-3.5" />
                  <span>{b.name}</span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "h-4 px-1.5 text-[10px] ml-0.5",
                      isActive && "bg-primary-foreground/20 text-primary-foreground"
                    )}
                  >
                    {count}
                  </Badge>
                </button>
                {b.id !== "general" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setRemoveBookId(b.id); }}
                    className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-background border border-border text-muted-foreground hover:text-destructive hover:border-destructive opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    aria-label={`Remove ${b.name} book`}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => setAddBookOpen(true)}
            disabled={availableToAdd.length === 0}
          >
            <Plus className="w-3.5 h-3.5" />
            New Book
          </Button>
        </div>


        {/* Add Note */}
        <Card className="border-primary/20 bg-primary/[0.02]">
          <CardContent className="pt-4 pb-3 px-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-[10px] bg-primary/20 text-primary font-semibold">
                  {CURRENT_USER_INITIALS}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{CURRENT_USER_NAME}</span>
              <span className="text-xs text-muted-foreground">· {CURRENT_USER_ROLE}</span>
              <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <DynamicIcon name={activeBook.icon} className="w-3 h-3" />
                Posting to <span className="font-medium text-foreground">{activeBook.name}</span>
              </span>
            </div>
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Write a note for ${activeBook.name}...`}
              className="min-h-[80px] resize-none text-sm"
            />
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">
                Press Enter to send, Shift+Enter for new line
              </p>
              <Button
                size="sm"
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Add Note
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search notes..."
            className="flex-1 max-w-sm"
          />
          <div className="flex items-center gap-2 flex-wrap">
            <SegmentedControl
              options={[
                { id: "all" as const, label: "All" },
                { id: "today" as const, label: "Today" },
                { id: "7days" as const, label: "7 Days" },
                { id: "custom" as const, label: "Custom", icon: CalendarIcon },
              ]}
              value={dateMode}
              onChange={(val) => setDateMode(val as typeof dateMode)}
              size="sm"
            />
            <ExportDropdown
              onExportCSV={() => { exportCommNotesCSV(filteredNotes); toast.success("CSV exported"); }}
              onExportPDF={() => exportCommNotesPDF(filteredNotes)}
            />
          </div>
        </div>

        {/* Custom date range picker */}
        {dateMode === "custom" && (
          <div className="flex items-center gap-2 flex-wrap">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("gap-1.5 text-xs", !customFrom && "text-muted-foreground")}>
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {customFrom ? format(customFrom, "d MMM yyyy") : "From"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={customFrom} onSelect={setCustomFrom} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
            <span className="text-xs text-muted-foreground">→</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("gap-1.5 text-xs", !customTo && "text-muted-foreground")}>
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {customTo ? format(customTo, "d MMM yyyy") : "To"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={customTo} onSelect={setCustomTo} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
            {(customFrom || customTo) && (
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setCustomFrom(undefined); setCustomTo(undefined); }}>
                Clear
              </Button>
            )}
          </div>
        )}

        {/* Notes grouped by date */}
        {groupedNotes.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="font-medium">No notes in {activeBook.name} yet</p>
            <p className="text-sm mt-1">Be the first to add a note to this communication book</p>
          </div>
        ) : (
          groupedNotes.map((group) => (
            <div key={group.label} className="space-y-3">
              <div className="flex items-center gap-3">
                <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                  {group.label}
                </h3>
                <div className="flex-1 h-px bg-border" />
                <Badge variant="secondary" className="text-[10px] shrink-0">
                  {group.notes.length} {group.notes.length === 1 ? "note" : "notes"}
                </Badge>
              </div>

              {group.notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  currentUserId={CURRENT_USER_ID}
                  onMarkAsSeen={markAsSeen}
                  onEdit={handleEditNote}
                  onDelete={handleDeleteNote}
                />
              ))}
            </div>
          ))
        )}
      </div>

      {/* Add Book Dialog */}
      <Dialog open={addBookOpen} onOpenChange={setAddBookOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create a Communication Book</DialogTitle>
            <DialogDescription>
              Pick a department to give it its own dedicated communication book.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5 max-h-[360px] overflow-y-auto py-1">
            {availableToAdd.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                All departments already have a book.
              </p>
            ) : (
              availableToAdd.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    persistBooks([...enabledBookIds, d.id]);
                    setActiveBookId(d.id);
                    setAddBookOpen(false);
                    toast.success(`${d.name} communication book created`);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-left transition-colors"
                >
                  <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center text-white shrink-0", d.color)}>
                    <DynamicIcon name={d.icon} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{d.name}</p>
                    {d.description && (
                      <p className="text-[11px] text-muted-foreground truncate">{d.description}</p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddBookOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Book Confirmation */}
      <AlertDialog open={!!removeBookId} onOpenChange={(o) => !o && setRemoveBookId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this communication book?</AlertDialogTitle>
            <AlertDialogDescription>
              Notes posted to this book will be hidden from view but not deleted. You can re-add the book at any time to see them again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!removeBookId) return;
                persistBooks(enabledBookIds.filter((id) => id !== removeBookId));
                if (activeBookId === removeBookId) setActiveBookId("general");
                setRemoveBookId(null);
                toast.success("Communication book removed");
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

interface NoteCardProps {
  note: CommunicationNote;
  currentUserId: string;
  onMarkAsSeen: (id: string) => void;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

const NoteCard = ({ note, currentUserId, onMarkAsSeen, onEdit, onDelete }: NoteCardProps) => {
  const isMine = note.authorId === currentUserId;
  const haveSeen = note.seenBy.some((s) => s.userId === currentUserId);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Auto-mark as seen on mount
  useState(() => {
    if (!isMine && !haveSeen) {
      onMarkAsSeen(note.id);
    }
  });

  const handleSaveEdit = () => {
    if (!editContent.trim()) return;
    onEdit(note.id, editContent.trim());
    setIsEditing(false);
  };

  return (
    <>
      <Card className="hover:shadow-sm transition-shadow">
        <CardContent className="p-4 space-y-3">
          {/* Author row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-[11px] bg-primary/15 text-primary font-semibold">
                  {note.authorInitials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{note.authorName}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {note.authorRole} · {note.authorDepartment}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span className="text-[11px]">{format(note.createdAt, "h:mm a")}</span>
              </div>
              {isMine && (
                <div className="flex items-center gap-0.5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditContent(note.content); setIsEditing(true); }}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">Edit</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => setDeleteOpen(true)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">Delete</TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>

          {/* Content — editable or static */}
          {isEditing ? (
            <div className="pl-[42px] space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[60px] resize-none text-sm"
                autoFocus
              />
              <div className="flex items-center gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button size="sm" onClick={handleSaveEdit} disabled={!editContent.trim()}>Save</Button>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-foreground/90 pl-[42px]">
              {note.content}
            </p>
          )}

          {/* Seen By */}
          <div className="pl-[42px] flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Eye className="w-3 h-3" />
              <span className="text-[11px] font-medium">
                {note.seenBy.length === 0 ? "No one yet" : `Seen by ${note.seenBy.length}`}
              </span>
            </div>

            {note.seenBy.length > 0 && (
              <div className="flex items-center -space-x-1.5">
                {note.seenBy.slice(0, 6).map((seen) => (
                  <Tooltip key={seen.userId}>
                    <TooltipTrigger asChild>
                      <Avatar className="h-5 w-5 border-2 border-background cursor-default">
                        <AvatarFallback className="text-[8px] bg-muted text-muted-foreground font-medium">
                          {seen.avatarInitials}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <p className="font-medium">{seen.userName}</p>
                      <p className="text-muted-foreground">
                        Seen {format(seen.seenAt, "d MMM, h:mm a")}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
                {note.seenBy.length > 6 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className="h-5 w-5 border-2 border-background cursor-default">
                        <AvatarFallback className="text-[8px] bg-muted text-muted-foreground font-medium">
                          +{note.seenBy.length - 6}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {note.seenBy.slice(6).map((s) => (
                        <p key={s.userId}>{s.userName}</p>
                      ))}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(note.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CommunicationBook;
