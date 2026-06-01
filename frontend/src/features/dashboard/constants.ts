import type { DashboardStats } from "@/types";

export const STATS_MOCK: DashboardStats = {
  totalSpend: 128_450.75,
  totalLiters: 24_680,
  avgKmPerLiter: 9.4,
  activeAlerts: 7,
  savingsGenerated: 18_320,
};

export const CONSUMO_MENSAL = [
  { mes: "Jan", litros: 2100 },
  { mes: "Fev", litros: 1980 },
  { mes: "Mar", litros: 2340 },
  { mes: "Abr", litros: 2210 },
  { mes: "Mai", litros: 2450 },
  { mes: "Jun", litros: 2380 },
];

export const EFICIENCIA_FROTA = [
  { semana: "S1", kmL: 8.9 },
  { semana: "S2", kmL: 9.1 },
  { semana: "S3", kmL: 9.4 },
  { semana: "S4", kmL: 9.2 },
  { semana: "S5", kmL: 9.6 },
];

export const RANKING_MOTORISTAS = [
  { motorista: "João Silva", score: 94 },
  { motorista: "Ana Costa", score: 91 },
  { motorista: "Carlos Lima", score: 87 },
  { motorista: "Maria Souza", score: 85 },
];

export const TABELA_VEICULOS = [
  { placa: "DEF-5678", motorista: "João Silva", consumo: "38% acima", status: "alerta", kmL: "6.2" },
  { placa: "ABC-1234", motorista: "Ana Costa", consumo: "Normal", status: "ok", kmL: "10.1" },
  { placa: "GHI-9012", motorista: "Carlos Lima", consumo: "12% acima", status: "atenção", kmL: "8.4" },
  { placa: "JKL-3456", motorista: "Maria Souza", consumo: "Normal", status: "ok", kmL: "9.8" },
];

export const COLUNAS_EXPORT = [
  { header: "Placa", key: "placa" },
  { header: "Motorista", key: "motorista" },
  { header: "Consumo", key: "consumo" },
  { header: "Status", key: "status" },
  { header: "KM/L", key: "kmL" },
];
