"use client";

import { useEffect, useState } from "react";
import FormField from "@/components/forms/FormField";
import FormShell from "@/components/forms/FormShell";
import { fuelApi, vehiclesApi } from "@/services/api";

export default function FuelRegisterPage() {
  const [vehicles, setVehicles] = useState<{ id: string; plate: string }[]>([]);

  useEffect(() => {
    vehiclesApi.list().then((res) => {
      const list = (res.data as { id: string; plate: string }[]) || [];
      setVehicles(list);
    }).catch(() => setVehicles([]));
  }, []);

  return (
    <FormShell
      title="Registrar Abastecimento"
      subtitle="Lançamento de litros, custo e odômetro."
      backHref="/fuel"
      redirectOnSuccess="/fuel"
      onSubmit={async (form) => {
        await fuelApi.create({
          vehicle_id: form.get("vehicle_id"),
          liters: Number(form.get("liters")),
          cost: Number(form.get("cost")),
          mileage_at_fill: Number(form.get("mileage_at_fill")),
          station: form.get("station") || "",
          filled_at: form.get("filled_at") || new Date().toISOString(),
        });
      }}
    >
      <section className="raised-card grid gap-4 p-6 md:grid-cols-2">
        <FormField
          label="Veículo"
          name="vehicle_id"
          required
          options={
            vehicles.length
              ? vehicles.map((v) => ({ value: v.id, label: v.plate }))
              : [{ value: "", label: "Cadastre um veículo primeiro" }]
          }
        />
        <FormField label="Litros" name="liters" type="number" required />
        <FormField label="Custo (R$)" name="cost" type="number" required />
        <FormField label="Odômetro no abastecimento" name="mileage_at_fill" type="number" required />
        <FormField label="Posto" name="station" placeholder="Shell, Ipiranga..." />
        <FormField label="Data" name="filled_at" type="datetime-local" />
      </section>
    </FormShell>
  );
}
