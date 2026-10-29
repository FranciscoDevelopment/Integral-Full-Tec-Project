import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

// Used for empty lists, "no results" and placeholders for features still to come.
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center",
        className,
      )}
    >
      {icon && <div className="text-slate-400">{icon}</div>}
      <p className="text-base font-semibold text-slate-900">{title}</p>
      {description && (
        <p className="max-w-md text-sm text-slate-600">{description}</p>
      )}
      {action}
    </div>
  );
}
