export interface User {
  id: string;
  name: string;
  email: string;
  role:
    | "administrador"
    | "gestor"
    | "motorista"
    | "solicitante"
    | "admin"
    | "attendant"
    | "client";
  cpf?: string | null;
  rg?: string | null;
  cargo?: string | null;
  unidade?: string | null;
}

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

// ── Analytics ──────────────────────────────────────────────────────────────

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

// ── Intelligence ───────────────────────────────────────────────────────────

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

// ── Marketplace ────────────────────────────────────────────────────────────

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

// ── Telemetria ─────────────────────────────────────────────────────────────

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
