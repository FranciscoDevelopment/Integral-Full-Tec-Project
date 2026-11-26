import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export const MIN_CONTRIBUTION_AMOUNT = '0.01';
export const MAX_CONTRIBUTION_AMOUNT = '1000000.00';

@ValidatorConstraint({ name: 'isContributionAmount', async: false })
class IsContributionAmountConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(value)) return false;

    const [whole, fraction = ''] = value.split('.');
    const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
    if (!Number.isSafeInteger(cents)) return false;

    return cents >= 1 && cents <= 100_000_000;
  }

  defaultMessage(): string {
    return `The amount must be a positive number between ${MIN_CONTRIBUTION_AMOUNT} and ${MAX_CONTRIBUTION_AMOUNT} with up to two decimal places, for example "10", "10.5", or "10.50"`;
  }
}

export function IsContributionAmount(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isContributionAmount',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsContributionAmountConstraint,
    });
  };
}
