"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { VehicleCard } from "@/components/cards/VehicleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useVehicles } from "@/hooks/useVehicles";
import { ROUTES } from "@/lib/constants";

export function VeiculosListPage() {
  const { veiculos, isLoading, isError } = useVehicles();

  return (
    <DashboardShell
      titulo="Veículos"
      acao={
        <Button size="sm" asChild>
          <Link href={ROUTES.vehiclesRegister}>
            <Plus className="h-4 w-4" />
            Cadastrar
          </Link>
        </Button>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <Link href={ROUTES.vehiclesAssign} className="text-cyan-400 hover:underline">
          Atribuir veículo
        </Link>
        <span className="text-gray-600">·</span>
        <Link href={ROUTES.vehiclesRuv} className="text-cyan-400 hover:underline">
          RUV
        </Link>
        <span className="text-gray-600">·</span>
        <Link href={ROUTES.vehiclesMovement} className="text-cyan-400 hover:underline">
          Movimentação
        </Link>
      </div>
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}
      {isError && (
        <p className="rounded-xl border border-amber-800/50 bg-amber-950/30 p-4 text-amber-200">
          API indisponível. Cadastre veículos quando o backend estiver online.
        </p>
      )}
      {!isLoading && veiculos.length === 0 && (
        <p className="text-center text-gray-500 py-12">Nenhum veículo cadastrado.</p>
      )}
      <div className="grid gap-3">
        {veiculos.map((v) => (
          <VehicleCard key={v.id} veiculo={v} />
        ))}
      </div>
    </DashboardShell>
  );
}
