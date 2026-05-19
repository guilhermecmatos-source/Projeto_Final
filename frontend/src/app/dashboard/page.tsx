"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { dashboardApi } from "@/services/api";
import { DashboardData, PredictiveAlert } from "@/types";

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-fleet-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function severityColor(severity: PredictiveAlert["severity"]) {
  if (severity === "high") return "border-red-300 bg-red-50";
  if (severity === "medium") return "border-amber-300 bg-amber-50";
  return "border-blue-300 bg-blue-50";
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    dashboardApi
      .get()
      .then((res) => setData(res.data))
      .catch(() => setError("Não foi possível carregar o dashboard."))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-500">Carregando dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-7xl p-8">
        <p className="text-red-600">{error || "Dados indisponíveis"}</p>
      </div>
    );
  }

  const { kpis, alerts, vehicles, forecast } = data;

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">
      <header>
        <h1 className="text-2xl font-bold text-fleet-900">Dashboard Inteligente</h1>
        <p className="text-slate-500">Visão operacional em tempo real da frota</p>
      </header>

      {/* KPIs */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Veículos Ativos" value={kpis.vehicles.active} sub={`${kpis.vehicles.total} total`} />
        <KpiCard label="Motoristas" value={kpis.drivers} />
        <KpiCard label="Viagens Concluídas" value={kpis.travels.completed} sub={`${kpis.travels.total} registradas`} />
        <KpiCard
          label="Custo Combustível"
          value={`R$ ${kpis.fuelCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
        />
        <KpiCard label="Manutenções Pendentes" value={kpis.pendingMaintenance} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Alertas IA */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-fleet-900">Alertas Inteligentes</h2>
          {alerts.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhum alerta no momento.</p>
          ) : (
            <ul className="space-y-3 max-h-80 overflow-y-auto">
              {alerts.map((alert, i) => (
                <li key={i} className={`rounded-lg border p-3 ${severityColor(alert.severity)}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase text-slate-500">{alert.type}</span>
                    <span className="text-xs font-medium capitalize">{alert.severity}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium">{alert.message}</p>
                  <p className="mt-1 text-xs text-slate-600">{alert.recommendation}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Previsão logística */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-fleet-900">Previsão Logística (IA)</h2>
          <div className="space-y-4">
            <div className="rounded-lg bg-fleet-50 p-4">
              <p className="text-sm text-slate-500">Viagens previstas (próx. 7 dias)</p>
              <p className="text-4xl font-bold text-fleet-700">{forecast.expectedTrips}</p>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-600">Dias de pico</p>
              <div className="flex flex-wrap gap-2">
                {forecast.peakDays.map((day) => (
                  <span key={day} className="rounded-full bg-fleet-100 px-3 py-1 text-sm text-fleet-700">
                    {day}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-sm text-slate-500">{forecast.recommendation}</p>
          </div>
        </section>
      </div>

      {/* Gráfico simplificado + veículos */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-fleet-900">Distribuição Operacional</h2>
          <div className="space-y-3">
            <Bar label="Viagens concluídas" value={kpis.travels.completed} max={kpis.travels.total || 1} color="bg-fleet-600" />
            <Bar label="Veículos ativos" value={kpis.vehicles.active} max={kpis.vehicles.total || 1} color="bg-green-500" />
            <Bar label="Manutenções pendentes" value={kpis.pendingMaintenance} max={Math.max(kpis.pendingMaintenance, 10)} color="bg-amber-500" />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-fleet-900">Veículos Recentes</h2>
          {vehicles.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhum veículo cadastrado.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-2">Placa</th>
                  <th className="pb-2">Modelo</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Km</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id} className="border-b border-slate-100">
                    <td className="py-2 font-medium">{v.plate}</td>
                    <td className="py-2">{v.brand} {v.model}</td>
                    <td className="py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${
                        v.status === "active" ? "bg-green-100 text-green-700" :
                        v.status === "maintenance" ? "bg-amber-100 text-amber-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="py-2 text-right">{Number(v.mileage).toLocaleString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
