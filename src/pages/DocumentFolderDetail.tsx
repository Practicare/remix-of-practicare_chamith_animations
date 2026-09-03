import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { SearchInput } from "@/components/ui/SearchInput";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArrowLeft, Upload, FileText, FileImage, FileSpreadsheet, File as FileIcon, Eye, Download, Trash2, Pencil, X, Tag as TagIcon, BookOpen, ListChecks } from "lucide-react";
import { documentLibraryStore } from "@/data/documentLibraryStore";
import { knowledgeBaseStore } from "@/data/knowledgeBaseStore";
import { DocumentFile, DocumentFolder } from "@/types/documentLibrary";
import { DocumentUploadWizard } from "@/components/documentLibrary/DocumentUploadWizard";
import { toast } from "sonner";

const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) return FileImage;
  if (type === "application/pdf") return FileText;
  if (type.includes("spreadsheet") || type.includes("excel") || type === "text/csv") return FileSpreadsheet;
  if (type.includes("word") || type.includes("document") || type.startsWith("text/")) return FileText;
  return FileIcon;
};

const formatBytes = (bytes: number) => {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0, v = bytes;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

export default function DocumentFolderDetail() {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const [folders, setFolders] = useState<DocumentFolder[]>(documentLibraryStore.getFolders());
  const [files, setFiles] = useState<DocumentFile[]>(documentLibraryStore.getFiles());
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [wizardOpen, setWizardOpen] = useState(false);
  const [viewing, setViewing] = useState<DocumentFile | null>(null);
  const [editing, setEditing] = useState<DocumentFile | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);

  useEffect(() => {
    const unsub = documentLibraryStore.subscribe(() => {
      setFolders([...documentLibraryStore.getFolders()]);
      setFiles([...documentLibraryStore.getFiles()]);
    });
    return () => { unsub(); };
  }, []);

  const folder = folders.find((f) => f.id === folderId);
  const folderFiles = useMemo(() => files.filter((f) => f.folderId === folderId), [files, folderId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return folderFiles;
    return folderFiles.filter((f) =>
      [f.name, f.description ?? "", ...(f.tags ?? [])].join(" ").toLowerCase().includes(q)
    );
  }, [folderFiles, search]);

  const allSelected = filtered.length > 0 && filtered.every((f) => selected.has(f.id));

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map((f) => f.id)));
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const handleDownload = (doc: DocumentFile) => {
    if (!doc.dataUrl) { toast.error("No file attached"); return; }
    const a = document.createElement("a");
    a.href = doc.dataUrl; a.download = doc.name;
    document.body.appendChild(a); a.click(); a.remove();
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const doc = files.find((f) => f.id === deleteId);
    if (doc?.knowledgeDocId) knowledgeBaseStore.remove(doc.knowledgeDocId);
    documentLibraryStore.removeFile(deleteId);
    setDeleteId(null);
    setSelected((prev) => { const n = new Set(prev); n.delete(deleteId); return n; });
    toast.success("Document deleted");
  };

  const handleBulkDelete = () => {
    const ids = Array.from(selected);
    ids.forEach((id) => {
      const doc = files.find((f) => f.id === id);
      if (doc?.knowledgeDocId) knowledgeBaseStore.remove(doc.knowledgeDocId);
    });
    documentLibraryStore.removeFiles(ids);
    setSelected(new Set());
    setBulkDeleteOpen(false);
    toast.success(`${ids.length} documents deleted`);
  };

  const handleDeleteAll = () => {
    if (!folderId) return;
    folderFiles.forEach((doc) => {
      if (doc.knowledgeDocId) knowledgeBaseStore.remove(doc.knowledgeDocId);
    });
    documentLibraryStore.removeFolderFiles(folderId);
    setSelected(new Set());
    setDeleteAllOpen(false);
    toast.success("All documents deleted");
  };

  if (!folder) {
    return (
      <AdminLayout>
        <div className="p-8">
          <p className="text-sm text-muted-foreground">Folder not found.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate("/documents")}>Back to Library</Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <MobileHeader title={folder.name} subtitle={`${folderFiles.length} documents`} />
      <PageHeader
        title={folder.name}
        subtitle={folder.description || "Manage documents in this folder"}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate("/documents")} className="gap-1.5">
              <ArrowLeft className="w-4 h-4" />Library
            </Button>
            <Button size="sm" onClick={() => setWizardOpen(true)} className="gap-1.5">
              <Upload className="w-4 h-4" />Upload
            </Button>
          </>
        }
      />

      <div className="px-4 md:px-8 py-4 max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <SearchInput value={search} onChange={setSearch} placeholder="Search documents, tags..." />
          </div>
          {selected.size > 0 && (
            <Button variant="destructive" size="sm" onClick={() => setBulkDeleteOpen(true)} className="gap-1.5">
              <Trash2 className="w-4 h-4" />Delete ({selected.size})
            </Button>
          )}
          {folderFiles.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setDeleteAllOpen(true)} className="gap-1.5 text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" />Delete all
            </Button>
          )}
        </div>

        {filtered.length === 0 ? (
          <Card className="p-10 text-center">
            <FileIcon className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium">No documents yet</p>
            <p className="text-xs text-muted-foreground mt-1">Upload a document to get started.</p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="flex items-center gap-3 px-3 py-2 border-b border-border bg-muted/30">
              <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {selected.size > 0 ? `${selected.size} selected` : `${filtered.length} documents`}
              </span>
            </div>
            <div className="divide-y divide-border">
              {filtered.map((d) => {
                const Icon = getFileIcon(d.type);
                const isSelected = selected.has(d.id);
                return (
                  <div key={d.id} className={`flex items-center gap-3 p-3 transition-colors ${isSelected ? "bg-primary/5" : "hover:bg-muted/40"}`}>
                    <Checkbox checked={isSelected} onCheckedChange={() => toggleOne(d.id)} />
                    <div className="w-9 h-9 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setViewing(d)}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm truncate">{d.name}</p>
                        {d.shareToKnowledge && <Badge variant="secondary" className="text-[10px] py-0 px-1.5 gap-1"><BookOpen className="w-2.5 h-2.5" />Knowledge</Badge>}
                        {d.taskTitle && <Badge variant="secondary" className="text-[10px] py-0 px-1.5 gap-1"><ListChecks className="w-2.5 h-2.5" />Task</Badge>}
                        {d.tags?.slice(0, 3).map((t) => (
                          <Badge key={t} variant="outline" className="text-[10px] py-0 px-1.5 font-normal">{t}</Badge>
                        ))}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {formatBytes(d.size)} · Uploaded {formatDate(d.uploadedAt)} by {d.uploadedBy}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewing(d)} title="View"><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(d)} title="Edit"><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(d)} title="Download"><Download className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(d.id)} title="Delete"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      <DocumentUploadWizard open={wizardOpen} onOpenChange={setWizardOpen} folders={folders} defaultFolderId={folderId} />

      {/* Viewer */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
          {viewing && (
            <>
              <div className="px-6 pt-6 pb-4 border-b border-border">
                <DialogHeader>
                  <DialogTitle className="text-lg leading-tight pr-6 truncate">{viewing.name}</DialogTitle>
                </DialogHeader>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatBytes(viewing.size)} · Uploaded {formatDate(viewing.uploadedAt)} by {viewing.uploadedBy}
                </p>
                {viewing.description && <p className="text-sm mt-2">{viewing.description}</p>}
                {(viewing.tags?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {viewing.tags!.map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-auto bg-muted/30 p-4">
                {viewing.type.startsWith("image/") ? (
                  <img src={viewing.dataUrl} alt={viewing.name} className="max-w-full mx-auto rounded-lg" />
                ) : viewing.type === "application/pdf" ? (
                  <iframe src={viewing.dataUrl} title={viewing.name} className="w-full h-[70vh] rounded-lg bg-background border border-border" />
                ) : (
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center text-muted-foreground gap-3">
                    <FileIcon className="w-10 h-10" />
                    <p className="text-sm">Preview not available for this file type.</p>
                    <Button onClick={() => handleDownload(viewing)} className="gap-1.5"><Download className="w-4 h-4" />Download</Button>
                  </div>
                )}
              </div>
              <div className="px-6 py-3 border-t border-border flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => { setEditing(viewing); setViewing(null); }} className="gap-1.5"><Pencil className="w-3.5 h-3.5" />Edit</Button>
                <Button variant="outline" size="sm" onClick={() => handleDownload(viewing)} className="gap-1.5"><Download className="w-3.5 h-3.5" />Download</Button>
                <Button variant="outline" size="sm" onClick={() => { setDeleteId(viewing.id); setViewing(null); }} className="gap-1.5 text-destructive hover:text-destructive"><Trash2 className="w-3.5 h-3.5" />Delete</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Editor */}
      <EditDocumentDialog doc={editing} folders={folders} onClose={() => setEditing(null)} />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this document?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove the document.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selected.size} documents?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all documents in this folder?</AlertDialogTitle>
            <AlertDialogDescription>This will remove all {folderFiles.length} documents. The folder will remain.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete all</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

function EditDocumentDialog({ doc, folders, onClose }: { doc: DocumentFile | null; folders: DocumentFolder[]; onClose: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [folderId, setFolderId] = useState("");
  const [shareToKnowledge, setShareToKnowledge] = useState(false);

  useEffect(() => {
    if (doc) {
      setName(doc.name);
      setDescription(doc.description ?? "");
      setTags(doc.tags ?? []);
      setFolderId(doc.folderId);
      setShareToKnowledge(doc.shareToKnowledge);
    }
  }, [doc]);

  if (!doc) return null;

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  const save = () => {
    const updated: DocumentFile = { ...doc, name, description: description || undefined, tags, folderId, shareToKnowledge };
    // Sync knowledge base
    if (shareToKnowledge && !doc.knowledgeDocId) {
      const kbId = `kb-${doc.id}`;
      updated.knowledgeDocId = kbId;
      knowledgeBaseStore.add({
        id: kbId, name, type: doc.type, size: doc.size, dataUrl: doc.dataUrl,
        tags, description, uploadedAt: doc.uploadedAt, uploadedBy: doc.uploadedBy,
      });
    } else if (shareToKnowledge && doc.knowledgeDocId) {
      knowledgeBaseStore.update({
        id: doc.knowledgeDocId, name, type: doc.type, size: doc.size, dataUrl: doc.dataUrl,
        tags, description, uploadedAt: doc.uploadedAt, uploadedBy: doc.uploadedBy,
      });
    } else if (!shareToKnowledge && doc.knowledgeDocId) {
      knowledgeBaseStore.remove(doc.knowledgeDocId);
      updated.knowledgeDocId = undefined;
    }
    documentLibraryStore.updateFile(updated);
    toast.success("Document updated");
    onClose();
  };

  return (
    <Dialog open={!!doc} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Document</DialogTitle>
          <DialogDescription>Update details for this document.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Folder</Label>
            <select value={folderId} onChange={(e) => setFolderId(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><TagIcon className="w-3.5 h-3.5" />Tags</Label>
            <div className="flex gap-2">
              <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} placeholder="Add tag" />
              <Button type="button" variant="outline" onClick={addTag}>Add</Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((t) => (
                  <Badge key={t} variant="secondary" className="gap-1">
                    {t}<button onClick={() => setTags(tags.filter((x) => x !== t))}><X className="w-3 h-3" /></button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" />Share to Staff Resource Centre</p>
              <p className="text-xs text-muted-foreground mt-0.5">Available in the knowledge base.</p>
            </div>
            <Switch checked={shareToKnowledge} onCheckedChange={setShareToKnowledge} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={save}>Save changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
