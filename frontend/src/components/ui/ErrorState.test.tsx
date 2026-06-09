import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ErrorState from "./ErrorState";

describe("ErrorState", () => {
  it("exibe mensagem de erro", () => {
    render(<ErrorState message="Falha ao carregar." />);
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText("Falha ao carregar.")).toBeTruthy();
  });

  it("chama onRetry ao clicar no botão", () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Erro" onRetry={onRetry} />);
    fireEvent.click(screen.getByText("Tentar novamente"));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("não exibe botão retry sem onRetry", () => {
    render(<ErrorState message="Erro" />);
    expect(screen.queryByText("Tentar novamente")).toBeNull();
  });
});
