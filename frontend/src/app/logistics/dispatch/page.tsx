"use client";

import FormField from "@/components/forms/FormField";
import FormShell from "@/components/forms/FormShell";
import { ACTION_ROUTES } from "@/lib/action-routes";

export default function LogisticsDispatchPage() {
  return (
    <FormShell
      title="Agendar Despacho"
      subtitle="Agendamento assistido de logística e caronas."
      backHref="/logistics"
      redirectOnSuccess={ACTION_ROUTES.travelsRegister}
      submitLabel="Continuar para Despacho"
      onSubmit={async () => {
        /* redirecionamento após confirmação local */
      }}
    >
      <section className="raised-card grid gap-4 p-6 md:grid-cols-2">
        <FormField label="Funcionário / Equipe" name="employee" required />
        <FormField
          label="Tipo de Veículo"
          name="vehicle_type"
          options={[
            { value: "utility", label: "Utilitário" },
            { value: "moto", label: "Moto (Express)" },
            { value: "van", label: "Van Executiva" },
          ]}
        />
        <FormField
          label="Prioridade"
          name="priority"
          options={[
            { value: "normal", label: "Normal" },
            { value: "high", label: "Alta (Urgente)" },
          ]}
        />
        <FormField label="Destino Final" name="destination" required />
      </section>
    </FormShell>
  );
}
