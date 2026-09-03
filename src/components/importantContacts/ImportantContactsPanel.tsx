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
  Phone,
  Mail,
  Printer,
  Pencil,
  Trash2,
  Eye,
  Contact as ContactIcon,
  Sparkles,
  Upload,
} from "lucide-react";
import { importantContactsStore } from "@/data/importantContactsStore";
import { ImportantContact } from "@/types/importantContacts";
import { toast } from "sonner";

interface Props {
  isAdmin: boolean;
  onAIScan?: () => void;
}

const emptyDraft = (): ImportantContact => ({
  id: "",
  name: "",
  category: "",
  phone: "",
  email: "",
  fax: "",
  description: "",
  createdAt: "",
  updatedAt: "",
});

export const ImportantContactsPanel = ({ isAdmin, onAIScan }: Props) => {
  const [contacts, setContacts] = useState<ImportantContact[]>(
    importantContactsStore.getAll(),
  );
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<ImportantContact | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewing, setViewing] = useState<ImportantContact | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ImportantContact>(emptyDraft());

  useEffect(() => {
    const unsub = importantContactsStore.subscribe(() =>
      setContacts([...importantContactsStore.getAll()]),
    );
    return () => {
      unsub();
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) =>
      [c.name, c.category ?? "", c.phone ?? "", c.email ?? "", c.fax ?? "", c.description ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [contacts, search]);

  const openNew = () => {
    setEditing(null);
    setDraft(emptyDraft());
    setDialogOpen(true);
  };

  const openEdit = (c: ImportantContact) => {
    setEditing(c);
    setDraft({ ...c });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!draft.name.trim()) {
      toast.error("Name is required");
      return;
    }
    const now = new Date().toISOString();
    if (editing) {
      importantContactsStore.update({ ...draft, updatedAt: now });
      toast.success("Contact updated");
    } else {
      importantContactsStore.add({
        ...draft,
        id: `ic-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: now,
        updatedAt: now,
      });
      toast.success("Contact added");
    }
    setDialogOpen(false);
    setEditing(null);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    importantContactsStore.remove(deleteId);
    setDeleteId(null);
    toast.success("Contact removed");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search contacts, services, numbers..."
          />
        </div>
        {isAdmin && (
          <Button onClick={openNew} className="gap-1.5 shrink-0">
            <Plus className="w-4 h-4" />
            New contact
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <ContactIcon className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium">No contacts found</p>
          <p className="text-xs text-muted-foreground mt-1">
            {search
              ? "Try a different search term."
              : isAdmin
                ? "Add the first important contact to get started."
                : "No contacts have been added yet."}
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((c) => (
            <Card
              key={c.id}
              className="group flex items-stretch gap-3 p-4 transition-all hover:shadow-sm hover:border-primary/40"
            >
              {/* Avatar / icon */}
              <div className="w-11 h-11 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <ContactIcon className="w-5 h-5" />
              </div>

              {/* Main details */}
              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-sm text-foreground truncate">
                    {c.name}
                  </h3>
                  {c.category && (
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                      {c.category}
                    </Badge>
                  )}
                </div>

                {c.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {c.description}
                  </p>
                )}

                <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-xs text-foreground/80 mt-0.5">
                  {c.phone && (
                    <a
                      href={`tel:${c.phone.replace(/\s+/g, "")}`}
                      className="inline-flex items-center gap-1.5 hover:text-primary"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                      {c.phone}
                    </a>
                  )}
                  {c.email && (
                    <a
                      href={`mailto:${c.email}`}
                      className="inline-flex items-center gap-1.5 hover:text-primary truncate max-w-[220px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                      {c.email}
                    </a>
                  )}
                  {c.fax && (
                    <span className="inline-flex items-center gap-1.5">
                      <Printer className="w-3.5 h-3.5 text-muted-foreground" />
                      {c.fax}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-start gap-0.5 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewing(c)}
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
                      onClick={() => openEdit(c)}
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(c.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
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
        <DialogContent className="sm:max-w-lg">
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
              {viewing.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {viewing.description}
                </p>
              )}
              <div className="space-y-2 pt-2 border-t border-border">
                {viewing.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a href={`tel:${viewing.phone.replace(/\s+/g, "")}`} className="hover:text-primary">
                      {viewing.phone}
                    </a>
                  </div>
                )}
                {viewing.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${viewing.email}`} className="hover:text-primary break-all">
                      {viewing.email}
                    </a>
                  </div>
                )}
                {viewing.fax && (
                  <div className="flex items-center gap-2 text-sm">
                    <Printer className="w-4 h-4 text-muted-foreground" />
                    {viewing.fax}
                  </div>
                )}
              </div>
              {isAdmin && (
                <DialogFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const c = viewing;
                      setViewing(null);
                      openEdit(c);
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit contact" : "New contact"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="ic-name">Name / Service *</Label>
              <Input
                id="ic-name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. After-Hours Locum Service"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ic-category">Category</Label>
              <Input
                id="ic-category"
                value={draft.category ?? ""}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                placeholder="e.g. Clinical, IT, Facilities"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ic-phone">Phone</Label>
                <Input
                  id="ic-phone"
                  value={draft.phone ?? ""}
                  onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                  placeholder="(02) 1234 5678"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ic-fax">Fax</Label>
                <Input
                  id="ic-fax"
                  value={draft.fax ?? ""}
                  onChange={(e) => setDraft({ ...draft, fax: e.target.value })}
                  placeholder="(02) 1234 5679"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ic-email">Email</Label>
              <Input
                id="ic-email"
                type="email"
                value={draft.email ?? ""}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                placeholder="contact@service.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ic-desc">Description</Label>
              <Textarea
                id="ic-desc"
                value={draft.description ?? ""}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="Brief description of when to use this contact"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editing ? "Save changes" : "Add contact"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this contact?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the contact from the list for everyone.
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
