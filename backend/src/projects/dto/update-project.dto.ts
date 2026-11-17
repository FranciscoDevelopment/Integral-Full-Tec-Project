import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';
import { ProjectStatus } from 'src/generated/prisma/enums';
import { CreateProjectDto } from './create-project.dto';

// The owner can mark the project as completed (or reopen it), but never hide it:
// "hidden" is a moderation decision and only the admin sets it (PATCH /admin/projects/:id/visibility)
export const OWNER_STATUSES = [
  ProjectStatus.active,
  ProjectStatus.completed,
] as const;

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @IsOptional()
  @IsIn(OWNER_STATUSES)
  status?: (typeof OWNER_STATUSES)[number];
}
