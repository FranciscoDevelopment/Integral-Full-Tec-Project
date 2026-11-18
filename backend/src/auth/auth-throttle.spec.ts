import { INestApplication } from '@nestjs/common' ;
import { ConfigService } from '@nestjs/config' ;
import { APP_GUARD } from '@nestjs/core' ;
import { Test } from '@nestjs/testing' ;
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler' ;
import * as request from 'supertest' ;
import type { App } from 'supertest/types' ;
import { AuthController } from './auth.controller' ;
import { AuthService } from './auth.service' ;
import { RefreshTokenGuard } from './guards/refresh-token/refresh-token.guard' ;
import { SIGNIN_THROTTLE, SIGNUP_THROTTLE } from './constants/auth-throttle.constants' ;


// The real AuthController with its real @Throttle decorators, but without the database:
// AuthService is a mock. The global throttler is configured like the one in app.module.ts
describe( 'Auth rate limit', () => {


    let app : INestApplication<App> ;

    const tokens = {

        accessToken: 'access',
        refreshToken: 'refresh',
        accessExpiresAt: new Date( Date.now() + 60000 ),
        refreshExpiresAt: new Date( Date.now() + 60000 )

    } ;

    const authServiceMock = {

        signin: jest.fn().mockResolvedValue( { user: { id: 'user-1' }, tokens } ),
        signup: jest.fn().mockResolvedValue( { user: { id: 'user-1' }, tokens } )

    } ;


    const signin = () => request( app.getHttpServer() ).post('/auth/signin').send( { email: 'ana@plataforma.test', password: 'Demo1234' } ) ;

    const signup = () => request( app.getHttpServer() ).post('/auth/signup').send( { name: 'Ana', email: 'ana@plataforma.test', password: 'Demo1234' } ) ;


    // A new app per test: the throttler counters live in memory, so each test starts from zero
    beforeEach( async () => {

        const moduleRef = await Test.createTestingModule( {

            imports: [ ThrottlerModule.forRoot( [ { ttl: 60000, limit: 600 } ] ) ],

            controllers: [ AuthController ],

            providers: [

                { provide: AuthService, useValue: authServiceMock },

                { provide: ConfigService, useValue: { get: () => 'false' } },

                { provide: APP_GUARD, useClass: ThrottlerGuard }

            ]

        } )
            .overrideGuard( RefreshTokenGuard ).useValue( { canActivate: () => true } )
            .compile() ;


        app = moduleRef.createNestApplication() ;

        await app.init() ;

    } ) ;


    afterEach( async () => {

        await app.close() ;

    } ) ;


    it( 'signin: lets the allowed attempts through and blocks the next one with 429', async () => {

        for( let attempt = 0 ; attempt < SIGNIN_THROTTLE.default.limit ; attempt++ ) {

            await signin().expect( 200 ) ;

        }


        await signin().expect( 429 ) ;

    } ) ;


    it( 'signin: the block lasts longer than the counting window', async () => {

        for( let attempt = 0 ; attempt < SIGNIN_THROTTLE.default.limit ; attempt++ ) await signin() ;


        const blocked = await signin().expect( 429 ) ;

        const retryAfterSeconds = Number( blocked.headers['retry-after'] ) ;


        expect( retryAfterSeconds ).toBeGreaterThan( SIGNIN_THROTTLE.default.ttl / 1000 ) ;

        expect( retryAfterSeconds ).toBeLessThanOrEqual( SIGNIN_THROTTLE.default.blockDuration / 1000 ) ;

    } ) ;


    it( 'signup: lets the allowed accounts through and blocks the next one with 429', async () => {

        for( let attempt = 0 ; attempt < SIGNUP_THROTTLE.default.limit ; attempt++ ) {

            await signup().expect( 201 ) ;

        }


        await signup().expect( 429 ) ;

    } ) ;


    it( 'a blocked signin does not block the signup (each route has its own counter)', async () => {

        for( let attempt = 0 ; attempt <= SIGNIN_THROTTLE.default.limit ; attempt++ ) await signin() ;


        await signin().expect( 429 ) ;

        await signup().expect( 201 ) ;

    } ) ;


} ) ;
