import type { VehicleMapUnit } from "@/types";

export const VEICULOS_MAPA: VehicleMapUnit[] = [
  { id: "1", plate: "ABC-1234", route: "SP → Campinas", speedKmh: 72, lat: -23.55, lng: -46.63, inTransit: true },
  { id: "2", plate: "DEF-5678", route: "RJ → Niterói", speedKmh: 45, lat: -22.9, lng: -43.2, inTransit: true },
  { id: "3", plate: "GHI-9012", route: "BH → Contagem", speedKmh: 0, lat: -19.92, lng: -43.94, inTransit: false },
];
