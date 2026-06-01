"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  dados: { mes: string; litros: number }[];
}

export function GraficoConsumoMensal({ dados }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={dados}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="mes" stroke="#6b7280" fontSize={12} />
        <YAxis stroke="#6b7280" fontSize={12} />
        <Tooltip
          contentStyle={{ background: "#030712", border: "1px solid #374151", borderRadius: 12 }}
        />
        <Bar dataKey="litros" fill="#06b6d4" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
