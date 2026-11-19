export const FEE_PERCENTAGE = 5;
export const FEE_FIXED = 0;
export const MAX_CONTRIBUTION_AMOUNT_CENTS = 100_000_000;

export interface ContributionFeeBreakdown {
  amount: string;
  fee: string;
  total: string;
}

function toCents(amount: string): number {
  if (!/^[1-9]\d*\.\d{2}$/.test(amount)) {
    throw new Error('Invalid contribution amount');
  }

  const [whole, fraction] = amount.split('.');
  const cents = Number(whole) * 100 + Number(fraction);
  if (
    !Number.isSafeInteger(cents) ||
    cents < 100 ||
    cents > MAX_CONTRIBUTION_AMOUNT_CENTS
  ) {
    throw new Error('Invalid contribution amount');
  }

  return cents;
}

export function calculateContributionFee(
  amount: string,
): ContributionFeeBreakdown {
  const amountCents = toCents(amount);
  const feeCents =
    Math.floor((amountCents * FEE_PERCENTAGE + 50) / 100) + FEE_FIXED;
  const totalCents = amountCents + feeCents;

  return {
    amount: formatCents(amountCents),
    fee: formatCents(feeCents),
    total: formatCents(totalCents),
  };
}

function formatCents(cents: number): string {
  const whole = Math.floor(cents / 100);
  const fraction = cents % 100;
  return `${whole}.${fraction.toString().padStart(2, '0')}`;
}

export function formatDecimal(
  value: string | number | { toString(): string } | null | undefined,
): string {
  let text: string;
  if (value == null) {
    text = '0';
  } else if (typeof value === 'string') {
    text = value;
  } else if (typeof value === 'number') {
    text = value.toString();
  } else {
    text = value.toString();
  }

  if (!/^\d+(\.\d+)?$/.test(text)) return '0.00';

  const [whole = '0', fraction = ''] = text.split('.');
  if (fraction.length >= 2) {
    return `${whole}.${fraction.slice(0, 2)}`;
  }

  return `${whole}.${fraction.padEnd(2, '0')}`;
}
