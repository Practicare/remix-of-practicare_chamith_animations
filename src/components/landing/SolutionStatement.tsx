import DashboardPreview from "./DashboardPreview";

const SolutionStatement = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium mb-6">
            The better way
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-8 tracking-tight leading-[1.05]">
            One screen. <span className="text-gradient">Your whole practice.</span>
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["No chasing.", "No guessing.", "No surprises."].map((line) => (
              <span
                key={line}
                className="rounded-lg border border-primary/20 bg-primary/[0.07] px-4 py-2 text-lg md:text-xl font-bold text-foreground"
              >
                {line}
              </span>
            ))}
          </div>
        </div>

        <DashboardPreview />
      </div>
    </section>
  );
};

export default SolutionStatement;
