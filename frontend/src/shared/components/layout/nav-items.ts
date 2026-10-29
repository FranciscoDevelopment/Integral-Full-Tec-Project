export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  // For a group, `href` is the base path used to mark the group as active.
  href: string;
  children?: readonly NavChild[];
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Últimas novedades", href: "/news" },
  {
    label: "Ofertas laborales",
    href: "/jobs",
    children: [
      { label: "Buscar trabajos", href: "/jobs" },
      { label: "Publicar oferta", href: "/jobs/new" },
      { label: "Configurar alertas", href: "/jobs/alerts" },
    ],
  },
  { label: "Enlaces", href: "/links" },
  { label: "Contacto", href: "/contact" },
];

export const LOGIN_HREF = "/login";
