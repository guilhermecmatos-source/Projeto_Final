"use client";

import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ActionLink from "@/components/ui/ActionLink";
import { ACTION_ROUTES } from "@/lib/action-routes";

const RECORDS = [
  { date: "20/05/2026", vehicle: "ABC-1234", liters: 45, cost: "R$ 315,00", station: "Posto Shell" },
  { date: "18/05/2026", vehicle: "DEF-5678", liters: 68, cost: "R$ 476,00", station: "Ipiranga", alert: true },
  { date: "15/05/2026", vehicle: "GHI-9012", liters: 38, cost: "R$ 266,00", station: "BR Mania" },
];

export default function FuelPage() {
  return (
    <AppShell searchPlaceholder="Buscar abastecimentos...">
      <PageHeader
        breadcrumb="Abastecimentos"
        title="Controle de Abastecimentos"
        subtitle="Registros, auditoria OCR e detecção de anomalias."
        actions={
          <ActionLink href={ACTION_ROUTES.fuelRegister}>
            <Icon name="local_gas_station" />
            Registrar Abastecimento
          </ActionLink>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Gasto Mensal", value: "R$ 24.8k", icon: "payments" },
          { label: "Litros", value: "3.420 L", icon: "water_drop" },
          { label: "Alertas IA", value: "2", icon: "gpp_maybe", warn: true },
        ].map((s) => (
          <div key={s.label} className="raised-card p-4">
            <Icon name={s.icon} className={`mb-2 text-2xl ${s.warn ? "text-error" : "text-primary"}`} />
            <p className="text-label-md text-on-surface-variant">{s.label}</p>
            <p className="text-headline-md font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="raised-card overflow-hidden">
        <table className="zebra-table w-full text-body-md">
          <thead>
            <tr className="border-b bg-surface-container-low text-left text-label-md text-on-surface-variant">
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Veículo</th>
              <th className="px-6 py-4">Litros</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4">Posto</th>
            </tr>
          </thead>
          <tbody>
            {RECORDS.map((r) => (
              <tr key={r.date + r.vehicle} className={r.alert ? "bg-error-container/10" : ""}>
                <td className="px-6 py-4">{r.date}</td>
                <td className="px-6 py-4 font-medium">{r.vehicle}</td>
                <td className="px-6 py-4">
                  {r.liters} L
                  {r.alert && (
                    <span className="ml-2 chip-error">Anomalia</span>
                  )}
                </td>
                <td className="px-6 py-4">{r.cost}</td>
                <td className="px-6 py-4">{r.station}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
