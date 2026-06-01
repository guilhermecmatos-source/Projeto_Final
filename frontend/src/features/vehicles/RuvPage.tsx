"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BarraExportacao } from "@/components/forms/BarraExportacao";
import { ComboboxPesquisavel } from "@/components/forms/ComboboxPesquisavel";
import { useVehicles } from "@/hooks/useVehicles";
import { useDrivers } from "@/hooks/useDrivers";
import { useSync } from "@/hooks/useSync";
import { useToast } from "@/hooks/useToast";
import { persistence } from "@/lib/persistence/store";
import { addToSyncQueue, getRuvDraft, saveRuvDraft } from "@/lib/offline";
import { exportarPdf } from "@/lib/export/documents";
import { formularioParaObjeto } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

export function RuvPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const toast = useToast();
  const { sincronizar, syncing } = useSync();
  const { veiculos } = useVehicles();
  const { motoristas } = useDrivers();
  const [auth, setAuth] = useState("007194");
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const draft = getRuvDraft();
    if (draft && formRef.current) {
      Object.entries(draft).forEach(([k, v]) => {
        if (k === "savedAt") return;
        const el = formRef.current?.elements.namedItem(k);
        if (el instanceof HTMLInputElement) el.value = String(v ?? "");
      });
    }
  }, []);

  function dadosForm() {
    if (!formRef.current) return {};
    return { ...formularioParaObjeto(new FormData(formRef.current)), auth_number: auth, vehicle_id: vehicleId, driver_id: driverId };
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setSalvando(true);
    const data = dadosForm();
    saveRuvDraft(data);
    persistence.saveRuv(data);
    addToSyncQueue({ type: "ruv", payload: data });
    await sincronizar();
    toast.sucesso("RUV salva e persistida.");
    setSalvando(false);
  }

  function exportar() {
    const data = dadosForm();
    exportarPdf({
      titulo: `RUV ${auth}`,
      subtitulo: "Requisição de Utilização de Veículo — A4 Retrato",
      retrato: true,
      nomeArquivo: `ruv-${auth}`,
      colunas: [
        { header: "Campo", key: "campo" },
        { header: "Valor", key: "valor" },
      ],
      linhas: Object.entries(data).map(([campo, valor]) => ({ campo, valor: String(valor) })),
    });
  }

  const linhasExport = Object.entries(dadosForm()).map(([campo, valor]) => ({
    campo,
    valor: String(valor),
  }));

  return (
    <DashboardShell titulo="RUV">
      <Link href={ROUTES.vehicles} className="mb-4 inline-block text-sm text-cyan-400 hover:underline">
        ← Voltar
      </Link>
      <BarraExportacao titulo="RUV" nomeArquivo={`ruv-${auth}`} colunas={[{ header: "Campo", key: "campo" }, { header: "Valor", key: "valor" }]} linhas={linhasExport} />
      <Card className="mt-4">
        <form ref={formRef} onSubmit={salvar} className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Autorização nº</Label>
            <Input value={auth} onChange={(e) => setAuth(e.target.value)} name="auth_number" readOnly />
          </div>
          <ComboboxPesquisavel label="Veículo" name="vehicle_id" value={vehicleId} onChange={setVehicleId} opcoes={veiculos.map((v) => ({ value: v.id, label: v.plate }))} required />
          <ComboboxPesquisavel label="Motorista" name="driver_id" value={driverId} onChange={setDriverId} opcoes={motoristas.map((d) => ({ value: d.id, label: d.name }))} required />
          <div>
            <Label>Destino</Label>
            <Input name="destination" required />
          </div>
          <div>
            <Label>Passageiros</Label>
            <Input name="passengers" required />
          </div>
          <div>
            <Label>Requisitante</Label>
            <Input name="requester_name" required />
          </div>
          <div className="md:col-span-2 flex flex-wrap gap-2">
            <Button type="submit" variant="purple" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => sincronizar()} disabled={syncing}>
              {syncing ? "Sincronizando..." : "Sincronizar Agora"}
            </Button>
            <Button type="button" variant="outline" onClick={exportar}>
              PDF Retrato
            </Button>
          </div>
        </form>
      </Card>
    </DashboardShell>
  );
}
