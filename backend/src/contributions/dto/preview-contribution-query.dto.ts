import { Transform } from 'class-transformer';
import { IsContributionAmount } from './is-contribution-amount.decorator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class PreviewContributionQueryDto {
  @Transform(trim)
  @IsContributionAmount()
  amount: string;
}
