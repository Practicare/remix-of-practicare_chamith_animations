import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Upload,
  FileText,
  X,
  Loader2,
  CheckCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { actionGuideStore } from "@/data/actionGuideStore";
import { knowledgeBaseStore } from "@/data/knowledgeBaseStore";
import { importantContactsStore } from "@/data/importantContactsStore";
import { ActionGuide } from "@/types/actionGuide";
import { KnowledgeDocument } from "@/types/knowledgeBase";
import { ImportantContact } from "@/types/importantContacts";

export type ResourceTab = "guides" | "knowledge" | "contacts";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tab: ResourceTab;
  uploadedBy: string;
}

type ExtractedGuide = { title: string; content: string; tags: string[] };
type ExtractedContact = Omit<ImportantContact, "id" | "createdAt" | "updatedAt">;
type ExtractedDoc = { name: string; description: string; tags: string[] };
type Extracted =
  | { kind: "guides"; items: ExtractedGuide[] }
  | { kind: "contacts"; items: ExtractedContact[] }
  | { kind: "knowledge"; items: ExtractedDoc[] };

const tabLabel: Record<ResourceTab, string> = {
  guides: "Action Guides",
  knowledge: "Knowledge Base",
  contacts: "Important Contacts",
};

const tabHint: Record<ResourceTab, string> = {
  guides:
    "Paste an SOP, emergency procedure, or upload a document. AI will extract titled action guides with step-by-step instructions.",
  knowledge:
    "Paste reference material or upload a document. AI will create knowledge base entries with name, summary and tags.",
  contacts:
    "Paste a contact list or upload a document/business cards. AI will extract names, services, phones, emails and faxes.",
};

const readAsText = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string) ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

// --- Mock extraction (placeholder until backend is wired) -------------------
const mockExtract = (tab: ResourceTab, source: string): Extracted => {
  const trimmed = source.trim();
  const seedFromSource = trimmed
    ? trimmed.split(/\n+/).slice(0, 3).join(" · ").slice(0, 80)
    : "";

  if (tab === "guides") {
    return {
      kind: "guides",
      items: [
        {
          title: seedFromSource ? `Procedure: ${seedFromSource}` : "Extracted procedure",
          content:
            "<ol><li>Identify the situation and stay calm.</li><li>Follow the documented step sequence.</li><li>Notify the duty clinician or manager.</li><li>Record the incident in the Communication Book.</li></ol>",
          tags: ["AI Extracted"],
        },
      ],
    };
  }
  if (tab === "contacts") {
    return {
      kind: "contacts",
      items: [
        {
          name: seedFromSource ? seedFromSource.slice(0, 50) : "Extracted Service",
          category: "General",
          phone: "(02) 1234 5678",
          email: "contact@service.com.au",
          fax: "(02) 1234 5679",
          description: "Imported via AI Scan — review and update details before saving.",
        },
      ],
    };
  }
  return {
    kind: "knowledge",
    items: [
      {
        name: seedFromSource ? `${seedFromSource.slice(0, 60)}.txt` : "Extracted document.txt",
        description:
          "Imported via AI Scan — review the summary and edit before publishing.",
        tags: ["AI Extracted"],
      },
    ],
  };
};

export const ResourceCentreAIScanDialog = ({
  open,
  onOpenChange,
  tab,
  uploadedBy,
}: Props) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [extracted, setExtracted] = useState<Extracted | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setText("");
    setFile(null);
    setFileDataUrl(null);
    setAnalyzing(false);
    setExtracted(null);
  };

  const handleClose = (next: boolean) => {
    onOpenChange(next);
    if (!next) reset();
  };

  const handleFile = async (f: File) => {
    if (f.size > 20 * 1024 * 1024) {
      toast.error("File is larger than 20MB");
      return;
    }
    setFile(f);
    try {
      const dataUrl = await readAsDataUrl(f);
      setFileDataUrl(dataUrl);
      // Best-effort: read text content for plain/text-like files
      if (f.type.startsWith("text/") || /\.(txt|md|csv)$/i.test(f.name)) {
        const t = await readAsText(f);
        if (t && !text) setText(t.slice(0, 4000));
      }
    } catch {
      toast.error("Could not read file");
    }
  };

  const handleAnalyze = async () => {
    if (!text.trim() && !file) {
      toast.error("Add some text or upload a document first");
      return;
    }
    setAnalyzing(true);
    // Simulated AI delay — backend wiring will replace this
    await new Promise((r) => setTimeout(r, 1800));
    const result = mockExtract(tab, text || file?.name || "");
    setExtracted(result);
    setAnalyzing(false);
  };

  const removeExtractedItem = (index: number) => {
    if (!extracted) return;
    setExtracted({
      ...extracted,
      items: extracted.items.filter((_, i) => i !== index),
    } as Extracted);
  };

  const updateExtractedItem = (index: number, patch: Record<string, unknown>) => {
    if (!extracted) return;
    setExtracted({
      ...extracted,
      items: extracted.items.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      ),
    } as Extracted);
  };

  const handleImport = () => {
    if (!extracted) return;
    const now = new Date().toISOString();

    if (extracted.kind === "guides") {
      extracted.items.forEach((g) => {
        const guide: ActionGuide = {
          id: `ag-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          title: g.title,
          content: g.content,
          images: [],
          tags: g.tags,
          createdAt: now,
          updatedAt: now,
          createdBy: uploadedBy,
        };
        actionGuideStore.add(guide);
      });
      toast.success(
        `${extracted.items.length} action guide${extracted.items.length === 1 ? "" : "s"} added`,
      );
    } else if (extracted.kind === "contacts") {
      extracted.items.forEach((c) => {
        const contact: ImportantContact = {
          id: `ic-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          ...c,
          createdAt: now,
          updatedAt: now,
        };
        importantContactsStore.add(contact);
      });
      toast.success(
        `${extracted.items.length} contact${extracted.items.length === 1 ? "" : "s"} added`,
      );
    } else {
      extracted.items.forEach((d) => {
        const doc: KnowledgeDocument = {
          id: `kb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: d.name,
          type: file?.type || "text/plain",
          size: file?.size ?? 0,
          dataUrl: fileDataUrl ?? "",
          tags: d.tags,
          description: d.description,
          uploadedAt: now,
          uploadedBy,
        };
        knowledgeBaseStore.add(doc);
      });
      toast.success(
        `${extracted.items.length} document${extracted.items.length === 1 ? "" : "s"} added`,
      );
    }

    handleClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            AI Scan — {tabLabel[tab]}
          </DialogTitle>
          <DialogDescription>{tabHint[tab]}</DialogDescription>
        </DialogHeader>

        {!extracted ? (
          <div className="space-y-4 mt-2">
            {/* File upload */}
            <div
              className={cn(
                "relative border-2 border-dashed rounded-lg p-5 transition-colors",
                file
                  ? "border-primary/40 bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.md,.csv,.doc,.docx,image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              {file ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(0)} KB · {file.type || "unknown"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 relative z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setFileDataUrl(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center py-2">
                  <div className="p-3 rounded-full bg-muted mb-2">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">Upload a document</p>
                  <p className="text-xs text-muted-foreground">
                    PDF, DOC, TXT, CSV or image · up to 20MB
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex-1 h-px bg-border" />
              OR PASTE TEXT
              <div className="flex-1 h-px bg-border" />
            </div>

            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste content here for AI to extract details from..."
              rows={6}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAnalyze}
                disabled={analyzing || (!text.trim() && !file)}
                className="gap-2"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analyze with AI
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-2">
              <CheckCircle className="w-4 h-4" />
              {extracted.items.length} item{extracted.items.length === 1 ? "" : "s"} extracted —
              review and edit before importing.
            </div>

            <div className="space-y-2">
              {extracted.kind === "guides" &&
                extracted.items.map((g, i) => (
                  <Card key={i} className="p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground mt-2" />
                      <input
                        className="flex-1 bg-transparent border-b border-transparent focus:border-border outline-none text-sm font-medium"
                        value={g.title}
                        onChange={(e) =>
                          updateExtractedItem(i, { title: e.target.value })
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => removeExtractedItem(i)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <div
                      className="text-xs text-muted-foreground prose prose-sm max-w-none [&_ol]:list-decimal [&_ol]:pl-5"
                      dangerouslySetInnerHTML={{ __html: g.content }}
                    />
                    <div className="flex flex-wrap gap-1">
                      {g.tags.map((t) => (
                        <Badge key={t} variant="secondary" className="text-[10px]">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                ))}

              {extracted.kind === "contacts" &&
                extracted.items.map((c, i) => (
                  <Card key={i} className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        className="flex-1 bg-transparent border-b border-transparent focus:border-border outline-none text-sm font-medium"
                        value={c.name}
                        onChange={(e) =>
                          updateExtractedItem(i, { name: e.target.value })
                        }
                        placeholder="Name / Service"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => removeExtractedItem(i)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <input
                        className="bg-muted/40 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-ring"
                        value={c.category ?? ""}
                        onChange={(e) =>
                          updateExtractedItem(i, { category: e.target.value })
                        }
                        placeholder="Category"
                      />
                      <input
                        className="bg-muted/40 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-ring"
                        value={c.phone ?? ""}
                        onChange={(e) =>
                          updateExtractedItem(i, { phone: e.target.value })
                        }
                        placeholder="Phone"
                      />
                      <input
                        className="bg-muted/40 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-ring"
                        value={c.email ?? ""}
                        onChange={(e) =>
                          updateExtractedItem(i, { email: e.target.value })
                        }
                        placeholder="Email"
                      />
                      <input
                        className="bg-muted/40 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-ring"
                        value={c.fax ?? ""}
                        onChange={(e) =>
                          updateExtractedItem(i, { fax: e.target.value })
                        }
                        placeholder="Fax"
                      />
                    </div>
                    <textarea
                      className="w-full bg-muted/40 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-ring resize-none"
                      rows={2}
                      value={c.description ?? ""}
                      onChange={(e) =>
                        updateExtractedItem(i, { description: e.target.value })
                      }
                      placeholder="Description"
                    />
                  </Card>
                ))}

              {extracted.kind === "knowledge" &&
                extracted.items.map((d, i) => (
                  <Card key={i} className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        className="flex-1 bg-transparent border-b border-transparent focus:border-border outline-none text-sm font-medium"
                        value={d.name}
                        onChange={(e) =>
                          updateExtractedItem(i, { name: e.target.value })
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => removeExtractedItem(i)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <textarea
                      className="w-full bg-muted/40 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-ring resize-none"
                      rows={2}
                      value={d.description}
                      onChange={(e) =>
                        updateExtractedItem(i, { description: e.target.value })
                      }
                    />
                    <div className="flex flex-wrap gap-1">
                      {d.tags.map((t) => (
                        <Badge key={t} variant="secondary" className="text-[10px]">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                ))}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setExtracted(null)}>
                Back
              </Button>
              <Button
                onClick={handleImport}
                disabled={extracted.items.length === 0}
                className="gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                Import {extracted.items.length} item
                {extracted.items.length === 1 ? "" : "s"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
