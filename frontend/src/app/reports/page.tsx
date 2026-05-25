"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ActionLink from "@/components/ui/ActionLink";
import { ACTION_ROUTES } from "@/lib/action-routes";

const REPORTS = [
  { name: "Performance Operacional", period: "Mensal", type: "Operacional", updated: "Hoje" },
  { name: "Custos e Combustível", period: "Semanal", type: "Financeiro", updated: "Ontem" },
  { name: "Conformidade de Frota", period: "Trimestral", type: "Compliance", updated: "12/05" },
  { name: "Score de Motoristas", period: "Mensal", type: "RH", updated: "10/05" },
  { name: "Eficiência KM/Custo", period: "30 dias", type: "Estratégico", updated: "Hoje" },
];

const TOP_DRIVERS = [
  { name: "Carlos Eduardo", score: 98, km: 12400, costPerKm: "R$ 1,12" },
  { name: "Ana Martins", score: 96, km: 11850, costPerKm: "R$ 1,18" },
  { name: "João Pereira", score: 94, km: 10920, costPerKm: "R$ 1,21" },
  { name: "Maria Silva", score: 92, km: 9850, costPerKm: "R$ 1,25" },
  { name: "Pedro Costa", score: 90, km: 8720, costPerKm: "R$ 1,28" },
];

const RECENT_REPORTS = [
  { title: "Custos vs KM — Abril", date: "24/05/2026", status: "Pronto" },
  { title: "Distribuição de Gastos Q2", date: "22/05/2026", status: "Pronto" },
  { title: "Desempenho Frota SP", date: "20/05/2026", status: "Processando" },
];

export default function ReportsPage() {
  const [period, setPeriod] = useState<"30" | "7" | "90">("30");

  return (
    <AppShell>
      <PageHeader
        title="Relatórios Estratégicos"
        subtitle="Análises consolidadas para tomada de decisão executiva."
        actions={
          <>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "30" as const, label: "Últimos 30 dias" },
                { id: "7" as const, label: "7 dias" },
                { id: "90" as const, label: "90 dias" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setPeriod(f.id)}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-label-md transition ${
                    period === f.id
                      ? "border-primary bg-primary-container/10 font-bold text-primary"
                      : "border-outline-variant bg-white hover:bg-surface-container-low"
                  }`}
                >
                  <Icon name="calendar_today" className="text-sm" />
                  {f.label}
                </button>
              ))}
            </div>
            <ActionLink href={ACTION_ROUTES.reportsExport}>
              <Icon name="download" />
              Exportar Pacote
            </ActionLink>
          </>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Relatórios Gerados", value: period === "30" ? "128" : "42", icon: "description" },
          { label: "Exportações", value: "42", icon: "cloud_download" },
          { label: "Agendados", value: "12", icon: "schedule" },
          { label: "Compartilhados", value: "8", icon: "share" },
        ].map((s) => (
          <div key={s.label} className="raised-card flex items-center gap-4 p-4">
            <Icon name={s.icon} className="text-2xl text-primary" />
            <div>
              <p className="text-label-md text-on-surface-variant">{s.label}</p>
              <p className="text-headline-md font-bold">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="mb-8 raised-card p-4 sm:p-6">
        <h2 className="mb-6 text-headline-sm text-primary">
          Evolução de Custos vs KM Rodados
          <span className="ml-2 text-sm font-normal text-on-surface-variant">
            (filtro: {period === "30" ? "Últimos 30 dias" : period === "7" ? "7 dias" : "90 dias"})
          </span>
        </h2>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-outline-variant p-4">
            <h3 className="mb-4 flex items-center gap-2 text-title-md font-bold">
              <Icon name="speed" className="text-primary" />
              Desempenho do veículo
            </h3>
            <div className="space-y-3">
              {[
                { plate: "ABC-1234", km: 4200, cost: 5940, efficiency: 92 },
                { plate: "DEF-5678", km: 3800, cost: 5890, efficiency: 85 },
                { plate: "GHI-9012", km: 5100, cost: 6120, efficiency: 96 },
              ].map((v) => (
                <div key={v.plate}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-semibold">{v.plate}</span>
                    <span>{v.km.toLocaleString("pt-BR")} km • R$ {v.cost.toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
                    <div className="h-full bg-primary" style={{ width: `${v.efficiency}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-outline-variant p-4">
            <h3 className="mb-4 flex items-center gap-2 text-title-md font-bold">
              <Icon name="pie_chart" className="text-primary" />
              Distribuição de gastos
            </h3>
            <div className="space-y-3">
              {[
                { label: "Combustível", pct: 42, color: "bg-primary" },
                { label: "Manutenção", pct: 28, color: "bg-secondary-container" },
                { label: "Pedágio", pct: 15, color: "bg-primary-container" },
                { label: "Outros", pct: 15, color: "bg-outline-variant" },
              ].map((g) => (
                <div key={g.label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{g.label}</span>
                    <span className="font-bold">{g.pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
                    <div className={`h-full ${g.color}`} style={{ width: `${g.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-outline-variant p-4">
            <h3 className="mb-4 flex items-center gap-2 text-title-md font-bold">
              <Icon name="emoji_events" className="text-primary" />
              Top 5 motoristas mais eficientes
            </h3>
            <ol className="space-y-2">
              {TOP_DRIVERS.map((d, i) => (
                <li
                  key={d.name}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-container-low p-3 text-sm"
                >
                  <span className="font-bold">
                    {i + 1}. {d.name}
                  </span>
                  <span className="text-on-surface-variant">
                    Score {d.score} • {d.km.toLocaleString("pt-BR")} km • {d.costPerKm}/km
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-xl border border-outline-variant p-4">
            <h3 className="mb-4 flex items-center gap-2 text-title-md font-bold">
              <Icon name="history" className="text-primary" />
              Relatórios recentes
            </h3>
            <ul className="space-y-2">
              {RECENT_REPORTS.map((r) => (
                <li
                  key={r.title}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-outline-variant/50 p-3"
                >
                  <div>
                    <p className="font-semibold text-sm">{r.title}</p>
                    <p className="text-xs text-on-surface-variant">{r.date}</p>
                  </div>
                  <span className={r.status === "Pronto" ? "chip-active" : "chip-pending"}>
                    {r.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="mb-3 text-sm font-bold text-on-surface-variant">Comparativo custo × km (período)</h3>
          <div className="flex h-40 items-end gap-1 sm:gap-2">
            {[58, 72, 65, 80, 68, 75, 62, 78, 70, 85, 72, 68].map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-primary-container/80"
                  style={{ height: `${h}%` }}
                  title={`Semana ${i + 1}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="raised-card table-responsive overflow-hidden">
        <table className="zebra-table w-full min-w-[600px] text-body-md">
          <thead>
            <tr className="border-b bg-surface-container-low text-left text-label-md text-on-surface-variant">
              <th className="px-4 py-4 sm:px-6">Relatório</th>
              <th className="px-4 py-4 sm:px-6">Período</th>
              <th className="px-4 py-4 sm:px-6">Tipo</th>
              <th className="px-4 py-4 sm:px-6">Atualizado</th>
              <th className="px-4 py-4 text-right sm:px-6">Ações</th>
            </tr>
          </thead>
          <tbody>
            {REPORTS.map((r) => (
              <tr key={r.name}>
                <td className="px-4 py-4 font-bold sm:px-6" data-label="Relatório">
                  {r.name}
                </td>
                <td className="px-4 py-4 sm:px-6" data-label="Período">
                  {r.period}
                </td>
                <td className="px-4 py-4 sm:px-6" data-label="Tipo">
                  <span className="rounded bg-surface-container-high px-2 py-0.5 text-[11px] font-bold uppercase">
                    {r.type}
                  </span>
                </td>
                <td className="px-4 py-4 sm:px-6" data-label="Atualizado">
                  {r.updated}
                </td>
                <td className="px-4 py-4 text-right sm:px-6" data-label="Ações">
                  <ActionLink href={ACTION_ROUTES.reportsExport} variant="ghost" className="!p-0">
                    <Icon name="visibility" className="inline text-lg" />
                  </ActionLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
