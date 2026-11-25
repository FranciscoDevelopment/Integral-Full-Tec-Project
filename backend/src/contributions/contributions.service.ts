import { Injectable } from '@nestjs/common';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { mapContribution, CONTRIBUTION_SELECT } from './contribution.mapper';
import { calculateContributionFee } from './contribution-fee.util';

@Injectable()
export class ContributionsService {
  constructor(private readonly prisma: PrismaService) {}

  preview(amount: string) {
    return calculateContributionFee(amount);
  }

  async findMine(sponsorId: string, { page, limit }: PaginationQueryDto) {
    const where = { sponsorId };
    const [contributions, total] = await this.prisma.$transaction([
      this.prisma.contribution.findMany({
        where,
        select: CONTRIBUTION_SELECT,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.contribution.count({ where }),
    ]);

    return {
      data: contributions.map(mapContribution),
      meta: { total, page, limit },
    };
  }
}
