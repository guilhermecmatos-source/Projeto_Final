type GeoProvider = "google" | "qualp" | "mapeia" | "heuristic";

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
  ["são paulo", "rio de janeiro", 429],
  ["sao paulo", "rio de janeiro", 429],
];

function estimateHeuristic(origin: string, destination: string): number {
  const o = origin.toLowerCase().trim();
  const d = destination.toLowerCase().trim();
  for (const [a, b, km] of CITY_PAIRS) {
    if ((o.includes(a) && d.includes(b)) || (o.includes(b) && d.includes(a))) return km;
  }
  return Math.round(80 + ((o.length + d.length) / 12) * 35);
}

async function googleDistance(origin: string, destination: string): Promise<RouteDistanceResult | null> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return null;

  const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
  url.searchParams.set("origins", origin);
  url.searchParams.set("destinations", destination);
  url.searchParams.set("key", key);
  url.searchParams.set("language", "pt-BR");
  url.searchParams.set("units", "metric");

  const res = await fetch(url.toString());
  if (!res.ok) return null;
  const data = (await res.json()) as {
    rows?: { elements?: { status: string; distance?: { value: number }; duration?: { value: number } }[] }[];
  };
  const el = data.rows?.[0]?.elements?.[0];
  if (!el || el.status !== "OK" || !el.distance) return null;

  return {
    distanceKm: Math.round((el.distance.value / 1000) * 10) / 10,
    durationMinutes: el.duration ? Math.round(el.duration.value / 60) : undefined,
    provider: "google",
  };
}

async function qualpDistance(origin: string, destination: string): Promise<RouteDistanceResult | null> {
  const key = process.env.QUALP_API_KEY;
  const base = process.env.QUALP_API_URL;
  if (!key || !base) return null;

  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/route/distance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ origin, destination }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { distance_km?: number; duration_minutes?: number };
    if (!data.distance_km) return null;
    return {
      distanceKm: data.distance_km,
      durationMinutes: data.duration_minutes,
      provider: "qualp",
    };
  } catch {
    return null;
  }
}

async function mapeiaDistance(origin: string, destination: string): Promise<RouteDistanceResult | null> {
  const key = process.env.MAPEIA_API_KEY;
  const base = process.env.MAPEIA_API_URL;
  if (!key || !base) return null;

  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/v1/routes/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": key,
      },
      body: JSON.stringify({ from: origin, to: destination }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { distanceKm?: number; durationMinutes?: number };
    if (!data.distanceKm) return null;
    return {
      distanceKm: data.distanceKm,
      durationMinutes: data.durationMinutes,
      provider: "mapeia",
    };
  } catch {
    return null;
  }
}

export async function resolveRouteDistance(
  origin: string,
  destination: string
): Promise<RouteDistanceResult> {
  const o = origin?.trim();
  const d = destination?.trim();
  if (!o || !d) {
    return { distanceKm: 0, provider: "heuristic" };
  }

  const providerOrder = (process.env.GEO_PROVIDER_ORDER || "google,qualp,mapeia,heuristic")
    .split(",")
    .map((p) => p.trim().toLowerCase());

  for (const provider of providerOrder) {
    let result: RouteDistanceResult | null = null;
    if (provider === "google") result = await googleDistance(o, d);
    else if (provider === "qualp") result = await qualpDistance(o, d);
    else if (provider === "mapeia") result = await mapeiaDistance(o, d);
    if (result && result.distanceKm > 0) return result;
  }

  return {
    distanceKm: estimateHeuristic(o, d),
    provider: "heuristic",
  };
}
