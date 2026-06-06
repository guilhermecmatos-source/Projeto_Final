"use client";

import { useMemo } from "react";
import { formatBRL } from "@/lib/currency";

interface EvolutionPoint {
  label: string;
  viagens: number;
  combustivel: number;
}

interface PeriodLineChartProps {
  data: EvolutionPoint[];
  loading?: boolean;
}

export default function PeriodLineChart({ data, loading }: PeriodLineChartProps) {
  const { points, maxY, economia } = useMemo(() => {
    const pts = data.length
      ? data
      : [
          { label: "Sem 1", viagens: 2, combustivel: 3200 },
          { label: "Sem 2", viagens: 4, combustivel: 4100 },
          { label: "Sem 3", viagens: 3, combustivel: 3800 },
          { label: "Sem 4", viagens: 5, combustivel: 5200 },
        ];
    const maxV = Math.max(...pts.map((p) => p.viagens), 1);
    const maxC = Math.max(...pts.map((p) => p.combustivel * 0.14), 1);
    const max = Math.max(maxV, maxC / 1000);
    const eco = pts.reduce((s, p) => s + p.combustivel * 0.14, 0);
    return { points: pts, maxY: max, economia: eco };
  }, [data]);

  const w = 100;
  const h = 50;
  const pad = 4;

  function linePath(key: "viagens" | "economia", scale: number) {
    if (points.length < 2) return "";
    const step = (w - pad * 2) / (points.length - 1);
    return points
      .map((p, i) => {
        const val = key === "viagens" ? p.viagens : p.combustivel * 0.14;
        const x = pad + i * step;
        const y = h - pad - (val / scale) * (h - pad * 2);
        return `${i === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");
  }

  if (loading) {
    return <p className="py-16 text-center text-on-surface-variant">Carregando gráfico...</p>;
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          Filtrado por semanas
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-44 w-full" preserveAspectRatio="none">
        {[0.25, 0.5, 0.75].map((g) => (
          <line
            key={g}
            x1={pad}
            x2={w - pad}
            y1={h - pad - g * (h - pad * 2)}
            y2={h - pad - g * (h - pad * 2)}
            stroke="#2a3142"
            strokeWidth="0.3"
          />
        ))}
        <path
          d={linePath("economia", maxY > 10 ? maxY : economia / points.length || 1)}
          fill="none"
          stroke="#22c55e"
          strokeWidth="1.2"
          strokeDasharray="2 1"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={linePath("viagens", maxY)}
          fill="none"
          stroke="#ff9f00"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="mt-2 flex justify-between text-[10px] text-on-surface-variant">
        {points.map((p) => (
          <span key={p.label}>{p.label}</span>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-6 bg-primary" />
          Viagens Efetuadas
        </span>
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-6 border-t border-dashed border-green-500" />
          Economia IA ({formatBRL(economia)})
        </span>
      </div>
    </div>
  );
}
