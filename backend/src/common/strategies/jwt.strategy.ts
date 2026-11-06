import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AUTH_COOKIE_NAME } from '../constants/auth.constants';
import { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request): string | null => {
          const cookies = request.cookies as
            | Record<string, unknown>
            | undefined;
          const cookie = cookies?.[AUTH_COOKIE_NAME];
          return typeof cookie === 'string' ? cookie : null;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
