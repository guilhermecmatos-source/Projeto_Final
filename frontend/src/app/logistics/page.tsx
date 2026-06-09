"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ActionButton from "@/components/ui/ActionButton";
import FormModal from "@/components/ui/FormModal";
import FormField from "@/components/forms/FormField";
import FormActions from "@/components/forms/FormActions";
import AddressAutocomplete from "@/components/forms/AddressAutocomplete";
import { travelsApi, vehiclesApi } from "@/services/api";
import { formatPlateDisplay } from "@/lib/validators";
import { addToSyncQueue, saveLogisticsDraft } from "@/lib/offline";
import GoogleMapsGeoselector from "@/components/forms/GoogleMapsGeoselector";

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

function formToObject(form: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  form.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

export default function LogisticsPage() {
  const movementFormRef = useRef<HTMLFormElement>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState("");
  const [destination, setDestination] = useState("");
  const [matches, setMatches] = useState<CarpoolMatch[]>([]);
  const [travels, setTravels] = useState<TravelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [kmRodado, setKmRodado] = useState<number | "">("");

  // Map picker states
  const [mapSelectorOpen, setMapSelectorOpen] = useState(false);
  const [mapTarget, setMapTarget] = useState<"departure_location" | "arrival_location" | null>(null);
  const [departureLocation, setDepartureLocation] = useState("");
  const [arrivalLocation, setArrivalLocation] = useState("");

  const handleMapSelect = (address: string) => {
    if (mapTarget === "departure_location") {
      setDepartureLocation(address);
    } else if (mapTarget === "arrival_location") {
      setArrivalLocation(address);
    }
  };

  const load = () => {
    setLoading(true);
    Promise.all([vehiclesApi.list(), travelsApi.list(), travelsApi.carpoolMatches()])
      .then(([vRes, tRes, mRes]) => {
        setVehicles((vRes.data as Vehicle[]) ?? []);
        setTravels((tRes.data as TravelRow[]) ?? []);
        setMatches((mRes.data as CarpoolMatch[]) ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const activeVehicles = vehicles.filter((v) => v.status === "active");

  function updateKmRodado(initial: string, final: string) {
    const a = Number(initial);
    const b = Number(final);
    if (!Number.isNaN(a) && !Number.isNaN(b) && b >= a) setKmRodado(b - a);
    else setKmRodado("");
  }

  async function handleDispatchSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!vehicleId) return;
    setSaving(true);
    try {
      await travelsApi.create({
        vehicle_id: vehicleId,
        origin: "Base Operacional",
        destination,
        distance_km: 0,
        fuel_consumption: 0,
      });
      setDispatchModalOpen(false);
      setVehicleId("");
      setDestination("");
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleMovementSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const data = formToObject(new FormData(e.currentTarget));
    saveLogisticsDraft(data);
    addToSyncQueue({ type: "logistics", payload: data });
    setMovementModalOpen(false);
    setSaving(false);
  }

  return (
    <AppShell>
      <PageHeader
        breadcrumb="Logistics"
        title="Logística & Caronas"
        subtitle="Agende despachos com veículos da frota e aproveite viagens compatíveis para carona corporativa."
        actions={
          <>
            <ActionButton variant="outline" onClick={() => setMovementModalOpen(true)}>
              <Icon name="edit_road" />
              Registrar Movimentação
            </ActionButton>
            <ActionButton onClick={() => setDispatchModalOpen(true)}>
              <Icon name="add_task" />
              Agendar Despacho
            </ActionButton>
          </>
        }
      />

      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-headline-sm">Caronas — viagens compatíveis</h2>
          <span className="rounded-full bg-primary-container/10 px-3 py-1 text-label-md text-primary">
            {loading ? "..." : `${matches.length} sugestão(ões)`}
          </span>
        </div>
        {loading ? (
          <p className="text-on-surface-variant">Carregando matching...</p>
        ) : matches.length === 0 ? (
          <p className="raised-card p-4 text-on-surface-variant">
            Cadastre viagens com origem/destino semelhantes para ver sugestões de carona.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((m) => {
              const pct = Math.min(99, 70 + Number(m.match_score) * 8);
              return (
                <div
                  key={m.id}
                  className={`raised-card flex flex-col justify-between border-l-4 p-4 ${pct > 85 ? "border-l-secondary-container" : "border-l-primary"}`}
                >
                  <div>
                    <div className="mb-2 flex justify-between">
                      <span className="text-label-md font-bold text-primary">MATCH {pct}%</span>
                      <span className="text-label-md text-on-surface-variant">{STATUS_PT[m.status] ?? m.status}</span>
                    </div>
                    <p className="font-bold">{m.origin}</p>
                    <p className="text-sm text-on-surface-variant">→ {m.destination}</p>
                    <p className="mt-2 text-xs text-on-surface-variant">
                      {formatPlateDisplay(m.vehicle_plate)} • {m.driver_name}
                    </p>
                  </div>
                  <ActionButton variant="outline" className="mt-4 w-full justify-center" onClick={() => { setDestination(m.destination); setDispatchModalOpen(true); }}>
                    Criar despacho relacionado
                  </ActionButton>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="raised-card p-6">
        <h2 className="mb-4 text-headline-sm">Despachos cadastrados</h2>
        <div className="divide-y divide-outline-variant/30 overflow-hidden rounded-lg border border-outline-variant">
          {travels.length === 0 ? (
            <p className="p-4 text-on-surface-variant">Nenhum despacho no sistema.</p>
          ) : (
            travels.slice(0, 8).map((d) => (
              <div key={d.id} className="flex items-center justify-between p-4 hover:bg-surface-container-low">
                <div>
                  <p className="font-bold">{d.origin} → {d.destination}</p>
                  <p className="text-sm text-on-surface-variant">{formatPlateDisplay(d.vehicle_plate ?? "")}</p>
                </div>
                <span className="chip-active">{STATUS_PT[d.status] ?? d.status}</span>
              </div>
            ))
          )}
        </div>
      </section>

      <FormModal open={dispatchModalOpen} onClose={() => setDispatchModalOpen(false)} title="Agendamento Assistido" subtitle="Selecione veículo e destino" wide>
        <form className="space-y-4" onSubmit={handleDispatchSubmit}>
          <div>
            <label className="mb-1 block text-label-md text-on-surface-variant">Veículo da frota</label>
            <select className="input-fleet" required value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
              <option value="">Selecione um veículo cadastrado</option>
              {activeVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {formatPlateDisplay(v.plate)} — {v.brand} {v.model}
                </option>
              ))}
            </select>
          </div>
          <AddressAutocomplete label="Destino final" name="destination" value={destination} onChange={setDestination} required />
          <button type="submit" className="btn-primary w-full" disabled={saving || !vehicleId}>
            {saving ? "Agendando..." : "Confirmar Despacho"}
          </button>
        </form>
      </FormModal>

      <FormModal open={movementModalOpen} onClose={() => setMovementModalOpen(false)} title="Movimentação do Veículo" subtitle="Saída, chegada, hodômetro e fechamento de RUV" xl>
        <form ref={movementFormRef} onSubmit={handleMovementSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="departure_location" className="mb-1 block text-label-md text-on-surface-variant font-bold uppercase text-[10px]">
                Local de saída
              </label>
              <div className="flex gap-2">
                <input
                  id="departure_location"
                  name="departure_location"
                  type="text"
                  required
                  className="input-fleet flex-1"
                  value={departureLocation}
                  onChange={(e) => setDepartureLocation(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => {
                    setMapTarget("departure_location");
                    setMapSelectorOpen(true);
                  }}
                  className="btn-outline flex items-center justify-center gap-1 border border-outline-variant bg-surface-container-high px-3 py-2 text-xs font-semibold text-primary hover:bg-white/5 transition rounded-lg"
                >
                  <Icon name="map" />
                  Maps
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="arrival_location" className="mb-1 block text-label-md text-on-surface-variant font-bold uppercase text-[10px]">
                Local de chegada
              </label>
              <div className="flex gap-2">
                <input
                  id="arrival_location"
                  name="arrival_location"
                  type="text"
                  required
                  className="input-fleet flex-1"
                  value={arrivalLocation}
                  onChange={(e) => setArrivalLocation(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => {
                    setMapTarget("arrival_location");
                    setMapSelectorOpen(true);
                  }}
                  className="btn-outline flex items-center justify-center gap-1 border border-outline-variant bg-surface-container-high px-3 py-2 text-xs font-semibold text-primary hover:bg-white/5 transition rounded-lg"
                >
                  <Icon name="map" />
                  Maps
                </button>
              </div>
            </div>
            <FormField label="Data/Hora saída" name="departure_datetime" type="datetime-local" required />
            <FormField label="Data/Hora chegada" name="arrival_datetime" type="datetime-local" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="odometer_start" className="mb-1 block text-label-md text-on-surface-variant">KM inicial</label>
              <input id="odometer_start" name="odometer_start" type="number" required className="input-fleet" placeholder="0" onChange={(e) => updateKmRodado(e.target.value, (document.getElementById("odometer_end") as HTMLInputElement)?.value ?? "")} />
            </div>
            <div>
              <label htmlFor="odometer_end" className="mb-1 block text-label-md text-on-surface-variant">KM final</label>
              <input id="odometer_end" name="odometer_end" type="number" required className="input-fleet" placeholder="0" onChange={(e) => updateKmRodado((document.getElementById("odometer_start") as HTMLInputElement)?.value ?? "", e.target.value)} />
            </div>
            <div className="sm:col-span-2 rounded-lg bg-primary-container/10 p-4">
              <p className="text-label-md text-on-surface-variant">KM rodado (calculado)</p>
              <p className="text-2xl font-bold text-primary">{kmRodado === "" ? "—" : `${kmRodado} km`}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Data fechamento" name="ruv_close_date" type="date" required />
            <FormField label="KM rodado (RUV)" name="ruv_km" type="number" placeholder="Igual ao calculado" />
            <FormField label="Observações" name="ruv_notes" as="textarea" className="sm:col-span-2" rows={3} />
          </div>
          <FormActions
            loading={saving}
            onSaveLocal={() => {
              if (movementFormRef.current) saveLogisticsDraft(formToObject(new FormData(movementFormRef.current)));
            }}
            onSyncNow={async () => {}}
            onExportPdf={() => window.print()}
            syncDisabled
          />
        </form>
      </FormModal>

      <GoogleMapsGeoselector
        open={mapSelectorOpen}
        onClose={() => setMapSelectorOpen(false)}
        onSelect={handleMapSelect}
        title={mapTarget === "departure_location" ? "Selecione o Local de Saída" : "Selecione o Local de Chegada"}
      />
    </AppShell>
  );
}
