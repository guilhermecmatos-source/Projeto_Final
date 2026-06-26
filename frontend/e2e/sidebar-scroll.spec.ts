import { test, expect } from "@playwright/test";

test.describe("Sidebar Scroll Retention", () => {
  test.beforeEach(async ({ page }) => {
    // Intercept all API calls to mock them, so that the tests don't require the backend database
    await page.route("**/api/**", async (route) => {
      const url = route.request().url();
      if (url.includes("/api/auth/login")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            token: "fake-jwt-token",
            user: { id: 1, name: "Administrador", email: "admin@fleetai.com", role: "administrador" }
          })
        });
      } else if (url.includes("/api/auth/me")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ id: 1, name: "Administrador", email: "admin@fleetai.com", role: "administrador" })
        });
      } else if (url.includes("/api/dashboard")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            kpis: { activeVehicles: 12, totalDrivers: 8, pendingMaintenances: 3, fuelConsumption: 8.5 },
            alerts: [],
            recentTravels: []
          })
        });
      } else if (url.includes("/api/settings")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            theme: "dark",
            notificationsEnabled: true
          })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([])
        });
      }
    });

    // Authenticate
    await page.goto("/login");
    await page.getByLabel("Email").fill("admin@fleetai.com");
    await page.getByLabel("Password").fill("admin123");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });

    // Programmatic LGPD acceptance bypass using logged-in user id
    await page.evaluate(() => {
      const u = localStorage.getItem("user");
      if (u) {
        const userObj = JSON.parse(u);
        if (userObj && userObj.id) {
          localStorage.setItem(`lgpd_accepted_${userObj.id}`, "true");
        }
      }
    });

    // Reload page to apply the bypass and ensure the modal is gone
    await page.reload();
    await page.waitForURL("**/dashboard", { timeout: 10000 });
  });

  test("should preserve sidebar scroll position across navigation", async ({ page, isMobile }) => {
    if (isMobile) {
      test.skip(true, "Sidebar is not scrollable/visible by default on mobile device viewports");
      return;
    }

    const sidebarNav = page.locator("aside nav");
    await expect(sidebarNav).toBeVisible();

    // Scroll the sidebar down
    await sidebarNav.evaluate((el) => {
      el.scrollTop = 200;
    });

    // Verify it actually scrolled
    const scrollTop = await sidebarNav.evaluate((el) => el.scrollTop);
    expect(scrollTop).toBeGreaterThanOrEqual(150);

    // Click on "Configurações" link in the menu (which is at the bottom)
    const configLink = page.getByRole("link", { name: "Configurações" });
    await expect(configLink).toBeVisible();
    await configLink.click();

    // Wait for the new page URL
    await page.waitForURL("**/settings", { timeout: 10000 });

    // Wait a brief moment to ensure scroll restoration settles
    await page.waitForTimeout(500);

    // Verify that the scroll position is still restored/maintained
    const newSidebarNav = page.locator("aside nav");
    await expect(newSidebarNav).toBeVisible();
    const newScrollTop = await newSidebarNav.evaluate((el) => el.scrollTop);
    
    // We expect it to be restored
    expect(newScrollTop).toBeGreaterThanOrEqual(150);
  });
});
