"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ActionLink from "@/components/ui/ActionLink";
import { ACTION_ROUTES } from "@/lib/action-routes";
import { partnersApi } from "@/services/api";

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

  useEffect(() => {
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
  }, []);

  return (
    <AppShell>
      <PageHeader
        title="Gestão de Parceiros & Suporte"
        subtitle="Parceiros e chamados reais do sistema."
        actions={
          <>
            <ActionLink href={ACTION_ROUTES.partnersRegister}>
              <Icon name="add" className="text-lg" />
              Novo Parceiro
            </ActionLink>
            <ActionLink href={ACTION_ROUTES.partnersSupport}>
              <Icon name="support_agent" className="text-lg" />
              Abrir Chamado
            </ActionLink>
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
            <span className="text-label-md uppercase tracking-wider text-on-surface-variant">
              {k.label}
            </span>
            <p className="mt-1 text-headline-lg font-bold text-primary">
              {loading ? "—" : k.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="raised-card overflow-hidden lg:col-span-8">
          <div className="border-b border-outline-variant p-4">
            <h3 className="text-headline-sm">Perfil de Parceiros</h3>
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
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center">
                    Carregando...
                  </td>
                </tr>
              ) : partners.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-on-surface-variant">
                    Nenhum parceiro cadastrado.
                  </td>
                </tr>
              ) : (
                partners.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4">
                      <p className="font-bold">{p.name}</p>
                      <p className="text-xs text-on-surface-variant">{p.city}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="rounded bg-surface-container-high px-2 py-0.5 text-[11px] font-bold uppercase">
                        {TYPE_LABEL[p.type] ?? p.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-primary">
                      {Math.round(Number(p.score))}/100
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={p.status === "ativo" ? "chip-active" : "chip-pending"}>
                        {p.status === "ativo" ? "Ativo" : "Pendente"}
                      </span>
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
                    <p className="text-xs text-on-surface-variant">
                      {t.partner_name} • {new Date(t.created_at).toLocaleDateString("pt-BR")}
                    </p>
                    <span className="mt-1 inline-block chip-pending">{t.status}</span>
                  </li>
                ))}
              </ul>
            )}
            <ActionLink
              href={ACTION_ROUTES.partnersSupport}
              variant="outline"
              className="mt-4 w-full justify-center"
            >
              Novo chamado
            </ActionLink>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
