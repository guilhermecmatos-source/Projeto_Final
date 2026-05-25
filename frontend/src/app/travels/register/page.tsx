"use client";

import { useEffect, useState } from "react";
import FormField from "@/components/forms/FormField";
import FormShell from "@/components/forms/FormShell";
import { driversApi, travelsApi, vehiclesApi } from "@/services/api";

interface VehicleOption {
  id: string;
  plate: string;
  brand?: string;
  model?: string;
}

interface DriverOption {
  id: string;
  name: string;
}

const FALLBACK_VEHICLES: VehicleOption[] = [
  { id: "demo-1", plate: "ABC-1234", brand: "Toyota", model: "Hilux" },
  { id: "demo-2", plate: "DEF-5678", brand: "VW", model: "Delivery" },
];

const FALLBACK_DRIVERS: DriverOption[] = [
  { id: "demo-d1", name: "Carlos Eduardo" },
  { id: "demo-d2", name: "Ana Martins" },
];

export default function TravelRegisterPage() {
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    Promise.all([vehiclesApi.list(), driversApi.list()])
      .then(([vRes, dRes]) => {
        const vList = Array.isArray(vRes.data) ? vRes.data : [];
        const dList = Array.isArray(dRes.data) ? dRes.data : [];
        setVehicles(
          vList.length > 0
            ? vList.map((v: VehicleOption & { brand?: string; model?: string }) => ({
                id: String(v.id),
                plate: v.plate,
                brand: v.brand,
                model: v.model,
              }))
            : FALLBACK_VEHICLES
        );
        setDrivers(
          dList.length > 0
            ? dList.map((d: DriverOption) => ({ id: String(d.id), name: d.name }))
            : FALLBACK_DRIVERS
        );
      })
      .catch(() => {
        setVehicles(FALLBACK_VEHICLES);
        setDrivers(FALLBACK_DRIVERS);
      })
      .finally(() => setLoadingOptions(false));
  }, []);

  const vehicleOptions = [
    { value: "", label: loadingOptions ? "Carregando veículos..." : "Selecione um veículo" },
    ...vehicles.map((v) => ({
      value: v.id,
      label: `${v.plate}${v.brand ? ` — ${v.brand} ${v.model ?? ""}` : ""}`,
    })),
  ];

  const driverOptions = [
    { value: "", label: loadingOptions ? "Carregando motoristas..." : "Selecione um motorista" },
    ...drivers.map((d) => ({ value: d.id, label: d.name })),
  ];

  return (
    <FormShell
      title="Novo Despacho"
      subtitle="Agende viagem com origem, destino e recursos."
      backHref="/travels"
      redirectOnSuccess="/travels"
      submitLabel="Criar Despacho"
      onSubmit={async (form) => {
        const vehicleId = String(form.get("vehicle_id"));
        const driverId = String(form.get("driver_id"));
        if (!vehicleId || !driverId) {
          throw { response: { data: { error: "Selecione veículo e motorista." } } };
        }
        await travelsApi.create({
          vehicle_id: vehicleId,
          driver_id: driverId,
          origin: form.get("origin"),
          destination: form.get("destination"),
          distance_km: Number(form.get("distance_km") || 0),
          fuel_consumption: Number(form.get("fuel_consumption") || 0),
        });
      }}
    >
      <section className="raised-card grid gap-4 p-4 sm:p-6 md:grid-cols-2">
        <FormField
          label="Veículo"
          name="vehicle_id"
          required
          disabled={loadingOptions}
          options={vehicleOptions}
        />
        <FormField
          label="Motorista"
          name="driver_id"
          required
          disabled={loadingOptions}
          options={driverOptions}
        />
        <FormField label="Origem" name="origin" required placeholder="Ex: São Paulo, SP" />
        <FormField label="Destino" name="destination" required placeholder="Ex: Curitiba, PR" />
        <FormField label="Distância (km)" name="distance_km" type="number" placeholder="0" />
        <FormField label="Consumo estimado (L)" name="fuel_consumption" type="number" placeholder="0" />
      </section>
    </FormShell>
  );
}
