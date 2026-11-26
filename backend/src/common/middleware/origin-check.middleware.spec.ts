import { NextFunction, Request, Response } from 'express' ;
import { originCheck } from './origin-check.middleware' ;


const FRONT = 'https://front.example.com' ;


function run ( method : string, origin? : string ) {

    const request = { method, headers: origin === undefined  ?  {}  :  { origin } } as Request ;

    const json = jest.fn() ;

    const status = jest.fn().mockReturnValue( { json } ) ;

    const response = { status } as unknown as Response ;

    const next = jest.fn() as unknown as NextFunction ;


    originCheck( FRONT )( request, response, next ) ;


    return { next, status, json } ;

}


describe( 'originCheck', () => {

    it( 'lets an unsafe request from the front through', () => {

        const { next, status } = run( 'POST', FRONT ) ;

        expect( next ).toHaveBeenCalledTimes( 1 ) ;
        expect( status ).not.toHaveBeenCalled() ;

    } ) ;


    it.each( [ 'POST', 'PATCH', 'DELETE' ] )( 'rejects a %s from another origin with 403', method => {

        const { next, status, json } = run( method, 'https://evil.example.com' ) ;

        expect( next ).not.toHaveBeenCalled() ;
        expect( status ).toHaveBeenCalledWith( 403 ) ;
        expect( json ).toHaveBeenCalledWith( expect.objectContaining( { statusCode: 403 } ) ) ;

    } ) ;


    it( 'rejects the opaque origin "null" (sandboxed iframes, some redirects)', () => {

        const { next, status } = run( 'POST', 'null' ) ;

        expect( next ).not.toHaveBeenCalled() ;
        expect( status ).toHaveBeenCalledWith( 403 ) ;

    } ) ;


    it( 'does not touch safe methods, even from another origin', () => {

        for( const method of [ 'GET', 'HEAD', 'OPTIONS' ] ) {

            const { next, status } = run( method, 'https://evil.example.com' ) ;

            expect( next ).toHaveBeenCalledTimes( 1 ) ;
            expect( status ).not.toHaveBeenCalled() ;

        }

    } ) ;


    it( 'lets requests without Origin through (curl, Postman, tests)', () => {

        const { next, status } = run( 'POST' ) ;

        expect( next ).toHaveBeenCalledTimes( 1 ) ;
        expect( status ).not.toHaveBeenCalled() ;

    } ) ;

} ) ;
