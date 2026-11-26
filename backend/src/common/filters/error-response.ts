import { ArgumentsHost, HttpStatus } from '@nestjs/common' ;
import { Request, Response } from 'express' ;


// Same shape Nest answers by default ({ statusCode, message, error }) plus where and when it happened.
// The front reads message as string | string[] (see api-client.ts): do not nest it
export type ErrorResponseT = {
  statusCode : number ;
  message : string | string[] ;
  error : string ;
  path : string ;
  timestamp : string ;
}


// 404 -> "Not Found", 500 -> "Internal Server Error"
export function statusText( status : number ) : string {

  const name = HttpStatus[ status ] as string | undefined ;

  if( !name ) return 'Error' ;

  return name.split( '_' ).map( word => word.charAt(0) + word.slice(1).toLowerCase() ).join( ' ' ) ;

}


export function sendError( host : ArgumentsHost, status : number, message : string | string[], error : string ) {

  const context = host.switchToHttp() ;

  const request = context.getRequest<Request>() ;

  const response = context.getResponse<Response>() ;


  const body : ErrorResponseT = {
    statusCode: status,
    message,
    error,
    path: request.path,
    timestamp: new Date().toISOString()
  }

  response.status( status ).json( body )

}
