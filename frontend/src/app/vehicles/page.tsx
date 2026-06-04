"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ActionLink from "@/components/ui/ActionLink";
import { ACTION_ROUTES } from "@/lib/action-routes";
import { vehiclesApi } from "@/services/api";
import { formatPlateDisplay } from "@/lib/validators";

interface VehicleRow {
  id: string;
  plate: string;
  brand: string;
  model: string;
  status: string;
  mileage: number;
  avg_consumption?: number | null;
  autonomy_km?: number | null;
}

const TAB_STATUS: Record<string, string | null> = {
  Todos: null,
  Ativos: "active",
  Manutenção: "maintenance",
  Inativos: "inactive",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Ativo",
  maintenance: "Manutenção",
  inactive: "Inativo",
};

export default function VehiclesPage() {
  const searchParams = useSearchParams();
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Todos");
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    vehiclesApi
      .list()
      .then((res) => setVehicles(Array.isArray(res.data) ? res.data : []))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load, searchParams.get("t")]);

  const stats = useMemo(() => {
    const total = vehicles.length;
    const active = vehicles.filter((v) => v.status === "active").length;
    const maintenance = vehicles.filter((v) => v.status === "maintenance").length;
    const inactive = vehicles.filter((v) => v.status === "inactive").length;
    return { total, active, maintenance, inactive };
  }, [vehicles]);

  const filtered = vehicles.filter((v) => {
    const status = TAB_STATUS[activeTab];
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      v.plate.toLowerCase().includes(q) ||
      v.brand.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q);
    return matchSearch && (!status || v.status === status);
  });

  return (
    <AppShell
      searchPlaceholder="Buscar veículos ou placas..."
      headerAction={
        <ActionLink href={ACTION_ROUTES.vehiclesRegister}>
          <Icon name="add" className="text-lg" />
          Novo Veículo
        </ActionLink>
      }
    >
      <PageHeader
        breadcrumb="Gestão de Veículos"
        title="Inventário de Frota"
        actions={
          <ActionLink href={ACTION_ROUTES.vehiclesRegister}>
            <Icon name="directions_car" />
            Cadastrar Veículo
          </ActionLink>
        }
      />

      <div className="mb-4">
        <input
          className="input-fleet max-w-md"
          placeholder="Filtrar listagem..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total de Veículos", value: stats.total, icon: "local_shipping" },
          { label: "Disponíveis", value: stats.active, icon: "check_circle" },
          { label: "Em Manutenção", value: stats.maintenance, icon: "build" },
          { label: "Inativos", value: stats.inactive, icon: "warning" },
        ].map((s) => (
          <div key={s.label} className="raised-card flex h-32 flex-col justify-between p-4">
            <span className="rounded-lg bg-primary-fixed p-2 text-primary">
              <Icon name={s.icon} />
            </span>
            <div>
              <p className="text-label-md text-on-surface-variant">{s.label}</p>
              <h3 className="text-headline-md font-bold">{loading ? "—" : s.value}</h3>
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
        <div className="table-responsive">
          <table className="zebra-table w-full min-w-[520px] text-left text-body-md">
            <thead>
              <tr className="border-b bg-surface-container/50 text-label-md text-on-surface-variant">
                <th className="px-4 py-4 sm:px-6">Placa</th>
                <th className="px-4 py-4 sm:px-6">Modelo</th>
                <th className="px-4 py-4 sm:px-6">Status</th>
                <th className="px-4 py-4 sm:px-6">Consumo médio</th>
                <th className="px-4 py-4 text-right sm:px-6">Quilometragem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                    Carregando frota...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                    Nenhum veículo cadastrado. Use &quot;Cadastrar Veículo&quot;.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id}>
                    <td className="px-4 py-4 font-bold sm:px-6" data-label="Placa">
                      {formatPlateDisplay(v.plate)}
                    </td>
                    <td className="px-4 py-4 sm:px-6" data-label="Modelo">
                      {v.brand} {v.model}
                    </td>
                    <td className="px-4 py-4 sm:px-6" data-label="Status">
                      <span
                        className={
                          v.status === "active"
                            ? "chip-active"
                            : v.status === "maintenance"
                              ? "chip-warning"
                              : "chip-pending"
                        }
                      >
                        {STATUS_LABEL[v.status] ?? v.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 sm:px-6" data-label="Consumo">
                      {v.avg_consumption ? `${Number(v.avg_consumption).toFixed(1)} km/L` : "—"}
                    </td>
                    <td className="px-4 py-4 text-right sm:px-6" data-label="Km">
                      {Number(v.mileage).toLocaleString("pt-BR")} km
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
