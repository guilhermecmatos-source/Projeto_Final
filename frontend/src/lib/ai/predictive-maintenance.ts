export type MaintenanceStatus = "ok" | "warning" | "critical";

export interface FactoryPlanItem {
  id: string;
  name: string;
  intervalKm: number;
  intervalMonths: number;
  description: string;
}

export const FACTORY_PLANS: FactoryPlanItem[] = [
  {
    id: "oil",
    name: "Troca de óleo e filtros",
    intervalKm: 10000,
    intervalMonths: 6,
    description: "Substituir óleo do motor, filtro de óleo e verificar vazamentos.",
  },
  {
    id: "brakes",
    name: "Revisão de freios",
    intervalKm: 20000,
    intervalMonths: 12,
    description: "Inspecionar pastilhas, discos, fluido e mangueiras do sistema de freio.",
  },
  {
    id: "tires",
    name: "Rodízio e alinhamento",
    intervalKm: 15000,
    intervalMonths: 6,
    description: "Rodízio de pneus, alinhamento, balanceamento e calibragem.",
  },
  {
    id: "timing",
    name: "Correia dentada / corrente",
    intervalKm: 60000,
    intervalMonths: 48,
    description: "Verificar tensão e desgaste; substituir conforme manual do fabricante.",
  },
  {
    id: "coolant",
    name: "Fluido de arrefecimento",
    intervalKm: 40000,
    intervalMonths: 24,
    description: "Trocar coolant e testar termostato e radiador.",
  },
];

export interface VehicleMaintenanceState {
  vehicleId: string;
  plate: string;
  mileage: number;
  lastServiceKm: number;
  lastServiceDate: string;
}

export interface MaintenanceAlert {
  vehicleId: string;
  plate: string;
  planId: string;
  planName: string;
  status: MaintenanceStatus;
  message: string;
  description: string;
  kmRemaining?: number;
  daysRemaining?: number;
}

function monthsBetween(a: Date, b: Date): number {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}

export function analyzeVehicleMaintenance(
  vehicle: VehicleMaintenanceState
): MaintenanceAlert[] {
  const alerts: MaintenanceAlert[] = [];
  const now = new Date();
  const lastDate = new Date(vehicle.lastServiceDate);
  const kmSince = vehicle.mileage - vehicle.lastServiceKm;
  const monthsSince = monthsBetween(lastDate, now);

  for (const plan of FACTORY_PLANS) {
    const kmOver = kmSince - plan.intervalKm;
    const monthsOver = monthsSince - plan.intervalMonths;
    const kmNear = plan.intervalKm - kmSince;
    const monthsNear = plan.intervalMonths - monthsSince;

    let status: MaintenanceStatus = "ok";
    let message = `${plan.name}: em dia.`;
    let description = plan.description;

    if (kmOver > 0 || monthsOver > 0) {
      status = "critical";
      message = `${plan.name} VENCIDA para ${vehicle.plate}.`;
      description = `${plan.description} Excedido: ${kmOver > 0 ? `${kmOver} km` : ""}${kmOver > 0 && monthsOver > 0 ? " e " : ""}${monthsOver > 0 ? `${monthsOver} meses` : ""}.`;
    } else if (kmNear <= 2000 || monthsNear <= 1) {
      status = "warning";
      message = `${plan.name} próxima da revisão (${vehicle.plate}).`;
      description = `${plan.description} Faltam ~${Math.max(0, kmNear)} km ou ${Math.max(0, monthsNear)} mês(es).`;
    }

    if (status !== "ok") {
      alerts.push({
        vehicleId: vehicle.vehicleId,
        plate: vehicle.plate,
        planId: plan.id,
        planName: plan.name,
        status,
        message,
        description,
        kmRemaining: kmNear > 0 ? kmNear : undefined,
        daysRemaining: monthsNear > 0 ? monthsNear * 30 : undefined,
      });
    }
  }

  return alerts;
}

export function analyzeFleet(
  vehicles: VehicleMaintenanceState[]
): MaintenanceAlert[] {
  return vehicles.flatMap(analyzeVehicleMaintenance);
}

export function countByStatus(alerts: MaintenanceAlert[]) {
  return {
    critical: alerts.filter((a) => a.status === "critical").length,
    warning: alerts.filter((a) => a.status === "warning").length,
    ok: alerts.length === 0,
  };
}
