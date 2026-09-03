import AppShot from "./AppShot";
import { ArrowRight } from "lucide-react";

const outcomes = [
  {
    kicker: "No more chasing",
    headline: "Everyone knows what's theirs.",
    promise: "Who's doing it. When it's due. Whether it's done.",
    how: "Every task has an owner, a time and a live status — and repeats itself.",
    variant: "tasks" as const,
  },
  {
    kicker: "No more waste",
    headline: "Nothing expires on your watch.",
    promise: "Catch it weeks early, not on audit day.",
    how: "The Expiry Centre flags every batch, ranked by what it costs you.",
    variant: "expiry" as const,
  },
  {
    kicker: "No more surprises",
    headline: "See every dollar you spend.",
    promise: "Spend, trends and stock levels — in real time.",
    how: "Monthly, quarterly and yearly spend against your income ratio.",
    variant: "spend" as const,
  },
  {
    kicker: "No more audit panic",
    headline: "Accreditation ready. Every day.",
    promise: "Evidence collected as you work, not the week before.",
    how: "Compliance, certifications and documents with a live readiness score.",
    variant: "compliance" as const,
  },
  {
    kicker: "No more phone tag",
    headline: "Clear instructions. Every shift.",
    promise: "No sticky notes. No 100-email threads. Just clarity.",
    how: "AI reminders and daily checklists keep the whole team in step.",
    variant: "accountability" as const,
  },
];

const Outcomes = () => {
  return (
    <section id="outcomes" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium mb-4">
            What changes
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
            Calmer days. <span className="text-gradient">Tighter practice.</span>
          </h2>
        </div>

        <div className="space-y-24 md:space-y-32 max-w-6xl mx-auto">
          {outcomes.map((o, i) => (
            <div
              key={o.headline}
              className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center"
            >
              <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                <div className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
                  {o.kicker}
                </div>
                <h3 className="text-2xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                  {o.headline}
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed mb-5">{o.promise}</p>
                <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-soft">
                  <ArrowRight className="w-4 h-4 mt-1 shrink-0 text-primary" />
                  <p className="text-sm text-foreground leading-relaxed">{o.how}</p>
                </div>
              </div>

              <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                <AppShot variant={o.variant} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Outcomes;
