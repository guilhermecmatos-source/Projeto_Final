"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { KpiSkeleton, CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { intelligenceApi, dashboardApi } from "@/services/api";
import { extractApiError } from "@/lib/api-errors";
import { formatBRL, formatBRLCompact } from "@/lib/currency";
import type {
  AnalyticsData,
  DriverScore,
  VehiclePredictiveReport,
  ConsumptionByModel,
} from "@/types";

// ── Mini gráfico de barras inline ─────────────────────────────────────────
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="h-2 w-full rounded-full bg-surface-container-highest overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ── Score badge ───────────────────────────────────────────────────────────
const BADGE_STYLE: Record<string, string> = {
  Excelente: "bg-green-500/20 text-green-400",
  Bom: "bg-blue-500/20 text-blue-400",
  Regular: "bg-amber-500/20 text-amber-400",
  Crítico: "bg-red-500/20 text-red-400",
};

// ── Severity de peça ──────────────────────────────────────────────────────
const PART_SEVERITY: Record<string, { label: string; cls: string }> = {
  ok: { label: "OK", cls: "chip-active" },
  warning: { label: "Atenção", cls: "chip-warning" },
  critical: { label: "Crítico", cls: "chip-error" },
};

// ── Tabs ──────────────────────────────────────────────────────────────────
const TABS = ["Executivo", "Operacional", "Comercial", "Preditivo"] as const;
type Tab = (typeof TABS)[number];

export default function IntelligencePage() {
  const [activeTab, setActiveTab] = useState<Tab>("Executivo");

  // State por aba
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [driverScores, setDriverScores] = useState<DriverScore[]>([]);
  const [predictiveParts, setPredictiveParts] = useState<VehiclePredictiveReport[]>([]);
  const [consumptionByModel, setConsumptionByModel] = useState<ConsumptionByModel[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      dashboardApi.analytics(),
      intelligenceApi.driverScores(),
      intelligenceApi.predictiveParts(),
      intelligenceApi.consumptionByModel(),
    ])
      .then(([aRes, dsRes, ppRes, cmRes]) => {
        setAnalytics(aRes.data);
        setDriverScores(Array.isArray(dsRes.data) ? dsRes.data : []);
        setPredictiveParts(Array.isArray(ppRes.data) ? ppRes.data : []);
        setConsumptionByModel(Array.isArray(cmRes.data) ? cmRes.data : []);
      })
      .catch((err) => {
        setError(extractApiError(err, "Não foi possível carregar dados de inteligência."));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Máx para barras de consumo
  const maxKmPerL = useMemo(
    () => Math.max(...consumptionByModel.map((c) => c.avgKmPerL), 1),
    [consumptionByModel]
  );
  const maxFunnelCount = useMemo(
    () => Math.max(...(analytics?.funnel.map((f) => f.count) ?? [1]), 1),
    [analytics]
  );

  return (
    <AppShell>
      <PageHeader
        title="Central de Business Intelligence"
        subtitle="Dados operacionais em tempo real — conectado ao backend FleetAI"
      />

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-outline-variant pb-px">
        {TABS.map((tab) => (
          <button
            key={tab}
            id={`bi-tab-${tab.toLowerCase()}`}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-5 py-2.5 text-sm font-semibold transition border-b-2 -mb-px ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Estados de loading / erro ─────────────────────────────── */}
      {loading ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <ErrorBoundary>
          <>
          {/* ═══════════════════════════════════ ABA EXECUTIVO ══════════════════════════════════ */}
          {activeTab === "Executivo" && analytics && (
            <div className="space-y-6">
              {/* KPI Cards de faturamento */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    label: "Receita Total",
                    value: formatBRL(analytics.billing.totalRevenue),
                    icon: "payments",
                    color: "text-green-400",
                  },
                  {
                    label: "Receita Contratos",
                    value: formatBRL(analytics.billing.contractRevenue),
                    icon: "description",
                    color: "text-blue-400",
                  },
                  {
                    label: "Receita Viagens",
                    value: formatBRL(analytics.billing.tripRevenue),
                    icon: "alt_route",
                    color: "text-primary",
                  },
                  {
                    label: "Margem Global",
                    value: `${analytics.billing.globalProfitMargin.toFixed(1)}%`,
                    icon: "trending_up",
                    color: analytics.billing.globalProfitMargin >= 0 ? "text-green-400" : "text-red-400",
                  },
                ].map((card) => (
                  <div key={card.label} className="raised-card p-4">
                    <div className="flex items-start justify-between">
                      <p className="text-label-md uppercase text-on-surface-variant">{card.label}</p>
                      <span className={`material-symbols-outlined text-xl ${card.color}`}>{card.icon}</span>
                    </div>
                    <p className={`mt-2 text-headline-md font-black ${card.color}`}>{card.value}</p>
                  </div>
                ))}
              </div>

              {/* Cards por região */}
              <div>
                <h3 className="mb-3 text-headline-sm text-primary">Performance por Unidade Regional</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  {analytics.regions.map((r) => (
                    <div key={r.region} className="raised-card p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="font-bold text-on-surface">{r.region}</h4>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            r.profitMargin >= 20
                              ? "bg-green-500/20 text-green-400"
                              : r.profitMargin >= 0
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {r.profitMargin.toFixed(1)}% Margem
                        </span>
                      </div>
                      <div className="space-y-1.5 text-sm text-on-surface-variant">
                        <div className="flex justify-between">
                          <span>Viagens</span>
                          <span className="font-bold text-on-surface">{r.totalTrips}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Concluídas</span>
                          <span className="font-bold text-green-400">{r.completedTrips}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Receita</span>
                          <span className="font-bold text-primary">{formatBRL(r.revenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Combustível</span>
                          <span className="font-bold text-red-400">{formatBRL(r.fuelCost)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evolução de receita */}
              {analytics.revenueEvolution.length > 0 && (
                <div className="raised-card p-4">
                  <h3 className="mb-4 text-headline-sm text-primary">Evolução de Receita (últimos 6 meses)</h3>
                  <div className="flex items-end gap-2 h-32">
                    {analytics.revenueEvolution.map((p) => {
                      const maxRev = Math.max(...analytics.revenueEvolution.map((x) => x.revenue), 1);
                      const heightPct = (p.revenue / maxRev) * 100;
                      return (
                        <div key={p.month} className="flex flex-1 flex-col items-center gap-1">
                          <span className="text-[9px] font-bold text-primary">{formatBRLCompact(p.revenue)}</span>
                          <div
                            className="w-full rounded-t-md bg-primary/70 hover:bg-primary transition-all"
                            style={{ height: `${heightPct}%` }}
                            title={`${p.month}: ${formatBRL(p.revenue)}`}
                          />
                          <span className="text-[9px] text-on-surface-variant">{p.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════ ABA OPERACIONAL ══════════════════════════════════ */}
          {activeTab === "Operacional" && (
            <div className="space-y-6">
              <div className="raised-card overflow-hidden">
                <div className="border-b border-outline-variant p-4">
                  <h3 className="text-headline-sm text-primary">Consumo km/L por Modelo de Ativo</h3>
                  <p className="text-sm text-on-surface-variant">Baseado em registros reais de abastecimento</p>
                </div>
                {consumptionByModel.length === 0 ? (
                  <p className="p-6 text-center text-on-surface-variant">Nenhum dado de consumo disponível ainda.</p>
                ) : (
                  <div className="divide-y divide-outline-variant">
                    {consumptionByModel.map((c) => (
                      <div key={`${c.brand}-${c.model}`} className="p-4">
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="font-bold text-on-surface">
                            {c.brand} {c.model}
                          </span>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-on-surface-variant">{c.vehicleCount} veículo(s)</span>
                            <span className="font-bold text-primary">{c.avgKmPerL.toFixed(2)} km/L</span>
                          </div>
                        </div>
                        <MiniBar value={c.avgKmPerL} max={maxKmPerL} color="bg-primary" />
                        <p className="mt-1 text-xs text-on-surface-variant">
                          Total percorrido: {c.totalKm.toLocaleString("pt-BR")} km
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════ ABA COMERCIAL ══════════════════════════════════ */}
          {activeTab === "Comercial" && analytics && (
            <div className="space-y-6">
              <div className="raised-card p-6">
                <h3 className="mb-6 text-headline-sm text-primary">Funil Comercial — Status de Contratos</h3>
                <div className="space-y-4">
                  {analytics.funnel.map((stage) => (
                    <div key={stage.key}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="font-semibold text-on-surface">{stage.stage}</span>
                        <span className="text-lg font-black text-primary">{stage.count}</span>
                      </div>
                      <MiniBar
                        value={stage.count}
                        max={maxFunnelCount}
                        color={
                          stage.key === "assinado"
                            ? "bg-green-500"
                            : stage.key === "enviado"
                            ? "bg-blue-500"
                            : stage.key === "cancelado"
                            ? "bg-red-500"
                            : "bg-primary"
                        }
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {analytics.funnel.map((stage) => (
                    <div key={stage.key} className="raised-card p-3 text-center">
                      <p className="text-2xl font-black text-primary">{stage.count}</p>
                      <p className="text-xs text-on-surface-variant">{stage.stage}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════ ABA PREDITIVO ══════════════════════════════════ */}
          {activeTab === "Preditivo" && (
            <div className="space-y-6">
              {/* Score de Condutores */}
              <div className="raised-card overflow-hidden">
                <div className="border-b border-outline-variant p-4">
                  <h3 className="text-headline-sm text-primary">Score de Condutores</h3>
                  <p className="text-sm text-on-surface-variant">
                    Score composto: 70% perfil + 30% taxa de conclusão de viagens
                  </p>
                </div>
                {driverScores.length === 0 ? (
                  <p className="p-6 text-center text-on-surface-variant">Nenhum condutor ativo no sistema.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="zebra-table w-full text-sm">
                      <thead>
                        <tr className="text-left text-label-md text-on-surface-variant">
                          <th className="px-4 py-3">Condutor</th>
                          <th className="px-4 py-3">CNH</th>
                          <th className="px-4 py-3">Score</th>
                          <th className="px-4 py-3">Classificação</th>
                          <th className="px-4 py-3">Viagens</th>
                          <th className="px-4 py-3">Taxa Conclusão</th>
                          <th className="px-4 py-3">KM Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {driverScores.map((d) => (
                          <tr key={d.id}>
                            <td className="px-4 py-3 font-semibold">{d.name}</td>
                            <td className="px-4 py-3 text-on-surface-variant">{d.cnhCategory}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-primary">{d.score.toFixed(1)}</span>
                                <div className="h-1.5 w-16 rounded-full bg-surface-container-highest overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-primary"
                                    style={{ width: `${Math.min(d.score, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${
                                  BADGE_STYLE[d.badge] ?? "bg-slate-500/20 text-slate-400"
                                }`}
                              >
                                {d.badge}
                              </span>
                            </td>
                            <td className="px-4 py-3">{d.completedTrips + d.cancelledTrips}</td>
                            <td className="px-4 py-3">
                              <span
                                className={
                                  d.completionRate >= 80 ? "text-green-400" : d.completionRate >= 60 ? "text-amber-400" : "text-red-400"
                                }
                              >
                                {d.completionRate}%
                              </span>
                            </td>
                            <td className="px-4 py-3">{d.totalKm.toLocaleString("pt-BR")} km</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Laudo Preditivo de Peças */}
              <div>
                <h3 className="mb-3 text-headline-sm text-primary">Laudo Preditivo de Autopeças</h3>
                {predictiveParts.length === 0 ? (
                  <div className="raised-card p-6 text-center text-on-surface-variant">
                    Nenhum veículo ativo para análise preditiva.
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {predictiveParts.map((v) => {
                      const failureProb = v.failureProbability ?? 10;
                      return (
                        <div key={v.vehicleId} className="raised-card p-4 border border-outline-variant/30 hover:border-primary/50 transition-all flex flex-col justify-between">
                          <div>
                            <p className="font-bold text-primary">{v.plate}</p>
                            <p className="text-xs text-on-surface-variant">
                              {v.brand} {v.model}
                            </p>
                          </div>
                          <p className="text-xs text-on-surface-variant">
                            {v.mileage.toLocaleString("pt-BR")} km
                          </p>
                        <div className="space-y-2">
                          {v.parts.map((p) => (
                            <div key={p.name} className="flex items-center justify-between gap-2">
                              <span className="text-xs text-on-surface-variant flex-1 min-w-0 truncate">
                                {p.name}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-on-surface">
                                  {p.kmUntilChange.toLocaleString("pt-BR")} km
                                </span>
                                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                                  PART_SEVERITY[p.severity]?.cls ?? "chip-active"
                                }`}>
                                  {PART_SEVERITY[p.severity]?.label ?? p.severity}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {v.lastMaintenance && (
                          <p className="mt-3 border-t border-outline-variant pt-2 text-[10px] text-on-surface-variant">
                            Última manutenção: {new Date(v.lastMaintenance).toLocaleDateString("pt-BR")}
                          </p>
                        )}
                      </div>
                    );
                  })}
                  </div>
                )}
            </div>
          </div>
        )}
          </>
        </ErrorBoundary>
      )}
    </AppShell>
  );
}
