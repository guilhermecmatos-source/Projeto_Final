"use client";

import { useEffect, useState } from "react";
import FormField from "@/components/forms/FormField";
import CurrencyField from "@/components/forms/CurrencyField";
import FileUploadField from "@/components/forms/FileUploadField";
import FormShell from "@/components/forms/FormShell";
import { maintenanceApi, vehiclesApi } from "@/services/api";
import { addToSyncQueue, isOnline } from "@/lib/offline";
import { readJson, writeJson } from "@/lib/local-storage";

type TabId = "occurrence" | "additional";

export default function MaintenanceRegisterPage() {
  const [vehicles, setVehicles] = useState<{ id: string; plate: string }[]>([]);
  const [tab, setTab] = useState<TabId>("occurrence");

  useEffect(() => {
    vehiclesApi
      .list()
      .then((res) => setVehicles((res.data as { id: string; plate: string }[]) || []))
      .catch(() => setVehicles([]));
  }, []);

  async function saveMaintenance(form: FormData, isAdditional: boolean) {
    const p = isAdditional ? "add_" : "";
    const desc =
      form.get(`${p}service_description`) || form.get(`${p}description`) || "";
    const payload = {
      vehicle_id: form.get(`${p}vehicle_id`),
      type: form.get(`${p}type`),
      description: desc,
      cost: Number(form.get(`${p}cost`) || 0),
      scheduled_at: form.get(`${p}scheduled_at`) || new Date().toISOString(),
      tab,
    };

    if (isOnline()) {
      await maintenanceApi.create({
        vehicle_id: payload.vehicle_id,
        type: payload.type,
        description: String(payload.description),
        cost: payload.cost,
        scheduled_at: String(payload.scheduled_at),
      });
    } else {
      addToSyncQueue({ type: "maintenance", payload });
    }

    const local = readJson<Record<string, unknown>[]>("fleet_maintenance_local", []);
    local.push({ ...payload, savedAt: new Date().toISOString() });
    writeJson("fleet_maintenance_local", local);
  }

  return (
    <FormShell
      title="Manutenção e Ocorrências"
      subtitle="Nova ocorrência ou manutenção adicional com fotos e descrição detalhada."
      backHref="/maintenance"
      redirectOnSuccess="/maintenance"
      onSubmit={async (form) => {
        await saveMaintenance(form, tab === "additional");
      }}
    >
      <div className="flex gap-2 rounded-lg border border-outline-variant bg-surface-container-low p-1">
        {[
          { id: "occurrence" as const, label: "Nova Ocorrência" },
          { id: "additional" as const, label: "Manutenção Adicional" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition ${
              tab === t.id ? "bg-primary text-on-primary" : "text-on-surface-variant"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "occurrence" ? (
        <section className="raised-card space-y-4 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Veículo"
              name="vehicle_id"
              required
              options={[
                { value: "", label: "Selecione" },
                ...vehicles.map((v) => ({ value: v.id, label: v.plate })),
              ]}
            />
            <FormField
              label="Tipo"
              name="type"
              required
              options={[
                { value: "preventive", label: "Preventiva" },
                { value: "corrective", label: "Corretiva" },
              ]}
            />
            <CurrencyField label="Custo estimado (R$)" name="cost" />
            <FormField label="Data agendada" name="scheduled_at" type="datetime-local" required />
          </div>
          <FormField
            label="Descrição resumida"
            name="description"
            required
            placeholder="Resumo da ocorrência"
          />
          <FormField
            label="Descrição detalhada do serviço realizado"
            name="service_description"
            as="textarea"
            rows={6}
            required
            placeholder="Peças trocadas, procedimentos, responsável técnico..."
          />
          <FileUploadField
            label="Fotos / documentos da manutenção"
            storageKey="fleet_maintenance_occurrence_files"
            hint="Imagens ou PDF — salvos localmente com preview"
          />
        </section>
      ) : (
        <section className="raised-card space-y-4 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Veículo"
              name="add_vehicle_id"
              required
              options={[
                { value: "", label: "Selecione" },
                ...vehicles.map((v) => ({ value: v.id, label: v.plate })),
              ]}
            />
            <FormField
              label="Tipo"
              name="add_type"
              required
              options={[
                { value: "preventive", label: "Preventiva" },
                { value: "corrective", label: "Corretiva" },
              ]}
            />
            <CurrencyField label="Custo (R$)" name="add_cost" />
            <FormField label="Data" name="add_scheduled_at" type="datetime-local" required />
          </div>
          <FormField label="Descrição resumida" name="add_description" required />
          <FormField
            label="Descrição detalhada do serviço realizado"
            name="add_service_description"
            as="textarea"
            rows={6}
            required
          />
          <FileUploadField
            label="Fotos / documentos"
            storageKey="fleet_maintenance_additional_files"
          />
        </section>
      )}
    </FormShell>
  );
}
