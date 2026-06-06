"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ContractViewModal, { ContractRecord } from "@/components/contracts/ContractViewModal";
import { contractsApi } from "@/services/api";
import { formatBRL } from "@/lib/currency";

interface TemplateOption {
  key: string;
  area: string;
  label: string;
  description: string;
}

const AREA_OPTIONS = [
  { value: "trabalhista", label: "Trabalhista" },
  { value: "previdenciario", label: "Previdenciário" },
];

const STATUS_LABEL: Record<string, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado para assinatura",
  assinado: "Assinado",
  cancelado: "Cancelado",
};

export default function AssinaturaPage() {
  const [contracts, setContracts] = useState<ContractRecord[]>([]);
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    area: "trabalhista",
    template_key: "",
    client_name: "",
    client_email: "",
    client_cpf: "",
    honorarios: "",
  });

  const load = useCallback(() => {
    setLoading(true);
    contractsApi
      .list()
      .then((res) => {
        const data = res.data as { contracts: ContractRecord[]; templates: TemplateOption[] };
        setContracts(data.contracts ?? []);
        setTemplates(data.templates ?? []);
      })
      .catch(() => setContracts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!form.area) return;
    contractsApi.templates(form.area).then((res) => {
      const data = res.data as { templates: TemplateOption[]; defaultKey: string };
      setTemplates(data.templates ?? []);
      setForm((f) => ({ ...f, template_key: data.defaultKey || f.template_key }));
    });
  }, [form.area]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await contractsApi.create({
        title: form.title || `Contrato — ${form.client_name}`,
        area: form.area,
        template_key: form.template_key,
        client_name: form.client_name,
        client_email: form.client_email,
        client_cpf: form.client_cpf,
        honorarios: Number(form.honorarios) || 0,
      });
      setForm({
        title: "",
        area: form.area,
        template_key: form.template_key,
        client_name: "",
        client_email: "",
        client_cpf: "",
        honorarios: "",
      });
      load();
    } finally {
      setCreating(false);
    }
  }

  const pendingCount = contracts.filter((c) => c.status === "enviado").length;

  return (
    <AppShell headerTitle="Assinatura Digital">
      <PageHeader
        breadcrumb="Administração / Assinatura"
        title="Painel de Contratos — Assinatura Digital"
        subtitle="Templates reais (KitContrato, Procuração, Hipossuficiência), fluxo de 4 etapas e notificações automáticas."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: contracts.length },
          { label: "Rascunhos", value: contracts.filter((c) => c.status === "rascunho").length },
          { label: "Aguardando assinatura", value: pendingCount, warn: pendingCount > 0 },
          { label: "Assinados", value: contracts.filter((c) => c.status === "assinado").length },
        ].map((k) => (
          <div key={k.label} className="raised-card p-4">
            <p className="text-label-md text-on-surface-variant">{k.label}</p>
            <p className={`text-headline-md font-bold ${k.warn ? "text-secondary-container" : "text-primary"}`}>
              {loading ? "—" : k.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <section className="raised-card p-6 lg:col-span-4">
          <h3 className="mb-4 text-headline-sm">Novo contrato</h3>
          <form className="space-y-4" onSubmit={handleCreate}>
            <label className="block text-sm">
              <span className="text-label-md text-on-surface-variant">Área jurídica</span>
              <select
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                className="mt-1 w-full rounded-lg border border-outline-variant bg-surface px-3 py-2"
              >
                {AREA_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-label-md text-on-surface-variant">Template (automático por área)</span>
              <select
                value={form.template_key}
                onChange={(e) => setForm({ ...form, template_key: e.target.value })}
                className="mt-1 w-full rounded-lg border border-outline-variant bg-surface px-3 py-2"
              >
                {templates.map((t) => (
                  <option key={t.key} value={t.key}>{t.label}</option>
                ))}
              </select>
            </label>
            <input
              placeholder="Título (opcional)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm"
            />
            <input
              placeholder="Nome do cliente *"
              required
              value={form.client_name}
              onChange={(e) => setForm({ ...form, client_name: e.target.value })}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm"
            />
            <input
              placeholder="CPF"
              value={form.client_cpf}
              onChange={(e) => setForm({ ...form, client_cpf: e.target.value })}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm"
            />
            <input
              placeholder="E-mail do cliente"
              type="email"
              value={form.client_email}
              onChange={(e) => setForm({ ...form, client_email: e.target.value })}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm"
            />
            <input
              placeholder="Honorários (R$)"
              type="number"
              min="0"
              step="0.01"
              value={form.honorarios}
              onChange={(e) => setForm({ ...form, honorarios: e.target.value })}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={creating}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-on-primary"
            >
              <Icon name="description" />
              {creating ? "Criando..." : "Criar contrato"}
            </button>
          </form>
        </section>

        <section className="raised-card overflow-hidden lg:col-span-8">
          <div className="border-b border-outline-variant p-4">
            <h3 className="text-headline-sm">Contratos cadastrados</h3>
          </div>
          <table className="zebra-table w-full text-sm">
            <thead>
              <tr className="border-b bg-surface-container-low text-left text-label-md text-on-surface-variant">
                <th className="px-4 py-3">Contrato</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Honorários</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Etapa</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center">Carregando...</td></tr>
              ) : contracts.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant">Nenhum contrato.</td></tr>
              ) : (
                contracts.map((c) => (
                  <tr
                    key={c.id}
                    className="cursor-pointer hover:bg-surface-container-low"
                    onClick={() => setSelectedId(c.id)}
                  >
                    <td className="px-4 py-3 font-medium">{c.title}</td>
                    <td className="px-4 py-3">{c.client_name}</td>
                    <td className="px-4 py-3">{formatBRL(Number(c.honorarios))}</td>
                    <td className="px-4 py-3">{STATUS_LABEL[c.status] ?? c.status}</td>
                    <td className="px-4 py-3">{c.signature_step}/4</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>

      <ContractViewModal
        contractId={selectedId}
        onClose={() => setSelectedId(null)}
        onUpdated={load}
      />
    </AppShell>
  );
}
