import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_BRAND } from "@/config/branding";

const valuePoints = [
  "Everything in one place — tasks, stock, compliance and staff.",
  "Built for healthcare — not a generic tool retrofitted for clinics.",
  "Mobile-first — your team uses it like a native app, with zero training.",
  "AI-assisted — scan documents, generate checklists and surface insights.",
];

const WhyPracticare = () => {
  return (
    <section id="why" className="py-24">
      <div className="container mx-auto px-4">
        <div className="relative rounded-3xl gradient-hero p-10 md:p-16 overflow-hidden max-w-6xl mx-auto">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary-foreground blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-primary-foreground blur-2xl" />
          </div>

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary-foreground/15 text-primary-foreground text-sm font-medium mb-5">
                <Sparkles className="w-4 h-4" />
                Why {APP_BRAND.name}?
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6 tracking-tight leading-[1.05]">
                Built to run your practice, not just manage it.
              </h2>
              <p className="text-lg md:text-xl text-primary-foreground/85 leading-relaxed mb-8">
                {APP_BRAND.name} gives practice owners and managers one clear view of
                what's happening today, what's coming next, and what needs attention —
                so nothing falls through the cracks.
              </p>
              <Button
                variant="secondary"
                size="lg"
                className="rounded-lg font-semibold"
                asChild
              >
                <a href="#pricing">See plans</a>
              </Button>
            </div>

            <div className="rounded-2xl bg-primary-foreground/10 border border-primary-foreground/20 p-6 md:p-8">
              <ul className="space-y-4">
                {valuePoints.map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-3 text-primary-foreground"
                  >
                    <span className="w-6 h-6 shrink-0 rounded-lg bg-primary-foreground/20 flex items-center justify-center mt-0.5">
                      <Check className="w-3.5 h-3.5 text-primary-foreground" />
                    </span>
                    <span className="text-base md:text-lg font-medium leading-relaxed">
                      {line}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyPracticare;
