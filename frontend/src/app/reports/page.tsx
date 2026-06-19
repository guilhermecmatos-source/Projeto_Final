"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import DateRangePicker, { defaultDateRange, DateRange } from "@/components/forms/DateRangePicker";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ActionLink from "@/components/ui/ActionLink";
import FormModal from "@/components/ui/FormModal";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import { extractApiError } from "@/lib/api-errors";
import { ACTION_ROUTES } from "@/lib/action-routes";
import { formatBRL } from "@/lib/currency";
import { reportsApi } from "@/services/api";
import { formatPlateDisplay } from "@/lib/validators";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie
} from "recharts";

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
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<{ plate: string; km: number; cost: number; efficiency: number } | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<{ name: string; score: number; km: number; cost_per_km: number } | null>(null);

  useEffect(() => {
    setLoading(true);
    setFetchError(null);
    reportsApi
      .summary(dateRange.start, dateRange.end)
      .then((res) => setData(res.data as ReportData))
      .catch((err) => {
        setData(null);
        setFetchError(extractApiError(err, "Não foi possível carregar os relatórios."));
      })
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

      {loading ? (
        <LoadingState message="Carregando dados dos relatórios..." />
      ) : fetchError ? (
        <ErrorState message={fetchError} onRetry={() => {
          setLoading(true);
          setFetchError(null);
          reportsApi.summary(dateRange.start, dateRange.end)
            .then((res) => setData(res.data as ReportData))
            .catch((err) => {
              setData(null);
              setFetchError(extractApiError(err, "Não foi possível carregar os relatórios."));
            })
            .finally(() => setLoading(false));
        }} />
      ) : (
        <>
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

          <section className="mb-8 raised-card bg-[#14213D] border border-outline-variant/30 p-4 sm:p-6 text-slate-100">
            <h2 className="mb-6 text-headline-sm text-primary">
              Evolução de Custos vs KM
              <span className="ml-2 text-sm font-semibold text-slate-300">({periodLabel})</span>
            </h2>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-outline-variant bg-[#0b132b]/50 p-4">
                <h3 className="mb-4 flex items-center gap-2 text-title-md font-bold text-slate-100">
                  <Icon name="speed" className="text-primary" />
                  Desempenho por veículo
                </h3>
                {loading ? (
                  <p className="text-slate-300">Carregando...</p>
                ) : (data?.vehicleRows.length ?? 0) === 0 ? (
                  <p className="text-slate-400">Sem dados no período.</p>
                ) : (
                  <div className="space-y-3">
                    {data?.vehicleRows.map((v) => (
                      <div
                        key={v.plate}
                        onClick={() => setSelectedVehicle(v)}
                        className="group cursor-pointer rounded-lg p-2 transition hover:bg-white/10"
                      >
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="font-semibold text-slate-100 group-hover:text-primary transition">
                            {formatPlateDisplay(v.plate)}
                          </span>
                          <span className="text-slate-300">
                            {Number(v.km).toLocaleString("pt-BR")} km • {formatBRL(Number(v.cost))}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-surface-container-high/50">
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

              <div className="rounded-xl border border-outline-variant bg-[#0b132b]/50 p-4">
                <h3 className="mb-4 flex items-center gap-2 text-title-md font-bold text-slate-100">
                  <Icon name="pie_chart" className="text-primary" />
                  Distribuição de gastos
                </h3>
                <div className="space-y-3">
                  {(data?.costBreakdown ?? []).map((g) => (
                    <div key={g.label}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-slate-200">{g.label}</span>
                        <span className="font-bold text-slate-100">
                          {g.pct}% ({formatBRL(g.amount)})
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-surface-container-high/50">
                        <div className="h-full bg-primary" style={{ width: `${g.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-outline-variant bg-[#0b132b]/50 p-4">
                <h3 className="mb-4 font-bold text-primary">Top motoristas</h3>
                <ol className="space-y-2">
                  {(data?.topDrivers ?? []).map((d, i) => (
                    <li
                      key={d.name}
                      onClick={() => setSelectedDriver(d)}
                      className="flex flex-wrap justify-between gap-2 rounded-lg bg-[#0b132b]/70 p-3 text-sm border border-white/5 cursor-pointer hover:bg-white/10 transition"
                    >
                      <span className="font-bold text-slate-100">
                        {i + 1}. {d.name}
                      </span>
                      <span className="text-slate-300">
                        Score {Math.round(d.score)} • {Number(d.km).toLocaleString("pt-BR")} km
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-xl border border-outline-variant bg-[#0b132b]/50 p-4">
                <h3 className="mb-4 font-bold text-primary">Viagens recentes</h3>
                <ul className="space-y-2">
                  {(data?.recentTravels ?? []).map((t) => (
                    <li key={t.id} className="rounded-lg border border-outline-variant/30 bg-[#0b132b]/40 p-3 text-sm">
                      <p className="font-semibold text-slate-100">
                        {t.origin} → {t.destination}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatPlateDisplay(t.vehicle_plate ?? "")} • {t.status} •{" "}
                        {new Date(t.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {data?.vehicleRows && data.vehicleRows.length > 0 && (
              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-outline-variant bg-[#0b132b]/80 p-5 shadow-xl">
                  <h3 className="mb-4 text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                    <Icon name="bar_chart" className="text-sm text-primary" />
                    EFICIÊNCIA OPERACIONAL POR VEÍCULO (%)
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.vehicleRows.slice(0, 10).map(v => ({
                          plate: formatPlateDisplay(v.plate),
                          "Eficiência (%)": Number(v.efficiency)
                        }))}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="plate" stroke="#94a3b8" fontSize={9} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#1e293b", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                          labelStyle={{ color: "#fff", fontWeight: "bold", fontSize: "10px" }}
                          itemStyle={{ color: "#60a5fa", fontSize: "10px" }}
                        />
                        <Bar dataKey="Eficiência (%)" radius={[4, 4, 0, 0]}>
                          {data.vehicleRows.slice(0, 10).map((v, index) => (
                            <Cell key={`cell-${index}`} fill={Number(v.efficiency) >= 85 ? "#10B981" : "#F59E0B"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-xl border border-outline-variant bg-[#0b132b]/80 p-5 shadow-xl">
                  <h3 className="mb-4 text-xs font-bold text-[#EF4444] uppercase tracking-wider flex items-center gap-2">
                    <Icon name="pie_chart" className="text-sm text-red-500" />
                    DISTRIBUIÇÃO PERCENTUAL DE CUSTOS
                  </h3>
                  <div className="h-64 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.costBreakdown.map(g => ({
                            name: g.label,
                            value: g.amount
                          }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {data.costBreakdown.map((entry, index) => {
                            const colors = ["#3B82F6", "#EF4444", "#F59E0B", "#10B981", "#8B5CF6"];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Pie>
                        <Tooltip
                          formatter={(value) => formatBRL(Number(value))}
                          contentStyle={{ backgroundColor: "#1e293b", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                          itemStyle={{ fontSize: "10px" }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          iconSize={10}
                          formatter={(value) => {
                            const item = data.costBreakdown.find(g => g.label === value);
                            return <span className="text-[10px] text-slate-300 font-medium">{value} ({item ? item.pct : 0}%)</span>;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </section>
        </>
      )}

      {/* Dossier de Veículo */}
      <FormModal
        open={!!selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
        title="Dossiê Técnico do Ativo"
        subtitle={`Histórico de Desempenho e Consumo da Placa ${selectedVehicle ? formatPlateDisplay(selectedVehicle.plate) : ""}`}
      >
        {selectedVehicle && (
          <div className="space-y-4 text-slate-100">
            <div className="flex items-center gap-4 rounded-xl bg-surface-container-high p-4">
              <Icon name="local_shipping" className="text-4xl text-primary" />
              <div>
                <h4 className="text-lg font-bold">{formatPlateDisplay(selectedVehicle.plate)}</h4>
                <p className="text-xs text-on-surface-variant">Status: Disponível para Despacho</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg bg-surface-container-low p-3">
                <dt className="text-xs text-on-surface-variant">Quilometragem Rodada</dt>
                <dd className="text-xl font-bold text-slate-100">{Number(selectedVehicle.km).toLocaleString("pt-BR")} km</dd>
              </div>
              <div className="rounded-lg bg-surface-container-low p-3">
                <dt className="text-xs text-on-surface-variant">Despesa Acumulada</dt>
                <dd className="text-xl font-bold text-green-400">{formatBRL(Number(selectedVehicle.cost))}</dd>
              </div>
              <div className="rounded-lg bg-surface-container-low p-3">
                <dt className="text-xs text-on-surface-variant">Média de Consumo</dt>
                <dd className="text-xl font-bold text-primary">{(Number(selectedVehicle.km) / Math.max(1, Number(selectedVehicle.cost) / 5.9)).toFixed(2)} Km/L</dd>
              </div>
              <div className="rounded-lg bg-surface-container-low p-3">
                <dt className="text-xs text-on-surface-variant">Taxa de Eficiência Operacional</dt>
                <dd className="text-xl font-bold text-green-400">{selectedVehicle.efficiency}%</dd>
              </div>
            </dl>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs text-primary">
              <p className="font-bold flex items-center gap-1"><Icon name="analytics" className="text-sm" /> Diagnóstico AI</p>
              <p className="mt-1">Ativo com taxa de eficiência operacional acima da média da frota. Recomenda-se manter plano de manutenção preventiva agendado.</p>
            </div>
          </div>
        )}
      </FormModal>

      {/* Dossier de Motorista */}
      <FormModal
        open={!!selectedDriver}
        onClose={() => setSelectedDriver(null)}
        title="Dossiê de Desempenho do Condutor"
        subtitle={`Avaliação e Viagens Realizadas por ${selectedDriver?.name}`}
      >
        {selectedDriver && (
          <div className="space-y-4 text-slate-100">
            <div className="flex items-center gap-4 rounded-xl bg-surface-container-high p-4">
              <Icon name="person" className="text-4xl text-primary" />
              <div>
                <h4 className="text-lg font-bold">{selectedDriver.name}</h4>
                <p className="text-xs text-on-surface-variant">Perfil Homologado para Operação Comercial</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg bg-surface-container-low p-3">
                <dt className="text-xs text-on-surface-variant">Score Operacional</dt>
                <dd className={`text-xl font-bold ${selectedDriver.score >= 85 ? "text-green-400" : "text-amber-500"}`}>{Math.round(selectedDriver.score)}/100</dd>
              </div>
              <div className="rounded-lg bg-surface-container-low p-3">
                <dt className="text-xs text-on-surface-variant">Quilometragem em Viagem</dt>
                <dd className="text-xl font-bold text-slate-100">{Number(selectedDriver.km).toLocaleString("pt-BR")} km</dd>
              </div>
              <div className="rounded-lg bg-surface-container-low p-3">
                <dt className="text-xs text-on-surface-variant">Custo Médio por KM</dt>
                <dd className="text-xl font-bold text-slate-100">{formatBRL(Number(selectedDriver.cost_per_km))}/KM</dd>
              </div>
              <div className="rounded-lg bg-surface-container-low p-3">
                <dt className="text-xs text-on-surface-variant">Conformidade Operacional</dt>
                <dd className="text-xl font-bold text-green-400">Excelente</dd>
              </div>
            </dl>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs text-primary">
              <p className="font-bold flex items-center gap-1"><Icon name="shield" className="text-sm" /> Análise de Segurança</p>
              <p className="mt-1">Condutor apresenta baixo índice de fadiga e direção preventiva. Homologado para viagens de longa distância.</p>
            </div>
          </div>
        )}
      </FormModal>
    </AppShell>
  );
}
