import { z } from "zod";

export function normalizeContributionAmount(value: string): string | null {
  const normalized = value.trim().replace(",", ".");
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(normalized)) return null;

  const [whole = "0", fraction = ""] = normalized.split(".");
  const fractionPadded = fraction.padEnd(2, "0");
  const amountCents = Number(whole) * 100 + Number(fractionPadded);

  if (
    !Number.isSafeInteger(amountCents) ||
    amountCents < 100 ||
    amountCents > 100_000_000
  ) {
    return null;
  }

  return `${whole}.${fractionPadded}`;
}

export const contributionSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, "Ingresá el monto del aporte.")
    .refine(
      (value) => normalizeContributionAmount(value) !== null,
      "Ingresá un monto entre 1.00 y 1000000.00, con hasta dos decimales.",
    ),
});

export type ContributionFormValues = z.infer<typeof contributionSchema>;
