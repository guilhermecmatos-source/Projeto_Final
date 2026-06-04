"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import TripCostCalculator from "@/components/ai/TripCostCalculator";
import PredictiveMaintenancePanel from "@/components/ai/PredictiveMaintenancePanel";
import Link from "next/link";
import { intelligenceApi } from "@/services/api";
import { formatBRL } from "@/lib/currency";
import { formatPlateDisplay } from "@/lib/validators";

interface Metrics {
  operationalEfficiency: number;
  costPerDelivery: number;
  fleetUtilization: number;
  averageDriverScore: number;
  activeTrips: number;
  totalFuelCost: number;
}

interface TravelInsight {
  id: string;
  origin: string;
  destination: string;
  status: string;
  distance_km: number;
  cost: number;
  vehicle_plate?: string;
  driver_name?: string;
  created_at: string;
}

const STATUS_PT: Record<string, string> = {
  scheduled: "Agendado",
  in_progress: "Em curso",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export default function IntelligencePage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [discovery, setDiscovery] = useState<{
    opportunities: string[];
    pendingRequests: number;
  } | null>(null);
  const [travels, setTravels] = useState<TravelInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      intelligenceApi.metrics(),
      intelligenceApi.discovery(),
      intelligenceApi.travels(),
    ])
      .then(([mRes, dRes, tRes]) => {
        setMetrics(mRes.data);
        setDiscovery(dRes.data);
        setTravels(Array.isArray(tRes.data) ? tRes.data : []);
      })
      .catch(() => {
        setMetrics(null);
        setDiscovery(null);
        setTravels([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = metrics
    ? [
        { label: "Eficiência Operacional", value: `${metrics.operationalEfficiency}%` },
        { label: "Custo por km (abastecimento)", value: formatBRL(metrics.costPerDelivery) },
        { label: "Utilização da Frota", value: `${metrics.fleetUtilization}%` },
        { label: "Viagens em curso", value: String(metrics.activeTrips) },
      ]
    : [];

  return (
    <AppShell>
      <PageHeader
        title="Fleet Operational Intelligence"
        subtitle="Indicadores e viagens cadastradas no sistema."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <p className="col-span-full text-on-surface-variant">Carregando indicadores...</p>
        ) : (
          cards.map((m) => (
            <div key={m.label} className="raised-card p-4">
              <p className="text-label-md uppercase text-on-surface-variant">{m.label}</p>
              <p className="text-headline-md font-bold text-primary">{m.value}</p>
            </div>
          ))
        )}
      </div>

      {discovery && discovery.opportunities.length > 0 && (
        <div className="raised-card mb-8 border-l-4 border-l-secondary-container p-4">
          <h3 className="mb-2 font-bold text-primary">Discovery Engine</h3>
          <ul className="list-disc space-y-1 pl-5 text-body-md">
            {discovery.opportunities.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </div>
      )}

      <section className="raised-card mb-8 overflow-hidden">
        <div className="border-b border-outline-variant p-4">
          <h3 className="text-headline-sm">Viagens cadastradas</h3>
        </div>
        <table className="zebra-table w-full text-body-md">
          <thead>
            <tr className="border-b bg-surface-container-low text-left text-label-md text-on-surface-variant">
              <th className="px-4 py-3">Rota</th>
              <th className="px-4 py-3">Veículo</th>
              <th className="px-4 py-3">Motorista</th>
              <th className="px-4 py-3">Km</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center">
                  Carregando...
                </td>
              </tr>
            ) : travels.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-on-surface-variant">
                  Nenhuma viagem cadastrada ainda.
                </td>
              </tr>
            ) : (
              travels.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-3 font-medium">
                    {t.origin} → {t.destination}
                  </td>
                  <td className="px-4 py-3">{formatPlateDisplay(t.vehicle_plate ?? "")}</td>
                  <td className="px-4 py-3">{t.driver_name ?? "—"}</td>
                  <td className="px-4 py-3">{Number(t.distance_km).toFixed(0)}</td>
                  <td className="px-4 py-3">
                    <span className="chip-active">{STATUS_PT[t.status] ?? t.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <TripCostCalculator />
        <PredictiveMaintenancePanel compact />
      </div>

      <p className="text-sm">
        CEO AI em{" "}
        <Link href="/cockpit" className="font-bold text-primary hover:underline">
          Cockpit Executivo
        </Link>
        .
      </p>
    </AppShell>
  );
}
