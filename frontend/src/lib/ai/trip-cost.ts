export interface VehicleProfile {
  id: string;
  label: string;
  avgKmPerLiter: number;
  fuelPricePerLiter: number;
  tollPer100km: number;
}

export const DEFAULT_VEHICLES: VehicleProfile[] = [
  { id: "passenger", label: "Passageiro / Sedan", avgKmPerLiter: 12, fuelPricePerLiter: 5.89, tollPer100km: 18 },
  { id: "bus", label: "Ônibus", avgKmPerLiter: 4.5, fuelPricePerLiter: 6.2, tollPer100km: 45 },
  { id: "truck-lg", label: "Caminhão Grande", avgKmPerLiter: 3.2, fuelPricePerLiter: 6.15, tollPer100km: 55 },
  { id: "truck-sm", label: "Caminhão Pequeno", avgKmPerLiter: 6, fuelPricePerLiter: 6.1, tollPer100km: 35 },
  { id: "pickup", label: "Pick-up", avgKmPerLiter: 9, fuelPricePerLiter: 5.95, tollPer100km: 22 },
  { id: "van", label: "Van / Utilitário", avgKmPerLiter: 10, fuelPricePerLiter: 5.9, tollPer100km: 25 },
];

/** Estima distância por pares de cidades conhecidas; fallback heurístico */
export function estimateDistanceKm(origin: string, destination: string): number {
  const o = origin.toLowerCase();
  const d = destination.toLowerCase();
  const pairs: [string, string, number][] = [
    ["são paulo", "curitiba", 408],
    ["sao paulo", "curitiba", 408],
    ["campinas", "santos", 168],
    ["belo horizonte", "rio", 434],
    ["bh", "rio", 434],
    ["são paulo", "rio", 429],
    ["sao paulo", "rio", 429],
  ];
  for (const [a, b, km] of pairs) {
    if ((o.includes(a) && d.includes(b)) || (o.includes(b) && d.includes(a))) return km;
  }
  const words = Math.max(1, (o.length + d.length) / 12);
  return Math.round(80 + words * 35);
}

export interface TripCostResult {
  distanceKm: number;
  litersNeeded: number;
  fuelCost: number;
  tollCost: number;
  totalCost: number;
  avgKmPerLiter: number;
}

export function calculateTripCost(
  origin: string,
  destination: string,
  vehicle: VehicleProfile
): TripCostResult {
  const distanceKm = estimateDistanceKm(origin, destination);
  const litersNeeded = distanceKm / vehicle.avgKmPerLiter;
  const fuelCost = litersNeeded * vehicle.fuelPricePerLiter;
  const tollCost = (distanceKm / 100) * vehicle.tollPer100km;
  const totalCost = fuelCost + tollCost;

  return {
    distanceKm,
    litersNeeded: Math.round(litersNeeded * 10) / 10,
    fuelCost: Math.round(fuelCost * 100) / 100,
    tollCost: Math.round(tollCost * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    avgKmPerLiter: vehicle.avgKmPerLiter,
  };
}
