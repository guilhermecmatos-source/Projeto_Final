"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import ActionLink from "@/components/ui/ActionLink";
import { ACTION_ROUTES } from "@/lib/action-routes";
import { travelsApi } from "@/services/api";
import { formatPlateDisplay } from "@/lib/validators";

interface Match {
  id: string;
  origin: string;
  destination: string;
  vehicle_plate: string;
  driver_name: string;
  match_score: number;
}

export default function TravelsMatchingPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    travelsApi
      .carpoolMatches()
      .then((res) => setMatches(Array.isArray(res.data) ? res.data : []))
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell headerTitle="Matching AI">
      <Link
        href="/travels"
        className="mb-6 inline-flex items-center gap-1 text-label-md text-primary hover:underline"
      >
        <Icon name="arrow_back" className="text-base" />
        Voltar
      </Link>
      <h1 className="mb-2 text-headline-lg">Carona corporativa</h1>
      <p className="mb-6 text-body-md text-on-surface-variant">
        Viagens com rotas semelhantes cadastradas no sistema — dados reais, não simulados.
      </p>

      {loading ? (
        <p className="text-on-surface-variant">Carregando sugestões...</p>
      ) : matches.length === 0 ? (
        <p className="rounded-xl border border-outline-variant p-6 text-on-surface-variant">
          Nenhuma combinação encontrada. Cadastre mais despachos com origens/destinos próximos.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {matches.map((m) => {
            const pct = Math.min(99, 65 + Number(m.match_score) * 10);
            return (
              <div key={m.id} className="raised-card border-l-4 border-l-primary p-6">
                <p className="font-bold text-primary">MATCH {pct}%</p>
                <p className="mt-2 text-headline-sm">
                  {m.origin} → {m.destination}
                </p>
                <p className="text-sm text-on-surface-variant">
                  {formatPlateDisplay(m.vehicle_plate)} • {m.driver_name}
                </p>
                <ActionLink
                  href={ACTION_ROUTES.travelsRegister}
                  variant="secondary"
                  className="mt-4 w-full justify-center"
                >
                  Aprovar e criar despacho
                </ActionLink>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
