import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import EmptyState from "./EmptyState";

describe("EmptyState", () => {
  it("renderiza título e descrição", () => {
    render(<EmptyState title="Nenhum item" description="Cadastre o primeiro." />);
    expect(screen.getByText("Nenhum item")).toBeTruthy();
    expect(screen.getByText("Cadastre o primeiro.")).toBeTruthy();
  });

  it("renderiza ação opcional", () => {
    render(<EmptyState title="Vazio" action={<button type="button">Cadastrar</button>} />);
    expect(screen.getByText("Cadastrar")).toBeTruthy();
  });
});
