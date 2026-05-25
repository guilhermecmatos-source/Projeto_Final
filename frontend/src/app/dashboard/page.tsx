"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import LiveGpsMap from "@/components/map/LiveGpsMap";
import Icon from "@/components/ui/Icon";
import KpiCard from "@/components/ui/KpiCard";
import PageHeader from "@/components/ui/PageHeader";
import { dashboardApi } from "@/services/api";
import ActionLink from "@/components/ui/ActionLink";
import { ACTION_ROUTES } from "@/lib/action-routes";
import { DashboardData, PredictiveAlert } from "@/types";

function severityBorder(severity: PredictiveAlert["severity"]) {
  if (severity === "high") return "border-l-error";
  if (severity === "medium") return "border-l-secondary-container";
  return "border-l-primary";
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"30" | "7" | "today">("30");

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
      headerTitle="Dashboard Principal"
      headerAction={
        <ActionLink href={ACTION_ROUTES.dashboardRegister} className="uppercase">
          <Icon name="add_circle" className="text-sm" />
          Novo Registro
        </ActionLink>
      }
    >
      <PageHeader
        title="Dashboard Principal"
        subtitle="Consolidado operacional, financeiro e logístico em tempo real."
        actions={
          <>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "30" as const, label: "Últimos 30 dias" },
                { id: "7" as const, label: "7 dias" },
                { id: "today" as const, label: "Hoje" },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriod(p.id)}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-label-md transition ${
                    period === p.id
                      ? "border-primary bg-primary-container/10 font-bold text-primary"
                      : "border-outline-variant bg-white hover:bg-surface-container-low"
                  }`}
                >
                  <Icon name="calendar_today" className="text-sm" />
                  {p.label}
                </button>
              ))}
            </div>
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
          <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
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
                <p className="text-sm text-on-surface-variant">GPS ao vivo dos veículos em operação</p>
              </div>
              <LiveGpsMap />
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
            <section className="raised-card p-4 sm:p-6">
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
              <div className="table-responsive">
                <table className="zebra-table w-full min-w-[480px] text-sm">
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
                        <td className="px-4 py-3 font-medium" data-label="Placa">
                          {v.plate}
                        </td>
                        <td className="px-4 py-3" data-label="Modelo">
                          {v.brand} {v.model}
                        </td>
                        <td className="px-4 py-3" data-label="Status">
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
                        <td className="px-4 py-3 text-right" data-label="Km">
                          {Number(v.mileage).toLocaleString("pt-BR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
