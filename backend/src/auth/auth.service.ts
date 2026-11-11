import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../generated/prisma/client';
import { Role, UserStatus } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { JwtPayload } from '../common/types/jwt-payload.type';

const authUserSelect = {
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

const signInErrorMessage = 'Invalid email or password.';

@Injectable()
export class AuthService {
  private readonly tokenExpirationSeconds: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    config: ConfigService,
  ) {
    this.tokenExpirationSeconds = parseTokenExpiration(
      config.getOrThrow<string>('JWT_EXPIRES_IN'),
    );
  }

  async signUp(dto: SignUpDto) {
    const email = normalizeEmail(dto.email);
    const password = await bcrypt.hash(dto.password, 10);

    try {
      return await this.prisma.user.create({
        data: {
          name: dto.name,
          email,
          password,
          role: dto.role,
          companyName: dto.role === Role.sponsor ? dto.companyName : null,
          logoUrl: dto.role === Role.sponsor ? dto.logoUrl : null,
          website: dto.role === Role.sponsor ? dto.website : null,
        },
        select: authUserSelect,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'An account with this email already exists.',
        );
      }

      throw error;
    }
  }

  async signIn(dto: SignInDto): Promise<{
    user: Prisma.UserGetPayload<{ select: typeof authUserSelect }>;
    token: string;
    maxAge: number;
  }> {
    const email = normalizeEmail(dto.email);
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        ...authUserSelect,
        password: true,
      },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException(signInErrorMessage);
    }

    if (user.status === UserStatus.suspended) {
      throw new UnauthorizedException(signInErrorMessage);
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: this.tokenExpirationSeconds,
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      companyName: user.companyName,
      logoUrl: user.logoUrl,
      website: user.website,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      user: safeUser,
      token,
      maxAge: this.tokenExpirationSeconds * 1000,
    };
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function parseTokenExpiration(value: string): number {
  const match =
    /^(\d+)\s*(s|sec|seconds?|m|min|minutes?|h|hours?|d|days?)?$/i.exec(
      value.trim(),
    );

  if (!match) {
    throw new Error(
      'JWT_EXPIRES_IN must be a positive number of seconds or a duration such as 15m.',
    );
  }

  const amount = Number(match[1]);
  const unit = match[2]?.toLowerCase();
  const multiplier =
    unit === 'm' || unit?.startsWith('min')
      ? 60
      : unit === 'h' || unit?.startsWith('hour')
        ? 3600
        : unit === 'd' || unit?.startsWith('day')
          ? 86400
          : 1;
  const seconds = amount * multiplier;

  if (
    !Number.isSafeInteger(seconds) ||
    seconds <= 0 ||
    !Number.isSafeInteger(seconds * 1000)
  ) {
    throw new Error('JWT_EXPIRES_IN must resolve to a positive safe duration.');
  }

  return seconds;
}
