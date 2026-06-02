export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "attendant" | "client";
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
}
