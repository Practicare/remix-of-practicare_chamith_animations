import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface SegmentOption<T extends string = string> {
  id: T;
  label: string;
  icon?: LucideIcon;
  badge?: string | number;
}

interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "default" | "lg";
  fullWidth?: boolean;
  className?: string;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  size = "default",
  fullWidth = false,
  className,
}: SegmentedControlProps<T>) {
  const sizeClasses = {
    sm: {
      container: "p-0.5 gap-0.5",
      button: "px-3 py-1.5 text-[12px] gap-1",
      icon: "w-3.5 h-3.5",
      badge: "text-[10px] px-1.5 py-0",
    },
    default: {
      container: "p-0.5 gap-0.5",
      button: "px-3.5 py-1.5 text-[13px] gap-1.5",
      icon: "w-4 h-4",
      badge: "text-[11px] px-1.5 py-0.5",
    },
    lg: {
      container: "p-1 gap-0.5",
      button: "px-4 py-2 text-sm gap-2",
      icon: "w-4 h-4",
      badge: "text-xs px-2 py-0.5",
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg",
        sizes.container,
        fullWidth && "w-full",
        className
      )}
      role="tablist"
    >
      {options.map((option) => {
        const isActive = value === option.id;
        const Icon = option.icon;

        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.id)}
            className={cn(
              "inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              sizes.button,
              fullWidth && "flex-1",
              isActive
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {Icon && <Icon className={sizes.icon} />}
            <span>{option.label}</span>
            {option.badge !== undefined && (
              <span
                className={cn(
                  "font-medium opacity-70",
                  sizes.badge,
                )}
              >
                {option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
