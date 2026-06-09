"use client";

import { useEffect, useRef, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/hooks/useAuth";
import { chatApi } from "@/services/api";
import { extractApiError } from "@/lib/api-errors";

interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  sender_name?: string;
  receiver_name?: string;
}

interface ChatPartner {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ChatPage() {
  const { user } = useAuth(false);
  const [partners, setPartners] = useState<ChatPartner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<ChatPartner | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load chat partners
  useEffect(() => {
    if (!user) return;
    chatApi
      .listPartners()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setPartners(data);
        if (data.length > 0) {
          setSelectedPartner(data[0]);
        }
      })
      .catch((err) => {
        setError(extractApiError(err, "Erro ao carregar lista de contatos."));
      })
      .finally(() => setLoadingPartners(false));
  }, [user]);

  // Load messages for the selected partner
  const loadMessages = () => {
    if (!selectedPartner) return;
    chatApi
      .listMessages(selectedPartner.id)
      .then((res) => {
        setMessages(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        setError(extractApiError(err, "Erro ao buscar mensagens."));
      });
  };

  useEffect(() => {
    if (!selectedPartner) return;
    setLoadingMessages(true);
    chatApi
      .listMessages(selectedPartner.id)
      .then((res) => {
        setMessages(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        setError(extractApiError(err, "Erro ao carregar histórico."));
      })
      .finally(() => setLoadingMessages(false));
  }, [selectedPartner]);

  // Auto-scroll to the bottom of the chat log
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Polling for live-like experience
  useEffect(() => {
    if (!selectedPartner) return;
    const interval = setInterval(() => {
      loadMessages();
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedPartner]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedPartner || sending) return;
    
    setSending(true);
    const textToSend = inputText.trim();
    setInputText("");
    
    try {
      const res = await chatApi.sendMessage(selectedPartner.id, textToSend);
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      setError(extractApiError(err, "Erro ao enviar mensagem."));
    } finally {
      setSending(false);
    }
  };

  const isAdmin = user?.role === "administrador" || user?.role === "admin";

  return (
    <AppShell>
      <PageHeader
        title="Chat de Suporte & Comunicação"
        subtitle={
          isAdmin
            ? "Central de Atendimento: Responda as dúvidas e auxilie os condutores em tempo real."
            : "Canal Direto com o Administrador: Solicite suporte e tire suas dúvidas operacionais."
        }
      />

      <div className="grid gap-6 lg:grid-cols-12 raised-card overflow-hidden h-[calc(100vh-16rem)] min-h-[480px]">
        {/* Contact List / Partners (4 Columns) */}
        <div className="lg:col-span-4 border-r border-outline-variant bg-surface-container-low flex flex-col h-full overflow-hidden">
          <div className="border-b border-outline-variant px-4 py-3 bg-surface-container-high/40">
            <h3 className="text-label-md font-bold uppercase text-primary tracking-wider">
              {isAdmin ? "Usuários Ativos" : "Contato"}
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/30">
            {loadingPartners ? (
              <p className="p-4 text-xs text-on-surface-variant text-center">Buscando contatos...</p>
            ) : partners.length === 0 ? (
              <p className="p-4 text-xs text-on-surface-variant text-center">Nenhum contato disponível.</p>
            ) : (
              partners.map((p) => {
                const active = selectedPartner?.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPartner(p)}
                    className={`w-full text-left px-4 py-3 transition hover:bg-white/5 flex items-center gap-3 ${
                      active ? "bg-primary-container/10 border-l-4 border-primary" : ""
                    }`}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-high text-xs font-bold text-primary shrink-0">
                      {p.name.charAt(0)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-slate-100 truncate">{p.name}</p>
                      <p className="text-[10px] text-on-surface-variant uppercase truncate">{p.role}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Message Log Panel (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col h-full bg-surface-container-lowest overflow-hidden">
          {selectedPartner ? (
            <>
              {/* Header Info */}
              <div className="border-b border-outline-variant px-5 py-3 bg-surface-container-high/20 flex items-center gap-3 justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-high text-xs font-bold text-primary">
                    {selectedPartner.name.charAt(0)}
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-slate-100">{selectedPartner.name}</h4>
                    <p className="text-[10px] text-on-surface-variant uppercase">{selectedPartner.role} • {selectedPartner.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={loadMessages}
                  className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition"
                  title="Atualizar mensagens"
                >
                  <Icon name="refresh" className="text-sm" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-xs text-on-surface-variant">Carregando histórico...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <Icon name="chat_bubble_outline" className="text-4xl text-on-surface-variant opacity-40 mb-2" />
                    <p className="text-xs text-on-surface-variant">Inicie uma nova conversa! Escreva sua mensagem abaixo.</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.sender_id === user?.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg px-3 py-2 text-xs shadow-md ${
                            isMe
                              ? "bg-primary text-on-primary rounded-br-none"
                              : "bg-surface-container-high text-on-surface rounded-bl-none"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{m.message}</p>
                          <p className={`text-[8px] mt-1 text-right font-mono ${isMe ? "text-on-primary/70" : "text-on-surface-variant"}`}>
                            {new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleSend} className="border-t border-outline-variant p-4 bg-surface-container-low/50 flex gap-2">
                <input
                  type="text"
                  placeholder="Escreva sua mensagem..."
                  className="input-fleet flex-1 text-xs"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={sending}
                  required
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="btn-primary shrink-0 !px-4 uppercase font-bold text-xs"
                >
                  {sending ? <Icon name="hourglass_empty" className="animate-spin" /> : <Icon name="send" />}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <Icon name="forum" className="text-6xl text-on-surface-variant opacity-40 mb-3" />
              <p className="text-sm font-bold text-on-surface">Nenhuma conversa ativa</p>
              <p className="text-xs text-on-surface-variant mt-1">Selecione um contato na lista para iniciar o chat.</p>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-3 rounded-lg bg-error/15 border border-error/30 text-error flex justify-between items-center text-xs">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="font-bold hover:underline">Fechar</button>
        </div>
      )}
    </AppShell>
  );
}
