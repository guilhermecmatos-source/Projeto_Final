"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import FormField from "@/components/forms/FormField";
import SearchableCombobox, { ComboboxOption } from "@/components/forms/SearchableCombobox";
import FormActions from "@/components/forms/FormActions";
import { resolveEntityId } from "@/lib/form-resolve";
import Icon from "@/components/ui/Icon";
import { generateAuthNumber } from "@/lib/local-storage";
import {
  addToSyncQueue,
  formatSavedAt,
  getRuvDraft,
  isOnline,
  saveRuvDraft,
} from "@/lib/offline";
import { useOffline } from "@/hooks/useOffline";
import { driversApi, vehiclesApi } from "@/services/api";
import GoogleMapsGeoselector from "@/components/forms/GoogleMapsGeoselector";

const VEHICLE_TYPES = [
  "Passageiro",
  "Ônibus",
  "Cavalo Mecânico",
  "Caminhão Grande",
  "Caminhão Pequeno",
  "Pick-up",
  "Unidade Móvel",
  "Micro-ônibus",
];

const FUEL_TYPES = ["Álcool", "Diesel", "Gasolina"];

function formToObject(form: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  form.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

function RuvPageContent() {
  const formRef = useRef<HTMLFormElement>(null);
  const [authNumber, setAuthNumber] = useState("007194");
  const [vehicles, setVehicles] = useState<{ id: string; plate: string }[]>([]);
  const [drivers, setDrivers] = useState<{ id: string; name: string }[]>([]);
  const [selectedPlate, setSelectedPlate] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [routeChange, setRouteChange] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ error: "", success: "" });
  const { online, syncing, syncNow } = useOffline();
  const searchParams = useSearchParams();
  const paramVehicleId = searchParams.get("vehicleId");

  const [destination, setDestination] = useState("");
  const [mapSelectorOpen, setMapSelectorOpen] = useState(false);

  const vehicleOptions: ComboboxOption[] = vehicles.map((v) => ({
    value: v.id,
    label: v.plate,
  }));

  const driverOptions: ComboboxOption[] = drivers.map((d) => ({
    value: d.id,
    label: d.name,
  }));

  useEffect(() => {
    setAuthNumber(generateAuthNumber());
    const draft = getRuvDraft();
    if (draft?.savedAt) setLastSaved(draft.savedAt as string);
    if (draft?.destination) setDestination(draft.destination as string);

    Promise.all([vehiclesApi.list(), driversApi.list()])
      .then(([vRes, dRes]) => {
        setVehicles((Array.isArray(vRes.data) ? vRes.data : []) as { id: string; plate: string }[]);
        setDrivers((Array.isArray(dRes.data) ? dRes.data : []) as { id: string; name: string }[]);
      })
      .catch(() => {
        setVehicles([
          { id: "1", plate: "ABC-1234" },
          { id: "2", plate: "DEF-5678" },
        ]);
        setDrivers([
          { id: "1", name: "Carlos Eduardo" },
          { id: "2", name: "Ana Martins" },
        ]);
      });
  }, []);

  useEffect(() => {
    if (vehicles.length > 0 && paramVehicleId) {
      const v = vehicles.find((x) => x.id === paramVehicleId);
      if (v) {
        setVehicleId(v.id);
        setSelectedPlate(v.plate);
      }
    }
  }, [vehicles, paramVehicleId]);

  function handleVehicleChange(id: string) {
    setVehicleId(id);
    const resolved = resolveEntityId(id, vehicleOptions);
    const v = vehicles.find((x) => x.id === resolved);
    setSelectedPlate(v?.plate ?? id);
  }

  function handleDriverChange(id: string) {
    setDriverId(id);
  }

  function handleSaveLocal() {
    if (!formRef.current) return;
    const savedAt = saveRuvDraft({ ...formToObject(new FormData(formRef.current)), auth_number: authNumber });
    setLastSaved(savedAt);
    setMessage({ error: "", success: "RUV salva localmente." });
  }

  async function handleSync() {
    if (!isOnline()) {
      setMessage({ error: "Sem conexão.", success: "" });
      return;
    }
    const result = await syncNow();
    setMessage(
      result.ok
        ? { error: "", success: result.message }
        : { error: result.message, success: "" }
    );
  }

  function handleExportPdf() {
    window.print();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const raw = formToObject(new FormData(e.currentTarget));
    const resolvedVehicle = resolveEntityId(vehicleId || String(raw.vehicle_id || ""), vehicleOptions);
    const resolvedDriver = resolveEntityId(driverId || String(raw.driver_id || ""), driverOptions);
    const data = {
      ...raw,
      passengers: Number(raw.quantidade || 1),
      quantidade: Number(raw.quantidade || 1),
      auth_number: authNumber,
      vehicle_id: resolvedVehicle || vehicleId,
      driver_id: resolvedDriver || driverId,
    };
    saveRuvDraft(data);
    addToSyncQueue({ type: "ruv", payload: data });
    setMessage({ error: "", success: "RUV registrada. Dados na fila de sincronização." });
    setLoading(false);
  }

  return (
    <AppShell headerTitle="RUV — Requisição de Utilização de Veículo">
      <Link href="/travels" className="mb-6 inline-flex items-center gap-1 text-label-md text-primary hover:underline print:hidden">
        <Icon name="arrow_back" />
        Voltar às Viagens
      </Link>

      <div id="ruv-print" className="ruv-document space-y-6">
        <header className="raised-card border-2 border-primary/20 p-4 sm:p-6">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <p className="text-label-md uppercase text-on-surface-variant">Autorização nº</p>
              <p className="text-3xl font-bold text-primary">{authNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-label-md text-on-surface-variant">Horário</p>
              <div className="flex flex-wrap items-center gap-2">
                <span>Das</span>
                <input name="time_from" type="time" className="input-fleet !w-auto" required form="ruv-form" />
                <span>às</span>
                <input name="time_to" type="time" className="input-fleet !w-auto" required form="ruv-form" />
                <span>horas</span>
              </div>
            </div>
          </div>
        </header>

        {lastSaved && (
          <p className="text-sm text-on-surface-variant print:hidden">
            Último salvamento local: {formatSavedAt(lastSaved)}
          </p>
        )}
        {message.error && <p className="text-error print:hidden">{message.error}</p>}
        {message.success && <p className="text-primary print:hidden">{message.success}</p>}

        <form id="ruv-form" ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <section className="raised-card p-4 sm:p-6">
            <h2 className="mb-4 text-headline-sm">Tipo de veículo</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {VEHICLE_TYPES.map((t) => (
                <label key={t} className="flex cursor-pointer items-center gap-2 rounded-lg border border-outline-variant p-3 hover:bg-surface-container-low">
                  <input type="radio" name="vehicle_type" value={t} required className="text-primary" />
                  <span className="text-sm">{t}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="raised-card grid gap-4 p-4 sm:p-6 md:grid-cols-2">
            <h2 className="md:col-span-2 text-headline-sm">Dados da requisição</h2>
            <FormField label="Nome do(s) passageiro(s)" name="descricao" required className="md:col-span-2" />
            <div>
              <label htmlFor="destination" className="mb-1 block text-label-md text-on-surface-variant font-bold uppercase text-[10px]">
                Destino
              </label>
              <div className="flex gap-2">
                <input
                  id="destination"
                  name="destination"
                  type="text"
                  required
                  className="input-fleet flex-1"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setMapSelectorOpen(true)}
                  className="btn-outline flex items-center justify-center gap-1 border border-outline-variant bg-surface-container-high px-3 py-2 text-xs font-semibold text-primary hover:bg-white/5 transition rounded-lg"
                >
                  <Icon name="map" />
                  Maps
                </button>
              </div>
            </div>
            <FormField label="Serviço a executar" name="service" required />
            <FormField label="Nome do requisitante (por extenso)" name="requester_name" required className="md:col-span-2" />
            <FormField label="Autorização" name="authorization_ref" required />
          </section>

          <section className="raised-card grid gap-4 p-4 sm:p-6 md:grid-cols-2">
            <h2 className="md:col-span-2 text-headline-sm">Autorização da Unidade / Transporte</h2>
            <SearchableCombobox
              key={`vehicle-${vehicleId}`}
              label="Veículo"
              name="vehicle_id"
              required
              options={vehicleOptions}
              defaultValue={vehicleId}
              placeholder="Digite placa ou selecione..."
              allowCustom
              onValueChange={handleVehicleChange}
            />
            <div>
              <label className="mb-1 block text-label-md text-on-surface-variant">Placa (auto)</label>
              <input className="input-fleet bg-surface-container-low" readOnly value={selectedPlate} placeholder="Selecione o veículo" />
            </div>
            <FormField
              label="Combustível"
              name="fuel_type"
              required
              options={FUEL_TYPES.map((f) => ({ value: f, label: f }))}
            />
            <FormField label="Assinatura Encarregado UNIAD/Transporte" name="encarregado_signature" placeholder="Nome completo" />
            <SearchableCombobox
              label="Condutor / Motorista"
              name="driver_id"
              required
              options={driverOptions}
              placeholder="Digite nome ou selecione..."
              allowCustom
              onValueChange={handleDriverChange}
            />
          </section>

          <section className="raised-card p-4 sm:p-6">
            <h2 className="mb-4 text-headline-sm">Alteração de rota</h2>
            <label className="mb-4 flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={routeChange}
                onChange={(e) => setRouteChange(e.target.checked)}
                className="h-5 w-5 rounded text-primary"
              />
              <span className="text-body-md">Autorizo o motorista a alterar a rota prevista</span>
            </label>
            {routeChange && (
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Destino alternativo" name="alt_destination" />
                <FormField label="Objetivo" name="alt_objective" />
                <FormField label="Data" name="alt_date" type="date" />
                <FormField label="Assinatura" name="alt_signature" />
              </div>
            )}
          </section>

          <div className="print:hidden">
            <FormActions
              loading={loading}
              syncing={syncing}
              submitLabel="Salvar RUV"
              onSaveLocal={handleSaveLocal}
              onSyncNow={handleSync}
              onExportPdf={handleExportPdf}
              syncDisabled={!online}
              submitClassName="flex items-center justify-center gap-2 rounded-lg bg-[#0B3C95] hover:bg-[#09327a] px-6 py-3 font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
              exportClassName="flex items-center justify-center gap-2 rounded-lg bg-[#FCA311] hover:bg-[#e5940f] px-6 py-3 font-semibold text-black transition active:scale-[0.98] disabled:opacity-50"
              saveLocalClassName="flex items-center justify-center gap-2 rounded-lg border border-outline-variant bg-white text-black hover:bg-slate-100 px-6 py-3 font-semibold transition active:scale-[0.98] disabled:opacity-50"
              syncClassName="flex items-center justify-center gap-2 rounded-lg border border-[#0B3C95] bg-transparent text-[#0B3C95] hover:bg-blue-50/10 px-6 py-3 font-semibold transition active:scale-[0.98] disabled:opacity-50"
            />
          </div>
        </form>
      </div>

      <GoogleMapsGeoselector
        open={mapSelectorOpen}
        onClose={() => setMapSelectorOpen(false)}
        onSelect={(address) => setDestination(address)}
        title="Selecione o Destino no Mapa"
      />
    </AppShell>
  );
}

export default function RuvPage() {
  return (
    <Suspense fallback={
      <AppShell headerTitle="RUV — Requisição de Utilização de Veículo">
        <p className="text-slate-300">Carregando formulário RUV...</p>
      </AppShell>
    }>
      <RuvPageContent />
    </Suspense>
  );
}
