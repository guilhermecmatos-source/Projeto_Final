"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import ActionLink from "@/components/ui/ActionLink";
import AddressAutocomplete from "@/components/forms/AddressAutocomplete";
import { ACTION_ROUTES } from "@/lib/action-routes";
import { travelsApi, vehiclesApi } from "@/services/api";
import { formatPlateDisplay } from "@/lib/validators";

interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  status: string;
}

interface CarpoolMatch {
  id: string;
  origin: string;
  destination: string;
  vehicle_plate: string;
  driver_name: string;
  match_score: number;
  status: string;
}

interface TravelRow {
  id: string;
  origin: string;
  destination: string;
  status: string;
  vehicle_plate?: string;
}

const STATUS_PT: Record<string, string> = {
  scheduled: "Agendado",
  in_progress: "Em curso",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export default function LogisticsPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState("");
  const [destination, setDestination] = useState("");
  const [matches, setMatches] = useState<CarpoolMatch[]>([]);
  const [travels, setTravels] = useState<TravelRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([vehiclesApi.list(), travelsApi.list(), travelsApi.carpoolMatches()])
      .then(([vRes, tRes, mRes]) => {
        setVehicles((vRes.data as Vehicle[]) ?? []);
        setTravels((tRes.data as TravelRow[]) ?? []);
        setMatches((mRes.data as CarpoolMatch[]) ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeVehicles = vehicles.filter((v) => v.status === "active");

  return (
    <AppShell headerTitle="Logística & Caronas">
      <p className="mb-6 text-body-md text-on-surface-variant">
        Agende despachos com veículos da frota e aproveite viagens compatíveis para carona corporativa.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="tonal-card flex flex-col rounded-lg p-6 lg:col-span-5">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-headline-sm">Agendamento Assistido</h2>
            <Icon name="history_edu" className="text-primary-container" />
          </div>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!vehicleId) return;
              router.push(
                `${ACTION_ROUTES.travelsRegister}?vehicle=${vehicleId}&destination=${encodeURIComponent(destination)}`
              );
            }}
          >
            <div>
              <label className="mb-1 block text-label-md text-on-surface-variant">
                Veículo da frota
              </label>
              <select
                className="input-fleet"
                required
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
              >
                <option value="">Selecione um veículo cadastrado</option>
                {activeVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {formatPlateDisplay(v.plate)} — {v.brand} {v.model}
                  </option>
                ))}
              </select>
            </div>
            <AddressAutocomplete
              label="Destino final"
              name="destination"
              value={destination}
              onChange={setDestination}
              required
            />
            <button type="submit" className="btn-primary w-full" disabled={!vehicleId}>
              <Icon name="add_task" />
              Continuar para despacho
            </button>
          </form>
        </section>

        <section className="space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-sm">Caronas — viagens compatíveis</h2>
            <span className="rounded-full bg-primary-container/10 px-3 py-1 text-label-md text-primary">
              {loading ? "..." : `${matches.length} sugestão(ões)`}
            </span>
          </div>
          {loading ? (
            <p className="text-on-surface-variant">Carregando matching...</p>
          ) : matches.length === 0 ? (
            <p className="rounded-lg border border-outline-variant p-4 text-on-surface-variant">
              Cadastre viagens com origem/destino semelhantes para ver sugestões de carona.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {matches.map((m) => {
                const pct = Math.min(99, 70 + Number(m.match_score) * 8);
                return (
                  <div
                    key={m.id}
                    className={`tonal-card flex flex-col justify-between border-l-4 p-4 ${pct > 85 ? "border-l-secondary-container" : "border-l-primary"}`}
                  >
                    <div>
                      <div className="mb-2 flex justify-between">
                        <span className="text-label-md font-bold text-primary">
                          MATCH {pct}%
                        </span>
                        <span className="text-label-md text-on-surface-variant">
                          {STATUS_PT[m.status] ?? m.status}
                        </span>
                      </div>
                      <p className="font-bold">{m.origin}</p>
                      <p className="text-sm text-on-surface-variant">→ {m.destination}</p>
                      <p className="mt-2 text-xs text-on-surface-variant">
                        {formatPlateDisplay(m.vehicle_plate)} • {m.driver_name}
                      </p>
                    </div>
                    <ActionLink
                      href={ACTION_ROUTES.travelsRegister}
                      variant="secondary"
                      className="mt-4 w-full justify-center"
                    >
                      Criar despacho relacionado
                    </ActionLink>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <section className="mt-8 raised-card p-6">
        <h2 className="mb-4 text-headline-sm">Despachos cadastrados</h2>
        <div className="divide-y divide-outline-variant/30 overflow-hidden rounded-lg border border-outline-variant">
          {travels.length === 0 ? (
            <p className="p-4 text-on-surface-variant">Nenhum despacho no sistema.</p>
          ) : (
            travels.slice(0, 8).map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between p-4 hover:bg-surface-container-low"
              >
                <div>
                  <p className="font-bold">
                    {d.origin} → {d.destination}
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    {formatPlateDisplay(d.vehicle_plate ?? "")}
                  </p>
                </div>
                <span className="chip-active">{STATUS_PT[d.status] ?? d.status}</span>
              </div>
            ))
          )}
        </div>
        <ActionLink href={ACTION_ROUTES.logisticsMovement} variant="outline" className="mt-4">
          Registrar movimentação
        </ActionLink>
      </section>
    </AppShell>
  );
}
