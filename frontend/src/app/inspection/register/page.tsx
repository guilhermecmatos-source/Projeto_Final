"use client";

import FormField from "@/components/forms/FormField";
import FormShell from "@/components/forms/FormShell";
import { vehiclesApi } from "@/services/api";

export default function InspectionRegisterPage() {
  return (
    <FormShell
      title="Inspeção e Cadastro Completo"
      subtitle="Formulário unificado de vistoria e registro documental do veículo."
      backHref="/inspection"
      redirectOnSuccess="/vehicles"
      submitLabel="Salvar Cadastro Completo"
      onSubmit={async (form) => {
        const brandModel = String(form.get("brand_model") || "");
        const [brand, ...modelParts] = brandModel.split(" ");
        await vehiclesApi.create({
          plate: form.get("plate"),
          brand: brand || "—",
          model: modelParts.join(" ") || brandModel,
          year: Number(form.get("year")),
          status: "active",
          mileage: Number(form.get("mileage") || 0),
        });
      }}
    >
      <section className="raised-card p-6">
        <h2 className="mb-4 text-headline-sm">Dados do Veículo</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Placa" name="plate" placeholder="ABC-1234" required />
          <FormField label="Chassi" name="chassis" placeholder="9BW..." />
          <FormField label="Marca / Modelo" name="brand_model" placeholder="Toyota Hilux" required />
          <FormField label="Ano" name="year" type="number" placeholder="2024" required />
          <FormField label="Quilometragem" name="mileage" type="number" placeholder="0" />
        </div>
      </section>

      <section className="raised-card p-6">
        <h2 className="mb-4 text-headline-sm">Vistoria</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {["Exterior", "Interior", "Mecânica", "Elétrica", "Pneus", "Documentos"].map((cat) => (
            <label
              key={cat}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-outline-variant p-4 hover:border-primary"
            >
              <input type="checkbox" name={`check_${cat}`} defaultChecked className="h-5 w-5 rounded text-primary" />
              <span className="text-body-md font-medium">{cat}</span>
            </label>
          ))}
        </div>
      </section>
    </FormShell>
  );
}
