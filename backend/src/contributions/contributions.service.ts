import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtPayload } from 'src/common/types/jwt-payload.type';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContributionStatus, ProjectStatus } from 'src/generated/prisma/enums';
import {
  calculateContributionFee,
  formatDecimal,
} from './contribution-fee.util';

@Injectable()
export class ContributionsService {
  constructor(private readonly prisma: PrismaService) {}

  preview(amount: string) {
    return calculateContributionFee(amount);
  }

  async create(projectId: string, amount: string, user: JwtPayload) {
    await this.findVisibleProject(projectId);

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

    return this.toResponse(contribution);
  }

  async findByProject(projectId: string, { page, limit }: PaginationQueryDto) {
    await this.findVisibleProject(projectId);

    const where = { projectId };
    const [data, total, aggregate] = await this.prisma.$transaction([
      this.prisma.contribution.findMany({
        where,
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

    // Public project listing keeps aggregate information outside meta.
    return {
      data: data.map((row) => this.toResponse(row)),
      meta: { total, page, limit },
      totalAmount: formatDecimal(aggregate._sum.amount),
    };
  }

  async findMine(user: JwtPayload, { page, limit }: PaginationQueryDto) {
    const where = { sponsorId: user.sub };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.contribution.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.contribution.count({ where }),
    ]);

    return {
      data: data.map((row) => this.toResponse(row)),
      meta: { total, page, limit },
    };
  }

  private async findVisibleProject(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, status: true },
    });

    if (!project || project.status === ProjectStatus.hidden) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    return project;
  }

  private toResponse(contribution: {
    id: string;
    projectId: string;
    sponsorId: string;
    amount: string | number | { toString(): string } | null | undefined;
    processingFee: string | number | { toString(): string } | null | undefined;
    status: ContributionStatus;
    createdAt: Date;
  }) {
    return {
      ...contribution,
      amount: formatDecimal(contribution.amount),
      processingFee: formatDecimal(contribution.processingFee),
    };
  }
}
