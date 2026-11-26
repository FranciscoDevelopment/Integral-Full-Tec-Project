import { Controller, Post, Body, UseInterceptors, ClassSerializerInterceptor, HttpCode, HttpStatus, UseGuards, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { CookieOptions, Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto'; 
import { RefreshTokenGuard, requestWithRefreshT } from './guards/refresh-token/refresh-token.guard';
import { REFRESH_COOKIE_NAME, REFRESH_COOKIE_PATH } from './constants/auth-cookies.constants';
import { SIGNIN_THROTTLE, SIGNUP_THROTTLE } from './constants/auth-throttle.constants';
import { readCookie } from './utils/read-cookie.util';
import { Public } from 'src/common/decorators/public.decorator';
import { AUTH_COOKIE_NAME } from 'src/common/constants/auth.constants';
import { tokensT } from 'src/common/types/jwt.types';
import { CreateUserDto } from 'src/users/dto/create-user.dto';


@UseInterceptors( ClassSerializerInterceptor )
@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService,
    private readonly configService : ConfigService
  ) {}


  @Public()
  @Throttle( SIGNUP_THROTTLE )
  @Post('signup')
  async signup( @Body() signupDto : CreateUserDto, @Res( {passthrough: true} ) response : Response ) {

    const { user, tokens } = await this.authService.signup( signupDto )

    this.setSessionCookies( response, tokens ) ;


    return {
      user,
      accessToken: tokens.accessToken,
      expiresAt: tokens.accessExpiresAt
    }

  }



  @Public()
  @Throttle( SIGNIN_THROTTLE )
  @Post('signin')
  @HttpCode( HttpStatus.OK )
  async signin( @Body() loginDto : LoginDto, @Res( {passthrough: true} ) response : Response ) {

    const { user, tokens } = await this.authService.signin( loginDto )

    this.setSessionCookies( response, tokens ) ;


    return {
      user,
      accessToken: tokens.accessToken,
      expiresAt: tokens.accessExpiresAt
    }

  }


  @Public()
  @UseGuards( RefreshTokenGuard )
  @Post('refresh')
  @HttpCode( HttpStatus.OK )
  async refresh( @Req() request : requestWithRefreshT, @Res( {passthrough: true} ) response : Response ) {

    const tokens = await this.authService.refresh( request.user!.sub, request.refreshToken! )

    this.setSessionCookies( response, tokens ) ;


    return {
      accessToken: tokens.accessToken,
      expiresAt: tokens.accessExpiresAt
    }

  }


  // Public on purpose: with an expired access token the user must still be able to log out
  @Public()
  @Post('logout')
  @HttpCode( HttpStatus.NO_CONTENT )
  async logout( @Req() request : Request, @Res( {passthrough: true} ) response : Response ) {

    await this.authService.logout( readCookie( request, REFRESH_COOKIE_NAME ) )

    this.clearSessionCookies( response )

  }


  private cookieOptions( path : string ) : CookieOptions {

    // true only when the API is served over HTTPS (COOKIE_SECURE=true in production)
    const secure = this.configService.get<string>('COOKIE_SECURE') === 'true' ;


    return {

      httpOnly: true,

      // Over HTTPS the front (Vercel) and the API (Render) are different sites: a Lax cookie would
      // never travel between them. Browsers only accept SameSite=None together with Secure, so
      // both switch on the same flag. Locally (http, same site) it stays Lax.
      // None lets any page trigger a request with the cookie: originCheck() (main.ts) covers that
      sameSite: secure  ?  'none'  :  'lax',

      secure,

      path

    }

  }


  private setSessionCookies( response : Response, tokens : tokensT ) {

    response.cookie( AUTH_COOKIE_NAME, tokens.accessToken, {

      ...this.cookieOptions('/'),

      expires: tokens.accessExpiresAt

    } )


    response.cookie( REFRESH_COOKIE_NAME, tokens.refreshToken, {

      ...this.cookieOptions( REFRESH_COOKIE_PATH ),

      expires: tokens.refreshExpiresAt

    } )

  }


  private clearSessionCookies( response : Response ) {

    response.clearCookie( AUTH_COOKIE_NAME, this.cookieOptions('/') )

    response.clearCookie( REFRESH_COOKIE_NAME, this.cookieOptions( REFRESH_COOKIE_PATH ) )

  }


}
