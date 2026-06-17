import { test, expect } from "@playwright/test";

test.describe("Login", () => {
  test("exibe formulário de login", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
  });

  test("credenciais inválidas exibem erro", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("invalido@test.com");
    await page.getByLabel("Password").fill("senhaerrada");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(
      page.getByRole("alert").filter({ hasText: /credenciais/i }).or(page.locator(".text-on-error-container"))
    ).toBeVisible({
      timeout: 10_000,
    });
  });
});
