import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import LoadingState from "./LoadingState";

describe("LoadingState", () => {
  it("renderiza mensagem padrão", () => {
    render(<LoadingState />);
    expect(screen.getByRole("status")).toBeTruthy();
    expect(screen.getByText("Carregando...")).toBeTruthy();
  });

  it("renderiza mensagem customizada", () => {
    render(<LoadingState message="Carregando frota..." />);
    expect(screen.getByText("Carregando frota...")).toBeTruthy();
  });

  it("possui aria-live polite", () => {
    render(<LoadingState />);
    expect(screen.getByRole("status").getAttribute("aria-live")).toBe("polite");
  });
});
