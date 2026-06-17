"use client";

import { useEffect, useRef, useState, FormEvent, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import Icon from "@/components/ui/Icon";
import LoadingState from "@/components/ui/LoadingState";
import { copilotApi, vehiclesApi } from "@/services/api";
import { extractApiError } from "@/lib/api-errors";
import { useAuth } from "@/hooks/useAuth";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

interface VehicleOption {
  id: string;
  plate: string;
  brand: string;
  model: string;
  mileage: number;
  avg_consumption?: number | null;
}

const SUPPORT_TOPICS = [
  { label: "Maior Receita", prompt: "Qual o veículo de maior faturamento?" },
  { label: "Contratos a Vencer", prompt: "Quais contratos vencem em breve?" },
  { label: "Motorista Destaque", prompt: "Quem é o motorista destaque?" },
  { label: "Custos da Matriz", prompt: "Quais os custos operacionais da Matriz?" },
  { label: "Verificar Óleo", prompt: "Como verifico o nível de óleo?" },
  { label: "Barulho no Freio", prompt: "Freio do veículo fazendo ruído, o que fazer?" },
  { label: "Injeção Eletrônica", prompt: "Luz da injeção eletrônica acendeu no painel" },
];

const MODULE_OPTIONS = [
  { id: "dashboard", label: "Dashboard Principal" },
  { href: "/users", id: "users", label: "Controle de Usuários" },
  { href: "/vehicles", id: "vehicles", label: "Inventário de Frota" },
  { href: "/drivers", id: "drivers", label: "Gestão de Motoristas" },
  { href: "/travels", id: "travels", label: "Viagens & Despacho" },
  { href: "/maintenance", id: "maintenance", label: "Manutenção & Alertas" },
  { href: "/fuel", id: "fuel", label: "Abastecimentos" },
  { href: "/inspection", id: "inspection", label: "Inspeção Veicular" },
  { href: "/ai-security", id: "ai-security", label: "Segurança IA" },
  { href: "/intelligence", id: "intelligence", label: "Fleet Intelligence" },
  { href: "/marketplace", id: "marketplace", label: "Marketplace de Ativos" },
  { href: "/reports", id: "reports", label: "Relatórios Estratégicos" },
  { href: "/partners", id: "partners", label: "Parceiros & Oficinas" },
];

export default function CopilotPage() {
  const { user } = useAuth(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [activeModule, setActiveModule] = useState("dashboard");
  
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("fleet_copilot_history");
        if (stored) {
          setMessages(JSON.parse(stored));
        } else {
          setMessages([
            {
              role: "assistant",
              text: "Olá! Sou o **FleetAI**, assistente inteligente de controle operacional. Como posso te auxiliar na gestão da frota hoje?",
            },
          ]);
        }
      } catch {
        // Fallback
      }
    }
  }, []);

  // Fetch vehicles for context
  useEffect(() => {
    vehiclesApi
      .list()
      .then((res) => {
        setVehicles(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        // Fallback or silence
      })
      .finally(() => {
        setLoadingVehicles(false);
      });
  }, []);

  // Save history to sessionStorage when messages update
  const saveHistory = (msgs: ChatMessage[]) => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("fleet_copilot_history", JSON.stringify(msgs));
      } catch {
        // Ignore
      }
    }
  };

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || sending) return;

    setError(null);
    setSending(true);

    const userMessage: ChatMessage = { role: "user", text: textToSend };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveHistory(updatedMessages);
    setInput("");

    try {
      const vehicleContext = selectedVehicle
        ? {
            brand: selectedVehicle.brand,
            model: selectedVehicle.model,
            plate: selectedVehicle.plate,
            km: selectedVehicle.mileage,
            avgConsumption: selectedVehicle.avg_consumption,
          }
        : undefined;

      const res = await copilotApi.chat(updatedMessages, activeModule, vehicleContext);
      const replyText = res.data?.reply || res.data?.response || "Sem resposta.";
      
      const assistantMessage: ChatMessage = { role: "assistant", text: replyText };
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      saveHistory(finalMessages);
    } catch (err) {
      setError(extractApiError(err, "Não foi possível conectar à API do FleetAI."));
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const handleClearHistory = () => {
    const defaultMessages: ChatMessage[] = [
      {
        role: "assistant",
        text: "Olá! Sou o **FleetAI**, assistente inteligente de controle operacional. Como posso te auxiliar na gestão da frota hoje?",
      },
    ];
    setMessages(defaultMessages);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("fleet_copilot_history");
    }
  };

  return (
    <AppShell headerTitle="FleetAI Copilot">
      <PageHeader
        breadcrumb="Copilot"
        title="FleetAI Copilot IA"
        subtitle="Suporte operacional inteligente e diagnósticos preditivos em tempo real."
        actions={
          <button
            type="button"
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 rounded-lg border border-error/30 bg-error/10 px-3 py-1.5 text-xs font-bold uppercase text-error transition hover:bg-error/20"
          >
            <Icon name="delete_sweep" className="text-sm" />
            Limpar Histórico
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Side: Chat log (8 Columns) */}
        <section className="lg:col-span-8 flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest overflow-hidden h-[calc(100vh-18rem)] min-h-[500px]">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => {
              const isUser = m.role === "user";
              return (
                <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-xs shadow-md whitespace-pre-wrap ${
                      isUser
                        ? "bg-[#FCA311] text-black font-semibold rounded-br-none"
                        : "bg-[#1E293B] text-slate-100 rounded-bl-none border border-white/5"
                    }`}
                  >
                    <p>{m.text}</p>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Topics */}
          <div className="border-t border-outline-variant/30 p-3 bg-surface-container-low/50">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Tópicos Sugeridos</p>
            <div className="flex flex-wrap gap-1.5">
              {SUPPORT_TOPICS.map((topic) => (
                <button
                  key={topic.label}
                  type="button"
                  onClick={() => handleSend(topic.prompt)}
                  disabled={sending}
                  className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-xxs font-medium text-primary hover:bg-primary/20 transition disabled:opacity-50"
                >
                  {topic.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="border-t border-outline-variant/30 p-3 bg-surface-container-low flex gap-2">
            <input
              type="text"
              placeholder="Digite sua pergunta para o FleetAI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending}
              className="input-fleet flex-1 text-xs !h-10 bg-surface text-white border-outline-variant/30"
              required
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="btn-primary shrink-0 !px-4 !h-10 bg-primary hover:bg-primary/95 text-black rounded-lg"
            >
              {sending ? (
                <Icon name="hourglass_empty" className="animate-spin text-base" />
              ) : (
                <Icon name="send" className="text-base" />
              )}
            </button>
          </form>
        </section>

        {/* Right Side: Operational Context (4 Columns) */}
        <aside className="lg:col-span-4 flex flex-col gap-4">
          {/* Active Module Context */}
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <h3 className="mb-3 flex items-center gap-2 text-headline-sm text-primary font-bold">
              <Icon name="view_module" />
              Módulo Ativo
            </h3>
            <p className="text-xxs text-on-surface-variant mb-2">
              Selecione o módulo para contextualizar a inteligência artificial:
            </p>
            <select
              value={activeModule}
              onChange={(e) => setActiveModule(e.target.value)}
              className="w-full rounded bg-surface border border-outline-variant p-2 text-xs text-on-surface focus:outline-none cursor-pointer"
            >
              {MODULE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Context */}
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <h3 className="mb-3 flex items-center gap-2 text-headline-sm text-primary font-bold">
              <Icon name="directions_car" />
              Veículo Selecionado
            </h3>
            <p className="text-xxs text-on-surface-variant mb-2">
              Selecione um veículo para vincular dados de telemetria à conversa:
            </p>
            {loadingVehicles ? (
              <p className="text-xxs text-on-surface-variant">Carregando frota...</p>
            ) : (
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full rounded bg-surface border border-outline-variant p-2 text-xs text-on-surface focus:outline-none cursor-pointer"
              >
                <option value="">Nenhum veículo selecionado</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model} ({v.plate})
                  </option>
                ))}
              </select>
            )}

            {selectedVehicle && (
              <div className="mt-4 rounded-lg bg-surface-container-high p-3 border border-outline-variant/30 text-xxs space-y-1.5">
                <p className="font-bold text-primary border-b border-outline-variant/30 pb-1 uppercase">Dados Contextuais</p>
                <p><span className="text-on-surface-variant">Placa:</span> <strong className="font-mono text-slate-200">{selectedVehicle.plate}</strong></p>
                <p><span className="text-on-surface-variant">Odômetro:</span> <span className="text-slate-200">{selectedVehicle.mileage.toLocaleString("pt-BR")} km</span></p>
                <p><span className="text-on-surface-variant">Consumo Médio:</span> <span className="text-slate-200">{selectedVehicle.avg_consumption ? `${selectedVehicle.avg_consumption} km/L` : "Não registrado"}</span></p>
              </div>
            )}
          </div>

          {/* AI Info Card */}
          <div className="rounded-xl border border-[#FCA311]/20 bg-[#FCA311]/5 p-4">
            <h4 className="flex items-center gap-1.5 text-xs font-bold text-[#FCA311] uppercase tracking-wide mb-2">
              <Icon name="security" className="text-sm" />
              Diretrizes do FleetAI
            </h4>
            <ul className="list-disc list-inside text-xxs text-slate-300 space-y-1">
              <li>Mapeamento automático de CNH e alertas de manutenção.</li>
              <li>Sugestões corretivas devem agendar manutenção formal.</li>
              <li>As permissões de visualização respeitam o RBAC ativo.</li>
            </ul>
          </div>
        </aside>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-error/15 border border-error/30 text-error flex justify-between items-center text-xs animate-slide-in">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="font-bold hover:underline">Fechar</button>
        </div>
      )}
    </AppShell>
  );
}
