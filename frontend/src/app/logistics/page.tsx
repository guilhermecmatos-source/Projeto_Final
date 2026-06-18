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
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import ListPageStates from "@/components/ui/ListPageStates";
import { CardSkeleton, ListRowSkeleton } from "@/components/ui/LoadingSkeleton";
import { showToast } from "@/components/ui/Toast";

// ─── Types ───────────────────────────────────────────────────────────────────

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

/** Trips with full interactive state (local manifests) */
interface LocalTrip {
  id: string;
  route: string;
  driver: string;
  vehicle: string;
  status: "Pendente" | "Em Rota" | "Concluída" | "Atrasada";
  cargo: string;
}

interface LogEvent {
  id: string;
  time: string;
  message: string;
  type: "info" | "warning" | "success";
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_PT: Record<string, string> = {
  scheduled: "Agendado",
  in_progress: "Em curso",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const INITIAL_TRIPS: LocalTrip[] = [
  { id: "TRIP-101", route: "Palmas (TO) ➔ Goiânia (GO)", driver: "Carlos Silva", vehicle: "Scania R450", status: "Em Rota", cargo: "Grãos e Soja" },
  { id: "TRIP-102", route: "Palmas (TO) ➔ Araguaína (TO)", driver: "Ana Lima", vehicle: "Volvo FH540", status: "Pendente", cargo: "Maquinário Agrícola" },
  { id: "TRIP-103", route: "Porto Nacional (TO) ➔ Santos (SP)", driver: "Roberto Souza", vehicle: "Mercedes Actros", status: "Concluída", cargo: "Carga Industrial" },
];

const INITIAL_LOGS: LogEvent[] = [
  { id: "log-0", time: "21:05:14", message: "Monitoramento de fadiga ativo para TRIP-101.", type: "info" },
  { id: "log-1", time: "18:40:22", message: "Checklist de saída aprovado sem ressalvas para TRIP-102.", type: "success" },
];

function formToObject(form: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  form.forEach((value, key) => { obj[key] = value; });
  return obj;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LogisticsPage() {
  const movementFormRef = useRef<HTMLFormElement>(null);

  // API-backed state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState("");
  const [destination, setDestination] = useState("");
  const [matches, setMatches] = useState<CarpoolMatch[]>([]);
  const [travels, setTravels] = useState<TravelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [kmRodado, setKmRodado] = useState<number | "">("");

  // Map picker
  const [mapSelectorOpen, setMapSelectorOpen] = useState(false);
  const [mapTarget, setMapTarget] = useState<"departure_location" | "arrival_location" | null>(null);
  const [departureLocation, setDepartureLocation] = useState("");
  const [arrivalLocation, setArrivalLocation] = useState("");

  // ── Real-time interactive state ──────────────────────────────────────────
  const [trips, setTrips] = useState<LocalTrip[]>(INITIAL_TRIPS);
  const [logs, setLogs] = useState<LogEvent[]>(INITIAL_LOGS);

  const addLog = (message: string, type: LogEvent["type"]) => {
    const newLog: LogEvent = {
      id: `log-${Date.now()}`,
      time: new Date().toTimeString().split(" ")[0],
      message,
      type,
    };
    setLogs(prev => [newLog, ...prev]);
  };

  /** Mutates trip status with data protection for completed trips */
  const updateTripStatus = (id: string, newStatus: LocalTrip["status"]) => {
    const target = trips.find(t => t.id === id);
    if (target?.status === "Concluída") {
      showToast("Bloqueio de Segurança: Viagens concluídas possuem registros imutáveis no CCO.", "error");
      return;
    }
    setTrips(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    const type: LogEvent["type"] = newStatus === "Concluída" ? "success" : newStatus === "Atrasada" ? "warning" : "info";
    addLog(`Status da viagem ${id} atualizado para [${newStatus}] pelo painel logístico.`, type);
    showToast(`Viagem ${id} alterada para ${newStatus}!`, type === "warning" ? "error" : type);
  };

  /** Simulates an external operational alert injected into the feed */
  const handleSimulateRisk = () => {
    const riskMessages = [
      "🚨 Congestionamento detectado por satélite na BR-153 afetando rotas do TO.",
      "🌧️ Clima: Chuvas torrenciais reportadas no trecho sul da rota Palmas/Goiânia.",
      "⚠️ Barreira policial detectada no KM 412 da BR-010 — desvio recomendado.",
      "🔴 Alerta ANTT: Fiscalização de peso por eixo ativa na balança de Estreito (MA).",
    ];
    const msg = riskMessages[Math.floor(Math.random() * riskMessages.length)];
    addLog(msg, "warning");
    showToast("Novo alerta operacional injetado no Feed!", "info");
  };

  // ── API load ─────────────────────────────────────────────────────────────
  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([vehiclesApi.list(), travelsApi.list(), travelsApi.carpoolMatches()])
      .then(([vRes, tRes, mRes]) => {
        setVehicles((vRes.data as Vehicle[]) ?? []);
        setTravels((tRes.data as TravelRow[]) ?? []);
        setMatches((mRes.data as CarpoolMatch[]) ?? []);
      })
      .catch(() => { setError("Não foi possível carregar os dados de logística."); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleMapSelect = (address: string) => {
    if (mapTarget === "departure_location") setDepartureLocation(address);
    else if (mapTarget === "arrival_location") setArrivalLocation(address);
  };

  const activeVehicles = vehicles.filter(v => v.status === "active");

  function updateKmRodado(initial: string, final: string) {
    const a = Number(initial); const b = Number(final);
    if (!Number.isNaN(a) && !Number.isNaN(b) && b >= a) setKmRodado(b - a);
    else setKmRodado("");
  }

  async function handleDispatchSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!vehicleId) return;
    setSaving(true);
    try {
      await travelsApi.create({ vehicle_id: vehicleId, origin: "Base Operacional", destination, distance_km: 0, fuel_consumption: 0 });
      setDispatchModalOpen(false);
      setVehicleId(""); setDestination("");
      load();
      showToast("Despacho criado com sucesso!", "success");
    } finally { setSaving(false); }
  }

  async function handleMovementSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const data = formToObject(new FormData(e.currentTarget));
    saveLogisticsDraft(data);
    addToSyncQueue({ type: "logistics", payload: data });
    setMovementModalOpen(false);
    setSaving(false);
    showToast("Movimentação salva localmente e enfileirada para sincronização.", "success");
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <AppShell>
      <ErrorBoundary>
        <PageHeader
          breadcrumb="Logistics"
          title="Logística Corporativa & Viagens"
          subtitle="Manifesto de carga, despachos assistidos por IA e monitoramento de ocorrências em tempo real."
          actions={
            <>
              <ActionButton variant="outline" onClick={() => setMovementModalOpen(true)}>
                <Icon name="edit_road" /> Registrar Movimentação
              </ActionButton>
              <ActionButton onClick={() => setDispatchModalOpen(true)}>
                <Icon name="add_task" /> Agendar Despacho
              </ActionButton>
            </>
          }
        />

        {/* ── Manifesto de Viagens Ativas (interativo) ─────────────────────── */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="fleet-section-title">Manifestos de Viagem Ativos</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">Clique nas ações para mutar o status em tempo real. Viagens concluídas ficam protegidas.</p>
            </div>
            <button
              onClick={handleSimulateRisk}
              className="flex items-center gap-1.5 text-xs bg-error/10 border border-error/30 text-error font-semibold px-3 py-1.5 rounded-lg hover:bg-error/20 transition-colors"
            >
              <Icon name="warning" className="text-sm" /> Simular Ocorrência
            </button>
          </div>

          <div className="space-y-4">
            {trips.map(trip => {
              const isFinished = trip.status === "Concluída";
              const statusStyle =
                trip.status === "Em Rota" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                trip.status === "Pendente" ? "bg-outline-variant/30 text-on-surface-variant border border-outline-variant/30" :
                trip.status === "Atrasada" ? "bg-error/20 text-error border border-error/30" :
                "bg-green-500/20 text-green-400 border border-green-500/30";

              return (
                <div
                  key={trip.id}
                  className={`raised-card p-5 transition-all border-l-4 ${
                    isFinished ? "border-l-outline-variant/30 opacity-60" :
                    trip.status === "Atrasada" ? "border-l-error" :
                    trip.status === "Em Rota" ? "border-l-primary" :
                    "border-l-outline-variant/30"
                  }`}
                >
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[10px] font-mono font-bold bg-surface-container-high text-primary border border-primary/20 px-2 py-0.5 rounded">
                        {trip.id}
                      </span>
                      <h3 className="text-sm font-bold text-on-surface">{trip.route}</h3>
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider w-fit ${statusStyle}`}>
                      {trip.status}
                    </span>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-on-surface-variant py-2 border-t border-outline-variant/10 mb-4">
                    <p className="flex items-center gap-1.5">
                      <Icon name="local_shipping" className="text-[13px]" />
                      <span className="text-on-surface font-medium">{trip.vehicle}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Icon name="person" className="text-[13px]" />
                      <span className="text-on-surface font-medium">{trip.driver}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Icon name="inventory_2" className="text-[13px]" />
                      <span className="text-on-surface font-medium">{trip.cargo}</span>
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-outline-variant/10">
                    <button
                      disabled={isFinished}
                      onClick={() => updateTripStatus(trip.id, "Em Rota")}
                      className="text-[10px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors disabled:opacity-25 disabled:cursor-not-allowed bg-primary/10 text-primary hover:bg-primary/20"
                    >
                      <Icon name="play_arrow" className="text-xs mr-1" />
                      Iniciar Viagem
                    </button>
                    <button
                      disabled={isFinished}
                      onClick={() => updateTripStatus(trip.id, "Atrasada")}
                      className="text-[10px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors disabled:opacity-25 disabled:cursor-not-allowed bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20"
                    >
                      <Icon name="schedule" className="text-xs mr-1" />
                      Reportar Atraso
                    </button>
                    <button
                      disabled={isFinished}
                      onClick={() => updateTripStatus(trip.id, "Concluída")}
                      className="text-[10px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors disabled:opacity-25 disabled:cursor-not-allowed bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20 ml-auto"
                    >
                      <Icon name="check_circle" className="text-xs mr-1" />
                      Finalizar Rota
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Two-column: Feed + API Dispatches ───────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">

          {/* Feed de Ocorrências ao Vivo */}
          <section className="raised-card p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="sensors" className="text-primary text-lg" />
              <h2 className="fleet-section-title">Feed de Ocorrências ao Vivo</h2>
            </div>
            <p className="text-xs text-on-surface-variant mb-4">Registros automáticos e manuais injetados do campo em tempo real.</p>

            <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar flex-1 pr-1">
              {logs.map(log => (
                <div key={log.id} className="bg-surface-container-high border border-outline-variant/10 p-3 rounded-lg text-xs animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex justify-between text-[10px] font-mono text-on-surface-variant mb-1">
                    <span>[{log.time}]</span>
                    <span className={`uppercase font-bold tracking-widest ${
                      log.type === "success" ? "text-green-400" :
                      log.type === "warning" ? "text-error" :
                      "text-primary"
                    }`}>
                      {log.type}
                    </span>
                  </div>
                  <p className="text-on-surface leading-relaxed">{log.message}</p>
                </div>
              ))}
            </div>
          </section>

          {/* API-backed dispatches */}
          <section className="raised-card p-5">
            <h2 className="fleet-section-title mb-4">Despachos Cadastrados</h2>
            <ListPageStates
              loading={loading}
              error={error}
              isEmpty={travels.length === 0}
              onRetry={load}
              emptyTitle="Nenhum despacho no sistema"
              emptyDescription="Nenhum despacho cadastrado no sistema no momento."
              emptyIcon="local_shipping"
              skeleton={
                <div className="space-y-3">
                  <ListRowSkeleton /><ListRowSkeleton /><ListRowSkeleton />
                </div>
              }
            >
              <div className="divide-y divide-outline-variant/30 overflow-hidden rounded-lg border border-outline-variant">
                {travels.slice(0, 8).map(d => (
                  <div key={d.id} className="flex items-center justify-between p-4 hover:bg-surface-container-low transition">
                    <div>
                      <p className="font-bold text-sm">{d.origin} → {d.destination}</p>
                      <p className="text-xs text-on-surface-variant">{formatPlateDisplay(d.vehicle_plate ?? "")}</p>
                    </div>
                    <span className="chip-active">{STATUS_PT[d.status] ?? d.status}</span>
                  </div>
                ))}
              </div>
            </ListPageStates>
          </section>
        </div>

        {/* ── Carpooling Matching ─────────────────────────────────────────── */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="fleet-section-title">Caronas — Viagens Compatíveis</h2>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary font-bold border border-primary/20">
              {loading ? "..." : `${matches.length} sugestão(ões)`}
            </span>
          </div>
          <ListPageStates
            loading={loading}
            error={error}
            isEmpty={matches.length === 0}
            onRetry={load}
            emptyTitle="Nenhuma sugestão de carona"
            emptyDescription="Cadastre viagens com origem/destino semelhantes para ver sugestões."
            emptyIcon="directions_car"
            skeleton={
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <CardSkeleton /><CardSkeleton /><CardSkeleton />
              </div>
            }
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {matches.map(m => {
                const pct = Math.min(99, 70 + Number(m.match_score) * 8);
                return (
                  <div key={m.id} className={`raised-card flex flex-col justify-between border-l-4 p-4 ${pct > 85 ? "border-l-secondary-container" : "border-l-primary"}`}>
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
          </ListPageStates>
        </section>

        {/* ── Modals ───────────────────────────────────────────────────────── */}
        <FormModal open={dispatchModalOpen} onClose={() => setDispatchModalOpen(false)} title="Agendamento Assistido" subtitle="Selecione veículo e destino" wide>
          <form className="space-y-4" onSubmit={handleDispatchSubmit}>
            <div>
              <label className="mb-1 block text-label-md text-on-surface-variant">Veículo da frota</label>
              <select className="input-fleet" required value={vehicleId} onChange={e => setVehicleId(e.target.value)}>
                <option value="">Selecione um veículo cadastrado</option>
                {activeVehicles.map(v => (
                  <option key={v.id} value={v.id}>{formatPlateDisplay(v.plate)} — {v.brand} {v.model}</option>
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
                <label htmlFor="departure_location" className="mb-1 block text-label-md text-on-surface-variant font-bold uppercase text-[10px]">Local de saída</label>
                <div className="flex gap-2">
                  <input id="departure_location" name="departure_location" type="text" required className="input-fleet flex-1" value={departureLocation} onChange={e => setDepartureLocation(e.target.value)} />
                  <button type="button" onClick={() => { setMapTarget("departure_location"); setMapSelectorOpen(true); }} className="btn-outline flex items-center justify-center gap-1 border border-outline-variant bg-surface-container-high px-3 py-2 text-xs font-semibold text-primary hover:bg-white/5 transition rounded-lg">
                    <Icon name="map" /> Maps
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="arrival_location" className="mb-1 block text-label-md text-on-surface-variant font-bold uppercase text-[10px]">Local de chegada</label>
                <div className="flex gap-2">
                  <input id="arrival_location" name="arrival_location" type="text" required className="input-fleet flex-1" value={arrivalLocation} onChange={e => setArrivalLocation(e.target.value)} />
                  <button type="button" onClick={() => { setMapTarget("arrival_location"); setMapSelectorOpen(true); }} className="btn-outline flex items-center justify-center gap-1 border border-outline-variant bg-surface-container-high px-3 py-2 text-xs font-semibold text-primary hover:bg-white/5 transition rounded-lg">
                    <Icon name="map" /> Maps
                  </button>
                </div>
              </div>
              <FormField label="Data/Hora saída" name="departure_datetime" type="datetime-local" required />
              <FormField label="Data/Hora chegada" name="arrival_datetime" type="datetime-local" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="odometer_start" className="mb-1 block text-label-md text-on-surface-variant">KM inicial</label>
                <input id="odometer_start" name="odometer_start" type="number" required className="input-fleet" placeholder="0"
                  onChange={e => updateKmRodado(e.target.value, (document.getElementById("odometer_end") as HTMLInputElement)?.value ?? "")} />
              </div>
              <div>
                <label htmlFor="odometer_end" className="mb-1 block text-label-md text-on-surface-variant">KM final</label>
                <input id="odometer_end" name="odometer_end" type="number" required className="input-fleet" placeholder="0"
                  onChange={e => updateKmRodado((document.getElementById("odometer_start") as HTMLInputElement)?.value ?? "", e.target.value)} />
              </div>
              <div className="sm:col-span-2 rounded-lg bg-primary/10 p-4">
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
              onSaveLocal={() => { if (movementFormRef.current) saveLogisticsDraft(formToObject(new FormData(movementFormRef.current))); }}
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
      </ErrorBoundary>
    </AppShell>
  );
}
