import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtPayload } from 'src/common/types/jwt-payload.type';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ContributionStatus,
  ProjectStatus,
} from 'src/generated/prisma/enums';
import { calculateContributionFee } from './contribution-fee.util';

@Injectable()
export class ContributionsService {
  constructor(private readonly prisma: PrismaService) {}

  preview(amount: string) {
    return calculateContributionFee(amount);
  }

  async create(projectId: string, amount: string, user: JwtPayload) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, status: true },
    });

    if (!project || project.status === ProjectStatus.hidden) {
      throw new NotFoundException('Project not found');
    }

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
}
