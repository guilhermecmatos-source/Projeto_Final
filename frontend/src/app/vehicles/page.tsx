"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ActionLink from "@/components/ui/ActionLink";
import { ACTION_ROUTES } from "@/lib/action-routes";

const STATS = [
  { label: "Total de Veículos", value: "142", icon: "local_shipping", trend: "+4%" },
  { label: "Disponíveis", value: "118", icon: "check_circle" },
  { label: "Em Manutenção", value: "14", icon: "build" },
  { label: "Revisão Pendente", value: "10", icon: "warning" },
];

const VEHICLES = [
  { plate: "ABC-1234", model: "Toyota Hilux", driver: "Carlos E.", status: "active", km: "42.150" },
  { plate: "DEF-5678", model: "VW Delivery", driver: "Ana M.", status: "maintenance", km: "88.420" },
  { plate: "GHI-9012", model: "Fiat Strada", driver: "—", status: "active", km: "12.800" },
  { plate: "JKL-3456", model: "Mercedes Sprinter", driver: "João P.", status: "inactive", km: "201.000" },
];

const TAB_STATUS: Record<string, string | null> = {
  Todos: null,
  Ativos: "active",
  Manutenção: "maintenance",
  Inativos: "inactive",
};

export default function VehiclesPage() {
  const [activeTab, setActiveTab] = useState("Todos");

  const filtered = VEHICLES.filter((v) => {
    const status = TAB_STATUS[activeTab];
    return !status || v.status === status;
  });

  return (
    <AppShell
      searchPlaceholder="Buscar veículos, placas ou motoristas..."
      headerAction={
        <ActionLink href={ACTION_ROUTES.travelsAssign}>
          <Icon name="add" className="text-lg" />
          Atribuir Veículo
        </ActionLink>
      }
    >
      <PageHeader
        breadcrumb="Gestão de Veículos"
        title="Inventário de Frota"
        actions={
          <>
            <ActionLink href={ACTION_ROUTES.vehiclesRegister} variant="outline" className="!border-primary-container !text-primary-container">
              <Icon name="filter_list" />
              Cadastro Rápido
            </ActionLink>
            <ActionLink href={ACTION_ROUTES.vehiclesRegister}>
              <Icon name="directions_car" />
              Cadastrar Veículo
            </ActionLink>
          </>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="raised-card flex h-32 flex-col justify-between p-4">
            <div className="flex items-start justify-between">
              <span className="rounded-lg bg-primary-fixed p-2 text-primary">
                <Icon name={s.icon} />
              </span>
              {s.trend && (
                <span className="flex items-center text-label-md font-bold text-green-600">
                  {s.trend}
                  <Icon name="trending_up" className="text-sm" />
                </span>
              )}
            </div>
            <div>
              <p className="text-label-md text-on-surface-variant">{s.label}</p>
              <h3 className="text-headline-md font-bold">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="raised-card overflow-hidden">
        <div className="flex gap-6 border-b border-outline-variant bg-surface-container-lowest p-4">
          {Object.keys(TAB_STATUS).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`text-label-md ${activeTab === tab ? "border-b-2 border-primary font-bold text-primary" : "text-on-surface-variant"}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <table className="zebra-table w-full text-left text-body-md">
          <thead>
            <tr className="border-b bg-surface-container/50 text-label-md text-on-surface-variant">
              <th className="px-6 py-4">Placa</th>
              <th className="px-6 py-4">Modelo</th>
              <th className="px-6 py-4">Motorista</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Quilometragem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {filtered.map((v) => (
              <tr key={v.plate}>
                <td className="px-6 py-4 font-bold">{v.plate}</td>
                <td className="px-6 py-4">{v.model}</td>
                <td className="px-6 py-4">{v.driver}</td>
                <td className="px-6 py-4">
                  <span
                    className={
                      v.status === "active"
                        ? "chip-active"
                        : v.status === "maintenance"
                          ? "chip-warning"
                          : "chip-pending"
                    }
                  >
                    {v.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">{v.km} km</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
