"use client";

import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ActionLink from "@/components/ui/ActionLink";
import { ACTION_ROUTES } from "@/lib/action-routes";

const METRICS = [
  { label: "Frota Disponível", value: "94%", icon: "check_circle", color: "text-green-600" },
  { label: "SLA Entregas", value: "98.2%", icon: "local_shipping", color: "text-primary" },
  { label: "Custo/Km", value: "R$ 1.42", icon: "payments", color: "text-secondary" },
  { label: "Incidentes", value: "3", icon: "warning", color: "text-error" },
];

const ACTIVITY = [
  { id: "V-4029", route: "São Paulo → Curitiba", status: "Em curso", chip: "chip-active" },
  { id: "V-3310", route: "Campinas → Santos", status: "Agendado", chip: "chip-pending" },
  { id: "V-2188", route: "BH → Rio", status: "Concluído", chip: "chip-active" },
];

export default function CockpitPage() {
  return (
    <AppShell
      headerTitle="Cockpit Unificado"
      headerAction={
        <ActionLink href={ACTION_ROUTES.cockpitOrder}>
          <Icon name="add" className="text-sm" />
          Novo Pedido
        </ActionLink>
      }
    >
      <PageHeader
        title="Cockpit Unificado"
        subtitle="Status operacional em tempo real da FleetAI."
        actions={
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-outline-variant bg-white px-4 py-2 text-label-md hover:bg-surface-container-low"
          >
            <Icon name="calendar_today" className="text-sm" />
            Hoje
          </button>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((m) => (
          <div key={m.label} className="raised-card flex items-center gap-4 p-4">
            <span className={`rounded-lg bg-surface-container-low p-3 ${m.color}`}>
              <Icon name={m.icon} />
            </span>
            <div>
              <p className="text-label-md uppercase text-on-surface-variant">{m.label}</p>
              <p className="text-headline-md font-bold">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="raised-card p-6 lg:col-span-2">
          <h3 className="mb-4 text-headline-sm">Atividade da Frota</h3>
          <div className="space-y-3">
            {ACTIVITY.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-lg border border-outline-variant p-4 transition hover:shadow-raised"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-container text-on-primary">
                    <Icon name="local_shipping" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      {a.id} • {a.route}
                    </p>
                    <p className="text-sm text-on-surface-variant">Monitoramento ativo</p>
                  </div>
                </div>
                <span className={a.chip}>{a.status}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="raised-card p-6">
          <h3 className="mb-4 flex items-center gap-2 text-headline-sm text-primary">
            <Icon name="sync" />
            Sincronização
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-3">
              <span className="text-body-md">Dados em nuvem</span>
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-3">
              <span className="text-body-md">Telemetria GPS</span>
              <span className="chip-active">Online</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-3">
              <span className="text-body-md">IA Preditiva</span>
              <span className="chip-active">Ativa</span>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
