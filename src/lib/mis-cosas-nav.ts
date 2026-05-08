export type MisCosasNavHref =
  | "/mis-cosas/anuncios"
  | "/mis-cosas/mensajes"
  | "/mis-cosas/favoritos"
  | "/mis-cosas/configuracion";

export type MisCosasNavItem = {
  href: MisCosasNavHref;
  label: string;
  match: (pathname: string) => boolean;
};

export const MIS_COSAS_NAV: readonly MisCosasNavItem[] = [
  {
    href: "/mis-cosas/anuncios",
    label: "Mis anuncios",
    match: (p) =>
      p === "/mis-cosas/anuncios" || p.startsWith("/mis-cosas/anuncios/"),
  },
  {
    href: "/mis-cosas/mensajes",
    label: "Mensajes",
    match: (p) => p.startsWith("/mis-cosas/mensajes"),
  },
  {
    href: "/mis-cosas/favoritos",
    label: "Mis favoritos",
    match: (p) => p === "/mis-cosas/favoritos",
  },
  {
    href: "/mis-cosas/configuracion",
    label: "Configuración",
    match: (p) => p.startsWith("/mis-cosas/configuracion"),
  },
];

export function activeMisCosasSection(
  pathname: string,
): MisCosasNavItem | undefined {
  return MIS_COSAS_NAV.find((item) => item.match(pathname));
}
