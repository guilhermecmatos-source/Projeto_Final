export type UserRole = "admin" | "attendant" | "client";

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
}

export type VehicleStatus = "active" | "maintenance" | "inactive";

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  status: VehicleStatus;
  mileage: number;
  created_at: Date;
  updated_at: Date;
}

export interface Driver {
  id: string;
  name: string;
  license_number: string;
  phone: string;
  score: number;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export type TravelStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export interface Travel {
  id: string;
  vehicle_id: string;
  driver_id: string;
  origin: string;
  destination: string;
  distance_km: number;
  fuel_consumption: number;
  status: TravelStatus;
  started_at: Date | null;
  ended_at: Date | null;
  created_at: Date;
}

export interface FuelRecord {
  id: string;
  vehicle_id: string;
  liters: number;
  cost: number;
  mileage_at_fill: number;
  station: string;
  filled_at: Date;
  suspicious: boolean;
  created_at: Date;
}

export type MaintenanceType = "preventive" | "corrective";

export interface Maintenance {
  id: string;
  vehicle_id: string;
  type: MaintenanceType;
  description: string;
  cost: number;
  scheduled_at: Date;
  completed_at: Date | null;
  alert_sent: boolean;
  created_at: Date;
}

export interface PredictiveAlert {
  vehicleId: string;
  type: string;
  severity: "low" | "medium" | "high";
  message: string;
  recommendation: string;
}
