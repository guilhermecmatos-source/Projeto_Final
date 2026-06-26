"use client";

import Icon from "@/components/ui/Icon";

export interface RuvDetail {
  id: string;
  origin: string;
  destination: string;
  purpose?: string;
  service?: string;
  status: string;
  passengers?: number;
  quantidade?: number;
  descricao?: string;
  time_from?: string;
  time_to?: string;
  vehicle_type?: string;
  authorization_ref?: string;
  fuel_type?: string;
  auth_number?: string;
  route_change?: number | boolean;
  alt_destination?: string;
  alt_objective?: string;
  vehicle_plate?: string;
  driver_name?: string;
  requester_name?: string;
  created_at?: string;
  justification?: string;
}

interface RuvDetailsModalProps {
  ruv: RuvDetail | null;
  onClose: () => void;
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toLowerCase();
  if (normalized === "approved" || normalized === "aprovada" || normalized === "aprovado") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/40 bg-green-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-green-400">
        <Icon name="check_circle" className="text-xs" /> APROVADA
      </span>
    );
  }
  if (normalized === "rejected" || normalized === "rejeitada" || normalized === "rejeitado") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-red-400">
        <Icon name="cancel" className="text-xs" /> REJEITADA
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400">
      <Icon name="schedule" className="text-xs" /> PENDENTE
    </span>
  );
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="space-y-0.5">
      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-white">{String(value)}</p>
    </div>
  );
}

export default function RuvDetailsModal({ ruv, onClose }: RuvDetailsModalProps) {
  if (!ruv) return null;

  const purpose = ruv.purpose || ruv.service || "—";
  const passengers = ruv.quantidade || ruv.passengers || 1;
  const hasRouteChange = ruv.route_change === 1 || ruv.route_change === true;

  const formattedDate = ruv.created_at
    ? new Date(ruv.created_at).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const ruvCode = `REQ-${ruv.id.slice(0, 8).toUpperCase()}`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-outline-variant/30 bg-[#080d1a] shadow-2xl custom-scrollbar">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-outline-variant/20 bg-[#080d1a]/95 px-6 py-4 backdrop-blur">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Icon name="assignment" className="text-[#FCA311] text-lg" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#FCA311]">
                Requisição de Utilização de Veículo
              </span>
            </div>
            <h2 className="text-lg font-bold text-white">{ruvCode}</h2>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={ruv.status} />
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant/30 text-slate-400 hover:bg-white/10 hover:text-white transition"
            >
              <Icon name="close" className="text-sm" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Auth number & date */}
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">Nº de Autorização</p>
              <p className="text-2xl font-bold text-primary">{ruv.auth_number || "—"}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">Data de Emissão</p>
              <p className="text-sm font-semibold text-white">{formattedDate}</p>
            </div>
          </div>

          {/* Route */}
          <div className="rounded-xl border border-outline-variant/20 bg-[#0F172A] p-4">
            <h3 className="text-[9px] font-bold uppercase tracking-widest text-blue-400 mb-3 flex items-center gap-1.5">
              <Icon name="route" className="text-xs" /> ROTA
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-[9px] font-bold text-slate-500 uppercase mb-0.5">ORIGEM</p>
                <p className="text-sm font-bold text-white">{ruv.origin}</p>
              </div>
              <Icon name="arrow_forward" className="text-[#FCA311] shrink-0" />
              <div className="flex-1">
                <p className="text-[9px] font-bold text-slate-500 uppercase mb-0.5">DESTINO</p>
                <p className="text-sm font-bold text-white">{ruv.destination}</p>
              </div>
            </div>
            {ruv.time_from && ruv.time_to && (
              <div className="mt-3 flex gap-4 border-t border-outline-variant/10 pt-3">
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase mb-0.5">HORÁRIO SAÍDA</p>
                  <p className="text-sm font-semibold text-white">{ruv.time_from}h</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase mb-0.5">HORÁRIO RETORNO</p>
                  <p className="text-sm font-semibold text-white">{ruv.time_to}h</p>
                </div>
              </div>
            )}
          </div>

          {/* Vehicle & Driver */}
          <div className="rounded-xl border border-outline-variant/20 bg-[#0F172A] p-4">
            <h3 className="text-[9px] font-bold uppercase tracking-widest text-blue-400 mb-3 flex items-center gap-1.5">
              <Icon name="local_shipping" className="text-xs" /> VEÍCULO &amp; MOTORISTA
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Placa / Veículo" value={ruv.vehicle_plate || "Não alocado"} />
              <Field label="Condutor" value={ruv.driver_name || "Não alocado"} />
              <Field label="Tipo de Veículo" value={ruv.vehicle_type} />
              <Field label="Combustível" value={ruv.fuel_type} />
            </div>
          </div>

          {/* Purpose & Passengers */}
          <div className="rounded-xl border border-outline-variant/20 bg-[#0F172A] p-4">
            <h3 className="text-[9px] font-bold uppercase tracking-widest text-blue-400 mb-3 flex items-center gap-1.5">
              <Icon name="info" className="text-xs" /> FINALIDADE &amp; PASSAGEIROS
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Field label="Serviço / Finalidade" value={purpose} />
              </div>
              <Field label="Passageiros" value={passengers} />
              <Field label="Requisitante" value={ruv.requester_name} />
              {ruv.descricao && (
                <div className="col-span-2">
                  <Field label="Descrição dos passageiros" value={ruv.descricao} />
                </div>
              )}
            </div>
          </div>

          {/* Authorization */}
          <div className="rounded-xl border border-outline-variant/20 bg-[#0F172A] p-4">
            <h3 className="text-[9px] font-bold uppercase tracking-widest text-blue-400 mb-3 flex items-center gap-1.5">
              <Icon name="verified" className="text-xs" /> AUTORIZAÇÃO
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Referência de Autorização" value={ruv.authorization_ref} />
              <Field label="Nº Autorização" value={ruv.auth_number} />
            </div>
          </div>

          {/* Route change */}
          {hasRouteChange && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <h3 className="text-[9px] font-bold uppercase tracking-widest text-amber-400 mb-3 flex items-center gap-1.5">
                <Icon name="warning" className="text-xs" /> ALTERAÇÃO DE ROTA AUTORIZADA
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Destino Alternativo" value={ruv.alt_destination} />
                <Field label="Objetivo Alternativo" value={ruv.alt_objective} />
              </div>
            </div>
          )}

          {/* Justification if rejected */}
          {ruv.justification && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
              <h3 className="text-[9px] font-bold uppercase tracking-widest text-red-400 mb-2 flex items-center gap-1.5">
                <Icon name="cancel" className="text-xs" /> JUSTIFICATIVA DE REJEIÇÃO
              </h3>
              <p className="text-sm text-slate-300">{ruv.justification}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-outline-variant/20 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg border border-outline-variant/40 bg-white/5 px-5 py-2 text-xs font-bold uppercase text-slate-300 hover:bg-white/10 transition"
          >
            <Icon name="close" className="text-sm" />
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
