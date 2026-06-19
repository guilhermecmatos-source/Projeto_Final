"use client";

import { useState, useRef } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import { showToast } from "@/components/ui/Toast";

interface Doc {
  id: string;
  name: string;
  category: "CNH" | "Contratos" | "Vistorias" | "Licenças" | "Certificados";
  size: string;
  date: string;
  status: "válido" | "vencido" | "pendente";
  hash: string;
  entity: string;
}

const INITIAL_DOCS: Doc[] = [
  { id: "doc-1", name: "CNH_Carlos_Silva_B_2026.pdf", category: "CNH", size: "1.2 MB", date: "2026-01-15", status: "válido", hash: "a3f4d9c2e1b8f7a0", entity: "Carlos Silva" },
  { id: "doc-2", name: "Contrato_Locacao_SCANIA_R450.pdf", category: "Contratos", size: "3.4 MB", date: "2026-03-01", status: "válido", hash: "b7e2c4a8f1d9e0c3", entity: "SCANIA R450" },
  { id: "doc-3", name: "Vistoria_MEC4D21_Jun2026.pdf", category: "Vistorias", size: "2.1 MB", date: "2026-06-10", status: "válido", hash: "c9d1a5f3b2e8a4f7", entity: "Mercedes-Benz MEC-4D21" },
  { id: "doc-4", name: "CNH_Roberto_Santos_Vencida.pdf", category: "CNH", size: "0.9 MB", date: "2025-12-31", status: "vencido", hash: "d2a7f1c4e9b3d5a8", entity: "Roberto Santos" },
  { id: "doc-5", name: "Licenca_Operacao_2026.pdf", category: "Licenças", size: "1.7 MB", date: "2026-02-20", status: "válido", hash: "e4b8c2d7f0a3e1c9", entity: "FleetAI Logística" },
  { id: "doc-6", name: "Certificado_ANTT_Frota.pdf", category: "Certificados", size: "2.5 MB", date: "2026-01-05", status: "pendente", hash: "f1c3e8a5d2b7f4c0", entity: "Frota Geral" },
  { id: "doc-7", name: "CNH_Ana_Lima_AB_2027.pdf", category: "CNH", size: "1.1 MB", date: "2026-04-12", status: "válido", hash: "a0e2f5c9b4d1a7e3", entity: "Ana Lima" },
];

const CATS = ["Todos", "CNH", "Contratos", "Vistorias", "Licenças", "Certificados"] as const;
const STATUS_OPTS = ["Todos", "válido", "vencido", "pendente"] as const;

function handleVerifySHA256(doc: Doc) {
  const simHash = `sha256:${doc.hash}${Math.random().toString(16).slice(2, 10)}`;
  showToast("Documento auditado e validado com sucesso na blockchain.", "success", simHash);
}

function simulateSecureDownload(doc: Doc) {
  const content = `FleetAI - Documento Seguro\n\nArquivo: ${doc.name}\nCategoria: ${doc.category}\nEntidade: ${doc.entity}\nData: ${doc.date}\nHash SHA-256: sha256:${doc.hash}\nStatus: ${doc.status}\n\nEste é um documento simulado gerado pela plataforma FleetAI.`;
  const blob = new Blob([content], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", doc.name);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast(`🔒 Download seguro iniciado: ${doc.name}`, "info");
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>(INITIAL_DOCS);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("Todos");
  const [statusFilter, setStatusFilter] = useState<string>("Todos");
  const [selected, setSelected] = useState<Doc | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = docs.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.entity.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "Todos" || d.category === catFilter;
    const matchStatus = statusFilter === "Todos" || d.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const hash = Math.random().toString(16).slice(2, 18);
    const newDoc: Doc = {
      id: `doc-${Date.now()}`,
      name: file.name,
      category: "Contratos",
      size: `${(file.size / 1024).toFixed(1)} KB`,
      date: new Date().toISOString().split("T")[0],
      status: "pendente",
      hash,
      entity: "Upload Manual",
    };
    setDocs(prev => [newDoc, ...prev]);
    showToast(`Documento "${file.name}" enviado com sucesso!`, "success");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDelete(docId: string) {
    setDocs(prev => prev.filter(d => d.id !== docId));
    if (selected?.id === docId) setSelected(null);
    showToast("Documento removido do sistema.", "warning");
  }

  const statusColor: Record<string, string> = {
    "válido": "bg-green-500/20 text-green-400 border-green-500/30",
    "vencido": "bg-red-500/20 text-red-400 border-red-500/30",
    "pendente": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  };

  const catIcon: Record<string, string> = {
    "CNH": "badge", "Contratos": "description", "Vistorias": "fact_check",
    "Licenças": "verified", "Certificados": "workspace_premium",
  };

  return (
    <AppShell>
      <PageHeader
        breadcrumb="DOCUMENTOS"
        title="Gestão de Documentos"
        subtitle="Upload, validação SHA-256 e download seguro de documentos corporativos."
        actions={
          <div className="flex gap-2">
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-on-primary hover:opacity-90 transition"
            >
              <Icon name="upload" className="text-sm" /> Upload
            </button>
          </div>
        }
      />

      {/* Summary KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          { label: "Total", val: docs.length, color: "text-white" },
          { label: "Válidos", val: docs.filter(d => d.status === "válido").length, color: "text-green-400" },
          { label: "Vencidos", val: docs.filter(d => d.status === "vencido").length, color: "text-red-400" },
          { label: "Pendentes", val: docs.filter(d => d.status === "pendente").length, color: "text-amber-400" },
          { label: "CNHs", val: docs.filter(d => d.category === "CNH").length, color: "text-blue-400" },
        ].map(k => (
          <div key={k.label} className="raised-card p-4">
            <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">{k.label}</p>
            <p className={`text-3xl font-black ${k.color}`}>{k.val}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Doc List */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="raised-card p-4 mb-4 space-y-3">
            <div className="relative">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nome ou entidade..."
                className="input-fleet pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {CATS.map(c => (
                <button key={c} onClick={() => setCatFilter(c)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${catFilter === c ? "bg-primary text-on-primary" : "border border-outline-variant/40 text-on-surface-variant hover:border-primary"}`}
                >{c}</button>
              ))}
            </div>
            <div className="flex gap-2">
              {STATUS_OPTS.map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold capitalize transition ${statusFilter === s ? "bg-secondary-container text-on-secondary-container" : "border border-outline-variant/40 text-on-surface-variant"}`}
                >{s}</button>
              ))}
            </div>
          </div>

          <div className="raised-card overflow-hidden">
            {filtered.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant">
                <Icon name="folder_off" className="text-4xl mb-2 block" />
                <p className="text-sm font-bold">Nenhum documento encontrado</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/20">
                {filtered.map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => setSelected(doc)}
                    className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition hover:bg-surface-container-high ${selected?.id === doc.id ? "bg-primary/5 border-l-2 border-primary" : ""}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0">
                      <Icon name={catIcon[doc.category] ?? "description"} className="text-primary text-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-on-surface truncate">{doc.name}</p>
                      <p className="text-[10px] text-on-surface-variant">{doc.entity} · {doc.size} · {doc.date}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border capitalize ${statusColor[doc.status]}`}>
                        {doc.status}
                      </span>
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(doc.id); }}
                        className="p-1 rounded text-on-surface-variant hover:text-red-400 transition"
                      >
                        <Icon name="delete" className="text-sm" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Doc Detail Panel */}
        <div>
          {selected ? (
            <div className="raised-card p-5 space-y-4 sticky top-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-on-surface">{selected.name}</h3>
                  <p className="text-[10px] text-on-surface-variant mt-1">{selected.entity}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-on-surface-variant hover:text-on-surface">
                  <Icon name="close" />
                </button>
              </div>

              <div className="space-y-2 text-[11px]">
                {[
                  ["Categoria", selected.category],
                  ["Tamanho", selected.size],
                  ["Data", selected.date],
                  ["Status", selected.status],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-outline-variant/20 pb-2">
                    <span className="text-on-surface-variant font-bold uppercase text-[9px]">{k}</span>
                    <span className="text-on-surface font-medium capitalize">{v}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-surface-container-high p-3">
                <p className="text-[9px] font-bold text-on-surface-variant uppercase mb-1">Hash SHA-256</p>
                <p className="font-mono text-[10px] text-primary break-all">sha256:{selected.hash}...</p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleVerifySHA256(selected)}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-500/20 border border-green-500/30 py-2.5 text-xs font-bold text-green-400 hover:bg-green-500/30 transition"
                >
                  <Icon name="verified_user" className="text-sm" /> Validar Hash
                </button>
                <button
                  onClick={() => simulateSecureDownload(selected)}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-xs font-bold text-on-primary hover:opacity-90 transition"
                >
                  <Icon name="download" className="text-sm" /> Download Seguro
                </button>
                 <button
                  onClick={() => setIsViewerOpen(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-outline-variant/40 py-2.5 text-xs font-bold text-on-surface-variant hover:border-primary hover:text-primary transition"
                >
                  <Icon name="visibility" className="text-sm" /> Visualizar
                </button>
              </div>
            </div>
          ) : (
            <div className="raised-card p-8 text-center text-on-surface-variant">
              <Icon name="touch_app" className="text-4xl mb-3 block opacity-40" />
              <p className="text-sm font-bold">Selecione um documento</p>
              <p className="text-xs mt-1">para ver detalhes e ações</p>
            </div>
          )}
        </div>
      </div>
      {/* Document Preview Modal */}
      {isViewerOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-[#0c132b] shadow-2xl overflow-hidden border border-outline-variant/30 flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4 border-b border-outline-variant/20 pb-3">
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider">Visualização de Documento</h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{selected.name}</p>
              </div>
              <button 
                onClick={() => setIsViewerOpen(false)} 
                className="text-slate-400 hover:text-white transition p-1 hover:bg-white/10 rounded-full"
              >
                <Icon name="close" />
              </button>
            </div>

            {/* Simulated Document Content Container */}
            <div className="bg-[#0b0e14] border border-outline-variant/20 rounded-xl p-6 min-h-[300px] flex flex-col justify-between font-mono text-[10px] text-slate-400 relative overflow-hidden select-none">
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] rotate-12 select-none pointer-events-none">
                <Icon name="verified_user" className="text-[240px] text-white" />
              </div>

              {/* Header inside the document */}
              <div className="border-b border-slate-800 pb-4 mb-4 flex justify-between items-start relative z-10">
                <div>
                  <p className="font-bold text-white text-xs">FLEETAI LOGÍSTICA S.A.</p>
                  <p className="text-[9px]">SISTEMA DE SEGURANÇA E AUDITORIA DE FROTAS</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-400 uppercase tracking-widest text-[8px] border border-emerald-500/30 bg-emerald-500/5 px-2 py-0.5 rounded">
                    DOCUMENTO {selected.status}
                  </p>
                </div>
              </div>

              {/* Body inside the document */}
              <div className="space-y-3 relative z-10 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-500 uppercase tracking-wider text-[8px]">Entidade Relacionada</p>
                    <p className="text-slate-300 font-bold text-xs mt-0.5">{selected.entity}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 uppercase tracking-wider text-[8px]">Categoria Operacional</p>
                    <p className="text-slate-300 font-bold text-xs mt-0.5">{selected.category}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-slate-500 uppercase tracking-wider text-[8px]">Data de Emissão/Validação</p>
                    <p className="text-slate-300 font-bold text-xs mt-0.5">{selected.date}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 uppercase tracking-wider text-[8px]">Tamanho do Arquivo</p>
                    <p className="text-slate-300 font-bold text-xs mt-0.5">{selected.size}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <p className="text-slate-500 uppercase tracking-wider text-[8px]">HASH DIGITAL DE INTEGRIDADE (SHA-256)</p>
                  <p className="text-emerald-400 font-mono text-[9px] break-all select-all mt-1 bg-black/40 p-2.5 rounded border border-white/5">
                    sha256:{selected.hash}
                  </p>
                </div>

                <div className="pt-2 text-[9px] text-slate-500 leading-relaxed italic">
                  Este documento de homologação está registrado em nossa blockchain interna. Qualquer alteração não autorizada invalidará imediatamente o hash SHA-256 acima, disparando bloqueios de pátio automáticos pelo módulo de segurança.
                </div>
              </div>

              {/* Footer inside the document */}
              <div className="border-t border-slate-800 pt-4 mt-4 flex justify-between items-center text-[8px] text-slate-500 relative z-10 font-sans font-medium uppercase tracking-wider">
                <span>FleetAI Token Autenticador: {selected.id}</span>
                <span>Página 1 de 1</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => {
                  simulateSecureDownload(selected);
                  setIsViewerOpen(false);
                }} 
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-on-primary hover:opacity-90 transition"
              >
                <Icon name="download" className="text-sm" /> Baixar Cópia Segura
              </button>
              <button 
                onClick={() => setIsViewerOpen(false)} 
                className="py-2 px-4 rounded-lg border border-outline-variant/40 text-xs font-bold text-slate-300 uppercase hover:bg-white/5 transition"
              >
                Fechar Visualizador
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
