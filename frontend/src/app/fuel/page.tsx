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

  // Card & NFC States
  const [cardBalance, setCardBalance] = useState(1000);
  const [nfcModalOpen, setNfcModalOpen] = useState(false);
  const [nfcWalletType, setNfcWalletType] = useState<"Google Wallet" | "Apple Pay" | null>(null);
  const [nfcStep, setNfcStep] = useState<"connecting" | "processing" | "success">("connecting");
  const [showEmitForm, setShowEmitForm] = useState(false);

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
  };

  useEffect(() => {
    load();
    vehiclesApi.list().then((res) => setVehicles(Array.isArray(res.data) ? res.data : [])).catch(() => {});
    driversApi.list().then((res) => setDrivers(Array.isArray(res.data) ? res.data : [])).catch(() => {});
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
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold uppercase transition ${
                activeTab === "dashboard"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon name="dashboard" className="text-sm" />
              Dashboard de Abastecimento
            </button>
            <button
              onClick={() => setActiveTab("cards")}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold uppercase transition ${
                activeTab === "cards"
                  ? "bg-[#1E293B] text-[#FCA311] border border-outline-variant/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon name="credit_card" className="text-sm" />
              Cartões NFC & Saldos
            </button>
            <button
              onClick={() => setActiveTab("ocr")}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold uppercase transition ${
                activeTab === "ocr"
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
              <p className="text-xl font-bold text-[#FCA311] font-mono">R$ 5.256,16</p>
              <p className="text-[9px] text-slate-400 mt-1 flex justify-center items-center gap-1"><Icon name="trending_up" className="text-[12px] text-[#FCA311]"/> Desta frota ativa & cartões NFC</p>
            </div>
            <div className="raised-card p-4 bg-[#0c132b]/80 border-outline-variant/30 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">VOLUME TOTAL FATURADO</p>
              <p className="text-xl font-bold text-[#FCA311] font-mono">924,6 L</p>
              <p className="text-[9px] text-blue-400 mt-1 font-bold flex justify-center items-center gap-1"><Icon name="link" className="text-[12px]" /> Média paga: R$ 5,68/L</p>
            </div>
            <div className="raised-card p-4 bg-[#0c132b]/80 border-outline-variant/30 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">SALDO ATIVO EM CARTÕES</p>
              <p className="text-xl font-bold text-[#FCA311] font-mono">R$ 3.076,92</p>
              <p className="text-[9px] text-slate-400 mt-1 flex justify-center items-center gap-1"><Icon name="account_balance_wallet" className="text-[12px] text-green-400"/> Garantia pré-paga NFC ativa</p>
            </div>
            <div className="raised-card p-4 bg-[#0c132b]/80 border-outline-variant/30 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">LANÇAMENTOS DE ABASTECIMENTO</p>
              <p className="text-xl font-bold text-[#FCA311] font-mono flex justify-center items-center gap-2">8 Eventos <Icon name="trending_up" className="text-purple-400 text-[18px]" /></p>
              <p className="text-[9px] text-slate-400 mt-1"><span className="text-blue-400">4 NFC</span> | <span className="text-purple-400">4 Cupons</span></p>
            </div>
          </div>

          {/* Gráficos */}
          <div className="raised-card p-5 bg-[#0c132b]/80 border-outline-variant/30">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xs font-bold uppercase text-primary flex items-center gap-1.5"><Icon name="bar_chart"/> GRÁFICOS COMPARATIVOS MENSAIS</h3>
                <p className="text-[10px] text-slate-400 mt-1">Visualize a série financeira e volumétrica do veículo selecionado em 2026.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase">SELECIONE O VEÍCULO:</span>
                <select className="bg-[#0b0e14]/80 border border-outline-variant/30 rounded text-[10px] p-1.5 text-[#FCA311] font-bold w-48">
                  <option>Volvo FH 540 (FLT-0130)</option>
                  <option>Scania R 450 (BRA-2E19)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 h-64">
              {/* Bar Chart */}
              <div className="border border-outline-variant/20 rounded-lg bg-[#0F172A]/40 p-4 flex flex-col relative">
                <h4 className="text-[9px] font-bold text-slate-300 uppercase flex items-center gap-1 mb-4"><Icon name="trending_up" className="text-[12px] text-[#FCA311]" /> GASTO FATURADO MENSAL (R$)</h4>
                <div className="flex-1 flex items-end justify-between relative pl-8 pb-4">
                  {/* Y Axis */}
                  <div className="absolute left-0 top-0 bottom-4 flex flex-col justify-between text-[8px] text-slate-500 font-mono">
                    <span>2800</span>
                    <span>2100</span>
                    <span>1400</span>
                    <span>700</span>
                    <span>0</span>
                  </div>
                  {/* Grid lines */}
                  <div className="absolute left-8 right-0 top-0 bottom-4 flex flex-col justify-between">
                    {[0,1,2,3,4].map(i => <div key={i} className="border-b border-white/5 w-full h-0"></div>)}
                  </div>
                  {/* Bars */}
                  {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'].map((m, i) => (
                    <div key={m} className="flex flex-col items-center w-full z-10 relative h-full justify-end">
                      {m === 'Jun' && <div className="w-1/2 bg-blue-600 h-[85%] rounded-t-sm shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>}
                      <span className="text-[8px] text-slate-500 mt-2 absolute -bottom-4">{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Line Chart */}
              <div className="border border-outline-variant/20 rounded-lg bg-[#0F172A]/40 p-4 flex flex-col relative">
                <h4 className="text-[9px] font-bold text-slate-300 uppercase flex items-center gap-1 mb-4"><Icon name="opacity" className="text-[12px] text-[#FCA311]" /> VOLUME MENSAL CONSUMIDO (LITROS)</h4>
                <div className="flex-1 flex items-end justify-between relative pl-8 pb-4">
                  <div className="absolute left-0 top-0 bottom-4 flex flex-col justify-between text-[8px] text-slate-500 font-mono">
                    <span>600</span>
                    <span>450</span>
                    <span>300</span>
                    <span>150</span>
                    <span>0</span>
                  </div>
                  <div className="absolute left-8 right-0 top-0 bottom-4 flex flex-col justify-between">
                    {[0,1,2,3,4].map(i => <div key={i} className="border-b border-white/5 w-full h-0"></div>)}
                  </div>
                  {/* SVG Line */}
                  <svg className="absolute left-8 right-0 top-0 bottom-4 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path d="M 0 100 L 8.3 100 L 16.6 100 L 25 100 L 33.3 100 L 41.6 100 L 50 15 L 58.3 100 L 66.6 100 L 75 100 L 83.3 100 L 91.6 100 L 100 100" fill="none" stroke="#FCA311" strokeWidth="1.5" />
                    <circle cx="50" cy="15" r="2" fill="#0F172A" stroke="#FCA311" strokeWidth="1" />
                    <circle cx="41.6" cy="100" r="1.5" fill="#FCA311" />
                    <circle cx="58.3" cy="100" r="1.5" fill="#FCA311" />
                  </svg>
                  {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'].map((m, i) => (
                    <div key={m} className="flex flex-col items-center w-full z-10 relative h-full justify-end">
                      <span className="text-[8px] text-slate-500 mt-2 absolute -bottom-4">{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Relatório Consolidado */}
          <div className="raised-card p-5 bg-[#0c132b]/80 border-outline-variant/30">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 mb-1"><Icon name="local_shipping"/> RELATÓRIO CONSOLIDADO DE GASTOS POR VEÍCULO</h3>
            <p className="text-[9px] text-slate-400 mb-4">Auditoria financeira de consumo com o rateio absoluto de custos por automóvel.</p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-[9px] font-bold text-slate-500 uppercase">
                    <th className="py-3 px-2 font-bold">VEÍCULO</th>
                    <th className="py-3 px-2 font-bold text-center">PLACA</th>
                    <th className="py-3 px-2 font-bold text-center">LANÇAMENTOS</th>
                    <th className="py-3 px-2 font-bold w-48">LITROS COMPRADOS</th>
                    <th className="py-3 px-2 font-bold text-center">PREÇO MÉDIO / L</th>
                    <th className="py-3 px-2 font-bold text-right">GASTO ACUMULADO (R$)</th>
                    <th className="py-3 px-2 font-bold text-center">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-[10px] text-slate-300">
                  <tr className="hover:bg-white/5 transition">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 flex items-center justify-center bg-[#0F172A] border border-outline-variant/30 rounded"><Icon name="local_shipping" className="text-slate-400 text-xs"/></div>
                        <div>
                          <p className="font-bold text-slate-100 text-[11px]">Scania R 450</p>
                          <p className="text-[8px] text-slate-500">Sugerido: 2.5 Km/L</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-[#FCA311]">BRA-2E19</td>
                    <td className="py-3 px-2 text-center text-slate-400">6 abastecimentos</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-outline-variant/10">
                          <div className="h-full bg-[#FCA311] w-[45%]"></div>
                        </div>
                        <span className="font-bold text-[9px]">446,6 L</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-blue-400">R$ 5,61</td>
                    <td className="py-3 px-2 text-right">
                      <p className="font-bold text-slate-100 text-[11px]">R$ 2.506,16</p>
                      <p className="text-[8px] text-slate-500">48% da frota</p>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button className="border border-blue-600/50 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white px-2 py-1 rounded text-[8px] font-bold transition uppercase">FILTRAR GRÁFICO</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/5 transition">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 flex items-center justify-center bg-[#0F172A] border border-outline-variant/30 rounded"><Icon name="local_shipping" className="text-slate-400 text-xs"/></div>
                        <div>
                          <p className="font-bold text-slate-100 text-[11px]">Volvo FH 540</p>
                          <p className="text-[8px] text-slate-500">Sugerido: 2.5 Km/L</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-[#FCA311]">FLT-0130</td>
                    <td className="py-3 px-2 text-center text-slate-400">2 abastecimentos</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-outline-variant/10">
                          <div className="h-full bg-[#FCA311] w-[52%]"></div>
                        </div>
                        <span className="font-bold text-[9px]">478 L</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-blue-400">R$ 5,75</td>
                    <td className="py-3 px-2 text-right">
                      <p className="font-bold text-slate-100 text-[11px]">R$ 2.750,00</p>
                      <p className="text-[8px] text-slate-500">52% da frota</p>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button className="border border-blue-600/50 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white px-2 py-1 rounded text-[8px] font-bold transition uppercase">FILTRAR GRÁFICO</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/5 transition">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 flex items-center justify-center bg-[#0F172A] border border-outline-variant/30 rounded"><Icon name="local_shipping" className="text-slate-400 text-xs"/></div>
                        <div>
                          <p className="font-bold text-slate-100 text-[11px]">Mercedes-Benz Atego 2426</p>
                          <p className="text-[8px] text-slate-500">Sugerido: 3.5 Km/L</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-[#FCA311]">MEC-4D21</td>
                    <td className="py-3 px-2 text-center text-slate-400">0 abastecimentos</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-outline-variant/10">
                          <div className="h-full bg-[#FCA311] w-[0%]"></div>
                        </div>
                        <span className="font-bold text-[9px]">0 L</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-blue-400">R$ 0,00</td>
                    <td className="py-3 px-2 text-right">
                      <p className="font-bold text-slate-100 text-[11px]">R$ 0,00</p>
                      <p className="text-[8px] text-slate-500">0% da frota</p>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button className="border border-blue-600/50 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white px-2 py-1 rounded text-[8px] font-bold transition uppercase">FILTRAR GRÁFICO</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Histórico Consolidado de Transações */}
          <div className="raised-card p-5 bg-[#0c132b]/80 border-outline-variant/30">
             <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 mb-1"><Icon name="history"/> HISTÓRICO CONSOLIDADO DE TRANSAÇÕES</h3>
             <p className="text-[9px] text-slate-400 mb-4">Lançamentos em tempo de execução vindos de cupons OCR e cartões de abastecimento NFC.</p>
             <div className="space-y-2">
               {historicoTransacoes.map((t) => (
                 <div key={t.id} onClick={() => setCompraModalOpen(true)} className="flex justify-between items-center bg-[#0F172A]/80 border border-outline-variant/30 rounded-lg p-3 hover:bg-white/5 cursor-pointer transition">
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
                  <Icon name={showEmitForm ? "close" : "add"} className="text-[14px]"/> {showEmitForm ? "FECHAR" : "EMITIR"}
                </button>
              </div>
              <div className="space-y-3">
                <div className="rounded-lg border border-outline-variant/30 bg-[#0F172A]/80 p-3 flex justify-between items-start">
                  <div>
                    <span className="inline-block rounded bg-amber-500/15 border border-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-[#FCA311] font-mono">BRA-2E19</span>
                    <p className="text-[10px] text-slate-300 mt-1.5">Scania R 450</p>
                    <p className="text-[11px] font-bold text-[#FCA311] mt-0.5">Saldo: R$ 1.000,00</p>
                  </div>
                  <div className="text-right">
                    <span className="chip-active text-[9px]">ATIVO</span>
                    <p className="text-[9px] text-slate-400 mt-2 font-mono">Jeovana Lopesvalente</p>
                  </div>
                </div>

                <div className="rounded-lg border border-outline-variant/30 bg-[#0F172A]/80 p-3 flex justify-between items-start">
                  <div>
                    <span className="inline-block rounded bg-amber-500/15 border border-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-[#FCA311] font-mono">BRA-2E19</span>
                    <p className="text-[10px] text-slate-300 mt-1.5">Scania R 450</p>
                    <p className="text-[11px] font-bold text-[#FCA311] mt-0.5">Saldo: R$ 2.876,92</p>
                  </div>
                  <div className="text-right">
                    <span className="chip-active text-[9px]">ATIVO</span>
                    <p className="text-[9px] text-slate-400 mt-2 font-mono">Bianca Silveira</p>
                  </div>
                </div>

                <div className="rounded-lg border border-outline-variant/30 bg-[#0F172A]/80 p-3 flex justify-between items-start">
                  <div>
                    <span className="inline-block rounded bg-amber-500/15 border border-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-[#FCA311] font-mono">MEC-4D21</span>
                    <p className="text-[10px] text-slate-300 mt-1.5">Mercedes-Benz Atego</p>
                    <p className="text-[11px] font-bold text-[#FCA311] mt-0.5">Saldo: R$ 0,00</p>
                  </div>
                  <div className="text-right">
                    <span className="chip-active text-[9px]">ATIVO</span>
                    <p className="text-[9px] text-slate-400 mt-2 font-mono">Carlos Silveira</p>
                  </div>
                </div>
              </div>
            </div>

            {showEmitForm && (
              <div className="raised-card p-5 bg-[#0c132b]/80 border-outline-variant/30 flex flex-col transition-all duration-300">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">EMITIR NOVO CARTÃO PRÉ-PAGO</h3>
                <p className="text-[10px] text-slate-400 mb-4">Gere um cartão físico/digital associado por segurança a uma placa da frota.</p>
                
                <form className="space-y-4">
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">VINCULAR A QUAL VEÍCULO</label>
                      <select className="w-full text-xs h-9 bg-[#0b0e14]/80 border border-outline-variant/30 rounded px-2 text-white">
                        <option>Selecione um veículo...</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">CARGA INICIAL DE SALDO (R$)</label>
                      <input type="text" defaultValue="500" readOnly className="w-full text-xs h-9 bg-[#0b0e14]/80 border border-outline-variant/30 rounded px-2 text-white focus:outline-none" />
                    </div>
                    <div className="text-[9px] text-slate-400 mt-2">
                      <span className="font-bold text-[#FCA311]">Detalhes do Portador:</span><br/>
                      Criado pelo Usuário: <span className="text-slate-200">Administrador Fleet AI (Administrador)</span><br/>
                      Criptografia PCI compliant. O cartão de faturamento BaaS será gerado sob demanda.
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <button type="button" onClick={() => setShowEmitForm(false)} className="w-full rounded border border-outline-variant/30 bg-[#0F172A] py-2.5 text-[10px] font-bold text-white uppercase hover:bg-white/5 transition">
                        CANCELAR
                      </button>
                      <button type="button" className="w-full rounded bg-[#FCA311] py-2.5 text-[10px] font-bold text-black uppercase hover:bg-[#FCA311]/90 transition">
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
                  <span className="font-bold text-slate-200">jeovanalopesvalente</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Placa do Veículo</span>
                  <span className="font-bold text-[#FCA311] font-mono">BRA-2E19</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Modelo</span>
                  <span className="font-bold text-slate-200">Scania R 450</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Terminal Comercial</span>
                  <span className="font-bold text-[#FCA311]">Multipostos Credenciados (BaaS)</span>
                </div>
              </div>

              <div className="flex gap-2 items-start text-[9px] text-blue-400 mt-4 bg-blue-400/5 border border-blue-400/10 rounded-lg p-3">
                <Icon name="location_on" className="text-sm shrink-0" />
                <p>Maquininhas capturadas via geolocalização IP no raio do veículo BRA-2E19.</p>
              </div>
            </div>

          </div>

          {/* Column 2: Fleet Card details & Digital wallet & Extrato Detalhado */}
          <div className="flex flex-col gap-6">
            <div className="raised-card p-5 bg-[#0c132b]/80 border-outline-variant/30 flex flex-col">
              <div className="flex justify-between items-center mb-4 border-b border-outline-variant/20 pb-3">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5"><Icon name="credit_card" className="text-sm"/> CARTÃO FROTA</h3>
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
                  <span>4532 8598 9742 5485</span>
                  <Icon name="visibility_off" className="text-slate-400 text-sm" />
                </p>
                <div className="mt-6 flex justify-between items-end text-[9px] font-mono text-slate-300">
                  <div>
                    <span className="block text-[7px] text-slate-400 uppercase">VEÍCULO / PLACA</span>
                    <span className="font-bold text-slate-100 text-[10px]">BRA-2E19 (SCANIA)</span>
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
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5"><Icon name="receipt" className="text-sm"/> EXTRATO DETALHADO DO CARTÃO</h3>
                  <p className="text-[8px] text-slate-400 font-mono mt-0.5">Chave do Extrato: 087.251.382-83</p>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1 bg-blue-600 px-3 py-1.5 rounded-lg text-[9px] font-bold text-white uppercase hover:bg-blue-500 transition shadow"
                >
                  <Icon name="add" className="text-[14px]" /> INJETAR CARGA (PIX COPIA COLA)
                </button>
              </div>

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
                       <button className="rounded bg-transparent border border-outline-variant/30 px-3 py-1.5 text-[9px] font-bold text-slate-200 uppercase hover:bg-white/5 transition whitespace-nowrap shrink-0">COPIAR CHAVE</button>
                    </div>
                    <div className="flex gap-2 mt-3 justify-end">
                       <button className="rounded bg-transparent border border-outline-variant/30 px-4 py-1.5 text-[9px] font-bold text-slate-300 uppercase hover:bg-white/5 transition">CANCELAR</button>
                       <button className="rounded bg-blue-600 px-4 py-1.5 text-[9px] font-bold text-white uppercase hover:bg-blue-500 transition shadow">SIMULAR COMPENSAÇÃO BAAS (WEBHOOK)</button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-outline-variant/20">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center bg-[#0F172A]/60 border border-blue-500/20 rounded-lg p-3">
                     <div className="flex items-center gap-3">
                       <div className="w-6 h-6 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                         <Icon name="call_received" className="text-[12px]" />
                       </div>
                       <div>
                         <p className="text-[10px] font-bold text-[#FCA311]">{tx.title} <span className="text-[8px] text-slate-400 uppercase font-mono ml-2 border-b border-slate-400 cursor-pointer hover:text-white">Ver Detalhes</span></p>
                         <p className="text-[8px] text-slate-400 font-mono mt-0.5">Status: <span className="text-white font-bold">{tx.status}</span> | Unidade Comerc.: BaaS Webhook Compensado</p>
                         <p className="text-[8px] text-slate-500 font-mono">ID Extrato: tx-dep-{Math.floor(Math.random() * 1000000000)} | Horário: {tx.date}</p>
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
                  <span className="font-bold text-slate-200">R$ 1.000,00</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-outline-variant/10">
                  <span className="text-slate-400">Total Utilizado:</span>
                  <span className="font-bold text-red-400">R$ 0,00</span>
                </div>
                <div className="rounded-lg bg-[#0F172A] p-3 border border-outline-variant/30 mt-3 text-center">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">SALDO DISPONÍVEL NO CARTÃO</span>
                  <span className="text-2xl font-mono font-bold text-[#FCA311]">R$ 1.000,00</span>
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
                  SOLICITAR REEMBOLSO DE R$ 1.000,00
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
                  <Icon name="photo_camera" className="text-[12px]"/> {receiptFile ? `CUPOM SELECIONADO: ${receiptFile.name}` : "ESCANEAR CUPOM (TIRAR FOTO OU ARQUIVOS)"}
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
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#FCA311]">HISTÓRICO GERAL DE<br/>ABASTECIMENTOS</h3>
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
                  onClick={() => setSelectedRecord(r)}
                  className="p-4 flex justify-between items-center bg-[#0F172A]/50 border border-outline-variant/20 rounded-lg hover:bg-white/5 cursor-pointer transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-[#FCA311] border border-outline-variant/30">
                      <Icon name="local_gas_station" className="text-lg" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white flex items-center gap-2">
                        Abastecimento de Diesel 
                        <span className="text-blue-500 font-normal text-[8px] uppercase hover:underline">Ver Comprovante</span>
                      </p>
                      <p className="text-[9px] text-slate-400 mt-1">
                        Unidade Fretada: <span className="font-bold text-slate-200">{r.vehicle_plate === "BRA-2E19" ? "Scania R 450" : "Volvo FH 540"} ({formatPlateDisplay(r.vehicle_plate)})</span><br/>
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
              <span className="bg-[#FCA311] text-black text-[9px] font-bold px-2 py-0.5 rounded uppercase">COMPROVANTE DE COMPRA</span>
              <span className="text-green-400 text-[9px] font-bold uppercase flex items-center gap-1"><Icon name="check_circle" className="text-[12px]" /> SUCESSO</span>
            </div>
            
            <div>
              <h3 className="text-sm font-bold text-[#FCA311] uppercase tracking-wide">POSTO IPIRANGA ROTA SUDOESTE</h3>
              <p className="text-[9px] text-slate-400 font-mono mt-1">Transação ID: tx-sim-1781697619242</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-700/50 text-[10px]">
              <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                <span className="text-slate-400">Estabelecimento (Razão Social)</span>
                <span className="font-bold text-white text-right">Posto Ipiranga Rota<br/>Sudoeste</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                <span className="text-slate-400">Data & Horário</span>
                <span className="font-bold text-white">2026-06-17 às 21:53:55</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                <span className="text-slate-400">Localização do Terminal</span>
                <span className="font-bold text-white">Rodovia Castelo Branco BR-374</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                <span className="text-slate-400">Categoria</span>
                <span className="font-bold text-white bg-slate-700/50 px-2 py-0.5 rounded">Combustível</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                <span className="text-slate-400">Litragem Carregada</span>
                <span className="font-bold text-blue-400">40.5 Litros</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                <span className="text-slate-400">Odômetro Declarado</span>
                <span className="font-bold text-white">137833 KM</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-400 uppercase font-bold">VALOR DEBITADO</span>
                <span className="font-bold text-green-400 text-sm">R$ 222,49</span>
              </div>
            </div>

            <div className="bg-[#0F172A] p-3 rounded text-center border border-slate-700/50 mt-4">
              <p className="text-[8px] font-bold text-[#FCA311] uppercase mb-1">BAAS LIQUIDATION WEBHOOK</p>
              <p className="text-[7px] text-slate-500 font-mono">NFC contactless authorization takes matches PCI-DSS specifications. No physical card was swiped.</p>
            </div>

            <button onClick={() => setCompraModalOpen(false)} className="w-full py-3 rounded bg-slate-700/50 hover:bg-slate-700 transition text-[9px] font-bold text-white uppercase mt-4">
              FECHAR COMPROVANTE
            </button>
          </div>
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
