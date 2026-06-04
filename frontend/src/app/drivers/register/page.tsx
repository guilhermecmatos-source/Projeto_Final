"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import FormField from "@/components/forms/FormField";
import FileUploadField from "@/components/forms/FileUploadField";
import CurrencyField from "@/components/forms/CurrencyField";
import FormActions from "@/components/forms/FormActions";
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

function apiErrorMessage(err: unknown): string {
  const ax = err as { response?: { status?: number; data?: { error?: string } }; message?: string };
  if (ax.response?.status === 401) {
    return "Sessão expirada. Faça login novamente.";
  }
  if (ax.response?.status === 403) {
    return "Sem permissão para cadastrar motoristas. Use perfil admin ou atendente.";
  }
  return ax.response?.data?.error || ax.message || "Erro ao comunicar com o servidor.";
}

export default function DriverRegisterPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [createdDriverId, setCreatedDriverId] = useState<string | null>(null);
  const { online, pendingCount, syncing, syncNow } = useOffline();

  useEffect(() => {
    const draft = getDriverDraft();
    if (draft?.savedAt) setLastSaved(draft.savedAt as string);
  }, []);

  async function submitToApi(form: FormData) {
    const name = String(form.get("name") || "").trim();
    const license_number = String(form.get("license_number") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    if (!name || !license_number) {
      throw { response: { data: { error: "Nome e número da CNH são obrigatórios." } } };
    }
    const res = await driversApi.create({ name, license_number, phone });
    const id = (res.data as { id?: string })?.id;
    if (id) setCreatedDriverId(id);
    return res;
  }

  function handleSaveLocal() {
    if (!formRef.current) return;
    const savedAt = saveDriverDraft(formToObject(new FormData(formRef.current)));
    setLastSaved(savedAt);
    setSuccess("Dados salvos localmente.");
    setError("");
  }

  async function handleSyncNow() {
    setError("");
    setSuccess("");
    const result = await syncNow();
    if (result.ok) {
      setSuccess(result.message);
    } else {
      setError(result.message);
    }
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
    const draft = formToObject(form);

    try {
      if (isOnline()) {
        await submitToApi(form);
        setSuccess("Motorista cadastrado com sucesso.");
        setTimeout(() => router.push("/drivers"), 1000);
      } else {
        saveDriverDraft(draft);
        addToSyncQueue({
          type: "driver",
          payload: {
            name: draft.name,
            license_number: draft.license_number,
            phone: draft.phone || "",
          },
        });
        setLastSaved(new Date().toISOString());
        setSuccess("Salvo offline. Será sincronizado quando houver conexão.");
      }
    } catch (err: unknown) {
      const msg = apiErrorMessage(err);
      saveDriverDraft(draft);
      addToSyncQueue({
        type: "driver",
        payload: {
          name: draft.name,
          license_number: draft.license_number,
          phone: draft.phone || "",
        },
      });
      setLastSaved(new Date().toISOString());
      setError(`${msg} Rascunho guardado localmente para nova tentativa.`);
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
            <FormField label="CPF" name="cpf" placeholder="000.000.000-00" />
            <FormField label="RG" name="rg" />
            <FormField label="Órgão emissor" name="rg_issuer" placeholder="SSP/SP" />
            <FormField label="Telefone" name="phone" placeholder="(11) 99999-9999" />
          </div>
        </section>

        <section className="raised-card p-4 sm:p-6">
          <h2 className="mb-4 text-headline-sm">CNH</h2>
          <FormField label="Número da carteira de motorista" name="license_number" required />
          <div className="mt-4">
            <FileUploadField
              label="Upload CNH (imagem ou PDF)"
              storageKey="fleet_driver_cnh_files"
              accept="image/*,.pdf"
              multiple={false}
              hint="JPG, PNG ou PDF até 10MB — preview imediato"
              uploadToServer={!!createdDriverId}
              entityType="driver_cnh"
              entityId={createdDriverId ?? undefined}
            />
          </div>
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
          <h2 className="mb-4 text-headline-sm">Gastos e manutenção</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <CurrencyField label="Gasto registrado (R$)" name="expense_amount" />
            <FormField
              label="Tipo"
              name="expense_type"
              options={[
                { value: "", label: "Selecione" },
                { value: "fuel", label: "Combustível" },
                { value: "maintenance", label: "Manutenção" },
                { value: "toll", label: "Pedágio" },
                { value: "other", label: "Outros" },
              ]}
            />
            <FormField label="Observações" name="expense_notes" as="textarea" className="md:col-span-2" />
          </div>
          <div className="mt-4">
            <FileUploadField
              label="Upload de imagens (gastos / comprovantes)"
              storageKey="fleet_driver_expense_files"
              accept="image/*"
            />
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

        <FormActions
          loading={loading}
          syncing={syncing}
          onSaveLocal={handleSaveLocal}
          onSyncNow={handleSyncNow}
          onExportPdf={handleExportPdf}
          syncDisabled={!online}
        />
      </form>
    </AppShell>
  );
}
