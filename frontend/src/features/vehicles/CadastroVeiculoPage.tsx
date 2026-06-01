"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UploadFotosVeiculo } from "./components/UploadFotosVeiculo";
import { cadastroVeiculoSchema, type CadastroVeiculoInput } from "@/lib/validations/vehicle";
import { useVehicles } from "@/hooks/useVehicles";
import { useToast } from "@/hooks/useToast";
import { mascaraKm, mascaraPlaca, parseKm } from "@/lib/masks";
import { ROUTES } from "@/lib/constants";

export function CadastroVeiculoPage() {
  const toast = useToast();
  const { criar } = useVehicles();
  const [kmTexto, setKmTexto] = useState("");
  const [placa, setPlaca] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CadastroVeiculoInput>({
    resolver: zodResolver(cadastroVeiculoSchema),
  });

  async function onSubmit(dados: CadastroVeiculoInput) {
    try {
      await criar.mutateAsync({
        plate: placa,
        brand: dados.brand,
        model: dados.model,
        year: dados.year,
        mileage: parseKm(kmTexto) || dados.mileage,
      });
      toast.sucesso("Veículo cadastrado com sucesso.");
    } catch {
      toast.erro("Falha ao cadastrar. Verifique a API.");
    }
  }

  return (
    <DashboardShell titulo="Cadastrar Veículo">
      <Link href={ROUTES.vehicles} className="mb-4 inline-block text-sm text-cyan-400 hover:underline">
        ← Voltar
      </Link>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="plate">Placa</Label>
            <Input
              id="plate"
              value={placa}
              onChange={(e) => setPlaca(mascaraPlaca(e.target.value))}
              placeholder="ABC-1234"
            />
            {errors.plate && <p className="mt-1 text-xs text-red-400">{errors.plate.message}</p>}
          </div>
          <div>
            <Label htmlFor="brand">Marca</Label>
            <Input id="brand" {...register("brand")} />
          </div>
          <div>
            <Label htmlFor="model">Modelo</Label>
            <Input id="model" {...register("model")} />
          </div>
          <div>
            <Label htmlFor="year">Ano</Label>
            <Input id="year" type="number" {...register("year")} />
          </div>
          <div>
            <Label htmlFor="mileage">Quilometragem</Label>
            <Input
              id="mileage"
              value={kmTexto}
              onChange={(e) => setKmTexto(mascaraKm(e.target.value))}
              placeholder="0 km"
            />
          </div>
          <div className="md:col-span-2">
            <UploadFotosVeiculo />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? "Cadastrando..." : "Cadastrar Veículo"}
            </Button>
          </div>
        </form>
      </Card>
    </DashboardShell>
  );
}
