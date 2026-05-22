"use client";

import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import ActionLink from "@/components/ui/ActionLink";
import { ACTION_ROUTES } from "@/lib/action-routes";

const ALERTS = [
  {
    title: "Divergência de Odômetro",
    desc: "Veículo ABC-1234: GPS 142km vs 1.250km manual.",
    level: "CRÍTICO",
    icon: "speed",
    style: "border-l-error bg-error-container/20",
  },
  {
    title: "Litragem Excedente",
    desc: "Abastecimento de 68L em tanque de 41L.",
    level: "ALERTA",
    icon: "local_gas_station",
    style: "border-l-secondary-container bg-secondary-container/10",
  },
  {
    title: "OCR: Nota Duplicada",
    desc: "NF #8928 com mesmos metadados da #7712.",
    level: "SUSPEITO",
    icon: "description",
    style: "border-l-outline bg-surface-container",
  },
];

export default function AiSecurityPage() {
  return (
    <AppShell headerTitle="AI & Security Sandbox">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="rounded-xl border border-primary/10 bg-surface-container-lowest p-6 shadow-raised lg:col-span-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-headline-sm text-primary">
                <Icon name="auto_awesome" />
                IA Imagens: Prompt Maker
              </h2>
              <p className="text-body-md text-on-surface-variant">
                Gere mockups realistas de veículos para showroom e branding.
              </p>
            </div>
            <ActionLink href={ACTION_ROUTES.aiSecurityVisual}>
              Gerar Visual
              <Icon name="bolt" className="text-sm" />
            </ActionLink>
          </div>
          <textarea
            className="mb-4 h-32 w-full rounded-lg border border-outline-variant bg-surface-container-low p-4 text-body-md focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Ex: SUV Elétrico branco em cenário urbano noturno..."
          />
          <div className="grid h-40 place-items-center rounded-lg bg-surface-container-high text-on-surface-variant">
            <Icon name="image" className="text-5xl opacity-30" />
          </div>
        </section>

        <section className="raised-card flex flex-col p-6 lg:col-span-4">
          <h2 className="mb-1 flex items-center gap-2 text-headline-sm text-primary">
            <Icon name="gpp_maybe" className="text-error" />
            Alertas Críticos
          </h2>
          <p className="mb-4 text-label-md text-on-surface-variant">Segurança e Auditoria Anti-Fraude</p>
          <div className="flex-1 space-y-4">
            {ALERTS.map((a) => (
              <div key={a.title} className={`flex gap-4 rounded-r border-l-4 p-4 ${a.style}`}>
                <Icon name={a.icon} className="mt-1 text-error" />
                <div>
                  <div className="flex justify-between gap-2">
                    <p className="text-label-md font-bold">{a.title}</p>
                    <span className="rounded bg-error px-1 text-[10px] font-bold text-on-error">
                      {a.level}
                    </span>
                  </div>
                  <p className="mt-1 text-body-md text-on-surface-variant">{a.desc}</p>
                  <ActionLink href={ACTION_ROUTES.aiSecurityEvidence} variant="ghost" className="mt-2">
                    Ver evidências
                  </ActionLink>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-12">
          <h2 className="mb-4 text-headline-sm text-primary">Previsões & Otimização IA</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="raised-card p-6">
              <div className="mb-4 flex justify-between">
                <span className="rounded-lg bg-primary-container/10 p-3">
                  <Icon name="trending_up" className="text-primary" />
                </span>
                <div className="text-right">
                  <p className="text-label-md text-on-surface-variant">Economia Estimada</p>
                  <p className="text-headline-md font-bold text-primary">R$ 42.800</p>
                </div>
              </div>
              <h3 className="mb-2 text-headline-sm">Otimizador de Demanda</h3>
              <p className="mb-4 text-body-md text-on-surface-variant">
                Realocação de 15% da frota para região Sul durante feriado.
              </p>
              <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
                <div className="h-full w-[94%] bg-primary" />
              </div>
              <p className="mt-1 text-right text-label-md text-primary">Confiança 94%</p>
              <ActionLink href={ACTION_ROUTES.aiSecurityPlan} className="mt-6 w-full justify-center">
                Executar Plano
              </ActionLink>
            </div>
            <div className="raised-card relative overflow-hidden p-6">
              <Icon name="map" className="pointer-events-none absolute -right-10 -top-10 text-[180px] opacity-5" />
              <h3 className="mb-2 text-headline-sm">Planejador IA Express</h3>
              <p className="text-body-md text-on-surface-variant">
                Rotas otimizadas com redução média de 18% no tempo de entrega.
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
