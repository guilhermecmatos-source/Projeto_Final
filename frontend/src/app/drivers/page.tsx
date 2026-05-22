"use client";

import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ActionLink from "@/components/ui/ActionLink";
import { ACTION_ROUTES } from "@/lib/action-routes";

const DRIVERS = [
  { name: "Carlos Eduardo", cnh: "AB", score: 94, trips: 128, status: "Ativo" },
  { name: "Ana Martins", cnh: "C", score: 88, trips: 96, status: "Ativo" },
  { name: "João Pereira", cnh: "D", score: 72, trips: 45, status: "Treinamento" },
];

export default function DriversPage() {
  return (
    <AppShell
      searchPlaceholder="Buscar motoristas..."
      headerAction={
        <ActionLink href={ACTION_ROUTES.driversRegister}>
          <Icon name="person_add" />
          Novo Motorista
        </ActionLink>
      }
    >
      <PageHeader
        breadcrumb="Motoristas"
        title="Gestão de Motoristas"
        subtitle="Perfis, documentação e desempenho operacional."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total", value: "48", icon: "groups" },
          { label: "Ativos", value: "42", icon: "check_circle" },
          { label: "Score Médio", value: "86", icon: "star" },
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
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">CNH</th>
              <th className="px-6 py-4">Score</th>
              <th className="px-6 py-4">Viagens</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {DRIVERS.map((d) => (
              <tr key={d.name}>
                <td className="px-6 py-4 font-bold">{d.name}</td>
                <td className="px-6 py-4">{d.cnh}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">{d.score}</span>
                    <div className="h-1 w-16 overflow-hidden rounded-full bg-surface-container-high">
                      <div className="h-full bg-primary" style={{ width: `${d.score}%` }} />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">{d.trips}</td>
                <td className="px-6 py-4">
                  <span className={d.status === "Ativo" ? "chip-active" : "chip-pending"}>
                    {d.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
