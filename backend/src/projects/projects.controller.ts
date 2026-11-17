import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Auth } from 'src/common/decorators/auth.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { JwtPayload } from 'src/common/types/jwt-payload.type';
import { Role } from 'src/generated/prisma/enums';
import { CreateProjectDto } from './dto/create-project.dto';
import {
  AdminProjectsQueryDto,
  ProjectsQueryDto,
} from './dto/projects-query.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UpdateVisibilityDto } from './dto/update-visibility.dto';
import { ProjectsService } from './projects.service';

const ALL_ROLES = [Role.admin, Role.sponsor, Role.user];

/*
  Who can do what (the 401 comes from the global AuthGuard, the 403 from the RolesGuard
  or from the ownership check in the service):

  GET    /projects                          public
  GET    /projects/:id                      public (hidden -> 404)
  POST   /projects                          role user (sponsor / admin -> 403)
  PATCH  /projects/:id                      only the owner (someone else -> 403)
  DELETE /projects/:id                      only the owner (someone else -> 403)
  GET    /me/projects                       logged in
  GET    /admin/projects                    admin
  PATCH  /admin/projects/:id/visibility     admin
*/

// No class-level @Auth: the public endpoints must not carry role metadata
@Controller()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Public()
  @Get('projects')
  findAll(@Query() query: ProjectsQueryDto) {
    return this.projectsService.findPublic(query);
  }

  @Public()
  @Get('projects/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.findPublicOne(id);
  }

  // Only the "user" role publishes projects: sponsors fund them and admins moderate them
  @Auth(Role.user)
  @Post('projects')
  create(@Body() dto: CreateProjectDto, @CurrentUser() user: JwtPayload) {
    return this.projectsService.create(dto, user);
  }

  @Auth(...ALL_ROLES)
  @Patch('projects/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.projectsService.update(id, dto, user);
  }

  @Auth(...ALL_ROLES)
  @Delete('projects/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.projectsService.remove(id, user);
  }

  @Auth(...ALL_ROLES)
  @Get('me/projects')
  findMine(
    @CurrentUser() user: JwtPayload,
    @Query() query: AdminProjectsQueryDto,
  ) {
    return this.projectsService.findMine(user, query);
  }

  @Auth(Role.admin)
  @Get('admin/projects')
  findAllForAdmin(@Query() query: AdminProjectsQueryDto) {
    return this.projectsService.findAllForAdmin(query);
  }

  @Auth(Role.admin)
  @Patch('admin/projects/:id/visibility')
  setVisibility(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVisibilityDto,
  ) {
    return this.projectsService.setVisibility(id, dto.hidden);
  }
}
