"use client";

import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import ProblemAssistantChat from "@/components/ai/ProblemAssistantChat";
import TripCostCalculator from "@/components/ai/TripCostCalculator";
import PredictiveMaintenancePanel from "@/components/ai/PredictiveMaintenancePanel";

export default function AiSecurityPage() {
  return (
    <AppShell headerTitle="IA Sandbox">
      <PageHeader
        title="IA Sandbox — 3 Inteligências Artificiais"
        subtitle="Diagnóstico, custos de viagem e manutenção preditiva baseada em planos de fábrica."
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <section className="lg:col-span-5">
          <ProblemAssistantChat />
        </section>
        <section className="lg:col-span-7 space-y-6">
          <TripCostCalculator />
          <PredictiveMaintenancePanel />
        </section>
      </div>
    </AppShell>
  );
}
