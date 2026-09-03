import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchInput } from "@/components/ui/SearchInput";
import {
  Dialog,
  DialogContent,
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
  Plus,
  Pencil,
  Trash2,
  Eye,
  Briefcase,
  Check,
  X,
  StickyNote,
  LayoutGrid,
  List as ListIcon,
  Plus as PlusIcon,
} from "lucide-react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { providersStore } from "@/data/providersStore";
import { Provider } from "@/types/providers";
import { toast } from "sonner";

interface Props {
  isAdmin: boolean;
}

const emptyDraft = (): Provider => ({
  id: "",
  name: "",
  category: "",
  servicesProvided: [],
  servicesNotProvided: [],
  specialNote: "",
  createdAt: "",
  updatedAt: "",
});

interface ServiceListEditorProps {
  label: string;
  placeholder: string;
  items: string[];
  onChange: (items: string[]) => void;
  tone: "positive" | "negative";
}

const ServiceListEditor = ({ label, placeholder, items, onChange, tone }: ServiceListEditorProps) => {
  const [value, setValue] = useState("");
  const add = () => {
    const v = value.trim();
    if (!v) return;
    if (items.includes(v)) {
      setValue("");
      return;
    }
    onChange([...items, v]);
    setValue("");
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  const Icon = tone === "positive" ? Check : X;
  const iconColor = tone === "positive" ? "text-emerald-600" : "text-destructive";

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={add} className="shrink-0 gap-1">
          <PlusIcon className="w-4 h-4" />
          Add
        </Button>
      </div>
      {items.length > 0 && (
        <ul className="space-y-1 pt-1">
          {items.map((s, i) => (
            <li
              key={`${s}-${i}`}
              className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-muted text-sm"
            >
              <span className="flex items-center gap-2 min-w-0">
                <Icon className={`w-3.5 h-3.5 shrink-0 ${iconColor}`} />
                <span className="truncate">{s}</span>
              </span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-muted-foreground hover:text-destructive shrink-0"
                title="Remove"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const ProvidersPanel = ({ isAdmin }: Props) => {
  const [providers, setProviders] = useState<Provider[]>(providersStore.getAll());
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Provider | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewing, setViewing] = useState<Provider | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Provider>(emptyDraft());
  const [view, setView] = useState<"grid" | "list">("list");

  useEffect(() => {
    const unsub = providersStore.subscribe(() => setProviders([...providersStore.getAll()]));
    return () => {
      unsub();
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return providers;
    return providers.filter((p) =>
      [
        p.name,
        p.category ?? "",
        p.specialNote ?? "",
        ...p.servicesProvided,
        ...p.servicesNotProvided,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [providers, search]);

  const openNew = () => {
    setEditing(null);
    setDraft(emptyDraft());
    setDialogOpen(true);
  };

  const openEdit = (p: Provider) => {
    setEditing(p);
    setDraft({ ...p, servicesProvided: [...p.servicesProvided], servicesNotProvided: [...p.servicesNotProvided] });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!draft.name.trim()) {
      toast.error("Provider name is required");
      return;
    }
    const now = new Date().toISOString();
    if (editing) {
      providersStore.update({ ...draft, updatedAt: now });
      toast.success("Provider updated");
    } else {
      providersStore.add({
        ...draft,
        id: `pv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: now,
        updatedAt: now,
      });
      toast.success("Provider added");
    }
    setDialogOpen(false);
    setEditing(null);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    providersStore.remove(deleteId);
    setDeleteId(null);
    toast.success("Provider removed");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search providers or services..."
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
          <Button onClick={openNew} className="gap-1.5 shrink-0">
            <Plus className="w-4 h-4" />
            Add new
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <Briefcase className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium">No providers found</p>
          <p className="text-xs text-muted-foreground mt-1">
            {search
              ? "Try a different search term."
              : isAdmin
                ? "Add the first provider to get started."
                : "No providers have been added yet."}
          </p>
        </Card>
      ) : view === "list" ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left font-semibold px-3 py-2.5">Provider</th>
                  <th className="text-left font-semibold px-3 py-2.5">Services provided</th>
                  <th className="text-left font-semibold px-3 py-2.5">Not provided</th>
                  <th className="text-left font-semibold px-3 py-2.5">Special note</th>
                  <th className="text-right font-semibold px-3 py-2.5 w-px whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-t border-border hover:bg-muted/30 transition-colors align-top">
                    <td className="px-3 py-3 min-w-[160px]">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <Briefcase className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium text-foreground">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      {p.servicesProvided.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {p.servicesProvided.map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            >
                              <Check className="w-3 h-3" />
                              {s}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {p.servicesNotProvided.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {p.servicesNotProvided.map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-lg bg-muted text-muted-foreground line-through"
                            >
                              <X className="w-3 h-3" />
                              {s}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 max-w-[260px]">
                      {p.specialNote ? (
                        <p className="text-xs text-muted-foreground line-clamp-2 flex items-start gap-1.5">
                          <StickyNote className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                          {p.specialNote}
                        </p>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setViewing(p)}
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
                              onClick={() => openEdit(p)}
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(p.id)}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((p) => (
            <Card
              key={p.id}
              onClick={() => setViewing(p)}
              className="group flex flex-col p-4 gap-3 cursor-pointer transition-all hover:shadow-md hover:border-primary/40"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground leading-tight line-clamp-2">
                    {p.name}
                  </h3>
                </div>
              </div>

              {p.servicesProvided.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Provides
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {p.servicesProvided.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      >
                        <Check className="w-3 h-3" />
                        {s}
                      </span>
                    ))}
                    {p.servicesProvided.length > 4 && (
                      <span className="text-[11px] text-muted-foreground self-center">
                        +{p.servicesProvided.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {p.servicesNotProvided.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Does not provide
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {p.servicesNotProvided.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-lg bg-muted text-muted-foreground line-through"
                      >
                        <X className="w-3 h-3" />
                        {s}
                      </span>
                    ))}
                    {p.servicesNotProvided.length > 4 && (
                      <span className="text-[11px] text-muted-foreground self-center">
                        +{p.servicesNotProvided.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {p.specialNote && (
                <p className="text-xs text-muted-foreground line-clamp-2 flex items-start gap-1.5 mt-auto">
                  <StickyNote className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                  {p.specialNote}
                </p>
              )}

              <div
                className="flex items-center justify-end gap-0.5 pt-2 border-t border-border/50"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setViewing(p)}
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
                      onClick={() => openEdit(p)}
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(p.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* View dialog */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg">{viewing.name}</DialogTitle>
              </DialogHeader>
              {viewing.category && (
                <Badge variant="secondary" className="self-start text-[11px]">
                  {viewing.category}
                </Badge>
              )}

              <div className="space-y-4 pt-2">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Services provided
                  </h4>
                  {viewing.servicesProvided.length > 0 ? (
                    <ul className="space-y-1">
                      {viewing.servicesProvided.map((s) => (
                        <li key={s} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">None listed.</p>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Services not provided
                  </h4>
                  {viewing.servicesNotProvided.length > 0 ? (
                    <ul className="space-y-1">
                      {viewing.servicesNotProvided.map((s) => (
                        <li key={s} className="flex items-start gap-2 text-sm">
                          <X className="w-4 h-4 shrink-0 text-destructive mt-0.5" />
                          <span className="text-muted-foreground">{s}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">None listed.</p>
                  )}
                </div>

                {viewing.specialNote && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <StickyNote className="w-3.5 h-3.5 text-amber-600" />
                      Special note
                    </h4>
                    <p className="text-sm leading-relaxed bg-amber-50 dark:bg-amber-950/30 text-foreground rounded-lg p-3 border border-amber-200 dark:border-amber-900">
                      {viewing.specialNote}
                    </p>
                  </div>
                )}
              </div>

              {isAdmin && (
                <DialogFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const p = viewing;
                      setViewing(null);
                      openEdit(p);
                    }}
                    className="gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit / Create dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit provider" : "New provider"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="pv-name">Provider name *</Label>
              <Input
                id="pv-name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. Westside Pathology"
              />
            </div>

            <ServiceListEditor
              label="Services provided"
              placeholder="Add a service and press Enter"
              items={draft.servicesProvided}
              onChange={(items) => setDraft({ ...draft, servicesProvided: items })}
              tone="positive"
            />

            <ServiceListEditor
              label="Services not provided"
              placeholder="Add a service they do not offer"
              items={draft.servicesNotProvided}
              onChange={(items) => setDraft({ ...draft, servicesNotProvided: items })}
              tone="negative"
            />

            <div className="space-y-1.5">
              <Label htmlFor="pv-note">Special note</Label>
              <Textarea
                id="pv-note"
                value={draft.specialNote ?? ""}
                onChange={(e) => setDraft({ ...draft, specialNote: e.target.value })}
                placeholder="Anything the team should know — billing, hours, referral quirks..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editing ? "Save changes" : "Add provider"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this provider?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the provider and their services from the list for everyone.
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
