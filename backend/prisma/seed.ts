import 'dotenv/config' ;
import { PrismaPg } from '@prisma/adapter-pg' ;
import { PrismaClient } from '../src/generated/prisma/client' ;
import { seedUsers } from './seeds/users.seed' ;
import { seedProjects } from './seeds/projects.seed' ;


if( process.env.NODE_ENV === "production" && !process.env.SEED_ADMIN_PASSWORD ) {

    throw new Error( "Set SEED_ADMIN_PASSWORD to seed a production database" )

}


const prisma = new PrismaClient(
    {
        adapter: new PrismaPg( {
            connectionString: process.env.DATABASE_URL
        } )
    }
)


async function main() {

    await seedUsers( prisma )

    await seedProjects( prisma )

}


main()
    .catch( (error) => {
        
        console.error( error )

        process.exitCode = 1

    } )
    .finally( () => prisma.$disconnect() )

