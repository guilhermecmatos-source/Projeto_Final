"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ActionButton from "@/components/ui/ActionButton";
import FormModal from "@/components/ui/FormModal";
import FormField from "@/components/forms/FormField";
import ChecklistToggle from "@/components/ui/ChecklistToggle";
import { ACTION_ROUTES } from "@/lib/action-routes";
import { getQuickChecklist, setQuickChecklistItem } from "@/lib/offline";
import { readJson, writeJson } from "@/lib/local-storage";
import { vehiclesApi } from "@/services/api";

const CHECKLIST_ITEMS = [
  "Pneus e rodas",
  "Freios",
  "Luzes e sinalização",
  "Documentação",
  "Interior e limpeza",
];

const INSP_ITEMS = ["Pneus e rodas", "Freios", "Luzes", "Documentação", "Interior"];

const INSPECTIONS = [
  { id: "INS-2026-041", vehicle: "ABC-1234", date: "20/05/2026", score: 92, status: "Aprovado" },
  { id: "INS-2026-038", vehicle: "DEF-5678", date: "18/05/2026", score: 68, status: "Pendente" },
  { id: "INS-2026-035", vehicle: "GHI-9012", date: "15/05/2026", score: 88, status: "Aprovado" },
];

export default function InspectionPage() {
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [inspChecklist, setInspChecklist] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = getQuickChecklist();
    const initial: Record<string, boolean> = {};
    CHECKLIST_ITEMS.forEach((item) => {
      initial[item] = saved[item] ?? false;
    });
    setChecklist(initial);
  }, []);

  useEffect(() => {
    if (!newModalOpen) return;
    const saved = getQuickChecklist();
    const initial: Record<string, boolean> = {};
    INSP_ITEMS.forEach((item) => {
      initial[item] = saved[`insp_${item}`] ?? false;
    });
    setInspChecklist(initial);
  }, [newModalOpen]);

  function toggleItem(item: string) {
    const next = !checklist[item];
    setChecklist((prev) => ({ ...prev, [item]: next }));
    setQuickChecklistItem(item, next);
  }

  function toggleInspItem(item: string) {
    const next = !inspChecklist[item];
    setInspChecklist((p) => ({ ...p, [item]: next }));
    setQuickChecklistItem(`insp_${item}`, next);
  }

  async function handleRegisterSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const brandModel = String(form.get("brand_model") || "");
    const [brand, ...modelParts] = brandModel.split(" ");
    try {
      await vehiclesApi.create({
        plate: form.get("plate"),
        brand: brand || "—",
        model: modelParts.join(" ") || brandModel,
        year: Number(form.get("year")),
        status: "active",
        mileage: Number(form.get("mileage") || 0),
      });
      setRegisterModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleNewInspectionSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const records = readJson<unknown[]>("fleet_inspections_local", []);
    records.push({
      plate: form.get("plate"),
      notes: form.get("notes"),
      checklist: inspChecklist,
      savedAt: new Date().toISOString(),
    });
    writeJson("fleet_inspections_local", records);
    setNewModalOpen(false);
    setSaving(false);
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
            <ActionButton variant="outline" onClick={() => setRegisterModalOpen(true)}>
              <Icon name="edit_document" />
              Cadastro Completo
            </ActionButton>
            <ActionButton onClick={() => setNewModalOpen(true)}>
              <Icon name="fact_check" />
              Nova Inspeção
            </ActionButton>
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
                <ChecklistToggle label={item} completed={!!checklist[item]} onToggle={() => toggleItem(item)} />
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
                    <td className="px-6 py-4 font-medium" data-label="ID">{i.id}</td>
                    <td className="px-6 py-4" data-label="Veículo">{i.vehicle}</td>
                    <td className="px-6 py-4" data-label="Data">{i.date}</td>
                    <td className="px-6 py-4 font-bold text-primary" data-label="Score">{i.score}/100</td>
                    <td className="px-6 py-4" data-label="Ações">
                      <Link href={`${ACTION_ROUTES.inspectionDetail}?id=${i.id}`} className="text-label-md font-bold text-primary hover:underline">
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

      <FormModal open={registerModalOpen} onClose={() => setRegisterModalOpen(false)} title="Inspeção e Cadastro Completo" subtitle="Vistoria e registro documental" wide>
        <form className="space-y-6" onSubmit={handleRegisterSubmit}>
          <div>
            <h4 className="fleet-section-title mb-3">Dados do Veículo</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Placa" name="plate" placeholder="ABC-1234" required />
              <FormField label="Chassi" name="chassis" placeholder="9BW..." />
              <FormField label="Marca / Modelo" name="brand_model" placeholder="Toyota Hilux" required />
              <FormField label="Ano" name="year" type="number" placeholder="2024" required />
              <FormField label="Quilometragem" name="mileage" type="number" placeholder="0" />
            </div>
          </div>
          <div>
            <h4 className="fleet-section-title mb-3">Vistoria</h4>
            <div className="grid gap-3 sm:grid-cols-3">
              {["Exterior", "Interior", "Mecânica", "Elétrica", "Pneus", "Documentos"].map((cat) => (
                <label key={cat} className="flex cursor-pointer items-center gap-3 rounded-lg border border-outline-variant p-3 hover:border-primary">
                  <input type="checkbox" name={`check_${cat}`} defaultChecked className="h-5 w-5 rounded text-primary" />
                  <span className="text-sm font-medium">{cat}</span>
                </label>
              ))}
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full uppercase">{saving ? "Salvando..." : "Salvar Cadastro Completo"}</button>
        </form>
      </FormModal>

      <FormModal open={newModalOpen} onClose={() => setNewModalOpen(false)} title="Nova Inspeção" subtitle="Checklist rápido com toggle concluído/pendente" wide>
        <form className="space-y-4" onSubmit={handleNewInspectionSubmit}>
          {INSP_ITEMS.map((item) => (
            <ChecklistToggle key={item} label={item} completed={!!inspChecklist[item]} onToggle={() => toggleInspItem(item)} />
          ))}
          <FormField label="Placa do veículo" name="plate" required />
          <FormField label="Observações" name="notes" as="textarea" />
          <button type="submit" disabled={saving} className="btn-primary w-full uppercase">{saving ? "Registrando..." : "Registrar Inspeção"}</button>
        </form>
      </FormModal>
    </AppShell>
  );
}
