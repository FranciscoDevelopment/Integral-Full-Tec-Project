import { PrismaClient } from '../../src/generated/prisma/client' ;
import { ProjectKind, ProjectStatus } from '../../src/generated/prisma/enums' ;


export async function seedProjects ( prisma : PrismaClient ) {

    const ana = await prisma.user.findUniqueOrThrow(
        {
            where: {
                email: 'ana@plataforma.test'
            },
            select: {
                id: true
            }
        }
    );


    const bruno = await prisma.user.findUniqueOrThrow(
        {
            where: {
                email: "bruno@plataforma.test"
            },
            select: {
                id: true
            }
        }
    )


    const projects = [
        { id: '00000000-0000-4000-8000-000000000001', title: 'Gestor de tareas colaborativo', description: 'App web para organizar tareas en equipo con tableros y etiquetas.', repoUrl: 'https://github.com/ana-perez/gestor-tareas', kind: ProjectKind.app, goalAmount: '1500.00', status: ProjectStatus.active, ownerId: ana.id },
        { id: '00000000-0000-4000-8000-000000000002', title: 'Plataformer retro', description: 'Juego de plataformas en 2D con estética de 8 bits.', repoUrl: 'https://github.com/bruno-gomez/plataformer-retro', kind: ProjectKind.game, goalAmount: '800.00', status: ProjectStatus.active, ownerId: bruno.id },
        // ...los otros 3: tool/active (ana), app/completed (bruno) y tool/hidden (ana)
    ] ;



    for ( const project of projects ) {

        await prisma.project.upsert(
            {
                
                where: {
                    id: project.id
                },

                update: {},

                create: project
            
            }
        )

    }



}