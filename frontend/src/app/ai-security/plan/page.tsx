"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";

export default function AiPlanPage() {
  const router = useRouter();

  return (
    <AppShell headerTitle="Plano de Otimização">
      <Link href="/ai-security" className="mb-6 inline-flex items-center gap-1 text-label-md text-primary hover:underline">
        <Icon name="arrow_back" className="text-base" />
        Voltar
      </Link>
      <div className="raised-card p-6">
        <h1 className="text-headline-lg">Otimizador de Demanda</h1>
        <p className="mt-2 text-on-surface-variant">
          Realocação de 15% da frota para região Sul — economia estimada R$ 42.800.
        </p>
        <button
          type="button"
          className="btn-primary mt-6"
          onClick={() => router.push("/travels")}
        >
          Executar Plano
        </button>
      </div>
    </AppShell>
  );
}
