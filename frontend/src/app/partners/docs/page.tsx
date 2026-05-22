"use client";

import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import ActionLink from "@/components/ui/ActionLink";
import { ACTION_ROUTES } from "@/lib/action-routes";

const DOCS = [
  {
    title: "Manual de Telemetria",
    icon: "menu_book",
    desc: "Guia de sensores, odômetro e integração GPS.",
    href: ACTION_ROUTES.apiDocs,
    external: true,
  },
  {
    title: "API de Integração",
    icon: "code",
    desc: "Documentação Swagger da API REST FleetAI.",
    href: ACTION_ROUTES.apiDocs,
    external: true,
  },
  {
    title: "Troubleshooting IA",
    icon: "psychology",
    desc: "Boas práticas para alertas e sandbox de IA.",
    href: "/ai-security",
    external: false,
  },
];

export default function PartnersDocsPage() {
  return (
    <AppShell headerTitle="Documentação Técnica">
      <Link href="/partners" className="mb-6 inline-flex items-center gap-1 text-label-md text-primary hover:underline">
        <Icon name="arrow_back" className="text-base" />
        Voltar aos Parceiros
      </Link>
      <h1 className="mb-8 text-headline-lg">Suporte e Documentação</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {DOCS.map((doc) => (
          <ActionLink
            key={doc.title}
            href={doc.href}
            variant="outline"
            external={doc.external}
            className="raised-card flex-col items-start !p-6"
          >
            <Icon name={doc.icon} className="mb-2 text-2xl text-primary" />
            <span className="text-headline-sm font-bold">{doc.title}</span>
            <span className="mt-1 text-body-md text-on-surface-variant">{doc.desc}</span>
          </ActionLink>
        ))}
      </div>
    </AppShell>
  );
}
