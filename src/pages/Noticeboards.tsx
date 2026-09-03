import { useState, useMemo, useEffect, useRef } from "react";
import { ComponentType, ReactNode } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageIntro } from "@/components/layout/PageIntro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Monitor,
  Plus,
  Copy,
  RefreshCw,
  Trash2,
  Tv,
  Users,
  DoorOpen,
  KeyRound,
  Megaphone,
  Newspaper,
  Pencil,
  ImagePlus,
  X,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  ListTodo,
  CalendarClock,
  Image as ImageIcon,
  Type,
  BarChart3,
  Send,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Noticeboard,
  Notice,
  NoticeboardLocation,
  NOTICEBOARD_LOCATION_LABELS,
  NoticeboardContainer,
  ContainerType,
  CONTAINER_TYPE_LABELS,
} from "@/types/noticeboards";
import { mockNoticeboards } from "@/data/mockNoticeboards";
import { mockMemos } from "@/data/mockMemos";
import { mockDepartments } from "@/data/mockDepartments";


const locationIcon: Record<NoticeboardLocation, typeof Tv> = {
  reception: DoorOpen,
  waiting_room: Tv,
  staff_room: Users,
  other: Monitor,
};

const generatePairingCode = () =>
  Math.random().toString(36).slice(2, 6).toUpperCase() +
  "-" +
  Math.random().toString(36).slice(2, 6).toUpperCase();

const Noticeboards = ({
  Layout = AdminLayout,
}: {
  Layout?: ComponentType<{ children: ReactNode }>;
}) => {
  const [boards, setBoards] = useState<Noticeboard[]>(mockNoticeboards);
  const [createOpen, setCreateOpen] = useState(false);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [previewBoardId, setPreviewBoardId] = useState<string | null>(null);

  const previewBoard = useMemo(
    () => boards.find((b) => b.id === previewBoardId) || null,
    [boards, previewBoardId]
  );

  // create form state
  const [newName, setNewName] = useState("");
  const [newLocation, setNewLocation] = useState<NoticeboardLocation>("reception");
  const [newDepartmentId, setNewDepartmentId] = useState<string>("none");

  const activeBoard = useMemo(
    () => boards.find((b) => b.id === activeBoardId) || null,
    [boards, activeBoardId]
  );

  const handleCreate = () => {
    if (!newName.trim()) {
      toast.error("Please enter a noticeboard name");
      return;
    }
    const nb: Noticeboard = {
      id: `nb-${Date.now()}`,
      name: newName.trim(),
      location: newLocation,
      departmentId: newDepartmentId === "none" ? undefined : newDepartmentId,
      pairingCode: generatePairingCode(),
      paired: false,
      published: false,
      notices: [],
      linkedMemoIds: [],
      containers: [],
      createdAt: new Date(),
    };
    setBoards((prev) => [nb, ...prev]);
    setNewName("");
    setNewLocation("reception");
    setNewDepartmentId("none");
    setCreateOpen(false);
    toast.success("Noticeboard created");
  };


  const updateBoard = (id: string, patch: Partial<Noticeboard>) => {
    setBoards((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const deleteBoard = (id: string) => {
    setBoards((prev) => prev.filter((b) => b.id !== id));
    setActiveBoardId(null);
    toast.success("Noticeboard deleted");
  };

  return (
    <Layout>
      <MobileHeader title="Noticeboards" />
      <PageHeader
        title="Noticeboards"
        subtitle="Manage digital displays for reception, waiting room and staff areas"
        icon={Monitor}
        actions={
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Noticeboard
          </Button>
        }
      />

      <div className="max-w-4xl mx-auto px-8 py-6 space-y-6">
        <PageIntro
          highlight="A living dashboard for every room in your practice."
          description="Design department noticeboards mixing news, memos, completion stats and expiries — publish once and let screens keep the whole team informed."
        />
        {/* Mobile create button */}
        <div className="md:hidden mb-4">
          <Button onClick={() => setCreateOpen(true)} className="gap-2 w-full">
            <Plus className="w-4 h-4" />
            New Noticeboard
          </Button>
        </div>

        {boards.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-lg">
            <Monitor className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No noticeboards yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board) => {
              const Icon = locationIcon[board.location];
              const memoCount =
                board.location === "waiting_room" ? 0 : board.linkedMemoIds.length;
              return (
                <div
                  key={board.id}
                  onClick={() => setActiveBoardId(board.id)}
                  className="group relative text-left bg-card border border-border rounded-lg p-4 hover:border-primary hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        variant={board.paired ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {board.paired ? "Paired" : "Unpaired"}
                      </Badge>
                      {board.published && (
                        <Badge className="text-[10px] bg-success/15 text-success hover:bg-success/15 gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Published
                        </Badge>
                      )}
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm leading-tight mb-1 truncate">
                    {board.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    {NOTICEBOARD_LOCATION_LABELS[board.location]}
                    {board.departmentId && (
                      <> · {mockDepartments.find((d) => d.id === board.departmentId)?.name}</>
                    )}
                  </p>

                  <div className="flex items-center gap-1.5 mb-3 px-2 py-1.5 bg-muted rounded-md">
                    <KeyRound className="w-3 h-3 text-muted-foreground" />
                    <code className="text-[11px] font-mono tracking-wider">
                      {board.pairingCode}
                    </code>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Megaphone className="w-3 h-3" />
                        {board.notices.length} notices
                      </span>
                      {board.location !== "waiting_room" && (
                        <span className="flex items-center gap-1">
                          <Newspaper className="w-3 h-3" />
                          {memoCount} memos
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 gap-1 text-primary hover:text-primary"
                      disabled={board.notices.length === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewBoardId(board.id);
                      }}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Play
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Noticeboard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="nb-name">Name</Label>
              <Input
                id="nb-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Reception Display"
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Select
                value={newLocation}
                onValueChange={(v) => setNewLocation(v as NoticeboardLocation)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(NOTICEBOARD_LOCATION_LABELS).map(([k, label]) => (
                    <SelectItem key={k} value={k}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newLocation === "waiting_room" && (
                <p className="text-[11px] text-muted-foreground">
                  Waiting room boards show patient-facing notices only — memos &
                  news cannot be linked.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Department (optional)</Label>
              <Select value={newDepartmentId} onValueChange={setNewDepartmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="No department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No department</SelectItem>
                  {mockDepartments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Noticeboard Dialog */}
      {activeBoard && (
        <BoardDetailDialog
          board={activeBoard}
          onClose={() => setActiveBoardId(null)}
          onUpdate={(patch) => updateBoard(activeBoard.id, patch)}
          onDelete={() => deleteBoard(activeBoard.id)}
          onPlay={() => setPreviewBoardId(activeBoard.id)}
        />
      )}

      {/* Slideshow Dialog */}
      {previewBoard && (
        <SlideshowDialog
          board={previewBoard}
          onClose={() => setPreviewBoardId(null)}
        />
      )}
    </Layout>
  );
};

interface BoardDetailDialogProps {
  board: Noticeboard;
  onClose: () => void;
  onUpdate: (patch: Partial<Noticeboard>) => void;
  onDelete: () => void;
  onPlay: () => void;
}

function BoardDetailDialog({
  board,
  onClose,
  onUpdate,
  onDelete,
  onPlay,
}: BoardDetailDialogProps) {
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeBody, setNoticeBody] = useState("");
  const [noticeDuration, setNoticeDuration] = useState(10);
  const [noticeImage, setNoticeImage] = useState<string | undefined>(undefined);

  const allowMemos = board.location !== "waiting_room";

  const handleImagePick = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setNoticeImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAddNotice = () => {
    if (!noticeTitle.trim()) {
      toast.error("Notice title required");
      return;
    }
    const notice: Notice = {
      id: `n-${Date.now()}`,
      title: noticeTitle.trim(),
      body: noticeBody.trim(),
      imageUrl: noticeImage,
      durationSeconds: noticeDuration,
      createdAt: new Date(),
    };
    onUpdate({ notices: [notice, ...board.notices] });
    setNoticeTitle("");
    setNoticeBody("");
    setNoticeImage(undefined);
    setNoticeDuration(10);
    toast.success("Notice added");
  };

  const removeNotice = (id: string) => {
    onUpdate({ notices: board.notices.filter((n) => n.id !== id) });
  };

  const toggleMemo = (memoId: string, checked: boolean) => {
    const next = checked
      ? [...board.linkedMemoIds, memoId]
      : board.linkedMemoIds.filter((id) => id !== memoId);
    onUpdate({ linkedMemoIds: next });
  };

  const regeneratePairing = () => {
    onUpdate({ pairingCode: generatePairingCodeLocal(), paired: false });
    toast.success("New pairing code generated");
  };

  const copyCode = () => {
    navigator.clipboard.writeText(board.pairingCode);
    toast.success("Pairing code copied");
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-primary" />
            {board.name}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            {NOTICEBOARD_LOCATION_LABELS[board.location]}
          </p>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Pairing */}
          <section className="bg-muted/40 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Pairing Code
              </Label>
              <Badge variant={board.paired ? "default" : "secondary"}>
                {board.paired ? "Paired" : "Unpaired"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-background border border-border rounded-md font-mono text-base tracking-widest text-center">
                {board.pairingCode}
              </code>
              <Button variant="outline" size="icon" onClick={copyCode}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={regeneratePairing}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Enter this code on the Practicare display device to pair it with
              this noticeboard.
            </p>
          </section>

          {/* Notices */}
          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-primary" />
              Notices ({board.notices.length})
            </h3>

            <div className="space-y-2 mb-4">
              {board.notices.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
                  No notices yet
                </p>
              )}
              {board.notices.map((n) => (
                <div
                  key={n.id}
                  className="flex items-start gap-3 p-3 bg-card border border-border rounded-lg"
                >
                  {n.imageUrl && (
                    <img
                      src={n.imageUrl}
                      alt={n.title}
                      className="w-16 h-16 rounded-md object-cover shrink-0 border border-border"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{n.title}</p>
                    {n.body && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {n.body}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Display {n.durationSeconds}s
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeNotice(n.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2 p-3 border border-border rounded-lg">
              <Input
                placeholder="Notice title"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
              />
              <Textarea
                placeholder="Notice content (optional)"
                value={noticeBody}
                onChange={(e) => setNoticeBody(e.target.value)}
                rows={2}
              />

              {/* Image picker */}
              {noticeImage ? (
                <div className="relative w-full">
                  <img
                    src={noticeImage}
                    alt="Notice preview"
                    className="w-full max-h-40 object-cover rounded-md border border-border"
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={() => setNoticeImage(undefined)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-border rounded-md text-xs text-muted-foreground cursor-pointer hover:border-primary hover:text-foreground transition-colors">
                  <ImagePlus className="w-4 h-4" />
                  Add picture (optional)
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImagePick(e.target.files?.[0])}
                  />
                </label>
              )}
              <div className="flex items-center gap-2">
                <Label className="text-xs whitespace-nowrap">Duration (s)</Label>
                <Input
                  type="number"
                  min={3}
                  max={120}
                  value={noticeDuration}
                  onChange={(e) => setNoticeDuration(parseInt(e.target.value) || 10)}
                  className="w-24"
                />
                <Button onClick={handleAddNotice} className="ml-auto gap-2" size="sm">
                  <Plus className="w-4 h-4" />
                  Add Notice
                </Button>
              </div>
            </div>
          </section>

          {/* Memos & News */}
          {allowMemos ? (
            <section>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-primary" />
                Memos & News on this board
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {mockMemos.map((memo) => {
                  const checked = board.linkedMemoIds.includes(memo.id);
                  return (
                    <label
                      key={memo.id}
                      className="flex items-start gap-3 p-3 bg-card border border-border rounded-lg cursor-pointer hover:border-primary/50"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(c) => toggleMemo(memo.id, c === true)}
                        className="mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{memo.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {memo.content}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>
          ) : (
            <section className="p-4 bg-muted/40 rounded-lg text-xs text-muted-foreground">
              Memos & news are not displayed on waiting room noticeboards
              (patient-facing).
            </section>
          )}

          {/* Containers */}
          <ContainersSection
            containers={board.containers ?? []}
            onChange={(next) => onUpdate({ containers: next })}
          />
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button variant="ghost" onClick={onDelete} className="text-destructive gap-2">
            <Trash2 className="w-4 h-4" />
            Delete board
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onPlay}
              disabled={
                board.notices.length === 0 && (board.containers?.length ?? 0) === 0
              }
              className="gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              Play
            </Button>
            <Button
              onClick={() => {
                onUpdate({ published: true, publishedAt: new Date() });
                toast.success("Noticeboard published");
              }}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              {board.published ? "Republish" : "Publish"}
            </Button>
          </div>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Containers Section
// ============================================================================

const CONTAINER_ICONS: Record<ContainerType, typeof Tv> = {
  checklist_completion: CheckSquare,
  task_completion: ListTodo,
  expiry_centre: CalendarClock,
  picture_text: ImageIcon,
  text_box: Type,
  statistics: BarChart3,
};

const NEW_CONTAINER_TYPES: ContainerType[] = [
  "checklist_completion",
  "task_completion",
  "expiry_centre",
  "picture_text",
  "text_box",
  "statistics",
];

function makeContainer(type: ContainerType): NoticeboardContainer {
  const base = { id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, durationSeconds: 10 };
  switch (type) {
    case "picture_text":
      return { ...base, type, headline: "", paragraph: "", imageUrl: undefined };
    case "text_box":
      return { ...base, type, header: "", paragraph: "" };
    case "statistics":
      return {
        ...base,
        type,
        header: "",
        items: [
          { label: "", value: "" },
          { label: "", value: "" },
          { label: "", value: "" },
        ],
      };
    default:
      return { ...base, type } as NoticeboardContainer;
  }
}

interface ContainersSectionProps {
  containers: NoticeboardContainer[];
  onChange: (next: NoticeboardContainer[]) => void;
}

function ContainersSection({ containers, onChange }: ContainersSectionProps) {
  const add = (type: ContainerType) => {
    onChange([...containers, makeContainer(type)]);
  };
  const update = (id: string, patch: Partial<NoticeboardContainer>) => {
    onChange(containers.map((c) => (c.id === id ? ({ ...c, ...patch } as NoticeboardContainer) : c)));
  };
  const remove = (id: string) => onChange(containers.filter((c) => c.id !== id));

  return (
    <section>
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-primary" />
        Containers ({containers.length})
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        {NEW_CONTAINER_TYPES.map((t) => {
          const Icon = CONTAINER_ICONS[t];
          return (
            <button
              key={t}
              onClick={() => add(t)}
              className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg text-xs hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <Icon className="w-4 h-4 text-primary" />
              <span className="text-left">{CONTAINER_TYPE_LABELS[t]}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        {containers.map((c) => (
          <ContainerEditor
            key={c.id}
            container={c}
            onChange={(patch) => update(c.id, patch)}
            onRemove={() => remove(c.id)}
          />
        ))}
      </div>
    </section>
  );
}

function ContainerEditor({
  container,
  onChange,
  onRemove,
}: {
  container: NoticeboardContainer;
  onChange: (patch: Partial<NoticeboardContainer>) => void;
  onRemove: () => void;
}) {
  const Icon = CONTAINER_ICONS[container.type];
  const handleImage = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => onChange({ imageUrl: reader.result as string } as Partial<NoticeboardContainer>);
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-3 bg-card border border-border rounded-lg space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icon className="w-4 h-4 text-primary" />
          {CONTAINER_TYPE_LABELS[container.type]}
        </div>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min={3}
            max={120}
            value={container.durationSeconds}
            onChange={(e) => onChange({ durationSeconds: parseInt(e.target.value) || 10 })}
            className="w-16 h-7 text-xs"
          />
          <span className="text-[10px] text-muted-foreground">s</span>
          <Button variant="ghost" size="icon" onClick={onRemove} className="h-7 w-7">
            <Trash2 className="w-3.5 h-3.5 text-destructive" />
          </Button>
        </div>
      </div>

      {container.type === "picture_text" && (
        <div className="space-y-2">
          {container.imageUrl ? (
            <div className="relative">
              <img src={container.imageUrl} alt="" className="w-full max-h-32 object-cover rounded-md border border-border" />
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6"
                onClick={() => onChange({ imageUrl: undefined } as Partial<NoticeboardContainer>)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-border rounded-md text-xs text-muted-foreground cursor-pointer hover:border-primary">
              <ImagePlus className="w-4 h-4" />
              Upload picture
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImage(e.target.files?.[0])} />
            </label>
          )}
          <Input
            placeholder="Headline"
            value={container.headline}
            onChange={(e) => onChange({ headline: e.target.value } as Partial<NoticeboardContainer>)}
          />
          <div>
            <Textarea
              placeholder="Paragraph (max 50 chars)"
              value={container.paragraph}
              maxLength={50}
              onChange={(e) => onChange({ paragraph: e.target.value.slice(0, 50) } as Partial<NoticeboardContainer>)}
              rows={2}
            />
            <p className="text-[10px] text-muted-foreground text-right mt-0.5">{container.paragraph.length}/50</p>
          </div>
        </div>
      )}

      {container.type === "text_box" && (
        <div className="space-y-2">
          <Input
            placeholder="Header"
            value={container.header}
            onChange={(e) => onChange({ header: e.target.value } as Partial<NoticeboardContainer>)}
          />
          <div>
            <Textarea
              placeholder="Paragraph (max 50 chars)"
              value={container.paragraph}
              maxLength={50}
              onChange={(e) => onChange({ paragraph: e.target.value.slice(0, 50) } as Partial<NoticeboardContainer>)}
              rows={2}
            />
            <p className="text-[10px] text-muted-foreground text-right mt-0.5">{container.paragraph.length}/50</p>
          </div>
        </div>
      )}

      {container.type === "statistics" && (
        <div className="space-y-2">
          <Input
            placeholder="Header"
            value={container.header}
            onChange={(e) => onChange({ header: e.target.value } as Partial<NoticeboardContainer>)}
          />
          {container.items.map((item, i) => (
            <div key={i} className="grid grid-cols-2 gap-2">
              <Input
                placeholder={`Item ${i + 1} label`}
                value={item.label}
                onChange={(e) => {
                  const next = [...container.items];
                  next[i] = { ...next[i], label: e.target.value };
                  onChange({ items: next } as Partial<NoticeboardContainer>);
                }}
              />
              <Input
                placeholder="Number"
                value={item.value}
                onChange={(e) => {
                  const next = [...container.items];
                  next[i] = { ...next[i], value: e.target.value };
                  onChange({ items: next } as Partial<NoticeboardContainer>);
                }}
              />
            </div>
          ))}
        </div>
      )}

      {(container.type === "checklist_completion" ||
        container.type === "task_completion" ||
        container.type === "expiry_centre") && (
        <p className="text-[11px] text-muted-foreground">
          Live data from the {CONTAINER_TYPE_LABELS[container.type].toLowerCase()} module will be displayed on this slide.
        </p>
      )}
    </div>
  );
}

const generatePairingCodeLocal = () =>
  Math.random().toString(36).slice(2, 6).toUpperCase() +
  "-" +
  Math.random().toString(36).slice(2, 6).toUpperCase();


interface SlideshowDialogProps {
  board: Noticeboard;
  onClose: () => void;
}

type Slide =
  | { kind: "notice"; id: string; durationSeconds: number; data: Notice }
  | { kind: "container"; id: string; durationSeconds: number; data: NoticeboardContainer };

function buildSlides(board: Noticeboard): Slide[] {
  const noticeSlides: Slide[] = board.notices.map((n) => ({
    kind: "notice",
    id: n.id,
    durationSeconds: n.durationSeconds,
    data: n,
  }));
  const containerSlides: Slide[] = (board.containers ?? []).map((c) => ({
    kind: "container",
    id: c.id,
    durationSeconds: c.durationSeconds,
    data: c,
  }));
  return [...noticeSlides, ...containerSlides];
}

function ContainerSlide({ c }: { c: NoticeboardContainer }) {
  if (c.type === "picture_text") {
    return (
      <>
        {c.imageUrl && (
          <img src={c.imageUrl} alt="" className="max-h-[55%] max-w-full object-contain rounded-lg mb-8 shadow-2xl" />
        )}
        <h2 className="text-4xl md:text-5xl font-bold text-center tracking-tight mb-4">{c.headline || "Headline"}</h2>
        {c.paragraph && <p className="text-lg md:text-xl text-white/80 text-center max-w-3xl">{c.paragraph}</p>}
      </>
    );
  }
  if (c.type === "text_box") {
    return (
      <>
        <h2 className="text-4xl md:text-6xl font-bold text-center tracking-tight mb-6">{c.header || "Header"}</h2>
        {c.paragraph && <p className="text-xl md:text-2xl text-white/80 text-center max-w-3xl">{c.paragraph}</p>}
      </>
    );
  }
  if (c.type === "statistics") {
    return (
      <>
        <h2 className="text-3xl md:text-5xl font-bold text-center tracking-tight mb-10">{c.header || "Statistics"}</h2>
        <div className="grid grid-cols-3 gap-8 md:gap-16">
          {c.items.map((item, i) => (
            <div key={i} className="text-center">
              <p className="text-4xl md:text-6xl font-bold text-primary mb-2">{item.value || "—"}</p>
              <p className="text-sm md:text-base text-white/70 uppercase tracking-wide">{item.label || `Item ${i + 1}`}</p>
            </div>
          ))}
        </div>
      </>
    );
  }
  const label = CONTAINER_TYPE_LABELS[c.type];
  const Icon = CONTAINER_ICONS[c.type];
  return (
    <>
      <Icon className="w-16 h-16 text-primary mb-6" />
      <h2 className="text-3xl md:text-5xl font-bold text-center tracking-tight mb-3">{label}</h2>
      <p className="text-base md:text-lg text-white/60 text-center max-w-2xl">Live data preview</p>
    </>
  );
}

interface SlideshowDialogProps {
  board: Noticeboard;
  onClose: () => void;
}

function SlideshowDialog({ board, onClose }: SlideshowDialogProps) {
  const slides = useMemo(() => buildSlides(board), [board]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const startedAt = useRef<number>(Date.now());
  const accumulated = useRef<number>(0);

  const current = slides[index];
  const durationMs = (current?.durationSeconds || 10) * 1000;

  useEffect(() => {
    startedAt.current = Date.now();
    accumulated.current = 0;
    setProgress(0);
  }, [index]);

  useEffect(() => {
    if (!current || !playing || slides.length === 0) return;
    startedAt.current = Date.now();
    const id = setInterval(() => {
      const elapsed = accumulated.current + (Date.now() - startedAt.current);
      const p = Math.min(elapsed / durationMs, 1);
      setProgress(p);
      if (p >= 1) setIndex((i) => (i + 1) % slides.length);
    }, 100);
    return () => {
      accumulated.current = accumulated.current + (Date.now() - startedAt.current);
      clearInterval(id);
    };
  }, [playing, index, durationMs, slides.length, current]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (slides.length === 0) return;
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % slides.length);
      else if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + slides.length) % slides.length);
      else if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      } else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length, onClose]);

  if (!current) return null;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-black border-0">
        <div className="relative w-full aspect-video bg-black text-white">
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-20">
            <div
              className="h-full bg-primary transition-[width] duration-100 ease-linear"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <div
            key={current.id}
            className="absolute inset-0 flex flex-col items-center justify-center px-12 py-16 animate-fade-in"
          >
            {current.kind === "notice" ? (
              <>
                {current.data.imageUrl && (
                  <img
                    src={current.data.imageUrl}
                    alt=""
                    className="max-h-[55%] max-w-full object-contain rounded-lg mb-8 shadow-2xl"
                  />
                )}
                <h2 className="text-4xl md:text-5xl font-bold text-center tracking-tight mb-4">
                  {current.data.title}
                </h2>
                {current.data.body && (
                  <p className="text-lg md:text-xl text-white/80 text-center max-w-3xl">{current.data.body}</p>
                )}
              </>
            ) : (
              <ContainerSlide c={current.data} />
            )}
          </div>

          <div className="absolute top-4 left-4 text-xs text-white/60 font-mono z-20">
            {index + 1} / {slides.length}
          </div>
          <div className="absolute top-4 right-4 text-xs text-white/60 z-20">{board.name}</div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-2 rounded-lg z-20">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10 hover:text-white"
              onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10 hover:text-white"
              onClick={() => setPlaying((p) => !p)}>
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10 hover:text-white"
              onClick={() => setIndex((i) => (i + 1) % slides.length)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <span className="text-[11px] text-white/60 px-2 tabular-nums">{current.durationSeconds}s</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10 hover:text-white" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


export default Noticeboards;
