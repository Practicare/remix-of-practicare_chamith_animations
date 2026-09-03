interface PageIntroProps {
  highlight: string;
  description: string;
  className?: string;
}

/**
 * Marketing-style page introduction card used at the top of menu pages.
 * Explains the page's purpose and guides the user on what to do next.
 */
export function PageIntro({ highlight, description, className = "" }: PageIntroProps) {
  return (
    <div className={`rounded-lg border border-border bg-card p-4 md:p-5 ${className}`}>
      <p className="text-sm leading-relaxed text-foreground">
        <span className="font-semibold text-primary">{highlight}</span>{" "}
        {description}
      </p>
    </div>
  );
}
