import http from "./http";

export const fuelApi = {
  list: () => http.get("/fuel"),
  create: (data: Record<string, unknown>) => http.post("/fuel", data),
  report: (vehicleId?: string) =>
    http.get("/fuel/report", { params: vehicleId ? { vehicleId } : {} }),
};
