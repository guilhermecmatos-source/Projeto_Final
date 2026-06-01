import http from "./http";

export const maintenanceApi = {
  list: () => http.get("/maintenance"),
  create: (data: Record<string, unknown>) => http.post("/maintenance", data),
  alerts: () => http.get("/maintenance/alerts"),
};
