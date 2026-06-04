"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ActionLink from "@/components/ui/ActionLink";
import { ACTION_ROUTES } from "@/lib/action-routes";
import { fuelApi } from "@/services/api";
import { formatBRL } from "@/lib/currency";
import { formatPlateDisplay } from "@/lib/validators";

interface FuelRow {
  id: string;
  filled_at: string;
  vehicle_plate: string;
  liters: number;
  cost: number;
  station?: string;
  suspicious?: number | boolean;
}

export default function FuelPage() {
  const [records, setRecords] = useState<FuelRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fuelApi
      .list()
      .then((res) => setRecords(Array.isArray(res.data) ? res.data : []))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, []);

  const kpis = useMemo(() => {
    const totalCost = records.reduce((s, r) => s + Number(r.cost), 0);
    const totalLiters = records.reduce((s, r) => s + Number(r.liters), 0);
    const alerts = records.filter((r) => r.suspicious).length;
    return { totalCost, totalLiters, alerts };
  }, [records]);

  return (
    <AppShell searchPlaceholder="Buscar abastecimentos...">
      <PageHeader
        breadcrumb="Abastecimentos"
        title="Controle de Abastecimentos"
        subtitle="Registros reais da frota e alertas de anomalias."
        actions={
          <ActionLink href={ACTION_ROUTES.fuelRegister}>
            <Icon name="local_gas_station" />
            Registrar Abastecimento
          </ActionLink>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Gasto Total", value: formatBRL(kpis.totalCost), icon: "payments" },
          { label: "Litros", value: `${kpis.totalLiters.toFixed(1)} L`, icon: "water_drop" },
          {
            label: "Alertas",
            value: String(kpis.alerts),
            icon: "gpp_maybe",
            warn: kpis.alerts > 0,
          },
        ].map((s) => (
          <div key={s.label} className="raised-card p-4">
            <Icon name={s.icon} className={`mb-2 text-2xl ${s.warn ? "text-error" : "text-primary"}`} />
            <p className="text-label-md text-on-surface-variant">{s.label}</p>
            <p className="text-headline-md font-bold">{loading ? "—" : s.value}</p>
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
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                  Carregando...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                  Nenhum abastecimento registrado.
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r.id} className={r.suspicious ? "bg-error-container/10" : ""}>
                  <td className="px-6 py-4">
                    {new Date(r.filled_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {formatPlateDisplay(r.vehicle_plate)}
                  </td>
                  <td className="px-6 py-4">
                    {Number(r.liters).toFixed(1)} L
                    {r.suspicious ? <span className="ml-2 chip-error">Anomalia</span> : null}
                  </td>
                  <td className="px-6 py-4">{formatBRL(Number(r.cost))}</td>
                  <td className="px-6 py-4">{r.station ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
