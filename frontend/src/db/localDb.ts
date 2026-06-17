// localDb.ts - Camada de Dados Local com Persistência em localStorage
import { User } from "@/types";

const SEED_VEHICLES = [
  {
    id: "v-1",
    plate: "BRA-2E19",
    brand: "Scania",
    model: "R 450",
    year: 2024,
    km: 125430,
    avgConsumption: 2.8,
    status: "FOR_SALE_AND_RENT",
    sale_price: 680000,
    daily_rental_price: 1800,
    autonomy: 700,
  },
  {
    id: "v-2",
    plate: "FLT-0130",
    brand: "Volvo",
    model: "FH 540",
    year: 2025,
    km: 82190,
    avgConsumption: 2.5,
    status: "FOR_RENT",
    daily_rental_price: 2100,
    autonomy: 600,
  },
  {
    id: "v-3",
    plate: "MEC-4D21",
    brand: "Mercedes-Benz",
    model: "Atego 2426",
    year: 2023,
    km: 243500,
    avgConsumption: 3.5,
    status: "MAINTENANCE",
    autonomy: 800,
  }
];

const SEED_DRIVERS = [
  {
    id: "d-1",
    name: "Carlos Silveira",
    cpf: "390.533.447-05",
    rg: "RG-3333333",
    phone: "(11) 98765-4321",
    cnh: "12345678901",
    cnhCategory: "AE",
    cnhExpiration: "2026-08-15",
    linkedVehicleId: "v-1",
    status: "Disponível",
    expenses: 0,
    occurrences: []
  },
  {
    id: "d-2",
    name: "Roberto Souza",
    cpf: "153.509.460-56",
    rg: "RG-4444444",
    phone: "(11) 97654-3210",
    cnh: "98765432109",
    cnhCategory: "B",
    cnhExpiration: "2025-12-30",
    linkedVehicleId: "v-2",
    status: "Em Viagem",
    expenses: 0,
    occurrences: []
  }
];

const SEED_USERS = [
  {
    id: "u-1",
    name: "Amanda Silveira",
    email: "admin@fleetai.com.br",
    cpf: "123.456.789-09",
    rg: "RG-1111111",
    role: "Administrador",
    cargo: "Gerente Operacional",
    unidade: "Matriz São Paulo",
    status: "Ativo",
    acceptedTerms: true
  },
  {
    id: "u-2",
    name: "Julian Rodrigues",
    email: "gestor@fleetai.com.br",
    cpf: "987.654.321-09",
    rg: "RG-2222222",
    role: "Gestor",
    cargo: "Coordenador de Pátio",
    unidade: "Filial Campinas",
    status: "Ativo",
    acceptedTerms: true
  },
  {
    id: "u-3",
    name: "Carlos Silveira",
    email: "motorista@fleetai.com.br",
    cpf: "390.533.447-05",
    rg: "RG-3333333",
    role: "Solicitante",
    cargo: "Motorista Prof. Cat. AE",
    unidade: "Matriz São Paulo",
    status: "Ativo",
    acceptedTerms: true
  }
];

function getStoredItem<T>(key: string, defaultVal: T): T {
  if (typeof window === "undefined") return defaultVal;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function saveStoredItem<T>(key: string, val: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error(`Erro ao salvar no localStorage [${key}]:`, e);
  }
}

// Wrappers CRUD
export const getStoredUsers = () => getStoredItem<any[]>("fleet_users", SEED_USERS);
export const saveStoredUsers = (u: any[]) => saveStoredItem("fleet_users", u);

export const getStoredVehicles = () => getStoredItem<any[]>("fleet_vehicles", SEED_VEHICLES);
export const saveStoredVehicles = (v: any[]) => saveStoredItem("fleet_vehicles", v);

export const getStoredDrivers = () => getStoredItem<any[]>("fleet_drivers", SEED_DRIVERS);
export const saveStoredDrivers = (d: any[]) => saveStoredItem("fleet_drivers", d);

export const getStoredInspections = () => getStoredItem<any[]>("fleet_inspections", []);
export const saveStoredInspections = (i: any[]) => saveStoredItem("fleet_inspections", i);

export const getStoredDispatches = () => getStoredItem<any[]>("fleet_dispatches", []);
export const saveStoredDispatches = (d: any[]) => saveStoredItem("fleet_dispatches", d);

export const getStoredSupplies = () => getStoredItem<any[]>("fleet_supplies", []);
export const saveStoredSupplies = (s: any[]) => saveStoredItem("fleet_supplies", s);

export const getStoredMaintenances = () => getStoredItem<any[]>("fleet_maintenances", []);
export const saveStoredMaintenances = (m: any[]) => saveStoredItem("fleet_maintenances", m);

export const getStoredRequisitions = () => getStoredItem<any[]>("fleet_requisitions", []);
export const saveStoredRequisitions = (r: any[]) => saveStoredItem("fleet_requisitions", r);

export const getStoredNotifications = () => getStoredItem<any[]>("fleet_notifications", []);
export const saveStoredNotifications = (n: any[]) => saveStoredItem("fleet_notifications", n);

export const getStoredCards = () => getStoredItem<any[]>("fleet_cards", []);
export const saveStoredCards = (c: any[]) => saveStoredItem("fleet_cards", c);

export const getStoredDocuments = () => getStoredItem<any[]>("fleet_documents", []);
export const saveStoredDocuments = (d: any[]) => saveStoredItem("fleet_documents", d);

export const getStoredSaleRequests = () => getStoredItem<any[]>("fleet_sale_requests", []);
export const saveStoredSaleRequests = (s: any[]) => saveStoredItem("fleet_sale_requests", s);

export const getStoredRentalRequests = () => getStoredItem<any[]>("fleet_rental_requests", []);
export const saveStoredRentalRequests = (r: any[]) => saveStoredItem("fleet_rental_requests", r);

export const getOfflineQueue = () => getStoredItem<any[]>("fleet_offline_queue", []);
export const saveOfflineQueue = (q: any[]) => saveStoredItem("fleet_offline_queue", q);

export const getActiveProfile = () => getStoredItem<any>("fleet_active_profile", null);
export const saveActiveProfile = (p: any) => saveStoredItem("fleet_active_profile", p);

export const getAccessibilityTheme = () => getStoredItem<string>("fleet_accessibility_theme", "Azul Corporativo");
export const saveAccessibilityTheme = (t: string) => saveStoredItem("fleet_accessibility_theme", t);

export const getOfflineMode = () => getStoredItem<boolean>("fleet_offline_mode", false);
export const saveOfflineMode = (b: boolean) => saveStoredItem("fleet_offline_mode", b);

export const addToOfflineQueue = (action: string, payload: any): void => {
  const queue = getOfflineQueue();
  queue.push({
    id: `q-${Date.now()}`,
    action,
    payload,
    timestamp: new Date().toISOString(),
  });
  saveOfflineQueue(queue);
  
  // Dispara evento global de storage para que as UIs reajam de imediato
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage"));
  }
};
