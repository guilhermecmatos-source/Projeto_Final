"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { QrCode } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ComboboxPesquisavel } from "@/components/forms/ComboboxPesquisavel";
import { BarraExportacao } from "@/components/forms/BarraExportacao";
import { useVehicles } from "@/hooks/useVehicles";
import { useToast } from "@/hooks/useToast";
import { maintenanceApi } from "@/services/maintenance.service";
import { manutencaoSchema } from "@/lib/validations/maintenance";
import { ROUTES } from "@/lib/constants";

export function ManutencaoFormPage() {
  const toast = useToast();
  const { veiculos } = useVehicles();
  const [vehicleId, setVehicleId] = useState("");
  const [salvando, setSalvando] = useState(false);
  const scanRef = useRef<HTMLInputElement>(null);

  async function salvar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSalvando(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      vehicle_id: vehicleId,
      type: fd.get("type") as "preventive" | "corrective",
      description: String(fd.get("description")),
      cost: Number(fd.get("cost") || 0),
      scheduled_at: String(fd.get("scheduled_at")),
    };
    const parsed = manutencaoSchema.safeParse(payload);
    if (!parsed.success) {
      toast.erro(parsed.error.errors[0]?.message ?? "Inválido");
      setSalvando(false);
      return;
    }
    try {
      await maintenanceApi.create(payload);
      toast.sucesso("Manutenção agendada.");
      e.currentTarget.reset();
    } catch {
      toast.erro("Falha ao salvar manutenção.");
    }
    setSalvando(false);
  }

  function abrirScan() {
    scanRef.current?.click();
  }

  function onScanFile(file: File | undefined) {
    if (!file) return;
    const placa = file.name.replace(/\.[^.]+$/, "").toUpperCase().slice(0, 8);
    const match = veiculos.find((v) => v.plate.includes(placa));
    if (match) {
      setVehicleId(match.id);
      toast.sucesso(`Veículo ${match.plate} identificado.`);
    } else {
      toast.aviso("Placa não encontrada na frota. Selecione manualmente.");
    }
  }

  const linhas = [{ vehicle_id: vehicleId }];

  return (
    <DashboardShell titulo="Registrar Manutenção">
      <Link href={ROUTES.maintenance} className="mb-4 inline-block text-sm text-cyan-400 hover:underline">
        ← Voltar
      </Link>
      <BarraExportacao
        titulo="Manutenção"
        nomeArquivo="manutencao"
        colunas={[{ header: "Veículo", key: "vehicle_id" }]}
        linhas={linhas}
      />
      <Card className="mt-4">
        <form onSubmit={salvar} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2 flex gap-2">
            <ComboboxPesquisavel
              label="Veículo"
              name="vehicle_id"
              value={vehicleId}
              onChange={setVehicleId}
              opcoes={veiculos.map((v) => ({ value: v.id, label: v.plate }))}
              required
            />
            <Button type="button" variant="outline" className="mt-6" onClick={abrirScan}>
              <QrCode className="h-4 w-4" />
              Escanear
            </Button>
            <input
              ref={scanRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => onScanFile(e.target.files?.[0])}
            />
          </div>
          <div>
            <Label>Tipo</Label>
            <select name="type" className="flex h-10 w-full rounded-xl border border-gray-700 bg-gray-900 px-3 text-sm" required>
              <option value="preventive">Preventiva</option>
              <option value="corrective">Corretiva</option>
            </select>
          </div>
          <div>
            <Label>Data agendada</Label>
            <Input name="scheduled_at" type="datetime-local" required />
          </div>
          <div className="md:col-span-2">
            <Label>Descrição</Label>
            <Input name="description" required />
          </div>
          <div>
            <Label>Custo (R$)</Label>
            <Input name="cost" type="number" step="0.01" />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" variant="purple" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </Card>
    </DashboardShell>
  );
}
