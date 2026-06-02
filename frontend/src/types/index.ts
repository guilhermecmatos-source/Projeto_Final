export type UserRole = "admin" | "attendant" | "client";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}

export type AlertLevel = "low" | "medium" | "critical";

export type AlertCategory = "consumption" | "fraud" | "maintenance" | "efficiency";

export interface FleetAlert {
  id: string;
  level: AlertLevel;
  category: AlertCategory;
  title: string;
  description: string;
  vehiclePlate?: string;
  driverName?: string;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  status: "active" | "maintenance" | "inactive";
  mileage: number;
}

export interface Driver {
  id: string;
  name: string;
  license_number: string;
  phone?: string;
}

export interface FuelRecord {
  id?: string;
  vehicle_id: string;
  liters: number;
  cost: number;
  mileage_at_fill: number;
  station: string;
  filled_at: string;
  fuel_type?: string;
}

export interface DashboardStats {
  totalSpend: number;
  totalLiters: number;
  avgKmPerLiter: number;
  activeAlerts: number;
  savingsGenerated: number;
}

export interface VehicleMapUnit {
  id: string;
  plate: string;
  route: string;
  speedKmh: number;
  lat: number;
  lng: number;
  inTransit: boolean;
}

export type FleetIntelligenceMode = "manutencao" | "alertas";

export interface Kpis {
  vehicles: { total: number; active: number };
  drivers: number;
  travels: { total: number; completed: number };
  fuelCost: number;
  pendingMaintenance: number;
}

export interface DashboardData {
  kpis: Kpis;
  alerts: Array<{
    vehicleId: string;
    type: string;
    severity: "low" | "medium" | "high";
    message: string;
    recommendation: string;
  }>;
  vehicles: Array<{
    id: string;
    plate: string;
    brand: string;
    model: string;
    status: string;
    mileage: number;
  }>;
  forecast: {
    expectedTrips: number;
    peakDays: string[];
    recommendation: string;
  };
}
