export type UserRole = "admin" | "attendant" | "client";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

export interface UserProfile extends User {
  phone: string;
}

export type AlertLevel = "low" | "medium" | "critical";

export interface FleetAlert {
  id: string;
  level: AlertLevel;
  title: string;
  description: string;
  vehiclePlate?: string;
  driverName?: string;
  createdAt: string;
  category: "consumption" | "fraud" | "maintenance" | "efficiency";
}

export interface DashboardKpis {
  totalSpend: number;
  totalLiters: number;
  avgKmPerLiter: number;
  activeAlerts: number;
  savingsGenerated: number;
}

export interface VehicleMapMarker {
  id: string;
  plate: string;
  route: string;
  speedKmh: number;
  lat: number;
  lng: number;
  inTransit: boolean;
}

export interface AiInsight {
  id: string;
  type: "prediction" | "savings" | "problem" | "trend" | "suggestion";
  title: string;
  description: string;
  impact?: string;
}
