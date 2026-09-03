import { useState, useMemo } from "react";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SearchInput } from "@/components/ui/SearchInput";
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
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";
import { mockCommunicationNotes } from "@/data/mockCommunicationBook";
import { CommunicationNote } from "@/types/communicationBook";
import { toast } from "sonner";

interface CommunicationBookFeedProps {
  compact?: boolean;
}

export function CommunicationBookFeed({ compact = false }: CommunicationBookFeedProps) {
  const { currentUser } = useUser();
  
  const CURRENT_USER_ID = currentUser?.id || "current-user";
  const CURRENT_USER_NAME = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : "Staff User";
  const CURRENT_USER_INITIALS = currentUser
    ? `${currentUser.firstName[0]}${currentUser.lastName[0]}`
    : "SU";
  const CURRENT_USER_ROLE = currentUser?.role || "Staff";
  const CURRENT_USER_DEPT = currentUser?.departmentId || "general";

  const [notes, setNotes] = useState<CommunicationNote[]>(mockCommunicationNotes);
  const [newNote, setNewNote] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);

  if (!currentUser) return null;

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
    };
    setNotes((prev) => [note, ...prev]);
    setNewNote("");
    toast.success("Note added");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddNote();
    }
  };

  const handleEditNote = (noteId: string, newContent: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, content: newContent } : n))
    );
    setEditingNoteId(null);
    toast.success("Note updated");
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    setDeleteNoteId(null);
    toast.success("Note deleted");
  };

  // Auto-mark as seen
  const markAsSeen = (noteId: string) => {
    setNotes((prev) =>
      prev.map((note) => {
        if (note.id !== noteId || note.authorId === CURRENT_USER_ID) return note;
        if (note.seenBy.some((s) => s.userId === CURRENT_USER_ID)) return note;
        return {
          ...note,
          seenBy: [
            ...note.seenBy,
            { userId: CURRENT_USER_ID, userName: CURRENT_USER_NAME, seenAt: new Date(), avatarInitials: CURRENT_USER_INITIALS },
          ],
        };
      })
    );
  };

  const filteredNotes = useMemo(() => {
    let result = notes;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) => n.content.toLowerCase().includes(q) || n.authorName.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [notes, searchQuery]);

  // Group by date
  const groupedNotes = useMemo(() => {
    const groups: { label: string; date: Date; notes: CommunicationNote[] }[] = [];
    filteredNotes.forEach((note) => {
      // Auto-mark as seen
      if (note.authorId !== CURRENT_USER_ID && !note.seenBy.some((s) => s.userId === CURRENT_USER_ID)) {
        markAsSeen(note.id);
      }
      const existing = groups.find((g) => isSameDay(g.date, note.createdAt));
      if (existing) {
        existing.notes.push(note);
      } else {
        let label = format(note.createdAt, "EEEE, d MMM");
        if (isToday(note.createdAt)) label = "Today";
        else if (isYesterday(note.createdAt)) label = "Yesterday";
        groups.push({ label, date: note.createdAt, notes: [note] });
      }
    });
    return groups;
  }, [filteredNotes]);

  const displayGroups = compact ? groupedNotes.slice(0, 1) : groupedNotes;

  return (
    <div className="space-y-4">
      {/* Compose */}
      <Card className="border-primary/20 bg-primary/[0.02]">
        <CardContent className="pt-4 pb-3 px-4 space-y-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-[10px] bg-primary/20 text-primary font-semibold">
                {CURRENT_USER_INITIALS}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{CURRENT_USER_NAME}</span>
          </div>
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a note for the team..."
            className="min-h-[70px] resize-none text-sm"
          />
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground">Enter to send</p>
            <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()} className="gap-1.5">
              <Send className="w-3.5 h-3.5" />
              Post
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search (non-compact only) */}
      {!compact && (
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search notes..."
          className="max-w-sm"
        />
      )}

      {/* Notes */}
      {displayGroups.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No notes yet</p>
        </div>
      ) : (
        displayGroups.map((group) => (
          <div key={group.label} className="space-y-2">
            <div className="flex items-center gap-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                {group.label}
              </h4>
              <div className="flex-1 h-px bg-border" />
              <Badge variant="secondary" className="text-[10px]">{group.notes.length}</Badge>
            </div>

            {group.notes.map((note) => {
              const isMine = note.authorId === CURRENT_USER_ID;
              const isEditingThis = editingNoteId === note.id;

              return (
                <Card key={note.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-3 space-y-2">
                    {/* Author */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarFallback className="text-[10px] bg-primary/15 text-primary font-semibold">
                            {note.authorInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{note.authorName}</p>
                          <p className="text-[10px] text-muted-foreground">{note.authorRole}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {format(note.createdAt, "h:mm a")}
                        </span>
                        {isMine && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                setEditContent(note.content);
                                setEditingNoteId(note.id);
                              }}
                            >
                              <Pencil className="w-2.5 h-2.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={() => setDeleteNoteId(note.id)}
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    {isEditingThis ? (
                      <div className="pl-9 space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[50px] resize-none text-sm"
                          autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => setEditingNoteId(null)}>Cancel</Button>
                          <Button size="sm" onClick={() => handleEditNote(note.id, editContent)} disabled={!editContent.trim()}>Save</Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-foreground/90 pl-9">{note.content}</p>
                    )}

                    {/* Seen by */}
                    <div className="pl-9 flex items-center gap-2">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="w-2.5 h-2.5" />
                        <span className="text-[10px]">
                          {note.seenBy.length === 0 ? "No one yet" : `${note.seenBy.length} seen`}
                        </span>
                      </div>
                      {note.seenBy.length > 0 && (
                        <div className="flex -space-x-1">
                          {note.seenBy.slice(0, 5).map((seen) => (
                            <Tooltip key={seen.userId}>
                              <TooltipTrigger asChild>
                                <Avatar className="h-4 w-4 border border-background">
                                  <AvatarFallback className="text-[7px] bg-muted font-medium">
                                    {seen.avatarInitials}
                                  </AvatarFallback>
                                </Avatar>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs">
                                {seen.userName} · {format(seen.seenAt, "h:mm a")}
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ))
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteNoteId} onOpenChange={() => setDeleteNoteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteNoteId && handleDeleteNote(deleteNoteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
