export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard Principal", icon: "dashboard" },
  { href: "/users", label: "Usuários", icon: "manage_accounts" },
  { href: "/vehicles", label: "Veículos", icon: "directions_car" },
  { href: "/drivers", label: "Motoristas", icon: "person" },
  { href: "/travels", label: "Viagens", icon: "alt_route" },
  { href: "/logistics", label: "Logística", icon: "route" },
  { href: "/maintenance", label: "Manutenção", icon: "build" },
  { href: "/fuel", label: "Abastecimentos", icon: "local_gas_station" },
  { href: "/inspection", label: "Inspeção", icon: "fact_check" },
  { href: "/ai-security", label: "IA Suporte", icon: "psychology" },
  { href: "/intelligence", label: "Inteligência", icon: "insights" },
  { href: "/reports", label: "Relatórios", icon: "bar_chart" },
  { href: "/partners", label: "Parceiros & Oficinas", icon: "handshake" },
  { href: "/adm/assinatura", label: "Contratos", icon: "gavel" },
];

export const AUTH_ROUTES = ["/login", "/forgot-password"];
