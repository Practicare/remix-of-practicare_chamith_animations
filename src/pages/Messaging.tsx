import { useState, useMemo, useRef, useEffect, ComponentType, ReactNode } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageIntro } from "@/components/layout/PageIntro";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SearchInput } from "@/components/ui/SearchInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  MessagesSquare,
  Plus,
  Send,
  Paperclip,
  ImagePlus,
  X,
  Users,
  FileText,
  Download,
  ArrowLeft,
  Pencil,
  Trash2,
  Check,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { mockStaffMembers } from "@/data/mockStaff";
import { ChatMessage, MessageAttachment, MessageGroup } from "@/types/messaging";
import {
  loadGroups,
  saveGroups,
  loadMessages,
  saveMessages,
  getInitials,
} from "@/data/messagingStore";


const MAX_FILE_BYTES = 4 * 1024 * 1024;

const formatSize = (bytes: number) =>
  bytes > 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const dayLabel = (iso: string) => {
  const d = new Date(iso);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEEE d MMM");
};

const readFile = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const Messaging = ({ Layout = AdminLayout }: { Layout?: ComponentType<{ children: ReactNode }> }) => {
  const { currentUser } = useUser();
  const [groups, setGroups] = useState<MessageGroup[]>(() => loadGroups());
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadMessages());
  const [activeGroupId, setActiveGroupId] = useState<string>(() => loadGroups()[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState<MessageAttachment[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newMembers, setNewMembers] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [preview, setPreview] = useState<MessageAttachment | null>(null);
  const [tab, setTab] = useState<"group" | "direct">("group");
  const [directOpen, setDirectOpen] = useState(false);
  const [directSearch, setDirectSearch] = useState("");
  const [directSelected, setDirectSelected] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => saveGroups(groups), [groups]);
  useEffect(() => saveMessages(messages), [messages]);

  const authorName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : "You";
  const myId = currentUser?.id ?? "me";

  const activeGroup = groups.find((g) => g.id === activeGroupId);

  const groupMessages = useMemo(
    () =>
      messages
        .filter((m) => m.groupId === activeGroup?.id)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [messages, activeGroup?.id]
  );

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    return groups
      .filter((g) => (g.kind ?? "group") === tab)
      .filter(
        (g) =>
          !q ||
          g.name.toLowerCase().includes(q) ||
          (g.description ?? "").toLowerCase().includes(q)
      );
  }, [groups, search, tab]);

  useEffect(() => {
    if (!activeGroup || (activeGroup.kind ?? "group") !== tab) {
      setActiveGroupId(filteredGroups[0]?.id ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const startDirectChat = () => {
    if (directSelected.length === 0) {
      toast.error("Select at least one person");
      return;
    }
    const selected = mockStaffMembers.filter((s) => directSelected.includes(s.id));
    const names = selected.map((s) => `${s.firstName} ${s.lastName}`);
    const name =
      names.length === 1
        ? names[0]
        : `${selected[0].firstName} ${selected[0].lastName} + ${names.length - 1} other${names.length - 1 > 1 ? "s" : ""}`;

    // Reuse an existing chat with the exact same set of people (1:1 only)
    const existing =
      directSelected.length === 1
        ? groups.find(
            (g) =>
              (g.kind ?? "group") === "direct" &&
              g.memberIds.length <= 2 &&
              g.memberIds.includes(directSelected[0])
          )
        : undefined;

    if (existing) {
      setActiveGroupId(existing.id);
    } else {
      const convo: MessageGroup = {
        id: `dm-${Date.now()}`,
        name,
        memberIds: [...directSelected, myId],
        createdAt: new Date().toISOString(),
        createdBy: authorName,
        kind: "direct",
      };
      setGroups((prev) => [convo, ...prev]);
      setActiveGroupId(convo.id);
    }
    setTab("direct");
    setDirectOpen(false);
    setDirectSearch("");
    setDirectSelected([]);
    setMobileChatOpen(true);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const content = editDraft.trim();
    if (!content) {
      toast.error("Message can't be empty");
      return;
    }
    setMessages((prev) =>
      prev.map((m) =>
        m.id === editingId ? { ...m, content, editedAt: new Date().toISOString() } : m
      )
    );
    setEditingId(null);
    setEditDraft("");
    toast.success("Message updated");
  };

  const deleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    setDeleteId(null);
    toast.success("Message deleted");
  };


  const lastMessageFor = (groupId: string) =>
    messages
      .filter((m) => m.groupId === groupId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [groupMessages.length, activeGroup?.id]);

  const handleFiles = async (files: FileList | null, kind: "image" | "file") => {
    if (!files?.length) return;
    const next: MessageAttachment[] = [];
    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_BYTES) {
        toast.error(`${file.name} is larger than 4 MB`);
        continue;
      }
      next.push({
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: await readFile(file),
        kind: file.type.startsWith("image/") ? "image" : kind,
      });
    }
    if (next.length) setPending((p) => [...p, ...next]);
  };

  const sendMessage = () => {
    if (!activeGroup) return;
    if (!draft.trim() && pending.length === 0) return;
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      groupId: activeGroup.id,
      authorId: currentUser?.id ?? "me",
      authorName,
      authorInitials: getInitials(authorName),
      content: draft.trim(),
      attachments: pending,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, message]);
    setDraft("");
    setPending([]);
  };

  const createGroup = () => {
    if (!newName.trim()) {
      toast.error("Give the group a name");
      return;
    }
    const group: MessageGroup = {
      id: `grp-${Date.now()}`,
      name: newName.trim(),
      description: newDescription.trim() || undefined,
      memberIds: newMembers,
      createdAt: new Date().toISOString(),
      createdBy: authorName,
      kind: "group",
    };
    setGroups((prev) => [group, ...prev]);
    setTab("group");
    setActiveGroupId(group.id);
    setCreateOpen(false);
    setNewName("");
    setNewDescription("");
    setNewMembers([]);
    setMemberSearch("");
    toast.success(`"${group.name}" created`);
  };

  const filteredStaff = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    if (!q) return mockStaffMembers;
    return mockStaffMembers.filter((s) =>
      `${s.firstName} ${s.lastName} ${s.role}`.toLowerCase().includes(q)
    );
  }, [memberSearch]);

  const directStaff = useMemo(() => {
    const q = directSearch.trim().toLowerCase();
    return mockStaffMembers
      .filter((s) => s.id !== myId)
      .filter((s) => !q || `${s.firstName} ${s.lastName} ${s.role}`.toLowerCase().includes(q));
  }, [directSearch, myId]);

  const headerActions = (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" onClick={() => setDirectOpen(true)}>
        <UserIcon className="w-4 h-4 mr-1.5" />
        New chat
      </Button>
      <Button size="sm" onClick={() => setCreateOpen(true)}>
        <Plus className="w-4 h-4 mr-1.5" />
        New group
      </Button>
    </div>
  );


  const renderAttachment = (att: MessageAttachment, mine: boolean) =>
    att.kind === "image" ? (
      <button
        key={att.id}
        type="button"
        onClick={() => setPreview(att)}
        className="block rounded-lg overflow-hidden border border-border/50"
      >
        <img src={att.dataUrl} alt={att.name} className="max-h-48 object-cover" />
      </button>
    ) : (
      <a
        key={att.id}
        href={att.dataUrl}
        download={att.name}
        className={cn(
          "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors",
          mine
            ? "border-primary-foreground/25 hover:bg-primary-foreground/10"
            : "border-border hover:bg-muted/60"
        )}
      >
        <FileText className="w-4 h-4 shrink-0" />
        <span className="truncate max-w-[180px] font-medium">{att.name}</span>
        <span className="opacity-70">{formatSize(att.size)}</span>
        <Download className="w-3.5 h-3.5 shrink-0 opacity-70" />
      </a>
    );

  let lastDay = "";

  return (
    <Layout>
      <MobileHeader title="Messaging" subtitle="Group chat for your team" />
      <PageHeader
        title="Messaging"
        subtitle="Team groups for quick chat, documents and photos"
        icon={MessagesSquare}
        actions={headerActions}
      />

      <div className="mx-auto w-full max-w-4xl px-4 md:px-8 py-4 md:py-6 space-y-4">
        <PageIntro
          highlight="Stop chasing answers across texts and sticky notes."
          description="Create a group for any team, shift or project, then share messages, documents and photos in one searchable thread everyone can see."
        />

        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4">
          {/* Conversations list */}
          <Card className={cn("overflow-hidden", mobileChatOpen && "hidden md:block")}>
            <CardContent className="p-3 space-y-3">
              <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-muted">
                {(["group", "direct"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      "rounded-lg py-1.5 text-[12px] font-medium transition-colors",
                      tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                    )}
                  >
                    {t === "group" ? "Groups" : "Direct"}
                  </button>
                ))}
              </div>
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder={tab === "group" ? "Search groups" : "Search chats"}
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full md:hidden"
                onClick={() => (tab === "group" ? setCreateOpen(true) : setDirectOpen(true))}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                {tab === "group" ? "New group" : "New chat"}
              </Button>
              <div className="space-y-1 max-h-[420px] overflow-y-auto">
                {filteredGroups.map((g) => {
                  const last = lastMessageFor(g.id);
                  const active = g.id === activeGroup?.id;
                  const isDirect = (g.kind ?? "group") === "direct";
                  return (
                    <button
                      key={g.id}
                      onClick={() => {
                        setActiveGroupId(g.id);
                        setMobileChatOpen(true);
                      }}
                      className={cn(
                        "w-full text-left rounded-lg px-3 py-2.5 transition-colors",
                        active ? "bg-primary/[0.08] border border-primary/25" : "hover:bg-muted/60 border border-transparent"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-semibold truncate">{g.name}</span>
                        <Badge variant="outline" className="gap-1 text-[10px] px-1.5 py-0 shrink-0">
                          {isDirect ? <UserIcon className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                          {isDirect ? (g.memberIds.length > 2 ? g.memberIds.length : "1:1") : g.memberIds.length}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {last
                          ? `${last.authorName.split(" ")[0]}: ${last.content || "Shared an attachment"}`
                          : g.description ?? "No messages yet"}
                      </p>
                    </button>
                  );
                })}
                {filteredGroups.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    {tab === "group" ? "No groups found" : "No direct chats yet"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>


          {/* Conversation */}
          <Card className={cn("flex flex-col overflow-hidden", !mobileChatOpen && "hidden md:flex")}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8"
                onClick={() => setMobileChatOpen(false)}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{activeGroup?.name ?? "No conversation"}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {activeGroup
                    ? (activeGroup.kind ?? "group") === "direct"
                      ? activeGroup.memberIds.length > 2
                        ? `Direct chat · ${activeGroup.memberIds.length} people`
                        : "Direct message"
                      : `${activeGroup.memberIds.length} members`
                    : "Start a chat or create a group"}
                </p>
              </div>
            </div>

            <ScrollArea className="h-[420px]">
              <div className="p-4 space-y-3">
                {groupMessages.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-12">
                    No messages yet — say hello.
                  </p>
                )}
                {groupMessages.map((m) => {
                  const mine = m.authorId === myId;
                  const label = dayLabel(m.createdAt);
                  const showDay = label !== lastDay;
                  lastDay = label;
                  const isEditing = editingId === m.id;
                  return (
                    <div key={m.id} className="space-y-3">
                      {showDay && (
                        <div className="flex items-center justify-center">
                          <span className="text-[10px] uppercase tracking-wide text-muted-foreground bg-muted rounded-lg px-2 py-1">
                            {label}
                          </span>
                        </div>
                      )}
                      <div className={cn("flex gap-2", mine && "flex-row-reverse")}>
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-semibold">
                            {m.authorInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn("max-w-[80%] space-y-1", mine && "items-end flex flex-col")}>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span className="font-medium text-foreground">{mine ? "You" : m.authorName}</span>
                            <span>{format(new Date(m.createdAt), "h:mm a")}</span>
                            {m.editedAt && <span className="italic">edited</span>}
                          </div>
                          {isEditing ? (
                            <div className="w-full min-w-[220px] space-y-2">
                              <Textarea
                                value={editDraft}
                                onChange={(e) => setEditDraft(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    saveEdit();
                                  }
                                  if (e.key === "Escape") setEditingId(null);
                                }}
                                autoFocus
                                className="min-h-[60px] resize-none text-[13px]"
                              />
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                                  Cancel
                                </Button>
                                <Button size="sm" onClick={saveEdit}>
                                  <Check className="w-3.5 h-3.5 mr-1" />
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {m.content && (
                                <div
                                  className={cn(
                                    "rounded-lg px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap",
                                    mine ? "bg-primary text-primary-foreground" : "bg-muted"
                                  )}
                                >
                                  {m.content}
                                </div>
                              )}
                              {m.attachments.length > 0 && (
                                <div className={cn("flex flex-wrap gap-2", mine && "justify-end")}>
                                  {m.attachments.map((a) => renderAttachment(a, mine))}
                                </div>
                              )}
                              {mine && (
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    title="Edit message"
                                    onClick={() => {
                                      setEditingId(m.id);
                                      setEditDraft(m.content);
                                    }}
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-destructive hover:text-destructive"
                                    title="Delete message"
                                    onClick={() => setDeleteId(m.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            {/* Composer */}
            <div className="border-t border-border p-3 space-y-2">
              {pending.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {pending.map((a) => (
                    <div
                      key={a.id}
                      className="relative flex items-center gap-2 rounded-lg border border-border px-2 py-1.5 text-[11px]"
                    >
                      {a.kind === "image" ? (
                        <img src={a.dataUrl} alt={a.name} className="w-8 h-8 rounded object-cover" />
                      ) : (
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="truncate max-w-[140px]">{a.name}</span>
                      <button
                        onClick={() => setPending((p) => p.filter((x) => x.id !== a.id))}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-end gap-2">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={activeGroup ? `Message ${activeGroup.name}` : "Create a group first"}
                  disabled={!activeGroup}
                  className="min-h-[44px] max-h-32 resize-none text-[13px]"
                />
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    disabled={!activeGroup}
                    onClick={() => imageInputRef.current?.click()}
                    title="Share a picture"
                  >
                    <ImagePlus className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    disabled={!activeGroup}
                    onClick={() => fileInputRef.current?.click()}
                    title="Share a document"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button size="icon" className="h-9 w-9" disabled={!activeGroup} onClick={sendMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => {
                  handleFiles(e.target.files, "image");
                  e.target.value = "";
                }}
              />
              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                onChange={(e) => {
                  handleFiles(e.target.files, "file");
                  e.target.value = "";
                }}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Create group */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New group</DialogTitle>
            <DialogDescription>Name the group and choose who should be in it.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Group name (e.g. Front Desk)"
            />
            <Input
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Description (optional)"
            />
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Members {newMembers.length > 0 && `(${newMembers.length} selected)`}
              </p>
              <SearchInput value={memberSearch} onChange={setMemberSearch} placeholder="Search team" />
              <div className="max-h-52 overflow-y-auto space-y-1 rounded-lg border border-border p-2">
                {filteredStaff.map((s) => {
                  const checked = newMembers.includes(s.id);
                  return (
                    <label
                      key={s.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/60 cursor-pointer"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) =>
                          setNewMembers((prev) =>
                            v ? [...prev, s.id] : prev.filter((id) => id !== s.id)
                          )
                        }
                      />
                      <span className="text-[13px] font-medium">
                        {s.firstName} {s.lastName}
                      </span>
                      <span className="text-[11px] text-muted-foreground ml-auto">{s.role}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createGroup}>Create group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New direct chat */}
      <Dialog
        open={directOpen}
        onOpenChange={(o) => {
          setDirectOpen(o);
          if (!o) {
            setDirectSelected([]);
            setDirectSearch("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New chat</DialogTitle>
            <DialogDescription>
              Select one person for a private chat, or several people to message them together.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                Recipients {directSelected.length > 0 && `(${directSelected.length} selected)`}
              </p>
            </div>
            <SearchInput value={directSearch} onChange={setDirectSearch} placeholder="Search team" />
            <div className="max-h-72 overflow-y-auto space-y-1 rounded-lg border border-border p-2">
              {directStaff.map((s) => {
                const checked = directSelected.includes(s.id);
                return (
                  <label
                    key={s.id}
                    className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-muted/60 cursor-pointer"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) =>
                        setDirectSelected((prev) =>
                          v ? [...prev, s.id] : prev.filter((id) => id !== s.id)
                        )
                      }
                    />
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                        {getInitials(`${s.firstName} ${s.lastName}`)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[13px] font-medium">
                      {s.firstName} {s.lastName}
                    </span>
                    <span className="text-[11px] text-muted-foreground ml-auto">{s.role}</span>
                  </label>
                );
              })}
              {directStaff.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">No team members found</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDirectOpen(false)}>
              Cancel
            </Button>
            <Button onClick={startDirectChat} disabled={directSelected.length === 0}>
              <Send className="w-4 h-4 mr-1.5" />
              Start chat{directSelected.length > 1 ? ` (${directSelected.length})` : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete message */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete message</AlertDialogTitle>
            <AlertDialogDescription>
              This message will be removed from the conversation. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMessage(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>



      {/* Image preview */}
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-sm">{preview?.name}</DialogTitle>
          </DialogHeader>
          {preview && (
            <img src={preview.dataUrl} alt={preview.name} className="w-full rounded-lg object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Messaging;
