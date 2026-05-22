"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import ActionLink from "@/components/ui/ActionLink";
import { ACTION_ROUTES } from "@/lib/action-routes";

const SECTIONS = [
  { title: "Exterior", items: ["Lataria", "Pneus", "Vidros"], status: "ok" },
  { title: "Mecânica", items: ["Motor", "Freios", "Suspensão"], status: "ok" },
  { title: "Documentação", items: ["CRLV", "Seguro", "Licenciamento"], status: "warn" },
];

function InspectionDetailContent() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get("id") || "INS-2026-041";

  return (
    <AppShell headerTitle="Inspeção Detalhada">
      <div className="mb-6">
        <Link href="/inspection" className="inline-flex items-center gap-1 text-label-md text-primary hover:underline">
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
        <div className="rounded-xl border border-outline-variant bg-white px-6 py-4 text-center">
          <p className="text-label-md text-on-surface-variant">Score Final</p>
          <p className="text-headline-lg font-bold text-primary">92/100</p>
          <span className="chip-active mt-2 inline-block">Aprovado</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {SECTIONS.map((s) => (
          <section key={s.title} className="raised-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-headline-sm">{s.title}</h3>
              <Icon
                name={s.status === "ok" ? "check_circle" : "warning"}
                className={s.status === "ok" ? "text-green-600" : "text-secondary-container"}
                filled
              />
            </div>
            <ul className="space-y-2">
              {s.items.map((item) => (
                <li key={item} className="flex items-center gap-2 text-body-md">
                  <Icon name="chevron_right" className="text-sm text-outline" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-6 raised-card p-6">
        <h3 className="mb-4 text-headline-sm">Observações do Inspetor</h3>
        <p className="text-body-md text-on-surface-variant">
          Veículo em excelente estado geral. Recomenda-se regularizar documentação do seguro antes da
          próxima viagem intermunicipal.
        </p>
        <div className="mt-6 flex gap-4">
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
