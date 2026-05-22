"use client";

import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import { IMAGES } from "@/lib/images";

const METRICS = [
  { label: "Eficiência Operacional", value: "94.2%", trend: "+3.1%" },
  { label: "Custo por Entrega", value: "R$ 18,40", trend: "-8%" },
  { label: "Tempo Médio Rota", value: "4h 12m", trend: "-12m" },
  { label: "Utilização da Frota", value: "87%", trend: "+5%" },
];

export default function IntelligencePage() {
  return (
    <AppShell>
      <PageHeader
        title="Fleet Operational Intelligence"
        subtitle="Inteligência operacional, previsões e otimização em escala."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((m) => (
          <div key={m.label} className="raised-card p-4">
            <p className="text-label-md uppercase text-on-surface-variant">{m.label}</p>
            <p className="text-headline-md font-bold text-primary">{m.value}</p>
            <p className="mt-1 text-sm font-bold text-green-600">{m.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <section
          className="relative overflow-hidden rounded-xl lg:col-span-8"
          style={{
            backgroundImage: `linear-gradient(rgba(0,61,155,0.75), rgba(0,61,155,0.9)), url(${IMAGES.mapInterface})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="p-8 text-white">
            <h3 className="mb-2 text-headline-sm">Centro de Comando Logístico</h3>
            <p className="mb-6 max-w-md text-body-md opacity-90">
              Visualização unificada de hubs, rotas e telemetria em tempo real.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { hub: "SP", active: 42 },
                { hub: "RJ", active: 28 },
                { hub: "MG", active: 19 },
              ].map((h) => (
                <div key={h.hub} className="rounded-lg bg-white/10 p-4 backdrop-blur">
                  <p className="text-label-md font-bold">{h.hub}</p>
                  <p className="text-2xl font-bold">{h.active}</p>
                  <p className="text-xs opacity-80">veículos ativos</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="raised-card p-6 lg:col-span-4">
          <h3 className="mb-4 flex items-center gap-2 text-headline-sm">
            <Icon name="insights" className="text-primary" />
            Insights IA
          </h3>
          <ul className="space-y-4 text-body-md">
            <li className="rounded-lg border-l-4 border-l-primary bg-primary-container/5 p-3">
              Pico de demanda previsto para terça e quinta.
            </li>
            <li className="rounded-lg border-l-4 border-l-secondary-container bg-secondary-container/10 p-3">
              3 veículos com manutenção recomendada em 7 dias.
            </li>
            <li className="rounded-lg border-l-4 border-l-green-500 bg-green-50 p-3">
              Economia de R$ 14.200 com remapeamento de hubs.
            </li>
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
