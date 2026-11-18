import { Injectable } from '@nestjs/common';
import { JwtPayload } from 'src/common/types/jwt-payload.type';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@Injectable()
export class ContributionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMine(user: JwtPayload, { page, limit }: PaginationQueryDto) {
    const where = { sponsorId: user.sub };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.contribution.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.contribution.count({ where }),
    ]);

    return { data, meta: { total, page, limit } };
  }
}
