import { IsEnum } from 'class-validator';
import { CollaborationStatus } from 'src/generated/prisma/enums';

export class UpdateCollaborationStatusDto {
  @IsEnum(CollaborationStatus)
  status!: CollaborationStatus;
}