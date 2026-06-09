"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import FormField from "@/components/forms/FormField";
import FormActions from "@/components/forms/FormActions";
import Icon from "@/components/ui/Icon";
import { fuelApi, uploadsApi, vehiclesApi } from "@/services/api";
import { addToSyncQueue, isOnline } from "@/lib/offline";
import { readJson, writeJson } from "@/lib/local-storage";
import { useOffline } from "@/hooks/useOffline";
import CurrencyField from "@/components/forms/CurrencyField";
import MediaUpload from "@/components/forms/MediaUpload";

export default function FuelRegisterPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [vehicles, setVehicles] = useState<{ id: string; plate: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptDataUrl, setReceiptDataUrl] = useState<string | null>(null);
  const { online, syncNow } = useOffline();

  useEffect(() => {
    vehiclesApi
      .list()
      .then((res) => setVehicles((res.data as { id: string; plate: string }[]) || []))
      .catch(() => setVehicles([]));
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const payload = {
      vehicle_id: form.get("vehicle_id"),
      liters: Number(form.get("liters")),
      cost: Number(form.get("cost")),
      mileage_at_fill: Number(form.get("mileage_at_fill")),
      station: form.get("station") || "",
      filled_at: form.get("filled_at") || new Date().toISOString(),
      receipt_url: receiptDataUrl || undefined,
    };

    const local = readJson<Record<string, unknown>[]>("fleet_fuel_local", []);
    local.push({
      ...payload,
      fuel_type: form.get("fuel_type"),
      savedAt: new Date().toISOString(),
    });
    writeJson("fleet_fuel_local", local);

    try {
      if (isOnline()) {
        const res = await fuelApi.create(payload);
        const recordId = (res.data as { id?: string })?.id;
        if (recordId && receiptFile) {
          await uploadsApi.upload(receiptFile, "fuel_receipt", recordId);
        }
      } else {
        addToSyncQueue({ type: "fuel", payload });
      }
      setSuccess("Abastecimento registrado.");
      setTimeout(() => {
        window.location.href = "/fuel";
      }, 800);
    } catch {
      addToSyncQueue({ type: "fuel", payload });
      setSuccess("Salvo offline para sincronização.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell headerTitle="Registrar Abastecimento">
      <Link href="/fuel" className="mb-6 inline-flex items-center gap-1 text-label-md text-primary hover:underline">
        <Icon name="arrow_back" />
        Voltar
      </Link>
      <h1 className="mb-2 text-headline-lg">Registrar Abastecimento</h1>
      <p className="mb-6 text-body-md text-on-surface-variant">
        Use Escanear Cupom para adicionar e salvar a imagem do comprovante.
      </p>
      {error && <p className="mb-4 text-error">{error}</p>}
      {success && <p className="mb-4 text-primary">{success}</p>}

      <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
        <section className="raised-card grid gap-4 p-6 md:grid-cols-2">
          <FormField
            label="Veículo"
            name="vehicle_id"
            required
            options={
              vehicles.length
                ? vehicles.map((v) => ({ value: v.id, label: v.plate }))
                : [{ value: "", label: "Cadastre um veículo primeiro" }]
            }
          />
          <FormField label="Data" name="filled_at" type="datetime-local" required />
          <FormField label="Litros" name="liters" type="number" required />
          <CurrencyField label="Valor Pago" name="cost" defaultValue={100} required />
          <FormField label="Posto" name="station" required />
          <FormField
            label="Tipo de combustível"
            name="fuel_type"
            required
            options={[
              { value: "", label: "Selecione" },
              { value: "gasolina", label: "Gasolina" },
              { value: "etanol", label: "Álcool / Etanol" },
              { value: "diesel", label: "Diesel" },
            ]}
          />
          <FormField label="Odômetro" name="mileage_at_fill" type="number" required className="md:col-span-2" />

          <div className="md:col-span-2">
            <MediaUpload
              label="Digitalizar Cupom Fiscal (Foto/Arquivo)"
              value={receiptFile}
              onChange={(file, dataUrl) => {
                setReceiptFile(file);
                setReceiptDataUrl(dataUrl);
              }}
            />
          </div>
        </section>
        <FormActions
          loading={loading}
          submitLabel="Registrar abastecimento"
          onSaveLocal={() => {
            if (formRef.current) {
              writeJson("fleet_fuel_draft", {
                ...Object.fromEntries(new FormData(formRef.current)),
                savedAt: new Date().toISOString(),
              });
              setSuccess("Rascunho salvo localmente.");
            }
          }}
          onSyncNow={async () => {
            await syncNow();
          }}
          syncDisabled={!online}
        />
      </form>
    </AppShell>
  );
}
