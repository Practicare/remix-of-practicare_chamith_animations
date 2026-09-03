import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Clock, Plus, Pencil, Trash2, Users, ChevronDown, DollarSign, Building2, Phone, Printer, Globe, Mail, MapPin, PhoneCall, CalendarOff, Calendar as CalendarIcon, Sparkles, Search, UserPlus, X } from "lucide-react";
import { PracticeContact, ClosedDate } from "@/types/aboutPractice";

import { aboutPracticeStore } from "@/data/aboutPracticeStore";
import { mockStaffMembers } from "@/data/mockStaff";
import { OpeningHour, PracticeService } from "@/types/aboutPractice";
import { toast } from "sonner";

const PRACTITIONER_ROLE_KEYWORDS = ["doctor", "gp", "nurse", "physio", "clinician", "practitioner"];

const isPractitioner = (role: string | undefined) => {
  if (!role) return false;
  const r = role.toLowerCase();
  return PRACTITIONER_ROLE_KEYWORDS.some((k) => r.includes(k));
};

interface PractitionerOption {
  id: string;
  name: string;
  custom?: boolean;
}

interface PractitionerSelectProps {
  value: string[];
  onChange: (ids: string[]) => void;
  practitioners: PractitionerOption[];
  onAddProvider?: (name: string) => string | undefined;
  onRemoveProvider?: (id: string) => void;
}

const PractitionerSelect = ({ value, onChange, practitioners, onAddProvider, onRemoveProvider }: PractitionerSelectProps) => {
  const [query, setQuery] = useState("");
  const allSelected = value.length === 0 || value.length === practitioners.length;
  const label =
    value.length === 0 || value.length === practitioners.length
      ? "All practitioners"
      : `${value.length} selected`;

  const toggle = (id: string) => {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
  };

  const toggleAll = () => {
    if (allSelected) onChange(practitioners.map((p) => p.id).slice(0, 0));
    else onChange([]);
  };

  const q = query.trim().toLowerCase();
  const filtered = q
    ? practitioners.filter((p) => p.name.toLowerCase().includes(q))
    : practitioners;
  const exactExists = practitioners.some((p) => p.name.toLowerCase() === q);
  const canAdd = !!onAddProvider && q.length > 0 && !exactExists;

  const handleAdd = () => {
    if (!canAdd) return;
    const newId = onAddProvider?.(query.trim());
    if (newId) {
      onChange([...value.filter((v) => v !== newId), newId]);
    }
    setQuery("");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" type="button" className="w-full justify-between font-normal">
          <span className="flex items-center gap-1.5 truncate">
            <Users className="w-3.5 h-3.5 text-muted-foreground" />
            {label}
          </span>
          <ChevronDown className="w-3.5 h-3.5 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <div className="p-2 border-b border-border space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canAdd) {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              placeholder="Search or add provider…"
              className="h-8 pl-7 text-sm"
            />
          </div>
          {canAdd && (
            <button
              type="button"
              onClick={handleAdd}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-muted text-sm text-left text-primary"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="truncate">Add "{query.trim()}"</span>
            </button>
          )}
          {!q && (
            <button
              type="button"
              onClick={toggleAll}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-muted text-sm"
            >
              <Checkbox checked={allSelected} />
              <span className="font-medium">Select all</span>
            </button>
          )}
        </div>
        <div className="max-h-64 overflow-y-auto p-1">
          {filtered.map((p) => {
            const checked = value.includes(p.id);
            return (
              <div
                key={p.id}
                className="group flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-muted text-sm"
              >
                <button
                  type="button"
                  onClick={() => toggle(p.id)}
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  <Checkbox checked={checked} />
                  <span className="truncate">{p.name}</span>
                  {p.custom && (
                    <Badge variant="outline" className="ml-1 font-normal text-[10px] py-0 px-1.5">
                      Custom
                    </Badge>
                  )}
                </button>
                {p.custom && onRemoveProvider && (
                  <button
                    type="button"
                    onClick={() => onRemoveProvider(p.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                    title="Remove provider"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && !canAdd && (
            <div className="px-2 py-3 text-xs text-muted-foreground text-center">
              No practitioners found
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const AboutPracticePanel = ({ isAdmin }: { isAdmin: boolean }) => {
  const [state, setState] = useState(aboutPracticeStore.get());
  const [hoursDraft, setHoursDraft] = useState<OpeningHour[]>(state.openingHours);
  const [editingHours, setEditingHours] = useState(false);

  const [contactDraft, setContactDraft] = useState<PracticeContact>(state.contact);
  const [editingContact, setEditingContact] = useState(false);

  const [serviceDialog, setServiceDialog] = useState(false);
  const [editing, setEditing] = useState<PracticeService | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [closedDialog, setClosedDialog] = useState(false);
  const [editingClosed, setEditingClosed] = useState<ClosedDate | null>(null);
  const [deleteClosedId, setDeleteClosedId] = useState<string | null>(null);
  const [closedForm, setClosedForm] = useState<ClosedDate>({
    id: "",
    date: "",
    endDate: "",
    allDay: true,
    open: "09:00",
    close: "17:00",
    reason: "",
  });

  

  const [form, setForm] = useState<PracticeService>({
    id: "",
    name: "",
    price: "",
    practitionerIds: [],
    pricingMode: "flat",
    practitionerPrices: {},
    notes: "",
  });

  useEffect(() => {
    const unsub = aboutPracticeStore.subscribe(() => {
      const s = aboutPracticeStore.get();
      setState(s);
      setHoursDraft(s.openingHours);
      setContactDraft(s.contact);
    });
    return () => {
      unsub();
    };
  }, []);

  const staffPractitioners = useMemo(
    () =>
      mockStaffMembers
        .filter((s) => isPractitioner(s.role))
        .map((s) => ({ id: s.id, name: `${s.firstName} ${s.lastName}`.trim() || s.email, custom: false as const })),
    [],
  );

  const practitioners = useMemo<PractitionerOption[]>(
    () => [
      ...staffPractitioners,
      ...state.customProviders.map((p) => ({ id: p.id, name: p.name, custom: true as const })),
    ],
    [staffPractitioners, state.customProviders],
  );

  const practitionerNameById = useMemo(() => {
    const map = new Map<string, string>();
    practitioners.forEach((p) => map.set(p.id, p.name));
    return map;
  }, [practitioners]);

  const handleAddProvider = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return undefined;
    const existing = practitioners.find((p) => p.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing.id;
    const id = `cust-${Date.now()}`;
    aboutPracticeStore.addCustomProvider({ id, name: trimmed });
    toast.success(`Added ${trimmed}`);
    return id;
  };

  const handleRemoveProvider = (id: string) => {
    aboutPracticeStore.removeCustomProvider(id);
    toast.success("Provider removed");
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ id: "", name: "", price: "", practitionerIds: [], pricingMode: "flat", practitionerPrices: {}, notes: "" });
    setServiceDialog(true);
  };

  const openEdit = (s: PracticeService) => {
    setEditing(s);
    setForm({ pricingMode: "flat", practitionerPrices: {}, ...s });
    setServiceDialog(true);
  };

  const saveService = () => {
    if (!form.name.trim()) {
      toast.error("Service name is required");
      return;
    }
    if (editing) {
      aboutPracticeStore.updateService({ ...form, id: editing.id });
      toast.success("Service updated");
    } else {
      aboutPracticeStore.addService({ ...form, id: `svc-${Date.now()}` });
      toast.success("Service added");
    }
    setServiceDialog(false);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    aboutPracticeStore.removeService(deleteId);
    setDeleteId(null);
    toast.success("Service removed");
  };

  const updateHourRow = (idx: number, patch: Partial<OpeningHour>) => {
    setHoursDraft((rows) => rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const saveHours = () => {
    aboutPracticeStore.setHours(hoursDraft);
    setEditingHours(false);
    toast.success("Opening hours saved");
  };

  const cancelHours = () => {
    setHoursDraft(state.openingHours);
    setEditingHours(false);
  };

  const saveContact = () => {
    aboutPracticeStore.setContact(contactDraft);
    setEditingContact(false);
    toast.success("Contact details saved");
  };

  const cancelContact = () => {
    setContactDraft(state.contact);
    setEditingContact(false);
  };

  const contactFields: { key: keyof PracticeContact; label: string; icon: typeof Phone; placeholder: string; type?: string }[] = [
    { key: "phone", label: "Phone", icon: Phone, placeholder: "(03) 9123 4567", type: "tel" },
    { key: "afterHoursPhone", label: "After-hours", icon: PhoneCall, placeholder: "13 74 25", type: "tel" },
    { key: "fax", label: "Fax", icon: Printer, placeholder: "(03) 9123 4568", type: "tel" },
    { key: "email", label: "Email", icon: Mail, placeholder: "reception@practice.com.au", type: "email" },
    { key: "website", label: "Website", icon: Globe, placeholder: "https://www.practice.com.au", type: "url" },
    { key: "address", label: "Address", icon: MapPin, placeholder: "123 Main Street, Melbourne VIC 3000" },
  ];

  return (
    <div className="space-y-6">

      {/* Contact Details */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" />
            <h2 className="font-semibold">Contact details</h2>
          </div>
          {isAdmin && !editingContact && (
            <Button size="sm" variant="outline" onClick={() => setEditingContact(true)} className="gap-1.5">
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Button>
          )}
          {isAdmin && editingContact && (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={cancelContact}>Cancel</Button>
              <Button size="sm" onClick={saveContact}>Save</Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {contactFields.map(({ key, label, icon: Icon, placeholder, type }) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Label>
              {editingContact ? (
                <Input
                  type={type ?? "text"}
                  value={contactDraft[key]}
                  onChange={(e) => setContactDraft({ ...contactDraft, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="h-9"
                />
              ) : state.contact[key] ? (
                key === "website" ? (
                  <a
                    href={state.contact[key]}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary hover:underline break-all"
                  >
                    {state.contact[key]}
                  </a>
                ) : key === "email" ? (
                  <a
                    href={`mailto:${state.contact[key]}`}
                    className="text-sm text-primary hover:underline break-all"
                  >
                    {state.contact[key]}
                  </a>
                ) : key === "phone" || key === "afterHoursPhone" || key === "fax" ? (
                  <a
                    href={`tel:${state.contact[key].replace(/\s/g, "")}`}
                    className="text-sm hover:underline"
                  >
                    {state.contact[key]}
                  </a>
                ) : (
                  <p className="text-sm">{state.contact[key]}</p>
                )
              ) : (
                <p className="text-sm text-muted-foreground italic">Not set</p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Opening Hours */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <h2 className="font-semibold">Opening hours</h2>
          </div>
          {isAdmin && !editingHours && (
            <Button size="sm" variant="outline" onClick={() => setEditingHours(true)} className="gap-1.5">
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Button>
          )}
          {isAdmin && editingHours && (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={cancelHours}>
                Cancel
              </Button>
              <Button size="sm" onClick={saveHours}>
                Save
              </Button>
            </div>
          )}
        </div>

        <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
          {hoursDraft.map((h, idx) => (
            <div
              key={h.day}
              className="grid grid-cols-[120px_1fr] sm:grid-cols-[140px_1fr_auto] items-center gap-3 px-4 py-2.5 text-sm"
            >
              <span className="font-medium">{h.day}</span>
              {editingHours ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <Input
                    type="time"
                    value={h.open}
                    onChange={(e) => updateHourRow(idx, { open: e.target.value })}
                    disabled={h.closed}
                    className="h-8 w-28"
                  />
                  <span className="text-muted-foreground">–</span>
                  <Input
                    type="time"
                    value={h.close}
                    onChange={(e) => updateHourRow(idx, { close: e.target.value })}
                    disabled={h.closed}
                    className="h-8 w-28"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground ml-2">
                    <Checkbox
                      checked={h.closed}
                      onCheckedChange={(c) => updateHourRow(idx, { closed: !!c })}
                    />
                    Closed
                  </label>
                </div>
              ) : (
                <span className={h.closed ? "text-muted-foreground italic" : ""}>
                  {h.closed ? "Closed" : `${h.open} – ${h.close}`}
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Closed Dates */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarOff className="w-4 h-4 text-primary" />
            <h2 className="font-semibold">Closed dates &amp; special hours</h2>
          </div>
          {isAdmin && (
            <Button
              size="sm"
              onClick={() => {
                setEditingClosed(null);
                setClosedForm({
                  id: "",
                  date: "",
                  endDate: "",
                  allDay: true,
                  open: "09:00",
                  close: "17:00",
                  reason: "",
                });
                setClosedDialog(true);
              }}
              className="gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add date
            </Button>
          )}
        </div>

        {state.closedDates.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No closed dates yet.
          </div>
        ) : (
          <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
            {state.closedDates.map((c) => {
              const dateLabel = (() => {
                const fmt = (d: string) =>
                  new Date(d + "T00:00:00").toLocaleDateString(undefined, {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });
                return c.endDate && c.endDate !== c.date
                  ? `${fmt(c.date)} – ${fmt(c.endDate)}`
                  : fmt(c.date);
              })();
              return (
                <div
                  key={c.id}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm"
                >
                  <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{dateLabel}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.allDay ? "Closed all day" : `Open ${c.open} – ${c.close}`}
                      {c.reason ? ` · ${c.reason}` : ""}
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditingClosed(c);
                          setClosedForm({
                            ...c,
                            endDate: c.endDate ?? "",
                            open: c.open ?? "09:00",
                            close: c.close ?? "17:00",
                            reason: c.reason ?? "",
                          });
                          setClosedDialog(true);
                        }}
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteClosedId(c.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Services & Prices */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <h2 className="font-semibold">Services &amp; prices</h2>
          </div>
          {isAdmin && (
            <Button size="sm" onClick={openCreate} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Add new
            </Button>
          )}
        </div>

        {state.services.length === 0 ? (
          <div className="text-center py-10 text-sm text-muted-foreground">
            No services yet.
          </div>
        ) : (
          <div className="space-y-2">
            {state.services.map((s) => {
              const all =
                s.practitionerIds.length === 0 ||
                s.practitionerIds.length === practitioners.length;
              const isPerPract = s.pricingMode === "per-practitioner";
              const displayIds = all ? practitioners.map((p) => p.id) : s.practitionerIds;
              const perPriceNums = isPerPract
                ? Object.values(s.practitionerPrices ?? {})
                    .map((v) => parseFloat(v.replace(/^\$/, "").trim()))
                    .filter((n) => !isNaN(n))
                : [];
              const priceLabel = isPerPract
                ? perPriceNums.length === 0
                  ? "Varies"
                  : (() => {
                      const min = Math.min(...perPriceNums);
                      const max = Math.max(...perPriceNums);
                      return min === max ? `$${min}` : `$${min} – $${max}`;
                    })()
                : s.price || "—";

              return (
                <div
                  key={s.id}
                  className="border border-border rounded-lg p-4 bg-card hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate">{s.name}</h3>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-0.5 font-medium text-foreground">
                          <DollarSign className="w-3 h-3" />
                          {priceLabel.replace(/^\$/, "")}
                        </span>
                        {isPerPract && (
                          <Badge variant="outline" className="font-normal text-[10px] py-0 px-1.5">
                            per practitioner
                          </Badge>
                        )}
                        <span>·</span>
                        <span>
                          {all
                            ? `All practitioners (${practitioners.length})`
                            : `${displayIds.length} practitioner${displayIds.length === 1 ? "" : "s"}`}
                        </span>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(s)}
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(s.id)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {isPerPract ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                      {displayIds.map((id) => {
                        const name = practitionerNameById.get(id) ?? "Unknown";
                        const price = s.practitionerPrices?.[id]?.trim();
                        return (
                          <div
                            key={id}
                            className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/30 px-2.5 py-1.5 text-xs"
                          >
                            <span className="truncate">{name}</span>
                            <span className="font-medium text-foreground shrink-0">
                              {price ? price.replace(/^\$?/, "$") : <span className="text-muted-foreground italic">—</span>}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {all ? (
                        <Badge variant="secondary" className="font-normal">
                          <Users className="w-3 h-3 mr-1" />
                          All practitioners
                        </Badge>
                      ) : (
                        displayIds.map((id) => (
                          <Badge key={id} variant="secondary" className="font-normal">
                            {practitionerNameById.get(id) ?? "Unknown"}
                          </Badge>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Service dialog */}
      <Dialog open={serviceDialog} onOpenChange={setServiceDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit service" : "Add service"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Service name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Standard consultation"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Practitioners</Label>
              <PractitionerSelect
                value={form.practitionerIds}
                onChange={(ids) => setForm({ ...form, practitionerIds: ids })}
                practitioners={practitioners}
                onAddProvider={handleAddProvider}
                onRemoveProvider={handleRemoveProvider}
              />
              <p className="text-[11px] text-muted-foreground">
                Leave empty or Select all to apply to all practitioners.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Pricing</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, pricingMode: "flat" })}
                  className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                    (form.pricingMode ?? "flat") === "flat"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="font-medium text-sm">Same for all</div>
                  <div className="text-muted-foreground">Practice-level price</div>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, pricingMode: "per-practitioner" })}
                  className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                    form.pricingMode === "per-practitioner"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="font-medium text-sm">Per practitioner</div>
                  <div className="text-muted-foreground">Different price each</div>
                </button>
              </div>
            </div>

            {(form.pricingMode ?? "flat") === "flat" ? (
              <div className="space-y-1.5">
                <Label>Price</Label>
                <Input
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="e.g. $85"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Price per practitioner</Label>
                {(() => {
                  const targetIds =
                    form.practitionerIds.length === 0
                      ? practitioners.map((p) => p.id)
                      : form.practitionerIds;
                  if (targetIds.length === 0) {
                    return (
                      <p className="text-xs text-muted-foreground">
                        No practitioners available.
                      </p>
                    );
                  }
                  return (
                    <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                      {targetIds.map((id) => {
                        const name = practitionerNameById.get(id) ?? "Unknown";
                        const val = form.practitionerPrices?.[id] ?? "";
                        return (
                          <div key={id} className="flex items-center gap-2">
                            <div className="flex-1 text-sm truncate">{name}</div>
                            <Input
                              className="w-32 h-8"
                              value={val}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  practitionerPrices: {
                                    ...(form.practitionerPrices ?? {}),
                                    [id]: e.target.value,
                                  },
                                })
                              }
                              placeholder="$0"
                            />
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
                <p className="text-[11px] text-muted-foreground">
                  Leave blank for any practitioner whose price is not set.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setServiceDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveService}>{editing ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this service?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Closed date dialog */}
      <Dialog open={closedDialog} onOpenChange={setClosedDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingClosed ? "Edit closed date" : "Add closed date"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start date</Label>
                <Input
                  type="date"
                  value={closedForm.date}
                  onChange={(e) => setClosedForm({ ...closedForm, date: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>End date <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  type="date"
                  value={closedForm.endDate ?? ""}
                  onChange={(e) => setClosedForm({ ...closedForm, endDate: e.target.value })}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={closedForm.allDay}
                onCheckedChange={(c) => setClosedForm({ ...closedForm, allDay: !!c })}
              />
              Closed all day
            </label>

            {!closedForm.allDay && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Closed from</Label>
                  <Input
                    type="time"
                    value={closedForm.open ?? ""}
                    onChange={(e) => setClosedForm({ ...closedForm, open: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Closed to</Label>
                  <Input
                    type="time"
                    value={closedForm.close ?? ""}
                    onChange={(e) => setClosedForm({ ...closedForm, close: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Reason <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input
                value={closedForm.reason ?? ""}
                onChange={(e) => setClosedForm({ ...closedForm, reason: e.target.value })}
                placeholder="e.g. Christmas Day, Staff training"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClosedDialog(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!closedForm.date) {
                  toast.error("Date is required");
                  return;
                }
                const payload: ClosedDate = {
                  ...closedForm,
                  endDate: closedForm.endDate || undefined,
                  open: closedForm.allDay ? undefined : closedForm.open,
                  close: closedForm.allDay ? undefined : closedForm.close,
                  reason: closedForm.reason?.trim() || undefined,
                };
                if (editingClosed) {
                  aboutPracticeStore.updateClosedDate({ ...payload, id: editingClosed.id });
                  toast.success("Closed date updated");
                } else {
                  aboutPracticeStore.addClosedDate({ ...payload, id: `cd-${Date.now()}` });
                  toast.success("Closed date added");
                }
                setClosedDialog(false);
              }}
            >
              {editingClosed ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteClosedId} onOpenChange={(o) => !o && setDeleteClosedId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this closed date?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteClosedId) {
                  aboutPracticeStore.removeClosedDate(deleteClosedId);
                  toast.success("Closed date removed");
                  setDeleteClosedId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      
    </div>
  );
};
