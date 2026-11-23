import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common' ;
import { Request } from 'express' ;
import { Prisma } from 'src/generated/prisma/client' ;
import { sendError, statusText } from './error-response' ;


type PrismaErrorT = { status : number ; message : string } ;

// Prisma codes we know how to translate to a proper HTTP status.
// The message never names the table or the column: it only says what happened
const PRISMA_ERRORS : Record< string, PrismaErrorT | undefined > = {

  // Unique constraint failed (two signups with the same email at the same time, for example)
  P2002 : { status: HttpStatus.CONFLICT, message: 'A record with that value already exists' },

  // Foreign key constraint failed (deleting something that is still referenced, or pointing to something that does not exist)
  P2003 : { status: HttpStatus.CONFLICT, message: 'The operation conflicts with related records' },

  // The record an update or delete needed was not found
  P2025 : { status: HttpStatus.NOT_FOUND, message: 'The record was not found' }

}


// The services already check the usual cases before touching the database (users.service.ts, projects.service.ts).
// This is the net for the ones they miss, so a Prisma error never comes out as a 500
@Catch( Prisma.PrismaClientKnownRequestError )
export class PrismaExceptionFilter implements ExceptionFilter {

  private readonly logger = new Logger( PrismaExceptionFilter.name ) ;


  catch( exception : Prisma.PrismaClientKnownRequestError, host : ArgumentsHost ) {

    const request = host.switchToHttp().getRequest<Request>() ;

    const known = PRISMA_ERRORS[ exception.code ] ;


    const status = known?.status ?? HttpStatus.INTERNAL_SERVER_ERROR ;

    const message = known?.message ?? 'Internal server error' ;


    // A mapped code means a service did not check first (or lost a race): just a warning. An unknown one is a real problem
    if( known ) this.logger.warn( `${request.method} ${request.path} -> ${status} (prisma ${exception.code})` ) ;
    else this.logger.error( `${request.method} ${request.path} (prisma ${exception.code})`, exception.stack ) ;


    sendError( host, status, message, statusText( status ) )

  }

}
