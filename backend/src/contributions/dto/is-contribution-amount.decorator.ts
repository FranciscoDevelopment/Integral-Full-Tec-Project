import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export const MIN_CONTRIBUTION_AMOUNT = '1.00';
export const MAX_CONTRIBUTION_AMOUNT = '1000000.00';

@ValidatorConstraint({ name: 'isContributionAmount', async: false })
class IsContributionAmountConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    if (!/^[1-9]\d*\.\d{2}$/.test(value)) return false;

    const [whole, fraction] = value.split('.');
    const cents = Number(whole) * 100 + Number(fraction);
    if (!Number.isSafeInteger(cents)) return false;

    return cents >= 100 && cents <= 100_000_000;
  }

  defaultMessage(): string {
    return `El monto debe ser texto con punto y entre ${MIN_CONTRIBUTION_AMOUNT} y ${MAX_CONTRIBUTION_AMOUNT}, por ejemplo "125.50"`;
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
