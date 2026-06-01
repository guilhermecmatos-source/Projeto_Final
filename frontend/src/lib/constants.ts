export const STORAGE_KEYS = {
  theme: "fleet_theme",
  profiles: "fleet_user_profiles",
  ruvDraft: "fleet_ruv_draft",
  ruvRecords: "fleet_ruv_records",
  logisticsDraft: "fleet_logistics_movement",
  logisticsRecords: "fleet_logistics_records",
  fuelLocal: "fleet_fuel_local",
  fuelDraft: "fleet_fuel_draft",
  inspectionsLocal: "fleet_inspections_local",
  insReports: "fleet_ins_reports",
  syncQueue: "fleet_sync_queue",
} as const;

export const ROUTES = {
  dashboard: "/dashboard",
  vehicles: "/vehicles",
  vehiclesRegister: "/vehicles/register",
  vehiclesAssign: "/vehicles/assign",
  vehiclesRuv: "/vehicles/ruv",
  vehiclesMovement: "/vehicles/movement",
  fuel: "/fuel",
  fuelRegister: "/fuel/register",
  alerts: "/alerts",
  fleetIntelligence: "/fleet-intelligence",
  mapOperations: "/map-operations",
  maintenance: "/maintenance",
  maintenanceRegister: "/maintenance/register",
  inspection: "/inspection",
  inspectionRegister: "/inspection/register",
  inspectionIns: "/inspection/ins-report",
  reports: "/reports",
  profiles: "/profiles",
  login: "/login",
} as const;

export const FLEET_INTELLIGENCE_MODES = ["manutencao", "alertas"] as const;
