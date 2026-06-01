"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ComboboxPesquisavel } from "@/components/forms/ComboboxPesquisavel";
import { BarraExportacao } from "@/components/forms/BarraExportacao";
import { useVehicles } from "@/hooks/useVehicles";
import { useFuel } from "@/hooks/useFuel";
import { useSync } from "@/hooks/useSync";
import { useToast } from "@/hooks/useToast";
import { abastecimentoSchema } from "@/lib/validations/fuel";
import { mascaraKm, mascaraLitros, mascaraMoeda, parseKm, parseLitros, parseMoeda } from "@/lib/masks";
import { persistence } from "@/lib/persistence/store";
import { addToSyncQueue, isOnline } from "@/lib/offline";
import { STORAGE_KEYS, ROUTES } from "@/lib/constants";

export function AbastecimentoFormPage() {
  const toast = useToast();
  const { veiculos } = useVehicles();
  const { registrar } = useFuel();
  const { sincronizar, syncing } = useSync();
  const [vehicleId, setVehicleId] = useState("");
  const [valor, setValor] = useState("");
  const [litros, setLitros] = useState("");
  const [km, setKm] = useState("");
  const [enviando, setEnviando] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function montarPayload(form?: HTMLFormElement) {
    const fd = form ? new FormData(form) : null;
    return {
      vehicle_id: vehicleId,
      liters: parseLitros(litros),
      cost: parseMoeda(valor),
      mileage_at_fill: parseKm(km),
      station: fd ? String(fd.get("station") ?? "") : "",
      filled_at: fd ? String(fd.get("filled_at") ?? new Date().toISOString()) : new Date().toISOString(),
    };
  }

  function salvarLocal() {
    const payload = montarPayload(formRef.current ?? undefined);
    persistence.saveFuelLocal(payload);
    localStorage.setItem(STORAGE_KEYS.fuelDraft, JSON.stringify({ ...payload, savedAt: new Date().toISOString() }));
    toast.sucesso("Salvo localmente.");
  }

  async function registrarAgora(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    const payload = montarPayload(e.currentTarget);
    const parsed = abastecimentoSchema.safeParse(payload);
    if (!parsed.success) {
      toast.erro(parsed.error.errors[0]?.message ?? "Dados inválidos");
      setEnviando(false);
      return;
    }
    persistence.saveFuelLocal(payload);
    try {
      if (isOnline()) {
        await registrar.mutateAsync(payload);
        toast.sucesso("Abastecimento registrado na API.");
      } else {
        addToSyncQueue({ type: "fuel", payload });
        toast.info("Offline — na fila de sincronização.");
      }
    } catch {
      addToSyncQueue({ type: "fuel", payload });
      toast.aviso("API indisponível. Dados na fila.");
    }
    setEnviando(false);
  }

  const linhas = [{ vehicle_id: vehicleId, valor, litros, km }];

  return (
    <DashboardShell titulo="Registrar Abastecimento">
      <Link href={ROUTES.fuel} className="mb-4 inline-block text-sm text-cyan-400 hover:underline">
        ← Voltar
      </Link>
      <BarraExportacao
        titulo="Abastecimento"
        nomeArquivo="abastecimento"
        colunas={[
          { header: "Veículo", key: "vehicle_id" },
          { header: "Litros", key: "litros" },
          { header: "Valor", key: "valor" },
        ]}
        linhas={linhas}
      />
      <Card className="mt-4">
        <form ref={formRef} onSubmit={registrarAgora} className="grid gap-4 md:grid-cols-2">
          <ComboboxPesquisavel
            label="Veículo"
            name="vehicle_id"
            value={vehicleId}
            onChange={setVehicleId}
            opcoes={veiculos.map((v) => ({ value: v.id, label: v.plate }))}
            required
          />
          <div>
            <Label htmlFor="filled_at">Data</Label>
            <Input id="filled_at" name="filled_at" type="datetime-local" required />
          </div>
          <div>
            <Label>Valor</Label>
            <Input value={valor} onChange={(e) => setValor(mascaraMoeda(e.target.value))} placeholder="R$ 0,00" required />
          </div>
          <div>
            <Label>Litros</Label>
            <Input value={litros} onChange={(e) => setLitros(mascaraLitros(e.target.value))} placeholder="0 L" required />
          </div>
          <div>
            <Label>Posto</Label>
            <Input id="station" name="station" required />
          </div>
          <div>
            <Label>Odômetro</Label>
            <Input value={km} onChange={(e) => setKm(mascaraKm(e.target.value))} placeholder="0 km" required />
          </div>
          <div className="md:col-span-2 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={salvarLocal}>
              Salvar Localmente
            </Button>
            <Button type="button" variant="outline" onClick={() => sincronizar()} disabled={syncing}>
              {syncing ? "Sincronizando..." : "Sincronizar"}
            </Button>
            <Button type="submit" disabled={enviando}>
              {enviando ? "Registrando..." : "Registrar Abastecimento Agora"}
            </Button>
          </div>
        </form>
      </Card>
    </DashboardShell>
  );
}
