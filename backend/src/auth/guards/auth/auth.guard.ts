import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "src/common/decorators/public.decorator";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { JwtPayload } from "src/common/types/jwt-payload.type";


/*
    Global guard (APP_GUARD): every route needs a valid access token unless it is marked with @Public().

    The token check itself is delegated to the shared JwtAuthGuard / JwtStrategy, which read the token
    from the access_token cookie or from the Bearer header.
*/
@Injectable()
export class AuthGuard extends JwtAuthGuard {

    constructor( private readonly reflector : Reflector ) {

        super()

    }


    canActivate( context : ExecutionContext ) {

        const isPublic = this.reflector.getAllAndOverride<boolean>( IS_PUBLIC_KEY, [

            context.getHandler(),
            context.getClass()

        ])


        if(isPublic) return true


        return super.canActivate( context )

    }


    handleRequest<TUser = JwtPayload>( err : unknown, user : TUser | false, info : unknown ) : TUser {

        if( err || !user ) {

            const withoutToken = info instanceof Error && info.message === 'No auth token' ;


            throw new UnauthorizedException( withoutToken  ?  'Access Token is required'  :  'Invalid or expired Token' )

        }


        return user

    }

}
