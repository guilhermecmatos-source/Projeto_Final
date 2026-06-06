"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import SatelliteOperationalMap from "@/components/map/SatelliteOperationalMap";
import PeriodPieChart from "@/components/dashboard/PeriodPieChart";
import AiSummaryWidgets from "@/components/dashboard/AiSummaryWidgets";
import DateRangePicker, { defaultDateRange, DateRange } from "@/components/forms/DateRangePicker";
import Icon from "@/components/ui/Icon";
import KpiCard from "@/components/ui/KpiCard";
import PageHeader from "@/components/ui/PageHeader";
import { dashboardApi } from "@/services/api";
import ActionLink from "@/components/ui/ActionLink";
import { ACTION_ROUTES } from "@/lib/action-routes";
import { DashboardData, PredictiveAlert } from "@/types";
import { formatBRL } from "@/lib/currency";

function severityBorder(severity: PredictiveAlert["severity"]) {
  if (severity === "high") return "border-l-error";
  if (severity === "medium") return "border-l-secondary-container";
  return "border-l-primary";
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>(() => defaultDateRange(30));

  const loadDashboard = useCallback(() => {
    setLoading(true);
    dashboardApi
      .get({ dateFrom: dateRange.start, dateTo: dateRange.end })
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [dateRange.start, dateRange.end]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const kpis = data?.kpis;
  const chartData = useMemo(() => data?.evolution ?? [], [data?.evolution]);

  return (
    <AppShell
      headerTitle="Dashboard Principal"
      headerAction={
        <ActionLink href={ACTION_ROUTES.dashboardRegister} className="uppercase">
          <Icon name="add_circle" className="text-sm" />
          Novo Registro
        </ActionLink>
      }
    >
      <PageHeader
        eyebrow="Painel Central"
        title="Dashboard Principal"
        subtitle="Consolidado operacional, financeiro e logístico em tempo real."
        actions={
          <>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <ActionLink href={ACTION_ROUTES.dashboardExport} variant="outline">
              <Icon name="download" />
            </ActionLink>
          </>
        }
      />

      {loading ? (
        <p className="text-on-surface-variant">Carregando dados...</p>
      ) : (
        <>
          <AiSummaryWidgets />

          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiCard
              label="Entregas RUV Concluídas"
              value={`${kpis?.travels.completed ?? 0} Aprovadas`}
              icon="inventory_2"
              accent="green"
            />
            <KpiCard
              label="Veículos no Inventário"
              value={kpis?.vehicles.total ?? 0}
              icon="directions_car"
              trend={`${kpis?.vehicles.active ?? 0} disponíveis`}
              accent="primary"
            />
            <KpiCard
              label="Motoristas Registrados"
              value={kpis?.drivers ?? 0}
              icon="person"
              trend="100% CNH Ativas"
              accent="secondary"
            />
            <KpiCard
              label="Gasto Médio Combustível"
              value={formatBRL((kpis?.fuelCost ?? 0) / Math.max(kpis?.travels.total ?? 1, 1))}
              icon="local_gas_station"
              trend="Por viagem"
              accent="primary"
            />
          </div>

          <div className="mb-8 grid gap-6 lg:grid-cols-12">
            <section className="raised-card overflow-hidden lg:col-span-7">
              <div className="border-b border-outline-variant p-4">
                <h3 className="text-headline-sm text-primary">Mapa Operacional em Tempo Real</h3>
                <p className="text-sm text-on-surface-variant">Satélite com geolocalização GPS ao vivo</p>
              </div>
              <SatelliteOperationalMap />
            </section>

            <section className="raised-card p-4 lg:col-span-5">
              <h3 className="mb-4 text-headline-sm text-primary">Evolução do Período Selecionado</h3>
              <PeriodPieChart data={chartData} loading={loading} />
            </section>
          </div>

          <section className="raised-card mb-8 p-4">
            <h3 className="mb-4 flex items-center gap-2 text-headline-sm text-primary">
              <Icon name="psychology" />
              Alertas Inteligentes Registrados
            </h3>
            <ul className="grid gap-3 md:grid-cols-2">
              {(data?.alerts ?? []).length === 0 ? (
                <li className="text-sm text-on-surface-variant">Nenhum alerta no momento.</li>
              ) : (
                data?.alerts.map((alert, i) => (
                  <li
                    key={i}
                    className={`rounded-lg border-l-4 bg-surface-container-low p-3 ${severityBorder(alert.severity)}`}
                  >
                    <div className="flex justify-between text-xs uppercase text-on-surface-variant">
                      <span>{alert.type}</span>
                      <span className="capitalize">{alert.severity}</span>
                    </div>
                    <p className="mt-1 text-sm font-medium">{alert.message}</p>
                    <p className="mt-1 text-xs text-on-surface-variant">{alert.recommendation}</p>
                  </li>
                ))
              )}
            </ul>
          </section>
        </>
      )}
    </AppShell>
  );
}
