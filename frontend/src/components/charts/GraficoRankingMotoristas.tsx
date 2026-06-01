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
  dados: { motorista: string; score: number }[];
}

export function GraficoRankingMotoristas({ dados }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={dados} layout="vertical" margin={{ left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis type="number" domain={[70, 100]} stroke="#6b7280" fontSize={12} />
        <YAxis dataKey="motorista" type="category" width={96} stroke="#6b7280" fontSize={11} />
        <Tooltip contentStyle={{ background: "#030712", border: "1px solid #374151" }} />
        <Bar dataKey="score" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
