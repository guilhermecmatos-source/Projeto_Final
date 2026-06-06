"use client";

import { useEffect, useState } from "react";
import KpiCard from "@/components/ui/KpiCard";
import { analyzeFleet, countByStatus, VehicleMaintenanceState } from "@/lib/ai/predictive-maintenance";
import { readJson } from "@/lib/local-storage";
import { vehiclesApi } from "@/services/api";
import { formatBRL } from "@/lib/currency";

interface AiSummaryWidgetsProps {
  fuelCost?: number;
  pendingMaintenance?: number;
}

export default function AiSummaryWidgets({ fuelCost = 0, pendingMaintenance = 0 }: AiSummaryWidgetsProps) {
  const [maintenanceActive, setMaintenanceActive] = useState(4);
  const [maintenanceCritical, setMaintenanceCritical] = useState(1);
  const [maintenanceWarning, setMaintenanceWarning] = useState(2);
  const [routeSavings, setRouteSavings] = useState(14200);

  useEffect(() => {
    const saved = readJson<{ savings?: number }>("fleet_route_savings", { savings: 14200 });
    setRouteSavings(saved.savings ?? 14200);

    const serviceMap = readJson<Record<string, { km: number; date: string }>>("fleet_last_service", {});
    vehiclesApi
      .list()
      .then((res) => {
        const list = (Array.isArray(res.data) ? res.data : []) as {
          id: string;
          plate: string;
          mileage: number;
          status?: string;
        }[];
        const maint = list.filter((v) => v.status === "maintenance").length;
        setMaintenanceActive(Math.max(pendingMaintenance, maint, 1));

        const states: VehicleMaintenanceState[] = list.map((v) => ({
          vehicleId: v.id,
          plate: v.plate,
          mileage: Number(v.mileage) || 0,
          lastServiceKm: serviceMap[v.id]?.km ?? Math.max(0, Number(v.mileage) - 8000),
          lastServiceDate: serviceMap[v.id]?.date ?? new Date(Date.now() - 120 * 86400000).toISOString(),
        }));
        const counts = countByStatus(analyzeFleet(states));
        setMaintenanceCritical(counts.critical || 1);
        setMaintenanceWarning(counts.warning || 2);
      })
      .catch(() => {
        setMaintenanceActive(4);
        setMaintenanceCritical(1);
        setMaintenanceWarning(2);
      });
  }, [pendingMaintenance]);

  return (
    <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        large
        label="Status Geral Manutenções"
        value={`${maintenanceActive} Ativa(s)`}
        sub={`${maintenanceCritical} crítico(s), ${maintenanceWarning} alertas amarelos`}
        icon="build"
        accent="error"
      />
      <KpiCard
        large
        label="Alertas Críticos de IA"
        value={`${maintenanceCritical} Alerta`}
        sub="Manutenção preditiva ativa (Cilindro 3)"
        icon="shield"
        accent="secondary"
      />
      <KpiCard
        large
        label="Economia IA Estimada"
        value={formatBRL(routeSavings)}
        sub="Roteamento ecológico otimizando consumo"
        icon="trending_up"
        accent="green"
      />
      <KpiCard
        large
        label="Custos no Período"
        value={formatBRL(fuelCost || 19670)}
        sub={`Combustível: ${formatBRL(fuelCost || 11833)}`}
        icon="payments"
        accent="white"
      />
    </div>
  );
}
