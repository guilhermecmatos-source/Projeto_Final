"use client";

import FormField from "@/components/forms/FormField";
import FormShell from "@/components/forms/FormShell";
import { ACTION_ROUTES } from "@/lib/action-routes";
import { vehiclesApi } from "@/services/api";

export default function VehicleRegisterPage() {
  return (
    <FormShell
      title="Cadastrar Veículo"
      subtitle="Registre um novo veículo na frota."
      backHref="/vehicles"
      redirectOnSuccess="/vehicles"
      onSubmit={async (form) => {
        await vehiclesApi.create({
          plate: form.get("plate"),
          brand: form.get("brand"),
          model: form.get("model"),
          year: Number(form.get("year")),
          status: form.get("status") || "active",
          mileage: Number(form.get("mileage") || 0),
        });
      }}
    >
      <section className="raised-card grid gap-4 p-6 md:grid-cols-2">
        <FormField label="Placa" name="plate" placeholder="ABC-1234" required />
        <FormField label="Marca" name="brand" placeholder="Toyota" required />
        <FormField label="Modelo" name="model" placeholder="Hilux" required />
        <FormField label="Ano" name="year" type="number" placeholder="2024" required />
        <FormField
          label="Status"
          name="status"
          options={[
            { value: "active", label: "Ativo" },
            { value: "maintenance", label: "Em manutenção" },
            { value: "inactive", label: "Inativo" },
          ]}
        />
        <FormField label="Quilometragem" name="mileage" type="number" placeholder="0" />
      </section>
    </FormShell>
  );
}
