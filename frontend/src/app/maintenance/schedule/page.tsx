"use client";

import FormField from "@/components/forms/FormField";
import FormShell from "@/components/forms/FormShell";
import { ACTION_ROUTES } from "@/lib/action-routes";

export default function MaintenanceSchedulePage() {
  return (
    <FormShell
      title="Agendar Manutenção"
      subtitle="Agende revisão preventiva a partir do alerta."
      backHref="/maintenance"
      redirectOnSuccess={ACTION_ROUTES.maintenanceRegister}
      submitLabel="Ir para registro"
      onSubmit={async () => {}}
    >
      <section className="raised-card grid gap-4 p-6">
        <FormField label="Placa do veículo" name="plate" required />
        <FormField label="Tipo de serviço" name="service" required />
        <FormField label="Data preferencial" name="date" type="datetime-local" required />
      </section>
    </FormShell>
  );
}
