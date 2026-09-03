const stats = [
  { value: "500+", label: "Healthcare Practices" },
  { value: "12+", label: "Modules In One Login" },
  { value: "4+ hrs", label: "Saved Per Week" },
  { value: "4.9/5", label: "Customer Rating" },
];

const Stats = () => {
  return (
    <section className="py-16 border-y border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
