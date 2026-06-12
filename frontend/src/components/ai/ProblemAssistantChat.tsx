"use client";

import { FormEvent, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import { getAssistantReply, VEHICLE_KNOWLEDGE } from "@/lib/ai/knowledge-base";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

const QUICK_REQUESTS = [
  "Meu veículo está vibrando ao frear",
  "Luz de advertência no painel",
  "Ar condicionado não esfria",
  "Direção puxando para um lado",
  "Bateria descarrega rápido",
  "Motor falha ao acelerar",
];

const SUPPORT_TOPICS = [
  { label: "Diagnóstico rápido", prompt: "Preciso de um diagnóstico rápido de problemas do veículo." },
  { label: "Checklist de segurança", prompt: "Preciso de um checklist de segurança operacional para a frota." },
  { label: "Recomendações de manutenção", prompt: "Quais ações preventivas devo tomar para este veículo?" },
  { label: "Ajuda com código OBD", prompt: "Como interpreto um código de falha do painel?" },
  { label: "Orientação para viagem", prompt: "Quais cuidados devo seguir antes de uma viagem longa?" },
];

export default function ProblemAssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Olá! Sou o assistente inteligente. Descreva o problema do veículo com detalhes e eu trago diagnóstico, urgência e próximos passos.",
    },
  ]);
  const [input, setInput] = useState("");
  const [compactMode, setCompactMode] = useState(true);
  const [showHelpOptions, setShowHelpOptions] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  function send(text: string) {
    const reply = getAssistantReply(text);
    setMessages((prev) => [
      ...prev,
      { role: "user", text },
      { role: "assistant", text: reply },
    ]);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput("");
    send(trimmed);
  }

  return (
    <div className="flex h-full min-h-[320px] flex-col rounded-xl border border-outline-variant bg-surface-container-lowest">
      <div className="border-b border-outline-variant px-4 py-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-headline-sm text-primary">
              <Icon name="support_agent" />
              IA 2 — Assistente Inteligente
            </h3>
            <p className="text-xs text-on-surface-variant">
              Base de conhecimento com {VEHICLE_KNOWLEDGE.length} cenários e sugestões práticas.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-outline-variant bg-surface px-3 py-2 text-xs font-medium text-on-surface">
            <input
              id="compact-mode"
              type="checkbox"
              checked={compactMode}
              onChange={(event) => setCompactMode(event.target.checked)}
              className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
            />
            <label htmlFor="compact-mode">Painel compacto</label>
          </div>
        </div>
      </div>

      <div className="grid flex-1 gap-3 overflow-hidden p-3 lg:grid-cols-[1.6fr_0.9fr]">
        <section className="flex h-full flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-high">
          <div className={`flex-1 overflow-y-auto ${compactMode ? "p-2 space-y-2" : "p-4 space-y-3"}`}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[88%] rounded-lg ${compactMode ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm"} ${
                  m.role === "user"
                    ? "ml-auto bg-primary text-on-primary"
                    : "bg-surface-container-low text-on-surface"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text.replace(/\*\*/g, "")}</p>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className={`border-t border-outline-variant ${compactMode ? "p-2" : "p-4"}`}>
            <p className="mb-2 text-sm font-medium text-on-surface">Tópicos rápidos</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_REQUESTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className={`rounded-full bg-primary-container/10 ${compactMode ? "px-2 py-1 text-xs" : "px-3 py-1 text-xs"} font-medium text-primary hover:bg-primary-container/20`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className={`flex gap-2 border-t border-outline-variant ${compactMode ? "p-2" : "p-4"}`}>
            <input
              className="input-fleet flex-1"
              placeholder="Descreva o sintoma ou solicite uma orientação..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="btn-primary shrink-0 !px-4">
              <Icon name="send" />
            </button>
          </form>
        </section>
        <aside className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-high p-3">
          <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowHelpOptions((s) => !s)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm font-medium text-on-surface hover:bg-surface-variant"
              >
                <span>Mais formas de ajuda</span>
                <span className={`transform transition-transform ${showHelpOptions ? "rotate-180" : "rotate-0"}`}>
                  ▾
                </span>
              </button>
            </div>
            {showHelpOptions && (
              <div className="mt-2 space-y-2">
                {SUPPORT_TOPICS.map((topic) => (
                  <button
                    key={topic.label}
                    type="button"
                    onClick={() => { send(topic.prompt); setShowHelpOptions(false); }}
                    className="w-full rounded-lg border border-outline-variant bg-surface px-2 py-1 text-left text-xs text-on-surface transition hover:bg-surface-variant"
                  >
                    <span className="block font-medium text-on-surface">{topic.label}</span>
                    <span className="text-xxs text-on-surface-variant">{topic.prompt}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
              Como essa IA pode ajudar
            </p>
            <ul className="mt-3 space-y-3 text-sm text-on-surface-variant">
              <li>Diagnóstico de sintomas e urgência operacional</li>
              <li>Recomendações de ação imediata</li>
              <li>Interpretação de códigos e alertas</li>
              <li>Checklist de segurança e manutenção preventiva</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
