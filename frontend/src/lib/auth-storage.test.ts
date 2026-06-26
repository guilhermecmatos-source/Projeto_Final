import { beforeEach, describe, expect, it } from "vitest";
import { clearStoredAuth, getStoredAuth, setStoredAuth } from "./auth-storage";

describe("auth storage", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it("persists auth data in sessionStorage instead of localStorage", () => {
    setStoredAuth("token-123", { id: "u1", name: "Ana", email: "ana@example.com", role: "admin" } as any);

    expect(sessionStorage.getItem("token")).toBe("token-123");
    expect(localStorage.getItem("token")).toBeNull();
    expect(getStoredAuth().token).toBe("token-123");
    expect(getStoredAuth().user?.id).toBe("u1");
  });

  it("clears auth data from sessionStorage", () => {
    setStoredAuth("token-456", { id: "u2", name: "Bia", email: "bia@example.com", role: "gestor" } as any);

    clearStoredAuth();

    expect(getStoredAuth()).toEqual({ token: null, user: null });
    expect(sessionStorage.getItem("token")).toBeNull();
  });
});
