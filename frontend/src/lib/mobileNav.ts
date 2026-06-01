export interface MobileNavItem {
  href: string;
  label: string;
  icon: string;
}

/** Atalhos principais na barra inferior (mobile). */
export const MOBILE_BOTTOM_NAV: MobileNavItem[] = [
  { href: "/dashboard", label: "Início", icon: "dashboard" },
  { href: "/travels", label: "Viagens", icon: "alt_route" },
  { href: "/vehicles", label: "Frota", icon: "directions_car" },
  { href: "/drivers", label: "Pilotos", icon: "person" },
];
