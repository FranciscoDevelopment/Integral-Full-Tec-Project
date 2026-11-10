import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtPayload } from 'src/common/types/jwt-payload.type';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import {
  CollaborationStatus,
  ProjectStatus,
} from 'src/generated/prisma/enums';
import { canTransition } from './collaboration-transitions';
import { CreateCollaborationDto } from './dto/create-collaboration.dto';
import { UpdateCollaborationStatusDto } from './dto/update-collaboration-status.dto';

@Injectable()
export class CollaborationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    projectId: string,
    dto: CreateCollaborationDto,
    user: JwtPayload,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.status === ProjectStatus.hidden) {
      throw new NotFoundException('Project not found');
    }
    if (project.ownerId === user.sub) {
      throw new ForbiddenException(
        'You cannot collaborate on your own project',
      );
    }
    if (project.status !== ProjectStatus.active) {
      throw new ConflictException('Project is not accepting collaborators');
    }

    const existing = await this.prisma.collaboration.findFirst({
      where: {
        projectId,
        collaboratorId: user.sub,
        status: {
          in: [
            CollaborationStatus.pending,
            CollaborationStatus.accepted,
            CollaborationStatus.confirmed,
          ],
        },
      },
    });
    if (existing) {
      throw new ConflictException(
        'You already have an active collaboration on this project',
      );
    }

    return this.prisma.collaboration.create({
      data: {
        projectId,
        collaboratorId: user.sub,
        role: dto.role,
        description: dto.description,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        repoLinks: dto.repoLinks ?? [],
      },
    });
  }

  async findMine(user: JwtPayload, query: PaginationQueryDto) {
    return this.paginate({ collaboratorId: user.sub }, query);
  }

  async findByProject(
    projectId: string,
    user: JwtPayload,
    query: PaginationQueryDto,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.ownerId !== user.sub) {
      throw new ForbiddenException('Only the project owner can see this');
    }
    return this.paginate({ projectId }, query);
  }

  async findConfirmedByUser(userId: string, query: PaginationQueryDto) {
    return this.paginate(
      { collaboratorId: userId, status: CollaborationStatus.confirmed },
      query,
    );
  }

  async updateStatus(
    id: string,
    dto: UpdateCollaborationStatusDto,
    user: JwtPayload,
  ) {
    const collaboration = await this.prisma.collaboration.findUnique({
      where: { id },
      include: { project: true },
    });
    if (!collaboration) throw new NotFoundException('Collaboration not found');

    // Ownership: only the project owner, whatever their role
    if (collaboration.project.ownerId !== user.sub) {
      throw new ForbiddenException(
        'Only the project owner can change the status',
      );
    }
    if (!canTransition(collaboration.status, dto.status)) {
      throw new ConflictException(
        `Cannot change status from ${collaboration.status} to ${dto.status}`,
      );
    }

    return this.prisma.collaboration.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async remove(id: string, user: JwtPayload) {
    const collaboration = await this.prisma.collaboration.findUnique({
      where: { id },
    });
    if (!collaboration) throw new NotFoundException('Collaboration not found');
    if (collaboration.collaboratorId !== user.sub) {
      throw new ForbiddenException('You can only withdraw your own request');
    }
    if (collaboration.status !== CollaborationStatus.pending) {
      throw new ConflictException('Only pending requests can be withdrawn');
    }
    await this.prisma.collaboration.delete({ where: { id } });
  }

  private async paginate(
    where: Prisma.CollaborationWhereInput,
    query: PaginationQueryDto,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const [data, total] = await Promise.all([
      this.prisma.collaboration.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.collaboration.count({ where }),
    ]);
    return { data, meta: { total, page, limit } };
  }
}