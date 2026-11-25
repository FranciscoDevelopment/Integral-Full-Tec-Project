import { Controller, Get, Query } from '@nestjs/common';
import { Auth } from 'src/common/decorators/auth.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Role } from 'src/generated/prisma/enums';
import { JwtPayload } from 'src/common/types/jwt-payload.type';
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

  @Auth(Role.sponsor)
  @Get('me/contributions')
  findMine(
    @CurrentUser() user: JwtPayload,
    @Query() query: PaginationQueryDto,
  ) {
    return this.contributionsService.findMine(user.sub, query);
  }
}
