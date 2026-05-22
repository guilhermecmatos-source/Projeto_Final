"use client";

import { useEffect, useState } from "react";
import FormField from "@/components/forms/FormField";
import FormShell from "@/components/forms/FormShell";
import { driversApi, travelsApi, vehiclesApi } from "@/services/api";

export default function TravelRegisterPage() {
  const [vehicles, setVehicles] = useState<{ id: string; plate: string }[]>([]);
  const [drivers, setDrivers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    Promise.all([vehiclesApi.list(), driversApi.list()])
      .then(([vRes, dRes]) => {
        setVehicles((vRes.data as { id: string; plate: string }[]) || []);
        setDrivers((dRes.data as { id: string; name: string }[]) || []);
      })
      .catch(() => {});
  }, []);

  return (
    <FormShell
      title="Novo Despacho"
      subtitle="Agende viagem com origem, destino e recursos."
      backHref="/travels"
      redirectOnSuccess="/travels"
      submitLabel="Criar Despacho"
      onSubmit={async (form) => {
        await travelsApi.create({
          vehicle_id: form.get("vehicle_id"),
          driver_id: form.get("driver_id"),
          origin: form.get("origin"),
          destination: form.get("destination"),
          distance_km: Number(form.get("distance_km") || 0),
          fuel_consumption: Number(form.get("fuel_consumption") || 0),
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
          label="Motorista"
          name="driver_id"
          required
          options={drivers.map((d) => ({ value: d.id, label: d.name }))}
        />
        <FormField label="Origem" name="origin" required />
        <FormField label="Destino" name="destination" required />
        <FormField label="Distância (km)" name="distance_km" type="number" />
        <FormField label="Consumo estimado (L)" name="fuel_consumption" type="number" />
      </section>
    </FormShell>
  );
}
