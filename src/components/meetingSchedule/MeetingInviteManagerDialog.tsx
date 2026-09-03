import { useEffect, useMemo, useState } from "react";
import { format, addDays } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Link as LinkIcon, Plus, Trash2, X, Check, Clock, Mail, Building2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { MEETING_TYPE_LABELS, MeetingType, Meeting } from "@/types/meetingSchedule";
import { MeetingInviteLink, MeetingRequest } from "@/types/meetingInvites";
import {
  getInviteLinks,
  upsertInviteLink,
  deleteInviteLink,
  getRequests,
  updateRequest,
  subscribeInviteStore,
  isLinkActive,
  generateToken,
} from "@/data/meetingInviteStore";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called when an external request is approved → create a meeting */
  onApproveRequest: (meeting: Meeting) => void;
}

export const MeetingInviteManagerDialog = ({ open, onOpenChange, onApproveRequest }: Props) => {
  const [links, setLinks] = useState<MeetingInviteLink[]>([]);
  const [requests, setRequests] = useState<MeetingRequest[]>([]);
  const [tab, setTab] = useState<"create" | "links" | "requests">("create");

  // Create form
  const [title, setTitle] = useState("");
  const [meetingType, setMeetingType] = useState<MeetingType>("medical_representative");
  const [instructions, setInstructions] = useState("Please confirm any dietary requirements if a meal is provided.");
  const [prompts, setPrompts] = useState<string[]>(["Dietary requirements (if applicable)"]);
  const [newPrompt, setNewPrompt] = useState("");
  const [expiresDays, setExpiresDays] = useState(14);
  const [singleUse, setSingleUse] = useState(false);

  const refresh = () => {
    setLinks(getInviteLinks());
    setRequests(getRequests());
  };

  useEffect(() => {
    refresh();
    return subscribeInviteStore(refresh);
  }, []);

  const pendingCount = useMemo(() => requests.filter((r) => r.status === "pending").length, [requests]);

  const resetForm = () => {
    setTitle("");
    setMeetingType("medical_representative");
    setInstructions("Please confirm any dietary requirements if a meal is provided.");
    setPrompts(["Dietary requirements (if applicable)"]);
    setNewPrompt("");
    setExpiresDays(14);
    setSingleUse(false);
  };

  const buildShareUrl = (token: string) =>
    `${window.location.origin}/meeting-invite/${token}`;

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error("Please add a title for the invitation");
      return;
    }
    const link: MeetingInviteLink = {
      id: `inv-${Date.now()}`,
      token: generateToken(),
      title: title.trim(),
      meetingType,
      instructions: instructions.trim() || undefined,
      customPrompts: prompts.filter((p) => p.trim()),
      expiresAt: addDays(new Date(), expiresDays).toISOString(),
      singleUse,
      createdAt: new Date().toISOString(),
    };
    upsertInviteLink(link);
    navigator.clipboard?.writeText(buildShareUrl(link.token)).catch(() => {});
    toast.success("Invite link created and copied to clipboard");
    resetForm();
    setTab("links");
  };

  const handleCopy = (token: string) => {
    navigator.clipboard?.writeText(buildShareUrl(token));
    toast.success("Link copied");
  };

  const handleRevoke = (id: string) => {
    const link = links.find((l) => l.id === id);
    if (!link) return;
    upsertInviteLink({ ...link, revoked: true });
    toast.success("Link revoked");
  };

  const handleDelete = (id: string) => {
    deleteInviteLink(id);
    toast.success("Link deleted");
  };

  const handleApprove = (req: MeetingRequest) => {
    const link = links.find((l) => l.id === req.inviteId);
    const meeting: Meeting = {
      id: `mtg-${Date.now()}`,
      title: req.proposedTitle,
      type: link?.meetingType ?? "other",
      date: new Date(req.proposedDate + "T00:00:00"),
      startTime: req.proposedStartTime,
      endTime: req.proposedEndTime,
      location: req.proposedLocation,
      presenter: req.submitterOrganization
        ? `${req.submitterName} (${req.submitterOrganization})`
        : req.submitterName,
      details: [
        req.details,
        req.promptAnswers.length
          ? "\n— Responses —\n" +
            (link?.customPrompts ?? [])
              .map((p, i) => `${p}: ${req.promptAnswers[i] ?? "—"}`)
              .join("\n")
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
      attendees: [],
      createdAt: new Date(),
    };
    onApproveRequest(meeting);
    updateRequest(req.id, { status: "approved", reviewedAt: new Date().toISOString(), meetingId: meeting.id });
    toast.success("Request approved and added to calendar");
  };

  const handleDecline = (req: MeetingRequest) => {
    updateRequest(req.id, { status: "declined", reviewedAt: new Date().toISOString() });
    toast.success("Request declined");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4" /> External Meeting Invitations
          </DialogTitle>
          <DialogDescription>
            Create Practicare-branded links so external parties can request meetings with the practice.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="links">Links ({links.length})</TabsTrigger>
            <TabsTrigger value="requests">
              Requests
              {pendingCount > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-4 text-[10px]">{pendingCount}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* CREATE */}
          <TabsContent value="create" className="space-y-3 pt-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Title shown to recipient</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Medical Representative Visit"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Meeting type</Label>
                <Select value={meetingType} onValueChange={(v) => setMeetingType(v as MeetingType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(MEETING_TYPE_LABELS) as MeetingType[]).map((t) => (
                      <SelectItem key={t} value={t}>{MEETING_TYPE_LABELS[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Link expires in (days)</Label>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={expiresDays}
                  onChange={(e) => setExpiresDays(Math.max(1, Number(e.target.value) || 1))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Instructions for the external party</Label>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="min-h-[70px] resize-none"
                placeholder="Any context, restrictions or requirements..."
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Custom questions they must answer</Label>
              <div className="space-y-1.5">
                {prompts.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={p}
                      onChange={(e) => {
                        const next = [...prompts];
                        next[i] = e.target.value;
                        setPrompts(next);
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setPrompts(prompts.filter((_, idx) => idx !== i))}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    placeholder="Add a question (e.g. Number of attendees)"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newPrompt.trim()) {
                        setPrompts([...prompts, newPrompt.trim()]);
                        setNewPrompt("");
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (newPrompt.trim()) {
                        setPrompts([...prompts, newPrompt.trim()]);
                        setNewPrompt("");
                      }
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={singleUse} onCheckedChange={(v) => setSingleUse(!!v)} />
              Single-use link (expires after one submission)
            </label>

            <Button className="w-full" onClick={handleCreate}>
              <LinkIcon className="w-4 h-4 mr-1.5" /> Generate invite link
            </Button>
          </TabsContent>

          {/* LINKS */}
          <TabsContent value="links" className="space-y-2 pt-3">
            {links.length === 0 ? (
              <EmptyState icon={<LinkIcon className="w-8 h-8 opacity-40" />} text="No invite links yet" />
            ) : (
              links.map((l) => {
                const active = isLinkActive(l, requests);
                const url = buildShareUrl(l.token);
                return (
                  <Card key={l.id}>
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-sm truncate">{l.title}</h4>
                            <Badge variant="outline" className="text-[10px]">{MEETING_TYPE_LABELS[l.meetingType]}</Badge>
                            {active ? (
                              <Badge variant="secondary" className="text-[10px] gap-1"><Check className="w-2.5 h-2.5" />Active</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] gap-1 text-muted-foreground"><Clock className="w-2.5 h-2.5" />Expired</Badge>
                            )}
                            {l.singleUse && <Badge variant="outline" className="text-[10px]">Single-use</Badge>}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Expires {format(new Date(l.expiresAt), "PPp")}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {active && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRevoke(l.id)} title="Revoke">
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(l.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Input value={url} readOnly className="h-8 text-xs font-mono" onFocus={(e) => e.currentTarget.select()} />
                        <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => handleCopy(l.token)}>
                          <Copy className="w-3 h-3" /> Copy
                        </Button>
                        <Button size="sm" variant="outline" className="h-8" asChild>
                          <a href={url} target="_blank" rel="noreferrer"><ExternalLink className="w-3 h-3" /></a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* REQUESTS */}
          <TabsContent value="requests" className="space-y-2 pt-3">
            {requests.length === 0 ? (
              <EmptyState icon={<Mail className="w-8 h-8 opacity-40" />} text="No external requests yet" />
            ) : (
              requests.map((r) => {
                const link = links.find((l) => l.id === r.inviteId);
                return (
                  <Card key={r.id}>
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-sm truncate">{r.proposedTitle}</h4>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px]",
                                r.status === "pending" && "border-amber-500/40 text-amber-700 dark:text-amber-300",
                                r.status === "approved" && "border-emerald-500/40 text-emerald-700 dark:text-emerald-300",
                                r.status === "declined" && "border-destructive/40 text-destructive",
                              )}
                            >
                              {r.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap">
                            <span>{format(new Date(r.proposedDate + "T00:00:00"), "PP")} · {r.proposedStartTime}–{r.proposedEndTime}</span>
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{r.submitterName} · {r.submitterEmail}</span>
                            {r.submitterOrganization && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{r.submitterOrganization}</span>}
                          </div>
                        </div>
                      </div>
                      {r.details && <p className="text-xs text-foreground/80">{r.details}</p>}
                      {link && link.customPrompts.length > 0 && (
                        <div className="text-xs space-y-0.5 bg-muted/30 rounded p-2">
                          {link.customPrompts.map((p, i) => (
                            <div key={i}>
                              <span className="font-medium">{p}: </span>
                              <span className="text-muted-foreground">{r.promptAnswers[i] || "—"}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {r.status === "pending" && (
                        <div className="flex items-center gap-2 pt-1 border-t">
                          <Button size="sm" className="h-8 gap-1" onClick={() => handleApprove(r)}>
                            <Check className="w-3.5 h-3.5" /> Approve & add to calendar
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => handleDecline(r)}>
                            <X className="w-3.5 h-3.5" /> Decline
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

const EmptyState = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="py-10 text-center text-muted-foreground space-y-2">
    <div className="flex justify-center">{icon}</div>
    <p className="text-sm">{text}</p>
  </div>
);
