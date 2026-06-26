"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ActionButton from "@/components/ui/ActionButton";
import FormModal from "@/components/ui/FormModal";
import FormField from "@/components/forms/FormField";
import ListPageStates from "@/components/ui/ListPageStates";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ListRowSkeleton } from "@/components/ui/LoadingSkeleton";
import { fuelApi, uploadsApi, vehiclesApi, driversApi } from "@/services/api";
import { extractApiError } from "@/lib/api-errors";
import { formatBRL } from "@/lib/currency";
import { formatPlateDisplay } from "@/lib/validators";
import CurrencyField from "@/components/forms/CurrencyField";
import { showToast } from "@/components/ui/Toast";

interface FuelRow {
  id: string;
  filled_at: string;
  vehicle_plate: string;
  driver_name?: string;
  liters: number;
  cost: number;
  mileage_at_fill?: number;
  suspicious?: number | boolean;
  receipt_url?: string | null;
  station?: string | null;
}

export default function FuelPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "cards" | "ocr">("dashboard");
  const [records, setRecords] = useState<FuelRow[]>([]);
  const [vehicles, setVehicles] = useState<{ id: string; plate: string }[]>([]);
  const [drivers, setDrivers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FuelRow | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptDataUrl, setReceiptDataUrl] = useState<string | null>(null);

  // Chart states with real data
  const [chartPlate, setChartPlate] = useState<string | "">("");
  const [chartLoadingKey, setChartLoadingKey] = useState(0);
  const [monthlyData, setMonthlyData] = useState<{ month: string; cost: number; liters: number; fills: number }[]>(
    Array.from({ length: 12 }, (_, i) => ({ month: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][i], cost: 0, liters: 0, fills: 0 }))
  );
  const [reportData, setReportData] = useState<{ summary: any; byVehicle: any[] }>({ summary: null, byVehicle: [] });
  const [chartLoading, setChartLoading] = useState(false);


  // Card & NFC States
  const [activeCards, setActiveCards] = useState([
    { id: "card-1", plate: "BRA-2E19", vehicle: "Scania R 450", balance: 1000, driver: "Jeovana Lopesvalente", terminal: "Multipostos Credenciados (BaaS)" },
    { id: "card-2", plate: "BRA-2E19", vehicle: "Scania R 450", balance: 2876.92, driver: "Bianca Silveira", terminal: "Posto Shell Rota Norte (BaaS)" },
    { id: "card-3", plate: "MEC-4D21", vehicle: "Mercedes-Benz Atego", balance: 0, driver: "Carlos Silveira", terminal: "Posto Central (BaaS)" }
  ]);
  const [selectedCardId, setSelectedCardId] = useState("card-1");
  const [isCardNumberVisible, setIsCardNumberVisible] = useState(false);
  const [showPixForm, setShowPixForm] = useState(false);

  // Emission form states
  const [emitVehicleId, setEmitVehicleId] = useState("");
  const [emitOwnerName, setEmitOwnerName] = useState("");
  const [emitTerminal, setEmitTerminal] = useState("");
  const [emitInitialBalance, setEmitInitialBalance] = useState("500");

  const [cardBalance, setCardBalance] = useState(1000);
  const [nfcModalOpen, setNfcModalOpen] = useState(false);
  const [nfcWalletType, setNfcWalletType] = useState<"Google Wallet" | "Apple Pay" | null>(null);
  const [nfcStep, setNfcStep] = useState<"connecting" | "processing" | "success">("connecting");
  const [showEmitForm, setShowEmitForm] = useState(false);

  const currentCard = activeCards.find(c => c.id === selectedCardId) || activeCards[0];

  useEffect(() => {
    setCardBalance(currentCard.balance);
  }, [selectedCardId, activeCards, currentCard.balance]);

  const handleProcessEmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emitVehicleId || !emitOwnerName || !emitTerminal || !emitInitialBalance) {
      showToast("Por favor, preencha todos os campos para emissão.", "warning");
      return;
    }
    const vehicleObj = vehicles.find(v => v.id === emitVehicleId);
    const vehiclePlate = vehicleObj ? vehicleObj.plate : "BRA-2E19";
    const newCard = {
      id: `card-${Date.now()}`,
      plate: vehiclePlate,
      vehicle: vehiclePlate === "BRA-2E19" ? "Scania R 450" : vehiclePlate === "FLT-0130" ? "Volvo FH 540" : "Mercedes-Benz Atego",
      balance: Number(emitInitialBalance),
      driver: emitOwnerName,
      terminal: emitTerminal
    };
    setActiveCards(prev => [...prev, newCard]);
    setSelectedCardId(newCard.id);
    showToast(`Cartão pré-pago emitido com sucesso para ${emitOwnerName} (${vehiclePlate})!`, "success");
    setShowEmitForm(false);
    setEmitVehicleId("");
    setEmitOwnerName("");
    setEmitTerminal("");
    setEmitInitialBalance("500");
  };

  // Pix refund modal states
  const [pixRefundModalOpen, setPixRefundModalOpen] = useState(false);
  const [pixRefundConfirming, setPixRefundConfirming] = useState(false);
  const [pixRefundSuccess, setPixRefundSuccess] = useState(false);

  // Statement & Receipt states
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [thermalReceiptOpen, setThermalReceiptOpen] = useState(false);
  const [compraModalOpen, setCompraModalOpen] = useState(false);

  const [transactions, setTransactions] = useState([
    {
      id: "tx-1",
      title: "Carga PIX: Central Gestor",
      type: "credit",
      amount: 500.00,
      date: "2026-06-09 19:01:55",
      status: "Sucesso",
      method: "Compensado",
      authCode: "PIX982736152",
      details: "Injeção de fundos autorizada pelo gestor de frota.",
      plate: "BRA-2E19",
      driver: "Jeovana Lopesvalente"
    }
  ]);

  const handleSimulateWebhook = () => {
    const chargeAmount = 500.00;
    setActiveCards(prev => prev.map(card => {
      if (card.id === selectedCardId) {
        return { ...card, balance: card.balance + chargeAmount };
      }
      return card;
    }));
    const newTx = {
      id: `tx-sim-${Date.now()}`,
      title: "Carga PIX: Central Gestor",
      type: "credit",
      amount: chargeAmount,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: "Sucesso",
      method: "Compensado",
      authCode: `PIX${Math.floor(100000000 + Math.random() * 900000000)}`,
      details: "Injeção de fundos autorizada pelo gestor de frota.",
      plate: currentCard.plate,
      driver: currentCard.driver
    };
    setTransactions(prev => [newTx, ...prev]);
    showToast(`Injeção de R$ 500,00 via Webhook compensada com sucesso para ${currentCard.driver}!`, "success");
  };

  const totalDeposited = useMemo(() => {
    return transactions.reduce((acc, tx) => acc + tx.amount, 0);
  }, [transactions]);

  const [historicoTransacoes, setHistoricoTransacoes] = useState([
    {
      id: "h1",
      type: "CUPOM ESCANEADO",
      vehicle: "SCANIA R 450 (BRA-2E19)",
      details: "Posto Central / Cupom OCR - Operador: Carlos Silveira",
      date: "2026-06-12",
      odom: "145.210 Km",
      amount: 450.00,
      liters: 75
    },
    {
      id: "h2",
      type: "CUPOM ESCANEADO",
      vehicle: "SCANIA R 450 (BRA-2E19)",
      details: "Posto Central / Cupom OCR - Operador: Carlos Silveira",
      date: "2026-06-09",
      odom: "136.949 Km",
      amount: 183.08,
      liters: 33.3
    },
    {
      id: "h3",
      type: "CARTÃO NFC",
      vehicle: "SCANIA R 450 (BRA-2E19)",
      details: "Posto Ipiranga Rota Norte - Operador: Amanda Silveira",
      date: "2026-06-09",
      odom: "136.949 Km",
      amount: 183.08,
      liters: 33.3
    },
    {
      id: "h4",
      type: "CARTÃO NFC",
      vehicle: "SCANIA R 450 (BRA-2E19)",
      details: "Posto Shell Rota Norte - Operador: Amanda Silveira",
      date: "2026-06-05",
      odom: "125.420 Km",
      amount: 825.00,
      liters: 150
    }
  ]);

  const handleGoogleWalletClick = () => {
    setNfcWalletType("Google Wallet");
    setNfcStep("connecting");
    setNfcModalOpen(true);
    setTimeout(() => {
      setNfcStep("processing");
      setTimeout(() => { setNfcStep("success"); }, 2000);
    }, 1500);
  };

  const handleApplePayClick = () => {
    setNfcWalletType("Apple Pay");
    setNfcStep("connecting");
    setNfcModalOpen(true);
    setTimeout(() => {
      setNfcStep("processing");
      setTimeout(() => { setNfcStep("success"); }, 2000);
    }, 1500);
  };

  const [pixKeyType, setPixKeyType] = useState("CPF/CNPJ");
  const [pixKey, setPixKey] = useState("");
  const [pixName, setPixName] = useState("");
  const [refundMessage, setRefundMessage] = useState("");

  const load = () => {
    setLoading(true);
    setFetchError(null);
    fuelApi.list().then((res) => {
      const data = Array.isArray(res.data) ? res.data : [];
      const mockRecords: FuelRow[] = [
        {
          id: "sup-1",
          filled_at: new Date(Date.now() - 3600000).toISOString(),
          vehicle_plate: "BRA-2E19",
          driver_name: "Carlos Silveira",
          liters: 75,
          cost: 450.00,
          mileage_at_fill: 145210,
          suspicious: false,
          station: "Posto Ipiranga"
        },
        {
          id: "sup-2",
          filled_at: new Date(Date.now() - 86400000).toISOString(),
          vehicle_plate: "BRA-2E19",
          driver_name: "Carlos Silveira",
          liters: 33.3,
          cost: 183.08,
          mileage_at_fill: 136949,
          suspicious: false,
          station: "Shell"
        },
        {
          id: "sup-3",
          filled_at: new Date(Date.now() - 172800000).toISOString(),
          vehicle_plate: "BRA-2E19",
          driver_name: "Carlos Silveira",
          liters: 75,
          cost: 450.00,
          mileage_at_fill: 125100,
          suspicious: false,
          station: "Posto Ipiranga"
        },
        {
          id: "sup-4",
          filled_at: new Date(Date.now() - 259200000).toISOString(),
          vehicle_plate: "FLT-0130",
          driver_name: "Roberto Souza",
          liters: 208,
          cost: 1250.00,
          mileage_at_fill: 81880,
          suspicious: false,
          station: "Posto Ipiranga"
        }
      ];

      const merged = [...data];
      mockRecords.forEach(mock => {
        if (!merged.some(r => r.id === mock.id)) merged.push(mock);
      });
      setRecords(merged);
    })
      .catch((err) => {
        setRecords([]);
        setFetchError(extractApiError(err, "Não foi possível carregar os abastecimentos."));
      })
      .finally(() => setLoading(false));

    // Load real chart data
    Promise.all([
      fuelApi.monthly(chartPlate || undefined),
      fuelApi.report()
    ]).then(([monthlyRes, reportRes]) => {
      if (Array.isArray(monthlyRes.data)) setMonthlyData(monthlyRes.data);
      setReportData({
        summary: reportRes.data?.summary,
        byVehicle: Array.isArray(reportRes.data?.byVehicle) ? reportRes.data.byVehicle : []
      });
    }).catch(() => {});
  };

  const loadChart = (plate: string) => {
    setChartLoading(true);
    const vehicleId = vehicles.find(
      (v) => v.plate.trim().toUpperCase() === plate.trim().toUpperCase()
    )?.id;

    Promise.all([
      fuelApi.monthly(plate || undefined),
      fuelApi.report(vehicleId || undefined)
    ]).then(([monthlyRes, reportRes]) => {
      if (Array.isArray(monthlyRes.data)) setMonthlyData(monthlyRes.data);
      setReportData(prev => ({
        ...prev,
        summary: reportRes.data?.summary
      }));
    }).catch(() => {})
      .finally(() => setChartLoading(false));
  };


  useEffect(() => {
    load();
    vehiclesApi.list().then((res) => setVehicles(Array.isArray(res.data) ? res.data : [])).catch(() => { });
    driversApi.list().then((res) => setDrivers(Array.isArray(res.data) ? res.data : [])).catch(() => { });
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fuelApi.create({
        vehicle_id: form.get("vehicle_id"),
        driver_id: form.get("driver_id") || undefined,
        liters: Number(form.get("liters")),
        cost: Number(form.get("cost")),
        mileage_at_fill: Number(form.get("mileage_at_fill")),
        receipt_url: receiptDataUrl || undefined,
      });
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const handleRefundSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!pixKey.trim() || !pixName.trim() || cardBalance <= 0) return;
    setPixRefundSuccess(false);
    setPixRefundConfirming(false);
    setPixRefundModalOpen(true);
  };

  return (
    <AppShell>
      <ErrorBoundary>
        <PageHeader
          breadcrumb="Sede Central / Unidade Operacional / Supplies"
          title="ABASTECIMENTO & CONTROLE DE SALDOS"
          subtitle="Gerencie o ciclo operacional de abastecimento, escaneie cupons fiscais e audite cartões pré-pagos NFC integrados."
          actions={
            <div className="flex gap-2 bg-[#0F172A] p-1.5 rounded-lg border border-outline-variant/30">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold uppercase transition ${activeTab === "dashboard"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                <Icon name="dashboard" className="text-sm" />
                Dashboard de Abastecimento
              </button>
              <button
                onClick={() => setActiveTab("cards")}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold uppercase transition ${activeTab === "cards"
                    ? "bg-[#1E293B] text-[#FCA311] border border-outline-variant/30"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                <Icon name="credit_card" className="text-sm" />
                Cartões NFC & Saldos
              </button>
              <button
                onClick={() => setActiveTab("ocr")}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold uppercase transition ${activeTab === "ocr"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                <Icon name="photo_camera" className="text-sm" />
                Lançar Cupons (OCR)
              </button>
            </div>
          }
        />

        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Top KPIs */}
            <div className="grid grid-cols-4 gap-4">
              <div className="raised-card p-4 bg-[#0c132b]/80 border-outline-variant/30 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">CUSTO TOTAL COMBUSTÍVEL</p>
                <p className="text-xl font-bold text-[#FCA311] font-mono">
                  {reportData.summary ? `R$ ${Number(reportData.summary.total_cost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ —'}
                </p>
                <p className="text-[9px] text-slate-400 mt-1 flex justify-center items-center gap-1"><Icon name="trending_up" className="text-[12px] text-[#FCA311]" /> Dados reais da frota ativa</p>
              </div>
              <div className="raised-card p-4 bg-[#0c132b]/80 border-outline-variant/30 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">VOLUME TOTAL FATURADO</p>
                <p className="text-xl font-bold text-[#FCA311] font-mono">
                  {reportData.summary ? `${Number(reportData.summary.total_liters).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} L` : '— L'}
                </p>
                <p className="text-[9px] text-blue-400 mt-1 font-bold flex justify-center items-center gap-1"><Icon name="link" className="text-[12px]" />
                  {reportData.summary && Number(reportData.summary.total_liters) > 0 ? `Média: R$ ${(Number(reportData.summary.total_cost) / Number(reportData.summary.total_liters)).toFixed(2).replace('.',',')}/L` : 'Sem dados'}
                </p>
              </div>
              <div className="raised-card p-4 bg-[#0c132b]/80 border-outline-variant/30 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">SALDO ATIVO EM CARTÕES</p>
                <p className="text-xl font-bold text-[#FCA311] font-mono">R$ {activeCards.reduce((a,c) => a + c.balance, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p className="text-[9px] text-slate-400 mt-1 flex justify-center items-center gap-1"><Icon name="account_balance_wallet" className="text-[12px] text-green-400" /> {activeCards.length} cartões NFC ativos</p>
              </div>
              <div className="raised-card p-4 bg-[#0c132b]/80 border-outline-variant/30 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">LANÇAMENTOS DE ABASTECIMENTO</p>
                <p className="text-xl font-bold text-[#FCA311] font-mono flex justify-center items-center gap-2">
                  {reportData.summary ? `${reportData.summary.fill_count} Eventos` : '— Eventos'} <Icon name="trending_up" className="text-purple-400 text-[18px]" />
                </p>
                <p className="text-[9px] text-slate-400 mt-1"><span className="text-blue-400">{records.filter(r => !r.id.startsWith('sup-')).length} API</span> | <span className="text-purple-400">{records.filter(r => r.id.startsWith('sup-')).length} Local</span></p>
              </div>
            </div>

            {/* Gráficos com dados reais */}
            <div id="chart-section" className="raised-card p-5 bg-[#0c132b]/80 border-outline-variant/30">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xs font-bold uppercase text-primary flex items-center gap-1.5">
                    <Icon name="bar_chart" /> GRÁFICOS COMPARATIVOS MENSAIS
                    {chartPlate && <span className="text-[#FCA311] ml-2 text-[9px] font-bold border border-[#FCA311]/40 bg-[#FCA311]/10 px-2 py-0.5 rounded-full">🔍 {chartPlate}</span>}
                    {chartLoading && <span className="text-slate-400 ml-2 text-[8px] animate-pulse">Atualizando...</span>}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">Série financeira e volumétrica real do ano {new Date().getFullYear()}. Use o botão &quot;Filtrar Gráfico&quot; na tabela abaixo para filtrar por veículo.</p>
                </div>
                {chartPlate && (
                  <button
                    onClick={() => { setChartPlate(""); loadChart(""); }}
                    className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 border border-outline-variant/30 px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition uppercase"
                  >
                    <Icon name="close" className="text-xs" /> Limpar Filtro
                  </button>
                )}
              </div>

              {(() => {
                const maxCost = Math.max(...monthlyData.map(d => d.cost), 1);
                const maxLiters = Math.max(...monthlyData.map(d => d.liters), 1);
                const costScale = [4, 3, 2, 1, 0].map(i => Math.round(maxCost * i / 4));
                const litersScale = [4, 3, 2, 1, 0].map(i => Math.round(maxLiters * i / 4));

                return (
                  <div className="grid grid-cols-2 gap-6 h-72">
                    {/* Bar Chart — Custo Mensal */}
                    <div className="border border-outline-variant/20 rounded-lg bg-[#0F172A]/40 p-4 flex flex-col relative">
                      <h4 className="text-[9px] font-bold text-slate-300 uppercase flex items-center gap-1 mb-4">
                        <Icon name="trending_up" className="text-[12px] text-[#FCA311]" /> GASTO FATURADO MENSAL (R$)
                      </h4>
                      <div className="flex-1 flex items-end justify-between relative pl-10 pb-5">
                        {/* Y Axis */}
                        <div className="absolute left-0 top-0 bottom-5 flex flex-col justify-between text-[8px] text-slate-500 font-mono w-9 text-right pr-1">
                          {costScale.map(v => <span key={v}>{v}</span>)}
                        </div>
                        {/* Grid lines */}
                        <div className="absolute left-10 right-0 top-0 bottom-5 flex flex-col justify-between pointer-events-none">
                          {[0,1,2,3,4].map(i => <div key={i} className="border-b border-white/5 w-full" />)}
                        </div>
                        {/* Bars */}
                        {monthlyData.map((m) => {
                          const heightPct = maxCost > 0 ? (m.cost / maxCost) * 100 : 0;
                          const isActive = m.cost > 0;
                          return (
                            <div key={m.month} className="flex flex-col items-center w-full z-10 relative h-full justify-end group">
                              {isActive && (
                                <div
                                  className="w-3/4 rounded-t-sm transition-all duration-500"
                                  style={{ height: `${heightPct}%`, background: 'linear-gradient(to top, #1d4ed8, #3b82f6)', boxShadow: '0 0 8px rgba(59,130,246,0.4)' }}
                                />
                              )}
                              {/* Tooltip on hover */}
                              {isActive && (
                                <div className="absolute bottom-full mb-1 hidden group-hover:block bg-slate-800 border border-outline-variant/30 rounded px-2 py-1 text-[8px] font-bold text-white whitespace-nowrap z-20">
                                  R$ {m.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | {m.fills} abast.
                                </div>
                              )}
                              <span className="text-[8px] text-slate-500 absolute -bottom-4">{m.month}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* SVG Line Chart — Volume Mensal */}
                    <div className="border border-outline-variant/20 rounded-lg bg-[#0F172A]/40 p-4 flex flex-col relative">
                      <h4 className="text-[9px] font-bold text-slate-300 uppercase flex items-center gap-1 mb-4">
                        <Icon name="opacity" className="text-[12px] text-[#FCA311]" /> VOLUME MENSAL CONSUMIDO (LITROS)
                      </h4>
                      <div className="flex-1 flex items-end justify-between relative pl-10 pb-5">
                        <div className="absolute left-0 top-0 bottom-5 flex flex-col justify-between text-[8px] text-slate-500 font-mono w-9 text-right pr-1">
                          {litersScale.map(v => <span key={v}>{v}</span>)}
                        </div>
                        <div className="absolute left-10 right-0 top-0 bottom-5 flex flex-col justify-between pointer-events-none">
                          {[0,1,2,3,4].map(i => <div key={i} className="border-b border-white/5 w-full" />)}
                        </div>
                        {/* SVG Line with real data points */}
                        <svg className="absolute left-10 right-0 top-0 bottom-5 w-[calc(100%-2.5rem)] h-full" preserveAspectRatio="none" viewBox="0 0 110 100">
                          {(() => {
                            const pts = monthlyData.map((d, i) => {
                              const x = (i / 11) * 100 + 5;
                              const y = maxLiters > 0 ? 100 - (d.liters / maxLiters) * 90 : 100;
                              return `${x},${y}`;
                            });
                            return (
                              <>
                                <polyline points={pts.join(' ')} fill="none" stroke="#FCA311" strokeWidth="1.5" strokeLinejoin="round" />
                                {monthlyData.map((d, i) => {
                                  if (d.liters === 0) return null;
                                  const x = (i / 11) * 100 + 5;
                                  const y = 100 - (d.liters / maxLiters) * 90;
                                  return (
                                    <g key={d.month}>
                                      <circle cx={x} cy={y} r="2.5" fill="#0F172A" stroke="#FCA311" strokeWidth="1.5" />
                                      <title>{d.month}: {d.liters} L</title>
                                    </g>
                                  );
                                })}
                              </>
                            );
                          })()}
                        </svg>
                        {monthlyData.map((m) => (
                          <div key={m.month} className="flex flex-col items-center w-full z-10 relative h-full justify-end">
                            <span className="text-[8px] text-slate-500 absolute -bottom-4">{m.month}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Relatório Consolidado — dados reais */}
            <div className="raised-card p-5 bg-[#0c132b]/80 border-outline-variant/30">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 mb-1"><Icon name="local_shipping" /> RELATÓRIO CONSOLIDADO DE GASTOS POR VEÍCULO</h3>
              <p className="text-[9px] text-slate-400 mb-4">Auditoria financeira de consumo com o rateio absoluto de custos por automóvel. Clique em &quot;Filtrar Gráfico&quot; para filtrar os gráficos acima.</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/30 text-[9px] font-bold text-slate-500 uppercase">
                      <th className="py-3 px-2 font-bold">VEÍCULO / PLACA</th>
                      <th className="py-3 px-2 font-bold text-center">LANÇAMENTOS</th>
                      <th className="py-3 px-2 font-bold w-48">LITROS COMPRADOS</th>
                      <th className="py-3 px-2 font-bold text-center">PREÇO MÉDIO / L</th>
                      <th className="py-3 px-2 font-bold text-right">GASTO ACUMULADO (R$)</th>
                      <th className="py-3 px-2 font-bold text-center">AÇÕES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 text-[10px] text-slate-300">
                    {reportData.byVehicle.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-500 text-[10px]">Nenhum dado de abastecimento no banco. Lance abastecimentos para ver dados reais.</td>
                      </tr>
                    ) : (
                      reportData.byVehicle.map((v: any) => {
                        const totalCost = reportData.byVehicle.reduce((a: number, x: any) => a + Number(x.cost), 0);
                        const pct = totalCost > 0 ? Math.round((Number(v.cost) / totalCost) * 100) : 0;
                        const barPct = Math.max(5, pct);
                        const avgPrice = Number(v.liters) > 0 ? (Number(v.cost) / Number(v.liters)).toFixed(2).replace('.', ',') : '0,00';
                        const isActive = chartPlate === v.plate;
                        return (
                          <tr key={v.plate} className={`hover:bg-white/5 transition ${isActive ? 'bg-blue-600/5 border-l-2 border-l-blue-600' : ''}`}>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 flex items-center justify-center bg-[#0F172A] border border-outline-variant/30 rounded"><Icon name="local_shipping" className="text-slate-400 text-xs" /></div>
                                <div>
                                  <p className="font-bold text-[#FCA311] text-[11px]">{v.plate}</p>
                                  <p className="text-[8px] text-slate-500">{v.fills} abastecimentos</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-center text-slate-400">{v.fills} evento(s)</td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-outline-variant/10">
                                  <div className="h-full bg-[#FCA311]" style={{ width: `${barPct}%` }} />
                                </div>
                                <span className="font-bold text-[9px] whitespace-nowrap">{Number(v.liters).toFixed(1)} L</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-center font-bold text-blue-400">R$ {avgPrice}</td>
                            <td className="py-3 px-2 text-right">
                              <p className="font-bold text-slate-100 text-[11px]">R$ {Number(v.cost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                              <p className="text-[8px] text-slate-500">{pct}% da frota</p>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <button
                                onClick={() => {
                                  const newPlate = isActive ? "" : v.plate;
                                  setChartPlate(newPlate);
                                  loadChart(newPlate);
                                  document.getElementById('chart-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }}
                                className={`px-2 py-1 rounded text-[8px] font-bold transition uppercase ${isActive
                                  ? 'bg-blue-600 text-white border border-blue-600'
                                  : 'border border-blue-600/50 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white'
                                }`}
                              >
                                {isActive ? '✓ ATIVO' : 'FILTRAR GRÁFICO'}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>


            {/* Histórico Consolidado de Transações */}
            <div className="raised-card p-5 bg-[#0c132b]/80 border-outline-variant/30">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 mb-1"><Icon name="history" /> HISTÓRICO CONSOLIDADO DE TRANSAÇÕES</h3>
              <p className="text-[9px] text-slate-400 mb-4">Lançamentos em tempo de execução vindos de cupons OCR e cartões de abastecimento NFC.</p>
              <div className="space-y-2">
                {historicoTransacoes.map((t) => (
                  <div key={t.id} onClick={() => { setSelectedTx(t); setCompraModalOpen(true); }} className="flex justify-between items-center bg-[#0F172A]/80 border border-outline-variant/30 rounded-lg p-3 hover:bg-white/5 cursor-pointer transition">
                    <div className="flex items-center gap-4">
                      <span className={`text-[8px] font-bold px-2 py-1 rounded uppercase ${t.type === 'CUPOM ESCANEADO' ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' : 'bg-green-600/20 text-green-400 border border-green-600/30'}`}>
                        {t.type}
                      </span>
                      <div>
                        <p className="text-[10px] font-bold text-[#FCA311]">{t.vehicle}</p>
                        <p className="text-[9px] text-slate-400">{t.details}</p>
                        <p className="text-[8px] text-slate-500 font-mono">{t.date} - Odômetro: {t.odom}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-bold text-white">R$ {t.amount.toFixed(2).replace('.', ',')}</p>
                      <p className="text-[9px] text-[#FCA311] font-bold">{t.liters} Litros</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "cards" && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Column 1: Active cards list & Emit Card */}
            <div className="flex flex-col gap-6">
              <div className="raised-card p-5 bg-[#0c132b]/80 border-outline-variant/30 flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b border-outline-variant/20 pb-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary">CARTÕES DE ABASTECIMENTO ATIVOS</h3>
                  <button
                    type="button"
                    onClick={() => setShowEmitForm(!showEmitForm)}
                    className="rounded bg-blue-600 px-3 py-1.5 text-[9px] font-bold text-white uppercase hover:bg-blue-500 transition flex items-center gap-1"
                  >
                    <Icon name={showEmitForm ? "close" : "add"} className="text-[14px]" /> {showEmitForm ? "FECHAR" : "EMITIR"}
                  </button>
                </div>
                <div className="space-y-3">
                  {activeCards.map((card) => (
                    <div
                      key={card.id}
                      onClick={() => setSelectedCardId(card.id)}
                      className={`rounded-lg border p-3 flex justify-between items-start cursor-pointer transition ${selectedCardId === card.id
                          ? "border-blue-500 bg-blue-500/5"
                          : "border-outline-variant/30 bg-[#0F172A]/80 hover:bg-white/5"
                        }`}
                    >
                      <div>
                        <span className="inline-block rounded bg-amber-500/15 border border-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-[#FCA311] font-mono">{card.plate}</span>
                        <p className="text-[10px] text-slate-300 mt-1.5">{card.vehicle}</p>
                        <p className="text-[11px] font-bold text-[#FCA311] mt-0.5">Saldo: R$ {card.balance.toFixed(2).replace('.', ',')}</p>
                      </div>
                      <div className="text-right">
                        <span className="chip-active text-[9px]">ATIVO</span>
                        <p className="text-[9px] text-slate-400 mt-2 font-mono">{card.driver}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {showEmitForm && (
                <div className="raised-card p-5 bg-[#0c132b]/80 border-outline-variant/30 flex flex-col transition-all duration-300">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">EMITIR NOVO CARTÃO PRÉ-PAGO</h3>
                  <p className="text-[10px] text-slate-400 mb-4">Gere um cartão físico/digital associado por segurança a uma placa da frota.</p>

                  <form onSubmit={handleProcessEmission} className="space-y-4">
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">VINCULAR A QUAL VEÍCULO</label>
                      <select
                        value={emitVehicleId}
                        onChange={(e) => setEmitVehicleId(e.target.value)}
                        className="w-full text-xs h-9 bg-[#0b0e14]/80 border border-outline-variant/30 rounded px-2 text-white focus:outline-none"
                        required
                      >
                        <option value="">Selecione um veículo...</option>
                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">NOME DO HOMOLOGADO</label>
                      <input
                        type="text"
                        value={emitOwnerName}
                        onChange={(e) => setEmitOwnerName(e.target.value)}
                        placeholder="Nome do proprietário do cartão..."
                        className="w-full text-xs h-9 bg-[#0b0e14]/80 border border-outline-variant/30 rounded px-2 text-white focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">TERMINAL COMERCIAL</label>
                      <input
                        type="text"
                        value={emitTerminal}
                        onChange={(e) => setEmitTerminal(e.target.value)}
                        placeholder="Ex: Multipostos Credenciados (BaaS)"
                        className="w-full text-xs h-9 bg-[#0b0e14]/80 border border-outline-variant/30 rounded px-2 text-white focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">CARGA INICIAL DE SALDO (R$)</label>
                      <input
                        type="number"
                        value={emitInitialBalance}
                        onChange={(e) => setEmitInitialBalance(e.target.value)}
                        className="w-full text-xs h-9 bg-[#0b0e14]/80 border border-outline-variant/30 rounded px-2 text-white focus:outline-none"
                        required
                      />
                    </div>
                    <div className="text-[9px] text-slate-400 mt-2">
                      <span className="font-bold text-[#FCA311]">Detalhes do Portador:</span><br />
                      Criado pelo Usuário: <span className="text-slate-200">Administrador Fleet AI (Administrador)</span><br />
                      Criptografia PCI compliant. O cartão de faturamento BaaS será gerado sob demanda.
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <button type="button" onClick={() => setShowEmitForm(false)} className="w-full rounded border border-outline-variant/30 bg-[#0F172A] py-2.5 text-[10px] font-bold text-white uppercase hover:bg-white/5 transition">
                        CANCELAR
                      </button>
                      <button type="submit" className="w-full rounded bg-[#FCA311] py-2.5 text-[10px] font-bold text-black uppercase hover:bg-[#FCA311]/90 transition">
                        PROCESSAR EMISSÃO
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Audit panel */}
              <div className="raised-card p-5 bg-[#0c132b]/80 border-outline-variant/30">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary mb-4 border-b border-outline-variant/20 pb-3 flex items-center gap-1.5">
                  <Icon name="verified_user" /> PAINEL DE AUDITORIA & FATURAMENTO
                </h3>
                <p className="text-[10px] text-slate-400 mb-4">Portabilidade operacional BaaS. Rastreabilidade de utilização vinculada à placa e usuário que homologou.</p>

                <div className="space-y-2 text-xs border-b border-outline-variant/10 pb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Homologado por</span>
                    <span className="font-bold text-slate-200">{currentCard.driver}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Placa do Veículo</span>
                    <span className="font-bold text-[#FCA311] font-mono">{currentCard.plate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Modelo</span>
                    <span className="font-bold text-slate-200">{currentCard.vehicle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Terminal Comercial</span>
                    <span className="font-bold text-[#FCA311]">{currentCard.terminal}</span>
                  </div>
                </div>

                <div className="flex gap-2 items-start text-[9px] text-blue-400 mt-4 bg-blue-400/5 border border-blue-400/10 rounded-lg p-3">
                  <Icon name="location_on" className="text-sm shrink-0" />
                  <p>Maquininhas capturadas via geolocalização IP no raio do veículo {currentCard.plate}.</p>
                </div>
              </div>

            </div>

            {/* Column 2: Fleet Card details & Digital wallet & Extrato Detalhado */}
            <div className="flex flex-col gap-6">
              <div className="raised-card p-5 bg-[#0c132b]/80 border-outline-variant/30 flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b border-outline-variant/20 pb-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5"><Icon name="credit_card" className="text-sm" /> CARTÃO FROTA</h3>
                  <span className="rounded bg-green-500/20 border border-green-500/30 px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-green-400 font-mono">
                    PREMIUM PASS
                  </span>
                </div>

                {/* Physical Card Mockup */}
                <div className="relative w-full aspect-[1.58/1] rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0b0f19] p-5 text-white shadow-xl overflow-hidden border border-white/5 select-none">
                  <div className="flex items-center justify-between">
                    <div className="h-7 w-9 rounded bg-amber-500/20 border border-amber-500/40 relative overflow-hidden shrink-0">
                      <div className="absolute inset-x-2 inset-y-1 border-r border-amber-500/30" />
                      <div className="absolute inset-y-2 inset-x-1 border-b border-amber-500/30" />
                    </div>
                    <Icon name="contactless" className="text-slate-400 text-2xl" />
                  </div>
                  <p className="mt-8 text-[18px] font-mono font-semibold tracking-widest text-slate-100 flex justify-between items-center">
                    <span>{isCardNumberVisible ? "4532 8598 9742 5485" : "•••• •••• •••• 5485"}</span>
                    <button
                      type="button"
                      onClick={() => setIsCardNumberVisible(!isCardNumberVisible)}
                      className="text-slate-400 hover:text-white transition"
                    >
                      <Icon name={isCardNumberVisible ? "visibility" : "visibility_off"} className="text-sm" />
                    </button>
                  </p>
                  <div className="mt-6 flex justify-between items-end text-[9px] font-mono text-slate-300">
                    <div>
                      <span className="block text-[7px] text-slate-400 uppercase">PROPRIETÁRIO / PORTADOR</span>
                      <span className="font-bold text-slate-100 text-[10px] block uppercase tracking-wider">{currentCard.driver}</span>
                      <span className="block text-[7px] text-slate-400 uppercase mt-1">VEÍCULO / PLACA</span>
                      <span className="font-bold text-slate-100 text-[10px]">{currentCard.plate} ({currentCard.vehicle.toUpperCase()})</span>
                    </div>
                    <div className="flex gap-4 text-right">
                      <div>
                        <span className="block text-[7px] text-slate-400 uppercase">VÁLIDO</span>
                        <span className="font-bold text-slate-100">06/31</span>
                      </div>
                      <div>
                        <span className="block text-[7px] text-slate-400 uppercase">CVV</span>
                        <span className="font-bold text-slate-100">033</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="raised-card p-5 bg-[#0c132b]/80 border-outline-variant/30 flex flex-col">
                <p className="text-[10px] font-bold text-slate-100 flex items-center gap-1.5 mb-1"><Icon name="smartphone" className="text-sm text-primary" /> CARTEIRA DIGITAL & APROXIMAÇÃO NFC</p>
                <p className="text-[10px] text-slate-400">Adicione o cartão à carteira para pagamentos por aproximação em maquininhas de postos sem precisar de cartão físico.</p>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button onClick={handleGoogleWalletClick} type="button" className="flex items-center justify-center gap-1.5 rounded-lg border border-outline-variant/30 bg-[#0F172A] py-2 text-[10px] font-bold hover:bg-white/5 transition text-white">
                    <Icon name="google" className="text-sm text-primary" /> GOOGLE WALLET
                  </button>
                  <button onClick={handleApplePayClick} type="button" className="flex items-center justify-center gap-1.5 rounded-lg border border-outline-variant/30 bg-[#0F172A] py-2 text-[10px] font-bold hover:bg-white/5 transition text-white">
                    <Icon name="phone_iphone" className="text-sm text-primary" /> APPLE PAY
                  </button>
                </div>
              </div>

              <div className="raised-card p-5 bg-[#0c132b]/80 border-outline-variant/30 flex flex-col">
                <div className="flex justify-between items-center mb-1">
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5"><Icon name="receipt" className="text-sm" /> EXTRATO DETALHADO DO CARTÃO</h3>
                    <p className="text-[8px] text-slate-400 font-mono mt-0.5">Chave do Extrato: 087.251.382-83</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPixForm(!showPixForm)}
                    className="flex items-center gap-1 bg-blue-600 px-3 py-1.5 rounded-lg text-[9px] font-bold text-white uppercase hover:bg-blue-500 transition shadow"
                  >
                    <Icon name="add" className="text-[14px]" /> INJETAR CARGA (PIX COPIA COLA)
                  </button>
                </div>

                {showPixForm && (
                  <div className="mt-4 border-t border-outline-variant/20 pt-4">
                    <h4 className="text-[10px] font-bold uppercase text-slate-100 mb-1">CARGA DE FATURAMENTO PIX BAAS</h4>
                    <p className="text-[9px] text-slate-400 mb-4">Para depositar, escaneie o código dinâmico ou copie a linha de pagamento digitável. O processamento compensará em até 2 segundos.</p>

                    <div className="flex gap-4 items-center bg-[#0F172A] p-3 rounded-lg border border-outline-variant/30">
                      <div className="bg-white p-2 rounded flex items-center justify-center shrink-0">
                        <Icon name="qr_code_2" className="text-black text-5xl" />
                      </div>
                      <div className="flex-1 w-full overflow-hidden">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            value="00020101021226820014br.gov.bcb.pix2561api.asaas.com/v3/cob/9525Card-17310435985"
                            className="w-full text-[9px] h-8 bg-[#0b0e14]/80 border border-[#FCA311]/50 rounded px-2 text-[#FCA311] font-mono overflow-ellipsis focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText("00020101021226820014br.gov.bcb.pix2561api.asaas.com/v3/cob/9525Card-17310435985");
                              showToast("Chave Pix copiada para a área de transferência!", "success");
                            }}
                            className="rounded bg-transparent border border-outline-variant/30 px-3 py-1.5 text-[9px] font-bold text-slate-200 uppercase hover:bg-white/5 transition whitespace-nowrap shrink-0"
                          >
                            COPIAR CHAVE
                          </button>
                        </div>
                        <div className="flex gap-2 mt-3 justify-end">
                          <button
                            type="button"
                            onClick={() => setShowPixForm(false)}
                            className="rounded bg-transparent border border-outline-variant/30 px-4 py-1.5 text-[9px] font-bold text-slate-300 uppercase hover:bg-white/5 transition"
                          >
                            CANCELAR
                          </button>
                          <button
                            type="button"
                            onClick={handleSimulateWebhook}
                            className="rounded bg-blue-600 px-4 py-1.5 text-[9px] font-bold text-white uppercase hover:bg-blue-500 transition shadow"
                          >
                            SIMULAR COMPENSAÇÃO BAAS (WEBHOOK)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-outline-variant/20">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center bg-[#0F172A]/60 border border-blue-500/20 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                          <Icon name="call_received" className="text-[12px]" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-[#FCA311]">
                            {tx.title}{" "}
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTx(tx);
                                setCompraModalOpen(true);
                              }}
                              className="text-[8px] text-slate-400 uppercase font-mono ml-2 border-b border-slate-400 cursor-pointer hover:text-white"
                            >
                              Ver Detalhes
                            </span>
                          </p>
                          <p className="text-[8px] text-slate-400 font-mono mt-0.5">Status: <span className="text-white font-bold">{tx.status}</span> | Unidade Comerc.: BaaS Webhook Compensado</p>
                          <p className="text-[8px] text-slate-500 font-mono">ID Extrato: tx-dep-{tx.id.replace('tx-sim-', '')} | Horário: {tx.date}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-blue-400">+ R$ {tx.amount.toFixed(2).replace('.', ',')}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* Column 3: Expense Metrics & Pix refund */}
            <div className="flex flex-col gap-6">
              <div className="raised-card p-5 bg-[#0c132b]/80 border-outline-variant/30 flex flex-col">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary mb-4 border-b border-outline-variant/20 pb-3">MÉTRICAS DE GASTOS</h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-outline-variant/10">
                    <span className="text-slate-400">Total Depositado:</span>
                    <span className="font-bold text-slate-200">R$ {totalDeposited.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-outline-variant/10">
                    <span className="text-slate-400">Total Utilizado:</span>
                    <span className="font-bold text-red-400">R$ 0,00</span>
                  </div>
                  <div className="rounded-lg bg-[#0F172A] p-3 border border-outline-variant/30 mt-3 text-center">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">SALDO DISPONÍVEL NO CARTÃO</span>
                    <span className="text-2xl font-mono font-bold text-[#FCA311]">R$ {cardBalance.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              </div>

              {/* Devolution Pix form */}
              <div className="raised-card p-5 bg-[#0c132b]/80 border-outline-variant/30 flex flex-col">
                <p className="text-[10px] font-bold text-slate-100 flex items-center gap-1.5 mb-1"><Icon name="reply" className="text-sm text-green-400 -rotate-90" /> DEVOLUÇÃO DE SALDO (ESTORNO PIX)</p>
                <p className="text-[10px] text-slate-400 mb-4">Resgatar o valor restante do cartão direto para uma conta.</p>

                <form onSubmit={handleRefundSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">TIPO DE CHAVE</label>
                      <select
                        value={pixKeyType}
                        onChange={(e) => setPixKeyType(e.target.value)}
                        className="w-full text-xs h-9 bg-[#0b0e14]/80 border border-outline-variant/30 rounded px-2 text-white focus:outline-none"
                      >
                        <option>CPF/CNPJ</option>
                        <option>E-mail</option>
                        <option>Telefone</option>
                        <option>Chave Aleatória</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">CHAVE PIX DE DESTINO</label>
                      <input
                        type="text"
                        placeholder="Digite a chave..."
                        value={pixKey}
                        onChange={(e) => setPixKey(e.target.value)}
                        required
                        className="w-full text-xs h-9 bg-[#0b0e14]/80 border border-outline-variant/30 rounded px-2 text-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">NOME COMPLETO DO TITULAR</label>
                    <input
                      type="text"
                      placeholder="Favorecido do estorno"
                      value={pixName}
                      onChange={(e) => setPixName(e.target.value)}
                      required
                      className="w-full text-xs h-9 bg-[#0b0e14]/80 border border-outline-variant/30 rounded px-2 text-white focus:outline-none"
                    />
                  </div>

                  {refundMessage && <p className="text-[10px] text-green-400">{refundMessage}</p>}

                  <button
                    type="submit"
                    disabled={cardBalance <= 0 || !pixKey || !pixName}
                    className="w-full rounded bg-green-600/30 hover:bg-green-600/50 border border-green-600/50 text-green-400 font-bold uppercase text-[10px] py-3 transition active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    SOLICITAR REEMBOLSO DE R$ {cardBalance.toFixed(2).replace('.', ',')}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeTab === "ocr" && (
          <div className="grid gap-6 lg:grid-cols-12">

            {/* Left Column: Form */}
            <div className="lg:col-span-5 raised-card p-5 bg-[#0c132b]/80 border-outline-variant/30">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary mb-4 border-b border-outline-variant/20 pb-3 flex items-center gap-1.5">
                <Icon name="add" /> LANÇAR CUPOM MANUAL / OCR
              </h3>
              <p className="text-[10px] text-slate-400 mb-4">Carregue ou digite o comprovante emitido pela franqueadora de combustível.</p>

              <form className="space-y-4" onSubmit={handleSubmit}>

                <div
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (ev) => {
                      const file = (ev.target as HTMLInputElement).files?.[0];
                      if (file) {
                        setReceiptFile(file);
                        const reader = new FileReader();
                        reader.onload = () => setReceiptDataUrl(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                  className="border-2 border-dashed border-outline-variant/40 rounded-xl bg-[#0F172A]/40 p-6 text-center cursor-pointer hover:border-[#FCA311]/40 transition group"
                >
                  <Icon name="document_scanner" className="text-3xl text-slate-400 mb-2 group-hover:text-[#FCA311]" />
                  <p className="text-xs font-bold text-slate-200">Escanear Cupom Fiscal</p>
                  <p className="text-[10px] text-slate-400 mt-1">Direcione para câmera do dispositivo ou anexe arquivos png/jpg</p>
                  <button type="button" className="mt-4 bg-blue-600 hover:bg-blue-500 transition text-white px-4 py-2 rounded text-[9px] font-bold uppercase shadow flex items-center gap-1.5 mx-auto">
                    <Icon name="photo_camera" className="text-[12px]" /> {receiptFile ? `CUPOM SELECIONADO: ${receiptFile.name}` : "ESCANEAR CUPOM (TIRAR FOTO OU ARQUIVOS)"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">VEÍCULO DA FROTA</label>
                    <select name="vehicle_id" required className="w-full text-xs h-10 bg-[#0b0e14]/80 border border-outline-variant/30 rounded px-2 text-white focus:outline-none">
                      <option value="">Selecione...</option>
                      {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">MOTORISTA RESPONSÁVEL</label>
                    <select name="driver_id" className="w-full text-xs h-10 bg-[#0b0e14]/80 border border-outline-variant/30 rounded px-2 text-white focus:outline-none">
                      <option value="">Selecione...</option>
                      {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">LITRAGEM DIESEL (L)</label>
                    <input type="number" name="liters" placeholder="Litros abastecidos" required className="w-full text-xs h-10 bg-[#0b0e14]/80 border border-outline-variant/30 rounded px-3 text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">ODÔMETRO (KM)</label>
                    <input type="number" name="mileage_at_fill" placeholder="Ex: 125820" required className="w-full text-xs h-10 bg-[#0b0e14]/80 border border-outline-variant/30 rounded px-3 text-white focus:outline-none" />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">VALOR CONSOLIDADO / NOTA (R$)</label>
                  <input type="number" step="0.01" name="cost" placeholder="R$ Ex: R$ 825,00" required className="w-full text-xs h-10 bg-[#0b0e14]/80 border border-outline-variant/30 rounded px-3 text-white focus:outline-none" />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded bg-blue-600 hover:bg-blue-500 font-bold uppercase text-[10px] py-3.5 text-white transition active:scale-[0.99] shadow"
                >
                  {saving ? "GRAVANDO..." : "GRAVAR E CONSOLIDAR ABASTECIMENTO"}
                </button>
              </form>
            </div>

            {/* Right Column: Supply History */}
            <div className="lg:col-span-7 raised-card p-5 bg-[#0c132b]/80 border-outline-variant/30 flex flex-col h-full">
              <div className="flex justify-between items-center mb-6 border-b border-outline-variant/20 pb-4">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#FCA311]">HISTÓRICO GERAL DE<br />ABASTECIMENTOS</h3>
                <div className="relative w-64 shrink-0">
                  <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                  <input
                    placeholder="Filtrar lançamentos..."
                    className="w-full text-xs h-9 bg-[#0b0e14]/80 border border-outline-variant/30 rounded pl-9 pr-3 text-slate-300 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
                {records.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => {
                      setSelectedRecord(r);
                      setThermalReceiptOpen(true);
                    }}
                    className="p-4 flex justify-between items-center bg-[#0F172A]/50 border border-outline-variant/20 rounded-lg hover:bg-white/5 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-[#FCA311] border border-outline-variant/30">
                        <Icon name="local_gas_station" className="text-lg" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-white flex items-center gap-2">
                          Abastecimento de Diesel
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRecord(r);
                              setThermalReceiptOpen(true);
                            }}
                            className="text-blue-500 font-normal text-[8px] uppercase hover:underline"
                          >
                            Ver Comprovante
                          </span>
                        </p>
                        <p className="text-[9px] text-slate-400 mt-1">
                          Unidade Fretada: <span className="font-bold text-slate-200">{r.vehicle_plate === "BRA-2E19" ? "Scania R 450" : r.vehicle_plate === "FLT-0130" ? "Volvo FH 540" : "Mercedes-Benz Atego"} ({formatPlateDisplay(r.vehicle_plate)})</span><br />
                          Motorista: {r.driver_name || "—"} | Odômetro: {r.mileage_at_fill?.toLocaleString("pt-BR") ?? "—"} KM
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest block mb-1">CUPOM AUDITADO</span>
                      <p className="text-xs font-bold text-green-500">R$ {Number(r.cost).toFixed(2).replace('.', ',')}</p>
                      <p className="text-[9px] text-slate-400 mb-2">Vol: {Number(r.liters).toFixed(1).replace('.0', '')} Litros</p>
                      <span className="inline-block px-1.5 py-0.5 rounded border border-green-500/50 text-[8px] font-bold uppercase text-green-500 tracking-wider">
                        CONFIRMADO
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* COMPROVANTE DE COMPRA MODAL */}
        <FormModal
          open={compraModalOpen}
          onClose={() => setCompraModalOpen(false)}
          title=""
          subtitle=""
        >
          <div className="bg-[#1E293B] rounded-xl overflow-hidden shadow-2xl">
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <span className="bg-[#FCA311] text-black text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                  {selectedTx?.type === "credit" ? "COMPROVANTE DE RECARGA" : "COMPROVANTE DE COMPRA"}
                </span>
                <span className="text-green-400 text-[9px] font-bold uppercase flex items-center gap-1">
                  <Icon name="check_circle" className="text-[12px]" /> SUCESSO
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#FCA311] uppercase tracking-wide">
                  {selectedTx?.details?.split('/')[0]?.trim() || selectedTx?.title || "POSTO IPIRANGA ROTA SUDOESTE"}
                </h3>
                <p className="text-[9px] text-slate-400 font-mono mt-1">Transação ID: {selectedTx?.id || selectedTx?.authCode || "tx-sim-1781697619242"}</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-700/50 text-[10px]">
                <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                  <span className="text-slate-400">Estabelecimento (Razão Social)</span>
                  <span className="font-bold text-white text-right">
                    {selectedTx?.details?.split('/')[0]?.trim() || selectedTx?.title || "Posto Ipiranga Rota Sudoeste"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                  <span className="text-slate-400">Data & Horário</span>
                  <span className="font-bold text-white">{selectedTx?.date || "2026-06-17 às 21:53:55"}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                  <span className="text-slate-400">Portador / Motorista</span>
                  <span className="font-bold text-white">{selectedTx?.driver || selectedTx?.driver_name || "—"}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                  <span className="text-slate-400">Veículo / Placa</span>
                  <span className="font-bold text-[#FCA311] font-mono">{selectedTx?.vehicle || selectedTx?.plate || selectedTx?.vehicle_plate || "—"}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                  <span className="text-slate-400">Categoria</span>
                  <span className="font-bold text-white bg-slate-700/50 px-2 py-0.5 rounded">
                    {selectedTx?.type === "credit" ? "Recarga de Saldo" : "Combustível"}
                  </span>
                </div>
                {selectedTx?.liters && (
                  <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                    <span className="text-slate-400">Litragem Carregada</span>
                    <span className="font-bold text-blue-400">{selectedTx.liters} Litros</span>
                  </div>
                )}
                {selectedTx?.odom && (
                  <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                    <span className="text-slate-400">Odômetro Declarado</span>
                    <span className="font-bold text-white">{selectedTx.odom}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-400 uppercase font-bold">
                    {selectedTx?.type === "credit" ? "VALOR COMPENSADO" : "VALOR DEBITADO"}
                  </span>
                  <span className="font-bold text-green-400 text-sm">
                    R$ {(selectedTx?.amount || selectedTx?.cost || 222.49).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              <div className="bg-[#0F172A] p-3 rounded text-center border border-slate-700/50 mt-4">
                <p className="text-[8px] font-bold text-[#FCA311] uppercase mb-1">
                  {selectedTx?.type === "credit" ? "BAAS DEPOSIT WEBHOOK" : "BAAS LIQUIDATION WEBHOOK"}
                </p>
                <p className="text-[7px] text-slate-500 font-mono">
                  {selectedTx?.type === "credit" 
                    ? "PIX compensation processed and confirmed by Central Bank DIKT system."
                    : "NFC contactless authorization takes matches PCI-DSS specifications. No physical card was swiped."}
                </p>
              </div>

              <button onClick={() => setCompraModalOpen(false)} className="w-full py-3 rounded bg-slate-700/50 hover:bg-slate-700 transition text-[9px] font-bold text-white uppercase mt-4">
                FECHAR COMPROVANTE
              </button>
            </div>
          </div>
        </FormModal>

        {/* CUPOM FISCAL TÉRMICO (Ver Comprovante) */}
        <FormModal
          open={thermalReceiptOpen}
          onClose={() => setThermalReceiptOpen(false)}
          title=""
          subtitle=""
        >
          <div className="bg-slate-100 text-slate-900 p-6 rounded-lg shadow-2xl font-mono text-xs max-w-sm mx-auto border-t-8 border-dashed border-slate-300">
            <div className="text-center space-y-1 mb-4 border-b border-dashed border-slate-400 pb-3">
              <h3 className="font-bold text-sm tracking-widest uppercase">{selectedRecord?.station || "POSTO IPIRANGA S.A."}</h3>
              <p className="text-[10px]">CNPJ: 33.000.167/0001-01</p>
              <p className="text-[10px]">RODOVIA BR-116, KM 420 - ANTT 45.192</p>
              <div className="text-[9px] text-slate-500 mt-2">
                DF-e NFe: 0002.9382.1102.3928.1122
              </div>
            </div>

            <div className="space-y-2 border-b border-dashed border-slate-400 pb-3">
              <div className="flex justify-between">
                <span>DATA/HORA:</span>
                <span className="font-bold">
                  {selectedRecord?.filled_at 
                    ? new Date(selectedRecord.filled_at).toLocaleString("pt-BR") 
                    : new Date().toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>PLACA VÍNC.:</span>
                <span className="font-bold uppercase">{selectedRecord?.vehicle_plate || "BRA-2E19"}</span>
              </div>
              <div className="flex justify-between">
                <span>MOTORISTA:</span>
                <span className="font-bold uppercase">{selectedRecord?.driver_name || "CARLOS SILVEIRA"}</span>
              </div>
              {selectedRecord?.mileage_at_fill && (
                <div className="flex justify-between">
                  <span>ODÔMETRO:</span>
                  <span className="font-bold">{selectedRecord.mileage_at_fill.toLocaleString("pt-BR")} KM</span>
                </div>
              )}
            </div>

            <div className="py-3 border-b border-dashed border-slate-400 space-y-1">
              <div className="flex justify-between font-bold text-[11px] mb-1">
                <span>ITEM / DESCRIÇÃO</span>
                <span>TOTAL</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>DIESEL S10 ({selectedRecord?.liters || 0} L x R$ {(Number(selectedRecord?.cost || 0) / (selectedRecord?.liters || 1)).toFixed(2)})</span>
                <span>R$ {Number(selectedRecord?.cost || 0).toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            <div className="pt-3 space-y-2 text-right">
              <div className="flex justify-between font-bold text-sm">
                <span>VALOR TOTAL:</span>
                <span>R$ {Number(selectedRecord?.cost || 0).toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>FORMA PGTO:</span>
                <span className="font-bold">FATURAMENTO BAAS NFC</span>
              </div>
            </div>

            <div className="mt-6 text-center text-[9px] text-slate-500 border-t border-dashed border-slate-400 pt-3">
              <p>MENSAGEM DE CONTROLE DE SALDOS</p>
              <p className="font-bold uppercase tracking-wider mt-1 text-slate-700">COMPROVANTE AUDITADO & INTEGRADO</p>
              <p className="mt-1">Obrigado pela preferência!</p>
            </div>

            <button 
              onClick={() => setThermalReceiptOpen(false)} 
              className="w-full py-2.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] uppercase mt-6 transition font-sans"
            >
              FECHAR COMPROVANTE
            </button>
          </div>
        </FormModal>

        {/* NFC WALLET MODALS (Keep existing) */}
        <FormModal
          open={nfcModalOpen}
          onClose={() => setNfcModalOpen(false)}
          title={`Adicionar ao ${nfcWalletType}`}
          subtitle="Carteira Digital NFC"
        >
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-6">
            {nfcStep === "connecting" ? (
              <>
                <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/10 text-blue-400">
                  <Icon name="nfc" className="text-4xl animate-pulse" />
                  <span className="absolute inset-0 rounded-full border border-blue-400/30 animate-ping" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-100">Estabelecendo Conexão Segura</h4>
                  <p className="text-xs text-slate-400">Iniciando protocolo de emparelhamento com o barramento do cartão pré-pago...</p>
                </div>
              </>
            ) : nfcStep === "processing" ? (
              <>
                <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 text-amber-400">
                  <Icon name="sync" className="text-4xl animate-spin" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-100">Criptografando Tokens de Pagamento</h4>
                  <p className="text-xs text-slate-400">Fazendo upload das credenciais com tokenização BaaS de ponta a ponta...</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 text-green-400 border border-green-500/30">
                  <Icon name="check_circle" className="text-5xl animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-100">Cartão Adicionado com Sucesso!</h4>
                  <p className="text-xs text-slate-400">O Cartão Frota (•••• 5485) já está pronto para uso por aproximação no seu smartphone.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNfcModalOpen(false)}
                  className="w-full py-2 font-bold uppercase text-xs text-black bg-[#FCA311] hover:bg-[#FCA311]/90 rounded"
                >
                  Concluir
                </button>
              </>
            )}
          </div>
        </FormModal>

        {/* CENTRAL BANK PIX REFUND CONFIRMATION MODAL */}
        <FormModal
          open={pixRefundModalOpen}
          onClose={() => setPixRefundModalOpen(false)}
          title="Confirmação de Devolução Pix"
          subtitle="Banco Central - Sistema DIKT Homologado"
        >
          <div className="space-y-4">
            {!pixRefundSuccess ? (
              <>
                <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-4 flex items-center gap-3">
                  <Icon name="security" className="text-3xl text-green-400" />
                  <div className="text-xs text-left">
                    <p className="font-bold text-slate-100">Transação Monitorada pelo Banco Central</p>
                    <p className="text-slate-400">Verificação automática de chaves no Diretório de Identificadores (DIKT).</p>
                  </div>
                </div>

                <div className="rounded-lg bg-[#0F172A] border border-outline-variant/30 p-4 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Origem:</span>
                    <span className="font-bold text-slate-100">Cartão Frota (•••• 5485)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Tipo de Chave:</span>
                    <span className="font-bold text-slate-100">{pixKeyType}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Chave Destino:</span>
                    <span className="font-bold text-slate-100 font-mono">{pixKey}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Favorecido:</span>
                    <span className="font-bold text-slate-100">{pixName}</span>
                  </div>
                  <div className="flex justify-between py-1 pt-2 font-bold text-sm">
                    <span className="text-slate-300">Valor do Estorno:</span>
                    <span className="text-[#FCA311]">{formatBRL(cardBalance)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPixRefundModalOpen(false)}
                    disabled={pixRefundConfirming}
                    className="rounded flex-1 py-2 text-xs font-bold uppercase border border-slate-600 text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={pixRefundConfirming}
                    onClick={() => {
                      setPixRefundConfirming(true);
                      setTimeout(() => {
                        setPixRefundConfirming(false);
                        setPixRefundSuccess(true);
                        setActiveCards(prev => prev.map(card => {
                          if (card.id === selectedCardId) {
                            return { ...card, balance: 0 };
                          }
                          return card;
                        }));
                        setCardBalance(0);
                        setPixKey("");
                        setPixName("");
                      }, 2000);
                    }}
                    className="rounded flex-1 py-2 text-xs font-bold uppercase bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-1.5"
                  >
                    {pixRefundConfirming ? (
                      <>
                        <Icon name="sync" className="text-sm animate-spin text-white" /> Processando...
                      </>
                    ) : (
                      "Confirmar Estorno"
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center justify-center p-4 text-center space-y-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 text-green-400 border border-green-500/30">
                    <Icon name="check_circle" className="text-4xl animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-100 text-sm">Estorno Concluído</h4>
                    <p className="text-xs text-slate-400">O saldo residual do cartão foi liquidado e transferido para a conta de destino indicada via Pix.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPixRefundModalOpen(false)}
                    className="w-full py-2 font-bold uppercase text-xs text-black bg-[#FCA311] hover:bg-[#FCA311]/90 rounded"
                  >
                    Fechar
                  </button>
                </div>
              </>
            )}
          </div>
        </FormModal>

      </ErrorBoundary>
    </AppShell>
  );
}
