"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";

const FILTERS = [
  "Todos Documentos",
  "Contratos Locação",
  "Regularidade CNH",
  "Licenciamento CRLV",
  "Apólices de Seguro",
  "Laudos da Oficina",
];

const DOCUMENTS = [
  {
    id: "doc-1",
    title: "CNH Habilitada Categoria D - Carlos Silveira",
    status: "Homologado",
    statusColor: "text-green-400 bg-green-500/10 border-green-500/30",
    category: "CNH",
    emitter: "Carlos Silveira",
    updated: "2025-01-15",
    expires: "2028-11-20",
    hash: "a7c2b83d89a92bb44e8cdaaf23c9079de188b201",
    version: "v1.2",
  },
  {
    id: "doc-2",
    title: "Seguro Integral Sinistro Allianz - Volvo FH",
    status: "Regular",
    statusColor: "text-green-400 bg-green-500/10 border-green-500/30",
    category: "Seguro",
    emitter: "Allianz Corp",
    updated: "2025-11-01",
    expires: "2026-11-01",
    hash: "4e89ab114e2c83d89a92bb44e8cdaaf23c9079de1",
    version: "v1.0",
  },
  {
    id: "doc-3",
    title: "CRLV Licenciamento Anual - Mercedes-Benz Atego",
    status: "Regular",
    statusColor: "text-green-400 bg-green-500/10 border-green-500/30",
    category: "CRLV",
    emitter: "DETRAN-SP",
    updated: "2026-02-18",
    expires: "2027-02-18",
    hash: "c3d89a92bb44e8cdaaf23c9079de14e89ab114e2c",
    version: "v2.0",
  },
  {
    id: "doc-4",
    title: "Laudo Vistoria Preventiva Pastilha de Freio",
    status: "Homologado",
    statusColor: "text-green-400 bg-green-500/10 border-green-500/30",
    category: "Laudo Inspeção",
    emitter: "Oficina Pátio Central",
    updated: "2026-06-05",
    expires: "—",
    hash: "9a92bb44e8cdaaf23c9079de14e89ab114e2c83d8",
    version: "v1.0",
  },
];

export default function DocumentsPage() {
  const [activeFilter, setActiveFilter] = useState("Todos Documentos");
  const [search, setSearch] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(DOCUMENTS[1]);

  return (
    <AppShell>
      <PageHeader
        breadcrumb="SEDE CENTRAL / UNIDADE OPERACIONAL / DOCUMENTS"
        title="Central de Documentos Unificada"
        subtitle="REPOSITÓRIO CRIPTOGRAFADO DE CRLVS, HABILITAÇÕES, CONTRATOS E LAUDOS HOMOLOGADOS"
        actions={
          <button className="flex items-center gap-1.5 rounded-lg border border-[#FCA311]/50 bg-[#FCA311]/10 px-4 py-2 text-xs font-bold uppercase text-[#FCA311] hover:bg-[#FCA311]/20 transition">
            <Icon name="file_upload" className="text-sm" /> ARQUIVAR NOVO DOCUMENTO
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Sidebar Filters */}
        <div className="lg:col-span-3 space-y-6">
          <div className="raised-card p-5 bg-[#0c132b]/80 border-outline-variant/30">
            <h3 className="text-[10px] font-bold text-[#FCA311] uppercase tracking-wider mb-4">
              FILTROS INTELIGENTES
            </h3>
            <div className="relative mb-6">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
              <input
                className="w-full rounded-lg bg-[#0F172A] border border-outline-variant/30 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                placeholder="Pesquisar por título, emissor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3">
              FILTRAR POR CATEGORIA:
            </h4>
            <div className="space-y-1">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition ${
                    activeFilter === f
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:bg-white/5"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Integridade Panel */}
          <div className="raised-card p-5 bg-[#0c132b]/80 border-outline-variant/30">
            <h3 className="text-[10px] font-bold text-[#FCA311] uppercase tracking-wider mb-4">
              INTEGRIDADE DO COFRE
            </h3>
            <div className="space-y-3 text-xs font-bold text-slate-400">
              <div className="flex justify-between items-center">
                <span>Total Arquivos:</span>
                <span className="text-white">4</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Verificação SHA256:</span>
                <span className="text-green-400">100% OK</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Expirações em 30d:</span>
                <span className="text-[#FCA311]">1 pendência</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main List & Details */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          <div className="raised-card flex-1 bg-[#0c132b]/80 border-outline-variant/30 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-outline-variant/30">
              <h2 className="text-xs font-bold text-[#FCA311] uppercase tracking-wider">
                REGISTRO DE ARQUIVOS (DOSSIÊS DE CONTROLE)
              </h2>
              <span className="text-[10px] font-bold text-slate-500">Exibindo 4 de 4</span>
            </div>
            
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              {DOCUMENTS.map((doc) => (
                <div 
                  key={doc.id} 
                  onClick={() => setSelectedDoc(doc)}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition cursor-pointer ${
                    selectedDoc.id === doc.id ? "bg-[#0F172A] border-blue-500/40" : "bg-transparent border-outline-variant/20 hover:bg-[#0F172A]/50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                    selectedDoc.id === doc.id ? "bg-blue-600/20 text-blue-400 border-blue-500/30" : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}>
                    <Icon name="description" className="text-xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-white truncate">{doc.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${doc.statusColor}`}>
                        {doc.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 flex-wrap">
                      <span className="font-bold">Categoria: <span className="text-white">{doc.category}</span></span>
                      <span>Assinado/Emitido por: <span className="text-white font-bold">{doc.emitter}</span></span>
                      <span>Atualizado: {doc.updated}</span>
                      <span>Expira: <span className={doc.expires !== "—" ? "text-[#FCA311] font-bold" : ""}>{doc.expires}</span></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-4 shrink-0">
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white transition" title="Baixar">
                      <Icon name="download" className="text-[16px]" />
                    </button>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-error/20 text-error transition" title="Excluir">
                      <Icon name="delete" className="text-[16px]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Details Panel */}
          {selectedDoc && (
            <div className="raised-card bg-[#121b38] border-blue-500/30 border-2">
              <div className="flex items-center justify-between p-4 border-b border-blue-500/20">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  DETALHES DO ATIVO CERTIFICADOR (COFRE DIGITAL)
                </h3>
                <button className="text-[10px] text-slate-500 hover:text-white transition uppercase font-bold">
                  Fechar
                </button>
              </div>
              <div className="p-5">
                <h4 className="text-xs font-bold text-[#FCA311] uppercase tracking-wider mb-4">
                  METADADOS CRIPTOGRÁFICOS - {selectedDoc.title.toUpperCase()}
                </h4>
                
                <div className="flex gap-6 mb-4">
                  <div className="bg-[#0c132b]/60 rounded-lg px-4 py-3 border border-outline-variant/10">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">ID DO DOCUMENTO</p>
                    <p className="text-xs font-mono font-bold text-white">{selectedDoc.id}</p>
                  </div>
                  <div className="bg-[#0c132b]/60 rounded-lg px-4 py-3 border border-outline-variant/10 flex-1 overflow-hidden">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">ASSINATURA CRIPTO SHA-256</p>
                    <p className="text-xs font-mono font-bold text-green-400 truncate">{selectedDoc.hash}</p>
                  </div>
                  <div className="bg-[#0c132b]/60 rounded-lg px-4 py-3 border border-outline-variant/10">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">VERSÃO ATUALIZADA</p>
                    <p className="text-xs font-mono font-bold text-white">{selectedDoc.version}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-blue-500/20">
                  <p className="text-[10px] text-slate-300 flex items-center gap-2">
                    <Icon name="verified_user" className="text-green-400 text-sm" />
                    Este arquivo possui hash correspondente à auditoria interna de frotas e foi verificado contra corrupção de carimbos de tempo.
                  </p>
                  <span className="px-2 py-1 bg-green-500/10 border border-green-500/30 text-green-400 rounded text-[9px] font-bold uppercase tracking-wider">
                    SEGURO INTEGRADO
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
