import { HandCoins, Rocket, Users, type LucideIcon } from "lucide-react";
import { PageContainer } from "@/shared/components/layout/page-container";
import { Card } from "@/shared/components/ui/card";


type StepT = {
    icon : LucideIcon ;
    title : string ;
    description : string ;
}


const STEPS : readonly StepT[] = [

    {
        icon: Rocket,
        title: "Publicá tu proyecto",
        description: "Contá qué estás construyendo, dejá el link al repositorio y definí cuánto necesitás para llegar a la meta."
    },
    {
        icon: Users,
        title: "Sumá colaboradores",
        description: "Otras personas piden participar en tu proyecto. Vos revisás cada solicitud y confirmás a quién sumás."
    },
    {
        icon: HandCoins,
        title: "Recibí apoyo",
        description: "Los sponsors pueden aportar a tu meta y todos siguen el avance a medida que publicás novedades."
    }

] ;


export function HowItWorksSection () {

    return(

        <PageContainer className="flex flex-col gap-8 py-12">

            <div className="flex flex-col gap-1 text-center">

                <h2 className="text-2xl font-bold tracking-tight text-slate-900">¿Cómo funciona?</h2>

                <p className="text-slate-600">Tres pasos, de tu idea al proyecto en marcha. En un ámbito colaborativo</p>

            </div>

            <ul className="grid gap-4 sm:grid-cols-3">

                { STEPS.map( ( { icon : Icon, title, description: description } ) => (

                    <li key={title}>

                        <Card className="flex h-full flex-col items-start gap-3">

                            <span className="flex size-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700">

                                <Icon aria-hidden className="size-6" />

                            </span>

                            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>

                            <p className="text-sm text-slate-600">{description}</p>

                        </Card>

                    </li>

                ) ) }

            </ul>

        </PageContainer>

    )

}
