import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { Auth } from 'src/common/decorators/auth.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Role } from 'src/generated/prisma/enums';
import { ContributionsService } from './contributions.service';
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

  @Public()
  @Get('projects/:id/contributions')
  findByProject(
    @Param('id', ParseUUIDPipe) projectId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.contributionsService.findByProject(projectId, query);
  }
}
