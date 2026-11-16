import { Transform } from 'class-transformer';
import {
  IsByteLength,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Role } from '../../generated/prisma/enums';

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name!: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @IsByteLength(1, 72)
  password!: string;

  @IsIn([Role.user, Role.sponsor])
  role!: typeof Role.user | typeof Role.sponsor;

  @ValidateIf((dto: SignUpDto) => dto.role === Role.sponsor)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  companyName?: string;

  @ValidateIf((dto: SignUpDto) => dto.role === Role.sponsor)
  @IsOptional()
  @IsUrl({ require_protocol: true })
  logoUrl?: string;

  @ValidateIf((dto: SignUpDto) => dto.role === Role.sponsor)
  @IsOptional()
  @IsUrl({ require_protocol: true })
  website?: string;
}
