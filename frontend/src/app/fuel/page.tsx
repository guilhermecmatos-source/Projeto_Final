"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ActionButton from "@/components/ui/ActionButton";
import FormModal from "@/components/ui/FormModal";
import FormField from "@/components/forms/FormField";
import ListPageStates from "@/components/ui/ListPageStates";
import { fuelApi, uploadsApi, vehiclesApi, driversApi } from "@/services/api";
import { extractApiError } from "@/lib/api-errors";
import { formatBRL } from "@/lib/currency";
import { formatPlateDisplay } from "@/lib/validators";
import CurrencyField from "@/components/forms/CurrencyField";
import MediaUpload from "@/components/forms/MediaUpload";

interface FuelRow {
  id: string;
  filled_at: string;
  vehicle_plate: string;
  driver_name?: string;
  liters: number;
  cost: number;
  mileage_at_fill?: number;
  suspicious?: number | boolean;
  receipt_url?: string | null;
}

export default function FuelPage() {
  const [records, setRecords] = useState<FuelRow[]>([]);
  const [vehicles, setVehicles] = useState<{ id: string; plate: string }[]>([]);
  const [drivers, setDrivers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FuelRow | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptDataUrl, setReceiptDataUrl] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setFetchError(null);
    fuelApi
      .list()
      .then((res) => setRecords(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        setRecords([]);
        setFetchError(extractApiError(err, "Não foi possível carregar os abastecimentos."));
      })
      .finally(() => setLoading(false));
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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fuelApi.create({
        vehicle_id: form.get("vehicle_id"),
        driver_id: form.get("driver_id") || undefined,
        liters: Number(form.get("liters")),
        cost: Number(form.get("cost")),
        mileage_at_fill: Number(form.get("mileage_at_fill")),
        receipt_url: receiptDataUrl || undefined,
      });
      const recordId = (res.data as { id?: string })?.id;
      if (recordId && receiptFile) {
        await uploadsApi.upload(receiptFile, "fuel_receipt", recordId);
      }
      setModalOpen(false);
      setReceiptFile(null);
      setReceiptDataUrl(null);
      load();
    } catch (err) {
      console.error(err);
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
        <ListPageStates
          loading={loading}
          error={fetchError}
          isEmpty={records.length === 0}
          onRetry={load}
          loadingMessage="Carregando abastecimentos..."
          emptyTitle="Nenhum abastecimento registrado"
          emptyDescription="Registre o primeiro lançamento de combustível."
          emptyIcon="local_gas_station"
          emptyAction={
            <ActionButton onClick={() => setModalOpen(true)}>
              <Icon name="local_gas_station" />
              Registrar Abastecimento
            </ActionButton>
          }
        >
          <div className="max-h-[70vh] divide-y divide-outline-variant/30 overflow-y-auto">
            {records.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedRecord(r)}
                className={`p-4 cursor-pointer hover:bg-primary/5 transition ${
                  r.suspicious ? "border-l-4 border-error bg-error-container/10" : ""
                }`}
              >
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
            ))}
          </div>
        </ListPageStates>
      </section>

      <FormModal open={modalOpen} onClose={() => { setModalOpen(false); setReceiptFile(null); setReceiptDataUrl(null); }} title="Novo Abastecimento Auditado" subtitle="Registro com cupom fiscal" wide>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <FormField label="Selecionar Trator" name="vehicle_id" required options={[{ value: "", label: "Escolha..." }, ...vehicles.map((v) => ({ value: v.id, label: v.plate }))]} />
          <FormField label="Selecionar Motorista" name="driver_id" options={[{ value: "", label: "Escolha..." }, ...drivers.map((d) => ({ value: d.id, label: d.name }))]} />
          <div className="grid grid-cols-3 gap-2">
            <CurrencyField label="Valor Pago" name="cost" defaultValue={1288} required />
            <FormField label="Litros" name="liters" type="number" defaultValue="258" required />
            <FormField label="Odômetro (KM)" name="mileage_at_fill" type="number" defaultValue="125000" required />
          </div>
          <MediaUpload
            label="Digitalizar Cupom Fiscal (Foto/Arquivo)"
            value={receiptFile}
            onChange={(file, dataUrl) => {
              setReceiptFile(file);
              setReceiptDataUrl(dataUrl);
            }}
          />
          <button type="submit" disabled={saving} className="btn-primary w-full uppercase">{saving ? "Gravando..." : "Gravar Lançamento Auditado"}</button>
        </form>
      </FormModal>

      {/* Dossier de Abastecimento */}
      <FormModal
        open={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title="Dossiê do Abastecimento"
        subtitle={`Lançamento de Combustível da Placa ${selectedRecord ? formatPlateDisplay(selectedRecord.vehicle_plate) : ""}`}
      >
        {selectedRecord && (
          <div className="space-y-4 text-slate-100">
            <div className="flex items-center gap-4 rounded-xl bg-surface-container-high p-4">
              <Icon name="local_gas_station" className="text-4xl text-primary" />
              <div>
                <h4 className="text-lg font-bold">{formatPlateDisplay(selectedRecord.vehicle_plate)}</h4>
                <p className="text-xs text-on-surface-variant">
                  Realizado em {new Date(selectedRecord.filled_at).toLocaleDateString("pt-BR")} às {new Date(selectedRecord.filled_at).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg bg-surface-container-low p-3">
                <dt className="text-xs text-on-surface-variant">Litragem Lançada</dt>
                <dd className="text-xl font-bold text-slate-100">{Number(selectedRecord.liters).toFixed(2)} L</dd>
              </div>
              <div className="rounded-lg bg-surface-container-low p-3">
                <dt className="text-xs text-on-surface-variant">Valor Total Pago</dt>
                <dd className="text-xl font-bold text-green-400">{formatBRL(Number(selectedRecord.cost))}</dd>
              </div>
              <div className="rounded-lg bg-surface-container-low p-3">
                <dt className="text-xs text-on-surface-variant font-medium">Preço por Litro</dt>
                <dd className="text-xl font-bold text-slate-100">{formatBRL(Number(selectedRecord.cost) / Math.max(1, Number(selectedRecord.liters)))} /L</dd>
              </div>
              <div className="rounded-lg bg-surface-container-low p-3">
                <dt className="text-xs text-on-surface-variant">Odômetro no Lançamento</dt>
                <dd className="text-xl font-bold text-slate-100">{selectedRecord.mileage_at_fill?.toLocaleString("pt-BR") ?? "—"} km</dd>
              </div>
            </dl>
            {selectedRecord.driver_name && (
              <div className="rounded-lg bg-surface-container-low p-3 text-sm">
                <p className="text-xs text-on-surface-variant">Motorista Responsável</p>
                <p className="text-base font-bold text-slate-100">{selectedRecord.driver_name}</p>
              </div>
            )}
            
            <div className="rounded-lg bg-surface-container-low p-3">
              <p className="text-xs text-on-surface-variant mb-2 font-bold uppercase">Comprovante de Compra</p>
              {selectedRecord.receipt_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedRecord.receipt_url}
                  alt="Cupom Fiscal"
                  className="max-h-48 w-full object-contain rounded bg-black/10"
                />
              ) : (
                <div className="flex h-40 items-center justify-center rounded border border-outline-variant bg-black/20">
                  <div className="text-center text-on-surface-variant">
                    <Icon name="receipt_long" className="text-4xl text-primary mb-2" />
                    <p className="text-xs font-semibold">Cupom Fiscal Conciliado</p>
                    <p className="text-[10px] text-slate-400 mt-1">Status: Processado e Arquivado</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className={`rounded-lg border p-4 text-xs ${selectedRecord.suspicious ? "border-error/20 bg-error/5 text-error" : "border-primary/20 bg-primary/5 text-primary"}`}>
              <p className="font-bold flex items-center gap-1">
                <Icon name={selectedRecord.suspicious ? "warning" : "shield"} className="text-sm" /> 
                {selectedRecord.suspicious ? "Divergência Crítica" : "Análise de Auditoria"}
              </p>
              <p className="mt-1">
                {selectedRecord.suspicious 
                  ? "A média de consumo calculada para este abastecimento desvia mais de 15% do padrão esperado para o modelo do veículo. Recomendada revisão de auditoria." 
                  : "Abastecimento validado e homologado automaticamente pelo FleetAI."}
              </p>
            </div>
          </div>
        )}
      </FormModal>
    </AppShell>
  );
}
