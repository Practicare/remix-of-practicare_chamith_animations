import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, X, FileText, Check, ArrowLeft, ArrowRight, Tag as TagIcon, ListChecks, BookOpen, FolderOpen } from "lucide-react";
import { documentLibraryStore } from "@/data/documentLibraryStore";
import { knowledgeBaseStore } from "@/data/knowledgeBaseStore";
import { DocumentFolder, DocumentFile } from "@/types/documentLibrary";
import { Task } from "@/types/tasks";
import { mockTasks } from "@/data/mockTasks";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders: DocumentFolder[];
  defaultFolderId?: string;
  onCreateTask?: (task: Task) => void;
}

interface StagedFile {
  file: File;
  id: string;
}

export function DocumentUploadWizard({ open, onOpenChange, folders, defaultFolderId, onCreateTask }: Props) {
  const { currentUser } = useUser();
  const [step, setStep] = useState<1 | 2>(1);
  const [staged, setStaged] = useState<StagedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [folderId, setFolderId] = useState<string>(defaultFolderId || folders[0]?.id || "");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [shareToKnowledge, setShareToKnowledge] = useState(false);
  const [attachTask, setAttachTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep(1);
    setStaged([]);
    setDescription("");
    setTagInput("");
    setTags([]);
    setShareToKnowledge(false);
    setAttachTask(false);
    setTaskTitle("");
    setTaskAssignee("");
    setTaskDueDate("");
    setFolderId(defaultFolderId || folders[0]?.id || "");
  };

  const close = (o: boolean) => {
    onOpenChange(o);
    if (!o) setTimeout(reset, 200);
  };

  const addFiles = (fileList: FileList | File[]) => {
    const arr = Array.from(fileList);
    const accepted: StagedFile[] = [];
    for (const f of arr) {
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name} exceeds 20MB`);
        continue;
      }
      accepted.push({ file: f, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` });
    }
    setStaged((prev) => [...prev, ...accepted]);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeStaged = (id: string) => setStaged((prev) => prev.filter((s) => s.id !== id));

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (!tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  const handleFinish = async () => {
    if (!folderId) { toast.error("Choose a folder"); return; }
    if (staged.length === 0) { toast.error("Add at least one file"); return; }
    setSaving(true);
    try {
      let createdTask: Task | undefined;
      if (attachTask && taskTitle.trim()) {
        createdTask = {
          id: `task-${Date.now()}`,
          title: taskTitle.trim(),
          assignee: taskAssignee || "Unassigned",
          dueDate: taskDueDate ? new Date(taskDueDate) : new Date(),
          completed: false,
          createdAt: new Date(),
        };
        onCreateTask?.(createdTask);
      }

      const uploadedBy = currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : "Practice Manager";

      for (const s of staged) {
        const dataUrl = await readFileAsDataUrl(s.file);
        const docId = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        let knowledgeDocId: string | undefined;
        if (shareToKnowledge) {
          knowledgeDocId = `kb-${docId}`;
          knowledgeBaseStore.add({
            id: knowledgeDocId,
            name: s.file.name,
            type: s.file.type || "application/octet-stream",
            size: s.file.size,
            dataUrl,
            tags,
            description,
            uploadedAt: new Date().toISOString(),
            uploadedBy,
          });
        }
        const file: DocumentFile = {
          id: docId,
          folderId,
          name: s.file.name,
          type: s.file.type || "application/octet-stream",
          size: s.file.size,
          dataUrl,
          tags,
          description: description || undefined,
          taskId: createdTask?.id,
          taskTitle: createdTask?.title,
          shareToKnowledge,
          knowledgeDocId,
          uploadedAt: new Date().toISOString(),
          uploadedBy,
        };
        documentLibraryStore.addFile(file);
      }
      toast.success(staged.length === 1 ? "Document uploaded" : `${staged.length} documents uploaded`);
      close(false);
    } catch {
      toast.error("Upload failed");
    } finally {
      setSaving(false);
    }
  };

  const canProceed = staged.length > 0;

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>
            Step {step} of 2 — {step === 1 ? "Choose files" : "Details & options"}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"
              }`}
            >
              <UploadCloud className="w-10 h-10 mx-auto text-primary mb-3" />
              <p className="text-sm font-medium">Drag & drop files here</p>
              <p className="text-xs text-muted-foreground mt-1">or click to browse — up to 20MB per file</p>
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleInput} />
            </div>

            {staged.length > 0 && (
              <div className="border border-border rounded-lg divide-y max-h-56 overflow-y-auto">
                {staged.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 p-2.5">
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{s.file.name}</p>
                      <p className="text-[11px] text-muted-foreground">{(s.file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeStaged(s.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><FolderOpen className="w-3.5 h-3.5" />Folder</Label>
              <Select value={folderId} onValueChange={setFolderId}>
                <SelectTrigger><SelectValue placeholder="Choose folder" /></SelectTrigger>
                <SelectContent>
                  {folders.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Brief description shared across all uploaded files" />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><TagIcon className="w-3.5 h-3.5" />Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  placeholder="Add tag and press Enter"
                />
                <Button type="button" variant="outline" onClick={addTag}>Add</Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((t) => (
                    <Badge key={t} variant="secondary" className="gap-1">
                      {t}
                      <button onClick={() => setTags(tags.filter((x) => x !== t))}><X className="w-3 h-3" /></button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-border p-3 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" />Share to Staff Resource Centre</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Also add to the knowledge base for staff.</p>
                </div>
                <Switch checked={shareToKnowledge} onCheckedChange={setShareToKnowledge} />
              </div>
            </div>

            <div className="rounded-lg border border-border p-3 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium flex items-center gap-1.5"><ListChecks className="w-3.5 h-3.5" />Attach a task</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Create a follow-up task linked to these documents.</p>
                </div>
                <Switch checked={attachTask} onCheckedChange={setAttachTask} />
              </div>
              {attachTask && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs">Task title</Label>
                    <Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="e.g. Review new policy" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Assignee</Label>
                    <Input value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)} placeholder="Staff member" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Due date</Label>
                    <Input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Button variant="ghost" onClick={() => close(false)}>Cancel</Button>
          <div className="flex gap-2">
            {step === 2 && (
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4" />Back
              </Button>
            )}
            {step === 1 && (
              <Button onClick={() => setStep(2)} disabled={!canProceed}>
                Next<ArrowRight className="w-4 h-4" />
              </Button>
            )}
            {step === 2 && (
              <Button onClick={handleFinish} disabled={saving}>
                <Check className="w-4 h-4" />{saving ? "Uploading..." : "Finish upload"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
