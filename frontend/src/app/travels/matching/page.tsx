"use client";

import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import ActionLink from "@/components/ui/ActionLink";
import { ACTION_ROUTES } from "@/lib/action-routes";

const MATCHES = [
  { pct: 98, route: "Showroom Alpha → Oficina Central", pax: 4 },
  { pct: 82, route: "Matriz SP → CD Guarulhos", pax: 2 },
];

export default function TravelsMatchingPage() {
  return (
    <AppShell headerTitle="Matching AI">
      <Link href="/travels" className="mb-6 inline-flex items-center gap-1 text-label-md text-primary hover:underline">
        <Icon name="arrow_back" className="text-base" />
        Voltar
      </Link>
      <h1 className="mb-6 text-headline-lg">Sugestões de Carona Corporativa</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {MATCHES.map((m) => (
          <div key={m.route} className="raised-card border-l-4 border-l-primary p-6">
            <p className="font-bold text-primary">MATCH {m.pct}%</p>
            <p className="mt-2 text-headline-sm">{m.route}</p>
            <p className="text-sm text-on-surface-variant">+{m.pax} passageiros</p>
            <ActionLink href={ACTION_ROUTES.travelsRegister} variant="secondary" className="mt-4 w-full justify-center">
              Aprovar e criar despacho
            </ActionLink>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
