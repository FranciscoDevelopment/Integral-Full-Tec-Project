export type CommunityChannel = "whatsapp" | "linkedin" | "instagram" | "jobs_linkedin";

export interface CommunityLink {
  channel: CommunityChannel;
  label: string;
  description: string;
  url: string;
}

// Static content: shared by the Links page, the Home and the Footer.
export const COMMUNITY_LINKS: readonly CommunityLink[] = [
  {
    channel: "whatsapp",
    label: "WhatsApp",
    description: "Sumate a los grupos para hacer networking con la comunidad.",
    url: "https://chat.whatsapp.com/Ce4YJteKehD2JZUDAQaUxh",
  },
  {
    channel: "linkedin",
    label: "LinkedIn",
    description: "Seguinos para enterarte de las novedades de la comunidad.",
    url: "https://www.linkedin.com/company/programadores-argentina",
  },
  {
    channel: "instagram",
    label: "Instagram",
    description: "Contenido tech y novedades en @programadores_argentina.",
    url: "https://www.instagram.com/programadores_argentina/",
  },
  {
    channel: "jobs_linkedin",
    label: "LinkedIn con ofertas laborales",
    description: "La página de LinkedIn donde publicamos ofertas de trabajo IT.",
    url: "https://www.linkedin.com/company/79406869/",
  },
];
