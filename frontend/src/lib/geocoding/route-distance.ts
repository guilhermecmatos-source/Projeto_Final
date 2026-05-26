export type GeoProvider = "google" | "qualp" | "mapeia" | "heuristic";

export interface RouteDistanceResult {
  distanceKm: number;
  durationMinutes?: number;
  provider: GeoProvider;
  polyline?: string;
}

const CITY_PAIRS: [string, string, number][] = [
  ["são paulo", "curitiba", 408],
  ["sao paulo", "curitiba", 408],
  ["campinas", "santos", 168],
  ["belo horizonte", "rio de janeiro", 434],
  ["bh", "rio", 434],
  ["são paulo", "rio de janeiro", 429],
  ["sao paulo", "rio de janeiro", 429],
  ["são paulo", "belo horizonte", 586],
  ["sao paulo", "belo horizonte", 586],
];

/** Fallback local quando APIs externas não estão disponíveis */
export function estimateDistanceHeuristic(origin: string, destination: string): number {
  const o = origin.toLowerCase().trim();
  const d = destination.toLowerCase().trim();
  for (const [a, b, km] of CITY_PAIRS) {
    if ((o.includes(a) && d.includes(b)) || (o.includes(b) && d.includes(a))) return km;
  }
  const words = Math.max(1, (o.length + d.length) / 12);
  return Math.round(80 + words * 35);
}

/** Busca distância real via API do backend (Google / Qualp / Mapeia com fallback) */
export async function fetchRouteDistance(
  origin: string,
  destination: string
): Promise<RouteDistanceResult> {
  const params = new URLSearchParams({ origin, destination });
  const base =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_API_URL || "/api"
      : process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001/api";

  try {
    const res = await fetch(`${base}/geocoding/distance?${params}`);
    if (res.ok) {
      const data = (await res.json()) as RouteDistanceResult;
      if (data.distanceKm > 0) return data;
    }
  } catch {
    /* fallback abaixo */
  }

  return {
    distanceKm: estimateDistanceHeuristic(origin, destination),
    provider: "heuristic",
  };
}
