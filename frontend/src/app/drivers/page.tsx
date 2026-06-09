"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ActionButton from "@/components/ui/ActionButton";
import FormModal from "@/components/ui/FormModal";
import FormField from "@/components/forms/FormField";
import DriverProfilePanel from "@/components/profiles/DriverProfilePanel";
import ListPageStates from "@/components/ui/ListPageStates";
import { driversApi, uploadsApi, vehiclesApi } from "@/services/api";
import { extractApiError } from "@/lib/api-errors";
import MediaUpload from "@/components/forms/MediaUpload";

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
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [vehicles, setVehicles] = useState<{ id: string; plate: string; brand?: string; model?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [cnhFile, setCnhFile] = useState<File | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setFetchError(null);
    driversApi
      .list()
      .then((res) => setDrivers(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        setDrivers([]);
        setFetchError(extractApiError(err, "Não foi possível carregar os motoristas."));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    vehiclesApi.list().then((res) => setVehicles(Array.isArray(res.data) ? res.data : [])).catch(() => {});
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
    const cnhCat = String(form.get("cnh_category") || "").trim();
    if (!cnhCat || !["A", "B", "C", "D", "E", "AB", "AC", "AD", "AE"].includes(cnhCat)) {
      setMessage("Selecione uma categoria de CNH válida (A, B, C, D ou E).");
      setSaving(false);
      return;
    }
    try {
      const res = await driversApi.create({
        name: String(form.get("name")).trim(),
        license_number: String(form.get("license_number")).trim(),
        phone: String(form.get("phone") || "").trim(),
        cpf: String(form.get("cpf") || "").trim(),
        rg: String(form.get("rg") || "").trim(),
        cnh_category: cnhCat,
        cnh_expiry: String(form.get("cnh_expiry") || "").trim() || undefined,
        vehicle_id: String(form.get("vehicle_id") || "").trim() || undefined,
      });
      const id = (res.data as { id?: string })?.id;
      if (id) {
        if (profileFile) {
          await uploadsApi.upload(profileFile, "driver_profile", id);
        }
        if (cnhFile) {
          await uploadsApi.upload(cnhFile, "driver_cnh", id);
        }
      }
      setMessage("Motorista gravado com sucesso.");
      setProfileFile(null);
      setCnhFile(null);
      setModalOpen(false);
      load();
    } catch {
      setMessage("Erro ao gravar motorista.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell showOfflineForPilot>
      <PageHeader
        breadcrumb="Motoristas"
        title="Gestão de Motoristas"
        subtitle="Relação de motoristas devidamente licenciados, status de viagem e logs de ocorrência."
        actions={
          <>
            <span className="rounded-full border border-error/40 bg-error-container/30 px-3 py-1 text-xs font-bold text-error">
              Offline Mode (Mirror Local)
            </span>
            <ActionButton onClick={() => { setModalOpen(true); setProfileFile(null); setCnhFile(null); setMessage(""); }}>
              <Icon name="person_add" />
              Novo Motorista
            </ActionButton>
          </>
        }
      />

      <section className="raised-card overflow-hidden">
        <div className="border-b border-outline-variant p-4">
          <h2 className="text-headline-sm">Motoristas Resguardados</h2>
          <div className="relative mt-3 max-w-md">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar por nome ou CPF..."
              className="input-fleet pl-10"
            />
          </div>
        </div>
        <ListPageStates
          loading={loading}
          error={fetchError}
          isEmpty={filtered.length === 0}
          onRetry={load}
          loadingMessage="Carregando motoristas..."
          emptyTitle={search ? "Nenhum motorista encontrado" : "Nenhum motorista cadastrado"}
          emptyDescription={search ? "Tente outro termo de busca." : "Cadastre o primeiro motorista licenciado."}
          emptyIcon="person"
          emptyAction={
            !search ? (
              <ActionButton onClick={() => { setModalOpen(true); setProfileFile(null); setCnhFile(null); setMessage(""); }}>
                <Icon name="person_add" />
                Novo Motorista
              </ActionButton>
            ) : undefined
          }
        >
          <div className="divide-y divide-outline-variant/30">
            {filtered.map((d) => (
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
                  <p className="text-xs text-on-surface-variant">CNH {d.cnh_category ?? "—"} • {d.license_number}</p>
                  {d.vehicle_plate && (
                    <p className="mt-1 inline-block rounded border border-primary/40 px-2 py-0.5 text-[10px] text-primary">
                      Acoplado: {d.vehicle_plate}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-400">GASTO ATUAL R$ {(Number(d.score) * 74.8).toFixed(2)}</p>
                  <span className="chip-active mt-1">{d.status ?? "EM VIAGEM"}</span>
                </div>
              </button>
            ))}
          </div>
        </ListPageStates>
      </section>

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Cadastrar Novo Motorista"
        subtitle="Dados pessoais, CNH e veículo vinculado"
        wide
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <p className="fleet-section-title">Dados Pessoais</p>
          <FormField label="Nome Completo" name="name" required />
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="CPF" name="cpf" required />
            <FormField label="RG / Órgão" name="rg" />
          </div>
          <FormField label="Telefone / Canal Rádio" name="phone" />
          <MediaUpload
            label="Adicionar Imagem de Perfil"
            value={profileFile}
            onChange={(file) => setProfileFile(file)}
          />

          <p className="fleet-section-title">Segmento CNH</p>
          <FormField label="Cédula CNH" name="license_number" required />
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              label="Categoria"
              name="cnh_category"
              required
              options={[
                { value: "", label: "Selecione" },
                { value: "A", label: "A" },
                { value: "B", label: "B" },
                { value: "C", label: "C" },
                { value: "D", label: "D" },
                { value: "E", label: "E" },
                { value: "AB", label: "AB" },
                { value: "AC", label: "AC" },
                { value: "AD", label: "AD" },
                { value: "AE", label: "AE" }
              ]}
            />
            <FormField label="Vencimento da Licença" name="cnh_expiry" type="date" />
          </div>
          <MediaUpload
            label="Adicionar Imagem CNH"
            value={cnhFile}
            onChange={(file) => setCnhFile(file)}
          />

          <p className="fleet-section-title">Vincular Cavalo Trator</p>
          <FormField
            label="Veículo"
            name="vehicle_id"
            options={[{ value: "", label: "Nenhum Veículo Vinculado" }, ...vehicles.map((v) => ({ value: v.id, label: `${v.plate} — ${v.brand ?? ""} ${v.model ?? ""}`.trim() }))]}
          />
          {message && <p className="text-sm text-primary">{message}</p>}
          <button type="submit" disabled={saving} className="btn-primary w-full uppercase">
            {saving ? "Gravando..." : "Gravar Localmente"}
          </button>
        </form>
      </FormModal>

      <DriverProfilePanel driverId={selectedId} onClose={() => setSelectedId(null)} />
    </AppShell>
  );
}
