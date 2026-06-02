"use client";

import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ActionLink from "@/components/ui/ActionLink";
import { ACTION_ROUTES } from "@/lib/action-routes";

const ALERTS = [
  {
    title: "Troca de Óleo - VKL-9021",
    desc: "Faltam 350km para o limite de revisão preventiva.",
    level: "ALERTA PRÓXIMO",
    border: "border-l-secondary-container",
    icon: "warning",
    iconColor: "text-secondary",
  },
  {
    title: "Vistoria Vencida - PTR-3342",
    desc: "Licenciamento anual expirou há 2 dias.",
    level: "URGENTE",
    border: "border-l-error",
    icon: "emergency",
    iconColor: "text-error",
    urgent: true,
  },
];

const HISTORY = [
  { date: "12/05/2026", vehicle: "ABC-1234", type: "Preventiva", cost: "R$ 890,00", status: "Concluída" },
  { date: "10/05/2026", vehicle: "DEF-5678", type: "Corretiva", cost: "R$ 2.340,00", status: "Em andamento" },
  { date: "08/05/2026", vehicle: "GHI-9012", type: "Ocorrência", cost: "R$ 450,00", status: "Concluída" },
];

export default function MaintenancePage() {
  return (
    <AppShell
      searchPlaceholder="Buscar logs de manutenção ou veículos..."
      headerAction={
        <ActionLink href={ACTION_ROUTES.travelsAssign}>Atribuir Veículo</ActionLink>
      }
    >
      <PageHeader
        title="Manutenção e Ocorrências"
        subtitle="Controle preventivo e histórico operacional da frota."
        actions={
          <>
            <ActionLink href="/vehicles" variant="outline" className="!bg-white">
              <Icon name="filter_list" className="text-lg" />
              Filtrar Frota
            </ActionLink>
            <ActionLink href={ACTION_ROUTES.maintenanceRegister} variant="secondary">
              <Icon name="add_alert" className="text-lg" />
              Nova Ocorrência
            </ActionLink>
          </>
        }
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 flex flex-col gap-6 lg:col-span-4">
          {ALERTS.map((a) => (
            <div key={a.title} className={`raised-card border-l-4 p-6 ${a.border}`}>
              <div className="mb-4 flex justify-between">
                <Icon name={a.icon} className={`text-3xl ${a.iconColor}`} />
                <span className="rounded-full bg-secondary-fixed px-2 py-0.5 text-[10px] font-bold">
                  {a.level}
                </span>
              </div>
              <h3 className="mb-1 text-headline-sm">{a.title}</h3>
              <p className="mb-4 text-body-md text-on-surface-variant">{a.desc}</p>
              {a.urgent ? (
                <ActionLink
                  href={ACTION_ROUTES.maintenanceRegister}
                  className="!w-full !justify-center !rounded-lg !bg-error !text-on-error"
                >
                  Regularizar Veículo
                </ActionLink>
              ) : (
                <div className="flex gap-4">
                  <ActionLink href={ACTION_ROUTES.maintenanceSchedule} variant="ghost">
                    Agendar Agora
                  </ActionLink>
                  <ActionLink href="/maintenance" variant="ghost" className="!text-on-surface-variant">
                    Ignorar
                  </ActionLink>
                </div>
              )}
            </div>
          ))}
          <div className="raised-card p-6">
            <h4 className="mb-4 text-label-md uppercase tracking-widest text-on-surface-variant">
              Resumo Mensal
            </h4>
            <div className="flex justify-between text-body-md">
              <span>Preventivas em dia</span>
              <span className="font-bold text-primary">88%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-container-high">
              <div className="h-full w-[88%] bg-primary" />
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8">
          <div className="raised-card overflow-hidden">
            <div className="border-b border-outline-variant p-4">
              <h3 className="text-headline-sm">Histórico de Manutenções</h3>
            </div>
            <table className="zebra-table w-full text-body-md">
              <thead>
                <tr className="border-b bg-surface-container-low text-left text-label-md text-on-surface-variant">
                  <th className="px-6 py-3">Data</th>
                  <th className="px-6 py-3">Veículo</th>
                  <th className="px-6 py-3">Tipo</th>
                  <th className="px-6 py-3">Custo</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {HISTORY.map((h) => (
                  <tr key={h.date + h.vehicle}>
                    <td className="px-6 py-4">{h.date}</td>
                    <td className="px-6 py-4 font-medium">{h.vehicle}</td>
                    <td className="px-6 py-4">{h.type}</td>
                    <td className="px-6 py-4">{h.cost}</td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          h.status === "Concluída" ? "chip-active" : "chip-pending"
                        }
                      >
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
