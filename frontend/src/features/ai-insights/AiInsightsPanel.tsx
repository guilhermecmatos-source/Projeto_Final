"use client";

import { motion } from "framer-motion";
import { Brain, Lightbulb, TrendingDown, TrendingUp, Truck } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AiInsight } from "@/types/fleet";

const INSIGHTS: AiInsight[] = [
  {
    id: "1",
    type: "prediction",
    title: "Previsão de consumo",
    description: "Junho deve registrar +4% de litros se o padrão atual se mantiver.",
    impact: "Alto",
  },
  {
    id: "2",
    type: "savings",
    title: "Economia potencial",
    description: "Roteirização inteligente pode economizar R$ 12.400/mês.",
    impact: "R$ 12.400",
  },
  {
    id: "3",
    type: "problem",
    title: "Veículos problemáticos",
    description: "DEF-5678 e GHI-9012 concentram 62% dos alertas críticos.",
  },
  {
    id: "4",
    type: "trend",
    title: "Tendência positiva",
    description: "KM/L médio subiu 6% nas últimas 5 semanas.",
  },
  {
    id: "5",
    type: "suggestion",
    title: "Sugestão automática",
    description: "Agendar revisão preventiva em 3 veículos com hodômetro > 80% do ciclo.",
  },
];

const ICONS = {
  prediction: TrendingUp,
  savings: Lightbulb,
  problem: Truck,
  trend: TrendingDown,
  suggestion: Brain,
};

export function AiInsightsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-cyan-400" />
          Insights da IA
        </CardTitle>
        <CardDescription>Previsões, economia e recomendações automáticas</CardDescription>
      </CardHeader>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {INSIGHTS.map((insight, i) => {
          const Icon = ICONS[insight.type];
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-fleet-800/40 bg-fleet-900/30 p-4"
            >
              <Icon className="mb-2 h-4 w-4 text-cyan-400" />
              <p className="text-sm font-semibold text-fleet-100">{insight.title}</p>
              <p className="mt-1 text-xs text-fleet-400">{insight.description}</p>
              {insight.impact && (
                <p className="mt-2 text-xs font-medium text-emerald-400">{insight.impact}</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
