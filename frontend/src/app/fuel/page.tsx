"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import FormField from "@/components/forms/FormField";
import { fuelApi, uploadsApi, vehiclesApi, driversApi } from "@/services/api";
import { formatBRL } from "@/lib/currency";
import { formatPlateDisplay } from "@/lib/validators";

interface FuelRow {
  id: string;
  filled_at: string;
  vehicle_plate: string;
  driver_name?: string;
  liters: number;
  cost: number;
  mileage_at_fill?: number;
  station?: string;
  suspicious?: number | boolean;
}

export default function FuelPage() {
  const couponRef = useRef<HTMLInputElement>(null);
  const [records, setRecords] = useState<FuelRow[]>([]);
  const [vehicles, setVehicles] = useState<{ id: string; plate: string }[]>([]);
  const [drivers, setDrivers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptPath, setReceiptPath] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fuelApi
      .list()
      .then((res) => setRecords(Array.isArray(res.data) ? res.data : []))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
    vehiclesApi.list().then((res) => setVehicles(Array.isArray(res.data) ? res.data : [])).catch(() => {});
    driversApi.list().then((res) => setDrivers(Array.isArray(res.data) ? res.data : [])).catch(() => {});
  }, []);

  const kpis = useMemo(() => {
    const totalCost = records.reduce((s, r) => s + Number(r.cost), 0);
    const totalLiters = records.reduce((s, r) => s + Number(r.liters), 0);
    const avgPrice = totalLiters > 0 ? totalCost / totalLiters : 0;
    return { totalCost, totalLiters, avgPrice };
  }, [records]);

  async function handleScanCoupon(file: File) {
    setScanning(true);
    setMessage("");
    try {
      setReceiptPreview(URL.createObjectURL(file));
      const res = await uploadsApi.upload(file, "fuel_receipt");
      setReceiptPath((res.data as { path: string }).path);
      setMessage("Cupom salvo com sucesso.");
    } catch {
      setMessage("Falha ao salvar cupom.");
    } finally {
      setScanning(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fuelApi.create({
        vehicle_id: form.get("vehicle_id"),
        liters: Number(form.get("liters")),
        cost: Number(form.get("cost")),
        mileage_at_fill: Number(form.get("mileage_at_fill")),
        station: form.get("station") || "",
        receipt_url: receiptPath,
      });
      const recordId = (res.data as { id?: string })?.id;
      if (recordId && couponRef.current?.files?.[0]) {
        await uploadsApi.upload(couponRef.current.files[0], "fuel_receipt", recordId);
      }
      setMessage("Abastecimento gravado.");
      e.currentTarget.reset();
      setReceiptPreview(null);
      setReceiptPath(null);
      const list = await fuelApi.list();
      setRecords(Array.isArray(list.data) ? list.data : []);
    } catch {
      setMessage("Erro ao gravar abastecimento.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        breadcrumb="Supplies"
        title="Controle de Abastecimentos"
        subtitle="Lançamentos de diesel, conciliação do odômetro e verificação inteligente de divergência."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Faturado", value: formatBRL(kpis.totalCost), icon: "payments", color: "text-green-400" },
          { label: "Total Litragem", value: `${kpis.totalLiters.toLocaleString("pt-BR")} L`, icon: "water_drop", color: "text-primary" },
          { label: "Preço Médio Diesel", value: `${formatBRL(kpis.avgPrice)} /L`, icon: "calculate", color: "text-secondary-container" },
        ].map((s) => (
          <div key={s.label} className="raised-card p-4">
            <Icon name={s.icon} className={`mb-2 text-2xl ${s.color}`} />
            <p className="text-label-md uppercase text-on-surface-variant">{s.label}</p>
            <p className="text-headline-md font-bold">{loading ? "—" : s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <section className="raised-card p-5 lg:col-span-5">
          <h2 className="mb-4 text-label-md font-bold uppercase text-primary">Novo Abastecimento Auditado</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormField
              label="Selecionar Trator"
              name="vehicle_id"
              required
              options={[{ value: "", label: "Escolha..." }, ...vehicles.map((v) => ({ value: v.id, label: v.plate }))]}
            />
            <FormField
              label="Selecionar Motorista"
              name="driver_id"
              options={[{ value: "", label: "Escolha..." }, ...drivers.map((d) => ({ value: d.id, label: d.name }))]}
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <FormField label="Valor Pago (R$)" name="cost" type="number" defaultValue="1288" required />
              <FormField label="Litros" name="liters" type="number" defaultValue="258" required />
              <FormField label="Odômetro (KM)" name="mileage_at_fill" type="number" defaultValue="125000" required />
            </div>

            <input
              ref={couponRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleScanCoupon(file);
              }}
            />
            <button
              type="button"
              disabled={scanning}
              onClick={() => couponRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-high px-4 py-4 text-sm font-semibold"
            >
              <Icon name="photo_camera" className="text-xl" />
              {scanning ? "Salvando cupom..." : "Escanear Cupom"}
            </button>
            {receiptPreview && (
              <div className="overflow-hidden rounded-lg border border-outline-variant">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={receiptPreview} alt="Cupom" className="max-h-40 w-full object-contain" />
                {receiptPath && <p className="px-3 py-2 text-xs text-green-400">✓ Imagem salva no servidor</p>}
              </div>
            )}

            {message && <p className="text-sm text-primary">{message}</p>}

            <button type="submit" disabled={saving} className="btn-primary w-full uppercase">
              {saving ? "Gravando..." : "Gravar Lançamento Auditado"}
            </button>
          </form>
        </section>

        <section className="raised-card overflow-hidden lg:col-span-7">
          <div className="border-b border-outline-variant p-4">
            <h2 className="text-headline-sm">Abastecimentos Lançados</h2>
          </div>
          <div className="max-h-[70vh] divide-y divide-outline-variant/30 overflow-y-auto">
            {loading ? (
              <p className="p-8 text-center text-on-surface-variant">Carregando...</p>
            ) : records.length === 0 ? (
              <p className="p-8 text-center text-on-surface-variant">Nenhum abastecimento registrado.</p>
            ) : (
              records.map((r) => (
                <div
                  key={r.id}
                  className={`p-4 ${r.suspicious ? "border-l-4 border-error bg-error-container/10" : ""}`}
                >
                  <p className="font-bold uppercase">
                    {formatPlateDisplay(r.vehicle_plate)}
                    {r.driver_name && <span className="ml-2 text-sm font-normal text-on-surface-variant">• {r.driver_name}</span>}
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    Odômetro: {r.mileage_at_fill?.toLocaleString("pt-BR") ?? "—"} km •{" "}
                    {Number(r.liters).toFixed(0)} L • {formatBRL(Number(r.cost))} •{" "}
                    {new Date(r.filled_at).toLocaleDateString("pt-BR")}
                  </p>
                  {r.suspicious ? (
                    <p className="mt-2 flex items-center gap-1 text-xs text-error">
                      <Icon name="warning" className="text-sm" />
                      Divergência detectada no consumo (+23% consumo esperado)
                    </p>
                  ) : (
                    <p className="mt-2 flex items-center gap-1 text-xs text-green-400">
                      <Icon name="check_circle" className="text-sm" />
                      Verificação de consumo em conformidade média
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
