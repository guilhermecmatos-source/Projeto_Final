import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ListPageStates from "./ListPageStates";

describe("ListPageStates", () => {
  const base = {
    emptyTitle: "Vazio",
    children: <p>Conteúdo</p>,
  };

  it("prioriza loading sobre outros estados", () => {
    render(
      <ListPageStates loading error="Erro" isEmpty onRetry={() => {}} {...base} />
    );
    expect(screen.getByRole("status")).toBeTruthy();
    expect(screen.queryByText("Conteúdo")).toBeNull();
  });

  it("exibe erro quando não está loading", () => {
    render(
      <ListPageStates loading={false} error="Falha na API" isEmpty onRetry={() => {}} {...base} />
    );
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText("Falha na API")).toBeTruthy();
  });

  it("exibe empty quando sem loading nem erro", () => {
    render(
      <ListPageStates loading={false} error={null} isEmpty onRetry={() => {}} {...base} />
    );
    expect(screen.getByText("Vazio")).toBeTruthy();
    expect(screen.queryByText("Conteúdo")).toBeNull();
  });

  it("renderiza children quando dados disponíveis", () => {
    render(
      <ListPageStates loading={false} error={null} isEmpty={false} {...base} />
    );
    expect(screen.getByText("Conteúdo")).toBeTruthy();
  });
});
