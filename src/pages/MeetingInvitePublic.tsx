import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CheckCircle2, AlertTriangle, Clock, Info } from "lucide-react";
import { toast } from "sonner";
import {
  getInviteByToken,
  addRequest,
  isLinkActive,
  getRequests,
} from "@/data/meetingInviteStore";
import { MEETING_TYPE_LABELS } from "@/types/meetingSchedule";
import { MeetingInviteLink, MeetingRequest } from "@/types/meetingInvites";
import { APP_BRAND, APP_COLORS, APP_LOGOS } from "@/config/branding";

const MeetingInvitePublic = () => {
  const { token = "" } = useParams();
  const [link, setLink] = useState<MeetingInviteLink | undefined>();
  const [active, setActive] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    submitterName: "",
    submitterEmail: "",
    submitterOrganization: "",
    proposedTitle: "",
    proposedDate: format(new Date(), "yyyy-MM-dd"),
    proposedStartTime: "09:00",
    proposedEndTime: "10:00",
    proposedLocation: "",
    details: "",
  });
  const [promptAnswers, setPromptAnswers] = useState<string[]>([]);

  useEffect(() => {
    const l = getInviteByToken(token);
    setLink(l);
    if (l) {
      setActive(isLinkActive(l, getRequests()));
      setPromptAnswers(new Array(l.customPrompts.length).fill(""));
      setForm((f) => ({ ...f, proposedTitle: l.title }));
    }
  }, [token]);

  const expiresIn = useMemo(() => {
    if (!link) return "";
    return format(new Date(link.expiresAt), "PPp");
  }, [link]);

  const handleSubmit = () => {
    if (!link) return;
    if (!form.submitterName.trim() || !form.submitterEmail.trim()) {
      toast.error("Please enter your name and email");
      return;
    }
    const req: MeetingRequest = {
      id: `req-${Date.now()}`,
      inviteId: link.id,
      inviteToken: link.token,
      ...form,
      promptAnswers,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };
    addRequest(req);
    setSubmitted(true);
    toast.success("Meeting request submitted");
  };

  if (!link) {
    return (
      <BrandShell>
        <Card>
          <CardContent className="py-10 text-center space-y-3">
            <AlertTriangle className="w-10 h-10 mx-auto text-destructive opacity-70" />
            <h2 className="text-lg font-semibold">Invitation not found</h2>
            <p className="text-sm text-muted-foreground">
              This meeting invitation link is invalid or has been removed.
            </p>
          </CardContent>
        </Card>
      </BrandShell>
    );
  }

  if (!active) {
    return (
      <BrandShell>
        <Card>
          <CardContent className="py-10 text-center space-y-3">
            <Clock className="w-10 h-10 mx-auto text-muted-foreground opacity-70" />
            <h2 className="text-lg font-semibold">This invitation has expired</h2>
            <p className="text-sm text-muted-foreground">
              Please contact the practice directly to arrange a meeting.
            </p>
          </CardContent>
        </Card>
      </BrandShell>
    );
  }

  if (submitted) {
    return (
      <BrandShell>
        <Card>
          <CardContent className="py-10 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 mx-auto" style={{ color: APP_COLORS.primary }} />
            <h2 className="text-lg font-semibold">Request submitted</h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Thank you. The practice manager will review your request and confirm by email.
            </p>
          </CardContent>
        </Card>
      </BrandShell>
    );
  }

  return (
    <BrandShell>
      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="space-y-2">
            <Badge variant="outline" className="text-[10px]">
              {MEETING_TYPE_LABELS[link.meetingType]}
            </Badge>
            <h1 className="text-xl font-semibold">{link.title}</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> Link expires {expiresIn}
            </p>
          </div>

          {link.instructions && (
            <div className="rounded-lg border bg-muted/30 p-3 flex gap-2">
              <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: APP_COLORS.primary }} />
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{link.instructions}</p>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your details</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full name *">
                <Input value={form.submitterName} onChange={(e) => setForm({ ...form, submitterName: e.target.value })} />
              </Field>
              <Field label="Email *">
                <Input type="email" value={form.submitterEmail} onChange={(e) => setForm({ ...form, submitterEmail: e.target.value })} />
              </Field>
            </div>
            <Field label="Organization">
              <Input value={form.submitterOrganization} onChange={(e) => setForm({ ...form, submitterOrganization: e.target.value })} />
            </Field>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Proposed meeting</h3>
            <Field label="Meeting title">
              <Input value={form.proposedTitle} onChange={(e) => setForm({ ...form, proposedTitle: e.target.value })} />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Date">
                <Input type="date" value={form.proposedDate} onChange={(e) => setForm({ ...form, proposedDate: e.target.value })} />
              </Field>
              <Field label="Start">
                <Input type="time" value={form.proposedStartTime} onChange={(e) => setForm({ ...form, proposedStartTime: e.target.value })} />
              </Field>
              <Field label="End">
                <Input type="time" value={form.proposedEndTime} onChange={(e) => setForm({ ...form, proposedEndTime: e.target.value })} />
              </Field>
            </div>
            <Field label="Preferred location">
              <Input value={form.proposedLocation} onChange={(e) => setForm({ ...form, proposedLocation: e.target.value })} placeholder="e.g. On-site, Teams, Zoom" />
            </Field>
            <Field label="Details / agenda">
              <Textarea
                value={form.details}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
                className="min-h-[90px] resize-none"
                placeholder="Topics, attendees, anything the practice should know"
              />
            </Field>
          </div>

          {link.customPrompts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Additional information</h3>
              {link.customPrompts.map((p, i) => (
                <Field key={i} label={p}>
                  <Textarea
                    value={promptAnswers[i] ?? ""}
                    onChange={(e) => {
                      const next = [...promptAnswers];
                      next[i] = e.target.value;
                      setPromptAnswers(next);
                    }}
                    className="min-h-[60px] resize-none"
                  />
                </Field>
              ))}
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            style={{ backgroundColor: APP_COLORS.primary }}
          >
            Submit meeting request
          </Button>
        </CardContent>
      </Card>
    </BrandShell>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs">{label}</Label>
    {children}
  </div>
);

const BrandShell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-muted/30">
    <header
      className="px-6 py-4 border-b bg-background flex items-center gap-3"
      style={{ borderBottomColor: APP_COLORS.primary, borderBottomWidth: 3 }}
    >
      <img src={APP_LOGOS.icon} alt={APP_BRAND.name} className="h-8 w-8" onError={(e) => ((e.currentTarget.style.display = "none"))} />
      <div>
        <div className="font-semibold text-sm" style={{ color: APP_COLORS.primary }}>{APP_BRAND.name}</div>
        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
          <CalendarDays className="w-3 h-3" /> Meeting Invitation
        </div>
      </div>
    </header>
    <main className="max-w-2xl mx-auto px-4 py-8">{children}</main>
    <footer className="text-center text-[11px] text-muted-foreground py-6">
      Powered by {APP_BRAND.name}
    </footer>
  </div>
);

export default MeetingInvitePublic;
