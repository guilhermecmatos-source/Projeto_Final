export interface User {
  id: string;
  name: string;
  email: string;
  cpf?: string | null;
  rg?: string | null;
  role: "administrador" | "gestor" | "solicitante" | "motorista" | "admin" | "attendant" | "client";
  cargo?: string | null;
  unidade?: string | null;
  status: "ativo" | "inativo";
  avatar?: string | null;
  acceptedTerms?: boolean;
}

export interface Driver {
  id: string;
  name: string;
  cpf: string;
  rg: string;
  phone: string;
  cnh: string;
  cnhCategory: string;
  cnhExpiration: string;
  linkedVehicleId?: string | null;
  status: "disponivel" | "em_rota" | "inativo" | "ferias";
  expenses: number;
  occurrences: number;
}

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  status: "disponivel" | "em_uso" | "manutencao" | "inativo";
  km: number;
  avgConsumption: number;
  autonomy: number;
}

export interface Dispatch {
  id: string;
  vehicleId: string;
  driverId: string;
  origin: string;
  destination: string;
  distance: number;
  estimatedConsumption: number;
  status: "pendente" | "em_andamento" | "concluido" | "cancelado";
}

export interface Supply {
  id: string;
  vehicleId: string;
  driverId: string;
  date: string;
  value: number;
  liters: number;
  odometer: number;
  status: "aprovado" | "pendente" | "rejeitado" | "divergente";
}

export interface Inspection {
  id: string;
  vehicleId: string;
  driverId: string;
  date: string;
  items: {
    freios: "ok" | "alerta" | "critico";
    pneus: "ok" | "alerta" | "critico";
    luzes: "ok" | "alerta" | "critico";
    oleo: "ok" | "alerta" | "critico";
    suspensao: "ok" | "alerta" | "critico";
  };
  status: "aprovado" | "alerta" | "critico";
}

export interface Maintenance {
  id: string;
  vehicleId: string;
  description: string;
  type: "preventiva" | "corretiva" | "preditiva";
  status: "agendada" | "em_execucao" | "finalizada";
  cost: number;
  date: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  read: boolean;
  category: "critico" | "alto" | "medio" | "baixo";
  type: "system" | "maintenance" | "security" | "logistics";
  status: "ativo" | "resolvido";
}

export interface ChatMessage {
  id: string;
  role: "user" | "bot" | "agent";
  text: string;
  timestamp: string;
}

// ── Shared Dashboard & BI Types (Preserving older required types) ──
export interface Kpis {
  vehicles: { total: number; active: number };
  drivers: number;
  travels: { total: number; completed: number };
  fuelCost: number;
  pendingMaintenance: number;
}

export interface PredictiveAlert {
  vehicleId: string;
  type: string;
  severity: "low" | "medium" | "high";
  message: string;
  recommendation: string;
}

export interface VehicleSummary {
  id: string;
  plate: string;
  brand: string;
  model: string;
  status: string;
  mileage: number;
}

export interface DashboardData {
  kpis: Kpis;
  alerts: PredictiveAlert[];
  vehicles: VehicleSummary[];
  forecast: {
    expectedTrips: number;
    peakDays: string[];
    recommendation: string;
  };
  evolution?: { label: string; viagens: number; combustivel: number }[];
}

export interface RegionStat {
  region: string;
  totalTrips: number;
  completedTrips: number;
  revenue: number;
  fuelCost: number;
  profitMargin: number;
}

export interface FunnelStage {
  stage: string;
  key: string;
  count: number;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
  trips: number;
}

export interface AnalyticsData {
  regions: RegionStat[];
  billing: {
    totalRevenue: number;
    contractRevenue: number;
    tripRevenue: number;
    totalFuelCost: number;
    globalProfitMargin: number;
  };
  funnel: FunnelStage[];
  revenueEvolution: RevenuePoint[];
}

export interface DriverScore {
  id: string;
  name: string;
  score: number;
  badge: "Excelente" | "Bom" | "Regular" | "Crítico";
  cnhCategory: string;
  status: string;
  completedTrips: number;
  cancelledTrips: number;
  totalKm: number;
  completionRate: number;
}

export interface PredictivePart {
  name: string;
  kmUntilChange: number;
  severity: "ok" | "warning" | "critical";
  intervalKm: number;
}

export interface VehiclePredictiveReport {
  vehicleId: string;
  plate: string;
  brand: string;
  model: string;
  mileage: number;
  lastMaintenance: string | null;
  parts: PredictivePart[];
  failureProbability?: number;
}

export interface ConsumptionByModel {
  brand: string;
  model: string;
  avgKmPerL: number;
  totalKm: number;
  vehicleCount: number;
}

export interface MarketplaceVehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  avgConsumption: number | null;
  autonomyKm: number | null;
  pricePerDay: number;
  available: boolean;
  category: string;
}

export interface ContractQuote {
  vehicle: { id: string; plate: string; brand: string; model: string };
  period: { startDate: string; endDate: string; days: number };
  pricing: { pricePerDay: number; totalValue: number };
  payment: { pixKey: string; pixPayload: string; description: string };
}

export interface TelemetryAlert {
  id: string;
  type: "mechanical" | "fatigue" | "route_deviation";
  severity: "critical" | "high" | "medium";
  title: string;
  message: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface TelemetryResponse {
  alerts: TelemetryAlert[];
  generatedAt: string;
  total: number;
}
