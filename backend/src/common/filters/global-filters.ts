import { APP_FILTER } from '@nestjs/core' ;
import { AllExceptionsFilter } from './all-exceptions.filter' ;
import { PrismaExceptionFilter } from './prisma-exception.filter' ;


// Nest tries the global filters from the LAST one to the first and uses the first that matches.
// So the catch-all goes first (tried last) and the specific one after it (tried first).
// If they were the other way around, @Catch() would swallow every Prisma error as a 500
export const GLOBAL_EXCEPTION_FILTERS = [

  { provide: APP_FILTER, useClass: AllExceptionsFilter },    // tried 2nd: anything

  { provide: APP_FILTER, useClass: PrismaExceptionFilter }   // tried 1st: Prisma errors

]
