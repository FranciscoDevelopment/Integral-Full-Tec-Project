import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { Role } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

const meSelect = {
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

const publicProfileSelect = {
  id: true,
  name: true,
  role: true,
  createdAt: true,
  companyName: true,
  logoUrl: true,
  website: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: meSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  async updateMe(id: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const hasSponsorFields =
      dto.companyName !== undefined ||
      dto.logoUrl !== undefined ||
      dto.website !== undefined;

    if (hasSponsorFields && user.role !== Role.sponsor) {
      throw new BadRequestException(
        'Only sponsors can update sponsor profile fields.',
      );
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        companyName: dto.companyName,
        logoUrl: dto.logoUrl,
        website: dto.website,
      },
      select: meSelect,
    });
  }

  async getPublicProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: publicProfileSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    // D4 can extend this public profile with confirmed collaboration data.
    if (user.role === Role.sponsor) {
      return user;
    }

    return {
      id: user.id,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
