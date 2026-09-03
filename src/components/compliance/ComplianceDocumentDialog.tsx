import { useCallback, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, Eye, Trash2, Loader2, CheckCircle2, AlertCircle, RotateCcw, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DocumentViewer } from "@/components/compliance/DocumentViewer";

const ACCEPTED = ".png,.jpg,.jpeg,.pdf,.docx,.rtf,image/png,image/jpeg,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/rtf,text/rtf";

export interface UploadedDoc {
  name: string;
  type: string;
  url: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  document?: UploadedDoc;
  onFileSelected: (file: File) => void;
  onDelete: () => void;
  onCancel: () => void;
}

export function ComplianceDocumentDialog({ open, onOpenChange, document: doc, onFileSelected, onDelete, onCancel }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback((files: FileList | null) => {
    const file = files?.[0];
    if (file) onFileSelected(file);
  }, [onFileSelected]);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Document</DialogTitle>
          <DialogDescription>Upload, preview or remove the supporting document.</DialogDescription>
        </DialogHeader>

        {!doc && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
              dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/40"
            )}
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium mb-1">Drag & drop a file here</p>
            <p className="text-xs text-muted-foreground">or click to browse (max 20MB)</p>
            <input
              ref={inputRef}
              type="file" accept={ACCEPTED}
              className="hidden"
              onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
            />
            <p className="mt-2 text-[10px] text-muted-foreground">Supported: PNG, JPG, PDF, DOCX, RTF</p>
          </div>
        )}

        {doc && (
          <div className="space-y-4 animate-fade-in">
            {/* File header */}
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {doc.status === 'uploading' && (
                    <span className="flex items-center gap-1 text-[11px] text-primary">
                      <Loader2 className="w-3 h-3 animate-spin" /> Uploading… {doc.progress}%
                    </span>
                  )}
                  {doc.status === 'success' && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-600">
                      <CheckCircle2 className="w-3 h-3" /> Successfully uploaded
                    </span>
                  )}
                  {doc.status === 'error' && (
                    <span className="flex items-center gap-1 text-[11px] text-destructive">
                      <AlertCircle className="w-3 h-3" /> {doc.error || 'Upload failed'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Progress bar during upload */}
            {doc.status === 'uploading' && (
              <div className="space-y-2">
                <Progress value={doc.progress} className="h-2" />
                <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={onCancel}>
                  <X className="w-4 h-4" /> Cancel upload
                </Button>
              </div>
            )}

            {/* Preview when success */}
            {doc.status === 'success' && (
              <DocumentViewer url={doc.url} name={doc.name} type={doc.type} />
            )}

            {/* Actions */}
            {doc.status === 'success' && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => window.open(doc.url, "_blank")}>
                  <Eye className="w-4 h-4" /> Open in new tab
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => inputRef.current?.click()}>
                  <Upload className="w-4 h-4" /> Replace
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                  onClick={onDelete}
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </Button>
                <input
                  ref={inputRef}
                  type="file" accept={ACCEPTED}
                  className="hidden"
                  onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
                />
              </div>
            )}

            {doc.status === 'error' && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => inputRef.current?.click()}>
                  <RotateCcw className="w-4 h-4" /> Retry
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                  onClick={onDelete}
                >
                  <Trash2 className="w-4 h-4" /> Dismiss
                </Button>
                <input
                  ref={inputRef}
                  type="file" accept={ACCEPTED}
                  className="hidden"
                  onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
                />
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
