import { Controller, Post, Body, UseInterceptors, ClassSerializerInterceptor, HttpCode, HttpStatus, UseGuards, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { CookieOptions, Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { RefreshTokenGuard, requestWithRefreshT } from './guards/refresh-token/refresh-token.guard';
import { REFRESH_COOKIE_NAME, REFRESH_COOKIE_PATH } from './constants/auth-cookies.constants';
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
  @Throttle( {default: {limit: 5, ttl: 60000}} )
  @Post('signin')
  @HttpCode( HttpStatus.OK )
  async signin( @Body() signinDto : SigninDto, @Res( {passthrough: true} ) response : Response ) {

    const { user, tokens } = await this.authService.signin( signinDto )

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

    return {

      httpOnly: true,

      sameSite: 'lax',

      // true only when the API is served over HTTPS (COOKIE_SECURE=true in production)
      secure: this.configService.get<string>('COOKIE_SECURE') === 'true',

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
