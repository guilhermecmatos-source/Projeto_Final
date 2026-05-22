"use client";

import { useEffect, useState } from "react";
import FormField from "@/components/forms/FormField";
import FormShell from "@/components/forms/FormShell";
import { maintenanceApi, vehiclesApi } from "@/services/api";

export default function MaintenanceRegisterPage() {
  const [vehicles, setVehicles] = useState<{ id: string; plate: string }[]>([]);

  useEffect(() => {
    vehiclesApi.list().then((res) => {
      setVehicles((res.data as { id: string; plate: string }[]) || []);
    }).catch(() => setVehicles([]));
  }, []);

  return (
    <FormShell
      title="Nova Ocorrência / Manutenção"
      subtitle="Registre manutenção preventiva ou corretiva."
      backHref="/maintenance"
      redirectOnSuccess="/maintenance"
      onSubmit={async (form) => {
        await maintenanceApi.create({
          vehicle_id: form.get("vehicle_id"),
          type: form.get("type"),
          description: form.get("description"),
          cost: Number(form.get("cost") || 0),
          scheduled_at: form.get("scheduled_at") || new Date().toISOString(),
        });
      }}
    >
      <section className="raised-card grid gap-4 p-6 md:grid-cols-2">
        <FormField
          label="Veículo"
          name="vehicle_id"
          required
          options={vehicles.map((v) => ({ value: v.id, label: v.plate }))}
        />
        <FormField
          label="Tipo"
          name="type"
          required
          options={[
            { value: "preventive", label: "Preventiva" },
            { value: "corrective", label: "Corretiva" },
          ]}
        />
        <div className="md:col-span-2">
          <FormField label="Descrição" name="description" required />
        </div>
        <FormField label="Custo estimado (R$)" name="cost" type="number" />
        <FormField label="Data agendada" name="scheduled_at" type="datetime-local" required />
      </section>
    </FormShell>
  );
}
