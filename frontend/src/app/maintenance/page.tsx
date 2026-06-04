"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ActionLink from "@/components/ui/ActionLink";
import { ACTION_ROUTES } from "@/lib/action-routes";
import { maintenanceApi } from "@/services/api";
import { formatBRL } from "@/lib/currency";
import { formatPlateDisplay } from "@/lib/validators";

interface MaintenanceRow {
  id: string;
  vehicle_plate: string;
  type: string;
  description: string;
  cost: number;
  scheduled_at: string;
  completed_at?: string | null;
}

interface AlertBundle {
  pending?: MaintenanceRow[];
  maintenanceVehicles?: { plate: string; status: string }[];
  predictive?: { message: string; severity: string; type: string }[];
}

const TYPE_LABEL: Record<string, string> = {
  preventive: "Preventiva",
  corrective: "Corretiva",
  occurrence: "Ocorrência",
};

export default function MaintenancePage() {
  const [history, setHistory] = useState<MaintenanceRow[]>([]);
  const [alerts, setAlerts] = useState<AlertBundle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([maintenanceApi.list(), maintenanceApi.alerts()])
      .then(([listRes, alertRes]) => {
        setHistory(Array.isArray(listRes.data) ? listRes.data : []);
        setAlerts(alertRes.data as AlertBundle);
      })
      .catch(() => {
        setHistory([]);
        setAlerts(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const alertCards = [
    ...(alerts?.pending?.filter((m) => !m.completed_at).slice(0, 4).map((m) => ({
      title: `${TYPE_LABEL[m.type] ?? m.type} — ${formatPlateDisplay(m.vehicle_plate)}`,
      desc: m.description,
      level: new Date(m.scheduled_at) < new Date() ? "URGENTE" : "ALERTA PRÓXIMO",
      urgent: new Date(m.scheduled_at) < new Date(),
    })) ?? []),
    ...(alerts?.maintenanceVehicles?.map((v) => ({
      title: `Veículo em manutenção — ${formatPlateDisplay(v.plate)}`,
      desc: "Status operacional: em oficina/manutenção.",
      level: "EM MANUTENÇÃO",
      urgent: true,
    })) ?? []),
  ];

  return (
    <AppShell searchPlaceholder="Buscar manutenções...">
      <PageHeader
        title="Manutenção e Ocorrências"
        subtitle="Alertas e histórico reais dos veículos cadastrados."
        actions={
          <>
            <ActionLink href="/vehicles" variant="outline" className="!bg-white">
              <Icon name="directions_car" className="text-lg" />
              Ver Frota
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
          {loading ? (
            <p className="text-on-surface-variant">Carregando alertas...</p>
          ) : alertCards.length === 0 ? (
            <div className="raised-card p-6 text-on-surface-variant">
              Nenhum alerta pendente. Frota em dia.
            </div>
          ) : (
            alertCards.map((a) => (
              <div
                key={a.title}
                className={`raised-card border-l-4 p-6 ${a.urgent ? "border-l-error" : "border-l-secondary-container"}`}
              >
                <div className="mb-4 flex justify-between">
                  <Icon
                    name={a.urgent ? "emergency" : "warning"}
                    className={`text-3xl ${a.urgent ? "text-error" : "text-secondary"}`}
                  />
                  <span className="rounded-full bg-secondary-fixed px-2 py-0.5 text-[10px] font-bold">
                    {a.level}
                  </span>
                </div>
                <h3 className="mb-1 text-headline-sm">{a.title}</h3>
                <p className="mb-4 text-body-md text-on-surface-variant">{a.desc}</p>
                <ActionLink
                  href={ACTION_ROUTES.maintenanceRegister}
                  variant={a.urgent ? "secondary" : "ghost"}
                  className={a.urgent ? "!w-full !justify-center" : ""}
                >
                  Registrar / Agendar
                </ActionLink>
              </div>
            ))
          )}
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
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      Carregando...
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                      Nenhuma manutenção registrada.
                    </td>
                  </tr>
                ) : (
                  history.map((h) => (
                    <tr key={h.id}>
                      <td className="px-6 py-4">
                        {new Date(h.scheduled_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatPlateDisplay(h.vehicle_plate)}
                      </td>
                      <td className="px-6 py-4">{TYPE_LABEL[h.type] ?? h.type}</td>
                      <td className="px-6 py-4">{formatBRL(Number(h.cost))}</td>
                      <td className="px-6 py-4">
                        <span className={h.completed_at ? "chip-active" : "chip-pending"}>
                          {h.completed_at ? "Concluída" : "Pendente"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
