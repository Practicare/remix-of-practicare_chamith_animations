import { X } from "lucide-react";

const consequences = [
  "Tasks slip through",
  "Stock expires unseen",
  "No one owns it",
  "Managers chase all day",
  "Owners fly blind",
  "Audits become panic",
];

const PainPoints = () => {
  return (
    <section className="py-24 bg-foreground/[0.03]">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium mb-6">
            Sound familiar?
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.05]">
            Your practice shouldn't run on memory.
          </h2>
          <p className="mt-6 text-2xl md:text-3xl font-bold text-foreground">
            When it does, <span className="text-destructive">things get missed.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {consequences.map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-5 shadow-soft"
            >
              <span className="w-7 h-7 shrink-0 rounded-lg bg-destructive/10 flex items-center justify-center">
                <X className="w-4 h-4 text-destructive" />
              </span>
              <span className="text-base font-medium text-foreground">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PainPoints;
