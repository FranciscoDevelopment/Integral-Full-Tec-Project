import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { JwtPayload } from 'src/common/types/jwt-payload.type';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ContributionStatus,
  ProjectStatus,
} from 'src/generated/prisma/enums';
import { mapContribution, CONTRIBUTION_SELECT } from './contribution.mapper';
import { calculateContributionFee } from './contribution-fee.util';

@Injectable()
export class ContributionsService {
  constructor(private readonly prisma: PrismaService) {}

  preview(amount: string) {
    return calculateContributionFee(amount);
  }

  async create(projectId: string, amount: string, user: JwtPayload) {
    await this.assertProjectVisible(projectId);

    const fee = calculateContributionFee(amount);
    const contribution = await this.prisma.contribution.create({
      data: {
        projectId,
        sponsorId: user.sub,
        amount: fee.amount,
        processingFee: fee.fee,
        status: ContributionStatus.simulated,
      },
    });

    return {
      id: contribution.id,
      projectId: contribution.projectId,
      sponsorId: contribution.sponsorId,
      amount: fee.amount,
      processingFee: fee.fee,
      status: contribution.status,
      createdAt: contribution.createdAt,
    };
  }

  async findByProject(projectId: string, { page, limit }: PaginationQueryDto) {
    await this.assertProjectVisible(projectId);

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

  private async assertProjectVisible(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, status: true },
    });

    if (!project || project.status === ProjectStatus.hidden) {
      throw new NotFoundException('Project not found');
    }
  }
}