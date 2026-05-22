"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import KpiCard from "@/components/ui/KpiCard";
import PageHeader from "@/components/ui/PageHeader";
import { dashboardApi } from "@/services/api";
import ActionLink from "@/components/ui/ActionLink";
import { ACTION_ROUTES } from "@/lib/action-routes";
import { DashboardData, PredictiveAlert } from "@/types";
import { IMAGES } from "@/lib/images";

function severityBorder(severity: PredictiveAlert["severity"]) {
  if (severity === "high") return "border-l-error";
  if (severity === "medium") return "border-l-secondary-container";
  return "border-l-primary";
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .get()
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const kpis = data?.kpis;

  return (
    <AppShell
      headerAction={
        <ActionLink href={ACTION_ROUTES.dashboardRegister} className="uppercase">
          <Icon name="add_circle" className="text-sm" />
          Novo Registro
        </ActionLink>
      }
    >
      <PageHeader
        title="Dashboard Principal - Cockpit"
        subtitle="Consolidado operacional, financeiro e logístico em tempo real."
        actions={
          <>
            <ActionLink
              href="/dashboard"
              variant="outline"
              className="!border-primary-container !text-primary-container"
            >
              <Icon name="calendar_today" />
              Últimos 30 dias
            </ActionLink>
            <ActionLink
              href={ACTION_ROUTES.dashboardExport}
              variant="outline"
              className="!border-primary-container !text-primary-container"
            >
              <Icon name="download" />
              Exportar
            </ActionLink>
          </>
        }
      />

      {loading ? (
        <p className="text-on-surface-variant">Carregando dados...</p>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <KpiCard label="Ganhos Mensais" value="R$ 142.4k" icon="payments" trend="+12.5%" trendUp accent="primary" />
            <KpiCard label="Entregas Concluídas" value={kpis?.travels.completed ?? 0} icon="inventory_2" trend="98.2%" trendUp accent="secondary" />
            <KpiCard label="Veículos Ativos" value={kpis?.vehicles.active ?? 0} icon="directions_car" trend={`${kpis?.vehicles.total ?? 0} total`} accent="green" />
            <KpiCard label="Motoristas" value={kpis?.drivers ?? 0} icon="person" accent="primary" />
            <KpiCard label="Custo Combustível" value={`R$ ${(kpis?.fuelCost ?? 0).toLocaleString("pt-BR")}`} icon="local_gas_station" accent="secondary" />
            <KpiCard label="Manutenções" value={kpis?.pendingMaintenance ?? 0} icon="build" accent="error" />
          </div>

          <div className="mb-8 grid gap-6 lg:grid-cols-12">
            <section className="raised-card overflow-hidden lg:col-span-8">
              <div className="border-b border-outline-variant p-4">
                <h3 className="text-headline-sm text-on-surface">Mapa Operacional em Tempo Real</h3>
              </div>
              <div
                className="relative h-64 bg-primary/90 bg-cover bg-center md:h-80"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,61,155,0.7), rgba(0,61,155,0.85)), url(${IMAGES.mapInterface})`,
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-8 text-center text-white">
                    {["SP Hub", "RJ Node", "BH Depot"].map((hub) => (
                      <div key={hub} className="rounded-lg bg-white/10 px-4 py-3 backdrop-blur">
                        <Icon name="location_on" className="mb-1 text-secondary-container" />
                        <p className="text-label-md font-bold">{hub}</p>
                        <p className="text-xs opacity-80">Ativo</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="raised-card p-4 lg:col-span-4">
              <h3 className="mb-4 flex items-center gap-2 text-headline-sm text-primary">
                <Icon name="psychology" />
                Alertas Inteligentes
              </h3>
              <ul className="max-h-72 space-y-3 overflow-y-auto">
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
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="raised-card p-6">
              <h3 className="mb-4 text-headline-sm">Previsão Logística (IA)</h3>
              <div className="mb-4 rounded-lg bg-primary-fixed/30 p-4">
                <p className="text-sm text-on-surface-variant">Viagens previstas (7 dias)</p>
                <p className="text-4xl font-bold text-primary">
                  {data?.forecast.expectedTrips ?? "—"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(data?.forecast.peakDays ?? []).map((day) => (
                  <span
                    key={day}
                    className="rounded-full bg-primary-container/10 px-3 py-1 text-sm text-primary"
                  >
                    {day}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm text-on-surface-variant">
                {data?.forecast.recommendation ?? "Aguardando análise preditiva."}
              </p>
            </section>

            <section className="raised-card overflow-hidden p-0">
              <h3 className="border-b border-outline-variant p-4 text-headline-sm">
                Veículos Recentes
              </h3>
              <table className="zebra-table w-full text-sm">
                <thead>
                  <tr className="border-b bg-surface-container-low text-left text-label-md text-on-surface-variant">
                    <th className="px-4 py-3">Placa</th>
                    <th className="px-4 py-3">Modelo</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Km</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.vehicles ?? []).map((v) => (
                    <tr key={v.id} className="border-b border-outline-variant/30">
                      <td className="px-4 py-3 font-medium">{v.plate}</td>
                      <td className="px-4 py-3">
                        {v.brand} {v.model}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            v.status === "active"
                              ? "chip-active"
                              : v.status === "maintenance"
                                ? "chip-warning"
                                : "chip-pending"
                          }
                        >
                          {v.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {Number(v.mileage).toLocaleString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>

          <div className="mt-6 rounded-xl border border-primary-container/20 bg-primary-container/5 p-4">
            <p className="text-xs text-on-surface-variant">
              A análise de IA identificou economia potencial de 14% em combustível remapeando hubs
              de Cajamar e Barueri.{" "}
              <ActionLink href="/intelligence" variant="ghost" className="!inline">
                Ver análise detalhada
              </ActionLink>
            </p>
          </div>
        </>
      )}
    </AppShell>
  );
}
