"use client";

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
];

export default function ReportsPage() {
  return (
    <AppShell>
      <PageHeader
        title="Relatórios Estratégicos"
        subtitle="Análises consolidadas para tomada de decisão executiva."
        actions={
          <ActionLink href={ACTION_ROUTES.reportsExport}>
            <Icon name="download" />
            Exportar Pacote
          </ActionLink>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Relatórios Gerados", value: "128", icon: "description" },
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

      <div className="raised-card overflow-hidden">
        <table className="zebra-table w-full text-body-md">
          <thead>
            <tr className="border-b bg-surface-container-low text-left text-label-md text-on-surface-variant">
              <th className="px-6 py-4">Relatório</th>
              <th className="px-6 py-4">Período</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Atualizado</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {REPORTS.map((r) => (
              <tr key={r.name}>
                <td className="px-6 py-4 font-bold">{r.name}</td>
                <td className="px-6 py-4">{r.period}</td>
                <td className="px-6 py-4">
                  <span className="rounded bg-surface-container-high px-2 py-0.5 text-[11px] font-bold uppercase">
                    {r.type}
                  </span>
                </td>
                <td className="px-6 py-4">{r.updated}</td>
                <td className="px-6 py-4 text-right">
                  <ActionLink href={ACTION_ROUTES.reportsExport} variant="ghost" className="!p-0">
                    <Icon name="visibility" className="inline text-lg" />
                  </ActionLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="raised-card p-6">
          <h3 className="mb-4 text-headline-sm">Tendência de Custos</h3>
          <div className="flex h-40 items-end gap-2">
            {[65, 72, 58, 80, 68, 75, 62].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-primary-container/80"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
        <div className="raised-card p-6">
          <h3 className="mb-4 text-headline-sm">Distribuição por Região</h3>
          <div className="space-y-3">
            {[
              { region: "Sudeste", pct: 45 },
              { region: "Sul", pct: 28 },
              { region: "Centro-Oeste", pct: 18 },
            ].map((r) => (
              <div key={r.region}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{r.region}</span>
                  <span className="font-bold">{r.pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
                  <div className="h-full bg-primary" style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
