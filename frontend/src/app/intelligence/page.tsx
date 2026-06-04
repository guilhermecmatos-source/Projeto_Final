"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import TripCostCalculator from "@/components/ai/TripCostCalculator";
import PredictiveMaintenancePanel from "@/components/ai/PredictiveMaintenancePanel";
import Link from "next/link";
import { intelligenceApi } from "@/services/api";
import { formatBRL } from "@/lib/currency";

interface Metrics {
  operationalEfficiency: number;
  costPerDelivery: number;
  fleetUtilization: number;
  averageDriverScore: number;
  activeTrips: number;
  totalFuelCost: number;
}

export default function IntelligencePage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [discovery, setDiscovery] = useState<{
    opportunities: string[];
    pendingRequests: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([intelligenceApi.metrics(), intelligenceApi.discovery()])
      .then(([mRes, dRes]) => {
        setMetrics(mRes.data);
        setDiscovery(dRes.data);
      })
      .catch(() => {
        setMetrics(null);
        setDiscovery(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = metrics
    ? [
        {
          label: "Eficiência Operacional",
          value: `${metrics.operationalEfficiency}%`,
        },
        {
          label: "Custo por km (abastecimento)",
          value: formatBRL(metrics.costPerDelivery),
        },
        {
          label: "Utilização da Frota",
          value: `${metrics.fleetUtilization}%`,
        },
        {
          label: "Score Médio Motoristas",
          value: String(metrics.averageDriverScore),
        },
      ]
    : [];

  return (
    <AppShell>
      <PageHeader
        title="Fleet Operational Intelligence"
        subtitle="Análises derivadas de viagens, abastecimentos e manutenções reais."
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
          {discovery.pendingRequests > 0 && (
            <p className="mt-2 text-sm text-on-surface-variant">
              {discovery.pendingRequests} solicitação(ões) RUV pendente(s).
            </p>
          )}
        </div>
      )}

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <TripCostCalculator />
        <PredictiveMaintenancePanel compact />
      </div>

      <p className="text-sm">
        CEO AI e diagnósticos em{" "}
        <Link href="/cockpit" className="font-bold text-primary hover:underline">
          Cockpit Executivo
        </Link>
        {" · "}
        <Link href="/ai-security" className="font-bold text-primary hover:underline">
          IA Suporte
        </Link>
        .
      </p>
    </AppShell>
  );
}
