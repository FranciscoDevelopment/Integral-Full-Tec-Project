import { FeaturedProjects } from "@/features/projects/components/featured-projects";
import { HomeHero } from "@/shared/components/home/home-hero";
import { HowItWorksSection } from "@/shared/components/how-it-works-section";
//import { HomeSection } from "@/features/home/components/home-section" ;
import { HomeSection } from "@/shared/components/home/home-section";
import { EmptyState } from "@/shared/components/ui";

export default function HomePage() {

  return (
    <>
      <HomeHero />


      <HomeSection 
        title="Proyectos destacados" 
        description="Los proyectos que más se estan moviendo"
        href="/projects"
        linkLabel="Explorar proyectos"
      >
        
        <FeaturedProjects />

      </HomeSection>


      <HomeSection
        title="Colaborá en un proyecto"
        description="Pedí sumarte y seguí el estado de tus solicitudes"
        href="/collaborations"
        linkLabel="Mis colaboraciones"
      >

        {/* Agustin: a summary component can go here; for now the link above is the entry point */}
        <EmptyState title="Elegí un proyecto y tocá Quiero ayudar" />

      </HomeSection>
      
      <HowItWorksSection />
      
      {/*
      <CommunityCounters />
      */}



    </>
  );
}
