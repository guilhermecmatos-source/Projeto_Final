import { describe, expect, it } from "vitest";
import { canAccessRoute, filterNavByRole, normalizeRole } from "./permissions";
import { User } from "@/types";

const admin: User = { id: "1", name: "Admin", email: "a@test.com", role: "administrador" };
const gestor: User = { id: "2", name: "Gestor", email: "g@test.com", role: "gestor" };
const solicitante: User = { id: "3", name: "Sol", email: "s@test.com", role: "solicitante" };

describe("normalizeRole", () => {
  it("normaliza alias admin para administrador", () => {
    expect(normalizeRole("admin")).toBe("administrador");
  });

  it("retorna solicitante para perfil desconhecido", () => {
    expect(normalizeRole("unknown")).toBe("solicitante");
  });
});

describe("canAccessRoute", () => {
  it("permite administrador em /users", () => {
    expect(canAccessRoute(admin, "/users")).toBe(true);
  });

  it("nega solicitante em /users", () => {
    expect(canAccessRoute(solicitante, "/users")).toBe(false);
  });

  it("permite gestor em /vehicles", () => {
    expect(canAccessRoute(gestor, "/vehicles")).toBe(true);
  });

  it("permite rota não mapeada por padrão", () => {
    expect(canAccessRoute(solicitante, "/travels/register")).toBe(true);
  });
});

describe("filterNavByRole", () => {
  it("remove /users para gestor", () => {
    const items = [
      { href: "/dashboard", label: "Dash" },
      { href: "/users", label: "Users" },
    ];
    const filtered = filterNavByRole(items, gestor);
    expect(filtered.map((i) => i.href)).toEqual(["/dashboard"]);
  });
});
