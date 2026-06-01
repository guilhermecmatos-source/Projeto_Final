"use client";

import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFuel } from "@/hooks/useFuel";
import { formatarMoeda } from "@/lib/masks";
import { ROUTES } from "@/lib/constants";

export function AbastecimentosListPage() {
  const { registros, isLoading } = useFuel();

  return (
    <DashboardShell
      titulo="Abastecimentos"
      acao={
        <Button size="sm" asChild>
          <Link href={ROUTES.fuelRegister}>Registrar</Link>
        </Button>
      }
    >
      {isLoading && <Skeleton className="h-24 w-full" />}
      {!isLoading && registros.length === 0 && (
        <p className="py-12 text-center text-gray-500">Nenhum abastecimento na API.</p>
      )}
      <ul className="space-y-2">
        {registros.map((r, i) => (
          <li key={r.id ?? i} className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
            <p className="font-medium text-gray-100">
              {formatarMoeda(r.cost ?? 0)} · {r.liters} L
            </p>
            <p className="text-sm text-gray-500">{r.station}</p>
          </li>
        ))}
      </ul>
    </DashboardShell>
  );
}
