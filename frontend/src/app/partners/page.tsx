"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";

export default function PartnersPage() {
  const router = useRouter();

  // Modal States
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [dossieModalOpen, setDossieModalOpen] = useState(false);
  
  // Tabs for Dossie
  const [dossieTab, setDossieTab] = useState<"visao" | "auditoria" | "avaliacoes">("visao");

  return (
    <AppShell>
      <header className="mb-8">
        <p className="text-[9px] font-bold uppercase text-[#FCA311] tracking-widest mb-2 flex items-center gap-2">
          SEDE CENTRAL / UNIDADE OPERACIONAL / <span className="text-white">PARTNERS</span>
        </p>
        <h1 className="text-2xl font-black text-[#FCA311] tracking-wide mb-1">Gestão de Parceiros & Oficinas</h1>
        <p className="text-[11px] text-slate-400 font-medium">
          Rede credenciada autorizada para reparos preventivos e suporte técnico.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Partners List */}
        <div className="lg:col-span-2 raised-card bg-[#0c132b]/80 border-outline-variant/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Icon name="build" className="text-[#FCA311] text-lg" />
            <h3 className="text-[11px] font-bold text-[#FCA311] uppercase tracking-widest">Rede Credenciada Recomendada por Proximidade GPS</h3>
          </div>

          <div className="space-y-4">
            {/* Partner 1 */}
            <div 
              className="group cursor-pointer rounded-xl border border-outline-variant/20 bg-[#0F172A] p-4 hover:border-[#FCA311]/50 transition"
              onClick={() => setProfileModalOpen(true)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-[11px] font-bold text-[#FCA311] group-hover:text-yellow-400 transition">
                    REPAS MECÂNICA PESADOS SP <span className="text-[9px] text-blue-400 font-normal ml-1">(clique para ver perfil)</span>
                  </h4>
                  <p className="text-[9px] text-slate-400 flex items-center gap-1 mt-1">
                    <Icon name="location_on" className="text-[10px] text-blue-400" /> Av. do Estado, 4522, São Paulo
                  </p>
                  <p className="text-[9px] text-slate-500 mt-0.5">Contato Comercial: (11) 4004-9214</p>
                </div>
                <div className="text-right">
                  <span className="text-[8px] font-black text-error bg-error/10 px-2 py-0.5 rounded uppercase tracking-wider">Capacidade Elevada</span>
                  <p className="text-[11px] font-black text-[#FCA311] mt-2 flex items-center justify-end gap-1"><Icon name="star" className="text-[10px]" /> 4.8</p>
                </div>
              </div>
            </div>

            {/* Partner 2 */}
            <div className="group cursor-pointer rounded-xl border border-outline-variant/20 bg-[#0F172A] p-4 hover:border-[#FCA311]/50 transition">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-[11px] font-bold text-[#FCA311] group-hover:text-yellow-400 transition">
                    MECÂNICA E RETÍFICA ROAD-TRUCK <span className="text-[9px] text-blue-400 font-normal ml-1">(clique para ver perfil)</span>
                  </h4>
                  <p className="text-[9px] text-slate-400 flex items-center gap-1 mt-1">
                    <Icon name="location_on" className="text-[10px] text-blue-400" /> Rodovia Anhanguera, Km 98, Campinas
                  </p>
                  <p className="text-[9px] text-slate-500 mt-0.5">Contato Comercial: (19) 3922-1044</p>
                </div>
                <div className="text-right">
                  <span className="text-[8px] font-black text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded uppercase tracking-wider">Vagas Médias</span>
                  <p className="text-[11px] font-black text-[#FCA311] mt-2 flex items-center justify-end gap-1"><Icon name="star" className="text-[10px]" /> 4.5</p>
                </div>
              </div>
            </div>

            {/* Partner 3 */}
            <div className="group cursor-pointer rounded-xl border border-outline-variant/20 bg-[#0F172A] p-4 hover:border-[#FCA311]/50 transition">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-[11px] font-bold text-[#FCA311] group-hover:text-yellow-400 transition">
                    OFICINA DE CAMINHÕES CAR VALLE <span className="text-[9px] text-blue-400 font-normal ml-1">(clique para ver perfil)</span>
                  </h4>
                  <p className="text-[9px] text-slate-400 flex items-center gap-1 mt-1">
                    <Icon name="location_on" className="text-[10px] text-blue-400" /> Rua do Porto, 14, Rio de Janeiro
                  </p>
                  <p className="text-[9px] text-slate-500 mt-0.5">Contato Comercial: (21) 98224-1189</p>
                </div>
                <div className="text-right">
                  <span className="text-[8px] font-black text-green-400 bg-green-400/10 px-2 py-0.5 rounded uppercase tracking-wider">Livre</span>
                  <p className="text-[11px] font-black text-[#FCA311] mt-2 flex items-center justify-end gap-1"><Icon name="star" className="text-[10px]" /> 4.9</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Support Form */}
        <div className="raised-card bg-[#0c132b]/80 border-outline-variant/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="send" className="text-[#FCA311] text-lg" />
            <h3 className="text-[11px] font-bold text-[#FCA311] uppercase tracking-widest">CANAL DE SUPORTE OPERACIONAL</h3>
          </div>
          <p className="text-[9px] text-slate-400 mb-6 leading-relaxed">
            Teve sinistros na rodovia ou desvios inesperados? Abra uma ocorrência formal com a nossa central de controle de faturamento.
          </p>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                TÍTULO DO ASSUNTO / SINISTRO
              </label>
              <input 
                type="text" 
                placeholder="Ex: Escolta requerida na BR-116" 
                className="w-full rounded-lg bg-[#0F172A] border border-outline-variant/30 px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition"
              />
            </div>
            <div>
              <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                DETALHES ADICIONAIS
              </label>
              <textarea 
                placeholder="Descreva minuciosamente o ocorrido..." 
                rows={4}
                className="w-full rounded-lg bg-[#0F172A] border border-outline-variant/30 px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition resize-none"
              ></textarea>
            </div>
            <button type="submit" className="w-full rounded-lg bg-[#FCA311] hover:bg-yellow-500 py-3 text-[10px] font-black text-[#0c132b] uppercase tracking-widest transition shadow-lg shadow-yellow-900/20 mt-2">
              ABRIR TICKET CENTRALIZADO
            </button>
          </form>
        </div>
      </div>

      {/* --- MODAL 1: PERFIL CREDENCIADO GPS --- */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-outline-variant/20 rounded-2xl w-full max-w-[500px] shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="p-6 pb-4">
              <button 
                onClick={() => setProfileModalOpen(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition w-6 h-6 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10"
              >
                <Icon name="close" className="text-sm" />
              </button>
              <p className="text-[8px] font-bold text-[#FCA311] uppercase tracking-widest mb-1 bg-[#FCA311]/10 w-max px-2 py-0.5 rounded">PERFIL CREDENCIADO GPS</p>
              <h2 className="text-xl font-black text-[#FCA311] uppercase tracking-wide">REPAS MECÂNICA PESADOS SP</h2>
            </div>

            <div className="px-6 space-y-4">
              {/* Localização GPS */}
              <div>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">LOCALIZAÇÃO GPS</p>
                <p className="text-[10px] font-bold text-white flex items-center gap-1">
                  <Icon name="location_on" className="text-[12px] text-blue-500" /> Av. do Estado, 4522, São Paulo
                </p>
              </div>

              {/* Grid Data */}
              <div className="bg-[#0F172A] border border-outline-variant/10 rounded-xl p-4 grid grid-cols-2 gap-y-4">
                <div>
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">CHEFE OPERACIONAL</p>
                  <p className="text-[10px] font-bold text-white">Eng. Ricardo Albuquerque</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">CONTATO COMERCIAL</p>
                  <p className="text-[10px] font-bold text-white">(11) 4004-9214</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">AVALIAÇÃO DA FROTA</p>
                  <p className="text-[10px] font-black text-[#FCA311] flex items-center gap-1"><Icon name="star" className="text-[12px]" /> 4.8 / 5.0</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">TEMPO DE ATENDIMENTO</p>
                  <p className="text-[10px] font-bold text-green-400">40 min</p>
                </div>
              </div>

              {/* Tags */}
              <div>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-2">ESPECIALIDADES TÉCNICAS</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[9px] font-bold text-blue-400 border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 rounded-full">Troca de Freios</span>
                  <span className="text-[9px] font-bold text-blue-400 border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 rounded-full">Suspensão Pesada</span>
                  <span className="text-[9px] font-bold text-blue-400 border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 rounded-full">Sistemas Pneumáticos</span>
                  <span className="text-[9px] font-bold text-blue-400 border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 rounded-full">Injeção Diesel AI</span>
                </div>
              </div>

              {/* Acordo Comercial */}
              <div className="bg-[#0F172A] border border-green-500/20 rounded-xl p-3">
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">ACORDO COMERCIAL FLEETAI</p>
                <p className="text-[11px] font-bold text-green-400">15% de Desconto em Peças Originais</p>
              </div>
            </div>

            <div className="p-6 pt-4 space-y-2">
              <div className="flex gap-2">
                <button 
                  onClick={() => setProfileModalOpen(false)}
                  className="flex-1 rounded-lg border border-outline-variant/30 hover:bg-white/5 py-2 text-[10px] font-bold text-slate-300 transition"
                >
                  Fechar Perfil
                </button>
                <button 
                  onClick={() => {
                    setProfileModalOpen(false);
                    router.push("/command-center");
                  }}
                  className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-500 py-2 text-[10px] font-bold text-white transition"
                >
                  Entrar no Maps
                </button>
              </div>
              <button 
                onClick={() => {
                  setProfileModalOpen(false);
                  setDossieModalOpen(true);
                }}
                className="w-full rounded-lg bg-[#FCA311] hover:bg-yellow-500 py-2.5 text-[10px] font-black text-[#0c132b] uppercase tracking-widest transition"
              >
                ABRIR RELATÓRIO DA OFICINA EM NOVA ABA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: DOSSIÊ OPERACIONAL --- */}
      {dossieModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-outline-variant/20 rounded-2xl w-full max-w-[800px] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 pb-4 border-b border-outline-variant/10">
              <button 
                onClick={() => setDossieModalOpen(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition w-6 h-6 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10"
              >
                <Icon name="close" className="text-sm" />
              </button>
              
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[8px] font-bold text-green-400 uppercase tracking-widest bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Icon name="verified" className="text-[10px]" /> DOCUMENTO HOMOLOGADO LEDGER
                </span>
                <span className="text-[8px] font-mono text-slate-500">Verificação de Conformidade ID: #5093D4</span>
              </div>
              
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Icon name="build" className="text-[#FCA311]" /> Dossiê Operacional: REPAS MECÂNICA PESADOS SP
              </h2>
            </div>

            {/* Tabs */}
            <div className="px-6 flex border-b border-outline-variant/10 bg-[#0c132b]/50">
              <button
                onClick={() => setDossieTab("visao")}
                className={`px-4 py-3 text-[9px] font-bold uppercase tracking-widest transition border-b-2 ${
                  dossieTab === "visao" ? "text-[#FCA311] border-[#FCA311]" : "text-slate-500 border-transparent hover:text-slate-300"
                }`}
              >
                VISÃO DO CREDENCIAMENTO
              </button>
              <button
                onClick={() => setDossieTab("auditoria")}
                className={`px-4 py-3 text-[9px] font-bold uppercase tracking-widest transition border-b-2 ${
                  dossieTab === "auditoria" ? "text-[#FCA311] border-[#FCA311]" : "text-slate-500 border-transparent hover:text-slate-300"
                }`}
              >
                AUDITORIA DE HASH & LOGS
              </button>
              <button
                onClick={() => setDossieTab("avaliacoes")}
                className={`px-4 py-3 text-[9px] font-bold uppercase tracking-widest transition border-b-2 ${
                  dossieTab === "avaliacoes" ? "text-[#FCA311] border-[#FCA311]" : "text-slate-500 border-transparent hover:text-slate-300"
                }`}
              >
                AVALIAÇÕES DE CONDUTORES (2)
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              
              {/* TAB 1: VISÃO DO CREDENCIAMENTO */}
              {dossieTab === "visao" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-[#0F172A] border border-outline-variant/10 rounded-xl p-4">
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">ÍNDICE GERAL DE SLA</p>
                      <h4 className="text-xl font-black text-green-400">98.4%</h4>
                      <p className="text-[7px] text-slate-500 uppercase mt-1">Meta de frota pesada batida</p>
                    </div>
                    <div className="bg-[#0F172A] border border-outline-variant/10 rounded-xl p-4">
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">CAPACIDADE OPERACIONAL</p>
                      <h4 className="text-xl font-black text-[#FCA311]">65% Utilizada</h4>
                      <p className="text-[7px] text-slate-500 uppercase mt-1">Livre para mais envios</p>
                    </div>
                    <div className="bg-[#0F172A] border border-outline-variant/10 rounded-xl p-4">
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">RETORNOS MECÂNICOS</p>
                      <h4 className="text-xl font-black text-error">0% Reclamações</h4>
                      <p className="text-[7px] text-slate-500 uppercase mt-1">Garantias não acionadas</p>
                    </div>
                    <div className="bg-[#0F172A] border border-outline-variant/10 rounded-xl p-4">
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">CERTIFICAÇÃO ISO 9001</p>
                      <h4 className="text-xl font-black text-blue-400">Auditada</h4>
                      <p className="text-[7px] text-slate-500 uppercase mt-1">Válida até Mai/2026</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 bg-[#0F172A] border border-outline-variant/10 rounded-xl p-5">
                    <div className="space-y-3">
                      <p className="text-[9px] font-bold text-[#FCA311] uppercase tracking-widest mb-2">ATRIBUTOS HOMOLOGADOS</p>
                      <div className="flex justify-between border-b border-outline-variant/10 pb-1">
                        <span className="text-[10px] text-slate-400">Chefe Operacional:</span>
                        <span className="text-[10px] font-bold text-white">Eng. Ricardo Albuquerque</span>
                      </div>
                      <div className="flex justify-between border-b border-outline-variant/10 pb-1">
                        <span className="text-[10px] text-slate-400">Contato Comercial:</span>
                        <span className="text-[10px] font-bold text-white">(11) 4004-9214</span>
                      </div>
                      <div className="flex justify-between border-b border-outline-variant/10 pb-1">
                        <span className="text-[10px] text-slate-400">Tempo de Resposta:</span>
                        <span className="text-[10px] font-bold text-green-400">40 min</span>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span className="text-[10px] text-slate-400">Acordo de Cobrança:</span>
                        <span className="text-[10px] font-bold text-[#FCA311]">15% de Desconto em Peças Originais</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[9px] font-bold text-[#FCA311] uppercase tracking-widest mb-2">ESPECIALIDADES TÉCNICAS</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-[8px] font-bold text-blue-400 border border-blue-500/30 bg-[#0c132b] px-2 py-0.5 rounded-full">Troca de Freios</span>
                        <span className="text-[8px] font-bold text-blue-400 border border-blue-500/30 bg-[#0c132b] px-2 py-0.5 rounded-full">Suspensão Pesada</span>
                        <span className="text-[8px] font-bold text-blue-400 border border-blue-500/30 bg-[#0c132b] px-2 py-0.5 rounded-full">Sistemas Pneumáticos</span>
                        <span className="text-[8px] font-bold text-blue-400 border border-blue-500/30 bg-[#0c132b] px-2 py-0.5 rounded-full">Injeção Diesel AI</span>
                      </div>
                      
                      <div className="bg-[#0c132b] rounded-lg p-3 border border-outline-variant/10">
                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">ENDEREÇO EXECUTIVO</p>
                        <p className="text-[10px] font-bold text-white">Av. do Estado, 4522, São Paulo</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0c132b] border border-outline-variant/10 rounded-xl p-5">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">ANOTAÇÕES DO CENTRO DE CCO</p>
                    <p className="text-[9px] text-slate-400 mb-4">
                      Você pode salvar ressalvas mecânicas para este parceiro nesta sessão de controle. Isto será gravado diretamente no perfil do motorista de campo.
                    </p>
                    <textarea 
                      className="w-full h-20 bg-[#0F172A] border border-outline-variant/20 rounded-lg p-3 text-[10px] text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 resize-none mb-3"
                      placeholder="Ex: Recomendar priorizar esta oficina para carretas pesadas modelo Volvo FH da unidade de Palmas no Tocantins."
                    ></textarea>
                    <div className="flex justify-end">
                      <button className="bg-[#FCA311] hover:bg-yellow-500 text-[#0c132b] text-[9px] font-black uppercase px-4 py-2 rounded-lg transition shadow-lg shadow-yellow-900/20">
                        SALVAR OBSERVAÇÕES
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AUDITORIA DE HASH & LOGS */}
              {dossieTab === "auditoria" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">ASSINATURA CRIPTOGRÁFICA LEDGER</h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
                      Esta oficina parceira está vinculada a um hash de segurança homologado na rede descentralizada. Isto assegura que não há fraudes em abastecimentos de quilometragem.
                    </p>
                    
                    <div className="bg-[#0F172A] border border-outline-variant/10 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[8px] font-mono text-slate-500 mb-1 uppercase">SHA-256 LEDGER ID</p>
                        <p className="text-[11px] font-mono text-green-400 font-bold">8f5a4e9d3111fdb091dcb5f3bfa7735398ab77d611aa984bf9da48bcda23019a</p>
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black uppercase px-4 py-2.5 rounded-lg transition shadow-lg shadow-blue-900/20 whitespace-nowrap ml-4">
                        VERIFICAR BLOCKCHAIN
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-bold text-[#FCA311] uppercase tracking-widest mb-4">HISTÓRICO DE AUDITORIAS DE INFRAESTRUTURA</h3>
                    
                    <div className="space-y-2">
                      <div className="bg-[#0F172A] border border-outline-variant/5 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-[8px] font-black text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> REGULAR</span>
                          <span className="text-[10px] font-bold text-white">Inspeção ambiental de resíduos diesel homologada</span>
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono">22/04/2026</span>
                      </div>
                      
                      <div className="bg-[#0F172A] border border-outline-variant/5 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-[8px] font-black text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> REGULAR</span>
                          <span className="text-[10px] font-bold text-white">Calibração anual de bicos injetores homologada pela ANTT</span>
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono">11/03/2026</span>
                      </div>

                      <div className="bg-[#0F172A] border border-outline-variant/5 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-[8px] font-black text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> REGULAR</span>
                          <span className="text-[10px] font-bold text-white">Treinamento de atendimento de condutores fadiga</span>
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono">02/02/2026</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: AVALIAÇÕES DE CONDUTORES */}
              {dossieTab === "avaliacoes" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[10px] font-bold text-[#FCA311] uppercase tracking-widest mb-1">RELATÓRIOS DE BORDO DOS MOTORISTAS</h3>
                    <p className="text-[9px] text-slate-400 mb-6">Opiniões extraídas de motoristas reais após manutenção corretiva agendada.</p>

                    <div className="space-y-4">
                      {/* Card Avaliação 1 */}
                      <div className="bg-[#0F172A] border border-outline-variant/10 rounded-xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FCA311]/5 rounded-full -mt-16 -mr-16 blur-2xl"></div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                          <div>
                            <h4 className="text-[11px] font-bold text-white">Roberto Alencar <span className="font-normal text-slate-400">(Scania R440)</span></h4>
                            <p className="text-[8px] font-bold text-[#FCA311] uppercase tracking-widest mt-0.5">Avaliação de Atendimento</p>
                          </div>
                          <div className="text-[11px] font-black text-[#FCA311] flex items-center gap-1">
                            <Icon name="star" className="text-[12px]" /> 5 / 5.0
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-300 italic relative z-10 leading-relaxed">
                          "Atendimento no meio da madrugada espetacular, trocaram a cuíca de freio em tempo recorde."
                        </p>
                        <div className="mt-4 flex justify-end relative z-10">
                          <span className="text-[8px] font-black text-green-400 bg-green-500/10 border border-green-500/30 px-3 py-1 rounded flex items-center gap-1">
                            <Icon name="thumb_up" className="text-[9px]" /> ÚTIL (CONFIRMADO)
                          </span>
                        </div>
                      </div>

                      {/* Card Avaliação 2 */}
                      <div className="bg-[#0F172A] border border-outline-variant/10 rounded-xl p-5 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4 relative z-10">
                          <div>
                            <h4 className="text-[11px] font-bold text-white">Vanderlei Dias <span className="font-normal text-slate-400">(Volvo FH 540)</span></h4>
                            <p className="text-[8px] font-bold text-[#FCA311] uppercase tracking-widest mt-0.5">Avaliação de Atendimento</p>
                          </div>
                          <div className="text-[11px] font-black text-[#FCA311] flex items-center gap-1">
                            <Icon name="star" className="text-[12px]" /> 4.5 / 5.0
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-300 italic relative z-10 leading-relaxed">
                          "Equipe de injeção diesel muito qualificada. Scanner pegou o bico trancado logo de cara."
                        </p>
                        <div className="mt-4 flex justify-end relative z-10">
                          <button className="text-[8px] font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1 rounded flex items-center gap-1 transition">
                            <Icon name="thumb_up" className="text-[9px]" /> MARCAR COMO ÚTIL
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-outline-variant/10 bg-[#0F172A] flex justify-between items-center gap-4">
              <button className="rounded-lg border border-[#FCA311]/50 hover:bg-[#FCA311]/10 px-4 py-2.5 text-[9px] font-bold text-[#FCA311] uppercase tracking-widest flex items-center gap-2 transition">
                <Icon name="download" className="text-[11px]" /> EXPORTAR DOSSIÊ PDF
              </button>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setDossieModalOpen(false);
                    router.push("/command-center");
                  }}
                  className="rounded-lg border border-outline-variant/30 hover:bg-white/5 px-6 py-2.5 text-[9px] font-bold text-slate-300 uppercase tracking-widest transition"
                >
                  LOCALIZAR NO MAPA CCO
                </button>
                <button 
                  onClick={() => setDossieModalOpen(false)}
                  className="rounded-lg bg-white text-[#0c132b] hover:bg-slate-200 px-6 py-2.5 text-[9px] font-black uppercase tracking-widest transition"
                >
                  FECHAR DOSSIÊ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </AppShell>
  );
}
