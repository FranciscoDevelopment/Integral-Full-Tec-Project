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
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { JwtPayload } from 'src/common/types/jwt-payload.type';
import { Role } from 'src/generated/prisma/enums';
import { CollaborationsService } from './collaborations.service';
import { CreateCollaborationDto } from './dto/create-collaboration.dto';
import { UpdateCollaborationStatusDto } from './dto/update-collaboration-status.dto';

const ALL_ROLES = [Role.admin, Role.sponsor, Role.user];

// No class-level @Auth: the public endpoint must not carry role metadata
@Controller()
export class CollaborationsController {
  constructor(private readonly collaborationsService: CollaborationsService) {}

  @Auth(...ALL_ROLES)
  @Post('projects/:id/collaborations')
  create(
    @Param('id', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateCollaborationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.collaborationsService.create(projectId, dto, user);
  }

  @Auth(...ALL_ROLES)
  @Get('me/collaborations')
  findMine(
    @CurrentUser() user: JwtPayload,
    @Query() query: PaginationQueryDto,
  ) {
    return this.collaborationsService.findMine(user, query);
  }

  @Auth(...ALL_ROLES)
  @Get('projects/:id/collaborations')
  findByProject(
    @Param('id', ParseUUIDPipe) projectId: string,
    @CurrentUser() user: JwtPayload,
    @Query() query: PaginationQueryDto,
  ) {
    return this.collaborationsService.findByProject(projectId, user, query);
  }

  @Public()
  @Get('users/:id/collaborations/confirmed')
  findConfirmedByUser(
    @Param('id', ParseUUIDPipe) userId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.collaborationsService.findConfirmedByUser(userId, query);
  }

  @Auth(...ALL_ROLES)
  @Patch('collaborations/:id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCollaborationStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.collaborationsService.updateStatus(id, dto, user);
  }

  @Auth(...ALL_ROLES)
  @Delete('collaborations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.collaborationsService.remove(id, user);
  }
}