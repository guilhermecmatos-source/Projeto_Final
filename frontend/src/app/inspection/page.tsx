"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ActionLink from "@/components/ui/ActionLink";
import ChecklistToggle from "@/components/ui/ChecklistToggle";
import { ACTION_ROUTES } from "@/lib/action-routes";
import { getQuickChecklist, setQuickChecklistItem } from "@/lib/offline";

const CHECKLIST_ITEMS = [
  "Pneus e rodas",
  "Freios",
  "Luzes e sinalização",
  "Documentação",
  "Interior e limpeza",
];

const INSPECTIONS = [
  { id: "INS-2026-041", vehicle: "ABC-1234", date: "20/05/2026", score: 92, status: "Aprovado" },
  { id: "INS-2026-038", vehicle: "DEF-5678", date: "18/05/2026", score: 68, status: "Pendente" },
  { id: "INS-2026-035", vehicle: "GHI-9012", date: "15/05/2026", score: 88, status: "Aprovado" },
];

export default function InspectionPage() {
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = getQuickChecklist();
    const initial: Record<string, boolean> = {};
    CHECKLIST_ITEMS.forEach((item) => {
      initial[item] = saved[item] ?? false;
    });
    setChecklist(initial);
  }, []);

  function toggleItem(item: string) {
    const next = !checklist[item];
    setChecklist((prev) => ({ ...prev, [item]: next }));
    setQuickChecklistItem(item, next);
  }

  const doneCount = CHECKLIST_ITEMS.filter((i) => checklist[i]).length;

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
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-headline-sm text-primary">Checklist Rápido</h3>
            <span className="text-sm font-bold text-on-surface-variant">
              {doneCount}/{CHECKLIST_ITEMS.length} concluídos
            </span>
          </div>
          <ul className="space-y-3">
            {CHECKLIST_ITEMS.map((item) => (
              <li key={item}>
                <ChecklistToggle
                  label={item}
                  completed={!!checklist[item]}
                  onToggle={() => toggleItem(item)}
                />
              </li>
            ))}
          </ul>
        </section>

        <section className="raised-card overflow-hidden lg:col-span-7">
          <div className="border-b border-outline-variant p-4">
            <h3 className="text-headline-sm">Relatórios Recentes</h3>
          </div>
          <div className="table-responsive">
            <table className="zebra-table w-full min-w-[480px] text-body-md">
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
                    <td className="px-6 py-4 font-medium" data-label="ID">
                      {i.id}
                    </td>
                    <td className="px-6 py-4" data-label="Veículo">
                      {i.vehicle}
                    </td>
                    <td className="px-6 py-4" data-label="Data">
                      {i.date}
                    </td>
                    <td className="px-6 py-4 font-bold text-primary" data-label="Score">
                      {i.score}/100
                    </td>
                    <td className="px-6 py-4" data-label="Ações">
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
          </div>
        </section>
      </div>
    </AppShell>
  );
}
