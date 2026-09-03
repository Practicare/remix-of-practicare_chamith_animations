import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { PageIntro } from "@/components/layout/PageIntro";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/SearchInput";
import { DynamicIcon } from "@/components/DynamicIcon";
import { FolderOpen, Upload, FolderPlus, ChevronRight, MoreVertical, Trash2, FileText, BookOpen, ListChecks } from "lucide-react";
import { documentLibraryStore } from "@/data/documentLibraryStore";
import { DocumentFolder, DocumentFile } from "@/types/documentLibrary";
import { DocumentUploadWizard } from "@/components/documentLibrary/DocumentUploadWizard";
import { AddFolderDialog } from "@/components/documentLibrary/AddFolderDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function DocumentLibrary() {
  const navigate = useNavigate();
  const [folders, setFolders] = useState<DocumentFolder[]>(documentLibraryStore.getFolders());
  const [files, setFiles] = useState<DocumentFile[]>(documentLibraryStore.getFiles());
  const [wizardOpen, setWizardOpen] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [deleteFolderId, setDeleteFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsub = documentLibraryStore.subscribe(() => {
      setFolders([...documentLibraryStore.getFolders()]);
      setFiles([...documentLibraryStore.getFiles()]);
    });
    return () => { unsub(); };
  }, []);

  const filesFor = (id: string) => files.filter((f) => f.folderId === id);

  const handleDeleteFolder = () => {
    if (!deleteFolderId) return;
    documentLibraryStore.removeFolder(deleteFolderId);
    toast.success("Folder deleted");
    setDeleteFolderId(null);
  };

  return (
    <AdminLayout>
      <MobileHeader
        title="Document Library"
        subtitle="Folders & documents"
        actions={
          <Button size="icon" variant="outline" className="h-9 w-9 border-primary/30 bg-primary/5 hover:bg-primary/10" onClick={() => setWizardOpen(true)}>
            <Upload className="w-4 h-4 text-primary" />
          </Button>
        }
      />

      <PageHeader
        title="Document Library"
        subtitle="Organize, share and manage practice documents"
        icon={FolderOpen}
        actions={
          <Button size="sm" onClick={() => setWizardOpen(true)} className="gap-1.5">
            <Upload className="w-4 h-4" />Upload
          </Button>
        }
      />

      <div className="px-4 md:px-8 py-4 max-w-4xl mx-auto space-y-6">
        <PageIntro
          highlight="Every document, one search away."
          description="Store, tag and organise your practice's documents in folders — attach tasks, share them to the Staff Resource Centre and stop hunting through drives."
        />

        {/* Global search */}
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search across all folders and documents..."
        />

        {(() => {
          const q = search.trim().toLowerCase();
          if (!q) return null;
          const matches = files.filter((f) =>
            [f.name, f.description ?? "", ...(f.tags ?? [])].join(" ").toLowerCase().includes(q)
          );
          const folderById = new Map(folders.map((fo) => [fo.id, fo] as const));
          return (
            <Card className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Document matches
                </span>
                <span className="text-[11px] text-muted-foreground">{matches.length} found</span>
              </div>
              {matches.length === 0 ? (
                <p className="text-[12px] text-muted-foreground py-3 text-center">No documents match "{search}".</p>
              ) : (
                <div className="divide-y divide-border">
                  {matches.slice(0, 20).map((d) => {
                    const fo = folderById.get(d.folderId);
                    return (
                      <button
                        key={d.id}
                        onClick={() => navigate(`/documents/folder/${d.folderId}`)}
                        className="w-full text-left flex items-center gap-3 py-2 hover:bg-muted/40 rounded-md px-2"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[13px] font-medium truncate">{d.name}</p>
                            {d.shareToKnowledge && (
                              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 gap-1">
                                <BookOpen className="w-2.5 h-2.5" />Knowledge
                              </Badge>
                            )}
                            {d.taskTitle && (
                              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 gap-1">
                                <ListChecks className="w-2.5 h-2.5" />Task
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {fo?.name ?? "Unknown folder"}
                            {d.tags && d.tags.length > 0 && ` · ${d.tags.slice(0, 3).join(", ")}`}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </button>
                    );
                  })}
                  {matches.length > 20 && (
                    <p className="text-[11px] text-muted-foreground text-center pt-2">
                      Showing 20 of {matches.length} results
                    </p>
                  )}
                </div>
              )}
            </Card>
          );
        })()}

        {/* Section header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">Folders</h3>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-muted-foreground">{folders.length} folders · {files.length} total documents</span>
            <Button variant="outline" size="sm" onClick={() => setFolderDialogOpen(true)} className="gap-1.5">
              <FolderPlus className="w-4 h-4" />Add Folder
            </Button>
          </div>
        </div>

        {/* Folder cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(() => {
            const q = search.trim().toLowerCase();
            const visibleFolders = !q
              ? folders
              : folders.filter((fo) => {
                  const inName = fo.name.toLowerCase().includes(q) || (fo.description ?? "").toLowerCase().includes(q);
                  const hasMatchingDoc = files.some(
                    (f) =>
                      f.folderId === fo.id &&
                      [f.name, f.description ?? "", ...(f.tags ?? [])].join(" ").toLowerCase().includes(q)
                  );
                  return inName || hasMatchingDoc;
                });
            return visibleFolders;
          })().map((folder) => {
            const folderItems = filesFor(folder.id);
            const knowledgeCount = folderItems.filter((f) => f.shareToKnowledge).length;
            return (
              <div
                key={folder.id}
                onClick={() => navigate(`/documents/folder/${folder.id}`)}
                className="group rounded-xl border border-border/50 bg-card p-4 hover:border-border hover:shadow-sm transition-all cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <DynamicIcon name={folder.icon} className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[13px] font-semibold leading-tight truncate">{folder.name}</h3>
                      {folder.description && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{folder.description}</p>
                      )}
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteFolderId(folder.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />Delete folder
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-[12px] font-medium">
                    <span>{folderItems.length}</span>
                    <span className="text-muted-foreground ml-1">documents</span>
                  </div>
                  {knowledgeCount > 0 && (
                    <div className="flex items-center gap-1 text-[11px] text-primary">
                      <FileText className="w-3 h-3" />
                      <span>{knowledgeCount} shared</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    {folderItems.length === 0 ? "No documents yet" : "Ready to browse"}
                  </span>
                  <span className="flex items-center gap-1 text-[12px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    View<ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <DocumentUploadWizard open={wizardOpen} onOpenChange={setWizardOpen} folders={folders} />
      <AddFolderDialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen} />

      <AlertDialog open={!!deleteFolderId} onOpenChange={(o) => !o && setDeleteFolderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this folder?</AlertDialogTitle>
            <AlertDialogDescription>This will delete the folder and all documents inside it.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFolder} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
