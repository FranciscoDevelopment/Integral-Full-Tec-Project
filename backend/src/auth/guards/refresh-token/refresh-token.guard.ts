import {CanActivate,ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from 'src/common/types/jwt-payload.type';
import { REFRESH_COOKIE_NAME } from 'src/auth/constants/auth-cookies.constants';
import { readCookie } from 'src/auth/utils/read-cookie.util';


export type requestWithRefreshT = Request & {
  user? : JwtPayload ;
  refreshToken? : string
}


@Injectable()
export class RefreshTokenGuard implements CanActivate {


  constructor(
    private readonly jwtService : JwtService,
    private readonly configService : ConfigService
  ) {}


  async canActivate(context: ExecutionContext) :  Promise<boolean> {

    const request = context.switchToHttp().getRequest<requestWithRefreshT>() ;


    const token = this.extractToken( request )

    if( !token ) throw new UnauthorizedException('Refresh Token is required') ;


    try{

      const payload = await this.jwtService.verifyAsync<JwtPayload>( token, {

          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET')

      } )

      request.user = payload ;

      request.refreshToken = token

    }
    catch{
      throw new UnauthorizedException('Refresh token invalid or expired')
    }


    return true

  }


  // The refresh_token cookie first (browser), then the Bearer header (Postman / Swagger)
  private extractToken( request : Request ) {

    const cookie = readCookie( request, REFRESH_COOKIE_NAME ) ;

    if( cookie ) return cookie ;


    const [ type, token ] = request.headers.authorization?.split(' ') ?? [] ;


    return type === 'Bearer'  ?  token  :  undefined

  }

}
