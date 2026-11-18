import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { ProjectStatus } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtPayload } from 'src/common/types/jwt-payload.type';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import {
  AdminProjectsQueryDto,
  ProjectsQueryDto,
} from './dto/projects-query.dto';

// Only public fields of the owner: never the email, the status or the password (R7)
const PROJECT_SELECT = {
  id: true,
  title: true,
  description: true,
  repoUrl: true,
  kind: true,
  goalAmount: true,
  status: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
  owner: { select: { id: true, name: true } },
} satisfies Prisma.ProjectSelect;

type ProjectRow = Prisma.ProjectGetPayload<{ select: typeof PROJECT_SELECT }>;

// Prisma returns Decimal, which JSON turns into a string ("1500"):
// the front gets a plain number so it can draw the progress bar directly
function toResponse(project: ProjectRow) {
  return { ...project, goalAmount: Number(project.goalAmount) };
}

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Public (no session) ──

  findPublic(query: ProjectsQueryDto) {
    return this.paginate(
      {
        ...this.buildFilters(query),
        // Visible = everything except hidden. A status filter, when present, overrides this
        status: query.status ?? { not: ProjectStatus.hidden },
      },
      query,
    );
  }

  async findPublicOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: PROJECT_SELECT,
    });

    // Hidden behaves exactly like "does not exist": we do not reveal that it is there
    if (!project || project.status === ProjectStatus.hidden) {
      throw new NotFoundException('Project not found');
    }

    return toResponse(project);
  }

  // ── Owner ──

  async create(dto: CreateProjectDto, user: JwtPayload) {
    const project = await this.prisma.project.create({
      // ownerId comes from the token, never from the body (data isolation)
      data: { ...dto, ownerId: user.sub },
      select: PROJECT_SELECT,
    });

    return toResponse(project);
  }

  findMine(user: JwtPayload, query: AdminProjectsQueryDto) {
    // The owner sees all of their projects, hidden ones included, so they know a moderator hid it
    return this.paginate(
      { ...this.buildFilters(query), ownerId: user.sub, status: query.status },
      query,
    );
  }

  async update(id: string, dto: UpdateProjectDto, user: JwtPayload) {
    const project = await this.findOwnedOrFail(id, user);

    // A hidden project stays hidden until an admin shows it again
    if (dto.status && project.status === ProjectStatus.hidden) {
      throw new ForbiddenException(
        'This project was hidden by a moderator: its status cannot be changed',
      );
    }

    // PATCH { "title": null } passes @IsOptional: drop nulls so a required column is never emptied
    const data = Object.fromEntries(
      Object.entries(dto).filter(([, value]) => value != null),
    ) as Prisma.ProjectUpdateInput;

    const updated = await this.prisma.project.update({
      where: { id },
      data,
      select: PROJECT_SELECT,
    });

    return toResponse(updated);
  }

  async remove(id: string, user: JwtPayload) {
    await this.findOwnedOrFail(id, user);

    try {
      await this.prisma.project.delete({ where: { id } });
    } catch (error) {
      // Contributions keep a reference to the project (onDelete: Restrict): money records never vanish
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'The project has sponsor contributions and cannot be deleted. Mark it as completed instead',
        );
      }
      throw error;
    }
  }

  // ── Admin (moderation) ──

  findAllForAdmin(query: AdminProjectsQueryDto) {
    return this.paginate(
      { ...this.buildFilters(query), status: query.status },
      query,
    );
  }

  async setVisibility(id: string, hidden: boolean) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!project) throw new NotFoundException('Project not found');

    // Showing a project again brings it back as active
    const updated = await this.prisma.project.update({
      where: { id },
      data: { status: hidden ? ProjectStatus.hidden : ProjectStatus.active },
      select: PROJECT_SELECT,
    });

    return toResponse(updated);
  }

  // ── Helpers ──

  // The rule shared by every module: does not exist -> 404, belongs to someone else -> 403.
  // Someone else's hidden project is also 404, so its existence is not revealed
  private async findOwnedOrFail(id: string, user: JwtPayload) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: { id: true, ownerId: true, status: true },
    });

    if (!project) throw new NotFoundException('Project not found');

    if (project.ownerId !== user.sub) {
      if (project.status === ProjectStatus.hidden) {
        throw new NotFoundException('Project not found');
      }
      throw new ForbiddenException('You can only modify your own projects');
    }

    return project;
  }

  private buildFilters(query: ProjectsQueryDto): Prisma.ProjectWhereInput {
    const where: Prisma.ProjectWhereInput = {};

    if (query.kind) where.kind = query.kind;

    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private async paginate(
    where: Prisma.ProjectWhereInput,
    { page, limit }: ProjectsQueryDto,
  ) {
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        select: PROJECT_SELECT,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.project.count({ where }),
    ]);

    return { data: rows.map(toResponse), meta: { total, page, limit } };
  }
}
