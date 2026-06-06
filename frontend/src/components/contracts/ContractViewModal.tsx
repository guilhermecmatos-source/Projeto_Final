"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import { contractsApi } from "@/services/api";
import { formatBRL } from "@/lib/currency";

export interface ContractRecord {
  id: string;
  title: string;
  area: string;
  template_key: string;
  client_name: string;
  client_email?: string | null;
  client_cpf?: string | null;
  content: string;
  honorarios: number;
  status: "rascunho" | "enviado" | "assinado" | "cancelado";
  signature_step: number;
  sent_at?: string | null;
  signed_at?: string | null;
}

const STATUS_CHIP: Record<string, string> = {
  rascunho: "chip-pending",
  enviado: "chip-warning",
  assinado: "chip-active",
  cancelado: "chip-error",
};

const STATUS_LABEL: Record<string, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado para assinatura",
  assinado: "Assinado",
  cancelado: "Cancelado",
};

const STEPS = ["Criação", "Revisão", "Envio", "Assinado"];

interface ContractViewModalProps {
  contractId: string | null;
  onClose: () => void;
  onUpdated?: () => void;
}

export default function ContractViewModal({ contractId, onClose, onUpdated }: ContractViewModalProps) {
  const [contract, setContract] = useState<ContractRecord | null>(null);
  const [notifications, setNotifications] = useState<{ message: string; sent_at: string; channel: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!contractId) return;
    setLoading(true);
    contractsApi
      .get(contractId)
      .then((res) => {
        const data = res.data as {
          contract: ContractRecord;
          notifications: { message: string; sent_at: string; channel: string }[];
        };
        setContract(data.contract);
        setNotifications(data.notifications ?? []);
      })
      .finally(() => setLoading(false));
  }, [contractId]);

  if (!contractId) return null;

  async function handleSend() {
    if (!contractId) return;
    setActionLoading(true);
    try {
      const res = await contractsApi.send(contractId);
      setContract(res.data as ContractRecord);
      onUpdated?.();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSign() {
    if (!contractId) return;
    setActionLoading(true);
    try {
      const res = await contractsApi.sign(contractId);
      setContract(res.data as ContractRecord);
      onUpdated?.();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel() {
    if (!contractId) return;
    setActionLoading(true);
    try {
      const res = await contractsApi.cancel(contractId);
      setContract(res.data as ContractRecord);
      onUpdated?.();
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-outline-variant p-4">
          <div>
            <h2 className="text-headline-sm font-bold">{contract?.title ?? "Contrato"}</h2>
            {contract && (
              <span className={STATUS_CHIP[contract.status] ?? "chip-pending"}>
                {STATUS_LABEL[contract.status]}
              </span>
            )}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-surface-container-high">
            <Icon name="close" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p>Carregando...</p>
          ) : contract ? (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <p><strong>Cliente:</strong> {contract.client_name}</p>
                <p><strong>CPF:</strong> {contract.client_cpf ?? "—"}</p>
                <p><strong>E-mail:</strong> {contract.client_email ?? "—"}</p>
                <p><strong>Honorários:</strong> {formatBRL(Number(contract.honorarios))}</p>
                <p><strong>Área:</strong> {contract.area}</p>
                <p><strong>Template:</strong> {contract.template_key}</p>
              </div>

              <div>
                <h3 className="mb-3 text-label-md font-bold">Fluxo de assinatura (4 etapas)</h3>
                <div className="flex flex-wrap gap-2">
                  {STEPS.map((step, i) => {
                    const stepNum = i + 1;
                    const done = contract.signature_step >= stepNum;
                    const active = contract.signature_step === stepNum;
                    return (
                      <div
                        key={step}
                        className={`flex flex-1 min-w-[100px] flex-col items-center rounded-lg border p-2 text-center text-xs ${
                          done
                            ? "border-primary bg-primary-container/10 text-primary"
                            : active
                              ? "border-secondary-container bg-secondary-container/10"
                              : "border-outline-variant opacity-60"
                        }`}
                      >
                        <span className="mb-1 flex h-6 w-6 items-center justify-center rounded-full bg-surface-container-high text-[10px] font-bold">
                          {done ? "✓" : stepNum}
                        </span>
                        {step}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-label-md font-bold">Conteúdo do contrato</h3>
                <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg border border-outline-variant bg-surface-container-low p-4 text-xs leading-relaxed">
                  {contract.content}
                </pre>
              </div>

              {notifications.length > 0 && (
                <div>
                  <h3 className="mb-2 text-label-md font-bold">Notificações</h3>
                  <ul className="space-y-2 text-xs">
                    {notifications.map((n, i) => (
                      <li key={i} className="rounded-lg border border-outline-variant/50 p-2">
                        <span className="font-bold text-primary">{n.channel}</span> — {n.message}
                        <br />
                        <span className="text-on-surface-variant">
                          {new Date(n.sent_at).toLocaleString("pt-BR")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p>Contrato não encontrado.</p>
          )}
        </div>

        {contract && (
          <div className="flex flex-wrap gap-2 border-t border-outline-variant p-4">
            {contract.status === "rascunho" && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleSend}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary"
              >
                Enviar para assinatura
              </button>
            )}
            {contract.status === "enviado" && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleSign}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary"
              >
                Marcar como assinado
              </button>
            )}
            {contract.status !== "assinado" && contract.status !== "cancelado" && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleCancel}
                className="rounded-lg border border-error px-4 py-2 text-sm text-error"
              >
                Cancelar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
