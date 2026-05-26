"use client";

import { FormEvent, useState } from "react";
import Icon from "@/components/ui/Icon";
import {
  calculateTripCost,
  DEFAULT_VEHICLES,
  TripCostResult,
} from "@/lib/ai/trip-cost";

export default function TripCostCalculator() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicleId, setVehicleId] = useState(DEFAULT_VEHICLES[0].id);
  const [result, setResult] = useState<TripCostResult | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const vehicle = DEFAULT_VEHICLES.find((v) => v.id === vehicleId) ?? DEFAULT_VEHICLES[0];
    setResult(calculateTripCost(origin, destination, vehicle));
  }

  const vehicle = DEFAULT_VEHICLES.find((v) => v.id === vehicleId);

  return (
    <div className="raised-card flex flex-col p-4 sm:p-6">
      <h3 className="mb-1 flex items-center gap-2 text-headline-sm text-primary">
        <Icon name="calculate" />
        IA 2 — Calculadora de Gastos de Viagem
      </h3>
      <p className="mb-4 text-xs text-on-surface-variant">Distância, combustível, pedágios e total previsto</p>

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
        <button type="submit" className="btn-primary w-full">
          Calcular
        </button>
      </form>

      {result && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {[
            { label: "Distância estimada", value: `${result.distanceKm} km`, icon: "route" },
            { label: "Consumo médio", value: `${result.avgKmPerLiter} km/L`, icon: "speed" },
            { label: "Combustível", value: `R$ ${result.fuelCost.toLocaleString("pt-BR")}`, icon: "local_gas_station" },
            { label: "Pedágios (est.)", value: `R$ ${result.tollCost.toLocaleString("pt-BR")}`, icon: "toll" },
          ].map((c) => (
            <div key={c.label} className="rounded-lg border border-outline-variant bg-surface-container-low p-3">
              <Icon name={c.icon} className="mb-1 text-primary text-lg" />
              <p className="text-[10px] uppercase text-on-surface-variant">{c.label}</p>
              <p className="text-lg font-bold text-on-surface">{c.value}</p>
              {c.label === "Combustível" && (
                <p className="text-xs text-on-surface-variant">~{result.litersNeeded} L • {vehicle?.label}</p>
              )}
            </div>
          ))}
          <div className="sm:col-span-2 rounded-lg bg-primary-container/10 p-4 text-center">
            <p className="text-xs uppercase text-on-surface-variant">Gasto total previsto</p>
            <p className="text-2xl font-bold text-primary">
              R$ {result.totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
