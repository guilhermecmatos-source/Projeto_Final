"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Send, ShieldAlert, Wrench } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { FleetIntelligenceMode } from "@/types";
import { fadeIn } from "@/lib/motion";

interface MensagemChat {
  papel: "usuario" | "assistente";
  texto: string;
}

const CONFIG: Record<
  FleetIntelligenceMode,
  { titulo: string; subtitulo: string; Icone: typeof Wrench; iniciais: MensagemChat[] }
> = {
  manutencao: {
    titulo: "Manutenção Preditiva IA",
    subtitulo: "Relatório de Manutenção Preditiva",
    Icone: Wrench,
    iniciais: [
      {
        papel: "assistente",
        texto:
          "Veículo DEF-5678: desgaste acelerado nos freios (78% probabilidade). Agende revisão em até 7 dias.",
      },
      {
        papel: "assistente",
        texto: "ABC-1234: troca de óleo sugerida em 1.200 km. Economia preventiva estimada: R$ 3.400.",
      },
    ],
  },
  alertas: {
    titulo: "Alertas Críticos IA",
    subtitulo: "Alertas em Tempo Real",
    Icone: ShieldAlert,
    iniciais: [
      {
        papel: "assistente",
        texto:
          "CRÍTICO: DEF-5678 com consumo 38% acima da média em 72h. Investigar vazamento ou condução.",
      },
      {
        papel: "assistente",
        texto: "MÉDIO: João Silva — 3 abastecimentos em intervalo atípico. Auditar cupons fiscais.",
      },
    ],
  },
};

function modoDaUrl(param: string | null): FleetIntelligenceMode {
  return param === "alertas" ? "alertas" : "manutencao";
}

export function FleetIntelligencePage() {
  const params = useSearchParams();
  const modo = modoDaUrl(params.get("ia"));
  const cfg = CONFIG[modo];
  const [mensagens, setMensagens] = useState<MensagemChat[]>(cfg.iniciais);
  const [entrada, setEntrada] = useState("");
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMensagens(CONFIG[modo].iniciais);
  }, [modo]);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  function enviar() {
    if (!entrada.trim()) return;
    const pergunta = entrada.trim();
    const resposta: MensagemChat = {
      papel: "assistente",
      texto:
        modo === "manutencao"
          ? `Análise para "${pergunta}": prioridade média. Janela sugerida: terça 08h (dados simulados).`
          : `Alerta registrado: "${pergunta}" — nível médio. Operações notificadas (simulação).`,
    };
    setMensagens((m) => [...m, { papel: "usuario", texto: pergunta }, resposta]);
    setEntrada("");
  }

  const Icone = cfg.Icone;

  return (
    <DashboardShell titulo="Fleet Intelligence">
      <motion.div {...fadeIn} className="mx-auto max-w-4xl">
        <Card className="flex h-[calc(100vh-10rem)] flex-col overflow-hidden p-0">
          <div className="border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-950 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-cyan-500/15 p-2">
                <Icone className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{cfg.titulo}</h2>
                <p className="text-sm text-gray-500">{cfg.subtitulo}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant={modo === "manutencao" ? "default" : "outline"} asChild>
                <a href="/fleet-intelligence?ia=manutencao">Manutenção</a>
              </Button>
              <Button size="sm" variant={modo === "alertas" ? "default" : "outline"} asChild>
                <a href="/fleet-intelligence?ia=alertas">Alertas</a>
              </Button>
            </div>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {mensagens.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.papel === "usuario" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    msg.papel === "usuario"
                      ? "bg-cyan-600 text-white"
                      : "border border-gray-700 bg-gray-900/80 text-gray-200"
                  }`}
                >
                  {msg.texto}
                </div>
              </div>
            ))}
            <div ref={fimRef} />
          </div>
          <div className="flex gap-2 border-t border-gray-800 p-4">
            <Input
              placeholder="Pergunte à IA..."
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enviar()}
            />
            <Button onClick={enviar} aria-label="Enviar">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </motion.div>
    </DashboardShell>
  );
}
