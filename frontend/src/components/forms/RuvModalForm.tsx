"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import FormField from "@/components/forms/FormField";
import SearchableCombobox, { ComboboxOption } from "@/components/forms/SearchableCombobox";
import { resolveEntityId } from "@/lib/form-resolve";
import { generateAuthNumber } from "@/lib/local-storage";
import { addToSyncQueue, saveRuvDraft } from "@/lib/offline";
import { driversApi, ruvApi, vehiclesApi } from "@/services/api";

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

interface RuvModalFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

function formToObject(form: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  form.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

export default function RuvModalForm({ onSuccess, onCancel }: RuvModalFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [authNumber, setAuthNumber] = useState("007194");
  const [vehicles, setVehicles] = useState<{ id: string; plate: string }[]>([]);
  const [drivers, setDrivers] = useState<{ id: string; name: string }[]>([]);
  const [selectedPlate, setSelectedPlate] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [routeChange, setRouteChange] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const vehicleOptions: ComboboxOption[] = vehicles.map((v) => ({ value: v.id, label: v.plate }));
  const driverOptions: ComboboxOption[] = drivers.map((d) => ({ value: d.id, label: d.name }));

  useEffect(() => {
    setAuthNumber(generateAuthNumber());
    Promise.all([vehiclesApi.list(), driversApi.list()])
      .then(([vRes, dRes]) => {
        setVehicles((Array.isArray(vRes.data) ? vRes.data : []) as { id: string; plate: string }[]);
        setDrivers((Array.isArray(dRes.data) ? dRes.data : []) as { id: string; name: string }[]);
      })
      .catch(() => {});
  }, []);

  function handleVehicleChange(id: string) {
    setVehicleId(id);
    const resolved = resolveEntityId(id, vehicleOptions);
    const v = vehicles.find((x) => x.id === resolved);
    setSelectedPlate(v?.plate ?? id);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const raw = formToObject(new FormData(e.currentTarget));
    const resolvedVehicle = resolveEntityId(vehicleId || String(raw.vehicle_id || ""), vehicleOptions);
    const resolvedDriver = resolveEntityId(driverId || String(raw.driver_id || ""), driverOptions);
    const data = {
      ...raw,
      passengers: Number(raw.quantidade || 1),
      quantidade: Number(raw.quantidade || 1),
      descricao: raw.descricao || "",
      purpose: raw.service,
      auth_number: authNumber,
      vehicle_id: resolvedVehicle || vehicleId,
      driver_id: resolvedDriver || driverId,
      origin: raw.origin || "Base Operacional",
      destination: raw.destination,
    };
    try {
      await ruvApi.create(data);
      onSuccess?.();
    } catch (err: any) {
      if (err.response) {
        const { extractApiError } = await import("@/lib/api-errors");
        const errMsg = extractApiError(err, "Erro ao salvar RUV.");
        setMessage(errMsg);
      } else {
        saveRuvDraft(data);
        addToSyncQueue({ type: "ruv", payload: data });
        setMessage("RUV salva localmente. Sincronização pendente.");
        setTimeout(() => onSuccess?.(), 2000);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
        <p className="text-[10px] font-bold uppercase text-on-surface-variant">Autorização nº</p>
        <p className="text-2xl font-bold text-primary">{authNumber}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <span>Das</span>
          <input name="time_from" type="time" className="input-fleet !w-auto" required />
          <span>às</span>
          <input name="time_to" type="time" className="input-fleet !w-auto" required />
          <span>horas</span>
        </div>
      </div>

      <div>
        <p className="fleet-section-title mb-2">Tipo de veículo</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {VEHICLE_TYPES.map((t) => (
            <label key={t} className="flex cursor-pointer items-center gap-2 rounded-lg border border-outline-variant p-2 text-xs hover:bg-surface-container-high">
              <input type="radio" name="vehicle_type" value={t} required className="text-primary" />
              {t}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Descrição do(s) passageiro(s)" name="descricao" required className="sm:col-span-2" />
        <FormField label="Quantidade de passageiro(s)" name="quantidade" type="number" defaultValue="1" required className="sm:col-span-2" />
        <FormField label="Origem" name="origin" defaultValue="Base Operacional" />
        <FormField label="Destino" name="destination" required />
        <FormField label="Serviço a executar" name="service" required />
        <FormField label="Nome do requisitante" name="requester_name" required className="sm:col-span-2" />
        <FormField label="Autorização" name="authorization_ref" required />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <SearchableCombobox label="Veículo" name="vehicle_id" required options={vehicleOptions} placeholder="Placa..." allowCustom onValueChange={handleVehicleChange} />
        <div>
          <label className="mb-1 block text-label-md text-on-surface-variant">Placa (auto)</label>
          <input className="input-fleet bg-surface-container-low" readOnly value={selectedPlate} placeholder="Selecione o veículo" />
        </div>
        <FormField label="Combustível" name="fuel_type" required options={FUEL_TYPES.map((f) => ({ value: f, label: f }))} />
        <SearchableCombobox label="Condutor / Motorista" name="driver_id" required options={driverOptions} placeholder="Nome..." allowCustom onValueChange={setDriverId} />
      </div>

      <label className="flex cursor-pointer items-center gap-3">
        <input type="checkbox" checked={routeChange} onChange={(e) => setRouteChange(e.target.checked)} className="h-5 w-5 rounded text-primary" />
        <span className="text-sm">Autorizo alteração de rota prevista</span>
      </label>
      {routeChange && (
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Destino alternativo" name="alt_destination" />
          <FormField label="Objetivo" name="alt_objective" />
        </div>
      )}

      {message && <p className="text-sm text-primary">{message}</p>}
      <div className="flex gap-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary flex-1 uppercase">
            Cancelar
          </button>
        )}
        <button type="submit" disabled={loading} className="btn-primary flex-1 uppercase">
          {loading ? "Salvando..." : "Salvar RUV"}
        </button>
      </div>
    </form>
  );
}
