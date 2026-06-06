"use client";

import { useMemo } from "react";
import { formatBRL } from "@/lib/currency";

interface EvolutionPoint {
  label: string;
  viagens: number;
  combustivel: number;
}

interface PeriodPieChartProps {
  data: EvolutionPoint[];
  loading?: boolean;
}

const SLICES = [
  { key: "viagens" as const, label: "Viagens Efetuadas", color: "#ff9f00" },
  { key: "combustivel" as const, label: "Economia IA (R$)", color: "#22c55e" },
];

export default function PeriodPieChart({ data, loading }: PeriodPieChartProps) {
  const totals = useMemo(() => {
    const viagens = data.reduce((s, d) => s + d.viagens, 0);
    const combustivel = data.reduce((s, d) => s + d.combustivel, 0);
    const economia = Math.round(combustivel * 0.14);
    return { viagens, combustivel, economia };
  }, [data]);

  const segments = useMemo(() => {
    const values = [
      { ...SLICES[0], value: Math.max(totals.viagens, 1) },
      { ...SLICES[1], value: Math.max(totals.economia || totals.combustivel * 0.14, 1) },
    ];
    const sum = values.reduce((s, v) => s + v.value, 0);
    let angle = 0;
    return values.map((v) => {
      const pct = v.value / sum;
      const start = angle;
      angle += pct * 360;
      return { ...v, pct, start, end: angle };
    });
  }, [totals]);

  function arcPath(cx: number, cy: number, r: number, start: number, end: number) {
    const s = ((start - 90) * Math.PI) / 180;
    const e = ((end - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(s);
    const y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e);
    const y2 = cy + r * Math.sin(e);
    const large = end - start > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  }

  if (loading) {
    return <p className="py-12 text-center text-on-surface-variant">Carregando gráfico...</p>;
  }

  return (
    <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
      <div className="relative shrink-0">
        <svg viewBox="0 0 200 200" className="h-48 w-48 md:h-56 md:w-56">
          {segments.map((seg) => (
            <path
              key={seg.key}
              d={arcPath(100, 100, 80, seg.start, seg.end)}
              fill={seg.color}
              stroke="#0b0e14"
              strokeWidth="2"
            />
          ))}
          <circle cx="100" cy="100" r="42" fill="#151921" />
          <text x="100" y="96" textAnchor="middle" fill="#ff9f00" fontSize="14" fontWeight="bold">
            {totals.viagens}
          </text>
          <text x="100" y="114" textAnchor="middle" fill="#94a3b8" fontSize="9">
            viagens
          </text>
        </svg>
        <span className="absolute right-0 top-0 rounded bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
          Filtrado por semanas
        </span>
      </div>

      <div className="flex-1 space-y-4">
        <h4 className="text-label-md uppercase text-on-surface-variant">Distribuição do período</h4>
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center gap-3">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: seg.color }} />
            <div className="flex-1">
              <p className="text-sm font-semibold">{seg.label}</p>
              <p className="text-xs text-on-surface-variant">
                {seg.key === "viagens"
                  ? `${totals.viagens} viagens no período`
                  : formatBRL(totals.economia || totals.combustivel * 0.14)}
              </p>
            </div>
            <span className="text-sm font-bold" style={{ color: seg.color }}>
              {Math.round(seg.pct * 100)}%
            </span>
          </div>
        ))}

        <div className="rounded-lg border border-outline-variant bg-surface-container-low p-3 text-xs text-on-surface-variant">
          <p>
            <strong className="text-primary">Combustível total:</strong>{" "}
            {formatBRL(totals.combustivel)}
          </p>
          <p className="mt-1">
            <strong className="text-green-500">Economia IA estimada:</strong>{" "}
            {formatBRL(totals.economia || totals.combustivel * 0.14)}
          </p>
        </div>
      </div>
    </div>
  );
}
