"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BarraExportacao } from "@/components/forms/BarraExportacao";
import { useToast } from "@/hooks/useToast";
import { useVehicles } from "@/hooks/useVehicles";
import { inspecaoCadastroSchema } from "@/lib/validations/inspection";
import { mascaraKm, mascaraPlaca, parseKm } from "@/lib/masks";
import { persistence } from "@/lib/persistence/store";
import { ROUTES } from "@/lib/constants";

export function InspecaoCadastroPage() {
  const toast = useToast();
  const { criar } = useVehicles();
  const [placa, setPlaca] = useState("");
  const [km, setKm] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSalvando(true);
    const fd = new FormData(e.currentTarget);
    const dados = {
      plate: placa,
      brand: String(fd.get("brand")),
      model: String(fd.get("model")),
      year: Number(fd.get("year")),
      mileage: parseKm(km),
    };
    const parsed = inspecaoCadastroSchema.safeParse(dados);
    if (!parsed.success) {
      toast.erro(parsed.error.errors[0]?.message ?? "Dados inválidos");
      setSalvando(false);
      return;
    }
    persistence.saveInspection(dados as Record<string, unknown>);
    try {
      await criar.mutateAsync({
        plate: dados.plate,
        brand: dados.brand,
        model: dados.model,
        year: dados.year,
        mileage: dados.mileage,
      });
      toast.sucesso("Cadastro completo salvo.");
    } catch {
      toast.aviso("Salvo localmente; API indisponível.");
    }
    setSalvando(false);
  }

  const linhas = [{ placa, km }];

  return (
    <DashboardShell titulo="Cadastro de Inspeção">
      <Link href={ROUTES.inspection} className="mb-4 inline-block text-sm text-cyan-400 hover:underline">
        ← Voltar
      </Link>
      <BarraExportacao
        titulo="Inspeção"
        nomeArquivo="inspecao-cadastro"
        colunas={[
          { header: "Placa", key: "placa" },
          { header: "KM", key: "km" },
        ]}
        linhas={linhas}
      />
      <Card className="mt-4">
        <form onSubmit={salvar} className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Placa</Label>
            <Input value={placa} onChange={(e) => setPlaca(mascaraPlaca(e.target.value))} required />
          </div>
          <div>
            <Label>Ano</Label>
            <Input name="year" type="number" required />
          </div>
          <div>
            <Label>Marca</Label>
            <Input name="brand" required />
          </div>
          <div>
            <Label>Modelo</Label>
            <Input name="model" required />
          </div>
          <div className="md:col-span-2">
            <Label>Quilômetros</Label>
            <Input value={km} onChange={(e) => setKm(mascaraKm(e.target.value))} placeholder="0 km" required />
          </div>
          <Button type="submit" variant="purple" disabled={salvando} className="md:col-span-2 w-full sm:w-auto">
            {salvando ? "Salvando..." : "Salvar Cadastro Completo"}
          </Button>
        </form>
      </Card>
    </DashboardShell>
  );
}
