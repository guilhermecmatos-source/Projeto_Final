"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ActionButton from "@/components/ui/ActionButton";
import FormModal from "@/components/ui/FormModal";
import { showToast } from "@/components/ui/Toast";
import SearchableCombobox, { ComboboxOption } from "@/components/forms/SearchableCombobox";
import AddressAutocomplete from "@/components/forms/AddressAutocomplete";
import RuvModalForm from "@/components/forms/RuvModalForm";
import RuvDetailsModal, { RuvDetail } from "@/components/ui/RuvDetailsModal";
import { travelsApi, ruvApi, driversApi, vehiclesApi, geocodingApi } from "@/services/api";
import { resolveEntityId } from "@/lib/form-resolve";
import { formatPlateDisplay } from "@/lib/validators";

interface TravelRow {
  id: string;
  origin: string;
  destination: string;
  vehicle_plate?: string;
  driver_name?: string;
  brand?: string;
  model?: string;
  status: string;
  distance_km: number;
  fuel_consumption?: number;
}

interface RuvRow {
  id: string;
  origin: string;
  destination: string;
  status: string;
  created_at: string;
  vehicle_plate?: string;
  driver_name?: string;
  requester_name?: string;
  purpose?: string;
  service?: string;
  passengers?: number;
  quantidade?: number;
  descricao?: string;
  time_from?: string;
  time_to?: string;
  vehicle_type?: string;
  authorization_ref?: string;
  fuel_type?: string;
  auth_number?: string;
  route_change?: number | boolean;
  alt_destination?: string;
  alt_objective?: string;
  justification?: string;
}

interface MatchRow {
  id: string;
  origin: string;
  destination: string;
  vehicle_plate: string;
  driver_name: string;
  match_score: number;
}

export default function TravelsPage() {
  const [travels, setTravels] = useState<TravelRow[]>([]);
  const [ruvs, setRuvs] = useState<RuvRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [carpoolDest, setCarpoolDest] = useState("");
  const [ruvModalOpen, setRuvModalOpen] = useState(false);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [matchingModalOpen, setMatchingModalOpen] = useState(false);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [selectedRuv, setSelectedRuv] = useState<RuvDetail | null>(null);

  const [vehicles, setVehicles] = useState<{ id: string; plate: string; brand?: string; model?: string; avg_consumption?: number | null; autonomy_km?: number | null }[]>([]);
  const [drivers, setDrivers] = useState<{ id: string; name: string }[]>([]);
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [savingDispatch, setSavingDispatch] = useState(false);

  const [logs, setLogs] = useState<{ id: string; time: string; action: string; vehicle: string }[]>([
    { id: "log-1", time: new Date().toLocaleTimeString("pt-BR"), action: "Sistema de Telemetria Inicializado", vehicle: "SYSTEM" }
  ]);

  const addLog = (action: string, vehicle: string) => {
    setLogs(prev => [
      { id: `log-${Date.now()}`, time: new Date().toLocaleTimeString("pt-BR"), action, vehicle },
      ...prev
    ]);
  };

  const handleAction = (travelId: string, vehicleStr: string, actionType: "iniciar" | "atraso" | "concluir") => {
    setTravels(prev => prev.map(t => {
      if (t.id !== travelId) return t;
      if (t.status === "concluída") {
        showToast("Esta viagem já está concluída e os dados estão protegidos.", "error");
        return t;
      }
      
      let newStatus = t.status;
      if (actionType === "iniciar") {
        newStatus = "in_progress";
        addLog("Viagem Iniciada", vehicleStr);
        showToast("Viagem iniciada com sucesso.", "success");
      } else if (actionType === "atraso") {
        addLog("Atraso Reportado (Trânsito/Clima)", vehicleStr);
        showToast("Ocorrência de atraso registrada.", "info");
      } else if (actionType === "concluir") {
        newStatus = "concluída";
        addLog("Viagem Concluída e Auditada", vehicleStr);
        showToast("Viagem concluída e bloqueada para edição.", "success");
      }
      
      return { ...t, status: newStatus };
    }));
  };

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([travelsApi.list(), ruvApi.list()])
      .then(([tRes, rRes]) => {
        setTravels(Array.isArray(tRes.data) ? tRes.data : []);
        setRuvs(Array.isArray(rRes.data) ? rRes.data : []);
      })
      .catch(() => {
        setTravels([]);
        setRuvs([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!dispatchModalOpen) return;
    Promise.all([vehiclesApi.list(), driversApi.list()])
      .then(([vRes, dRes]) => {
        setVehicles(Array.isArray(vRes.data) ? vRes.data : []);
        setDrivers(Array.isArray(dRes.data) ? dRes.data : []);
      })
      .catch(() => {});
  }, [dispatchModalOpen]);

  const vehicleOptions: ComboboxOption[] = useMemo(
    () => vehicles.map((v) => ({ value: v.id, label: `${v.plate}${v.brand ? ` — ${v.brand} ${v.model ?? ""}` : ""}` })),
    [vehicles]
  );
  const driverOptions: ComboboxOption[] = useMemo(() => drivers.map((d) => ({ value: d.id, label: d.name })), [drivers]);
  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  useEffect(() => {
    if (!origin.trim() || !destination.trim() || !dispatchModalOpen) return;
    const timer = setTimeout(async () => {
      setDistanceLoading(true);
      try {
        const res = await geocodingApi.distance(origin, destination);
        setDistanceKm(String(res.data.distanceKm ?? 0));
      } catch {
        /* ignore */
      } finally {
        setDistanceLoading(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [origin, destination, dispatchModalOpen]);

  const [estimatedFuel, setEstimatedFuel] = useState("");

  const calculateFuel = useCallback(() => {
    const km = Number(distanceKm || 0);
    const avg = Number(selectedVehicle?.avg_consumption || 10);
    if (km > 0) {
      setEstimatedFuel(String(Math.round((km / avg) * 10) / 10));
    } else {
      setEstimatedFuel("");
    }
  }, [distanceKm, selectedVehicle?.avg_consumption]);

  useEffect(() => {
    calculateFuel();
  }, [distanceKm, vehicleId, calculateFuel]);

  async function handleMatchingSearch() {
    setMatchingModalOpen(true);
    setMatchingLoading(true);
    try {
      const res = await travelsApi.carpoolMatches();
      const all = Array.isArray(res.data) ? (res.data as MatchRow[]) : [];
      const filtered = carpoolDest.trim()
        ? all.filter((m) => m.destination.toLowerCase().includes(carpoolDest.toLowerCase()))
        : all;
      setMatches(filtered);
    } catch {
      setMatches([]);
    } finally {
      setMatchingLoading(false);
    }
  }

  async function handleDispatchSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingDispatch(true);
    const resolvedVehicle = resolveEntityId(vehicleId, vehicleOptions);
    const resolvedDriver = resolveEntityId(driverId, driverOptions);
    try {
      await travelsApi.create({
        vehicle_id: resolvedVehicle,
        driver_id: resolvedDriver,
        origin,
        destination,
        distance_km: Number(distanceKm || 0),
        fuel_consumption: Number(estimatedFuel || 0),
      });
      setDispatchModalOpen(false);
      setOrigin("");
      setDestination("");
      setDistanceKm("");
      setVehicleId("");
      setDriverId("");
      load();
    } finally {
      setSavingDispatch(false);
    }
  }

  const inTransit = travels.filter((t) => t.status === "in_progress" || t.status === "scheduled" || t.status === "concluída");

  return (
    <AppShell>
      <PageHeader
        breadcrumb="Logistics"
        title="Controle de Viagens e Logística"
        subtitle="Geração de requisições RUV e lançamentos de despacho operacional."
        actions={
          <>
            <ActionButton variant="outline" onClick={() => setRuvModalOpen(true)}>
              <Icon name="description" />
              Nova RUV I-Form
            </ActionButton>
            <ActionButton onClick={() => setDispatchModalOpen(true)}>
              <Icon name="add" />
              Novo Despacho IA
            </ActionButton>
          </>
        }
      />

      <section className="raised-card mb-6 p-4">
        <h2 className="fleet-section-title mb-1">Caronas Matching & Carpooling</h2>
        <p className="mb-3 text-xs text-on-surface-variant">
          Otimize custos de combustível identificando viagens com destinos compatíveis.
        </p>
        <div className="flex gap-2">
          <input
            className="input-fleet flex-1"
            placeholder="Insira cidade destino... (Ex: Campinas)"
            value={carpoolDest}
            onChange={(e) => setCarpoolDest(e.target.value)}
          />
          <ActionButton variant="outline" onClick={handleMatchingSearch}>
            Buscar Matching
          </ActionButton>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h3 className="mb-4 text-headline-sm text-primary">Histórico RUV</h3>
          <div className="space-y-3">
            {loading ? (
              <p className="text-on-surface-variant">Carregando...</p>
            ) : ruvs.length === 0 ? (
              <p className="raised-card p-4 text-on-surface-variant">Nenhuma RUV registrada.</p>
            ) : (
              ruvs.map((r) => (
                <article
                  key={r.id}
                  className="raised-card p-4 cursor-pointer hover:border-primary/40 transition-colors"
                  onClick={() => setSelectedRuv(r as RuvDetail)}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">REQ-{r.id.slice(0, 8).toUpperCase()}</span>
                    <span className={r.status === "aprovada" || r.status === "approved" ? "chip-active" : "chip-pending"}>
                      {r.status === "aprovada" || r.status === "approved" ? "APROVADA" : "PENDENTE"}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{r.origin} → {r.destination}</p>
                  <p className="text-xs text-on-surface-variant">
                    {r.driver_name ?? "—"} • {r.vehicle_plate ?? "—"}
                  </p>
                  <p className="mt-1 text-[10px] text-on-surface-variant">
                    Lançado em: {new Date(r.created_at).toLocaleDateString("pt-BR")}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-[9px] font-bold text-primary/60">
                    <Icon name="open_in_new" className="text-[10px]" />
                    Clique para ver detalhes completos
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section>
          <h3 className="mb-4 flex items-center gap-2 text-headline-sm text-primary">
            <Icon name="map" />
            Despachos em Trânsito
          </h3>
          <div className="space-y-3">
            {loading ? (
              <p className="text-on-surface-variant">Carregando...</p>
            ) : inTransit.length === 0 ? (
              <p className="raised-card p-4 text-on-surface-variant">Nenhum despacho em trânsito.</p>
            ) : (
              inTransit.map((d) => {
                const vehicleStr = `${d.brand || ""} ${d.model || ""} (${formatPlateDisplay(d.vehicle_plate ?? "")})`;
                const isCompleted = d.status === "concluída";
                
                return (
                  <article key={d.id} className="raised-card p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase">{vehicleStr}</span>
                      <span className={isCompleted ? "chip-active bg-gray-500/20 text-gray-400 border-gray-500/30" : "chip-active"}>
                        {isCompleted ? "Concluída" : "Em Trânsito"}
                      </span>
                    </div>
                    <p className="text-sm">{d.origin} → {d.destination}</p>
                    <p className="mt-2 text-xs mb-4">
                      Uso trajeto: <strong>{Number(d.distance_km).toFixed(0)} Km</strong>
                      {" • "}
                      <span className="text-primary">
                        Proj Diesel: {Number(d.fuel_consumption || d.distance_km / 2.5).toFixed(1)} L
                      </span>
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-3 border-t border-outline-variant/10">
                      <button 
                        onClick={() => handleAction(d.id, vehicleStr, "iniciar")}
                        disabled={isCompleted}
                        className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-3 py-1.5 rounded disabled:opacity-30 transition"
                      >
                        Iniciar
                      </button>
                      <button 
                        onClick={() => handleAction(d.id, vehicleStr, "atraso")}
                        disabled={isCompleted}
                        className="text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded disabled:opacity-30 transition"
                      >
                        Atraso
                      </button>
                      <button 
                        onClick={() => handleAction(d.id, vehicleStr, "concluir")}
                        disabled={isCompleted}
                        className="text-[9px] font-bold uppercase tracking-wider bg-green-500/10 text-green-500 px-3 py-1.5 rounded disabled:opacity-30 transition"
                      >
                        Concluir
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
          
          {/* Logs Feed */}
          <div className="mt-8">
            <h3 className="mb-4 flex items-center gap-2 text-headline-sm text-primary">
              <Icon name="history" />
              Feed de Ocorrências ao Vivo
            </h3>
            <div className="raised-card p-4 space-y-3 max-h-60 overflow-y-auto custom-scrollbar bg-[#0b0e14]">
              {logs.map(log => (
                <div key={log.id} className="flex gap-3 text-xs border-b border-outline-variant/10 pb-2 last:border-0 last:pb-0 animate-in fade-in slide-in-from-top-2">
                  <span className="text-on-surface-variant font-mono shrink-0">[{log.time}]</span>
                  <div>
                    <p className="font-bold text-white">{log.action}</p>
                    <p className="text-[10px] text-primary">{log.vehicle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <FormModal open={ruvModalOpen} onClose={() => setRuvModalOpen(false)} title="RUV — Requisição de Utilização de Veículo" subtitle="Formulário I-Form oficial" xl>
        <RuvModalForm onSuccess={() => { setRuvModalOpen(false); load(); }} onCancel={() => setRuvModalOpen(false)} />
      </FormModal>

      <FormModal open={dispatchModalOpen} onClose={() => setDispatchModalOpen(false)} title="Novo Despacho IA" subtitle="Origem e destino com geolocalização" wide>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleDispatchSubmit}>
          <SearchableCombobox label="Veículo" name="vehicle_id" required options={vehicleOptions} placeholder="Selecione veículo..." allowCustom={false} onValueChange={setVehicleId} />
          <SearchableCombobox label="Motorista" name="driver_id" required options={driverOptions} placeholder="Selecione motorista..." allowCustom={false} onValueChange={setDriverId} />
          <AddressAutocomplete label="Origem" name="origin" value={origin} onChange={setOrigin} required />
          <AddressAutocomplete label="Destino" name="destination" value={destination} onChange={setDestination} required />
          <div>
            <label className="mb-1 block text-label-md text-on-surface-variant">
              Distância (km) {distanceLoading && "— calculando..."}
            </label>
            <input className="input-fleet" name="distance_km" type="number" value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} placeholder="Calculada automaticamente" />
          </div>
          <div>
            <label className="mb-1 block text-label-md text-on-surface-variant flex items-center justify-between">
              <span>Consumo estimado (L)</span>
              <button
                type="button"
                onClick={calculateFuel}
                className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
              >
                <Icon name="calculate" className="text-xs" />
                Estimar
              </button>
            </label>
            <input
              className="input-fleet cursor-pointer"
              name="fuel_consumption"
              type="number"
              value={estimatedFuel}
              onChange={(e) => setEstimatedFuel(e.target.value)}
              placeholder="Clique para estimar ou digite"
              onClick={calculateFuel}
            />
          </div>
          <button type="submit" disabled={savingDispatch} className="btn-primary sm:col-span-2 w-full uppercase">
            {savingDispatch ? "Criando..." : "Criar Despacho"}
          </button>
        </form>
      </FormModal>

      <FormModal open={matchingModalOpen} onClose={() => setMatchingModalOpen(false)} title="Matching AI — Carona Corporativa" subtitle={carpoolDest ? `Destino: ${carpoolDest}` : "Todas as combinações"} wide>
        {matchingLoading ? (
          <p className="text-on-surface-variant">Carregando sugestões...</p>
        ) : matches.length === 0 ? (
          <p className="text-on-surface-variant">Nenhuma combinação encontrada para este destino.</p>
        ) : (
          <div className="space-y-3">
            {matches.map((m) => {
              const pct = Math.min(99, 65 + Number(m.match_score) * 10);
              return (
                <div key={m.id} className="rounded-lg border-l-4 border-l-primary bg-surface-container-high p-4">
                  <p className="font-bold text-primary">MATCH {pct}%</p>
                  <p className="mt-1 text-sm font-medium">{m.origin} → {m.destination}</p>
                  <p className="text-xs text-on-surface-variant">
                    {formatPlateDisplay(m.vehicle_plate)} • {m.driver_name}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </FormModal>

      {/* RUV Details Modal */}
      <RuvDetailsModal ruv={selectedRuv} onClose={() => setSelectedRuv(null)} />
    </AppShell>
  );
}
