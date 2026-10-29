import type { Option } from "@/shared/types";

// Builds select options in enum order; `labels` being a Record makes the compiler
// fail if a new enum value is added without its Spanish label.
export function toOptions<TValue extends string>(
  values: readonly TValue[],
  labels: Record<TValue, string>,
): Option<TValue>[] {
  return values.map((value) => ({ value, label: labels[value] }));
}
