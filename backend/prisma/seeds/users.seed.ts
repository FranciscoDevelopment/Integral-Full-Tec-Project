import { PrismaClient } from '../../src/generated/prisma/client' ;
import { Role } from '../../src/generated/prisma/enums' ;
import { hashingKey } from '../../src/common/hashing/hash-bcrypt' ;

const DEMO_PASSWORD = "Demo1234" ;

export async function seedUsers ( prisma : PrismaClient ) {

    const demoHash = await hashingKey( DEMO_PASSWORD ) ;


    const adminHash = process.env.SEED_ADMIN_PASSWORD
                    ? await hashingKey( process.env.SEED_ADMIN_PASSWORD )
                    : demoHash
    ;

    
    const users = [
        { email: 'admin@plataforma.test',   name: 'Admin Plataforma', role: Role.admin,   password: adminHash },
        { email: 'ana@plataforma.test',     name: 'Ana Pérez',        role: Role.user,    password: demoHash },
        { email: 'bruno@plataforma.test',   name: 'Bruno Gómez',      role: Role.user,    password: demoHash },
        {
            email: 'sponsor@plataforma.test', name: 'Lucía Fernández', role: Role.sponsor, password: demoHash,
            companyName: 'Lumen Software', website: 'https://lumen.example.com', logoUrl: 'https://lumen.example.com/logo.png'
        }
    ] ;


    for( const user of users ) {

        // update: {} => running the seed twice never overwrites a password someone changed

        await prisma.user.upsert(
            {
                where: {
                    email: user.email,
                },
                update: {},
                create: user
            }
        )

    }


}