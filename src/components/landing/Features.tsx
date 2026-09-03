import {
  Users,
  Calendar,
  ClipboardCheck,
  ShieldCheck,
  Package,
  Target,
  MessageSquare,
  FolderLock,
  Clock,
  DoorOpen,
  BarChart3,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: ClipboardCheck,
    title: "Digital checklists",
    description:
      "Every routine ticked, timed and signed.",
  },
  {
    icon: Target,
    title: "Tasks & to-do lists",
    description:
      "Today, overdue, done. Nothing forgotten.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance & expiry centre",
    description:
      "Alerts before anything lapses or expires.",
  },
  {
    icon: Users,
    title: "Staff & permissions",
    description:
      "Right people, right access, right away.",
  },
  {
    icon: Calendar,
    title: "Timesheets",
    description:
      "Hours captured, checked and approved.",
  },
  {
    icon: Package,
    title: "Inventory & stock control",
    description:
      "Know what you have, use and need.",
  },
  {
    icon: BarChart3,
    title: "KPI tracking",
    description:
      "Targets set, progress visible, daily.",
  },
  {
    icon: MessageSquare,
    title: "Memos & communication book",
    description:
      "One message. Everyone reads it.",
  },
  {
    icon: FolderLock,
    title: "Document library",
    description:
      "Every policy, one search away.",
  },
  {
    icon: DoorOpen,
    title: "Rooms, issues & requests",
    description:
      "Problems raised, fixed and closed.",
  },
  {
    icon: Clock,
    title: "Accreditation intelligence",
    description:
      "Audit-ready all year, not all-nighters.",
  },
  {
    icon: Sparkles,
    title: "AI assistance throughout",
    description:
      "Scan, extract, suggest — done in seconds.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group bg-card rounded-lg p-6 shadow-soft hover:shadow-card transition-all duration-300 border border-border hover:border-primary/30"
            >
              <div className="w-11 h-11 rounded-lg bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
