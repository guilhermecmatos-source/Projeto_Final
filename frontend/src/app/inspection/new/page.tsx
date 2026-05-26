"use client";

import { useEffect, useState } from "react";
import FormField from "@/components/forms/FormField";
import FormShell from "@/components/forms/FormShell";
import ChecklistToggle from "@/components/ui/ChecklistToggle";
import { ACTION_ROUTES } from "@/lib/action-routes";
import { getQuickChecklist, setQuickChecklistItem } from "@/lib/offline";
import { readJson, writeJson } from "@/lib/local-storage";

const ITEMS = ["Pneus e rodas", "Freios", "Luzes", "Documentação", "Interior"];

export default function InspectionNewPage() {
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = getQuickChecklist();
    const initial: Record<string, boolean> = {};
    ITEMS.forEach((item) => {
      initial[item] = saved[`insp_${item}`] ?? false;
    });
    setChecklist(initial);
  }, []);

  function toggle(item: string) {
    const next = !checklist[item];
    setChecklist((p) => ({ ...p, [item]: next }));
    setQuickChecklistItem(`insp_${item}`, next);
  }

  return (
    <FormShell
      title="Nova Inspeção"
      subtitle="Checklist rápido com toggle concluído/pendente."
      backHref="/inspection"
      redirectOnSuccess="/inspection"
      submitLabel="Registrar Inspeção"
      onSubmit={async (form) => {
        const records = readJson<unknown[]>("fleet_inspections_local", []);
        records.push({
          plate: form.get("plate"),
          notes: form.get("notes"),
          checklist,
          savedAt: new Date().toISOString(),
        });
        writeJson("fleet_inspections_local", records);
      }}
    >
      <section className="raised-card space-y-3 p-6">
        {ITEMS.map((item) => (
          <ChecklistToggle
            key={item}
            label={item}
            completed={!!checklist[item]}
            onToggle={() => toggle(item)}
          />
        ))}
        <FormField label="Placa do veículo" name="plate" required />
        <FormField label="Observações" name="notes" as="textarea" />
      </section>
    </FormShell>
  );
}
