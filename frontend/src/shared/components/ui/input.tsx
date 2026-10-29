import { useId, type ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import {
  describedById,
  Field,
  FIELD_CONTROL_CLASSES,
  FIELD_ERROR_CLASSES,
} from "./field";

interface InputProps extends ComponentProps<"input"> {
  label?: string;
  hint?: string;
  error?: string;
}

// `ref` is a regular prop in React 19, so React Hook Form's register() works as-is.
export function Input({
  label,
  hint,
  error,
  id,
  className,
  ...props
}: InputProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;

  return (
    <Field controlId={controlId} label={label} hint={hint} error={error}>
      <input
        id={controlId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedById(controlId, { hint, error })}
        className={cn(FIELD_CONTROL_CLASSES, error && FIELD_ERROR_CLASSES, className)}
        {...props}
      />
    </Field>
  );
}
