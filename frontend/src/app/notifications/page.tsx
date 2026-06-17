"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";

type TabId = "all" | "sys" | "client" | "ruv";

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("all");

  const TABS = [
    { id: "all", label: "Histórico Completo", count: 4, active: true },
    { id: "sys", label: "Sistema Gps/Telemetria", count: 1 },
    { id: "client", label: "Cliente & ANTT", count: 1 },
    { id: "ruv", label: "Motoristas & RUVs", count: 2 },
  ];

  return (
    <AppShell>
      <PageHeader
        breadcrumb="SEDE CENTRAL / UNIDADE OPERACIONAL / NOTIFICATIONS"
        title="Central de Notificações & Solicitações"
        subtitle="Homologação e auditoria integrada em tempo real. Monitore alertas do sistema, comunicados do cliente e aprove as RUVs de motoristas."
        actions={
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-[#FCA311]/50 bg-[#FCA311]/10 px-4 py-2 text-xs font-bold uppercase text-[#FCA311] hover:bg-[#FCA311]/20 transition">
              <Icon name="check_circle" className="text-sm" /> Lidas
            </button>
            <button className="flex items-center gap-1.5 rounded-lg border border-error/50 bg-error/10 px-4 py-2 text-xs font-bold uppercase text-error hover:bg-error/20 transition">
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
                <p className="text-2xl font-bold text-white">13</p>
              </div>
              <div className="rounded-xl border border-outline-variant/20 bg-[#0F172A] p-3">
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center justify-between">
                  PENDENTES <Icon name="schedule" className="text-[10px]" />
                </p>
                <p className="text-2xl font-bold text-[#FCA311]">1</p>
              </div>
            </div>
            <div className="rounded-xl border border-error/20 bg-error/5 p-4 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">ALERTAS ATIVOS DE SISTEMA</p>
                <p className="text-lg font-bold text-error flex items-center gap-2">
                  <Icon name="show_chart" className="text-error animate-pulse" /> 1 Críticos
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
              <button className="w-full flex items-center justify-between gap-3 bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition text-left">
                <span className="flex items-center gap-2"><Icon name="add_circle" className="text-sm" /> Emitir Nova RUV de Motorista</span>
                <span className="text-[8px] bg-blue-500/20 px-1.5 py-0.5 rounded">RUV</span>
              </button>
              <button className="w-full flex items-center justify-between gap-3 bg-error/5 border border-error/30 p-3 rounded-lg text-xs font-bold text-error hover:bg-error/10 transition text-left">
                <span className="flex items-center gap-2"><Icon name="warning" className="text-sm" /> Disparar Falha Mecânica</span>
                <span className="text-[8px] bg-error/20 px-1.5 py-0.5 rounded">ALERTA</span>
              </button>
              <button className="w-full flex items-center justify-between gap-3 bg-green-500/5 border border-green-500/30 p-3 rounded-lg text-xs font-bold text-green-400 hover:bg-green-500/10 transition text-left">
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
                onClick={() => setActiveTab(t.id as TabId)}
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
            {/* Alerta Crítico */}
            <div className="raised-card p-5 bg-[#0c132b]/80 border-t-2 border-t-[#FCA311] border-l-2 border-l-[#FCA311] border-r border-r-outline-variant/30 border-b border-b-outline-variant/30 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] font-bold text-[#FCA311] uppercase tracking-widest">PROBLEMA DO SISTEMA</span>
                <span className="text-[10px] text-slate-500 font-mono">2026-06-17 01:39</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 w-6 h-6 rounded-md border border-[#FCA311]/50 bg-[#FCA311]/10 flex items-center justify-center shrink-0">
                  <Icon name="warning" className="text-sm text-[#FCA311]" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white mb-1 uppercase">ALERTA CRÍTICO: PRESSÃO PNEUS (FLT-0130)</h4>
                  <p className="text-xs text-slate-400 mb-4">Sensores de temperatura e pressão na banda de rodagem detectaram pressão abaixo do nível seguro para frenagem de emergência.</p>
                  <div className="flex justify-end">
                    <button className="text-[9px] font-bold text-slate-400 hover:text-white uppercase tracking-wider transition">MARCAR COMO LIDA</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Atualização Cliente */}
            <div className="raised-card p-5 bg-[#0c132b]/80 border border-blue-500/30 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">ATUALIZAÇÕES DO CLIENTE</span>
                <span className="text-[10px] text-slate-500 font-mono">2026-06-17 01:37</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 w-6 h-6 rounded-md border border-blue-400/50 bg-blue-400/10 flex items-center justify-center shrink-0">
                  <Icon name="info" className="text-sm text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white mb-1 uppercase">RELATÓRIO DE HOMOLOGAÇÃO ANTT</h4>
                  <p className="text-xs text-slate-400 mb-4">O cadastro do motorista Roberto Souza foi atualizado junto à base de dados nacional da ANTT.</p>
                  <div className="flex justify-end">
                    <button className="text-[9px] font-bold text-slate-400 hover:text-white uppercase tracking-wider transition">MARCAR COMO LIDA</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Solicitação RUV */}
            <div className="raised-card p-5 bg-[#0c132b]/80 border border-[#FCA311]/30 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] font-bold text-[#FCA311] uppercase tracking-widest">SOLICITAÇÕES</span>
                <span className="text-[10px] text-slate-500 font-mono">2026-06-17 01:37</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 w-6 h-6 rounded-md border border-[#FCA311]/50 bg-[#FCA311]/10 flex items-center justify-center shrink-0">
                  <Icon name="assignment_ind" className="text-sm text-[#FCA311]" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white mb-1 uppercase">SOLICITAÇÃO DE VIAGEM RUV-6452</h4>
                  <p className="text-xs text-slate-400 mb-4">O condutor Carlos Silveira solicitou o veículo Mercedes-Benz Atego 2426 em pátio operacional.</p>
                  
                  {/* Expanded detail box */}
                  <div className="rounded-xl border border-outline-variant/20 bg-[#0F172A]/80 p-4">
                    <h5 className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Icon name="check_circle" className="text-xs" /> ACORDO TÉCNICO DE HOMOLOGAÇÃO DE PÁTIO
                    </h5>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-[8px] font-bold text-slate-500 uppercase mb-0.5">VEÍCULO ALOCADO</p>
                        <p className="text-[10px] font-bold text-white">Mercedes-Benz Atego 2426</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-slate-500 uppercase mb-0.5">MOTORISTA PILOTO</p>
                        <p className="text-[10px] font-bold text-white">Carlos Silveira</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-slate-500 uppercase mb-0.5">TRAJETÓRIA PREVISTA</p>
                        <p className="text-[10px] font-bold text-[#FCA311]">Matriz São Paulo (SP) ➔ São José dos Campos (SP)</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-outline-variant/10 pt-3">
                      <div className="flex gap-6">
                        <div>
                          <p className="text-[8px] font-bold text-slate-500 uppercase mb-0.5">Carona/Passageiros</p>
                          <p className="text-[10px] font-bold text-slate-300">Carona Corporativa 2</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-bold text-slate-500 uppercase mb-0.5">Solicitado por</p>
                          <p className="text-[10px] font-bold text-slate-300">Carlos Silveira</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex items-center gap-1.5 px-4 py-2 border border-error/50 text-error rounded-lg text-[10px] font-bold uppercase hover:bg-error/10 transition">
                          <Icon name="close" className="text-xs" /> REJEITAR
                        </button>
                        <button className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-[10px] font-bold uppercase transition">
                          <Icon name="check" className="text-xs" /> AUTORIZAR VIAGEM
                        </button>
                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>

            {/* Generic RUV request bottom cut off */}
            <div className="raised-card p-5 bg-[#0c132b]/80 border border-outline-variant/30 rounded-xl opacity-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] font-bold text-[#FCA311] uppercase tracking-widest">SOLICITAÇÕES</span>
                <span className="text-[10px] text-slate-500 font-mono">2026-06-09 21:27</span>
              </div>
              <h4 className="text-sm font-bold text-white uppercase ml-9">SOLICITAÇÃO DE VIAGEM RUV-1768</h4>
            </div>

          </div>
        </div>
      </div>
    </AppShell>
  );
}
