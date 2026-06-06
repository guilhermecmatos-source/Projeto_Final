"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ActionLink from "@/components/ui/ActionLink";
import { ACTION_ROUTES } from "@/lib/action-routes";
import RouteTrackerMap from "@/components/map/RouteTrackerMap";
import { travelsApi } from "@/services/api";
import { formatBRL } from "@/lib/currency";

interface TravelRow {
  id: string;
  origin: string;
  destination: string;
  vehicle_plate?: string;
  driver_name?: string;
  status: string;
  distance_km: number;
  cost?: number;
}

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Agendado",
  in_progress: "Em curso",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export default function TravelsPage() {
  const [travels, setTravels] = useState<TravelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Todos");
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    travelsApi
      .list(search || undefined)
      .then((res) => setTravels(Array.isArray(res.data) ? res.data : []))
      .catch(() => setTravels([]))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const kpis = useMemo(() => {
    const active = travels.filter((t) => t.status === "in_progress").length;
    const scheduled = travels.filter((t) => t.status === "scheduled").length;
    const completed = travels.filter((t) => t.status === "completed").length;
    const maintenance = travels.filter((t) => t.status === "cancelled").length;
    return { total: travels.length, active, scheduled, completed, maintenance };
  }, [travels]);

  const filtered = travels.filter((t) => {
    if (activeTab === "Ativos") return t.status === "in_progress";
    if (activeTab === "Pendentes") return t.status === "scheduled";
    if (activeTab === "Concluídos") return t.status === "completed";
    return true;
  });

  return (
    <AppShell
      searchPlaceholder="Buscar despachos, rotas..."
      headerAction={
        <ActionLink href={ACTION_ROUTES.travelsAssign}>Atribuir Veículo</ActionLink>
      }
    >
      <PageHeader
        title="Controle de Viagens e Logística"
        subtitle="Monitoramento, agendamento assistido e Smart RUV"
        actions={
          <>
            <ActionLink
              href={ACTION_ROUTES.travelsMatching}
              variant="outline"
              className="!rounded-xl !border-primary !px-6 !py-3 !font-bold !text-primary"
            >
              <Icon name="auto_awesome" />
              Matching
            </ActionLink>
            <ActionLink href={ACTION_ROUTES.travelsRuv} variant="outline" className="!rounded-xl !py-3">
              <Icon name="description" />
              Smart RUV
            </ActionLink>
            <ActionLink href={ACTION_ROUTES.travelsRegister} variant="secondary" className="!rounded-xl !py-3">
              <Icon name="add_circle" />
              Novo Despacho
            </ActionLink>
          </>
        }
      />

      <div className="mb-4">
        <input
          className="input-fleet max-w-md"
          placeholder="Pesquisar origem, destino, placa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
        />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total de Viagens", value: kpis.total },
          { label: "Em Curso", value: kpis.active },
          { label: "Agendadas", value: kpis.scheduled },
          { label: "Concluídas", value: kpis.completed },
        ].map((k) => (
          <div key={k.label} className="raised-card p-6">
            <p className="mb-2 text-label-md uppercase text-on-surface-variant">{k.label}</p>
            <span className="text-headline-lg font-bold text-primary">
              {loading ? "—" : k.value}
            </span>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <section className="space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between">
            <h3 className="text-headline-sm">Listagem de Viagens</h3>
            <div className="flex gap-1 rounded-full border border-outline-variant bg-surface-container-low p-1">
              {["Todos", "Ativos", "Pendentes", "Concluídos"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTab(t)}
                  className={`rounded-full px-4 py-1.5 text-label-md ${activeTab === t ? "bg-primary text-on-primary" : "text-on-surface-variant"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <p className="text-on-surface-variant">Carregando viagens...</p>
          ) : filtered.length === 0 ? (
            <p className="rounded-xl border border-outline-variant p-6 text-on-surface-variant">
              Nenhuma viagem encontrada. Cadastre veículos e motoristas, depois crie um despacho.
            </p>
          ) : (
            filtered.map((d) => (
              <div
                key={d.id}
                className="raised-card block border-l-4 border-l-primary p-6"
              >
                <div className="flex justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-container text-on-primary">
                      <Icon name="local_shipping" />
                    </div>
                    <div>
                      <h4 className="text-headline-sm">
                        {d.origin} → {d.destination}
                      </h4>
                      <p className="text-sm text-on-surface-variant">
                        {d.vehicle_plate ?? "—"} | {d.driver_name ?? "—"} | {Number(d.distance_km).toFixed(0)} km
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="chip-active">{STATUS_LABEL[d.status] ?? d.status}</span>
                    {d.cost != null && Number(d.cost) > 0 && (
                      <p className="mt-2 text-xs font-bold text-primary">{formatBRL(Number(d.cost))}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

        <section className="lg:col-span-5">
          <h3 className="mb-4 text-headline-sm">Rota em Tempo Real</h3>
          <RouteTrackerMap heightClass="min-h-[220px] md:min-h-[280px]" />
          <Link href="/inspection" className="btn-primary mt-4 w-full">
            Checklist de inspeção
          </Link>
          <Link
            href={ACTION_ROUTES.travelsRegister}
            className="btn-secondary mt-2 w-full"
          >
            Novo despacho
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
