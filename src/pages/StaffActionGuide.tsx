import { ComponentType, ReactNode, useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/SearchInput";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, LifeBuoy, Pencil, Trash2, ImageIcon, Eye, LayoutGrid, List as ListIcon, BookOpen, Contact as ContactIcon, Briefcase, Info } from "lucide-react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KnowledgeBasePanel } from "@/components/knowledgeBase/KnowledgeBasePanel";
import { ImportantContactsPanel } from "@/components/importantContacts/ImportantContactsPanel";
import { ProvidersPanel } from "@/components/providers/ProvidersPanel";
import { AboutPracticePanel } from "@/components/aboutPractice/AboutPracticePanel";

import { PageIntro } from "@/components/layout/PageIntro";
import { PRACTICE_TIPS } from "@/components/staffResourceCentre/practiceTipsData";
import { useUser } from "@/contexts/UserContext";
import { ActionGuide } from "@/types/actionGuide";
import { actionGuideStore } from "@/data/actionGuideStore";
import { ActionGuideDialog } from "@/components/actionGuide/ActionGuideDialog";
import { toast } from "sonner";
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

const stripHtml = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const StaffActionGuide = ({
  Layout = AdminLayout,
}: {
  Layout?: ComponentType<{ children: ReactNode }>;
}) => {
  const { userRole, currentUser } = useUser();
  const isAdmin = Layout === AdminLayout || userRole === "admin";
  const uploadedBy = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
    : "Practice Manager";

  const [guides, setGuides] = useState<ActionGuide[]>(actionGuideStore.getAll());
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ActionGuide | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<ActionGuide | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<"about" | "providers" | "guides" | "knowledge" | "contacts">("about");
  

  useEffect(() => {
    const unsub = actionGuideStore.subscribe(() => setGuides([...actionGuideStore.getAll()]));
    return () => {
      unsub();
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return guides;
    return guides.filter((g) => {
      const haystack = [g.title, stripHtml(g.content), ...(g.tags ?? [])]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [guides, search]);

  const handleSave = (g: ActionGuide) => {
    if (guides.some((x) => x.id === g.id)) {
      actionGuideStore.update(g);
      toast.success("Action guide updated");
    } else {
      actionGuideStore.add(g);
      toast.success("Action guide created");
    }
    setEditing(null);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    actionGuideStore.remove(deleteId);
    setDeleteId(null);
    toast.success("Action guide removed");
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-8 py-6 space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-semibold tracking-tight">Staff Resource Centre</h1>
          </div>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Quick-reference instructions and shared documents for the practice team.
          </p>
        </div>

        <PageIntro
          highlight="One home for everything your team needs to know."
          description="Store guides, provider info, contacts and knowledge in a single searchable centre — so anyone can find the right answer in seconds."
        />


        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "about" | "providers" | "guides" | "knowledge" | "contacts")}
          className="space-y-4"
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <TabsList>
              <TabsTrigger value="about" className="gap-1.5">
                <Info className="w-4 h-4" />
                About the Practice
              </TabsTrigger>
              <TabsTrigger value="providers" className="gap-1.5">
                <Briefcase className="w-4 h-4" />
                Providers & Services
              </TabsTrigger>
              <TabsTrigger value="guides" className="gap-1.5">
                <LifeBuoy className="w-4 h-4" />
                Action Guides
              </TabsTrigger>
              <TabsTrigger value="knowledge" className="gap-1.5">
                <BookOpen className="w-4 h-4" />
                Knowledge Base
              </TabsTrigger>
              <TabsTrigger value="contacts" className="gap-1.5">
                <ContactIcon className="w-4 h-4" />
                Important Contacts
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="about" className="mt-0 space-y-4">
            <AboutPracticePanel isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="providers" className="mt-0 space-y-4">
            <ProvidersPanel isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="guides" className="space-y-4 mt-0">

        <div className="flex items-center gap-2">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search issues, steps or tags..."
            />
          </div>
          <SegmentedControl
            value={view}
            onChange={(v) => setView(v as "grid" | "list")}
            options={[
              { id: "grid", label: "Grid", icon: LayoutGrid },
              { id: "list", label: "List", icon: ListIcon },
            ]}
            size="sm"
          />
          {isAdmin && (
            <Button
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
              className="gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              New issue
            </Button>
          )}
        </div>

        {filtered.length === 0 ? (
          <Card className="p-10 text-center">
            <LifeBuoy className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium">No action guides found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search ? "Try a different search term." : "Add the first issue to get started."}
            </p>
          </Card>
        ) : (
          <div
            className={
              view === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
                : "flex flex-col gap-2"
            }
          >
            {filtered.map((g) => {
              const preview = stripHtml(g.content);

              if (view === "list") {
                return (
                  <Card
                    key={g.id}
                    onClick={() => setViewing(g)}
                    className="group flex items-center gap-3 p-3 cursor-pointer transition-all hover:shadow-sm hover:border-primary/40"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-muted">
                      {g.images.length > 0 ? (
                        <>
                          <img
                            src={g.images[0]}
                            alt={g.title}
                            className="w-full h-full object-cover"
                          />
                          {g.images.length > 1 && (
                            <span className="absolute bottom-0.5 right-0.5 bg-background/90 backdrop-blur text-[9px] font-medium px-1 rounded inline-flex items-center gap-0.5">
                              <ImageIcon className="w-2.5 h-2.5" />
                              {g.images.length}
                            </span>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5">
                          <LifeBuoy className="w-5 h-5 text-primary/40" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm text-foreground truncate">
                          {g.title}
                        </h3>
                        {g.tags?.slice(0, 3).map((t) => (
                          <Badge
                            key={t}
                            variant="secondary"
                            className="text-[10px] py-0 px-1.5 font-normal"
                          >
                            {t}
                          </Badge>
                        ))}
                        {(g.tags?.length ?? 0) > 3 && (
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                            +{(g.tags!.length - 3)}
                          </Badge>
                        )}
                      </div>
                      {preview && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {preview}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div
                      className="flex items-center gap-0.5 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setViewing(g)}
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {isAdmin && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditing(g);
                              setDialogOpen(true);
                            }}
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(g.id)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </Card>
                );
              }

              return (
                <Card
                  key={g.id}
                  onClick={() => setViewing(g)}
                  className="group relative flex flex-col overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-primary/40"
                >
                  {/* Image strip */}
                  {g.images.length > 0 ? (
                    <div className="relative h-36 bg-muted overflow-hidden">
                      <img
                        src={g.images[0]}
                        alt={g.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      {g.images.length > 1 && (
                        <Badge
                          variant="secondary"
                          className="absolute bottom-2 right-2 bg-background/90 backdrop-blur gap-1"
                        >
                          <ImageIcon className="w-3 h-3" />
                          {g.images.length}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="h-2 bg-gradient-to-r from-primary/20 to-primary/5" />
                  )}

                  <div className="flex flex-col flex-1 p-4 gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold leading-tight text-foreground line-clamp-2">
                        {g.title}
                      </h3>
                    </div>

                    {preview && (
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {preview}
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-2 mt-auto pt-2">
                      <div className="flex flex-wrap gap-1">
                        {g.tags?.slice(0, 3).map((t) => (
                          <Badge
                            key={t}
                            variant="secondary"
                            className="text-[10px] py-0 px-1.5 font-normal"
                          >
                            {t}
                          </Badge>
                        ))}
                        {(g.tags?.length ?? 0) > 3 && (
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                            +{(g.tags!.length - 3)}
                          </Badge>
                        )}
                      </div>

                      <div
                        className="flex items-center gap-0.5 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setViewing(g)}
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        {isAdmin && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => {
                                setEditing(g);
                                setDialogOpen(true);
                              }}
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(g.id)}
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          )}
          </TabsContent>

          <TabsContent value="knowledge" className="mt-0 space-y-4">
            <KnowledgeBasePanel isAdmin={isAdmin} />

          </TabsContent>

          <TabsContent value="contacts" className="mt-0 space-y-4">
            <ImportantContactsPanel isAdmin={isAdmin} />
          </TabsContent>
        </Tabs>
      </div>

      {/* View dialog */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          {viewing && (
            <>
              <div className="px-6 pt-6 pb-4 border-b border-border">
                <DialogHeader>
                  <DialogTitle className="text-xl leading-tight pr-6">{viewing.title}</DialogTitle>
                </DialogHeader>
                {viewing.tags && viewing.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {viewing.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="text-[11px]">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-6 py-5 space-y-6">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    What to do
                  </h4>
                  <div
                    className="prose prose-sm max-w-none text-[15px] leading-relaxed text-foreground
                      [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-6 [&_ul]:pl-6
                      [&_li]:my-1.5 [&_li]:pl-1
                      [&_p]:my-2 [&_strong]:text-foreground [&_strong]:font-semibold"
                    dangerouslySetInnerHTML={{
                      __html: viewing.content || "<em class='text-muted-foreground'>No instructions yet.</em>",
                    }}
                  />
                </div>

                {viewing.images.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Reference pictures ({viewing.images.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {viewing.images.map((src, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setLightbox(src)}
                          className="block rounded-lg overflow-hidden border border-border hover:border-primary/50 hover:shadow-md transition-all bg-muted"
                        >
                          <img
                            src={src}
                            alt={`${viewing.title} ${i + 1}`}
                            className="w-full h-32 object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isAdmin && (
                <div className="px-6 py-3 border-t border-border bg-muted/30 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(viewing);
                      setViewing(null);
                      setDialogOpen(true);
                    }}
                    className="gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Image lightbox */}
      <Dialog open={!!lightbox} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="max-w-4xl p-2 bg-background">
          {lightbox && (
            <img
              src={lightbox}
              alt="Reference"
              className="w-full h-auto max-h-[85vh] object-contain rounded"
            />
          )}
        </DialogContent>
      </Dialog>

      <ActionGuideDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
        guide={editing}
        onSave={handleSave}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this action guide?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the issue and its instructions for everyone.
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

    </Layout>
  );
};

export default StaffActionGuide;
