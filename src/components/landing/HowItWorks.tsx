import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    title: "Set up your practice in minutes",
    text: "Guided onboarding walks you through your sites, departments, rooms, staff and stock. AI import turns your existing lists and invoices into structured data — no manual data entry marathon.",
  },
  {
    number: "02",
    title: "Your team works from one daily view",
    text: "Staff open their phone and see exactly what's theirs: today's checklists, assigned tasks, shifts, memos to acknowledge and issues to raise. Every completion is time-stamped and attributed.",
  },
  {
    number: "03",
    title: "You get oversight, not chasing",
    text: "One dashboard shows completion rates, overdue tasks, expiring credentials, low stock and KPI progress — so you manage exceptions instead of following up on everything.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium mb-4">
            How it works
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Live in a week, not a quarter
          </h2>
          <p className="text-lg text-muted-foreground">
            No consultants, no IT project. Most practices are running their first digital checklist the same day they sign up.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {steps.map((step) => (
            <div key={step.number} className="rounded-lg border border-border bg-card p-8 shadow-soft">
              <div className="text-sm font-bold text-primary mb-4">{step.number}</div>
              <h3 className="text-lg font-semibold text-foreground mb-3">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="hero" size="xl" asChild>
            <Link to="/signup">
              Start your free 14-day trial
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
