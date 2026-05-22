"use client";

import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";

export default function AiVisualPage() {
  return (
    <AppShell headerTitle="Gerar Visual IA">
      <Link href="/ai-security" className="mb-6 inline-flex items-center gap-1 text-label-md text-primary hover:underline">
        <Icon name="arrow_back" className="text-base" />
        Voltar
      </Link>
      <h1 className="mb-4 text-headline-lg">Prompt Maker — Mockup Gerado</h1>
      <textarea
        className="input-fleet mb-4 min-h-24 w-full"
        placeholder="Descreva o veículo e cenário..."
        defaultValue="SUV elétrico branco em showroom urbano"
      />
      <div className="grid h-64 place-items-center rounded-lg bg-surface-container-high">
        <Icon name="image" className="text-6xl text-primary/30" />
        <p className="mt-2 text-on-surface-variant">Pré-visualização simulada do mockup</p>
      </div>
    </AppShell>
  );
}
