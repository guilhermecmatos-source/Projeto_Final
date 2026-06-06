"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ActionButton from "@/components/ui/ActionButton";
import FormModal from "@/components/ui/FormModal";
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
  const [modalOpen, setModalOpen] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptPath, setReceiptPath] = useState<string | null>(null);

  const load = () => {
    fuelApi.list().then((res) => setRecords(Array.isArray(res.data) ? res.data : [])).catch(() => setRecords([])).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    vehiclesApi.list().then((res) => setVehicles(Array.isArray(res.data) ? res.data : [])).catch(() => {});
    driversApi.list().then((res) => setDrivers(Array.isArray(res.data) ? res.data : [])).catch(() => {});
  }, []);

  const kpis = useMemo(() => {
    const totalCost = records.reduce((s, r) => s + Number(r.cost), 0);
    const totalLiters = records.reduce((s, r) => s + Number(r.liters), 0);
    return { totalCost, totalLiters, avgPrice: totalLiters > 0 ? totalCost / totalLiters : 0 };
  }, [records]);

  async function handleScanCoupon(file: File) {
    setScanning(true);
    try {
      setReceiptPreview(URL.createObjectURL(file));
      const res = await uploadsApi.upload(file, "fuel_receipt");
      setReceiptPath((res.data as { path: string }).path);
    } finally {
      setScanning(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fuelApi.create({
        vehicle_id: form.get("vehicle_id"),
        liters: Number(form.get("liters")),
        cost: Number(form.get("cost")),
        mileage_at_fill: Number(form.get("mileage_at_fill")),
        receipt_url: receiptPath,
      });
      const recordId = (res.data as { id?: string })?.id;
      if (recordId && couponRef.current?.files?.[0]) {
        await uploadsApi.upload(couponRef.current.files[0], "fuel_receipt", recordId);
      }
      setModalOpen(false);
      setReceiptPreview(null);
      setReceiptPath(null);
      load();
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
        actions={
          <ActionButton onClick={() => setModalOpen(true)}>
            <Icon name="local_gas_station" />
            Registrar Abastecimento
          </ActionButton>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Faturado", value: formatBRL(kpis.totalCost), icon: "payments", color: "text-green-400" },
          { label: "Total Litragem", value: `${kpis.totalLiters.toLocaleString("pt-BR")} L`, icon: "water_drop", color: "text-primary" },
          { label: "Preço Médio Diesel", value: `${formatBRL(kpis.avgPrice)} /L`, icon: "calculate", color: "text-secondary-container" },
        ].map((s) => (
          <div key={s.label} className="raised-card p-4">
            <Icon name={s.icon} className={`mb-2 text-2xl ${s.color}`} />
            <p className="text-[10px] font-bold uppercase text-on-surface-variant">{s.label}</p>
            <p className="text-headline-md font-bold">{loading ? "—" : s.value}</p>
          </div>
        ))}
      </div>

      <section className="raised-card overflow-hidden">
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
              <div key={r.id} className={`p-4 ${r.suspicious ? "border-l-4 border-error bg-error-container/10" : ""}`}>
                <p className="font-bold uppercase">{formatPlateDisplay(r.vehicle_plate)}</p>
                <p className="text-sm text-on-surface-variant">
                  Odômetro: {r.mileage_at_fill?.toLocaleString("pt-BR") ?? "—"} km • {Number(r.liters).toFixed(0)} L • {formatBRL(Number(r.cost))}
                </p>
                {r.suspicious ? (
                  <p className="mt-2 flex items-center gap-1 text-xs text-error">
                    <Icon name="warning" className="text-sm" /> Divergência detectada no consumo
                  </p>
                ) : (
                  <p className="mt-2 flex items-center gap-1 text-xs text-green-400">
                    <Icon name="check_circle" className="text-sm" /> Verificação de consumo em conformidade média
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo Abastecimento Auditado" subtitle="Registro com cupom fiscal" wide>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <FormField label="Selecionar Trator" name="vehicle_id" required options={[{ value: "", label: "Escolha..." }, ...vehicles.map((v) => ({ value: v.id, label: v.plate }))]} />
          <FormField label="Selecionar Motorista" name="driver_id" options={[{ value: "", label: "Escolha..." }, ...drivers.map((d) => ({ value: d.id, label: d.name }))]} />
          <div className="grid grid-cols-3 gap-2">
            <FormField label="Valor Pago (R$)" name="cost" type="number" defaultValue="1288" required />
            <FormField label="Litros" name="liters" type="number" defaultValue="258" required />
            <FormField label="Odômetro (KM)" name="mileage_at_fill" type="number" defaultValue="125000" required />
          </div>
          <input ref={couponRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleScanCoupon(f); }} />
          <button type="button" disabled={scanning} onClick={() => couponRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-high py-4 text-sm font-semibold">
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
          <button type="submit" disabled={saving} className="btn-primary w-full uppercase">{saving ? "Gravando..." : "Gravar Lançamento Auditado"}</button>
        </form>
      </FormModal>
    </AppShell>
  );
}
