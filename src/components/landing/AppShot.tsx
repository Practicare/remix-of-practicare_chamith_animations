import { Check, AlertTriangle, TrendingUp, ShieldCheck, Users } from "lucide-react";

type Variant = "tasks" | "expiry" | "spend" | "compliance" | "accountability";

const Frame = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="relative">
    <div className="absolute -inset-4 gradient-hero opacity-[0.12] blur-2xl rounded-3xl" />
    <div className="relative rounded-2xl border border-border bg-card shadow-elevated overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/40">
        <span className="w-2.5 h-2.5 rounded-full bg-destructive/50" />
        <span className="w-2.5 h-2.5 rounded-full bg-warning/50" />
        <span className="w-2.5 h-2.5 rounded-full bg-success/50" />
        <span className="ml-2 text-[11px] font-medium text-muted-foreground">{title}</span>
      </div>
      <div className="p-4 md:p-5 bg-gradient-to-b from-background to-muted/20">{children}</div>
    </div>
  </div>
);

const Row = ({
  label,
  meta,
  tone = "muted",
  icon,
}: {
  label: string;
  meta: string;
  tone?: "muted" | "success" | "warning" | "destructive" | "primary";
  icon?: React.ReactNode;
}) => {
  const tones: Record<string, string> = {
    muted: "bg-muted/40 border-border",
    success: "bg-success/10 border-success/25",
    warning: "bg-warning/10 border-warning/30",
    destructive: "bg-destructive/10 border-destructive/25",
    primary: "bg-primary/[0.07] border-primary/20",
  };
  return (
    <div className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${tones[tone]}`}>
      <span className="shrink-0 w-6 h-6 rounded-lg bg-card border border-border flex items-center justify-center">
        {icon}
      </span>
      <span className="flex-1 text-xs font-medium text-foreground truncate">{label}</span>
      <span className="text-[11px] text-muted-foreground whitespace-nowrap">{meta}</span>
    </div>
  );
};

const AppShot = ({ variant }: { variant: Variant }) => {
  if (variant === "tasks") {
    return (
      <Frame title="Tasks · Today">
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { l: "Done", v: "18", c: "text-success" },
            { l: "Pending", v: "4", c: "text-warning" },
            { l: "Overdue", v: "1", c: "text-destructive" },
          ].map((s) => (
            <div key={s.l} className="rounded-lg border border-border bg-card p-2.5">
              <div className="text-[10px] text-muted-foreground">{s.l}</div>
              <div className={`text-lg font-bold ${s.c}`}>{s.v}</div>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <Row label="Calibrate autoclave" meta="Sarah · 9:00" tone="success" icon={<Check className="w-3 h-3 text-success" />} />
          <Row label="Restock treatment room 2" meta="Amir · due 2pm" tone="primary" icon={<Users className="w-3 h-3 text-primary" />} />
          <Row label="Fire exit walkthrough" meta="Overdue 1 day" tone="destructive" icon={<AlertTriangle className="w-3 h-3 text-destructive" />} />
        </div>
      </Frame>
    );
  }

  if (variant === "expiry") {
    return (
      <Frame title="Expiry Centre">
        <div className="space-y-2">
          <Row label="Lignocaine 2% · Box A" meta="Expires in 6 days" tone="destructive" icon={<AlertTriangle className="w-3 h-3 text-destructive" />} />
          <Row label="Sterile gauze pads" meta="Expires in 21 days" tone="warning" icon={<AlertTriangle className="w-3 h-3 text-warning" />} />
          <Row label="Influenza vaccine" meta="Expires in 48 days" tone="muted" icon={<Check className="w-3 h-3 text-muted-foreground" />} />
        </div>
        <div className="mt-3 rounded-lg border border-border bg-card p-3">
          <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
            <span>Stock at risk this month</span>
            <span className="font-semibold text-foreground">$412</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-[22%] rounded-full bg-warning" />
          </div>
        </div>
      </Frame>
    );
  }

  if (variant === "spend") {
    const bars = [42, 58, 36, 71, 54, 83, 62];
    return (
      <Frame title="Inventory Planner · Intelligence">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { l: "Monthly", v: "$3.2k" },
            { l: "Quarterly", v: "$9.6k" },
            { l: "% of income", v: "6.1%" },
          ].map((s) => (
            <div key={s.l} className="rounded-lg border border-border bg-card p-2.5">
              <div className="text-[10px] text-muted-foreground">{s.l}</div>
              <div className="text-base font-bold text-foreground">{s.v}</div>
            </div>
          ))}
        </div>
        <div className="flex items-end gap-2 h-24">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 rounded-t-md bg-primary/70" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
          <TrendingUp className="w-3.5 h-3.5 text-success" />
          Consumables trending 8% under budget
        </div>
      </Frame>
    );
  }

  if (variant === "compliance") {
    return (
      <Frame title="Compliance · Accreditation">
        <div className="space-y-2">
          <Row label="CPR certification · 12 staff" meta="All current" tone="success" icon={<ShieldCheck className="w-3 h-3 text-success" />} />
          <Row label="Cold chain temperature log" meta="Logged daily" tone="success" icon={<Check className="w-3 h-3 text-success" />} />
          <Row label="Infection control audit" meta="Due in 9 days" tone="warning" icon={<AlertTriangle className="w-3 h-3 text-warning" />} />
        </div>
        <div className="mt-3 rounded-lg border border-success/25 bg-success/10 p-3">
          <div className="flex justify-between text-[11px] mb-1.5">
            <span className="text-muted-foreground">Accreditation readiness</span>
            <span className="font-semibold text-success">98%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-[98%] rounded-full bg-success" />
          </div>
        </div>
      </Frame>
    );
  }

  return (
    <Frame title="Checklists · Morning open">
      <div className="space-y-2">
        {[
          { t: "Reception opened & phones live", w: "SJ", done: true },
          { t: "Fridge temperature recorded", w: "AM", done: true },
          { t: "Treatment rooms stocked", w: "PT", done: true },
          { t: "Emergency trolley checked", w: "—", done: false },
        ].map((i) => (
          <div key={i.t} className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
            <span
              className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                i.done ? "bg-success border-success" : "border-muted-foreground/30"
              }`}
            >
              {i.done && <Check className="w-2.5 h-2.5 text-success-foreground" />}
            </span>
            <span className={`flex-1 text-xs ${i.done ? "text-muted-foreground line-through" : "text-foreground font-medium"}`}>
              {i.t}
            </span>
            <span className="text-[10px] font-semibold text-primary bg-primary/10 rounded-md px-1.5 py-0.5">
              {i.w}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 text-[11px] text-muted-foreground">Signed off by Sarah J · 8:42am</div>
    </Frame>
  );
};

export default AppShot;
