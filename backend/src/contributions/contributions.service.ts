import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { ProjectStatus } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { mapContribution, CONTRIBUTION_SELECT } from './contribution.mapper';
import { calculateContributionFee } from './contribution-fee.util';

@Injectable()
export class ContributionsService {
  constructor(private readonly prisma: PrismaService) {}

  preview(amount: string) {
    return calculateContributionFee(amount);
  }

  async findByProject(projectId: string, { page, limit }: PaginationQueryDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, status: true },
    });

    if (!project || project.status === ProjectStatus.hidden) {
      throw new NotFoundException('Project not found');
    }

    const where = { projectId };
    const [contributions, total, aggregate] = await this.prisma.$transaction([
      this.prisma.contribution.findMany({
        where,
        select: CONTRIBUTION_SELECT,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.contribution.count({ where }),
      this.prisma.contribution.aggregate({
        where,
        _sum: { amount: true },
      }),
    ]);

    return {
      data: contributions.map(mapContribution),
      meta: { total, page, limit },
      totalAmount: aggregate._sum.amount?.toFixed(2) ?? '0.00',
    };
  }
}
