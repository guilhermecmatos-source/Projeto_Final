"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/hooks/useAuth";
import { chatApi, usersApi, driversApi, partnersApi } from "@/services/api";
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
  phone?: string;
  location?: string;
  category: "patio" | "driver" | "partner";
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

  // Initialize and load partners + mock CCO contacts
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoadingPartners(true);
      setError(null);
      try {
        // Pre-populate with exact mock contacts from Image 3
        const mockContacts: ChatPartner[] = [
          {
            id: "amanda-silveira",
            name: "Amanda Silveira",
            email: "amanda@fleetai.com",
            role: "Gerente Operacional",
            phone: "(11) 98877-2211",
            location: "Matriz São Paulo",
            category: "patio"
          },
          {
            id: "julian-rodrigues",
            name: "Julian Rodrigues",
            email: "julian@fleetai.com",
            role: "Coordenador de Pátio",
            phone: "(11) 97766-5544",
            location: "Filial Santos",
            category: "patio"
          },
          {
            id: "carlos-silveira-driver",
            name: "Carlos Silveira (Condutor)",
            email: "carlos@fleetai.com",
            role: "Motorista Profissional Categoria AE",
            phone: "(11) 98765-4321",
            location: "Rota BR-116",
            category: "patio"
          },
          {
            id: "carlos-silveira-cnh",
            name: "Carlos Silveira",
            email: "carlos@fleetai.com",
            role: "Condutor CNH AE",
            phone: "(11) 98765-4321",
            location: "Disponível Sede",
            category: "driver"
          },
          {
            id: "roberto-souza-cnh",
            name: "Roberto Souza",
            email: "roberto@fleetai.com",
            role: "Condutor CNH D",
            phone: "(11) 96655-4433",
            location: "Disponível Sede",
            category: "driver"
          },
          {
            id: "repas-mecanica",
            name: "REPAS MECÂNICA PESADOS SP",
            email: "repas@fleetai.com",
            role: "Oficina Homologada - Dr. Ricardo",
            phone: "(11) 95544-3322",
            location: "Oficina Credenciada BaaS",
            category: "partner"
          }
        ];

        setPartners(mockContacts);
        setSelectedPartner(mockContacts[0]);
      } catch (err) {
        setError(extractApiError(err, "Erro ao carregar lista de contatos."));
      } finally {
        setLoadingPartners(false);
      }
    };

    loadData();
  }, [user]);

  // Load messages
  const loadMessages = useCallback(() => {
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

  useEffect(() => {
    if (selectedPartner) {
      loadMessages();
    }
  }, [selectedPartner, loadMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Smart Offline Auto-Response mapping
  const getAutoResponseText = (partnerName: string) => {
    switch (partnerName) {
      case "Amanda Silveira":
        return "Entendido. A rota já está cadastrada e o saldo do cartão Scania R 450 foi liberado.";
      case "Julian Rodrigues":
        return "Carga liberada no pátio da Sede. Veículo BRA-2E19 pode iniciar a viagem.";
      case "Carlos Silveira (Condutor)":
      case "Carlos Silveira":
        return "Estou a caminho do Posto Ipiranga para realizar o abastecimento do Scania R 450.";
      case "Roberto Souza":
        return "CNH atualizada no sistema. Aguardando aprovação de viagem.";
      case "REPAS MECÂNICA PESADOS SP":
        return "Ordem de serviço OS-781 aberta. Aguardando a chegada do trator para inspeção.";
      default:
        return "Mensagem criptografada e recebida pela central. Processando solicitação.";
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedPartner || sending) return;

    setSending(true);
    const textToSend = inputText.trim();
    setInputText("");

    // Create current local message object
    const localUserMsg: ChatMessage = {
      id: Math.random().toString(),
      sender_id: user?.id || "me",
      receiver_id: selectedPartner.id,
      message: textToSend,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, localUserMsg]);

    try {
      // Post message to backend
      await chatApi.sendMessage(selectedPartner.id, textToSend);

      // Trigger automatic simulated offline reply after 1.5 seconds
      setTimeout(async () => {
        const replyText = getAutoResponseText(selectedPartner.name);
        const replyMsg: ChatMessage = {
          id: Math.random().toString(),
          sender_id: selectedPartner.id,
          receiver_id: user?.id || "me",
          message: replyText,
          created_at: new Date().toISOString()
        };

        // Post simulated reply to backend to maintain persistency
        await chatApi.sendMessage(user?.id || "me", replyText);

        setMessages((prev) => [...prev, replyMsg]);
      }, 1500);

    } catch (err) {
      setError(extractApiError(err, "Erro ao enviar mensagem."));
    } finally {
      setSending(false);
    }
  };

  // Divide partners into the three screenshot categories
  const patioTeam = partners.filter((p) => p.category === "patio");
  const cnhDrivers = partners.filter((p) => p.category === "driver");
  const externalPartners = partners.filter((p) => p.category === "partner");

  return (
    <AppShell>
      <PageHeader
        breadcrumb="Chat"
        title="CHAT CORPORATIVO HOMOLOGADO"
        subtitle="Canal de correspondência dinâmica e direta entre Operadores, Condutores com CNH e Prestadores de Oficinas Credenciadas."
        actions={
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-bold uppercase text-primary transition hover:bg-primary/20"
          >
            <Icon name="lock" className="text-sm" />
            REDE SEGURA FLEETAI
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-12 raised-card overflow-hidden h-[calc(100vh-16rem)] min-h-[500px]">
        {/* Contact List (4 Columns) */}
        <div className="lg:col-span-4 border-r border-outline-variant bg-[#0c132b]/80 flex flex-col h-full overflow-hidden">
          
          {/* Search box */}
          <div className="p-4 border-b border-outline-variant/30">
            <div className="relative">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
              <input
                type="text"
                placeholder="Buscar usuário, motorista ou oficina..."
                className="input-fleet pl-10 text-xs !h-10 bg-[#070b18]/60 border-outline-variant/30"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            
            {/* Section 1: EQUIPE OPERACIONAL DO PÁTIO */}
            <div>
              <p className="px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-primary">EQUIPE OPERACIONAL DO PÁTIO</p>
              <div className="mt-1 space-y-1">
                {patioTeam.map((p) => {
                  const active = selectedPartner?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPartner(p)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition hover:bg-white/5 flex items-center gap-3 ${
                        active ? "bg-[#1E293B]/60 border-l-4 border-[#FCA311]" : ""
                      }`}
                    >
                      <div className="relative shrink-0">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e293b] text-sm font-bold text-[#FCA311]">
                          {p.name.charAt(0)}
                        </span>
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border border-[#0c132b]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs text-slate-100 truncate">{p.name}</p>
                        <p className="text-[10px] text-on-surface-variant truncate">{p.role}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: CONDUTORES CNH CADASTRADOS */}
            <div>
              <p className="px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-primary">CONDUTORES CNH CADASTRADOS</p>
              <div className="mt-1 space-y-1">
                {cnhDrivers.map((p) => {
                  const active = selectedPartner?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPartner(p)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition hover:bg-white/5 flex items-center gap-3 ${
                        active ? "bg-[#1E293B]/60 border-l-4 border-[#FCA311]" : ""
                      }`}
                    >
                      <div className="relative shrink-0">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e293b] text-sm font-bold text-[#FCA311]">
                          {p.name.charAt(0)}
                        </span>
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border border-[#0c132b]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs text-slate-100 truncate">{p.name}</p>
                        <p className="text-[10px] text-on-surface-variant truncate">{p.role}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: REDE CREDENCIADA & EMPRESAS */}
            <div>
              <p className="px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-primary">REDE CREDENCIADA & EMPRESAS</p>
              <div className="mt-1 space-y-1">
                {externalPartners.map((p) => {
                  const active = selectedPartner?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPartner(p)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition hover:bg-white/5 flex items-center gap-3 ${
                        active ? "bg-[#1E293B]/60 border-l-4 border-[#FCA311]" : ""
                      }`}
                    >
                      <div className="relative shrink-0">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e293b] text-sm font-bold text-[#FCA311]">
                          {p.name.charAt(0)}
                        </span>
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border border-[#0c132b]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs text-slate-100 truncate">{p.name}</p>
                        <p className="text-[10px] text-on-surface-variant truncate">{p.role}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Message Log Panel (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col h-full bg-[#0b0e14]/50 overflow-hidden relative">
          {selectedPartner ? (
            <>
              {/* Header Info */}
              <div className="border-b border-outline-variant/30 px-5 py-3 bg-[#0c132b]/80 flex items-center gap-3 justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e293b] text-xs font-bold text-[#FCA311]">
                    {selectedPartner.name.charAt(0)}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-white">{selectedPartner.name}</h4>
                      <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-[8px] text-green-400 font-bold uppercase tracking-wider">Online</span>
                    </div>
                    <p className="text-[10px] text-on-surface-variant font-mono">
                      {selectedPartner.role} {selectedPartner.phone ? `• ${selectedPartner.phone}` : ""}
                    </p>
                  </div>
                </div>
                
                {/* Location Badge */}
                {selectedPartner.location && (
                  <div className="flex items-center gap-1.5 rounded-full bg-[#1E293B] px-3 py-1 border border-outline-variant/30 text-[10px] font-semibold text-slate-200">
                    <Icon name="location_on" className="text-xs text-[#FCA311]" />
                    {selectedPartner.location}
                  </div>
                )}
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 relative">
                {/* Background Safe Net watermark */}
                {messages.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-6 select-none opacity-20">
                    <Icon name="verified_user" className="text-7xl text-primary mb-3" />
                    <p className="text-sm font-bold text-slate-100 uppercase tracking-widest font-mono">CANAL CRIPTOGRAFADO SEGURO DA REDE ANTERIOR DE PÁTIO</p>
                  </div>
                )}

                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-xs text-on-surface-variant">Carregando histórico...</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.sender_id === user?.id || m.sender_id === "me";
                    return (
                      <div
                        key={m.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg px-3 py-2 text-xs shadow-md ${
                            isMe
                              ? "bg-[#FCA311] text-black rounded-br-none font-semibold"
                              : "bg-[#1E293B] text-slate-100 rounded-bl-none border border-white/5"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{m.message}</p>
                          <p className={`text-[8px] mt-1 text-right font-mono ${isMe ? "text-black/70" : "text-slate-400"}`}>
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
              <form onSubmit={handleSend} className="border-t border-outline-variant/30 p-4 bg-[#0c132b]/80 flex gap-2">
                <input
                  type="text"
                  placeholder={`Digite uma mensagem corporativa privada para ${selectedPartner.name}...`}
                  className="input-fleet flex-1 text-xs !h-11 bg-[#0b0e14]/80 border-outline-variant/30 text-white"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={sending}
                  required
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="btn-primary shrink-0 !px-5 uppercase font-bold text-xs bg-[#FCA311] hover:bg-[#FCA311]/90 text-black rounded-lg"
                >
                  {sending ? <Icon name="hourglass_empty" className="animate-spin text-sm" /> : <Icon name="send" className="text-sm" />}
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
        <div className="mt-4 p-3 rounded-lg bg-error/15 border border-error/30 text-error flex justify-between items-center text-xs animate-slide-in">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="font-bold hover:underline">Fechar</button>
        </div>
      )}
    </AppShell>
  );
}
