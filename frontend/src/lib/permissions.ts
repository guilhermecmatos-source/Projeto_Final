import { User } from "@/types";

export type FleetRole =
  | "administrador"
  | "gestor"
  | "motorista"
  | "solicitante"
  | "admin"
  | "attendant"
  | "client";

export function normalizeRole(role?: string): FleetRole {
  const map: Record<string, FleetRole> = {
    admin: "administrador",
    attendant: "gestor",
    client: "solicitante",
    administrador: "administrador",
    gestor: "gestor",
    motorista: "motorista",
    solicitante: "solicitante",
  };
  return map[role?.toLowerCase() ?? ""] ?? "solicitante";
}

const ROUTE_PERMISSIONS: Record<string, FleetRole[]> = {
  "/dashboard": ["administrador", "gestor", "motorista", "solicitante"],
  "/vehicles": ["administrador", "gestor"],
  "/drivers": ["administrador", "gestor"],
  "/travels": ["administrador", "gestor", "motorista", "solicitante"],
  "/logistics": ["administrador", "gestor", "motorista"],
  "/maintenance": ["administrador", "gestor"],
  "/fuel": ["administrador", "gestor", "motorista"],
  "/inspection": ["administrador", "gestor", "motorista"],
  "/ai-security": ["administrador", "gestor"],
  "/intelligence": ["administrador", "gestor"],
  "/reports": ["administrador", "gestor"],
  "/partners": ["administrador", "gestor"],
  "/adm/assinatura": ["administrador", "gestor"],
  "/users": ["administrador"],
  "/cockpit": ["administrador", "gestor"],
  "/admin-solicitacoes": ["administrador"],
  "/chat": ["administrador", "gestor", "motorista", "solicitante"],
  "/notifications": ["administrador", "gestor", "motorista", "solicitante"],
  "/marketplace": ["administrador", "gestor"],
  "/profile": ["administrador", "gestor", "motorista", "solicitante"],
};

export function canAccessRoute(user: User | null, href: string): boolean {
  if (!user) return false;
  const role = normalizeRole(user.role);
  const base = Object.keys(ROUTE_PERMISSIONS).find((r) => href === r || href.startsWith(`${r}/`));
  if (!base) return true;
  return ROUTE_PERMISSIONS[base].includes(role);
}

export function filterNavByRole<T extends { href: string }>(items: T[], user: User | null): T[] {
  return items.filter((item) => canAccessRoute(user, item.href));
}
