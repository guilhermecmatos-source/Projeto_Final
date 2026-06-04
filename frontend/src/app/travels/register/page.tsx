"use client";

import { useEffect, useMemo, useState } from "react";
import FormShell from "@/components/forms/FormShell";
import SearchableCombobox, { ComboboxOption } from "@/components/forms/SearchableCombobox";
import AddressAutocomplete from "@/components/forms/AddressAutocomplete";
import { driversApi, geocodingApi, travelsApi, vehiclesApi } from "@/services/api";
import { resolveEntityId } from "@/lib/form-resolve";

interface VehicleOption {
  id: string;
  plate: string;
  brand?: string;
  model?: string;
  avg_consumption?: number | null;
  autonomy_km?: number | null;
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
  const [geoProvider, setGeoProvider] = useState("");
  const [autonomyHint, setAutonomyHint] = useState("");

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
            avg_consumption: v.avg_consumption,
            autonomy_km: v.autonomy_km,
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

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  useEffect(() => {
    if (!origin.trim() || !destination.trim()) return;
    const timer = setTimeout(async () => {
      setDistanceLoading(true);
      try {
        const res = await geocodingApi.distance(origin, destination);
        const km = res.data.distanceKm ?? 0;
        setDistanceKm(String(km));
        setGeoProvider(res.data.provider ?? "");
        if (selectedVehicle?.autonomy_km) {
          const autonomy = Number(selectedVehicle.autonomy_km);
          const ok = Number(km) <= autonomy;
          setAutonomyHint(
            ok
              ? `Autonomia estimada do veículo: ${autonomy} km — rota compatível.`
              : `Atenção: rota (${km} km) excede autonomia (${autonomy} km).`
          );
        }
      } catch {
        setAutonomyHint("");
      } finally {
        setDistanceLoading(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [origin, destination, selectedVehicle?.autonomy_km]);

  useEffect(() => {
    if (selectedVehicle?.autonomy_km) {
      setAutonomyHint(`Autonomia estimada: ${selectedVehicle.autonomy_km} km`);
    }
  }, [vehicleId, selectedVehicle?.autonomy_km]);

  const estimatedFuel = useMemo(() => {
    const km = Number(distanceKm || 0);
    const avg = Number(selectedVehicle?.avg_consumption || 10);
    if (km <= 0) return "";
    return String(Math.round((km / avg) * 10) / 10);
  }, [distanceKm, selectedVehicle?.avg_consumption]);

  return (
    <FormShell
      title="Novo Despacho"
      subtitle="Origem e destino com geolocalização. Apenas veículos e motoristas cadastrados."
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
                error: "Selecione veículo e motorista válidos cadastrados no sistema.",
              },
            },
          };
        }
        if (!origin.trim() || !destination.trim()) {
          throw { response: { data: { error: "Origem e destino são obrigatórios." } } };
        }
        await travelsApi.create({
          vehicle_id: resolvedVehicle,
          driver_id: resolvedDriver,
          origin,
          destination,
          distance_km: Number(distanceKm || 0),
          fuel_consumption: Number(estimatedFuel || 0),
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
          placeholder={loadingOptions ? "Carregando..." : "Selecione veículo cadastrado..."}
          allowCustom={false}
          onValueChange={(v) => setVehicleId(v)}
        />
        <SearchableCombobox
          label="Motorista"
          name="driver_id"
          required
          disabled={loadingOptions}
          options={driverOptions}
          placeholder={loadingOptions ? "Carregando..." : "Selecione motorista..."}
          allowCustom={false}
          onValueChange={(v) => setDriverId(v)}
        />
        <AddressAutocomplete label="Origem" name="origin" value={origin} onChange={setOrigin} required />
        <AddressAutocomplete
          label="Destino"
          name="destination"
          value={destination}
          onChange={setDestination}
          required
        />
        <div>
          <label className="mb-1 block text-label-md text-on-surface-variant">
            Distância (km) {distanceLoading && "— calculando..."}
            {geoProvider && !distanceLoading && (
              <span className="ml-2 text-xs uppercase text-primary">via {geoProvider}</span>
            )}
          </label>
          <input
            className="input-fleet"
            name="distance_km"
            type="number"
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            placeholder="Calculada automaticamente"
          />
        </div>
        <div>
          <label className="mb-1 block text-label-md text-on-surface-variant">
            Consumo estimado (L)
          </label>
          <input
            className="input-fleet"
            name="fuel_consumption"
            type="number"
            readOnly
            value={estimatedFuel}
            placeholder="0"
          />
        </div>
        {autonomyHint && (
          <p className="md:col-span-2 text-sm text-on-surface-variant">{autonomyHint}</p>
        )}
      </section>
    </FormShell>
  );
}
