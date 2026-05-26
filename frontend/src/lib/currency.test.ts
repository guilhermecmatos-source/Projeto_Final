import { describe, expect, it } from "vitest";
import { formatBRL, maskBRLInput, parseBRL } from "./currency";

describe("currency BRL", () => {
  it("formata valor em Real brasileiro", () => {
    expect(formatBRL(1250.9)).toMatch(/1\.250,90/);
  });

  it("aplica máscara durante digitação", () => {
    expect(maskBRLInput("125090")).toBe("1.250,90");
  });

  it("faz parse de string mascarada para decimal", () => {
    expect(parseBRL("1.250,90")).toBe(1250.9);
    expect(parseBRL("")).toBe(0);
  });
});
