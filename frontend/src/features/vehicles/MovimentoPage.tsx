"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BarraExportacao } from "@/components/forms/BarraExportacao";
import { useSync } from "@/hooks/useSync";
import { useToast } from "@/hooks/useToast";
import { persistence } from "@/lib/persistence/store";
import { addToSyncQueue, saveLogisticsDraft } from "@/lib/offline";
import { formularioParaObjeto } from "@/lib/utils";
import { mascaraKm } from "@/lib/masks";
import { ROUTES } from "@/lib/constants";

export function MovimentoPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const toast = useToast();
  const { sincronizar, syncing } = useSync();
  const [kmRodado, setKmRodado] = useState<number | "">("");
  const [salvando, setSalvando] = useState(false);

  function calcKm(ini: string, fim: string) {
    const a = Number(ini);
    const b = Number(fim);
    if (!Number.isNaN(a) && !Number.isNaN(b) && b >= a) setKmRodado(b - a);
    else setKmRodado("");
  }

  function payload() {
    if (!formRef.current) return {};
    return { ...formularioParaObjeto(new FormData(formRef.current)), km_rodado: kmRodado === "" ? 0 : kmRodado };
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setSalvando(true);
    const data = payload();
    saveLogisticsDraft(data);
    persistence.saveLogistics(data);
    addToSyncQueue({ type: "logistics", payload: data });
    await sincronizar();
    toast.sucesso("Movimentação salva localmente.");
    setSalvando(false);
  }

  const linhas = Object.entries(payload()).map(([campo, valor]) => ({
    campo,
    valor: String(valor),
  }));

  return (
    <DashboardShell titulo="Movimentação do Veículo">
      <Link href={ROUTES.vehicles} className="mb-4 inline-block text-sm text-cyan-400 hover:underline">
        ← Voltar
      </Link>
      <BarraExportacao
        titulo="Movimentação"
        nomeArquivo="movimentacao"
        colunas={[{ header: "Campo", key: "campo" }, { header: "Valor", key: "valor" }]}
        linhas={linhas}
      />
      <Card className="mt-4">
        <form ref={formRef} onSubmit={salvar} className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Local de saída</Label>
            <Input name="departure_location" required />
          </div>
          <div>
            <Label>Local de chegada</Label>
            <Input name="arrival_location" required />
          </div>
          <div>
            <Label>KM inicial</Label>
            <Input name="odometer_start" type="number" required onChange={(e) => calcKm(e.target.value, (formRef.current?.elements.namedItem("odometer_end") as HTMLInputElement)?.value ?? "")} />
          </div>
          <div>
            <Label>KM final</Label>
            <Input name="odometer_end" type="number" required onChange={(e) => calcKm((formRef.current?.elements.namedItem("odometer_start") as HTMLInputElement)?.value ?? "", e.target.value)} />
          </div>
          <div className="md:col-span-2 rounded-lg bg-cyan-500/10 p-3">
            <p className="text-xs text-gray-500">KM rodado</p>
            <p className="text-xl font-bold text-cyan-300">
              {kmRodado === "" ? "—" : mascaraKm(String(kmRodado))}
            </p>
          </div>
          <div className="md:col-span-2 flex flex-wrap gap-2">
            <Button type="submit" variant="purple" disabled={salvando}>
              Salvar
            </Button>
            <Button type="button" variant="secondary" onClick={() => sincronizar()} disabled={syncing}>
              {syncing ? "Sincronizando..." : "Sincronizar Agora"}
            </Button>
          </div>
        </form>
      </Card>
    </DashboardShell>
  );
}
