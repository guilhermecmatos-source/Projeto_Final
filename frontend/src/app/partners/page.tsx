"use client";

import { FormEvent, useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ActionButton from "@/components/ui/ActionButton";
import FormModal from "@/components/ui/FormModal";
import FormField from "@/components/forms/FormField";
import PartnerProfilePanel from "@/components/profiles/PartnerProfilePanel";
import { partnersApi } from "@/services/api";
import { validateCnpj, validateEmail } from "@/lib/validators";

interface Partner {
  id: string;
  name: string;
  city: string;
  type: string;
  score: number;
  status: string;
}

interface Ticket {
  id: string;
  subject: string;
  partner_name: string;
  status: string;
  created_at: string;
}

const TYPE_LABEL: Record<string, string> = {
  workshop: "Oficina",
  distributor: "Distribuidora",
  dealer: "Revendedora",
};

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState({
    averageScore: 0,
    activePartners: 0,
    openTickets: 0,
    totalPartners: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    partnersApi
      .list()
      .then((res) => {
        const data = res.data as {
          partners?: Partner[];
          tickets?: Ticket[];
          stats?: typeof stats;
        };
        setPartners(data.partners ?? []);
        setTickets(data.tickets ?? []);
        if (data.stats) setStats(data.stats);
      })
      .catch(() => {
        setPartners([]);
        setTickets([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const partnerOptions = [{ value: "", label: "Sem vínculo / geral" }, ...partners.map((p) => ({ value: p.id, label: p.name }))];

  async function handlePartnerSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const cnpj = String(form.get("cnpj") || "").trim();
    const email = String(form.get("email") || "").trim();
    if (cnpj) {
      const c = validateCnpj(cnpj);
      if (!c.valid) { setError(c.message ?? "CNPJ inválido"); setSaving(false); return; }
    }
    if (email) {
      const em = validateEmail(email);
      if (!em.valid) { setError(em.message ?? "E-mail inválido"); setSaving(false); return; }
    }
    try {
      await partnersApi.create({
        name: form.get("name"),
        city: form.get("city"),
        type: form.get("type") || "workshop",
        email: email || undefined,
        cnpj: cnpj || undefined,
      });
      setPartnerModalOpen(false);
      load();
    } catch {
      setError("Erro ao cadastrar parceiro.");
    } finally {
      setSaving(false);
    }
  }

  async function handleTicketSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      await partnersApi.createTicket({
        subject: form.get("subject"),
        partner_name: form.get("partner_name"),
        message: form.get("message"),
        partner_id: String(form.get("partner_id") || "") || undefined,
        priority: form.get("priority") || "normal",
      });
      setTicketModalOpen(false);
      load();
    } catch {
      setError("Erro ao abrir chamado.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Gestão de Parceiros & Oficinas"
        subtitle="Clique em um parceiro para abrir perfil lateral com imagens e chat direto."
        actions={
          <>
            <ActionButton onClick={() => { setPartnerModalOpen(true); setError(""); }}>
              <Icon name="add" className="text-lg" />
              Novo Parceiro
            </ActionButton>
            <ActionButton variant="outline" onClick={() => { setTicketModalOpen(true); setError(""); }}>
              <Icon name="support_agent" className="text-lg" />
              Abrir Chamado
            </ActionButton>
          </>
        }
      />

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        {[
          { label: "Score Médio da Rede", value: String(stats.averageScore || "—") },
          { label: "Parceiros Ativos", value: String(stats.activePartners) },
          { label: "Chamados Abertos", value: String(stats.openTickets) },
          { label: "Total Parceiros", value: String(stats.totalPartners) },
        ].map((k) => (
          <div key={k.label} className="raised-card p-4">
            <span className="text-label-md uppercase tracking-wider text-on-surface-variant">{k.label}</span>
            <p className="mt-1 text-headline-lg font-bold text-primary">{loading ? "—" : k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="raised-card overflow-hidden lg:col-span-8">
          <div className="border-b border-outline-variant p-4">
            <h3 className="text-headline-sm">Parceiros & Oficinas</h3>
          </div>
          <table className="zebra-table w-full text-body-md">
            <thead>
              <tr className="border-b bg-surface-container/50 text-label-md text-on-surface-variant">
                <th className="px-6 py-4 text-left">Parceiro</th>
                <th className="px-6 py-4 text-center">Tipo</th>
                <th className="px-6 py-4 text-center">Score</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center">Carregando...</td></tr>
              ) : partners.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-on-surface-variant">Nenhum parceiro cadastrado.</td></tr>
              ) : (
                partners.map((p) => (
                  <tr key={p.id} className="cursor-pointer hover:bg-primary-container/5" onClick={() => setSelectedId(p.id)}>
                    <td className="px-6 py-4">
                      <p className="font-bold">{p.name}</p>
                      <p className="text-xs text-on-surface-variant">{p.city}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="rounded bg-surface-container-high px-2 py-0.5 text-[11px] font-bold uppercase">{TYPE_LABEL[p.type] ?? p.type}</span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-primary">{Math.round(Number(p.score))}/100</td>
                    <td className="px-6 py-4 text-center">
                      <span className={p.status === "ativo" ? "chip-active" : "chip-pending"}>{p.status === "ativo" ? "Ativo" : "Pendente"}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-4 lg:col-span-4">
          <div className="raised-card p-6">
            <h3 className="mb-4 text-headline-sm">Chamados Recentes</h3>
            {tickets.length === 0 ? (
              <p className="text-sm text-on-surface-variant">Nenhum chamado aberto.</p>
            ) : (
              <ul className="space-y-3">
                {tickets.slice(0, 5).map((t) => (
                  <li key={t.id} className="rounded-lg border border-outline-variant/50 p-3">
                    <p className="text-sm font-semibold">{t.subject}</p>
                    <p className="text-xs text-on-surface-variant">{t.partner_name} • {new Date(t.created_at).toLocaleDateString("pt-BR")}</p>
                    <span className="mt-1 inline-block chip-pending">{t.status}</span>
                  </li>
                ))}
              </ul>
            )}
            <ActionButton variant="outline" className="mt-4 w-full justify-center" onClick={() => { setTicketModalOpen(true); setError(""); }}>
              Novo chamado
            </ActionButton>
          </div>
        </div>
      </div>

      <FormModal open={partnerModalOpen} onClose={() => setPartnerModalOpen(false)} title="Novo Parceiro" subtitle="Cadastro de oficina, distribuidora ou revenda" wide>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handlePartnerSubmit}>
          <FormField label="Razão social" name="name" required />
          <FormField label="CNPJ" name="cnpj" placeholder="00.000.000/0000-00" />
          <FormField label="Cidade" name="city" required />
          <FormField label="Tipo" name="type" options={[{ value: "workshop", label: "Oficina" }, { value: "distributor", label: "Distribuidora" }, { value: "dealer", label: "Revendedora" }]} />
          <FormField label="E-mail de contato" name="email" type="email" className="sm:col-span-2" />
          {error && <p className="text-sm text-error sm:col-span-2">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary sm:col-span-2 w-full uppercase">{saving ? "Salvando..." : "Cadastrar Parceiro"}</button>
        </form>
      </FormModal>

      <FormModal open={ticketModalOpen} onClose={() => setTicketModalOpen(false)} title="Abrir Chamado de Suporte" subtitle="Chamado registrado na base de parceiros" wide>
        <form className="space-y-4" onSubmit={handleTicketSubmit}>
          <FormField label="Assunto" name="subject" required />
          <FormField label="Nome do solicitante / empresa" name="partner_name" required />
          <FormField label="Parceiro vinculado" name="partner_id" options={partnerOptions} />
          <FormField label="Prioridade" name="priority" options={[{ value: "normal", label: "Normal" }, { value: "alta", label: "Alta" }]} />
          <div>
            <label htmlFor="ticket-message" className="mb-1 block text-label-md text-on-surface-variant">Descrição</label>
            <textarea id="ticket-message" name="message" className="input-fleet min-h-32" required />
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary w-full uppercase">{saving ? "Abrindo..." : "Abrir Chamado"}</button>
        </form>
      </FormModal>

      <PartnerProfilePanel partnerId={selectedId} onClose={() => setSelectedId(null)} />
    </AppShell>
  );
}
