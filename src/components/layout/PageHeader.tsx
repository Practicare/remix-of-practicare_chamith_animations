import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  actions?: ReactNode;
}

/**
 * Standardized desktop page header used across menu pages.
 * Matches the Expiry Centre / Training pattern: sticky strip with
 * card background, border-bottom, optional icon, title + subtitle, and actions.
 *
 * Mobile uses MobileHeader separately — this component is hidden below md.
 */
export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  iconClassName = "text-primary",
  actions,
}: PageHeaderProps) {
  return (
    <header className="hidden md:flex min-h-[64px] bg-card border-b border-border px-8 items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && <Icon className={`w-5 h-5 shrink-0 ${iconClassName}`} />}
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight leading-tight">{title}</h2>
          {subtitle && (
            <p className="text-[13px] text-muted-foreground mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}
