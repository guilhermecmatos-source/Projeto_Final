"use client";

import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ActionLink from "@/components/ui/ActionLink";
import { ACTION_ROUTES } from "@/lib/action-routes";

const PARTNERS = [
  { name: "AutoPeças Central", city: "São Paulo, SP", type: "Distribuidora", score: 94, status: "Ativo" },
  { name: "Oficina Velocidade", city: "Curitiba, PR", type: "Oficina", score: 62, status: "Pendente" },
  { name: "Revenda Premium", city: "Belo Horizonte, MG", type: "Revendedora", score: 88, status: "Ativo" },
];

export default function PartnersPage() {
  return (
    <AppShell>
      <PageHeader
        title="Gestão de Parceiros & Suporte"
        subtitle="Monitore o desempenho da rede e acesse documentação técnica."
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
          { label: "Score Médio da Rede", value: "84.2", sub: "+2.4%" },
          { label: "Oficinas Ativas", value: "128", sub: "98% conformidade" },
          { label: "SLA Médio Suporte", value: "2.4h", sub: "Meta superada" },
          { label: "Manuais Baixados", value: "4.2k", sub: "Este semestre" },
        ].map((k) => (
          <div key={k.label} className="raised-card p-4">
            <span className="text-label-md uppercase tracking-wider text-on-surface-variant">
              {k.label}
            </span>
            <p className="mt-1 text-headline-lg font-bold text-primary">{k.value}</p>
            <p className="mt-2 text-body-md text-on-surface-variant">{k.sub}</p>
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
              {PARTNERS.map((p) => (
                <tr key={p.name}>
                  <td className="px-6 py-4">
                    <p className="font-bold">{p.name}</p>
                    <p className="text-xs text-on-surface-variant">{p.city}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="rounded bg-surface-container-high px-2 py-0.5 text-[11px] font-bold uppercase">
                      {p.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-primary">{p.score}/100</td>
                  <td className="px-6 py-4 text-center">
                    <span className={p.status === "Ativo" ? "chip-active" : "chip-pending"}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-4 lg:col-span-4">
          <div className="raised-card p-6">
            <h3 className="mb-4 text-headline-sm">Suporte Técnico</h3>
            {[
              { title: "API de Integração", icon: "code" },
              { title: "Histórico de Chamados", icon: "history" },
            ].map((doc) => (
              <ActionLink
                key={doc.title}
                href={ACTION_ROUTES.partnersDocs}
                variant="outline"
                className="mb-2 w-full !justify-start !rounded-lg !p-3"
              >
                <Icon name={doc.icon} className="text-primary" />
                <span className="text-body-md font-medium">{doc.title}</span>
                <Icon name="chevron_right" className="ml-auto text-outline" />
              </ActionLink>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
