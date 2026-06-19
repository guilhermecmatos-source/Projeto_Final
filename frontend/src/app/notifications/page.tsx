"use client";

import { useState, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import { showToast } from "@/components/ui/Toast";

type TabId = "all" | "sys" | "client" | "ruv";
type NotificationType = "sys" | "client" | "ruv";

interface Notification {
  id: string;
  type: NotificationType;
  category: string;
  categoryColor: string;
  iconName: string;
  iconColor: string;
  borderColor: string;
  title: string;
  description: string;
  date: string;
  isRead: boolean;
  isSolicitation?: boolean;
  solicitationData?: {
    vehicle: string;
    driver: string;
    route: string;
    passengers: string;
    requestedBy: string;
    ruvId: string;
  };
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    type: "sys",
    category: "PROBLEMA DO SISTEMA",
    categoryColor: "text-[#FCA311]",
    iconName: "warning",
    iconColor: "text-[#FCA311]",
    borderColor: "border-t-2 border-t-[#FCA311] border-l-2 border-l-[#FCA311] border-r border-r-outline-variant/30 border-b border-b-outline-variant/30",
    title: "ALERTA CRÍTICO: PRESSÃO PNEUS (FLT-0130)",
    description: "Sensores de temperatura e pressão na banda de rodagem detectaram pressão abaixo do nível seguro para frenagem de emergência.",
    date: "2026-06-17 01:39",
    isRead: false,
  },
  {
    id: "notif-2",
    type: "client",
    category: "ATUALIZAÇÕES DO CLIENTE",
    categoryColor: "text-blue-400",
    iconName: "info",
    iconColor: "text-blue-400",
    borderColor: "border border-blue-500/30",
    title: "RELATÓRIO DE HOMOLOGAÇÃO ANTT",
    description: "O cadastro do motorista Roberto Souza foi atualizado junto à base de dados nacional da ANTT.",
    date: "2026-06-17 01:37",
    isRead: false,
  },
  {
    id: "notif-3",
    type: "ruv",
    category: "SOLICITAÇÕES",
    categoryColor: "text-[#FCA311]",
    iconName: "assignment_ind",
    iconColor: "text-[#FCA311]",
    borderColor: "border border-[#FCA311]/30",
    title: "SOLICITAÇÃO DE VIAGEM RUV-6452",
    description: "O condutor Carlos Silveira solicitou o veículo Mercedes-Benz Atego 2426 em pátio operacional.",
    date: "2026-06-17 01:37",
    isRead: false,
    isSolicitation: true,
    solicitationData: {
      vehicle: "Mercedes-Benz Atego 2426",
      driver: "Carlos Silveira",
      route: "Matriz São Paulo (SP) ➔ São José dos Campos (SP)",
      passengers: "Carona Corporativa 2",
      requestedBy: "Carlos Silveira",
      ruvId: "RUV-6452",
    },
  },
  {
    id: "notif-4",
    type: "ruv",
    category: "SOLICITAÇÕES",
    categoryColor: "text-[#FCA311]",
    iconName: "assignment_ind",
    iconColor: "text-[#FCA311]",
    borderColor: "border border-outline-variant/30",
    title: "SOLICITAÇÃO DE VIAGEM RUV-1768",
    description: "O condutor Marcos Pereira solicitou o veículo Volvo FH 540 para rota interestadual.",
    date: "2026-06-09 21:27",
    isRead: false,
    isSolicitation: true,
    solicitationData: {
      vehicle: "Volvo FH 540",
      driver: "Marcos Pereira",
      route: "São Paulo (SP) ➔ Curitiba (PR)",
      passengers: "Sem passageiros",
      requestedBy: "Marcos Pereira",
      ruvId: "RUV-1768",
    },
  },
];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  const getTabCounts = useCallback(() => {
    const unread = notifications.filter((n) => !n.isRead);
    return {
      all: unread.length,
      sys: unread.filter((n) => n.type === "sys").length,
      client: unread.filter((n) => n.type === "client").length,
      ruv: unread.filter((n) => n.type === "ruv").length,
    };
  }, [notifications]);

  const counts = getTabCounts();

  const TABS: { id: TabId; label: string; count: number }[] = [
    { id: "all", label: "Histórico Completo", count: counts.all },
    { id: "sys", label: "Sistema Gps/Telemetria", count: counts.sys },
    { id: "client", label: "Cliente & ANTT", count: counts.client },
    { id: "ruv", label: "Motoristas & RUVs", count: counts.ruv },
  ];

  const filteredNotifications = activeTab === "all"
    ? notifications.filter((n) => !n.isRead)
    : notifications.filter((n) => n.type === activeTab && !n.isRead);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    showToast("Notificação marcada como lida.", "success");
  };

  const handleMarkAllAsRead = () => {
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    if (unreadCount === 0) {
      showToast("Não há notificações pendentes para marcar.", "info");
      return;
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast(`${unreadCount} notificações marcadas como lidas.`, "success");
  };

  const handleClearRead = () => {
    const readCount = notifications.filter((n) => n.isRead).length;
    if (readCount === 0) {
      showToast("Não há notificações lidas para limpar.", "info");
      return;
    }
    setNotifications((prev) => prev.filter((n) => !n.isRead));
    showToast(`${readCount} notificações lidas removidas.`, "success");
  };

  const handleReject = (notifId: string, ruvId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
    );
    showToast(`Solicitação ${ruvId} rejeitada com sucesso.`, "error");
  };

  const handleAuthorize = (notifId: string, ruvId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
    );
    showToast(`Viagem ${ruvId} autorizada com sucesso!`, "success");
  };

  const handleEmitRUV = () => {
    const newId = `notif-${Date.now()}`;
    const ruvNumber = Math.floor(1000 + Math.random() * 9000);
    const newNotif: Notification = {
      id: newId,
      type: "ruv",
      category: "SOLICITAÇÕES",
      categoryColor: "text-[#FCA311]",
      iconName: "assignment_ind",
      iconColor: "text-[#FCA311]",
      borderColor: "border border-[#FCA311]/30",
      title: `SOLICITAÇÃO DE VIAGEM RUV-${ruvNumber}`,
      description: `Nova solicitação de RUV emitida pelo simulador de eventos em ${new Date().toLocaleTimeString("pt-BR")}.`,
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      isRead: false,
      isSolicitation: true,
      solicitationData: {
        vehicle: "Scania R 450",
        driver: "Simulação de Motorista",
        route: "São Paulo (SP) ➔ Belo Horizonte (MG)",
        passengers: "Sem passageiros",
        requestedBy: "Sistema Simulador",
        ruvId: `RUV-${ruvNumber}`,
      },
    };
    setNotifications((prev) => [newNotif, ...prev]);
    showToast(`Nova RUV-${ruvNumber} emitida e adicionada ao feed.`, "success");
  };

  const handleMechanicalFailure = () => {
    const newId = `notif-${Date.now()}`;
    const fltCode = `FLT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newNotif: Notification = {
      id: newId,
      type: "sys",
      category: "PROBLEMA DO SISTEMA",
      categoryColor: "text-[#FCA311]",
      iconName: "warning",
      iconColor: "text-[#FCA311]",
      borderColor: "border-t-2 border-t-error border-l-2 border-l-error border-r border-r-outline-variant/30 border-b border-b-outline-variant/30",
      title: `ALERTA: FALHA MECÂNICA DETECTADA (${fltCode})`,
      description: `Sensores do veículo ${fltCode} detectaram anomalia no sistema de freios. Diagnóstico remoto em andamento.`,
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    showToast(`Alerta de falha mecânica disparado para ${fltCode}.`, "error");
  };

  const handleCorporatePost = () => {
    const newId = `notif-${Date.now()}`;
    const newNotif: Notification = {
      id: newId,
      type: "client",
      category: "COMUNICADO CORPORATIVO",
      categoryColor: "text-green-400",
      iconName: "campaign",
      iconColor: "text-green-400",
      borderColor: "border border-green-500/30",
      title: "COMUNICADO: ATUALIZAÇÃO DE POLÍTICA OPERACIONAL",
      description: `Novo comunicado corporativo publicado em ${new Date().toLocaleTimeString("pt-BR")}. Todos os motoristas devem aderir às novas diretrizes de segurança.`,
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    showToast("Comunicado corporativo publicado com sucesso.", "success");
  };

  const pendingCount = unreadNotifications.length;
  const criticalCount = unreadNotifications.filter((n) => n.type === "sys").length;

  return (
    <AppShell>
      <PageHeader
        breadcrumb="SEDE CENTRAL / UNIDADE OPERACIONAL / NOTIFICATIONS"
        title="Central de Notificações & Solicitações"
        subtitle="Homologação e auditoria integrada em tempo real. Monitore alertas do sistema, comunicados do cliente e aprove as RUVs de motoristas."
        actions={
          <div className="flex gap-2">
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1.5 rounded-lg border border-[#FCA311]/50 bg-[#FCA311]/10 px-4 py-2 text-xs font-bold uppercase text-[#FCA311] hover:bg-[#FCA311]/20 transition"
            >
              <Icon name="check_circle" className="text-sm" /> Lidas
            </button>
            <button
              onClick={handleClearRead}
              className="flex items-center gap-1.5 rounded-lg border border-error/50 bg-error/10 px-4 py-2 text-xs font-bold uppercase text-error hover:bg-error/20 transition"
            >
              <Icon name="delete_sweep" className="text-sm" /> Limpar Lidas
            </button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Side: Summary & Simulator */}
        <div className="lg:col-span-4 space-y-6">
          <div className="raised-card p-5 bg-[#0c132b]/80 border-outline-variant/30">
            <h3 className="text-[10px] font-bold text-[#FCA311] uppercase tracking-wider mb-4">
              SUMÁRIO OPERACIONAL
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl border border-outline-variant/20 bg-[#0F172A] p-3">
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center justify-between">
                  TOTAL SOLICITAÇÕES <Icon name="list_alt" className="text-[10px]" />
                </p>
                <p className="text-2xl font-bold text-white">{notifications.length}</p>
              </div>
              <div className="rounded-xl border border-outline-variant/20 bg-[#0F172A] p-3">
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center justify-between">
                  PENDENTES <Icon name="schedule" className="text-[10px]" />
                </p>
                <p className="text-2xl font-bold text-[#FCA311]">{pendingCount}</p>
              </div>
            </div>
            <div className="rounded-xl border border-error/20 bg-error/5 p-4 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">ALERTAS ATIVOS DE SISTEMA</p>
                <p className="text-lg font-bold text-error flex items-center gap-2">
                  <Icon name="show_chart" className="text-error animate-pulse" /> {criticalCount} Críticos
                </p>
              </div>
            </div>
          </div>

          <div className="raised-card p-5 bg-[#0c132b]/80 border-outline-variant/30">
            <h3 className="text-[10px] font-bold text-[#FCA311] uppercase tracking-wider mb-2 flex items-center gap-2">
              <Icon name="hub" className="text-sm" /> SIMULADOR DE EVENTOS
            </h3>
            <p className="text-[10px] text-slate-400 mb-5 leading-relaxed">
              Utilize o console abaixo para emitir solicitações de motoristas ou alertas do veículo pátio de forma instantânea.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleEmitRUV}
                className="w-full flex items-center justify-between gap-3 bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition text-left"
              >
                <span className="flex items-center gap-2"><Icon name="add_circle" className="text-sm" /> Emitir Nova RUV de Motorista</span>
                <span className="text-[8px] bg-blue-500/20 px-1.5 py-0.5 rounded">RUV</span>
              </button>
              <button
                onClick={handleMechanicalFailure}
                className="w-full flex items-center justify-between gap-3 bg-error/5 border border-error/30 p-3 rounded-lg text-xs font-bold text-error hover:bg-error/10 transition text-left"
              >
                <span className="flex items-center gap-2"><Icon name="warning" className="text-sm" /> Disparar Falha Mecânica</span>
                <span className="text-[8px] bg-error/20 px-1.5 py-0.5 rounded">ALERTA</span>
              </button>
              <button
                onClick={handleCorporatePost}
                className="w-full flex items-center justify-between gap-3 bg-green-500/5 border border-green-500/30 p-3 rounded-lg text-xs font-bold text-green-400 hover:bg-green-500/10 transition text-left"
              >
                <span className="flex items-center gap-2"><Icon name="campaign" className="text-sm" /> Postar Comunicado Corporativo</span>
                <span className="text-[8px] bg-green-500/20 px-1.5 py-0.5 rounded">INFO</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Feed */}
        <div className="lg:col-span-8 flex flex-col">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap ${
                  activeTab === t.id
                    ? "bg-blue-600 text-white"
                    : "bg-[#0F172A] border border-outline-variant/30 text-slate-400 hover:bg-[#0F172A]/80"
                }`}
              >
                {t.label}
                {t.count > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    activeTab === t.id ? "bg-white/20 text-white" : "bg-slate-800 text-slate-300"
                  }`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Feed List */}
          <div className="space-y-4">
            {filteredNotifications.length === 0 && (
              <div className="raised-card p-8 bg-[#0c132b]/80 border border-outline-variant/30 rounded-xl text-center">
                <Icon name="notifications_off" className="text-4xl text-slate-600 mb-3 block mx-auto" />
                <p className="text-sm font-bold text-slate-400">Nenhuma notificação pendente</p>
                <p className="text-xs text-slate-500 mt-1">
                  {activeTab === "all"
                    ? "Todas as notificações foram processadas."
                    : "Nenhuma notificação nesta categoria."}
                </p>
              </div>
            )}

            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`raised-card p-5 bg-[#0c132b]/80 ${notif.borderColor} rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[8px] font-bold ${notif.categoryColor} uppercase tracking-widest`}>
                    {notif.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{notif.date}</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className={`mt-1 w-6 h-6 rounded-md border ${
                    notif.iconColor === "text-[#FCA311]" ? "border-[#FCA311]/50 bg-[#FCA311]/10" :
                    notif.iconColor === "text-blue-400" ? "border-blue-400/50 bg-blue-400/10" :
                    notif.iconColor === "text-green-400" ? "border-green-400/50 bg-green-400/10" :
                    "border-error/50 bg-error/10"
                  } flex items-center justify-center shrink-0`}>
                    <Icon name={notif.iconName} className={`text-sm ${notif.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white mb-1 uppercase">{notif.title}</h4>
                    <p className="text-xs text-slate-400 mb-4">{notif.description}</p>

                    {/* Solicitation detail box */}
                    {notif.isSolicitation && notif.solicitationData && (
                      <div className="rounded-xl border border-outline-variant/20 bg-[#0F172A]/80 p-4 mb-4">
                        <h5 className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                          <Icon name="check_circle" className="text-xs" /> ACORDO TÉCNICO DE HOMOLOGAÇÃO DE PÁTIO
                        </h5>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-[8px] font-bold text-slate-500 uppercase mb-0.5">VEÍCULO ALOCADO</p>
                            <p className="text-[10px] font-bold text-white">{notif.solicitationData.vehicle}</p>
                          </div>
                          <div>
                            <p className="text-[8px] font-bold text-slate-500 uppercase mb-0.5">MOTORISTA PILOTO</p>
                            <p className="text-[10px] font-bold text-white">{notif.solicitationData.driver}</p>
                          </div>
                          <div>
                            <p className="text-[8px] font-bold text-slate-500 uppercase mb-0.5">TRAJETÓRIA PREVISTA</p>
                            <p className="text-[10px] font-bold text-[#FCA311]">{notif.solicitationData.route}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-outline-variant/10 pt-3">
                          <div className="flex gap-6">
                            <div>
                              <p className="text-[8px] font-bold text-slate-500 uppercase mb-0.5">Carona/Passageiros</p>
                              <p className="text-[10px] font-bold text-slate-300">{notif.solicitationData.passengers}</p>
                            </div>
                            <div>
                              <p className="text-[8px] font-bold text-slate-500 uppercase mb-0.5">Solicitado por</p>
                              <p className="text-[10px] font-bold text-slate-300">{notif.solicitationData.requestedBy}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReject(notif.id, notif.solicitationData!.ruvId)}
                              className="flex items-center gap-1.5 px-4 py-2 border border-error/50 text-error rounded-lg text-[10px] font-bold uppercase hover:bg-error/10 transition"
                            >
                              <Icon name="close" className="text-xs" /> REJEITAR
                            </button>
                            <button
                              onClick={() => handleAuthorize(notif.id, notif.solicitationData!.ruvId)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-[10px] font-bold uppercase transition"
                            >
                              <Icon name="check" className="text-xs" /> AUTORIZAR VIAGEM
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mark as Read for non-solicitation items */}
                    {!notif.isSolicitation && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="text-[9px] font-bold text-slate-400 hover:text-white uppercase tracking-wider transition"
                        >
                          MARCAR COMO LIDA
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Read notifications summary */}
            {readNotifications.length > 0 && activeTab === "all" && (
              <div className="raised-card p-4 bg-[#0c132b]/40 border border-outline-variant/20 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {readNotifications.length} notificação(ões) lida(s)
                  </span>
                  <button
                    onClick={handleClearRead}
                    className="text-[9px] font-bold text-error hover:text-red-400 uppercase tracking-wider transition"
                  >
                    Limpar todas
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
