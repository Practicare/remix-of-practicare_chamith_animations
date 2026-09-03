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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Sparkles,
  Loader2,
  Globe,
  Upload,
  FileText,
  CheckCircle,
  X,
  Phone,
  Mail,
  Clock,
  Building2,
  CalendarOff,
} from "lucide-react";
import { toast } from "sonner";
import { aboutPracticeStore } from "@/data/aboutPracticeStore";
import {
  AboutPractice,
  ClosedDate,
  OpeningHour,
  PracticeContact,
  PracticeService,
} from "@/types/aboutPractice";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Extracted = {
  contact?: Partial<PracticeContact>;
  openingHours?: OpeningHour[];
  services?: PracticeService[];
  closedDates?: ClosedDate[];
};

// Mock AI extraction — would call an AI gateway with the URL or document text in production.
const mockExtract = (source: string): Extracted => {
  const host = (() => {
    try {
      return new URL(source).hostname.replace(/^www\./, "");
    } catch {
      return source.toLowerCase().includes("practice") ? "yourpractice.com.au" : "newpractice.com.au";
    }
  })();
  const brand = host.split(".")[0].replace(/[-_]/g, " ");
  const titled = brand.replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    contact: {
      phone: "(02) 8123 9000",
      afterHoursPhone: "13 74 25",
      fax: "(02) 8123 9001",
      email: `reception@${host}`,
      website: `https://www.${host}`,
      address: `45 ${titled} Avenue, Sydney NSW 2000`,
    },
    openingHours: [
      { day: "Monday", open: "08:00", close: "18:00", closed: false },
      { day: "Tuesday", open: "08:00", close: "18:00", closed: false },
      { day: "Wednesday", open: "08:00", close: "18:00", closed: false },
      { day: "Thursday", open: "08:00", close: "20:00", closed: false },
      { day: "Friday", open: "08:00", close: "18:00", closed: false },
      { day: "Saturday", open: "09:00", close: "14:00", closed: false },
      { day: "Sunday", open: "", close: "", closed: true },
    ],
    services: [
      { id: `ai-${Date.now()}-1`, name: "Standard consultation", price: "$90", practitionerIds: [] },
      { id: `ai-${Date.now()}-2`, name: "Long consultation", price: "$150", practitionerIds: [] },
      { id: `ai-${Date.now()}-3`, name: "Telehealth consultation", price: "$75", practitionerIds: [] },
      { id: `ai-${Date.now()}-4`, name: "Skin check", price: "$130", practitionerIds: [] },
      { id: `ai-${Date.now()}-5`, name: "Travel vaccination", price: "$60", practitionerIds: [] },
    ],
    closedDates: [
      { id: `ai-cd-${Date.now()}-1`, date: "2026-12-25", allDay: true, reason: "Christmas Day" },
      { id: `ai-cd-${Date.now()}-2`, date: "2026-12-26", allDay: true, reason: "Boxing Day" },
      { id: `ai-cd-${Date.now()}-3`, date: "2027-01-01", allDay: true, reason: "New Year's Day" },
    ],
  };
};

export const AboutPracticeAIScanDialog = ({ open, onOpenChange }: Props) => {
  const [mode, setMode] = useState<"url" | "upload">("url");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [extracted, setExtracted] = useState<Extracted | null>(null);
  const [pick, setPick] = useState({ contact: true, hours: true, services: true, closed: true });
  const fileInput = useRef<HTMLInputElement>(null);

  const reset = () => {
    setUrl("");
    setFile(null);
    setExtracted(null);
    setLoading(false);
    setPick({ contact: true, hours: true, services: true, closed: true });
  };

  const handleClose = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };

  const runScan = async () => {
    const source = mode === "url" ? url.trim() : file?.name ?? "";
    if (mode === "url" && !source) {
      toast.error("Enter a website URL");
      return;
    }
    if (mode === "upload" && !file) {
      toast.error("Upload a document");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setExtracted(mockExtract(source));
    setLoading(false);
  };

  const applyAll = () => {
    if (!extracted) return;
    if (pick.contact && extracted.contact) {
      const current = aboutPracticeStore.get().contact;
      aboutPracticeStore.setContact({ ...current, ...extracted.contact } as PracticeContact);
    }
    if (pick.hours && extracted.openingHours) {
      aboutPracticeStore.setHours(extracted.openingHours);
    }
    if (pick.services && extracted.services) {
      extracted.services.forEach((s) => aboutPracticeStore.addService(s));
    }
    if (pick.closed && extracted.closedDates) {
      extracted.closedDates.forEach((c) => aboutPracticeStore.addClosedDate(c));
    }
    toast.success("Practice details applied");
    handleClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="relative">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            AI Scan — About the Practice
          </DialogTitle>
          <DialogDescription>
            Paste a website URL or upload a document (PDF, brochure, info sheet). AI will extract
            contact details, opening hours, services and closed dates.
          </DialogDescription>
        </DialogHeader>

        {!extracted && (
          <div className="space-y-4">
            <Tabs value={mode} onValueChange={(v) => setMode(v as "url" | "upload")}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="url" className="gap-1.5">
                  <Globe className="w-4 h-4" />
                  From website
                </TabsTrigger>
                <TabsTrigger value="upload" className="gap-1.5">
                  <Upload className="w-4 h-4" />
                  Upload document
                </TabsTrigger>
              </TabsList>

              <TabsContent value="url" className="space-y-2 mt-4">
                <Label>Practice website URL</Label>
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.yourpractice.com.au"
                />
                <p className="text-xs text-muted-foreground">
                  AI will visit the page and extract contact, hours, services and closed dates.
                </p>
              </TabsContent>

              <TabsContent value="upload" className="space-y-2 mt-4">
                <Label>Practice information document</Label>
                <input
                  ref={fileInput}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                {file ? (
                  <Card className="p-3 flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setFile(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </Card>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    className="w-full border-2 border-dashed border-border hover:border-primary rounded-lg p-6 text-center transition-colors"
                  >
                    <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium">Click to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, Word, image or text file
                    </p>
                  </button>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {extracted && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-primary">
              <CheckCircle className="w-4 h-4" />
              Extracted — review and apply
            </div>

            {extracted.contact && (
              <ExtractedSection
                icon={Phone}
                title="Contact details"
                checked={pick.contact}
                onToggle={() => setPick({ ...pick, contact: !pick.contact })}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  {extracted.contact.phone && (
                    <Field icon={Phone} label="Phone" value={extracted.contact.phone} />
                  )}
                  {extracted.contact.fax && (
                    <Field label="Fax" value={extracted.contact.fax} />
                  )}
                  {extracted.contact.email && (
                    <Field icon={Mail} label="Email" value={extracted.contact.email} />
                  )}
                  {extracted.contact.website && (
                    <Field icon={Globe} label="Website" value={extracted.contact.website} />
                  )}
                  {extracted.contact.address && (
                    <div className="col-span-full">
                      <Field label="Address" value={extracted.contact.address} />
                    </div>
                  )}
                </div>
              </ExtractedSection>
            )}

            {extracted.openingHours && (
              <ExtractedSection
                icon={Clock}
                title={`Opening hours (${extracted.openingHours.length})`}
                checked={pick.hours}
                onToggle={() => setPick({ ...pick, hours: !pick.hours })}
              >
                <div className="text-sm space-y-0.5">
                  {extracted.openingHours.map((h) => (
                    <div key={h.day} className="flex justify-between">
                      <span className="font-medium">{h.day}</span>
                      <span className="text-muted-foreground">
                        {h.closed ? "Closed" : `${h.open} – ${h.close}`}
                      </span>
                    </div>
                  ))}
                </div>
              </ExtractedSection>
            )}

            {extracted.services && extracted.services.length > 0 && (
              <ExtractedSection
                icon={Building2}
                title={`Services (${extracted.services.length})`}
                checked={pick.services}
                onToggle={() => setPick({ ...pick, services: !pick.services })}
              >
                <div className="flex flex-wrap gap-1.5">
                  {extracted.services.map((s) => (
                    <Badge key={s.id} variant="secondary" className="font-normal">
                      {s.name} · {s.price}
                    </Badge>
                  ))}
                </div>
              </ExtractedSection>
            )}

            {extracted.closedDates && extracted.closedDates.length > 0 && (
              <ExtractedSection
                icon={CalendarOff}
                title={`Closed dates (${extracted.closedDates.length})`}
                checked={pick.closed}
                onToggle={() => setPick({ ...pick, closed: !pick.closed })}
              >
                <div className="text-sm space-y-0.5">
                  {extracted.closedDates.map((c) => (
                    <div key={c.id} className="flex justify-between">
                      <span>{c.date}</span>
                      <span className="text-muted-foreground">{c.reason ?? "Closed"}</span>
                    </div>
                  ))}
                </div>
              </ExtractedSection>
            )}
          </div>
        )}

        <DialogFooter>
          {!extracted ? (
            <>
              <Button variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button onClick={runScan} disabled={loading} className="gap-1.5">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Scanning…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Run AI Scan
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setExtracted(null)}>
                Scan again
              </Button>
              <Button onClick={applyAll} className="gap-1.5">
                <CheckCircle className="w-4 h-4" />
                Apply selected
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ExtractedSection = ({
  icon: Icon,
  title,
  checked,
  onToggle,
  children,
}: {
  icon: typeof Phone;
  title: string;
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) => (
  <Card className={`p-3 ${checked ? "border-primary/40" : "opacity-60"}`}>
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-2 w-full text-left mb-2"
    >
      <input type="checkbox" checked={checked} readOnly className="rounded" />
      <Icon className="w-4 h-4 text-primary" />
      <span className="font-medium text-sm">{title}</span>
    </button>
    <div className="pl-6">{children}</div>
  </Card>
);

const Field = ({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof Phone;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-1.5 py-0.5">
    {Icon && <Icon className="w-3 h-3 text-muted-foreground" />}
    <span className="text-xs text-muted-foreground">{label}:</span>
    <span className="font-medium truncate">{value}</span>
  </div>
);
