import type { DashboardKpis } from "@/types/fleet";

export const MOCK_KPIS: DashboardKpis = {
  totalSpend: 128_450.75,
  totalLiters: 24_680,
  avgKmPerLiter: 9.4,
  activeAlerts: 7,
  savingsGenerated: 18_320,
};

export const MONTHLY_CONSUMPTION = [
  { month: "Jan", litros: 2100, gasto: 11200 },
  { month: "Fev", litros: 1980, gasto: 10500 },
  { month: "Mar", litros: 2340, gasto: 12800 },
  { month: "Abr", litros: 2210, gasto: 11900 },
  { month: "Mai", litros: 2450, gasto: 13200 },
  { month: "Jun", litros: 2380, gasto: 12750 },
];

export const SPEND_BY_VEHICLE = [
  { vehicle: "ABC-1234", gasto: 4200 },
  { vehicle: "DEF-5678", gasto: 3800 },
  { vehicle: "GHI-9012", gasto: 5100 },
  { vehicle: "JKL-3456", gasto: 2900 },
];

export const FLEET_EFFICIENCY = [
  { week: "S1", kmL: 8.9 },
  { week: "S2", kmL: 9.1 },
  { week: "S3", kmL: 9.4 },
  { week: "S4", kmL: 9.2 },
  { week: "S5", kmL: 9.6 },
];

export const DRIVER_RANKING = [
  { motorista: "João Silva", score: 94 },
  { motorista: "Ana Costa", score: 91 },
  { motorista: "Carlos Lima", score: 87 },
  { motorista: "Maria Souza", score: 85 },
];

export const FLEET_TABLE_ROWS = [
  { placa: "DEF-5678", motorista: "João Silva", consumo: "38% acima", status: "alerta", kmL: "6.2" },
  { placa: "ABC-1234", motorista: "Ana Costa", consumo: "Normal", status: "ok", kmL: "10.1" },
  { placa: "GHI-9012", motorista: "Carlos Lima", consumo: "12% acima", status: "atenção", kmL: "8.4" },
  { placa: "JKL-3456", motorista: "Maria Souza", consumo: "Normal", status: "ok", kmL: "9.8" },
];
