"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ActionLink from "@/components/ui/ActionLink";
import { ACTION_ROUTES } from "@/lib/action-routes";
import RouteTrackerMap from "@/components/map/RouteTrackerMap";

const KPI = [
  { label: "Viagens Ativas", value: "24", sub: "+12%" },
  { label: "Em Curso", value: "18", sub: "Frota 75%" },
  { label: "Concluídas (Hoje)", value: "142", sub: "Meta: 150" },
  { label: "Manutenção", value: "3", sub: "Atenção", warn: true },
];

const DISPATCHES = [
  {
    id: "V-4029",
    route: "São Paulo → Curitiba",
    vehicle: "Scania R450",
    driver: "Carlos Eduardo",
    status: "Em curso",
    carpool: 2,
  },
  {
    id: "V-3310",
    route: "Campinas → Santos",
    vehicle: "VW Constellation",
    driver: "Ana Martins",
    status: "Agendado",
    carpool: 0,
  },
];

export default function TravelsPage() {
  const [activeTab, setActiveTab] = useState("Todos");

  return (
    <AppShell
      searchPlaceholder="Buscar despachos, rotas ou IDs..."
      headerAction={
        <ActionLink href={ACTION_ROUTES.travelsAssign}>Atribuir Veículo</ActionLink>
      }
    >
      <PageHeader
        title="Controle de Viagens e Logística"
        subtitle="Monitoramento, agendamento assistido e matching de caronas"
        actions={
          <>
            <ActionLink
              href={ACTION_ROUTES.travelsMatching}
              variant="outline"
              className="!rounded-xl !border-primary !px-6 !py-3 !font-bold !text-primary"
            >
              <Icon name="auto_awesome" />
              Matching AI
            </ActionLink>
            <ActionLink href={ACTION_ROUTES.travelsRuv} variant="outline" className="!rounded-xl !py-3">
              <Icon name="description" />
              RUV
            </ActionLink>
            <ActionLink href={ACTION_ROUTES.travelsRegister} variant="secondary" className="!rounded-xl !py-3">
              <Icon name="add_circle" />
              Novo Despacho
            </ActionLink>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPI.map((k) => (
          <div key={k.label} className="raised-card p-6">
            <p className="mb-2 text-label-md uppercase text-on-surface-variant">{k.label}</p>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-headline-lg font-bold ${k.warn ? "text-secondary-container" : "text-primary"}`}
              >
                {k.value}
              </span>
              <span className="text-xs font-medium text-on-surface-variant">{k.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8 flex items-center justify-between rounded-xl border border-primary/20 bg-primary-container p-6 text-on-primary-container">
        <div className="flex items-center gap-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
            <Icon name="psychology" className="text-white" />
          </div>
          <div>
            <h3 className="font-bold">Agendamento Assistido</h3>
            <p className="text-sm opacity-90">
              5 oportunidades de carona corporativa para amanhã. Economia estimada: R$ 1.240,00.
            </p>
          </div>
        </div>
        <ActionLink href={ACTION_ROUTES.travelsSuggestions} className="!rounded-xl">
          Ver Sugestões
        </ActionLink>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <section className="space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between">
            <h3 className="text-headline-sm">Listagem de Despachos</h3>
            <div className="flex gap-1 rounded-full border border-outline-variant bg-surface-container-low p-1">
              {["Todos", "Ativos", "Caronas", "Pendentes"].map((t) => (
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
          {DISPATCHES.filter((d) => {
            if (activeTab === "Todos") return true;
            if (activeTab === "Ativos") return d.status === "Em curso";
            if (activeTab === "Caronas") return d.carpool > 0;
            if (activeTab === "Pendentes") return d.status === "Agendado";
            return true;
          }).map((d) => (
            <Link
              key={d.id}
              href={ACTION_ROUTES.travelsRegister}
              className="raised-card block cursor-pointer border-l-4 border-l-primary p-6 transition hover:shadow-md"
            >
              <div className="flex justify-between">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-container text-on-primary">
                    <Icon name="local_shipping" />
                  </div>
                  <div>
                    <h4 className="text-headline-sm">
                      {d.id} • {d.route}
                    </h4>
                    <p className="text-sm text-on-surface-variant">
                      {d.vehicle} | Motorista: {d.driver}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="chip-active">{d.status}</span>
                  {d.carpool > 0 && (
                    <p className="mt-2 flex items-center justify-end gap-1 text-xs font-bold text-secondary">
                      <Icon name="group" className="text-xs" />
                      {d.carpool} Passageiros (Carona)
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </section>

        <section className="lg:col-span-5">
          <h3 className="mb-4 text-headline-sm">Rota em Tempo Real</h3>
          <RouteTrackerMap heightClass="min-h-[220px] md:min-h-[280px]" />
        </section>
      </div>
    </AppShell>
  );
}
