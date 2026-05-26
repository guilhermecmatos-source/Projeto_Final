"use client";

import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import ProblemAssistantChat from "@/components/ai/ProblemAssistantChat";

export default function AiSecurityPage() {
  return (
    <AppShell headerTitle="IA Suporte">
      <PageHeader
        title="IA Suporte"
        subtitle="Assistente inteligente para diagnóstico de problemas operacionais da frota."
      />

      <div className="mx-auto max-w-2xl">
        <ProblemAssistantChat />
      </div>
    </AppShell>
  );
}
