"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import FormField from "@/components/forms/FormField";
import Icon from "@/components/ui/Icon";
import { driversApi } from "@/services/api";
import {
  addToSyncQueue,
  formatSavedAt,
  getDriverDraft,
  isOnline,
  saveDriverDraft,
} from "@/lib/offline";
import { useOffline } from "@/hooks/useOffline";

const DEPARTURE_CHECKLIST = [
  "Pneus calibrados",
  "Nível de óleo OK",
  "Documentação no veículo",
  "Extintor válido",
  "Kit primeiros socorros",
];

const ARRIVAL_CHECKLIST = [
  "Veículo limpo",
  "Sem avarias novas",
  "Combustível registrado",
  "Quilometragem anotada",
  "Relatório de rota preenchido",
];

function formToObject(form: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  form.forEach((value, key) => {
    if (obj[key]) {
      const prev = obj[key];
      obj[key] = Array.isArray(prev) ? [...prev, value] : [prev, value];
    } else {
      obj[key] = value;
    }
  });
  return obj;
}

export default function DriverRegisterPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const { online, pendingCount, syncNow } = useOffline();

  useEffect(() => {
    const draft = getDriverDraft();
    if (draft?.savedAt) setLastSaved(draft.savedAt as string);
  }, []);

  async function submitToApi(form: FormData) {
    await driversApi.create({
      name: form.get("name"),
      license_number: form.get("license_number"),
      phone: form.get("phone") || "",
    });
  }

  function handleSaveLocal() {
    if (!formRef.current) return;
    const savedAt = saveDriverDraft(formToObject(new FormData(formRef.current)));
    setLastSaved(savedAt);
    setSuccess("Dados salvos localmente.");
    setError("");
  }

  async function handleSyncNow() {
    if (!isOnline()) {
      setError("Sem conexão. Aguarde voltar online para sincronizar.");
      return;
    }
    const ok = await syncNow();
    if (ok) setSuccess("Sincronização concluída.");
  }

  function handleExportPdf() {
    window.print();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      if (isOnline()) {
        await submitToApi(form);
        setSuccess("Motorista cadastrado e sincronizado.");
        setTimeout(() => router.push("/drivers"), 1000);
      } else {
        saveDriverDraft(formToObject(form));
        addToSyncQueue({ type: "driver", payload: formToObject(form) });
        setLastSaved(new Date().toISOString());
        setSuccess("Salvo offline. Será sincronizado quando houver conexão.");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Não foi possível salvar. Dados guardados localmente.";
      saveDriverDraft(formToObject(form));
      addToSyncQueue({ type: "driver", payload: formToObject(form) });
      setLastSaved(new Date().toISOString());
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell headerTitle="Novo Motorista" showOfflineForPilot>
      <Link
        href="/drivers"
        className="mb-6 inline-flex items-center gap-1 text-label-md text-primary hover:underline"
      >
        <Icon name="arrow_back" className="text-base" />
        Voltar
      </Link>

      <h1 className="mb-2 text-headline-lg">Cadastro de Novo Motorista</h1>
      <p className="mb-4 text-body-md text-on-surface-variant">
        Formulário completo para pilotos — suporta modo offline e sincronização.
      </p>

      {lastSaved && (
        <p className="mb-4 flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2 text-sm">
          <Icon name="save" className="text-primary" />
          <span>
            <strong>Última alteração salva localmente:</strong> {formatSavedAt(lastSaved)}
          </span>
        </p>
      )}

      {!online && (
        <p className="mb-4 rounded-lg border border-orange-300 bg-orange-50 px-4 py-2 text-sm text-orange-900">
          Modo offline ativo para motoristas (pilotos). Alterações ficam na fila de sincronização
          {pendingCount > 0 && ` (${pendingCount} pendente(s))`}.
        </p>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-error bg-error-container/20 px-4 py-3 text-body-md text-error">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border border-primary bg-primary-container/10 px-4 py-3 text-body-md text-primary">
          {success}
        </div>
      )}

      <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
        <section className="raised-card p-4 sm:p-6">
          <h2 className="mb-4 text-headline-sm">Dados pessoais</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Nome completo" name="name" required className="md:col-span-2" />
            <FormField label="CPF" name="cpf" placeholder="000.000.000-00" required />
            <FormField label="RG" name="rg" required />
            <FormField label="Órgão emissor" name="rg_issuer" placeholder="SSP/SP" required />
            <FormField label="Telefone" name="phone" placeholder="(11) 99999-9999" required />
          </div>
        </section>

        <section className="raised-card p-4 sm:p-6">
          <h2 className="mb-4 text-headline-sm">CNH</h2>
          <FormField label="Número da carteira de motorista" name="license_number" required />
        </section>

        <section className="raised-card p-4 sm:p-6">
          <h2 className="mb-4 text-headline-sm">Veículo vinculado</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Placa" name="vehicle_plate" placeholder="ABC-1234" />
            <FormField label="Modelo" name="vehicle_model" placeholder="Toyota Hilux" />
            <FormField label="Data da inspeção" name="inspection_date" type="date" className="md:col-span-2" />
          </div>
        </section>

        <section className="raised-card p-4 sm:p-6">
          <h2 className="mb-4 text-headline-sm">Checklist de saída</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {DEPARTURE_CHECKLIST.map((item, i) => (
              <FormField key={item} label={item} name={`departure_${i}`} as="checkbox" />
            ))}
          </div>
        </section>

        <section className="raised-card p-4 sm:p-6">
          <h2 className="mb-4 text-headline-sm">Checklist de chegada</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {ARRIVAL_CHECKLIST.map((item, i) => (
              <FormField key={item} label={item} name={`arrival_${i}`} as="checkbox" />
            ))}
          </div>
        </section>

        <section className="raised-card p-4 sm:p-6">
          <h2 className="mb-4 text-headline-sm">Gastos e manutenção</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Gasto registrado (R$)" name="expense_amount" type="number" placeholder="0,00" />
            <FormField label="Tipo" name="expense_type" options={[
              { value: "", label: "Selecione" },
              { value: "fuel", label: "Combustível" },
              { value: "maintenance", label: "Manutenção" },
              { value: "toll", label: "Pedágio" },
              { value: "other", label: "Outros" },
            ]} />
            <FormField label="Observações" name="expense_notes" as="textarea" className="md:col-span-2" />
          </div>
        </section>

        <section className="raised-card p-4 sm:p-6">
          <h2 className="mb-4 text-headline-sm">Ocorrências e danos</h2>
          <FormField
            label="Descrição detalhada"
            name="incident_description"
            as="textarea"
            rows={6}
            placeholder="Descreva ocorrências, danos, local, horário e testemunhas..."
          />
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button type="submit" disabled={loading} className="btn-primary">
            <Icon name="save" />
            {loading ? "Salvando..." : "Salvar e enviar"}
          </button>
          <button type="button" onClick={handleExportPdf} className="btn-secondary">
            <Icon name="picture_as_pdf" />
            Exportar PDF
          </button>
          <button type="button" onClick={handleSaveLocal} className="rounded-lg border border-outline-variant px-6 py-3 font-semibold hover:bg-surface-container-low">
            <Icon name="download" className="mr-1 inline" />
            Salvar localmente
          </button>
          <button
            type="button"
            onClick={handleSyncNow}
            disabled={!online}
            className="rounded-lg border border-primary px-6 py-3 font-semibold text-primary hover:bg-primary-container/10 disabled:opacity-50"
          >
            <Icon name="sync" className="mr-1 inline" />
            Sincronizar agora
          </button>
        </div>
      </form>
    </AppShell>
  );
}
