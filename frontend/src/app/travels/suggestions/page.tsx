"use client";

import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import ActionLink from "@/components/ui/ActionLink";
import { ACTION_ROUTES } from "@/lib/action-routes";

export default function TravelsSuggestionsPage() {
  return (
    <AppShell headerTitle="Sugestões de Carona">
      <Link href="/travels" className="mb-6 inline-flex items-center gap-1 text-label-md text-primary hover:underline">
        <Icon name="arrow_back" className="text-base" />
        Voltar
      </Link>
      <div className="raised-card border border-primary/20 bg-primary-container p-6 text-on-primary-container">
        <h1 className="text-headline-lg font-bold">5 oportunidades para amanhã</h1>
        <p className="mt-2 opacity-90">Economia estimada: R$ 1.240,00 com caronas corporativas.</p>
        <ActionLink href={ACTION_ROUTES.travelsMatching} variant="primary" className="mt-6 !bg-primary !text-on-primary">
          Ver todas as sugestões
        </ActionLink>
      </div>
    </AppShell>
  );
}
