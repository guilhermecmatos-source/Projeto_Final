import http from "./http";

export const vehiclesApi = {
  list: () => http.get("/vehicles"),
  get: (id: string) => http.get(`/vehicles/${id}`),
  create: (data: Record<string, unknown>) => http.post("/vehicles", data),
  update: (id: string, data: Record<string, unknown>) => http.put(`/vehicles/${id}`, data),
  remove: (id: string) => http.delete(`/vehicles/${id}`),
};
