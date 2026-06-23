import { test, expect } from "@playwright/test";

test.describe("Vehicles and RUV Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Autenticar
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

  test("deve listar veiculos da API e cadastrar novo veiculo", async ({ page }) => {
    await page.goto("/vehicles");
    
    // Verifica se carregou algum veiculo no grid (ex: Toyota Hilux da seed)
    await expect(page.locator("text=Toyota").or(page.locator("text=TOYOTA"))).toBeVisible({ timeout: 10000 });

    // Abre o modal de cadastro
    await page.getByRole("button", { name: /cadastrar veículo/i }).click();

    // Gera placa aleatoria para nao conflitar com placas existentes
    const randPlate = `ABC${Math.floor(Math.random() * 9000 + 1000)}`;

    // Preenche o modal
    await page.locator('input[name="plate"]').fill(randPlate);
    await page.locator('input[name="brand"]').fill("TESTBRAND");
    await page.locator('input[name="model"]').fill("TESTMODEL");

    // Salva o registro
    await page.getByRole("button", { name: /salvar registro/i }).click();

    // Verifica se o novo veiculo aparece na listagem
    await expect(page.locator(`text=${randPlate}`)).toBeVisible({ timeout: 10000 });
  });

  test("deve cadastrar nova RUV com sucesso", async ({ page }) => {
    await page.goto("/travels/ruv");

    // Espera o formulario e os dropdowns carregarem
    await page.locator('input[name="time_from"]').fill("08:00");
    await page.locator('input[name="time_to"]').fill("18:00");

    // Seleciona tipo de veiculo
    await page.locator('input[name="vehicle_type"][value="Passageiro"]').check();

    // Preenche passageiros, destino, servico, requisitante, autorizacao
    await page.locator('input[name="descricao"]').fill("Test Passengers Group");
    await page.locator('input[name="destination"]').fill("Test Destination City");
    await page.locator('input[name="service"]').fill("Inspection Trip");
    await page.locator('input[name="requester_name"]').fill("Requestor Name Test");
    await page.locator('input[name="authorization_ref"]').fill("REF-12345");

    // Seleciona combustivel
    await page.locator('select[name="fuel_type"]').selectOption("Gasolina");

    // Submete a RUV
    await page.getByRole("button", { name: /salvar ruv/i }).first().click();

    // Verifica mensagem de sucesso
    await expect(page.locator("text=RUV salva com sucesso!")).toBeVisible({ timeout: 15000 });
  });
});
