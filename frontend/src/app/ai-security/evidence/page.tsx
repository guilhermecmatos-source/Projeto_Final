"use client";

import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";

export default function AiEvidencePage() {
  return (
    <AppShell headerTitle="Evidências de Auditoria">
      <Link href="/ai-security" className="mb-6 inline-flex items-center gap-1 text-label-md text-primary hover:underline">
        <Icon name="arrow_back" className="text-base" />
        Voltar
      </Link>
      <h1 className="mb-6 text-headline-lg">Evidências Anti-Fraude</h1>
      <div className="space-y-4">
        {[
          "Divergência de odômetro — ABC-1234",
          "Litragem excedente — DEF-5678",
          "Nota fiscal duplicada — NF #8928",
        ].map((title) => (
          <div key={title} className="raised-card border-l-4 border-l-error p-4">
            <p className="font-bold">{title}</p>
            <p className="text-sm text-on-surface-variant">Logs, GPS e OCR disponíveis para revisão.</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
