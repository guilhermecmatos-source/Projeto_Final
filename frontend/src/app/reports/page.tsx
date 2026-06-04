"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import DateRangePicker, { defaultDateRange, DateRange } from "@/components/forms/DateRangePicker";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ActionLink from "@/components/ui/ActionLink";
import { ACTION_ROUTES } from "@/lib/action-routes";
import { formatBRL } from "@/lib/currency";
import { reportsApi } from "@/services/api";
import { formatPlateDisplay } from "@/lib/validators";

interface ReportData {
  vehicleRows: { plate: string; km: number; cost: number; efficiency: number }[];
  topDrivers: { name: string; score: number; km: number; cost_per_km: number }[];
  costBreakdown: { label: string; pct: number; amount: number }[];
  recentTravels: {
    id: string;
    origin: string;
    destination: string;
    status: string;
    created_at: string;
    vehicle_plate?: string;
  }[];
  totals: { travels: number; completed: number; totalCost: number };
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange>(() => defaultDateRange(30));
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    reportsApi
      .summary(dateRange.start, dateRange.end)
      .then((res) => setData(res.data as ReportData))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [dateRange]);

  const periodLabel = `${dateRange.start.split("-").reverse().join("/")} — ${dateRange.end.split("-").reverse().join("/")}`;

  const chartBars = useMemo(() => {
    const rows = data?.vehicleRows ?? [];
    return rows.slice(0, 12).map((v) => Math.min(100, Math.round(Number(v.efficiency))));
  }, [data]);

  return (
    <AppShell>
      <PageHeader
        title="Relatórios Estratégicos"
        subtitle="Dados consolidados de viagens, combustível e manutenção."
        actions={
          <>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <ActionLink href={ACTION_ROUTES.reportsExport}>
              <Icon name="download" />
              Exportar Pacote
            </ActionLink>
          </>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Viagens no período", value: data?.totals.travels ?? 0, icon: "route" },
          { label: "Concluídas", value: data?.totals.completed ?? 0, icon: "check_circle" },
          { label: "Custo operacional", value: formatBRL(data?.totals.totalCost ?? 0), icon: "payments" },
          { label: "Veículos analisados", value: data?.vehicleRows.length ?? 0, icon: "directions_car" },
        ].map((s) => (
          <div key={s.label} className="raised-card flex items-center gap-4 p-4">
            <Icon name={s.icon} className="text-2xl text-primary" />
            <div>
              <p className="text-label-md text-on-surface-variant">{s.label}</p>
              <p className="text-headline-md font-bold">{loading ? "—" : s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="mb-8 raised-card p-4 sm:p-6">
        <h2 className="mb-6 text-headline-sm text-primary">
          Evolução de Custos vs KM
          <span className="ml-2 text-sm font-normal text-on-surface-variant">({periodLabel})</span>
        </h2>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-outline-variant p-4">
            <h3 className="mb-4 flex items-center gap-2 text-title-md font-bold">
              <Icon name="speed" className="text-primary" />
              Desempenho por veículo
            </h3>
            {loading ? (
              <p className="text-on-surface-variant">Carregando...</p>
            ) : (data?.vehicleRows.length ?? 0) === 0 ? (
              <p className="text-on-surface-variant">Sem dados no período.</p>
            ) : (
              <div className="space-y-3">
                {data?.vehicleRows.map((v) => (
                  <div key={v.plate}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-semibold">{formatPlateDisplay(v.plate)}</span>
                      <span>
                        {Number(v.km).toLocaleString("pt-BR")} km • {formatBRL(Number(v.cost))}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${Math.min(100, Number(v.efficiency))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-outline-variant p-4">
            <h3 className="mb-4 flex items-center gap-2 text-title-md font-bold">
              <Icon name="pie_chart" className="text-primary" />
              Distribuição de gastos
            </h3>
            <div className="space-y-3">
              {(data?.costBreakdown ?? []).map((g) => (
                <div key={g.label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{g.label}</span>
                    <span className="font-bold">
                      {g.pct}% ({formatBRL(g.amount)})
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
                    <div className="h-full bg-primary" style={{ width: `${g.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-outline-variant p-4">
            <h3 className="mb-4 font-bold text-primary">Top motoristas</h3>
            <ol className="space-y-2">
              {(data?.topDrivers ?? []).map((d, i) => (
                <li
                  key={d.name}
                  className="flex flex-wrap justify-between gap-2 rounded-lg bg-surface-container-low p-3 text-sm"
                >
                  <span className="font-bold">
                    {i + 1}. {d.name}
                  </span>
                  <span className="text-on-surface-variant">
                    Score {Math.round(d.score)} • {Number(d.km).toLocaleString("pt-BR")} km
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-xl border border-outline-variant p-4">
            <h3 className="mb-4 font-bold text-primary">Viagens recentes</h3>
            <ul className="space-y-2">
              {(data?.recentTravels ?? []).map((t) => (
                <li key={t.id} className="rounded-lg border border-outline-variant/50 p-3 text-sm">
                  <p className="font-semibold">
                    {t.origin} → {t.destination}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {formatPlateDisplay(t.vehicle_plate ?? "")} • {t.status} •{" "}
                    {new Date(t.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {chartBars.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-bold text-on-surface-variant">Eficiência por veículo</h3>
            <div className="flex h-32 items-end gap-2">
              {chartBars.map((h, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full rounded-t bg-primary-container/80" style={{ height: `${h}%` }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
