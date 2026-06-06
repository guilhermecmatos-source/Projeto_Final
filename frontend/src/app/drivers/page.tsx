"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import FormField from "@/components/forms/FormField";
import DriverProfilePanel from "@/components/profiles/DriverProfilePanel";
import { driversApi, uploadsApi, vehiclesApi } from "@/services/api";
import OfflineIndicator from "@/components/ui/OfflineIndicator";

interface DriverRow {
  id: string;
  name: string;
  license_number: string;
  vehicle_plate?: string | null;
  cnh_category?: string | null;
  cpf?: string | null;
  rg?: string | null;
  phone?: string | null;
  score: number;
  status?: string | null;
  active: boolean;
  trip_count?: number;
}

export default function DriversPage() {
  const profileInputRef = useRef<HTMLInputElement>(null);
  const cnhInputRef = useRef<HTMLInputElement>(null);
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [vehicles, setVehicles] = useState<{ id: string; plate: string; brand?: string; model?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    driversApi
      .list()
      .then((res) => setDrivers(Array.isArray(res.data) ? res.data : []))
      .catch(() => setDrivers([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    vehiclesApi
      .list()
      .then((res) => setVehicles(Array.isArray(res.data) ? res.data : []))
      .catch(() => setVehicles([]));
  }, [load]);

  const filtered = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.cpf ?? "").includes(search) ||
      d.license_number.includes(search)
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const form = new FormData(e.currentTarget);
    try {
      const res = await driversApi.create({
        name: String(form.get("name")).trim(),
        license_number: String(form.get("license_number")).trim(),
        phone: String(form.get("phone") || "").trim(),
        cpf: String(form.get("cpf") || "").trim(),
        rg: String(form.get("rg") || "").trim(),
        cnh_category: String(form.get("cnh_category") || "").trim(),
        cnh_expiry: String(form.get("cnh_expiry") || "").trim() || undefined,
        vehicle_id: String(form.get("vehicle_id") || "").trim() || undefined,
      });
      const id = (res.data as { id?: string })?.id;
      if (id) setCreatedId(id);
      setMessage("Motorista gravado com sucesso.");
      e.currentTarget.reset();
      load();
    } catch {
      setMessage("Erro ao gravar motorista.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(file: File, type: "driver_profile" | "driver_cnh") {
    if (!createdId) {
      setMessage("Grave o motorista antes de enviar imagens.");
      return;
    }
    try {
      await uploadsApi.upload(file, type, createdId);
      setMessage("Imagem salva com sucesso.");
    } catch {
      setMessage("Falha ao salvar imagem.");
    }
  }

  return (
    <AppShell showOfflineForPilot>
      <PageHeader
        breadcrumb="Motoristas"
        title="Gestão de Motoristas"
        subtitle="Relação de motoristas licenciados, status de viagem e logs de ocorrência."
        actions={
          <span className="rounded-full border border-error/40 bg-error-container/30 px-3 py-1 text-xs font-bold text-error">
            Offline Mode (Mirror Local)
          </span>
        }
      />

      <OfflineIndicator />

      <div className="grid gap-6 lg:grid-cols-12">
        <section className="raised-card border border-primary/20 p-5 lg:col-span-5">
          <h2 className="mb-4 text-label-md font-bold uppercase text-primary">
            Cadastrar Novo Motorista
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <p className="text-label-md uppercase text-on-surface-variant">Dados Pessoais</p>
            <FormField label="Nome Completo" name="name" required />
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="CPF" name="cpf" required />
              <FormField label="RG / Órgão" name="rg" />
            </div>
            <FormField label="Telefone / Canal Rádio" name="phone" />

            <p className="text-label-md uppercase text-on-surface-variant">Foto do Perfil / Documentos</p>
            <input
              ref={profileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadImage(f, "driver_profile");
              }}
            />
            <button
              type="button"
              onClick={() => profileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-secondary-container bg-secondary-container/10 px-4 py-3 text-sm font-semibold text-secondary-container"
            >
              <Icon name="add_a_photo" />
              Adicionar Imagem
            </button>

            <p className="text-label-md uppercase text-on-surface-variant">Segmento CNH</p>
            <FormField label="Cédula CNH" name="license_number" required />
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                label="Categoria"
                name="cnh_category"
                options={[
                  { value: "", label: "Selecione" },
                  { value: "C", label: "C" },
                  { value: "D", label: "D" },
                  { value: "E", label: "E" },
                ]}
              />
              <FormField label="Vencimento da Licença" name="cnh_expiry" type="date" />
            </div>
            <input
              ref={cnhInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadImage(f, "driver_cnh");
              }}
            />
            <button
              type="button"
              onClick={() => cnhInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-secondary-container bg-secondary-container/10 px-4 py-3 text-sm font-semibold text-secondary-container"
            >
              <Icon name="badge" />
              Adicionar Imagem CNH
            </button>

            <p className="text-label-md uppercase text-on-surface-variant">Vincular Cavalo Trator</p>
            <FormField
              label="Veículo"
              name="vehicle_id"
              options={[
                { value: "", label: "Nenhum Veículo Vinculado" },
                ...vehicles.map((v) => ({
                  value: v.id,
                  label: `${v.plate} — ${v.brand ?? ""} ${v.model ?? ""}`.trim(),
                })),
              ]}
            />

            {message && <p className="text-sm text-primary">{message}</p>}

            <button type="submit" disabled={saving} className="btn-primary w-full uppercase">
              {saving ? "Gravando..." : "Gravar Localmente"}
            </button>
          </form>
        </section>

        <section className="raised-card overflow-hidden lg:col-span-7">
          <div className="border-b border-outline-variant p-4">
            <h2 className="text-headline-sm">Motoristas Resguardados</h2>
            <div className="relative mt-3">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filtrar por nome ou CPF..."
                className="input-fleet pl-10"
              />
            </div>
          </div>

          <div className="max-h-[70vh] divide-y divide-outline-variant/30 overflow-y-auto">
            {loading ? (
              <p className="p-8 text-center text-on-surface-variant">Carregando motoristas...</p>
            ) : filtered.length === 0 ? (
              <p className="p-8 text-center text-on-surface-variant">Nenhum motorista cadastrado.</p>
            ) : (
              filtered.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedId(d.id)}
                  className="flex w-full items-start gap-4 px-5 py-4 text-left transition hover:bg-primary/5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-high font-bold text-primary">
                    {d.name.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{d.name}</p>
                    <p className="text-xs text-on-surface-variant">
                      CPF: {d.cpf ?? "—"} | RG: {d.rg ?? "—"} | Tel: {d.phone ?? "—"}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      CNH {d.cnh_category ?? "—"} • {d.license_number}
                    </p>
                    {d.vehicle_plate && (
                      <p className="mt-1 inline-block rounded border border-primary/40 px-2 py-0.5 text-[10px] text-primary">
                        Acoplado: {d.vehicle_plate}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-400">
                      GASTO ATUAL R$ {(Number(d.score) * 74.8).toFixed(2)}
                    </p>
                    <span className="chip-active mt-1">{d.status ?? "EM VIAGEM"}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>
      </div>

      <DriverProfilePanel driverId={selectedId} onClose={() => setSelectedId(null)} />
    </AppShell>
  );
}
