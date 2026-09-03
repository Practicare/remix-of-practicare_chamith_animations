import { ReactNode } from "react";

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export const MobileHeader = ({ title, subtitle, actions }: MobileHeaderProps) => {
  return (
    <header className="md:hidden min-h-[56px] bg-card border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-20">
      <div className="flex-1 min-w-0">
        <h2 className="text-lg font-bold leading-tight">{title}</h2>
        {subtitle && (
          <p className="text-[11px] text-muted-foreground leading-tight">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </header>
  );
};
