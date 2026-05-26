"use client";

import { FormEvent, useState } from "react";
import Icon from "@/components/ui/Icon";
import {
  calculateTripCost,
  DEFAULT_VEHICLES,
  TripCostResult,
} from "@/lib/ai/trip-cost";
import { fetchRouteDistance } from "@/lib/geocoding/route-distance";

export default function TripCostCalculator() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicleId, setVehicleId] = useState(DEFAULT_VEHICLES[0].id);
  const [result, setResult] = useState<TripCostResult | null>(null);
  const [provider, setProvider] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const route = await fetchRouteDistance(origin, destination);
      setProvider(route.provider);
      const vehicle = DEFAULT_VEHICLES.find((v) => v.id === vehicleId) ?? DEFAULT_VEHICLES[0];
      const calc = calculateTripCost(origin, destination, vehicle, route.distanceKm);
      setResult(calc);
    } catch {
      setError("Não foi possível calcular a rota. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const vehicle = DEFAULT_VEHICLES.find((v) => v.id === vehicleId);

  return (
    <div className="raised-card flex flex-col p-4 sm:p-6">
      <h3 className="mb-1 flex items-center gap-2 text-headline-sm text-primary">
        <Icon name="calculate" />
        Calculadora de Gastos de Viagem
      </h3>
      <p className="mb-4 text-xs text-on-surface-variant">
        Distância real (Google Maps / Qualp / Mapeia com fallback), combustível e pedágios
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="input-fleet"
          placeholder="Origem"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          required
        />
        <input
          className="input-fleet"
          placeholder="Destino"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          required
        />
        <select
          className="input-fleet"
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
        >
          {DEFAULT_VEHICLES.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </select>
        <button type="submit" disabled={loading} className="btn-primary w-full">
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
              <div key={c.label} className="rounded-lg border border-outline-variant bg-surface-container-low p-3">
                <Icon name={c.icon} className="mb-1 text-lg text-primary" />
                <p className="text-[10px] uppercase text-on-surface-variant">{c.label}</p>
                <p className="text-lg font-bold text-on-surface">{c.value}</p>
                {c.label === "Combustível" && (
                  <p className="text-xs text-on-surface-variant">
                    ~{result.litersNeeded} L • {vehicle?.label}
                  </p>
                )}
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
