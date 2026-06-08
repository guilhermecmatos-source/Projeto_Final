"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import SatelliteOperationalMap from "@/components/map/SatelliteOperationalMap";
import PeriodLineChart from "@/components/dashboard/PeriodLineChart";
import AiSummaryWidgets from "@/components/dashboard/AiSummaryWidgets";
import DateRangePicker, { defaultDateRange, DateRange } from "@/components/forms/DateRangePicker";
import Icon from "@/components/ui/Icon";
import KpiCard from "@/components/ui/KpiCard";
import PageHeader from "@/components/ui/PageHeader";
import ActionButton from "@/components/ui/ActionButton";
import FormModal from "@/components/ui/FormModal";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import { dashboardApi, vehiclesApi } from "@/services/api";
import ActionLink from "@/components/ui/ActionLink";
import { ACTION_ROUTES } from "@/lib/action-routes";
import { extractApiError } from "@/lib/api-errors";
import { DashboardData, PredictiveAlert } from "@/types";
import { formatBRL } from "@/lib/currency";

function severityBorder(severity: PredictiveAlert["severity"]) {
  if (severity === "high") return "border-l-error";
  if (severity === "medium") return "border-l-amber-500";
  return "border-l-primary";
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(() => defaultDateRange(30));
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [registerMessage, setRegisterMessage] = useState("");

  const loadDashboard = useCallback(() => {
    setLoading(true);
    setFetchError(null);
    dashboardApi
      .get({ dateFrom: dateRange.start, dateTo: dateRange.end })
      .then((res) => setData(res.data))
      .catch((err) => {
        setData(null);
        setFetchError(extractApiError(err, "Não foi possível carregar o dashboard."));
      })
      .finally(() => setLoading(false));
  }, [dateRange.start, dateRange.end]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function handleRegisterSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setRegisterMessage("");
    const form = new FormData(e.currentTarget);
    try {
      await vehiclesApi.create({
        plate: String(form.get("plate")),
        brand: String(form.get("brand")),
        model: String(form.get("model")),
        year: Number(form.get("year")),
        mileage: Number(form.get("mileage")),
        avg_consumption: Number(form.get("avg_consumption")),
      });
      setRegisterModalOpen(false);
      loadDashboard();
    } catch {
      setRegisterMessage("Erro ao cadastrar veículo.");
    } finally {
      setSaving(false);
    }
  }

  const kpis = data?.kpis;
  const chartData = useMemo(() => data?.evolution ?? [], [data?.evolution]);
  const fuelCost = kpis?.fuelCost ?? 11833;

  return (
    <AppShell>
      <PageHeader
        breadcrumb="Dashboard"
        eyebrow="Painel Central"
        title="Dashboard Principal"
        actions={
          <>
            <ActionButton onClick={() => { setRegisterModalOpen(true); setRegisterMessage(""); }} className="uppercase">
              <Icon name="add_circle" className="text-sm" />
              Novo Registro
            </ActionButton>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <ActionLink href={ACTION_ROUTES.dashboardExport} variant="outline">
              <Icon name="download" />
            </ActionLink>
          </>
        }
      />

      {loading ? (
        <LoadingState message="Carregando dados do dashboard..." />
      ) : fetchError ? (
        <ErrorState message={fetchError} onRetry={loadDashboard} />
      ) : (
        <>
          <AiSummaryWidgets fuelCost={fuelCost} pendingMaintenance={kpis?.pendingMaintenance} />

          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiCard
              label="Entregas RUV Concluídas"
              value={`${kpis?.travels.completed ?? 1} Aprovadas`}
              icon="inventory_2"
              accent="green"
            />
            <KpiCard
              label="Veículos no Inventário"
              value={kpis?.vehicles.total ?? 4}
              sub={`${kpis?.vehicles.active ?? 1} disponíveis`}
              icon="directions_car"
              accent="primary"
            />
            <KpiCard
              label="Motoristas Registrados"
              value={kpis?.drivers ?? 3}
              sub="100% CNH Ativas"
              icon="person"
              accent="secondary"
            />
            <KpiCard
              label="Gasto Médio Combustível"
              value={formatBRL(fuelCost / Math.max(kpis?.travels.total ?? 8, 1))}
              sub="Por KM"
              icon="local_gas_station"
              accent="white"
            />
          </div>

          <div className="mb-8 grid gap-6 lg:grid-cols-12">
            <section className="raised-card overflow-hidden lg:col-span-8">
              <div className="border-b border-outline-variant p-4">
                <h3 className="text-headline-sm text-primary">Mapa Operacional em Tempo Real</h3>
              </div>
              <SatelliteOperationalMap />
            </section>

            <section className="raised-card p-4 lg:col-span-4">
              <h3 className="mb-4 text-headline-sm text-primary">Evolução do Período Selecionado</h3>
              <PeriodLineChart data={chartData} loading={loading} />
            </section>
          </div>

          <section className="raised-card p-4">
            <h3 className="mb-4 flex items-center gap-2 text-headline-sm text-primary">
              <Icon name="psychology" />
              Alertas Inteligentes Registrados
            </h3>
            <ul className="space-y-3">
              {(data?.alerts ?? []).length === 0 ? (
                <li className="text-sm text-on-surface-variant">Nenhum alerta no momento.</li>
              ) : (
                data?.alerts.map((alert, i) => (
                  <li
                    key={i}
                    className={`rounded-lg border-l-4 bg-surface-container-high p-3 ${severityBorder(alert.severity)}`}
                  >
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="mt-1 text-xs text-on-surface-variant">{alert.recommendation}</p>
                  </li>
                ))
              )}
            </ul>
          </section>
        </>
      )}

      <FormModal open={registerModalOpen} onClose={() => setRegisterModalOpen(false)} title="Novo Registro" subtitle="Cadastro rápido de veículo operacional">
        <form className="space-y-3" onSubmit={handleRegisterSubmit}>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">Placa do Veículo</label>
            <input className="input-fleet" name="plate" placeholder="EX: ABC-1234" required />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">Marca / Fabricante</label>
            <input className="input-fleet" name="brand" placeholder="Ex: Mercedes-Benz" required />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">Modelo Comercial</label>
            <input className="input-fleet" name="model" placeholder="Ex: Atego 2426" required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">Ano</label>
              <input className="input-fleet" name="year" type="number" defaultValue="2022" required />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">Odômetro (KM)</label>
              <input className="input-fleet" name="mileage" type="number" defaultValue="100000" required />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">Consumo Médio (KM/L)</label>
            <input className="input-fleet" name="avg_consumption" type="number" step="0.1" defaultValue="4" />
          </div>
          {registerMessage && <p className="text-sm text-primary">{registerMessage}</p>}
          <button type="submit" disabled={saving} className="btn-primary w-full uppercase">
            {saving ? "Salvando..." : "Vincular Veículo"}
          </button>
        </form>
      </FormModal>
    </AppShell>
  );
}
