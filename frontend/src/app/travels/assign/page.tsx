"use client";

import { useEffect, useState } from "react";
import FormShell from "@/components/forms/FormShell";
import SearchableCombobox, { ComboboxOption } from "@/components/forms/SearchableCombobox";
import AddressAutocomplete from "@/components/forms/AddressAutocomplete";
import { driversApi, travelsApi, vehiclesApi } from "@/services/api";
import { resolveEntityId } from "@/lib/form-resolve";

export default function TravelAssignPage() {
  const [vehicleOptions, setVehicleOptions] = useState<ComboboxOption[]>([]);
  const [driverOptions, setDriverOptions] = useState<ComboboxOption[]>([]);
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [origin, setOrigin] = useState("Base operacional");
  const [destination, setDestination] = useState("");

  useEffect(() => {
    Promise.all([vehiclesApi.list(), driversApi.list()])
      .then(([vRes, dRes]) => {
        const vList = (vRes.data as { id: string; plate: string; brand?: string; model?: string }[]) ?? [];
        const dList = (dRes.data as { id: string; name: string }[]) ?? [];
        setVehicleOptions(
          vList.map((v) => ({
            value: String(v.id),
            label: `${v.plate}${v.brand ? ` — ${v.brand}` : ""}`,
          }))
        );
        setDriverOptions(dList.map((d) => ({ value: String(d.id), label: d.name })));
      })
      .catch(() => {});
  }, []);

  return (
    <FormShell
      title="Atribuir Veículo"
      subtitle="Vincule veículo e motorista cadastrados a um despacho."
      backHref="/travels"
      redirectOnSuccess="/travels"
      submitLabel="Atribuir"
      onSubmit={async () => {
        const resolvedVehicle = resolveEntityId(vehicleId, vehicleOptions);
        const resolvedDriver = resolveEntityId(driverId, driverOptions);
        if (!resolvedVehicle || !resolvedDriver) {
          throw {
            response: {
              data: { error: "Selecione veículo e motorista cadastrados." },
            },
          };
        }
        await travelsApi.create({
          vehicle_id: resolvedVehicle,
          driver_id: resolvedDriver,
          origin,
          destination: destination || "A definir",
          distance_km: 0,
          fuel_consumption: 0,
        });
      }}
    >
      <section className="raised-card grid gap-4 p-6 md:grid-cols-2">
        <SearchableCombobox
          label="Veículo"
          name="vehicle_id"
          required
          options={vehicleOptions}
          allowCustom={false}
          onValueChange={setVehicleId}
        />
        <SearchableCombobox
          label="Motorista"
          name="driver_id"
          required
          options={driverOptions}
          allowCustom={false}
          onValueChange={setDriverId}
        />
        <AddressAutocomplete label="Origem" name="origin" value={origin} onChange={setOrigin} />
        <AddressAutocomplete label="Destino" name="destination" value={destination} onChange={setDestination} />
      </section>
    </FormShell>
  );
}
