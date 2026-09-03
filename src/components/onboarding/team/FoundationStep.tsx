import { useRef } from "react";
import { Building2, Mail, Phone, MapPin, Clock, Globe, ImagePlus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TIMEZONES, type TeamOnboardingState } from "@/types/onboardingTeam";

interface Props {
  state: TeamOnboardingState;
  update: (patch: Partial<TeamOnboardingState>) => void;
}

export function FoundationStep({ state, update }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLogo = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update({ logoDataUrl: String(reader.result) });
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Practice foundation</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Contact details and your main site. You can add more sites later.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="practiceEmail">Practice email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="practiceEmail"
              type="email"
              placeholder="admin@yourpractice.com"
              value={state.practiceEmail}
              onChange={(e) => update({ practiceEmail: e.target.value })}
              className="pl-10 h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="practicePhone">Phone</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="practicePhone"
              type="tel"
              placeholder="+61 3 9000 0000"
              value={state.practicePhone}
              onChange={(e) => update({ practicePhone: e.target.value })}
              className="pl-10 h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select value={state.timezone} onValueChange={(value) => update({ timezone: value })}>
            <SelectTrigger id="timezone" className="h-11">
              <Clock className="w-4 h-4 text-muted-foreground mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border z-50 max-h-64">
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="siteName">Main site name</Label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="siteName"
              placeholder="Main Site"
              value={state.siteName}
              onChange={(e) => update({ siteName: e.target.value })}
              className="pl-10 h-11"
            />
          </div>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="address">Address</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="address"
              placeholder="123 Medical Centre Drive"
              value={state.address}
              onChange={(e) => update({ address: e.target.value })}
              className="pl-10 h-11"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 flex items-center gap-4">
        {state.logoDataUrl ? (
          <div className="relative shrink-0">
            <img
              src={state.logoDataUrl}
              alt="Practice logo"
              className="w-14 h-14 rounded-lg object-cover border"
            />
            <button
              type="button"
              onClick={() => update({ logoDataUrl: null })}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-lg bg-foreground text-background flex items-center justify-center"
              aria-label="Remove logo"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="w-14 h-14 rounded-lg border border-dashed flex items-center justify-center shrink-0 text-muted-foreground">
            <ImagePlus className="w-5 h-5" />
          </div>
        )}
        <div className="min-w-0">
          <div className="text-sm font-medium">Practice logo (optional)</div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Appears on reports, memos and the team app.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleLogo(e.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 h-8"
            onClick={() => fileRef.current?.click()}
          >
            {state.logoDataUrl ? "Replace" : "Upload logo"}
          </Button>
        </div>
      </div>
    </div>
  );
}
