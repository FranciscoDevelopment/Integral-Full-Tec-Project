import type { ReactNode } from "react";

// Classes shared by every text-like control so Input and Select look identical.
export const FIELD_CONTROL_CLASSES =
  "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 " +
  "placeholder:text-slate-400 disabled:bg-slate-100 disabled:text-slate-500";

export const FIELD_ERROR_CLASSES = "border-red-500 focus-visible:outline-red-500";

interface FieldProps {
  controlId: string;
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

// Label + control + error/hint. The control wires aria-describedby using describedById().
export function Field({ controlId, label, hint, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={controlId}
          className="text-sm font-medium text-slate-800"
        >
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${controlId}-error`} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${controlId}-hint`} className="text-sm text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function describedById(
  controlId: string,
  { hint, error }: { hint?: string; error?: string },
): string | undefined {
  if (error) return `${controlId}-error`;
  if (hint) return `${controlId}-hint`;
  return undefined;
}
