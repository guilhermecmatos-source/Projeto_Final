"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ComboboxPesquisavel } from "@/components/forms/ComboboxPesquisavel";
import { BarraExportacao } from "@/components/forms/BarraExportacao";
import { atribuicaoVeiculoSchema, type AtribuicaoVeiculoInput } from "@/lib/validations/vehicle";
import { useVehicles } from "@/hooks/useVehicles";
import { useDrivers } from "@/hooks/useDrivers";
import { useToast } from "@/hooks/useToast";
import { travelsApi } from "@/services/travels.service";
import { ROUTES } from "@/lib/constants";

export function AtribuicaoVeiculoPage() {
  const toast = useToast();
  const { veiculos } = useVehicles();
  const { motoristas } = useDrivers();
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<AtribuicaoVeiculoInput>({
    resolver: zodResolver(atribuicaoVeiculoSchema),
  });

  async function onSubmit(dados: AtribuicaoVeiculoInput) {
    try {
      await travelsApi.create({
        vehicle_id: vehicleId,
        driver_id: driverId,
        origin: dados.origin,
        destination: dados.destination,
        distance_km: 0,
        fuel_consumption: 0,
      });
      toast.sucesso("Veículo atribuído e viagem criada.");
    } catch {
      toast.erro("Falha na atribuição.");
    }
  }

  const linhas = [{ veiculo: vehicleId, motorista: driverId }];

  return (
    <DashboardShell titulo="Atribuir Veículo">
      <Link href={ROUTES.vehicles} className="mb-4 inline-block text-sm text-cyan-400 hover:underline">
        ← Voltar
      </Link>
      <BarraExportacao
        titulo="Atribuição"
        nomeArquivo="atribuicao"
        colunas={[
          { header: "Veículo", key: "veiculo" },
          { header: "Motorista", key: "motorista" },
        ]}
        linhas={linhas}
      />
      <Card className="mt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
          <ComboboxPesquisavel
            label="Veículo"
            name="vehicle_id"
            value={vehicleId}
            onChange={(v) => setVehicleId(v)}
            opcoes={veiculos.map((v) => ({ value: v.id, label: v.plate }))}
            required
          />
          <ComboboxPesquisavel
            label="Motorista"
            name="driver_id"
            value={driverId}
            onChange={(v) => setDriverId(v)}
            opcoes={motoristas.map((d) => ({ value: d.id, label: d.name }))}
            required
          />
          <div>
            <Label>Origem</Label>
            <Input {...register("origin")} />
          </div>
          <div>
            <Label>Destino</Label>
            <Input {...register("destination")} />
          </div>
          <Button type="submit" disabled={isSubmitting} className="md:col-span-2 w-full sm:w-auto">
            Atribuir Veículo
          </Button>
        </form>
      </Card>
    </DashboardShell>
  );
}
