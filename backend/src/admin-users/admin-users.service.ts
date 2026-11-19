import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserStatus } from 'src/generated/prisma/enums';

const ADMIN_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  companyName: true,
  logoUrl: true,
  website: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({ page, limit }: PaginationQueryDto) {
    const where: Prisma.UserWhereInput = {};
    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: ADMIN_USER_SELECT,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, meta: { total, page, limit } };
  }

  async updateStatus(id: string, status: UserStatus) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data: { status },
      select: ADMIN_USER_SELECT,
    });
  }
}
