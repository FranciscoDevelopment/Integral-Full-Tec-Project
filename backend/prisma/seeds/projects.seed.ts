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
        { id: '00000000-0000-4000-8000-000000000003', title: 'CLI para generar changelogs', description: 'Herramienta de línea de comandos que arma el changelog a partir de los commits.', repoUrl: 'https://github.com/ana-perez/changelog-cli', kind: ProjectKind.tool, goalAmount: '300.00', status: ProjectStatus.active, ownerId: ana.id },
        { id: '00000000-0000-4000-8000-000000000004', title: 'Bot de recordatorios', description: 'Bot que envía recordatorios de tareas por chat. Ya alcanzó su meta.', repoUrl: 'https://github.com/bruno-gomez/bot-recordatorios', kind: ProjectKind.app, goalAmount: '500.00', status: ProjectStatus.completed, ownerId: bruno.id },
        { id: '00000000-0000-4000-8000-000000000005', title: 'Utilidad interna (oculto)', description: 'Proyecto oculto: sirve para probar el 404 y la moderación.', repoUrl: 'https://github.com/ana-perez/utilidad-oculta', kind: ProjectKind.tool, goalAmount: '200.00', status: ProjectStatus.hidden, ownerId: ana.id },
        { id: '00000000-0000-4000-8000-000000000006', title: 'Ajedrez online', description: 'Juego de ajedrez multijugador en el navegador, con partidas en tiempo real, reloj y ranking de jugadores.', repoUrl: 'https://github.com/bruno-gomez/ajedrez-online', kind: ProjectKind.game, goalAmount: '1200.00', status: ProjectStatus.active, ownerId: bruno.id },
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