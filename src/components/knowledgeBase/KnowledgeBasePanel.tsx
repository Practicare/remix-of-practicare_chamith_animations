import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/SearchInput";
import {
  Dialog,
  DialogContent,
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
  Upload,
  FileText,
  FileImage,
  FileSpreadsheet,
  File as FileIcon,
  Eye,
  Download,
  Trash2,
  BookOpen,
  LayoutGrid,
  List as ListIcon,
  Sparkles,
} from "lucide-react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { knowledgeBaseStore } from "@/data/knowledgeBaseStore";
import { KnowledgeDocument } from "@/types/knowledgeBase";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const formatBytes = (bytes: number) => {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) return FileImage;
  if (type === "application/pdf") return FileText;
  if (
    type.includes("spreadsheet") ||
    type.includes("excel") ||
    type === "text/csv"
  )
    return FileSpreadsheet;
  if (
    type.includes("word") ||
    type.includes("document") ||
    type.startsWith("text/")
  )
    return FileText;
  return FileIcon;
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

interface Props {
  isAdmin: boolean;
  onAIScan?: () => void;
}

export const KnowledgeBasePanel = ({ isAdmin, onAIScan }: Props) => {
  const { currentUser } = useUser();
  const [docs, setDocs] = useState<KnowledgeDocument[]>(knowledgeBaseStore.getAll());
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("list");
  const [viewing, setViewing] = useState<KnowledgeDocument | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = knowledgeBaseStore.subscribe(() =>
      setDocs([...knowledgeBaseStore.getAll()]),
    );
    return () => {
      unsub();
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter((d) =>
      [d.name, d.description ?? "", ...(d.tags ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [docs, search]);

  const handleFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} is larger than 20MB`);
          continue;
        }
        const dataUrl = await readFileAsDataUrl(file);
        knowledgeBaseStore.add({
          id: `kb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
          dataUrl,
          tags: [],
          uploadedAt: new Date().toISOString(),
          uploadedBy: currentUser
            ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
            : "Practice Manager",
        });
      }
      toast.success(
        files.length === 1 ? "Document uploaded" : `${files.length} documents uploaded`,
      );
    } catch {
      toast.error("Failed to upload one or more files");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownload = (doc: KnowledgeDocument) => {
    if (!doc.dataUrl) {
      toast.error("This sample document has no file attached");
      return;
    }
    const a = document.createElement("a");
    a.href = doc.dataUrl;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleDelete = () => {
    if (!deleteId) return;
    knowledgeBaseStore.remove(deleteId);
    setDeleteId(null);
    toast.success("Document removed");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search documents, tags or descriptions..."
          />
        </div>
        <SegmentedControl
          value={view}
          onChange={(v) => setView(v as "grid" | "list")}
          options={[
            { id: "list", label: "List", icon: ListIcon },
            { id: "grid", label: "Grid", icon: LayoutGrid },
          ]}
          size="sm"
        />
        {isAdmin && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFiles}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="gap-1.5 shrink-0"
            >
              <Upload className="w-4 h-4" />
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </>
        )}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium">No documents found</p>
          <p className="text-xs text-muted-foreground mt-1">
            {search
              ? "Try a different search term."
              : isAdmin
                ? "Upload a document to get started."
                : "No documents have been shared yet."}
          </p>
        </Card>
      ) : view === "list" ? (
        <Card className="divide-y divide-border overflow-hidden">
          {filtered.map((d) => {
            const Icon = getFileIcon(d.type);
            return (
              <div
                key={d.id}
                className="flex items-center gap-3 p-3 hover:bg-muted/40 transition-colors cursor-pointer"
                onClick={() => setViewing(d)}
              >
                <div className="w-10 h-10 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm truncate">{d.name}</p>
                    {d.tags?.slice(0, 3).map((t) => (
                      <Badge
                        key={t}
                        variant="secondary"
                        className="text-[10px] py-0 px-1.5 font-normal"
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatBytes(d.size)} · Uploaded {formatDate(d.uploadedAt)} by{" "}
                    {d.uploadedBy}
                  </p>
                </div>
                <div
                  className="flex items-center gap-0.5 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewing(d)}
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDownload(d)}
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(d.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((d) => {
            const Icon = getFileIcon(d.type);
            return (
              <Card
                key={d.id}
                onClick={() => setViewing(d)}
                className="group p-4 cursor-pointer transition-all hover:shadow-md hover:border-primary/40"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-tight line-clamp-2">
                      {d.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatBytes(d.size)} · {formatDate(d.uploadedAt)}
                    </p>
                  </div>
                </div>
                {d.description && (
                  <p className="text-xs text-muted-foreground mt-3 line-clamp-2">
                    {d.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <div className="flex flex-wrap gap-1">
                    {d.tags?.slice(0, 2).map((t) => (
                      <Badge
                        key={t}
                        variant="secondary"
                        className="text-[10px] py-0 px-1.5 font-normal"
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                  <div
                    className="flex items-center gap-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleDownload(d)}
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(d.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Viewer dialog */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
          {viewing && (
            <>
              <div className="px-6 pt-6 pb-4 border-b border-border">
                <DialogHeader>
                  <DialogTitle className="text-lg leading-tight pr-6 truncate">
                    {viewing.name}
                  </DialogTitle>
                </DialogHeader>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatBytes(viewing.size)} · Uploaded {formatDate(viewing.uploadedAt)}{" "}
                  by {viewing.uploadedBy}
                </p>
              </div>

              <div className="flex-1 overflow-auto bg-muted/30 p-4">
                {!viewing.dataUrl ? (
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center text-muted-foreground">
                    <FileIcon className="w-10 h-10 mb-3" />
                    <p className="text-sm">Sample document — no file attached.</p>
                  </div>
                ) : viewing.type.startsWith("image/") ? (
                  <img
                    src={viewing.dataUrl}
                    alt={viewing.name}
                    className="max-w-full mx-auto rounded-lg"
                  />
                ) : viewing.type === "application/pdf" ? (
                  <iframe
                    src={viewing.dataUrl}
                    title={viewing.name}
                    className="w-full h-[70vh] rounded-lg bg-background border border-border"
                  />
                ) : (
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center text-muted-foreground gap-3">
                    <FileIcon className="w-10 h-10" />
                    <p className="text-sm">Preview not available for this file type.</p>
                    <Button onClick={() => handleDownload(viewing)} className="gap-1.5">
                      <Download className="w-4 h-4" />
                      Download to view
                    </Button>
                  </div>
                )}
              </div>

              <div className="px-6 py-3 border-t border-border bg-background flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(viewing)}
                  className="gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </Button>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDeleteId(viewing.id);
                      setViewing(null);
                    }}
                    className="gap-1.5 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this document?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the document from the knowledge base for
              everyone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
