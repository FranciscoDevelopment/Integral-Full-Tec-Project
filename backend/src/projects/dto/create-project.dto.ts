import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  Length,
  Max,
  Min,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ProjectKind } from 'src/generated/prisma/enums';
import { isValidRepoUrl } from '../utils/repo-url';

// goalAmount is Decimal(12, 2) in the database: 10 digits before the point
export const MAX_GOAL_AMOUNT = 9_999_999_999.99;

@ValidatorConstraint({ name: 'isRepoUrl' })
class IsRepoUrlConstraint implements ValidatorConstraintInterface {
  validate(value: unknown) {
    return isValidRepoUrl(value);
  }

  defaultMessage() {
    return 'repoUrl must be a valid repository URL (e.g. https://github.com/user/repo)';
  }
}

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateProjectDto {
  @Transform(trim)
  @IsString()
  @Length(3, 120)
  title: string;

  @Transform(trim)
  @IsString()
  @Length(10, 5000)
  description: string;

  @Transform(trim)
  @IsString()
  @Validate(IsRepoUrlConstraint)
  repoUrl: string;

  @IsEnum(ProjectKind)
  kind: ProjectKind;

  // The meta can be 0 (a project that does not ask for money) but never negative
  @IsNumber({ maxDecimalPlaces: 2, allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(MAX_GOAL_AMOUNT)
  goalAmount: number;
}
