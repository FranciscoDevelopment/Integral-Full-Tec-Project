import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// The role is never changed through a profile update
export class UpdateUserDto extends PartialType( OmitType( CreateUserDto, ['role'] as const ) ) {}
