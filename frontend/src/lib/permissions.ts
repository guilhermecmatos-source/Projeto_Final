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
  "/command-center": ["administrador", "gestor"],
  "/users": ["administrador"],
  "/vehicles": ["administrador", "gestor"],
  "/drivers": ["administrador", "gestor"],
  "/logistics": ["administrador", "gestor", "motorista"],
  "/maintenance": ["administrador", "gestor"],
  "/fuel": ["administrador", "gestor", "motorista"],
  "/inspection": ["administrador", "gestor", "motorista"],
  "/reports": ["administrador", "gestor"],
  "/bi": ["administrador", "gestor"],
  "/documents": ["administrador", "gestor"],
  "/copilot": ["administrador", "gestor"],
  "/mobile": ["administrador", "gestor", "motorista", "solicitante"],
  "/notifications": ["administrador", "gestor", "motorista", "solicitante"],
  "/perfis": ["administrador"],
  "/ai-security": ["administrador", "gestor"],
  "/chat": ["administrador", "gestor", "motorista", "solicitante"],
  "/partners": ["administrador", "gestor"],
  "/settings": ["administrador"],
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
