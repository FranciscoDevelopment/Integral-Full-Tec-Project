import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { Auth } from 'src/common/decorators/auth.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Role } from 'src/generated/prisma/enums';
import { JwtPayload } from 'src/common/types/jwt-payload.type';
import { ContributionsService } from './contributions.service';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { PreviewContributionQueryDto } from './dto/preview-contribution-query.dto';

const ALL_ROLES = [Role.admin, Role.sponsor, Role.user];

@Controller()
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  @Auth(...ALL_ROLES)
  @Get('contributions/preview')
  preview(@Query() query: PreviewContributionQueryDto) {
    return this.contributionsService.preview(query.amount);
  }

  @Auth(Role.sponsor)
  @Post('projects/:id/contributions')
  create(
    @Param('id', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateContributionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.contributionsService.create(projectId, dto.amount, user);
  }

  @Public()
  @Get('projects/:id/contributions')
  findByProject(
    @Param('id', ParseUUIDPipe) projectId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.contributionsService.findByProject(projectId, query);
  }

  @Auth(Role.sponsor)
  @Get('me/contributions')
  findMine(
    @CurrentUser() user: JwtPayload,
    @Query() query: PaginationQueryDto,
  ) {
    return this.contributionsService.findMine(user, query);
  }
}
