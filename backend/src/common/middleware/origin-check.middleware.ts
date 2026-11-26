import { NextFunction, Request, Response } from 'express' ;


const SAFE_METHODS = [ 'GET', 'HEAD', 'OPTIONS' ] ;


// In production the front and the API live on different sites, so the session cookies are
// SameSite=None and the browser attaches them to requests sent from ANY page. CORS stops a
// malicious page from reading a response, not from sending the request: a plain <form> POST
// would still reach the API with the user's cookies.
// A browser always sends the Origin header on those requests, so any unsafe request that comes
// from an origin other than the front is rejected here. No Origin header means the caller is not
// a web page (curl, Postman, tests, server to server), so it cannot be a forged browser request.
export function originCheck ( allowedOrigin : string ) {

    return ( request : Request, response : Response, next : NextFunction ) : void => {

        const origin = request.headers.origin ;


        if( SAFE_METHODS.includes( request.method ) || origin === undefined || origin === allowedOrigin ) {

            next() ;

            return ;

        }


        response.status( 403 ).json( { statusCode: 403, message: 'Origin not allowed', error: 'Forbidden' } ) ;

    } ;

}
