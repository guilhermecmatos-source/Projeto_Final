export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard Principal", icon: "dashboard" },
  { href: "/users", label: "Controle de Usuários", icon: "manage_accounts" },
  { href: "/vehicles", label: "Inventário de Frota", icon: "directions_car" },
  { href: "/drivers", label: "Gestão de Motoristas", icon: "person" },
  { href: "/travels", label: "Viagens & Despacho", icon: "alt_route" },
  { href: "/maintenance", label: "Manutenção & Alertas", icon: "build" },
  { href: "/fuel", label: "Abastecimentos", icon: "local_gas_station" },
  { href: "/inspection", label: "Inspeção Veicular", icon: "fact_check" },
  { href: "/ai-security", label: "IA Suporte", icon: "psychology" },
  { href: "/intelligence", label: "Fleet Intelligence", icon: "insights" },
  { href: "/reports", label: "Relatórios Estratégicos", icon: "bar_chart" },
  { href: "/partners", label: "Parceiros & Oficinas", icon: "handshake" },
  { href: "/admin-solicitacoes", label: "Aprovações RUV", icon: "rule" },
];

export const AUTH_ROUTES = ["/login", "/forgot-password"];
