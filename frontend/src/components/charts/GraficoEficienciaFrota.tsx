"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  dados: { semana: string; kmL: number }[];
}

export function GraficoEficienciaFrota({ dados }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={dados}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="semana" stroke="#6b7280" fontSize={12} />
        <YAxis stroke="#6b7280" fontSize={12} domain={["auto", "auto"]} />
        <Tooltip contentStyle={{ background: "#030712", border: "1px solid #374151" }} />
        <Line type="monotone" dataKey="kmL" stroke="#10b981" strokeWidth={2} dot />
      </LineChart>
    </ResponsiveContainer>
  );
}
