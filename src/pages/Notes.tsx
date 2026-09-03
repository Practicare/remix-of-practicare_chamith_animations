import { useState, useMemo, useRef, useEffect, ComponentType, ReactNode } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageIntro } from "@/components/layout/PageIntro";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/SearchInput";
import { Checkbox } from "@/components/ui/checkbox";
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
  StickyNote,
  Trash2,
  ImagePlus,
  X,
  Pencil,
  Clock,
  Send,
  Check,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Note {
  id: string;
  title: string;
  content: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "practicare.notes.v1";

const loadNotes = (): Note[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const Notes = ({ Layout = AdminLayout }: { Layout?: ComponentType<{ children: ReactNode }> }) => {
  const [notes, setNotes] = useState<Note[]>(() => loadNotes());
  const [search, setSearch] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  // Inline composer state
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newImages, setNewImages] = useState<string[]>([]);
  const newFileRef = useRef<HTMLInputElement>(null);

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImages, setEditImages] = useState<string[]>([]);
  const editFileRef = useRef<HTMLInputElement>(null);

  const [confirmDelete, setConfirmDelete] = useState<null | { ids: string[] }>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
      /* ignore */
    }
  }, [notes]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? notes.filter(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.content.toLowerCase().includes(q)
        )
      : notes;
    return [...list].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [notes, search]);

  const readFiles = async (files: FileList | null): Promise<string[]> => {
    if (!files || files.length === 0) return [];
    return Promise.all(
      Array.from(files).map(
        (f) =>
          new Promise<string>((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(r.result as string);
            r.onerror = reject;
            r.readAsDataURL(f);
          })
      )
    );
  };

  const handlePost = () => {
    if (!newTitle.trim() && !newContent.trim() && newImages.length === 0) return;
    const now = new Date().toISOString();
    const note: Note = {
      id: `note-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      images: newImages,
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => [note, ...prev]);
    setNewTitle("");
    setNewContent("");
    setNewImages([]);
    toast.success("Note added");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handlePost();
    }
  };

  const startEdit = (n: Note) => {
    setEditingId(n.id);
    setEditTitle(n.title);
    setEditContent(n.content);
    setEditImages(n.images);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
    setEditImages([]);
  };

  const saveEdit = () => {
    if (!editingId) return;
    if (!editTitle.trim() && !editContent.trim() && editImages.length === 0) {
      toast.error("Note is empty");
      return;
    }
    const now = new Date().toISOString();
    setNotes((prev) =>
      prev.map((n) =>
        n.id === editingId
          ? {
              ...n,
              title: editTitle.trim(),
              content: editContent.trim(),
              images: editImages,
              updatedAt: now,
            }
          : n
      )
    );
    cancelEdit();
    toast.success("Note updated");
  };

  const handleDelete = (ids: string[]) => {
    setNotes((prev) => prev.filter((n) => !ids.includes(n.id)));
    setCheckedIds(new Set());
    setSelectMode(false);
    setConfirmDelete(null);
    if (editingId && ids.includes(editingId)) cancelEdit();
    toast.success(`${ids.length} note${ids.length > 1 ? "s" : ""} deleted`);
  };

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  };

  const headerActions = (
    <div className="flex items-center gap-2">
      {selectMode ? (
        <>
          {checkedIds.size > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive gap-1.5"
              onClick={() => setConfirmDelete({ ids: Array.from(checkedIds) })}
            >
              <Trash2 className="w-4 h-4" />
              Delete ({checkedIds.size})
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectMode(false);
              setCheckedIds(new Set());
            }}
          >
            Done
          </Button>
        </>
      ) : (
        notes.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => setSelectMode(true)}>
            Select
          </Button>
        )
      )}
    </div>
  );

  return (
    <Layout>
      <MobileHeader title="Notes" subtitle="Quick notes with images" />
      <PageHeader
        title="Notes"
        subtitle="Quick notes with images, dated automatically"
        icon={StickyNote}
        actions={headerActions}
      />

      <div className="mx-auto w-full max-w-4xl px-4 md:px-8 py-4 md:py-6 space-y-4">
        <PageIntro
          highlight="Capture the thought before it's gone."
          description="Jot quick notes, add photos and search everything later — every entry is dated automatically so nothing important slips through the cracks."
        />
        {/* Inline composer */}
        <Card className="border-primary/20 bg-primary/[0.02]">
          <CardContent className="p-4 space-y-3">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Title (optional)"
              className="border-0 shadow-none px-0 h-auto py-1 text-base font-semibold focus-visible:ring-0 placeholder:text-muted-foreground/60"
            />
            <Textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a note..."
              className="min-h-[80px] resize-none border-0 shadow-none px-0 focus-visible:ring-0 text-sm"
            />

            {newImages.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {newImages.map((src, i) => (
                  <div
                    key={i}
                    className="relative group rounded-lg overflow-hidden border border-border/40"
                  >
                    <img src={src} alt="" className="w-full h-20 object-cover" />
                    <button
                      onClick={() =>
                        setNewImages((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              ref={newFileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={async (e) => {
                const imgs = await readFiles(e.target.files);
                setNewImages((prev) => [...prev, ...imgs]);
                e.target.value = "";
              }}
            />
            <div className="flex items-center justify-between pt-1 border-t border-border/40">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 h-8 text-muted-foreground"
                onClick={() => newFileRef.current?.click()}
              >
                <ImagePlus className="w-4 h-4" />
                Image
              </Button>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-[11px] text-muted-foreground">
                  ⌘/Ctrl + Enter
                </span>
                <Button
                  size="sm"
                  onClick={handlePost}
                  disabled={
                    !newTitle.trim() &&
                    !newContent.trim() &&
                    newImages.length === 0
                  }
                  className="gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Add note
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        {notes.length > 0 && (
          <div className="flex items-center gap-2">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search notes..."
              className="flex-1"
            />
            <span className="hidden md:inline text-xs text-muted-foreground shrink-0">
              {filtered.length} of {notes.length}
            </span>
          </div>
        )}

        {/* Mobile select toolbar */}
        {selectMode && (
          <div className="md:hidden flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50">
            <span className="text-xs font-medium">{checkedIds.size} selected</span>
            <div className="flex items-center gap-1">
              {checkedIds.size > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive h-8 gap-1"
                  onClick={() => setConfirmDelete({ ids: Array.from(checkedIds) })}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={() => {
                  setSelectMode(false);
                  setCheckedIds(new Set());
                }}
              >
                Done
              </Button>
            </div>
          </div>
        )}
        {!selectMode && notes.length > 0 && (
          <div className="md:hidden">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setSelectMode(true)}
            >
              Select
            </Button>
          </div>
        )}

        {/* Notes list */}
        {notes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <StickyNote className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No notes yet — add your first one above</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No matching notes
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((n) => {
              const isChecked = checkedIds.has(n.id);
              const isEditing = editingId === n.id;

              if (isEditing) {
                return (
                  <Card key={n.id} className="ring-2 ring-primary/40">
                    <CardContent className="p-4 space-y-3">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Title (optional)"
                        className="text-base font-semibold"
                      />
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder="Write a note..."
                        className="min-h-[100px] resize-none text-sm"
                      />
                      {editImages.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {editImages.map((src, i) => (
                            <div
                              key={i}
                              className="relative group rounded-lg overflow-hidden border border-border/40"
                            >
                              <img src={src} alt="" className="w-full h-20 object-cover" />
                              <button
                                onClick={() =>
                                  setEditImages((prev) =>
                                    prev.filter((_, idx) => idx !== i)
                                  )
                                }
                                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Remove image"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <input
                        ref={editFileRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={async (e) => {
                          const imgs = await readFiles(e.target.files);
                          setEditImages((prev) => [...prev, ...imgs]);
                          e.target.value = "";
                        }}
                      />
                      <div className="flex items-center justify-between pt-1 border-t border-border/40">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 h-8 text-muted-foreground"
                          onClick={() => editFileRef.current?.click()}
                        >
                          <ImagePlus className="w-4 h-4" />
                          Image
                        </Button>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={cancelEdit}>
                            Cancel
                          </Button>
                          <Button size="sm" onClick={saveEdit} className="gap-1.5">
                            <Check className="w-3.5 h-3.5" />
                            Save
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              return (
                <Card
                  key={n.id}
                  className={cn(
                    "transition-all hover:shadow-sm",
                    isChecked && "ring-2 ring-primary",
                    selectMode && "cursor-pointer"
                  )}
                  onClick={() => {
                    if (selectMode) toggleCheck(n.id);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {selectMode && (
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleCheck(n.id)}
                          className="mt-1"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            {n.title && (
                              <h3 className="text-sm font-semibold">{n.title}</h3>
                            )}
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {format(new Date(n.createdAt), "d MMM yyyy, h:mm a")}
                              {n.updatedAt !== n.createdAt && (
                                <span className="text-muted-foreground/70">
                                  · edited {formatDistanceToNow(new Date(n.updatedAt), { addSuffix: true })}
                                </span>
                              )}
                            </p>
                          </div>
                          {!selectMode && (
                            <div className="flex items-center gap-0.5 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEdit(n);
                                }}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDelete({ ids: [n.id] });
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          )}
                        </div>
                        {n.content && (
                          <p className="text-sm text-foreground/90 whitespace-pre-wrap mt-2 leading-relaxed">
                            {n.content}
                          </p>
                        )}
                        {n.images.length > 0 && (
                          <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {n.images.map((src, i) => (
                              <a
                                key={i}
                                href={src}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="block rounded-lg overflow-hidden border border-border/40"
                              >
                                <img
                                  src={src}
                                  alt=""
                                  className="w-full h-24 object-cover hover:opacity-90 transition-opacity"
                                />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete{" "}
              {confirmDelete?.ids.length === 1
                ? "note"
                : `${confirmDelete?.ids.length} notes`}
              ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDelete && handleDelete(confirmDelete.ids)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Notes;
