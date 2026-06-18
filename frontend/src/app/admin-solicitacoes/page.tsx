"use client";

import { useCallback, useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import FormModal from "@/components/ui/FormModal";
import ListPageStates from "@/components/ui/ListPageStates";
import { ruvApi } from "@/services/api";
import { extractApiError } from "@/lib/api-errors";

interface RuvRequest {
  id: string;
  auth_number: string;
  requester_name: string;
  vehicle_type?: string;
  destination: string;
  service: string;
  status: string;
  created_at: string;
  passengers?: string;
  justification?: string;
  descricao?: string;
  quantidade?: number;
}

const TABS = ["PENDENTES", "APROVADOS", "REJEITADOS"] as const;
const TAB_STATUS: Record<(typeof TABS)[number], string> = {
  PENDENTES: "pending",
  APROVADOS: "approved",
  REJEITADOS: "rejected",
};

export default function AdminSolicitacoesPage() {
  const [ruvs, setRuvs] = useState<RuvRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("PENDENTES");
  
  // Deciding modal state
  const [selectedRuv, setSelectedRuv] = useState<RuvRequest | null>(null);
  const [justification, setJustification] = useState("");
  const [actionError, setActionError] = useState("");
  const [processing, setProcessing] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    ruvApi
      .list(TAB_STATUS[activeTab])
      .then((res) => {
        setRuvs(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        setRuvs([]);
        setError(extractApiError(err, "Não foi possível carregar as solicitações RUV."));
      })
      .finally(() => setLoading(false));
  }, [activeTab]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAction = async (approve: boolean) => {
    if (!selectedRuv) return;
    
    if (!approve && !justification.trim()) {
      setActionError("Justificativa é obrigatória para rejeições.");
      return;
    }

    setProcessing(true);
    setActionError("");
    try {
      if (approve) {
        await ruvApi.approve(selectedRuv.id, justification.trim() || undefined);
      } else {
        await ruvApi.reject(selectedRuv.id, justification.trim());
      }
      setSelectedRuv(null);
      setJustification("");
      load();
    } catch (err) {
      setActionError(extractApiError(err, "Falha ao registrar decisão."));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Painel de Aprovações RUV"
        subtitle="Auditoria e homologação de requisições para utilização de veículos da frota."
      />

      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b border-outline-variant">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-[10px] font-bold uppercase tracking-wider transition ${
              activeTab === tab ? "border-b-2 border-primary text-primary" : "text-on-surface-variant hover:text-slate-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <section className="raised-card overflow-hidden">
        <div className="border-b border-outline-variant p-4">
          <h3 className="text-headline-sm uppercase text-[11px] font-bold tracking-wider text-primary">
            Lista de Solicitações ({TABS.indexOf(activeTab) === 0 ? "Pendentes de Decisão" : "Histórico"})
          </h3>
        </div>

        <ListPageStates
          loading={loading}
          error={error}
          isEmpty={ruvs.length === 0}
          onRetry={load}
          loadingMessage="Buscando requisições..."
          emptyTitle="Nenhuma RUV encontrada"
          emptyDescription={`Não há solicitações registradas com status "${TAB_STATUS[activeTab]}".`}
          emptyIcon="rule"
        >
          <div className="divide-y divide-outline-variant/30">
            {ruvs.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedRuv(r)}
                className="flex w-full flex-col md:flex-row justify-between items-start md:items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/5 transition"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-primary"># {r.auth_number}</span>
                    <span className="text-xs text-on-surface-variant">• {new Date(r.created_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <p className="font-bold text-slate-100 text-sm">{r.requester_name}</p>
                  <p className="text-xs text-slate-300">
                    <span className="font-semibold text-on-surface-variant uppercase">Destino:</span> {r.destination}
                  </p>
                  <p className="text-xs text-slate-400">
                    <span className="font-semibold text-on-surface-variant uppercase">Serviço:</span> {r.service}
                  </p>
                  {r.vehicle_type && (
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold text-secondary-container bg-secondary-container/10 border border-secondary-container/20 rounded px-1.5 py-0.5">
                      {r.vehicle_type}
                    </span>
                  )}
                </div>

                <div className="text-right">
                  {r.status === "pending" && (
                    <span className="chip-warning">Pendente Auditoria</span>
                  )}
                  {r.status === "approved" && (
                    <span className="chip-active">Homologado</span>
                  )}
                  {r.status === "rejected" && (
                    <span className="chip-error">Rejeitado</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ListPageStates>
      </section>

      {/* Decision Modal */}
      <FormModal
        open={!!selectedRuv}
        onClose={() => {
          setSelectedRuv(null);
          setJustification("");
          setActionError("");
        }}
        title={`RUV # ${selectedRuv?.auth_number}`}
        subtitle="Análise de Auditoria de Utilização de Ativo"
      >
        {selectedRuv && (
          <div className="space-y-4 text-slate-100">
            <div className="rounded-lg bg-surface-container-high p-4 space-y-2 text-xs">
              <p><strong>Requisitante:</strong> {selectedRuv.requester_name}</p>
              <p><strong>Destino Previsto:</strong> {selectedRuv.destination}</p>
              <p><strong>Serviço:</strong> {selectedRuv.service}</p>
              {selectedRuv.descricao && <p><strong>Descrição do(s) passageiro(s):</strong> {selectedRuv.descricao}</p>}
              {selectedRuv.quantidade && <p><strong>Quantidade de passageiro(s):</strong> {selectedRuv.quantidade}</p>}
              {selectedRuv.vehicle_type && <p><strong>Tipo Requisitado:</strong> {selectedRuv.vehicle_type}</p>}
              {selectedRuv.justification && (
                <div className="mt-2 border-t border-outline-variant/30 pt-2 text-amber-400">
                  <strong>Justificativa da Decisão:</strong> {selectedRuv.justification}
                </div>
              )}
            </div>

            {selectedRuv.status === "pending" ? (
              <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
                <div>
                  <label htmlFor="decision_justification" className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">
                    Justificativa / Parecer Técnico
                  </label>
                  <textarea
                    id="decision_justification"
                    rows={4}
                    placeholder="Escreva um parecer para a aprovação ou rejeição desta requisição..."
                    className="input-fleet min-h-[100px] resize-y py-3"
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                  />
                </div>

                {actionError && <p className="text-sm font-semibold text-error">{actionError}</p>}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => handleAction(false)}
                    className="btn-outline border-error text-error py-2.5 rounded-lg text-xs font-bold uppercase hover:bg-error/10 transition"
                  >
                    Rejeitar RUV
                  </button>
                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => handleAction(true)}
                    className="btn-primary py-2.5 rounded-lg text-xs font-bold uppercase"
                  >
                    Aprovar RUV
                  </button>
                </div>
              </form>
            ) : (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRuv(null)}
                  className="btn-outline w-full py-2 border border-outline-variant text-center text-xs font-bold uppercase rounded-lg"
                >
                  Fechar Visualização
                </button>
              </div>
            )}
          </div>
        )}
      </FormModal>
    </AppShell>
  );
}
