"use client";

import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ActionLink from "@/components/ui/ActionLink";
import { ACTION_ROUTES } from "@/lib/action-routes";

const INSPECTIONS = [
  { id: "INS-2026-041", vehicle: "ABC-1234", date: "20/05/2026", score: 92, status: "Aprovado" },
  { id: "INS-2026-038", vehicle: "DEF-5678", date: "18/05/2026", score: 68, status: "Pendente" },
  { id: "INS-2026-035", vehicle: "GHI-9012", date: "15/05/2026", score: 88, status: "Aprovado" },
];

const CHECKLIST = [
  { item: "Pneus e rodas", ok: true },
  { item: "Freios", ok: true },
  { item: "Luzes e sinalização", ok: true },
  { item: "Documentação", ok: false },
  { item: "Interior e limpeza", ok: true },
];

export default function InspectionPage() {
  return (
    <AppShell>
      <PageHeader
        breadcrumb="Inspeção"
        title="Inspeção Veicular"
        subtitle="Checklists, relatórios e cadastro completo de veículos."
        actions={
          <>
            <ActionLink href={ACTION_ROUTES.inspectionRegister} variant="outline">
              <Icon name="edit_document" />
              Cadastro Completo
            </ActionLink>
            <ActionLink href={ACTION_ROUTES.inspectionNew}>
              <Icon name="fact_check" />
              Nova Inspeção
            </ActionLink>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <section className="raised-card p-6 lg:col-span-5">
          <h3 className="mb-4 text-headline-sm text-primary">Checklist Rápido</h3>
          <ul className="space-y-3">
            {CHECKLIST.map((c) => (
              <li
                key={c.item}
                className="flex items-center justify-between rounded-lg border border-outline-variant p-3"
              >
                <span className="text-body-md">{c.item}</span>
                <Icon
                  name={c.ok ? "check_circle" : "cancel"}
                  className={c.ok ? "text-green-600" : "text-error"}
                  filled
                />
              </li>
            ))}
          </ul>
        </section>

        <section className="raised-card overflow-hidden lg:col-span-7">
          <div className="border-b border-outline-variant p-4">
            <h3 className="text-headline-sm">Relatórios Recentes</h3>
          </div>
          <table className="zebra-table w-full text-body-md">
            <thead>
              <tr className="border-b bg-surface-container-low text-left text-label-md text-on-surface-variant">
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Veículo</th>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Score</th>
                <th className="px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {INSPECTIONS.map((i) => (
                <tr key={i.id}>
                  <td className="px-6 py-4 font-medium">{i.id}</td>
                  <td className="px-6 py-4">{i.vehicle}</td>
                  <td className="px-6 py-4">{i.date}</td>
                  <td className="px-6 py-4 font-bold text-primary">{i.score}/100</td>
                  <td className="px-6 py-4">
                    <Link
                      href={`${ACTION_ROUTES.inspectionDetail}?id=${i.id}`}
                      className="text-label-md font-bold text-primary hover:underline"
                    >
                      Ver detalhe
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </AppShell>
  );
}
