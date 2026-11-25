import { Controller, Get, Query } from '@nestjs/common';
import { Auth } from 'src/common/decorators/auth.decorator';
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
}
