"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import ActionLink from "@/components/ui/ActionLink";
import { ACTION_ROUTES } from "@/lib/action-routes";

const SECTIONS = [
  {
    title: "Exterior",
    items: [
      { name: "Lataria", detail: "Sem amassados ou riscos profundos." },
      { name: "Pneus", detail: "Calibragem e sulcos dentro do limite legal." },
      { name: "Vidros", detail: "Para-brisa e laterais sem trincas." },
    ],
    status: "ok" as const,
  },
  {
    title: "Mecânica",
    items: [
      { name: "Motor", detail: "Sem vazamentos; ruído normal em marcha lenta." },
      { name: "Freios", detail: "Pastilhas com 60% de vida útil restante." },
      { name: "Suspensão", detail: "Amortecedores firmes; sem folga excessiva." },
    ],
    status: "ok" as const,
  },
  {
    title: "Documentação",
    items: [
      { name: "CRLV", detail: "Válido até 12/2026." },
      { name: "Seguro", detail: "Apólice vence em 30 dias — renovar." },
      { name: "Licenciamento", detail: "Em dia para o exercício atual." },
    ],
    status: "warn" as const,
  },
];

function InspectionDetailContent() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get("id") || "INS-2026-041";
  const [expanded, setExpanded] = useState<string | null>("Exterior");

  function toggle(title: string) {
    setExpanded((prev) => (prev === title ? null : title));
  }

  return (
    <AppShell headerTitle="Inspeção Detalhada">
      <div className="mb-6">
        <Link
          href="/inspection"
          className="inline-flex items-center gap-1 text-label-md text-primary hover:underline"
        >
          <Icon name="arrow_back" className="text-base" />
          Voltar
        </Link>
      </div>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-headline-sm font-bold text-primary">Relatório {reportId}</h1>
          <p className="text-body-md text-on-surface-variant">
            Veículo ABC-1234 • Toyota Hilux • 20/05/2026
          </p>
        </div>
        <div className="w-full rounded-xl border border-outline-variant bg-white px-6 py-4 text-center sm:w-auto">
          <p className="text-label-md text-on-surface-variant">Score Final</p>
          <p className="text-headline-lg font-bold text-primary">92/100</p>
          <span className="chip-active mt-2 inline-block">Aprovado</span>
        </div>
      </div>

      <div className="space-y-3">
        {SECTIONS.map((s) => {
          const isOpen = expanded === s.title;
          return (
            <section key={s.title} className="raised-card overflow-hidden">
              <button
                type="button"
                className="accordion-trigger w-full rounded-none border-0 bg-transparent px-4 py-4 sm:px-6"
                onClick={() => toggle(s.title)}
                aria-expanded={isOpen}
              >
                <span className="flex items-center gap-3">
                  <h3 className="text-headline-sm">{s.title}</h3>
                  <Icon
                    name={s.status === "ok" ? "check_circle" : "warning"}
                    className={s.status === "ok" ? "text-green-600" : "text-secondary-container"}
                    filled
                  />
                </span>
                <Icon name={isOpen ? "expand_less" : "expand_more"} className="text-primary" />
              </button>

              {isOpen && (
                <div className="accordion-panel mx-4 mb-4 sm:mx-6">
                  <ul className="space-y-3">
                    {s.items.map((item) => (
                      <li key={item.name} className="border-b border-outline-variant/30 pb-3 last:border-0">
                        <p className="flex items-center gap-2 font-semibold text-body-md">
                          <Icon name="chevron_right" className="text-sm text-outline" />
                          {item.name}
                        </p>
                        <p className="mt-1 pl-6 text-sm text-on-surface-variant">{item.detail}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <section className="mt-6 raised-card p-4 sm:p-6">
        <h3 className="mb-4 text-headline-sm">Observações do Inspetor</h3>
        <p className="text-body-md text-on-surface-variant">
          Veículo em excelente estado geral. Recomenda-se regularizar documentação do seguro antes da
          próxima viagem intermunicipal.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ActionLink href={ACTION_ROUTES.reportsExport}>
            <Icon name="download" />
            Exportar PDF
          </ActionLink>
          <ActionLink
            href={ACTION_ROUTES.partnersSupport}
            variant="outline"
            className="!rounded-lg !px-6 !py-2"
          >
            Enviar por E-mail
          </ActionLink>
        </div>
      </section>
    </AppShell>
  );
}

export default function InspectionDetailPage() {
  return (
    <Suspense
      fallback={
        <AppShell headerTitle="Inspeção Detalhada">
          <p className="text-on-surface-variant">Carregando relatório...</p>
        </AppShell>
      }
    >
      <InspectionDetailContent />
    </Suspense>
  );
}
