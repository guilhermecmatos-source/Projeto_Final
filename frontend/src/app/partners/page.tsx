"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ActionButton from "@/components/ui/ActionButton";
import FormModal from "@/components/ui/FormModal";
import FormField from "@/components/forms/FormField";
import PartnerProfilePanel from "@/components/profiles/PartnerProfilePanel";
import { partnersApi } from "@/services/api";
import { validateCnpj, validateEmail } from "@/lib/validators";

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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

  // Tabs and GPS states
  const [activeTab, setActiveTab] = useState<"all" | "gps">("all");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPartnerDetails, setSelectedPartnerDetails] = useState<any | null>(null);
  const [navWarningOpen, setNavWarningOpen] = useState(false);

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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          setUserCoords({ lat: -23.5505, lng: -46.6333 });
        }
      );
    } else {
      setUserCoords({ lat: -23.5505, lng: -46.6333 });
    }
  }, []);

  const partnersWithDistance = useMemo(() => {
    const latBase = userCoords?.lat ?? -23.5505;
    const lngBase = userCoords?.lng ?? -46.6333;
    
    return partners.map((p) => {
      const charSum = p.name.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
      const latOffset = ((charSum % 100) - 50) / 400;
      const lngOffset = (((charSum * 7) % 100) - 50) / 400;
      
      const lat = latBase + latOffset;
      const lng = lngBase + lngOffset;
      const distance = getDistance(latBase, lngBase, lat, lng);
      
      return { ...p, lat, lng, distance };
    });
  }, [partners, userCoords]);

  const displayedPartners = useMemo(() => {
    if (activeTab === "gps") {
      return partnersWithDistance
        .filter((p) => p.type === "workshop")
        .sort((a, b) => a.distance - b.distance);
    }
    return partnersWithDistance;
  }, [activeTab, partnersWithDistance]);

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
          <div className="border-b border-outline-variant px-4 py-2 flex gap-4 bg-surface-container-high/40">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`pb-1 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
                activeTab === "all" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-slate-200"
              }`}
            >
              Todos os Parceiros
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("gps")}
              className={`pb-1 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
                activeTab === "gps" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-slate-200"
              }`}
            >
              Oficinas Próximas (GPS)
            </button>
          </div>
          <table className="zebra-table w-full text-body-md">
            <thead>
              <tr className="border-b bg-surface-container/50 text-label-md text-on-surface-variant">
                <th className="px-6 py-4 text-left">Parceiro</th>
                <th className="px-6 py-4 text-center">Tipo</th>
                {activeTab === "gps" && <th className="px-6 py-4 text-center">Distância</th>}
                <th className="px-6 py-4 text-center">Score</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {loading ? (
                <tr><td colSpan={activeTab === "gps" ? 5 : 4} className="px-6 py-8 text-center">Carregando...</td></tr>
              ) : displayedPartners.length === 0 ? (
                <tr><td colSpan={activeTab === "gps" ? 5 : 4} className="px-6 py-8 text-center text-on-surface-variant">Nenhum parceiro cadastrado.</td></tr>
              ) : (
                displayedPartners.map((p) => (
                  <tr key={p.id} className="cursor-pointer hover:bg-primary-container/5" onClick={() => setSelectedPartnerDetails(p)}>
                    <td className="px-6 py-4">
                      <p className="font-bold">{p.name}</p>
                      <p className="text-xs text-on-surface-variant">{p.city}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="rounded bg-surface-container-high px-2 py-0.5 text-[11px] font-bold uppercase">{TYPE_LABEL[p.type] ?? p.type}</span>
                    </td>
                    {activeTab === "gps" && (
                      <td className="px-6 py-4 text-center font-bold text-green-400">
                        {p.distance.toFixed(1)} km
                      </td>
                    )}
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

      {/* Modal de Detalhes com iFrame e Aviso */}
      <FormModal
        open={!!selectedPartnerDetails}
        onClose={() => setSelectedPartnerDetails(null)}
        title={selectedPartnerDetails?.name || "Detalhes do Parceiro"}
        subtitle={`${TYPE_LABEL[selectedPartnerDetails?.type || ""] || "Parceiro"} Homologado`}
      >
        {selectedPartnerDetails && (
          <div className="space-y-4 text-slate-100">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg bg-surface-container-low p-3">
                <dt className="text-xs text-on-surface-variant font-bold uppercase text-[10px]">Score de Qualidade</dt>
                <dd className="text-xl font-bold text-primary">{Math.round(selectedPartnerDetails.score)}/100</dd>
              </div>
              <div className="rounded-lg bg-surface-container-low p-3">
                <dt className="text-xs text-on-surface-variant font-bold uppercase text-[10px]">Cidade / Base</dt>
                <dd className="text-xl font-bold text-slate-100">{selectedPartnerDetails.city}</dd>
              </div>
              {selectedPartnerDetails.distance !== undefined && (
                <div className="rounded-lg bg-surface-container-low p-3 col-span-2">
                  <dt className="text-xs text-on-surface-variant font-bold uppercase text-[10px]">Distância Calculada (GPS)</dt>
                  <dd className="text-xl font-bold text-green-400">
                    Aproximadamente {selectedPartnerDetails.distance.toFixed(1)} km de distância
                  </dd>
                </div>
              )}
            </dl>

            {/* iFrame View */}
            <div className="rounded-lg overflow-hidden border border-outline-variant bg-surface-container-low">
              <p className="px-3 py-2 text-xs font-bold uppercase text-on-surface-variant bg-surface-container-high/50 border-b border-outline-variant/30">
                Visualização do Mapa Satélite
              </p>
              <iframe
                src={`https://maps.google.com/maps?q=${selectedPartnerDetails.lat},${selectedPartnerDetails.lng}&z=14&t=m&ie=UTF8&iwloc=&output=embed`}
                width="100%"
                height="220"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
              ></iframe>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedId(selectedPartnerDetails.id);
                  setSelectedPartnerDetails(null);
                }}
                className="btn-outline flex-1 border border-outline-variant py-3 text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-white/5 transition"
              >
                Ver Perfil & Chat
              </button>
              <button
                type="button"
                onClick={() => setNavWarningOpen(true)}
                className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider"
              >
                <Icon name="navigation" />
                Rota GPS
              </button>
            </div>
          </div>
        )}
      </FormModal>

      {/* Modal de Aviso de Redirecionamento */}
      <FormModal
        open={navWarningOpen}
        onClose={() => setNavWarningOpen(false)}
        title="Aviso de Segurança"
        subtitle="Redirecionamento Externo"
      >
        <div className="space-y-4 text-slate-100 text-sm">
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-4 text-amber-500">
            <p className="font-bold flex items-center gap-1">
              <Icon name="warning" />
              Atenção
            </p>
            <p className="mt-1">
              Você está prestes a sair do ambiente seguro da plataforma **RUV Intelligence Hub** para o **Google Maps externo**.
            </p>
          </div>
          <p>
            Esta ação abrirá uma nova aba em seu navegador. Recomendamos atenção ao trânsito e uso de suportes veiculares homologados para navegação em rodovias.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setNavWarningOpen(false)}
              className="btn-outline flex-1 border border-outline-variant py-2 rounded-lg hover:bg-white/5 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                setNavWarningOpen(false);
                if (selectedPartnerDetails) {
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${selectedPartnerDetails.lat},${selectedPartnerDetails.lng}`,
                    "_blank"
                  );
                }
              }}
              className="btn-primary flex-1 py-2 rounded-lg font-bold"
            >
              Prosseguir
            </button>
          </div>
        </div>
      </FormModal>
    </AppShell>
  );
}
