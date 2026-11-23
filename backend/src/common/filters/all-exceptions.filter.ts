import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common' ;
import { Request } from 'express' ;
import { sendError, statusText } from './error-response' ;


// Last safety net: whatever nobody else caught ends here.
// An HttpException keeps its own status and message. Anything else (a bug, the database down...) is a 500
// with a generic text: the stack trace and the real message only go to the server log, never to the client
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {

  private readonly logger = new Logger( AllExceptionsFilter.name ) ;


  catch( exception : unknown, host : ArgumentsHost ) {

    const request = host.switchToHttp().getRequest<Request>() ;


    if( !( exception instanceof HttpException ) ) {

      this.logger.error( `${request.method} ${request.path}`, exception instanceof Error ? exception.stack : String( exception ) ) ;

      return sendError( host, HttpStatus.INTERNAL_SERVER_ERROR, 'Internal server error', statusText( HttpStatus.INTERNAL_SERVER_ERROR ) )

    }


    const status = exception.getStatus() ;

    const body = exception.getResponse() ;


    // new NotFoundException('x') answers { message, error, statusCode }, but new HttpException('x', 418) answers a plain string
    const { message, error } = typeof body === 'string'
      ? { message: body, error: undefined }
      : body as { message? : string | string[] ; error? : string } ;


    // 5xx = our fault, so it goes to the log with its stack. A 4xx is the client's fault and does not
    if( status >= 500 ) this.logger.error( `${request.method} ${request.path} -> ${status}`, exception.stack ) ;

    sendError( host, status, message ?? exception.message, error ?? statusText( status ) )

  }

}
