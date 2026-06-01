import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  Car,
  ClipboardCheck,
  Fuel,
  LayoutDashboard,
  Map,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { ROUTES } from "./constants";

export interface ItemNavegacao {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const ITENS_SIDEBAR: ItemNavegacao[] = [
  { href: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: ROUTES.vehicles, label: "Veículos", icon: Car },
  { href: ROUTES.fuel, label: "Abastecimentos", icon: Fuel },
  { href: ROUTES.alerts, label: "Alertas IA", icon: AlertTriangle },
  { href: ROUTES.fleetIntelligence, label: "Fleet Intelligence", icon: Sparkles },
  { href: ROUTES.mapOperations, label: "Mapa Operacional", icon: Map },
  { href: ROUTES.maintenance, label: "Manutenção", icon: Wrench },
  { href: ROUTES.inspection, label: "Inspeção", icon: ClipboardCheck },
  { href: ROUTES.reports, label: "Relatórios", icon: BarChart3 },
  { href: ROUTES.profiles, label: "Perfis", icon: Users },
];
