"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ActionButton from "@/components/ui/ActionButton";
import FormModal from "@/components/ui/FormModal";
import ListPageStates from "@/components/ui/ListPageStates";
import ActionLink from "@/components/ui/ActionLink";
import { vehiclesApi } from "@/services/api";
import { extractApiError } from "@/lib/api-errors";
import { formatPlateDisplay } from "@/lib/validators";

interface VehicleRow {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year?: number;
  status: string;
  mileage: number;
  avg_consumption?: number | null;
  autonomy_km?: number | null;
  photo_url?: string | null;
}

const TABS = ["TODOS", "DISPONÍVEL", "EM MANUTENÇÃO", "INATIVO"] as const;
const TAB_MAP: Record<string, string | null> = {
  TODOS: null,
  DISPONÍVEL: "active",
  "EM MANUTENÇÃO": "maintenance",
  INATIVO: "inactive",
};

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  active: { label: "DISPONÍVEL", cls: "chip-active" },
  maintenance: { label: "EM MANUTENÇÃO", cls: "chip-warning" },
  inactive: { label: "INATIVO", cls: "chip-pending" },
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("TODOS");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setFetchError(null);
    vehiclesApi
      .list()
      .then((res) => setVehicles(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        setVehicles([]);
        setFetchError(extractApiError(err, "Não foi possível carregar o inventário de veículos."));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => ({
    total: vehicles.length,
    active: vehicles.filter((v) => v.status === "active").length,
    maintenance: vehicles.filter((v) => v.status === "maintenance").length,
    inactive: vehicles.filter((v) => v.status === "inactive").length,
  }), [vehicles]);

  const filtered = vehicles.filter((v) => {
    const st = TAB_MAP[activeTab];
    return !st || v.status === st;
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const form = new FormData(e.currentTarget);
    try {
      await vehiclesApi.create({
        plate: String(form.get("plate")),
        brand: String(form.get("brand")),
        model: String(form.get("model")),
        year: Number(form.get("year")),
        mileage: Number(form.get("mileage")),
        avg_consumption: Number(form.get("avg_consumption")),
      });
      setMessage("Veículo vinculado.");
      e.currentTarget.reset();
      setModalOpen(false);
      load();
    } catch {
      setMessage("Erro ao cadastrar veículo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        breadcrumb="Fleet"
        title="Inventário de Frota"
        subtitle="Gestão de cavalos mecânicos, caminhões e utilitários da operadora."
        actions={
          <ActionButton onClick={() => setModalOpen(true)}>
            <Icon name="add" />
            Cadastrar Veículo
          </ActionButton>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Veículos", value: stats.total, color: "text-on-surface" },
          { label: "Disponíveis", value: stats.active, color: "text-green-400" },
          { label: "Em Manutenção", value: stats.maintenance, color: "text-primary" },
          { label: "Inativos", value: stats.inactive, color: "text-on-surface-variant" },
        ].map((s) => (
          <div key={s.label} className="raised-card p-4">
            <p className="text-[10px] font-bold uppercase text-on-surface-variant">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{loading ? "—" : s.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex gap-4 border-b border-outline-variant">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-[10px] font-bold uppercase tracking-wider ${
              activeTab === tab ? "border-b-2 border-primary text-primary" : "text-on-surface-variant"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <ListPageStates
        loading={loading}
        error={fetchError}
        isEmpty={filtered.length === 0}
        onRetry={load}
        loadingMessage="Carregando frota..."
        emptyTitle="Nenhum veículo nesta categoria"
        emptyDescription="Cadastre um veículo ou altere o filtro de status."
        emptyIcon="directions_car"
        emptyAction={
          <ActionLink href="/vehicles/register">
            <Icon name="add" />
            Cadastrar Veículo
          </ActionLink>
        }
        className="col-span-full"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((v) => {
            const st = STATUS_STYLE[v.status] ?? STATUS_STYLE.active;
            return (
              <article key={v.id} className="raised-card overflow-hidden">
                <div className="flex items-start justify-between border-b border-outline-variant p-3">
                  <div>
                    <p className="text-xs font-bold uppercase">{v.brand}</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{v.model}</p>
                  </div>
                  <span className={st.cls}>{st.label}</span>
                </div>
                <div className="flex h-32 items-center justify-center bg-surface-container-high">
                  {v.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.photo_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-center text-on-surface-variant">
                      <Icon name="local_shipping" className="text-4xl opacity-40" />
                      <p className="mt-1 text-[10px] uppercase">Sem Foto Cadastrada</p>
                    </div>
                  )}
                </div>
                <div className="space-y-1 p-3 text-xs">
                  <p><span className="text-on-surface-variant">PLACA:</span> <strong className="text-slate-900 dark:text-slate-100">{formatPlateDisplay(v.plate)}</strong></p>
                  <p><span className="text-on-surface-variant">QUILOMETRAGEM:</span> {Number(v.mileage).toLocaleString("pt-BR")} km</p>
                  <p><span className="text-on-surface-variant">DIESEL CONSUMO:</span> {v.avg_consumption ? `${Number(v.avg_consumption).toFixed(1)} Km/L` : "—"}</p>
                </div>
                {v.status === "active" && (
                  <div className="border-t border-outline-variant p-3">
                    <a
                      href={`/travels/ruv?vehicleId=${v.id}`}
                      className="btn-primary flex items-center justify-center gap-1 text-center py-2 text-[10px] font-bold uppercase tracking-wider w-full"
                    >
                      <Icon name="assignment" />
                      Requisitar
                    </a>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </ListPageStates>

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo Acoplado / Trator"
        subtitle="Cadastro de veículo operacional"
      >
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">Placa do Veículo</label>
            <input className="input-fleet" name="plate" placeholder="EX: ABC-1234" required />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">Marca / Fabricante</label>
            <input className="input-fleet" name="brand" placeholder="Ex: Mercedes-Benz" required />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">Modelo Comercial</label>
            <input className="input-fleet" name="model" placeholder="Ex: Atego 2426" required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">Ano Fabricação</label>
              <input className="input-fleet" name="year" type="number" defaultValue="2022" required />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">Odômetro (KM)</label>
              <input className="input-fleet" name="mileage" type="number" defaultValue="100000" required />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">Consumo Médio (KM/L)</label>
            <input className="input-fleet" name="avg_consumption" type="number" step="0.1" defaultValue="4" />
          </div>
          {message && <p className="text-sm text-primary">{message}</p>}
          <button type="submit" disabled={saving} className="btn-primary w-full uppercase">
            {saving ? "Salvando..." : "Vincular Veículo"}
          </button>
        </form>
      </FormModal>
    </AppShell>
  );
}
