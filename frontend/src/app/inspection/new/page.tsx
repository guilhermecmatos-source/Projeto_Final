"use client";

import FormField from "@/components/forms/FormField";
import FormShell from "@/components/forms/FormShell";
import { ACTION_ROUTES } from "@/lib/action-routes";

export default function InspectionNewPage() {
  return (
    <FormShell
      title="Nova Inspeção"
      subtitle="Checklist rápido de vistoria veicular."
      backHref="/inspection"
      redirectOnSuccess="/inspection"
      submitLabel="Registrar Inspeção"
      onSubmit={async () => {
        /* checklist salvo localmente; integração futura com módulo dedicado */
      }}
    >
      <section className="raised-card space-y-3 p-6">
        {["Pneus e rodas", "Freios", "Luzes", "Documentação", "Interior"].map((item) => (
          <label
            key={item}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-outline-variant p-4"
          >
            <input type="checkbox" name={`check_${item}`} defaultChecked className="h-5 w-5" />
            <span className="text-body-md font-medium">{item}</span>
          </label>
        ))}
        <FormField label="Placa do veículo" name="plate" required />
        <FormField label="Observações" name="notes" />
      </section>
    </FormShell>
  );
}
