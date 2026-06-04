"use client";

import { FormEvent, useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import AddressAutocomplete from "@/components/forms/AddressAutocomplete";
import { calculateTripCost, TripCostResult } from "@/lib/ai/trip-cost";
import { fetchRouteDistance } from "@/lib/geocoding/route-distance";
import { vehiclesApi } from "@/services/api";
import { formatPlateDisplay } from "@/lib/validators";

interface FleetVehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  avg_consumption?: number | null;
}

export default function TripCostCalculator() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [vehicleId, setVehicleId] = useState("");
  const [result, setResult] = useState<TripCostResult | null>(null);
  const [provider, setProvider] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    vehiclesApi
      .list()
      .then((res) => {
        const list = (res.data as FleetVehicle[]) ?? [];
        setVehicles(list);
        if (list[0]) setVehicleId(list[0].id);
      })
      .catch(() => setVehicles([]));
  }, []);

  const selected = vehicles.find((v) => v.id === vehicleId);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const route = await fetchRouteDistance(origin, destination);
      setProvider(route.provider);
      const avg = Number(selected?.avg_consumption || 10);
      const vehicleProfile = {
        id: vehicleId,
        label: selected
          ? `${formatPlateDisplay(selected.plate)} — ${selected.brand} ${selected.model}`
          : "Veículo",
        avgKmPerLiter: avg,
        fuelPricePerLiter: 5.9,
        tollPer100km: 22,
      };
      const calc = calculateTripCost(origin, destination, vehicleProfile, route.distanceKm);
      setResult(calc);
    } catch {
      setError("Não foi possível calcular a rota. Verifique origem e destino.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="raised-card flex flex-col p-4 sm:p-6">
      <h3 className="mb-1 flex items-center gap-2 text-headline-sm text-primary">
        <Icon name="calculate" />
        Calculadora de Gastos de Viagem
      </h3>
      <p className="mb-4 text-xs text-on-surface-variant">
        Geolocalização real (Google Maps / OSM) e veículos da frota
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <AddressAutocomplete label="Origem" name="calc_origin" value={origin} onChange={setOrigin} required />
        <AddressAutocomplete
          label="Destino"
          name="calc_destination"
          value={destination}
          onChange={setDestination}
          required
        />
        <div>
          <label className="mb-1 block text-label-md text-on-surface-variant">Veículo</label>
          <select
            className="input-fleet"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            required
          >
            {vehicles.length === 0 ? (
              <option value="">Cadastre veículos na frota</option>
            ) : (
              vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {formatPlateDisplay(v.plate)} — {v.brand} {v.model} (
                  {v.avg_consumption ?? 10} km/L)
                </option>
              ))
            )}
          </select>
        </div>
        <button type="submit" disabled={loading || !vehicleId} className="btn-primary w-full">
          {loading ? "Calculando rota..." : "Calcular"}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-error">{error}</p>}

      {result && (
        <div className="mt-4">
          {provider && (
            <p className="mb-2 text-xs text-on-surface-variant">
              Fonte da distância: <strong className="uppercase">{provider}</strong>
            </p>
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { label: "Distância", value: `${result.distanceKm} km`, icon: "route" },
              { label: "Consumo médio", value: `${result.avgKmPerLiter} km/L`, icon: "speed" },
              {
                label: "Combustível",
                value: `R$ ${result.fuelCost.toLocaleString("pt-BR")}`,
                icon: "local_gas_station",
              },
              {
                label: "Pedágios (est.)",
                value: `R$ ${result.tollCost.toLocaleString("pt-BR")}`,
                icon: "toll",
              },
            ].map((c) => (
              <div
                key={c.label}
                className="rounded-lg border border-outline-variant bg-surface-container-low p-3"
              >
                <Icon name={c.icon} className="mb-1 text-lg text-primary" />
                <p className="text-[10px] uppercase text-on-surface-variant">{c.label}</p>
                <p className="text-lg font-bold text-on-surface">{c.value}</p>
              </div>
            ))}
            <div className="rounded-lg bg-primary-container/10 p-4 text-center sm:col-span-2">
              <p className="text-xs uppercase text-on-surface-variant">Gasto total previsto</p>
              <p className="text-2xl font-bold text-primary">
                R$ {result.totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
