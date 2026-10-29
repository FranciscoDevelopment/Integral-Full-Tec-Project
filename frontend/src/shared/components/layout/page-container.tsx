import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

// Same horizontal rhythm as the header and footer, so every page lines up.
export function PageContainer({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-6xl px-4 py-12 sm:px-6", className)}
      {...props}
    />
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-2">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="max-w-2xl text-lg text-slate-600">{description}</p>
      )}
    </header>
  );
}
