import { describe, expect, it } from "vitest";
import { extractApiError } from "./api-errors";

describe("extractApiError", () => {
  it("retorna mensagem de conexão quando não há response", () => {
    expect(extractApiError({})).toMatch(/conectar à API/);
  });

  it("retorna mensagem de timeout para ECONNABORTED", () => {
    expect(extractApiError({ code: "ECONNABORTED" })).toMatch(/expirou/);
  });

  it("retorna mensagem de servidor para status 500", () => {
    expect(extractApiError({ response: { status: 500 } })).toMatch(/indisponível.*\(HTTP 500\)/);
  });

  it("retorna erro da API quando disponível", () => {
    expect(
      extractApiError({ response: { status: 400, data: { error: "CPF inválido" } } })
    ).toBe("CPF inválido (HTTP 400)");
  });

  it("usa fallback para erros sem mensagem da API", () => {
    expect(extractApiError({ response: { status: 404 } }, "Recurso não encontrado.")).toBe(
      "Recurso não encontrado. (HTTP 404)"
    );
  });
});
