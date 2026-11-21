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
  { label: "Novedades", href: "/news" },
  //{ label: "Enlaces", href: "/links" },
  {
    label: "Proyectos",
    href: "/projects",
    children: [
      { label: "Proponer proyecto", href: "/projects/new" },
      { label: "Compartir mi proyecto en avance", href: "/projects/alerts" },
      { label: "Explorar proyectos", href: "/projects" },
      //{ label: "Publicar alertas", href: "/projects/alerts" },
    ],
  },
  { label: "Contactos", href: "/contact" },
];

export const LOGIN_HREF = "/login";
