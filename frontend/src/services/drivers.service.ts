import http from "./http";

export const driversApi = {
  list: () => http.get("/drivers"),
  get: (id: string) => http.get(`/drivers/${id}`),
  create: (data: Record<string, unknown>) => http.post("/drivers", data),
};
