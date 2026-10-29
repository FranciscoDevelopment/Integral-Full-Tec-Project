import { useId, type ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import type { Option } from "@/shared/types";
import {
  describedById,
  Field,
  FIELD_CONTROL_CLASSES,
  FIELD_ERROR_CLASSES,
} from "./field";

interface SelectProps extends ComponentProps<"select"> {
  options: readonly Option[];
  label?: string;
  hint?: string;
  error?: string;
  // Renders a first empty option, e.g. "Todas las provincias".
  placeholder?: string;
}

export function Select({
  options,
  label,
  hint,
  error,
  placeholder,
  id,
  className,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;

  return (
    <Field controlId={controlId} label={label} hint={hint} error={error}>
      <select
        id={controlId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedById(controlId, { hint, error })}
        className={cn(FIELD_CONTROL_CLASSES, error && FIELD_ERROR_CLASSES, className)}
        {...props}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
