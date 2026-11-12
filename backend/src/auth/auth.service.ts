import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config'
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { SigninDto } from './dto/signin.dto';
import { checkTheRespectiveKey, hashingKey } from 'src/common/hashing/hash-bcrypt';
import { createHash } from 'node:crypto';
import { JwtPayload } from 'src/common/types/jwt-payload.type';
import { tokensT } from 'src/common/types/jwt.types';
import { Role, UserStatus } from 'src/generated/prisma/enums';


// Compared against when the email does not exist, so the response time does not reveal which emails are registered
const DUMMY_HASH = '$2b$10$zV.vkbrZhWyBoHDoV07HfOh1PmWKXB0iAoTyUX/cNrnFP1NgjbuxS' ;


@Injectable()
export class AuthService {

  constructor(
    private readonly usersService : UsersService,
    private readonly jwtService : JwtService,
    private readonly configService : ConfigService
  ) {

    // Fail at startup, not at the first signin
    for( const key of [ 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'JWT_EXPIRES_IN', 'JWT_REFRESH_EXPIRES_IN' ] ) {

      if( !this.configService.get<string>(key) ) throw new Error( `Missing environment variable ${key}` ) ;

    }


    // With the same secret an access token would also pass as a refresh token
    if( this.configService.get<string>('JWT_SECRET') === this.configService.get<string>('JWT_REFRESH_SECRET') ) {

      throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be different')

    }

  }


  async signup( signupDto : CreateUserDto ) {

    const user = await this.usersService.create( signupDto ) ;

    const tokens = await this.generateTokens( user.id, user.email, user.role )


    return {
      user: new UserEntity( user ),
      tokens
    }

  }


  async signin( signinDto : SigninDto ) {

    const user = await this.usersService.findByEmailWithPassword( signinDto.email ) ;


    const passwordChecking = await checkTheRespectiveKey( signinDto.password, user?.password ?? DUMMY_HASH ) ;

    if( !user || !passwordChecking ) throw new UnauthorizedException('Invalid credentials') ;


    if( user.status === UserStatus.suspended ) throw new ForbiddenException('Your account is suspended') ;


    const tokens = await this.generateTokens( user.id, user.email, user.role ) ;


    return {
      user: new UserEntity( user ),
      tokens
    }

  }


  async refresh( userId : string, refreshToken : string ) {

    const user = await this.usersService.findByIdWithRefreshToken(userId) ;

    if( !user?.hashedRefreshToken ) throw new ForbiddenException('Access denied') ;


    const coincide = await checkTheRespectiveKey( this.resume(refreshToken), user.hashedRefreshToken )

    if( !coincide ) {

      // A refresh token that is not the last one issued was already used: close the whole session
      await this.usersService.updateRefreshToken( user.id, null ) ;

      throw new ForbiddenException( 'Access denied' )

    }


    if( user.status === UserStatus.suspended ) {

      await this.usersService.updateRefreshToken( user.id, null ) ;

      throw new ForbiddenException('Your account is suspended')

    }


    return this.generateTokens( user.id, user.email, user.role )

  }


  // Best effort: with a missing, invalid or expired refresh token there is nothing left to revoke
  async logout( refreshToken : string | undefined ) {

    if( !refreshToken ) return ;


    let payload : JwtPayload ;


    try{

      payload = await this.jwtService.verifyAsync<JwtPayload>( refreshToken, {

        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET')

      } )

    }
    catch {
      return
    }


    await this.usersService.updateRefreshToken( payload.sub, null )

  }


  private async generateTokens( userId : string, email : string, role : Role ) : Promise<tokensT> {

    const payload = {sub: userId, email, role} ;

    const [ accessToken, refreshToken ] = await Promise.all(
      [
        this.jwtService.signAsync( payload, {

          secret: this.configService.getOrThrow<string>('JWT_SECRET'),

          expiresIn: this.expiresIn('JWT_EXPIRES_IN')

        } )
        ,
        this.jwtService.signAsync( payload, {

          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),

          expiresIn: this.expiresIn('JWT_REFRESH_EXPIRES_IN')

        } )
      ]
    )


    const hashedRefreshToken = await hashingKey( this.resume( refreshToken ) )


    await this.usersService.updateRefreshToken( userId, hashedRefreshToken )


    return {
      accessToken,
      refreshToken,
      accessExpiresAt: this.expirationOf( accessToken ),
      refreshExpiresAt: this.expirationOf( refreshToken )
    }

  }


  // bcrypt only reads the first 72 bytes and every JWT starts with the same header: hash a digest instead
  private resume( token : string ) {

    return createHash('sha256').update(token).digest('hex')

  }


  private expiresIn( key : 'JWT_EXPIRES_IN' | 'JWT_REFRESH_EXPIRES_IN' ) {

    return this.configService.getOrThrow<string>( key ) as JwtSignOptions['expiresIn']

  }


  private expirationOf( token : string ) {

    const { exp } = this.jwtService.decode<{exp: number}>( token ) ;

    return new Date( exp * 1000 )

  }


}
