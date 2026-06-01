import type { FleetAlert } from "@/types/fleet";

export const MOCK_ALERTS: FleetAlert[] = [
  {
    id: "1",
    level: "critical",
    category: "consumption",
    title: "Consumo fora do padrão",
    description: "Veículo DEF-5678 apresentou consumo 38% acima da média da frota.",
    vehiclePlate: "DEF-5678",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    level: "medium",
    category: "fraud",
    title: "Suspeita de fraude",
    description: "Motorista João teve variação anormal de abastecimento em 48h.",
    driverName: "João Silva",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    level: "low",
    category: "maintenance",
    title: "Manutenção preventiva",
    description: "Veículo ABC-1234 atingiu 15.000 km desde última revisão.",
    vehiclePlate: "ABC-1234",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    level: "critical",
    category: "efficiency",
    title: "Veículo ineficiente",
    description: "GHI-9012 abaixo de 7 km/L por 3 semanas consecutivas.",
    vehiclePlate: "GHI-9012",
    createdAt: new Date().toISOString(),
  },
];
