"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import FormModal from "@/components/ui/FormModal";
import { ruvApi, usersApi } from "@/services/api";

interface NotificationItem {
  id: string;
  timestamp: string;
  category: "sistema" | "antt" | "motoristas" | "ruv";
  title: string;
  message: string;
  status: "unread" | "read";
  severity: "info" | "warning" | "error";
  relatedId?: string; // e.g. RUV ID
}

interface PendingRuv {
  id: string;
  auth_number: string;
  requester_name: string;
  destination: string;
  service: string;
}

interface PendingUser {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

const TABS = [
  { id: "all", label: "Histórico Completo" },
  { id: "sistema", label: "Sistema (Sensores)" },
  { id: "antt", label: "Cliente & ANTT" },
  { id: "motoristas", label: "Motoristas & RUVs" },
] as const;

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [pendingRuvs, setPendingRuvs] = useState<PendingRuv[]>([]);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>("all");
  
  // Decision modal state (HUD trigger action)
  const [selectedRuv, setSelectedRuv] = useState<PendingRuv | null>(null);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [justification, setJustification] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [processing, setProcessing] = useState(false);

  // Load initial notifications and pending RUVs
  useEffect(() => {
    const defaultList: NotificationItem[] = [
      {
        id: "1",
        timestamp: new Date(Date.now() - 5 * 60000).toLocaleTimeString("pt-BR"),
        category: "sistema",
        title: "Alerta de Freio Térmico",
        message: "Temperatura do freio do veículo DEF-5678 atingiu 295°C no eixo traseiro direito.",
        status: "unread",
        severity: "error",
      },
      {
        id: "2",
        timestamp: new Date(Date.now() - 15 * 60000).toLocaleTimeString("pt-BR"),
        category: "motoristas",
        title: "DriverEye Fadiga",
        message: "Condutor Carlos Eduardo com score de fadiga elevado em 82%. Sugerido ponto de parada imediata.",
        status: "unread",
        severity: "warning",
      },
      {
        id: "3",
        timestamp: new Date(Date.now() - 45 * 60000).toLocaleTimeString("pt-BR"),
        category: "antt",
        title: "ANTT Rotas",
        message: "Veículo GHI-9012 cruzou divisa interestadual em rota homologada ANTT.",
        status: "read",
        severity: "info",
      },
      {
        id: "4",
        timestamp: new Date(Date.now() - 120 * 60000).toLocaleTimeString("pt-BR"),
        category: "ruv",
        title: "RUV Requisitada",
        message: "RUV #99214 aguardando aprovação para Toyota Hilux (Placa ABC-1234).",
        status: "unread",
        severity: "info",
        relatedId: "ruv-mock-1",
      },
    ];
    setNotifications(defaultList);

    // Initial mock pending RUV
    setPendingRuvs([
      {
        id: "ruv-mock-1",
        auth_number: "99214",
        requester_name: "Ana Martins",
        destination: "Filial Santos / Porto",
        service: "Entrega de Carga Crítica",
      },
    ]);

    // Also try to fetch pending RUVs from API
    ruvApi.list("pending").then((res) => {
      if (Array.isArray(res.data) && res.data.length > 0) {
        const mapped = res.data.map((r: any) => ({
          id: r.id,
          auth_number: r.auth_number,
          requester_name: r.requester_name,
          destination: r.destination,
          service: r.service,
        }));
        setPendingRuvs((prev) => [...mapped, ...prev.filter(p => !mapped.some((m: any) => m.id === p.id))]);
      }
    }).catch(() => {});

    // Try to fetch pending users if administrator
    try {
      const userStr = localStorage.getItem("user");
      const currentUser = userStr ? JSON.parse(userStr) : null;
      if (currentUser?.role === "administrador" || currentUser?.role === "admin") {
        usersApi.list({ status: "pending" }).then((res) => {
          if (Array.isArray(res.data)) {
            setPendingUsers(res.data);
          }
        }).catch(() => {});
      }
    } catch {
      /* ignore */
    }
  }, []);

  const handleUserDecision = async (approve: boolean) => {
    if (!selectedUser) return;
    setProcessing(true);
    setActionSuccess("");
    try {
      if (approve) {
        await usersApi.approve(selectedUser.id);
        setActionSuccess(`Usuário ${selectedUser.name} aprovado com sucesso!`);
      } else {
        await usersApi.reject(selectedUser.id);
        setActionSuccess(`Cadastro do usuário ${selectedUser.name} recusado.`);
      }
      setPendingUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));

      const timestamp = new Date().toLocaleTimeString("pt-BR");
      setNotifications((prev) => [
        {
          id: Date.now().toString(),
          timestamp,
          category: "sistema",
          title: `Cadastro ${approve ? "Aprovado" : "Recusado"}`,
          message: `O cadastro do usuário ${selectedUser.name} (${selectedUser.email}) foi ${approve ? "aprovado" : "rejeitado"}.`,
          status: "unread",
          severity: approve ? "info" : "warning",
        },
        ...prev,
      ]);

      setTimeout(() => {
        setSelectedUser(null);
        setActionSuccess("");
      }, 1000);
    } catch {
      setActionSuccess("Erro ao registrar decisão.");
    } finally {
      setProcessing(false);
    }
  };

  const handleSimulateEvent = (type: "thermal" | "fatigue" | "antt" | "ruv") => {
    const timestamp = new Date().toLocaleTimeString("pt-BR");
    let newItem: NotificationItem;

    if (type === "thermal") {
      newItem = {
        id: Date.now().toString(),
        timestamp,
        category: "sistema",
        title: "Falta Resfriamento (Freio Térmico)",
        message: `ALERTA CRÍTICO: Discos de freio do cavalo mecânico JKL-3456 atingiram 310°C.`,
        status: "unread",
        severity: "error",
      };
    } else if (type === "fatigue") {
      newItem = {
        id: Date.now().toString(),
        timestamp,
        category: "motoristas",
        title: "Cansaço Excessivo (DriverEye)",
        message: `DriverEye: Micro-sonolência detectada no condutor do veículo GHI-9012.`,
        status: "unread",
        severity: "error",
      };
    } else if (type === "antt") {
      newItem = {
        id: Date.now().toString(),
        timestamp,
        category: "antt",
        title: "Divergência de Rota ANTT",
        message: "Veículo DEF-5678 fora do corredor alfandegário homologado.",
        status: "unread",
        severity: "warning",
      };
    } else {
      const auth = Math.floor(10000 + Math.random() * 90000).toString();
      const mockId = `ruv-mock-${Date.now()}`;
      newItem = {
        id: Date.now().toString(),
        timestamp,
        category: "ruv",
        title: "Nova RUV Solicitada",
        message: `Requisitante solicitou veículo de frota. RUV #${auth} pendente aprovação.`,
        status: "unread",
        severity: "info",
        relatedId: mockId,
      };

      setPendingRuvs((prev) => [
        {
          id: mockId,
          auth_number: auth,
          requester_name: "Simulador Evento",
          destination: "Base Regional SP",
          service: "Movimentação Interna",
        },
        ...prev,
      ]);
    }

    setNotifications((prev) => [newItem, ...prev]);

    // Show HTML5 native alert if permitted
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification(newItem.title, { body: newItem.message });
    }
  };

  const handleDecision = async (approve: boolean) => {
    if (!selectedRuv) return;
    
    setProcessing(true);
    setActionSuccess("");
    try {
      if (selectedRuv.id.startsWith("ruv-mock")) {
        // Mock success for simulated RUVs
        await new Promise((resolve) => setTimeout(resolve, 600));
        setActionSuccess(`RUV #${selectedRuv.auth_number} ${approve ? "Aprovada" : "Rejeitada"} com sucesso!`);
      } else {
        // Call real API for database RUVs
        if (approve) {
          await ruvApi.approve(selectedRuv.id, justification.trim() || undefined);
        } else {
          await ruvApi.reject(selectedRuv.id, justification.trim());
        }
        setActionSuccess(`RUV #${selectedRuv.auth_number} processada com sucesso.`);
      }
      
      // Clean states and lists
      setPendingRuvs((prev) => prev.filter((r) => r.id !== selectedRuv.id));
      setNotifications((prev) =>
        prev.map((n) =>
          n.relatedId === selectedRuv.id
            ? { ...n, message: `${n.message} (Processada: ${approve ? "Aprovado" : "Rejeitado"})`, severity: "info" }
            : n
        )
      );

      setTimeout(() => {
        setSelectedRuv(null);
        setJustification("");
        setActionSuccess("");
      }, 1000);
    } catch {
      setActionSuccess("Erro ao registrar decisão.");
    } finally {
      setProcessing(false);
    }
  };

  // Filtered lists
  const filteredNotifications = notifications.filter(
    (n) => activeTab === "all" || n.category === activeTab || (activeTab === "motoristas" && n.category === "ruv")
  );

  return (
    <AppShell>
      <PageHeader
        title="Central de Notificações e Eventos"
        subtitle="Monitoramento unificado de alertas de segurança, telemetrias ativas e solicitações RUV."
      />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Notifications Log Feed */}
        <div className="space-y-6 lg:col-span-8">
          {/* RUV & User Pending HUD Trigger Panel */}
          {(pendingRuvs.length > 0 || pendingUsers.length > 0) && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-slate-100 space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
                <span className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                  <Icon name="gavel" className="animate-bounce" />
                  HUD de Aprovações Pendentes ({pendingRuvs.length + pendingUsers.length})
                </span>
                <span className="text-[10px] text-primary bg-primary/10 border border-primary/20 rounded px-2 py-0.5 font-bold uppercase">
                  Ação Exigida
                </span>
              </div>

              {pendingRuvs.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                    <Icon name="description" className="text-xs" />
                    Solicitações de Veículo (RUVs)
                  </p>
                  <div className="space-y-2">
                    {pendingRuvs.map((r) => (
                      <div
                        key={r.id}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 rounded-lg bg-[#0b132b]/80 border border-white/5 p-3 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-200">
                            RUV #{r.auth_number} • {r.requester_name}
                          </p>
                          <p className="text-slate-400 mt-0.5">
                            {r.destination} | {r.service}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedRuv(r)}
                          className="btn-primary w-full sm:w-auto px-4 py-2 font-bold text-[10px] uppercase tracking-wider"
                        >
                          Avaliar RUV
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pendingUsers.length > 0 && (
                <div className="space-y-2 pt-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                    <Icon name="person_add" className="text-xs" />
                    Novos Cadastros Pendentes
                  </p>
                  <div className="space-y-2">
                    {pendingUsers.map((u) => (
                      <div
                        key={u.id}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 rounded-lg bg-[#0b132b]/80 border border-white/5 p-3 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-200">
                            Cadastro: {u.name}
                          </p>
                          <p className="text-slate-400 mt-0.5">
                            {u.email} | Cargo: {u.role}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedUser(u)}
                          className="btn-primary w-full sm:w-auto px-4 py-2 font-bold text-[10px] uppercase tracking-wider bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          Avaliar Cadastro
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Abas */}
          <div className="raised-card overflow-hidden">
            <div className="border-b border-outline-variant px-4 py-3 flex gap-4 bg-surface-container-high/40 overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`pb-1 text-xs font-bold uppercase tracking-wider border-b-2 transition whitespace-nowrap ${
                    activeTab === t.id
                      ? "border-primary text-primary"
                      : "border-transparent text-on-surface-variant hover:text-slate-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="divide-y divide-outline-variant/20 p-4">
              {filteredNotifications.length === 0 ? (
                <p className="py-6 text-center text-xs text-on-surface-variant uppercase">
                  Nenhuma notificação neste filtro.
                </p>
              ) : (
                filteredNotifications.map((n) => (
                  <div key={n.id} className="py-3 flex items-start gap-3 text-xs hover:bg-white/5 transition px-2 rounded-lg">
                    <span
                      className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                        n.severity === "error"
                          ? "bg-error-container/20 text-error"
                          : n.severity === "warning"
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-primary/10 text-primary"
                      }`}
                    >
                      <Icon
                        name={
                          n.category === "sistema"
                            ? "thermostat"
                            : n.category === "antt"
                              ? "gavel"
                              : n.category === "motoristas"
                                ? "face"
                                : "assignment"
                        }
                        className="text-sm"
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-slate-100">{n.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{n.timestamp}</p>
                      </div>
                      <p className="text-slate-300 mt-1">{n.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Side Event Simulator Panel */}
        <div className="lg:col-span-4">
          <div className="raised-card p-6 bg-[#0b132b]/80 border border-outline-variant/30 text-slate-100">
            <h3 className="mb-4 flex items-center gap-2 text-headline-sm text-primary font-bold">
              <Icon name="videogame_asset" />
              Simulador Telemetria
            </h3>
            <p className="text-xs text-on-surface-variant mb-6">
              Mule simulador de eventos em tempo real para testar reatividade dos alarmes e HUD de RUVs na central.
            </p>
            
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleSimulateEvent("thermal")}
                className="w-full flex items-center gap-3 bg-error/10 hover:bg-error/20 border border-error/20 p-3 rounded-lg text-xs font-semibold text-error transition"
              >
                <Icon name="thermostat" />
                Disparar Alerta Térmico
              </button>
              
              <button
                type="button"
                onClick={() => handleSimulateEvent("fatigue")}
                className="w-full flex items-center gap-3 bg-error/10 hover:bg-error/20 border border-error/20 p-3 rounded-lg text-xs font-semibold text-error transition"
              >
                <Icon name="visibility" />
                Disparar Alerta Fadiga
              </button>
              
              <button
                type="button"
                onClick={() => handleSimulateEvent("antt")}
                className="w-full flex items-center gap-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 p-3 rounded-lg text-xs font-semibold text-amber-500 transition"
              >
                <Icon name="navigation" />
                Desvio de Corredor ANTT
              </button>
              
              <button
                type="button"
                onClick={() => handleSimulateEvent("ruv")}
                className="w-full flex items-center gap-3 bg-primary/10 hover:bg-primary/20 border border-primary/20 p-3 rounded-lg text-xs font-semibold text-primary transition"
              >
                <Icon name="assignment" />
                Simular Requisição RUV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Decision HUD Modal */}
      <FormModal
        open={!!selectedRuv}
        onClose={() => {
          setSelectedRuv(null);
          setJustification("");
          setActionSuccess("");
        }}
        title={`RUV # ${selectedRuv?.auth_number}`}
        subtitle="Auditoria Rápida RUV"
      >
        {selectedRuv && (
          <div className="space-y-4 text-slate-100">
            <div className="rounded-lg bg-surface-container-high p-4 space-y-2 text-xs">
              <p><strong>Requisitante:</strong> {selectedRuv.requester_name}</p>
              <p><strong>Destino:</strong> {selectedRuv.destination}</p>
              <p><strong>Objetivo:</strong> {selectedRuv.service}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="decision_comment" className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">
                  Justificativa / Comentário (Obrigatório para Rejeições)
                </label>
                <textarea
                  id="decision_comment"
                  rows={3}
                  className="input-fleet min-h-[80px]"
                  placeholder="Justificativa técnica..."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                />
              </div>

              {actionSuccess && <p className="text-sm font-semibold text-green-400">{actionSuccess}</p>}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={processing || !!actionSuccess}
                  onClick={() => handleDecision(false)}
                  className="btn-outline border-error text-error py-2.5 rounded-lg text-xs font-bold uppercase hover:bg-error/10 transition"
                >
                  Rejeitar
                </button>
                <button
                  type="button"
                  disabled={processing || !!actionSuccess}
                  onClick={() => handleDecision(true)}
                  className="btn-primary py-2.5 rounded-lg text-xs font-bold uppercase"
                >
                  Aprovar
                </button>
              </div>
            </div>
          </div>
        )}
      </FormModal>

      <FormModal
        open={!!selectedUser}
        onClose={() => {
          setSelectedUser(null);
          setActionSuccess("");
        }}
        title={`Aprovação de Cadastro`}
        subtitle={`REVISÃO DO USUÁRIO: ${selectedUser?.name}`}
      >
        {selectedUser && (
          <div className="space-y-4 text-slate-100">
            <div className="rounded-lg bg-surface-container-high p-4 space-y-2 text-xs">
              <p><strong>Nome Completo:</strong> {selectedUser.name}</p>
              <p><strong>E-mail:</strong> {selectedUser.email}</p>
              <p><strong>Cargo Solicitado:</strong> {selectedUser.role}</p>
              <p><strong>Cadastrado em:</strong> {new Date(selectedUser.created_at).toLocaleDateString("pt-BR")}</p>
            </div>

            <div className="space-y-3">
              {actionSuccess && <p className="text-sm font-semibold text-green-400">{actionSuccess}</p>}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={processing || !!actionSuccess}
                  onClick={() => handleUserDecision(false)}
                  className="btn-outline border-error text-error py-2.5 rounded-lg text-xs font-bold uppercase hover:bg-error/10 transition"
                >
                  Recusar Registro
                </button>
                <button
                  type="button"
                  disabled={processing || !!actionSuccess}
                  onClick={() => handleUserDecision(true)}
                  className="btn-primary py-2.5 rounded-lg text-xs font-bold uppercase"
                >
                  Aprovar Cadastro
                </button>
              </div>
            </div>
          </div>
        )}
      </FormModal>
    </AppShell>
  );
}
