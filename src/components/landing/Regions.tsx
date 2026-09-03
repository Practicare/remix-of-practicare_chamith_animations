import { Globe2, Languages, Lock, ShieldCheck } from "lucide-react";

const points = [
  {
    icon: Globe2,
    title: "Built for multi-country practices",
    text: "Australia, the United States, New Zealand, the UK and beyond — set your country during setup and the platform adapts terminology, dates and currency.",
  },
  {
    icon: ShieldCheck,
    title: "Accreditation-ready evidence",
    text: "Every checklist submission, task completion and document upload is time-stamped and attributed, giving you an audit trail when assessors ask for proof.",
  },
  {
    icon: Lock,
    title: "Role-based access control",
    text: "A permissions matrix controls who can view, edit and create in every module — clinicians, nurses, reception and admin each see only what they should.",
  },
  {
    icon: Languages,
    title: "Multi-site from day one",
    text: "Run several locations under one organisation, switch sites instantly, and compare performance across the group.",
  },
];

const Regions = () => {
  return (
    <section id="about" className="py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium mb-4">
              Governance &amp; scale
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Owners get control. Managers get their week back.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Whether you run a single clinic or a group across states and countries, the same
              structure applies: standardised routines, clear ownership and a documented trail of
              what actually happened.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {points.map((point) => (
              <div key={point.title} className="rounded-lg border border-border bg-card p-6 shadow-soft">
                <point.icon className="w-5 h-5 text-primary mb-3" />
                <h3 className="font-semibold text-foreground mb-2 text-sm">{point.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{point.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Regions;
