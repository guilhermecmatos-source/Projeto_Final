"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import FormModal from "@/components/ui/FormModal";
import Icon from "@/components/ui/Icon";
import { marketplaceApi, contractsApi } from "@/services/api";
import { extractApiError } from "@/lib/api-errors";
import { formatBRL } from "@/lib/currency";
import type { MarketplaceVehicle, ContractQuote } from "@/types";

// Contrato mínimo para exibição na tabela
interface ContractRow {
  id: string;
  title: string;
  client_name: string;
  status: string;
  honorarios: number;
  created_at: string;
}

const STATUS_STYLE: Record<string, string> = {
  rascunho: "chip-pending",
  enviado: "chip-warning",
  assinado: "chip-active",
  cancelado: "chip-error",
};

const STATUS_PT: Record<string, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  assinado: "Assinado",
  cancelado: "Cancelado",
};

// Ícone de categoria por palavra-chave
function VehicleIcon({ brand, model }: { brand: string; model: string }) {
  const term = `${brand} ${model}`.toLowerCase();
  if (term.includes("scania") || term.includes("volvo") || term.includes("daf")) return "local_shipping";
  if (term.includes("mercedes") || term.includes("iveco")) return "fire_truck";
  if (term.includes("sprinter") || term.includes("transit") || term.includes("master")) return "airport_shuttle";
  if (term.includes("hilux") || term.includes("ranger") || term.includes("s10")) return "directions_car";
  return "directions_car";
}

// Gera URL do QR Code via API pública (quickchart.io)
function getQrCodeUrl(data: string): string {
  const encoded = encodeURIComponent(data);
  return `https://quickchart.io/qr?text=${encoded}&size=200&margin=2`;
}

export default function MarketplacePage() {
  // ── Marketplace ────────────────────────────────────────────────
  const [vehicles, setVehicles] = useState<MarketplaceVehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [vehiclesError, setVehiclesError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // ── Contratos ──────────────────────────────────────────────────
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(true);
  const [contractsError, setContractsError] = useState<string | null>(null);

  // ── Modal de cotação ──────────────────────────────────────────
  const [selectedVehicle, setSelectedVehicle] = useState<MarketplaceVehicle | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [quoting, setQuoting] = useState(false);
  const [quote, setQuote] = useState<ContractQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Datas para cotação
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  );
  const [clientName, setClientName] = useState("");

  // Dias e valor estimado em tempo real (sem chamar API)
  const estimatedDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
    return diff > 0 ? Math.ceil(diff / 86400000) : 0;
  }, [startDate, endDate]);

  const estimatedValue = useMemo(
    () => (selectedVehicle ? selectedVehicle.pricePerDay * estimatedDays : 0),
    [selectedVehicle, estimatedDays]
  );

  // ── Carregamentos ──────────────────────────────────────────────
  const loadVehicles = useCallback(() => {
    setLoadingVehicles(true);
    setVehiclesError(null);
    marketplaceApi
      .list()
      .then((res) => setVehicles(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setVehiclesError(extractApiError(err, "Não foi possível carregar o marketplace.")))
      .finally(() => setLoadingVehicles(false));
  }, []);

  const loadContracts = useCallback(() => {
    setLoadingContracts(true);
    setContractsError(null);
    contractsApi
      .list()
      .then((res) => setContracts(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setContractsError(extractApiError(err, "Não foi possível carregar os contratos.")))
      .finally(() => setLoadingContracts(false));
  }, []);

  useEffect(() => {
    loadVehicles();
    loadContracts();
  }, [loadVehicles, loadContracts]);

  // ── Filtro de busca ────────────────────────────────────────────
  const filteredVehicles = useMemo(() => {
    if (!search.trim()) return vehicles;
    const q = search.toLowerCase();
    return vehicles.filter(
      (v) =>
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.plate.toLowerCase().includes(q)
    );
  }, [vehicles, search]);

  // ── Ações do modal ─────────────────────────────────────────────
  function openModal(vehicle: MarketplaceVehicle) {
    setSelectedVehicle(vehicle);
    setQuote(null);
    setQuoteError(null);
    setClientName("");
    setStartDate(today);
    setEndDate(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSelectedVehicle(null);
    setQuote(null);
    setQuoteError(null);
  }

  async function handleQuote(e: FormEvent) {
    e.preventDefault();
    if (!selectedVehicle || !clientName.trim()) return;
    setQuoting(true);
    setQuoteError(null);
    setQuote(null);
    try {
      const res = await contractsApi.quote({
        vehicle_id: selectedVehicle.id,
        start_date: startDate,
        end_date: endDate,
        client_name: clientName.trim(),
      });
      setQuote(res.data as ContractQuote);
    } catch (err) {
      setQuoteError(extractApiError(err, "Não foi possível gerar a cotação."));
    } finally {
      setQuoting(false);
    }
  }

  // ── Confirmar contratação (cria contrato no BD) ────────────────
  const [contracting, setContracting] = useState(false);
  const [contractSuccess, setContractSuccess] = useState(false);

  async function handleConfirmContract() {
    if (!quote || !selectedVehicle) return;
    setContracting(true);
    try {
      await contractsApi.create({
        title: `Locação ${quote.vehicle.brand} ${quote.vehicle.model} — ${clientName}`,
        area: "frota",
        template_key: "locacao_veiculo",
        client_name: clientName,
        content: quote.payment.description,
        honorarios: quote.pricing.totalValue,
        vehicle_id: selectedVehicle.id,
        start_date: startDate,
        end_date: endDate,
      });
      setContractSuccess(true);
      loadContracts();
      setTimeout(() => {
        setContractSuccess(false);
        closeModal();
      }, 2500);
    } catch (err) {
      setQuoteError(extractApiError(err, "Erro ao registrar o contrato."));
    } finally {
      setContracting(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Marketplace de Ativos"
        subtitle="Veículos disponíveis para locação — cotação e faturamento integrados"
        eyebrow="Comercial"
      />

      {/* ── Grid de veículos ──────────────────────────────────── */}
      <section className="mb-10">
        {/* Busca */}
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
            />
            <input
              id="marketplace-search"
              type="search"
              placeholder="Buscar por marca, modelo ou placa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-fleet pl-10"
            />
          </div>
          <span className="text-sm text-on-surface-variant">
            {filteredVehicles.length} disponível(is)
          </span>
        </div>

        {loadingVehicles ? (
          <LoadingState message="Carregando veículos disponíveis..." />
        ) : vehiclesError ? (
          <ErrorState message={vehiclesError} onRetry={loadVehicles} />
        ) : filteredVehicles.length === 0 ? (
          <div className="raised-card flex flex-col items-center gap-3 py-12 text-center">
            <Icon name="storefront" className="text-5xl text-on-surface-variant/50" />
            <p className="font-bold text-on-surface-variant">Nenhum veículo disponível no momento.</p>
            <p className="text-sm text-on-surface-variant/70">
              Todos os ativos podem estar em viagem ou manutenção.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredVehicles.map((v) => (
              <article
                key={v.id}
                className="raised-card group flex flex-col overflow-hidden transition hover:border-primary/50 hover:shadow-lg"
              >
                {/* Header do card */}
                <div className="flex items-start justify-between border-b border-outline-variant bg-surface-container-high px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <Icon
                        name={VehicleIcon({ brand: v.brand, model: v.model })}
                        className="text-xl text-primary"
                      />
                    </span>
                    <div>
                      <p className="font-bold leading-tight text-on-surface">
                        {v.brand} {v.model}
                      </p>
                      <p className="text-[10px] uppercase tracking-wide text-on-surface-variant">
                        {v.year}
                      </p>
                    </div>
                  </div>
                  <span className="chip-active">Disponível</span>
                </div>

                {/* Corpo do card */}
                <div className="flex-1 space-y-2.5 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Placa</span>
                    <span className="font-mono font-bold text-primary">{v.plate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Odômetro</span>
                    <span className="font-semibold">{v.mileage.toLocaleString("pt-BR")} km</span>
                  </div>
                  {v.avgConsumption && (
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">Consumo médio</span>
                      <span className="font-semibold">{v.avgConsumption.toFixed(1)} km/L</span>
                    </div>
                  )}
                </div>

                {/* Footer com preço e CTA */}
                <div className="border-t border-outline-variant bg-surface-container-lowest px-4 py-3">
                  <div className="mb-3 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] uppercase text-on-surface-variant">A partir de</p>
                      <p className="text-xl font-black text-primary">
                        {formatBRL(v.pricePerDay)}
                        <span className="text-xs font-normal text-on-surface-variant">/dia</span>
                      </p>
                    </div>
                  </div>
                  <button
                    id={`contratar-${v.id}`}
                    type="button"
                    onClick={() => openModal(v)}
                    className="btn-primary w-full text-sm uppercase"
                  >
                    <Icon name="handshake" className="text-base" />
                    Contratar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ── Tabela de contratos ───────────────────────────────── */}
      <section>
        <h2 className="mb-4 text-headline-sm text-primary">Gestão de Contratos</h2>
        <div className="raised-card overflow-hidden">
          {loadingContracts ? (
            <LoadingState message="Carregando contratos..." />
          ) : contractsError ? (
            <ErrorState message={contractsError} onRetry={loadContracts} />
          ) : contracts.length === 0 ? (
            <p className="p-6 text-center text-on-surface-variant">
              Nenhum contrato registrado ainda.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="zebra-table w-full text-sm">
                <thead>
                  <tr className="text-left text-label-md text-on-surface-variant">
                    <th className="px-4 py-3">Título</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Valor</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((c) => (
                    <tr key={c.id}>
                      <td
                        data-label="Título"
                        className="px-4 py-3 font-medium max-w-[200px] truncate"
                      >
                        {c.title}
                      </td>
                      <td data-label="Cliente" className="px-4 py-3">
                        {c.client_name}
                      </td>
                      <td data-label="Valor" className="px-4 py-3 font-bold text-primary">
                        {formatBRL(Number(c.honorarios))}
                      </td>
                      <td data-label="Status" className="px-4 py-3">
                        <span className={STATUS_STYLE[c.status] ?? "chip-pending"}>
                          {STATUS_PT[c.status] ?? c.status}
                        </span>
                      </td>
                      <td data-label="Data" className="px-4 py-3 text-on-surface-variant">
                        {c.created_at
                          ? new Date(c.created_at).toLocaleDateString("pt-BR")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ── Modal de cotação ──────────────────────────────────── */}
      <FormModal
        open={modalOpen}
        onClose={closeModal}
        title={`Contratar — ${selectedVehicle?.brand} ${selectedVehicle?.model}`}
        subtitle={`Placa ${selectedVehicle?.plate} · ${formatBRL(selectedVehicle?.pricePerDay ?? 0)}/dia`}
      >
        {!quote ? (
          /* ── Formulário de cotação ── */
          <form onSubmit={handleQuote} className="space-y-4">
            <div>
              <label htmlFor="client-name" className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">
                Nome do Solicitante / Empresa
              </label>
              <input
                id="client-name"
                className="input-fleet"
                placeholder="Ex: Distribuidora Norte Ltda"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="start-date" className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">
                  Data de Início
                </label>
                <input
                  id="start-date"
                  type="date"
                  className="input-fleet"
                  value={startDate}
                  min={today}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="end-date" className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">
                  Data de Devolução
                </label>
                <input
                  id="end-date"
                  type="date"
                  className="input-fleet"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Preview dinâmico */}
            {estimatedDays > 0 && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                <p className="text-xs uppercase text-on-surface-variant mb-2 font-bold">
                  Estimativa de Custo
                </p>
                <div className="flex items-end justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm text-on-surface-variant">
                      {estimatedDays} dia(s) × {formatBRL(selectedVehicle?.pricePerDay ?? 0)}/dia
                    </p>
                    <p className="text-2xl font-black text-primary">{formatBRL(estimatedValue)}</p>
                  </div>
                  <Icon name="calculate" className="text-4xl text-primary/30" />
                </div>
              </div>
            )}

            {quoteError && (
              <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
                {quoteError}
              </p>
            )}

            <button
              type="submit"
              disabled={quoting || estimatedDays <= 0 || !clientName.trim()}
              className="btn-primary w-full uppercase"
            >
              {quoting ? (
                <>
                  <span className="animate-spin">⏳</span> Gerando cotação...
                </>
              ) : (
                <>
                  <Icon name="receipt" className="text-base" />
                  Gerar Cotação e QR Code PIX
                </>
              )}
            </button>
          </form>
        ) : (
          /* ── Resultado da cotação com QR Code ── */
          <div className="space-y-4">
            {/* Resumo */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-[10px] uppercase text-on-surface-variant">Veículo</p>
                  <p className="font-bold">
                    {quote.vehicle.brand} {quote.vehicle.model}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-on-surface-variant">Placa</p>
                  <p className="font-mono font-bold text-primary">{quote.vehicle.plate}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-on-surface-variant">Período</p>
                  <p className="font-bold">{quote.period.days} dias</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-on-surface-variant">Total</p>
                  <p className="text-xl font-black text-primary">
                    {formatBRL(quote.pricing.totalValue)}
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code PIX */}
            <div className="flex flex-col items-center gap-3 rounded-xl border border-outline-variant bg-white p-4">
              <p className="text-xs font-bold uppercase text-slate-600">
                QR Code PIX — Escanear para Pagar
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getQrCodeUrl(quote.payment.pixPayload)}
                alt="QR Code PIX para pagamento"
                width={180}
                height={180}
                className="rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="w-full rounded-lg bg-slate-100 p-2 text-center">
                <p className="text-[10px] text-slate-500">Chave PIX</p>
                <p className="font-mono text-xs font-bold text-slate-800">
                  {quote.payment.pixKey}
                </p>
              </div>
              <p className="text-center text-[10px] text-slate-500">{quote.payment.description}</p>
            </div>

            {quoteError && (
              <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
                {quoteError}
              </p>
            )}

            {contractSuccess ? (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-green-500/10 border border-green-500/30 p-4 text-green-400 font-bold">
                <Icon name="check_circle" className="text-xl" />
                Contrato registrado com sucesso!
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setQuote(null)}
                  className="btn-secondary flex-1 text-sm uppercase"
                >
                  <Icon name="arrow_back" className="text-base" />
                  Alterar Datas
                </button>
                <button
                  type="button"
                  onClick={() => void handleConfirmContract()}
                  disabled={contracting}
                  className="btn-primary flex-1 text-sm uppercase"
                >
                  {contracting ? (
                    "Registrando..."
                  ) : (
                    <>
                      <Icon name="check_circle" className="text-base" />
                      Confirmar Contrato
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </FormModal>
    </AppShell>
  );
}
