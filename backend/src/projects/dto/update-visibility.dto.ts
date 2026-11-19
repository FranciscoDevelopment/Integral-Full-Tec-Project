import { IsBoolean } from 'class-validator';

// PATCH /admin/projects/:id/visibility  { "hidden": true }
export class UpdateVisibilityDto {
  @IsBoolean()
  hidden: boolean;
}
