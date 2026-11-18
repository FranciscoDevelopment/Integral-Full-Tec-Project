import { Transform } from 'class-transformer';
import { IsEnum, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { ProjectKind, ProjectStatus } from 'src/generated/prisma/enums';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

// GET /projects?kind=game&status=active&q=godot&page=1&limit=20
export class ProjectsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(ProjectKind)
  kind?: ProjectKind;

  // The public list never shows hidden projects, so "hidden" is not a valid filter here
  @IsOptional()
  @IsIn([ProjectStatus.active, ProjectStatus.completed])
  status?: ProjectStatus;

  // Free text: searched in the title and the description, case insensitive
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  q?: string;
}

// GET /admin/projects: the same filters, but the admin can also ask for hidden ones
export class AdminProjectsQueryDto extends ProjectsQueryDto {
  @IsOptional()
  @IsEnum(ProjectStatus)
  declare status?: ProjectStatus;
}
