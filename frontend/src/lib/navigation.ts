export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/command-center", label: "Central de Operações", icon: "radar" },
  { href: "/users", label: "Usuários", icon: "manage_accounts" },
  { href: "/vehicles", label: "Veículos", icon: "directions_car" },
  { href: "/drivers", label: "Motoristas", icon: "person" },
  { href: "/logistics", label: "Logística", icon: "alt_route" },
  { href: "/maintenance", label: "Manutenção", icon: "build" },
  { href: "/fuel", label: "Abastecimento", icon: "local_gas_station" },
  { href: "/inspection", label: "Inspeções", icon: "fact_check" },
  { href: "/reports", label: "Relatórios", icon: "bar_chart" },
  { href: "/bi", label: "BI", icon: "insights" },
  { href: "/documents", label: "Documentos", icon: "folder" },
  { href: "/copilot", label: "Copilot IA", icon: "smart_toy" },
  { href: "/mobile", label: "Aplicativo Mobile", icon: "smartphone" },
  { href: "/notifications", label: "Notificações", icon: "notifications" },
  { href: "/comercial", label: "Comercial", icon: "storefront" },
  { href: "/perfis", label: "Perfis", icon: "admin_panel_settings" },
  { href: "/ai-security", label: "Segurança IA", icon: "psychology" },
  { href: "/chat", label: "Chat Corporativo", icon: "chat" },
  { href: "/partners", label: "Rede Credenciada", icon: "handshake" },
  { href: "/settings", label: "Configurações", icon: "settings" },
];

export const AUTH_ROUTES = ["/login", "/forgot-password"];
