"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import FormField from "@/components/forms/FormField";
import FileUploadField from "@/components/forms/FileUploadField";
import CurrencyField from "@/components/forms/CurrencyField";
import FormActions from "@/components/forms/FormActions";
import SearchableCombobox, { ComboboxOption } from "@/components/forms/SearchableCombobox";
import Icon from "@/components/ui/Icon";
import { driversApi, vehiclesApi } from "@/services/api";
import { validateCpf, validateCnh, validateRg, validatePhone } from "@/lib/validators";
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
  if (ax.response?.status === 401) return "Sessão expirada. Faça login novamente.";
  if (ax.response?.status === 403) {
    return "Sem permissão para cadastrar motoristas. Use perfil admin ou gestor.";
  }
  return ax.response?.data?.error || ax.message || "Erro ao comunicar com o servidor.";
}

function validateDriverForm(form: FormData): string | null {
  const name = String(form.get("name") || "").trim();
  const cpf = String(form.get("cpf") || "").trim();
  const license_number = String(form.get("license_number") || "").trim();
  const rg = String(form.get("rg") || "").trim();
  const phone = String(form.get("phone") || "").trim();
  const vehicle_id = String(form.get("vehicle_id") || "").trim();

  if (!name) return "Nome completo é obrigatório.";
  const cpfCheck = validateCpf(cpf);
  if (!cpfCheck.valid) return cpfCheck.message ?? "CPF inválido.";
  const cnhCheck = validateCnh(license_number);
  if (!cnhCheck.valid) return cnhCheck.message ?? "CNH inválida.";
  if (rg) {
    const rgCheck = validateRg(rg);
    if (!rgCheck.valid) return rgCheck.message ?? "RG inválido.";
  }
  if (phone) {
    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.valid) return phoneCheck.message ?? "Telefone inválido.";
  }
  if (!vehicle_id) return "Selecione um veículo vinculado cadastrado no sistema.";
  return null;
}

export default function DriverRegisterPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [createdDriverId, setCreatedDriverId] = useState<string | null>(null);
  const [vehicleOptions, setVehicleOptions] = useState<ComboboxOption[]>([]);
  const [vehicleId, setVehicleId] = useState("");
  const { online, pendingCount, syncing, syncNow } = useOffline();

  useEffect(() => {
    const draft = getDriverDraft();
    if (draft?.savedAt) setLastSaved(draft.savedAt as string);
    vehiclesApi
      .list()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setVehicleOptions(
          list.map((v: { id: string; plate: string; brand?: string; model?: string }) => ({
            value: String(v.id),
            label: `${v.plate}${v.brand ? ` — ${v.brand} ${v.model ?? ""}` : ""}`,
          }))
        );
      })
      .catch(() => setVehicleOptions([]));
  }, []);

  async function submitToApi(form: FormData) {
    const validationError = validateDriverForm(form);
    if (validationError) throw { response: { data: { error: validationError } } };

    const res = await driversApi.create({
      name: String(form.get("name")).trim(),
      license_number: String(form.get("license_number")).trim(),
      phone: String(form.get("phone") || "").trim(),
      cpf: String(form.get("cpf")).trim(),
      rg: String(form.get("rg") || "").trim() || undefined,
      cnh_category: String(form.get("cnh_category") || "").trim() || undefined,
      vehicle_id: vehicleId || String(form.get("vehicle_id")),
    });
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
    if (result.ok) setSuccess(result.message);
    else setError(result.message);
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
      const validationError = validateDriverForm(form);
      if (validationError) {
        setError(validationError);
        return;
      }
      if (isOnline()) {
        await submitToApi(form);
        setSuccess("Motorista cadastrado com sucesso. Redirecionando...");
        router.replace(`/drivers?t=${Date.now()}`);
      } else {
        saveDriverDraft(draft);
        addToSyncQueue({
          type: "driver",
          payload: {
            name: draft.name,
            license_number: draft.license_number,
            phone: draft.phone || "",
            cpf: draft.cpf,
            vehicle_id: vehicleId,
          },
        });
        setLastSaved(new Date().toISOString());
        setSuccess("Salvo offline. Será sincronizado quando houver conexão.");
      }
    } catch (err: unknown) {
      const msg = apiErrorMessage(err);
      saveDriverDraft(draft);
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
        Dados pessoais, CNH e veículo vinculado. Checklist de saída/chegada fica em{" "}
        <Link href="/inspection" className="font-bold text-primary hover:underline">
          Inspeção
        </Link>{" "}
        e nos despachos de viagem.
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
          Modo offline ativo. Alterações ficam na fila de sincronização
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
            <FormField label="RG" name="rg" placeholder="SP-1234567" />
            <FormField label="Órgão emissor" name="rg_issuer" placeholder="SSP/SP" />
            <FormField label="Telefone" name="phone" placeholder="(11) 99999-9999" />
          </div>
        </section>

        <section className="raised-card p-4 sm:p-6">
          <h2 className="mb-4 text-headline-sm">CNH (Carteira de motorista)</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Número da CNH" name="license_number" required placeholder="11 dígitos" />
            <FormField
              label="Categoria"
              name="cnh_category"
              options={[
                { value: "", label: "Selecione" },
                { value: "A", label: "A" },
                { value: "B", label: "B" },
                { value: "AB", label: "AB" },
                { value: "C", label: "C" },
                { value: "D", label: "D" },
                { value: "E", label: "E" },
              ]}
            />
          </div>
          <div className="mt-4">
            <FileUploadField
              label="Upload CNH (imagem ou PDF)"
              storageKey="fleet_driver_cnh_files"
              accept="image/*,.pdf"
              multiple={false}
              hint="JPG, PNG ou PDF até 10MB"
              uploadToServer={!!createdDriverId}
              entityType="driver_cnh"
              entityId={createdDriverId ?? undefined}
            />
          </div>
        </section>

        <section className="raised-card p-4 sm:p-6">
          <h2 className="mb-2 text-headline-sm">Veículo vinculado</h2>
          <p className="mb-4 text-sm text-on-surface-variant">
            Obrigatório — selecione um veículo já cadastrado na frota.
          </p>
          <SearchableCombobox
            label="Veículo da frota"
            name="vehicle_id"
            required
            options={vehicleOptions}
            allowCustom={false}
            placeholder={vehicleOptions.length ? "Busque por placa..." : "Cadastre veículos primeiro"}
            onValueChange={(v) => setVehicleId(v)}
          />
        </section>

        <section className="raised-card p-4 sm:p-6">
          <h2 className="mb-4 text-headline-sm">Gastos e manutenção (opcional)</h2>
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
        </section>

        <section className="raised-card p-4 sm:p-6">
          <h2 className="mb-4 text-headline-sm">Ocorrências e danos (opcional)</h2>
          <FormField
            label="Descrição detalhada"
            name="incident_description"
            as="textarea"
            rows={4}
            placeholder="Descreva ocorrências, danos, local e horário..."
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
