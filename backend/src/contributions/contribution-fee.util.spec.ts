import {
  calculateContributionFee,
  formatDecimal,
} from './contribution-fee.util';

describe('calculateContributionFee', () => {
  it('calculates the fee for 125.50 with half-up rounding', () => {
    expect(calculateContributionFee('125.50')).toEqual({
      amount: '125.50',
      fee: '6.28',
      total: '131.78',
    });
  });

  it('calculates the minimum amount fee', () => {
    expect(calculateContributionFee('1.00')).toEqual({
      amount: '1.00',
      fee: '0.05',
      total: '1.05',
    });
  });

  it.each(['0.99', '1000000.01', '1,5', '1e3', '01'])(
    'rejects invalid amount %s',
    (amount) => {
      expect(() => calculateContributionFee(amount)).toThrow();
    },
  );

  it('keeps amount plus fee equal to total', () => {
    const breakdown = calculateContributionFee('125.50');
    const amountCents =
      Number(breakdown.amount.split('.')[0]) * 100 +
      Number(breakdown.amount.split('.')[1]);
    const feeCents =
      Number(breakdown.fee.split('.')[0]) * 100 +
      Number(breakdown.fee.split('.')[1]);
    const totalCents =
      Number(breakdown.total.split('.')[0]) * 100 +
      Number(breakdown.total.split('.')[1]);

    expect(amountCents + feeCents).toBe(totalCents);
  });
});

describe('formatDecimal', () => {
  it('formats null and undefined as 0.00', () => {
    expect(formatDecimal(null)).toBe('0.00');
    expect(formatDecimal(undefined)).toBe('0.00');
  });

  it('formats values with two decimals', () => {
    expect(formatDecimal('125.5')).toBe('125.50');
    expect(formatDecimal('125')).toBe('125.00');
  });

  it('formats an object by calling its toString method', () => {
    const value = { toString: () => '6.28' };
    expect(formatDecimal(value)).toBe('6.28');
  });
});
