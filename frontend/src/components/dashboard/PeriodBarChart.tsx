"use client";

import { useMemo } from "react";
import { formatBRL } from "@/lib/currency";

export interface EvolutionPoint {
  label: string;
  viagens: number;
  combustivel: number;
}

interface PeriodBarChartProps {
  data: EvolutionPoint[];
  loading?: boolean;
}

export default function PeriodBarChart({ data, loading }: PeriodBarChartProps) {
  const maxTrips = useMemo(() => Math.max(1, ...data.map((d) => d.viagens)), [data]);
  const maxFuel = useMemo(() => Math.max(1, ...data.map((d) => d.combustivel)), [data]);

  if (loading) {
    return <p className="py-8 text-center text-on-surface-variant">Carregando gráfico...</p>;
  }

  if (!data.length) {
    return <p className="py-8 text-center text-on-surface-variant">Sem dados no período.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 text-xs">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-primary-container" />
          Viagens efetuadas
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-secondary-container" />
          Custo combustível (R$)
        </span>
      </div>
      <div className="flex h-48 items-end gap-2 overflow-x-auto pb-2 sm:gap-3">
        {data.map((point) => {
          const tripH = Math.round((point.viagens / maxTrips) * 100);
          const fuelH = Math.round((point.combustivel / maxFuel) * 100);
          return (
            <div key={point.label} className="flex min-w-[48px] flex-1 flex-col items-center gap-1">
              <div className="flex h-40 w-full items-end justify-center gap-1">
                <div
                  className="w-5 rounded-t bg-primary-container transition-all duration-500 sm:w-6"
                  style={{ height: `${Math.max(tripH, point.viagens > 0 ? 8 : 0)}%` }}
                  title={`${point.viagens} viagens`}
                />
                <div
                  className="w-5 rounded-t bg-secondary-container transition-all duration-500 sm:w-6"
                  style={{ height: `${Math.max(fuelH, point.combustivel > 0 ? 8 : 0)}%` }}
                  title={formatBRL(point.combustivel)}
                />
              </div>
              <span className="text-[10px] font-medium text-on-surface-variant">{point.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
