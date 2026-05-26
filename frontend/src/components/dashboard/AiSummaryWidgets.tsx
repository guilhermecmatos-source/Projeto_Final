"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import Link from "next/link";
import { analyzeFleet, countByStatus, VehicleMaintenanceState } from "@/lib/ai/predictive-maintenance";
import { readJson } from "@/lib/local-storage";
import { vehiclesApi } from "@/services/api";

export default function AiSummaryWidgets() {
  const [maintenanceCritical, setMaintenanceCritical] = useState(0);
  const [maintenanceWarning, setMaintenanceWarning] = useState(0);
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
        }[];
        const states: VehicleMaintenanceState[] = list.map((v) => ({
          vehicleId: v.id,
          plate: v.plate,
          mileage: Number(v.mileage) || 0,
          lastServiceKm: serviceMap[v.id]?.km ?? Math.max(0, Number(v.mileage) - 8000),
          lastServiceDate: serviceMap[v.id]?.date ?? new Date(Date.now() - 120 * 86400000).toISOString(),
        }));
        const counts = countByStatus(analyzeFleet(states.length ? states : [{
          vehicleId: "d", plate: "ABC-1234", mileage: 50000, lastServiceKm: 41000,
          lastServiceDate: new Date(Date.now() - 250 * 86400000).toISOString(),
        }]));
        setMaintenanceCritical(counts.critical);
        setMaintenanceWarning(counts.warning);
      })
      .catch(() => {
        setMaintenanceCritical(1);
        setMaintenanceWarning(2);
      });
  }, []);

  const widgets = [
    {
      title: "Status de Manutenção",
      value: maintenanceCritical > 0 ? `${maintenanceCritical} crítico(s)` : "Frota OK",
      sub: `${maintenanceWarning} alerta(s) amarelos`,
      icon: "engineering",
      accent: maintenanceCritical > 0 ? "text-error" : "text-green-600",
      href: "/ai-security",
    },
    {
      title: "Alertas Críticos IA",
      value: String(maintenanceCritical + (maintenanceWarning > 2 ? 1 : 0)),
      sub: "Manutenção preditiva ativa",
      icon: "warning",
      accent: "text-secondary-container",
      href: "/ai-security",
    },
    {
      title: "Economia em Rotas",
      value: `R$ ${routeSavings.toLocaleString("pt-BR")}`,
      sub: "Estimativa mensal (IA 2)",
      icon: "savings",
      accent: "text-primary",
      href: "/intelligence",
    },
  ];

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {widgets.map((w) => (
        <Link
          key={w.title}
          href={w.href}
          className="raised-card block p-4 transition hover:shadow-lg sm:p-5"
        >
          <div className="mb-3 flex items-center justify-between">
            <Icon name={w.icon} className={`text-2xl ${w.accent}`} />
            <Icon name="arrow_forward" className="text-on-surface-variant" />
          </div>
          <p className="text-label-md uppercase text-on-surface-variant">{w.title}</p>
          <p className={`text-headline-md font-bold ${w.accent}`}>{w.value}</p>
          <p className="mt-1 text-xs text-on-surface-variant">{w.sub}</p>
        </Link>
      ))}
    </div>
  );
}
