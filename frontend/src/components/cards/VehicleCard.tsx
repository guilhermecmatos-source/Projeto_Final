"use client";

import { Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Vehicle } from "@/types";
import { mascaraKm } from "@/lib/masks";

interface VehicleCardProps {
  veiculo: Vehicle;
  kmL?: string;
  statusConsumo?: string;
}

export function VehicleCard({ veiculo, kmL, statusConsumo }: VehicleCardProps) {
  const statusVariant =
    veiculo.status === "active" ? "success" : veiculo.status === "maintenance" ? "warning" : "low";

  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900/40 p-4">
      <div className="rounded-xl bg-cyan-500/10 p-3">
        <Car className="h-6 w-6 text-cyan-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-100">{veiculo.plate}</p>
        <p className="text-sm text-gray-500">
          {veiculo.brand} {veiculo.model} · {mascaraKm(String(veiculo.mileage))}
        </p>
      </div>
      {kmL && <span className="text-sm text-cyan-400">{kmL} km/L</span>}
      {statusConsumo && <span className="text-xs text-gray-500">{statusConsumo}</span>}
      <Badge variant={statusVariant}>{veiculo.status}</Badge>
    </div>
  );
}
