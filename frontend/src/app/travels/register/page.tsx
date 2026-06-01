"use client";

import { useEffect, useMemo, useState } from "react";
import FormField from "@/components/forms/FormField";
import FormShell from "@/components/forms/FormShell";
import SearchableCombobox, { ComboboxOption } from "@/components/forms/SearchableCombobox";
import { driversApi, geocodingApi, travelsApi, vehiclesApi } from "@/services/api";
import { resolveEntityId } from "@/lib/form-resolve";

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

export default function TravelRegisterPage() {
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [distanceLoading, setDistanceLoading] = useState(false);

  useEffect(() => {
    Promise.all([vehiclesApi.list(), driversApi.list()])
      .then(([vRes, dRes]) => {
        const vList = Array.isArray(vRes.data) ? vRes.data : [];
        const dList = Array.isArray(dRes.data) ? dRes.data : [];
        setVehicles(
          vList.map((v: VehicleOption) => ({
            id: String(v.id),
            plate: v.plate,
            brand: v.brand,
            model: v.model,
          }))
        );
        setDrivers(dList.map((d: DriverOption) => ({ id: String(d.id), name: d.name })));
      })
      .catch(() => {
        setVehicles([]);
        setDrivers([]);
      })
      .finally(() => setLoadingOptions(false));
  }, []);

  const vehicleOptions: ComboboxOption[] = useMemo(
    () =>
      vehicles.map((v) => ({
        value: v.id,
        label: `${v.plate}${v.brand ? ` — ${v.brand} ${v.model ?? ""}` : ""}`,
      })),
    [vehicles]
  );

  const driverOptions: ComboboxOption[] = useMemo(
    () => drivers.map((d) => ({ value: d.id, label: d.name })),
    [drivers]
  );

  useEffect(() => {
    if (!origin.trim() || !destination.trim()) return;
    const timer = setTimeout(async () => {
      setDistanceLoading(true);
      try {
        const res = await geocodingApi.distance(origin, destination);
        setDistanceKm(String(res.data.distanceKm ?? ""));
      } catch {
        /* mantém valor manual */
      } finally {
        setDistanceLoading(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [origin, destination]);

  return (
    <FormShell
      title="Novo Despacho"
      subtitle="Agende viagem com origem, destino e recursos. Veículo e motorista com busca dinâmica."
      backHref="/travels"
      redirectOnSuccess="/travels"
      submitLabel="Criar Despacho"
      onSubmit={async () => {
        const resolvedVehicle = resolveEntityId(vehicleId, vehicleOptions);
        const resolvedDriver = resolveEntityId(driverId, driverOptions);
        if (!resolvedVehicle || !resolvedDriver) {
          throw {
            response: {
              data: {
                error:
                  "Selecione ou digite um veículo e motorista válidos cadastrados no sistema.",
              },
            },
          };
        }
        await travelsApi.create({
          vehicle_id: resolvedVehicle,
          driver_id: resolvedDriver,
          origin,
          destination,
          distance_km: Number(distanceKm || 0),
          fuel_consumption: Number(0),
        });
      }}
    >
      <section className="raised-card grid gap-4 p-4 sm:p-6 md:grid-cols-2">
        <SearchableCombobox
          label="Veículo"
          name="vehicle_id"
          required
          disabled={loadingOptions}
          options={vehicleOptions}
          placeholder={loadingOptions ? "Carregando..." : "Digite placa ou modelo..."}
          allowCustom
          onValueChange={(v) => setVehicleId(v)}
        />
        <SearchableCombobox
          label="Motorista"
          name="driver_id"
          required
          disabled={loadingOptions}
          options={driverOptions}
          placeholder={loadingOptions ? "Carregando..." : "Digite nome do motorista..."}
          allowCustom
          onValueChange={(v) => setDriverId(v)}
        />
        <div>
          <label className="mb-1 block text-label-md text-on-surface-variant">Origem</label>
          <input
            className="input-fleet"
            name="origin"
            required
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="Ex: São Paulo, SP"
          />
        </div>
        <div>
          <label className="mb-1 block text-label-md text-on-surface-variant">Destino</label>
          <input
            className="input-fleet"
            name="destination"
            required
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Ex: Curitiba, PR"
          />
        </div>
        <div>
          <label className="mb-1 block text-label-md text-on-surface-variant">
            Distância (km) {distanceLoading && "— calculando..."}
          </label>
          <input
            className="input-fleet"
            name="distance_km"
            type="number"
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            placeholder="0"
          />
        </div>
        <FormField label="Consumo estimado (L)" name="fuel_consumption" type="number" placeholder="0" />
      </section>
    </FormShell>
  );
}
