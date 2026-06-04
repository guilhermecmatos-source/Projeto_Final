"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ActionLink from "@/components/ui/ActionLink";
import { ACTION_ROUTES } from "@/lib/action-routes";
import { driversApi } from "@/services/api";

interface DriverRow {
  id: string;
  name: string;
  license_number: string;
  vehicle_plate?: string | null;
  cnh_category?: string | null;
  score: number;
  status?: string | null;
  active: boolean;
  trip_count?: number;
}

export default function DriversPage() {
  const searchParams = useSearchParams();
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    driversApi
      .list()
      .then((res) => setDrivers(Array.isArray(res.data) ? res.data : []))
      .catch(() => setDrivers([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load, searchParams.get("t")]);

  const stats = useMemo(() => {
    const total = drivers.length;
    const active = drivers.filter((d) => d.active && d.status !== "inativo").length;
    const avgScore =
      drivers.length > 0
        ? Math.round(drivers.reduce((s, d) => s + Number(d.score), 0) / drivers.length)
        : 0;
    return { total, active, avgScore };
  }, [drivers]);

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
          { label: "Total", value: stats.total, icon: "groups" },
          { label: "Ativos", value: stats.active, icon: "check_circle" },
          { label: "Score Médio", value: stats.avgScore, icon: "star" },
        ].map((s) => (
          <div key={s.label} className="raised-card flex items-center gap-4 p-4">
            <Icon name={s.icon} className="text-2xl text-primary" />
            <div>
              <p className="text-label-md text-on-surface-variant">{s.label}</p>
              <p className="text-headline-md font-bold">{loading ? "—" : s.value}</p>
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
              <th className="px-6 py-4">Veículo</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4">Score</th>
              <th className="px-6 py-4">Viagens</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-on-surface-variant">
                  Carregando motoristas...
                </td>
              </tr>
            ) : drivers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-on-surface-variant">
                  Nenhum motorista cadastrado.
                </td>
              </tr>
            ) : (
              drivers.map((d) => (
                <tr key={d.id}>
                  <td className="px-6 py-4 font-bold">{d.name}</td>
                  <td className="px-6 py-4">{d.license_number}</td>
                  <td className="px-6 py-4">{d.vehicle_plate ?? "—"}</td>
                  <td className="px-6 py-4">{d.cnh_category ?? "—"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">{Math.round(Number(d.score))}</span>
                      <div className="h-1 w-16 overflow-hidden rounded-full bg-surface-container-high">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${Math.min(100, Number(d.score))}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{d.trip_count ?? 0}</td>
                  <td className="px-6 py-4">
                    <span
                      className={
                        d.active && d.status !== "inativo" ? "chip-active" : "chip-pending"
                      }
                    >
                      {d.status ?? (d.active ? "Ativo" : "Inativo")}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
