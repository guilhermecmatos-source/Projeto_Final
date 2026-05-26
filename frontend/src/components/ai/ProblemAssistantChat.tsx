"use client";

import { FormEvent, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import { getAssistantReply, VEHICLE_KNOWLEDGE } from "@/lib/ai/knowledge-base";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export default function ProblemAssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Olá! Sou o assistente de diagnóstico. Descreva o problema do veículo (barulho, luz no painel, vazamento, etc.).",
    },
  ]);
  const [input, setInput] = useState("");
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
    <div className="flex h-full min-h-[420px] flex-col rounded-xl border border-outline-variant bg-surface-container-lowest">
      <div className="border-b border-outline-variant px-4 py-3">
        <h3 className="flex items-center gap-2 text-headline-sm text-primary">
          <Icon name="support_agent" />
          IA 1 — Assistente de Problemas
        </h3>
        <p className="text-xs text-on-surface-variant">Base de conhecimento com {VEHICLE_KNOWLEDGE.length} cenários comuns</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
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

      <div className="flex flex-wrap gap-2 border-t border-outline-variant p-3">
        {["Óleo baixo", "Freio rangendo", "Luz no painel"].map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => send(q)}
            className="rounded-full bg-primary-container/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary-container/20"
          >
            {q}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-outline-variant p-3">
        <input
          className="input-fleet flex-1"
          placeholder="Descreva o sintoma..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="btn-primary shrink-0 !px-4">
          <Icon name="send" />
        </button>
      </form>
    </div>
  );
}
