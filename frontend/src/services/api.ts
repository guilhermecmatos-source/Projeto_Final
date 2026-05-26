import axios from "axios";

/** Usa /api no browser (proxy Next → backend :3001). Evita 404 quando o front sobe na porta 3001. */
const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== "undefined" ? "/api" : "http://127.0.0.1:3001/api"),
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post("/auth/register", { name, email, password }),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
};

export const dashboardApi = {
  get: () => api.get("/dashboard"),
};

export const vehiclesApi = {
  list: () => api.get("/vehicles"),
  get: (id: string) => api.get(`/vehicles/${id}`),
  create: (data: Record<string, unknown>) => api.post("/vehicles", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/vehicles/${id}`, data),
  remove: (id: string) => api.delete(`/vehicles/${id}`),
};

export const driversApi = {
  list: () => api.get("/drivers"),
  get: (id: string) => api.get(`/drivers/${id}`),
  create: (data: Record<string, unknown>) => api.post("/drivers", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/drivers/${id}`, data),
  remove: (id: string) => api.delete(`/drivers/${id}`),
};

export const travelsApi = {
  list: () => api.get("/travels"),
  get: (id: string) => api.get(`/travels/${id}`),
  create: (data: Record<string, unknown>) => api.post("/travels", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/travels/${id}`, data),
  cancel: (id: string) => api.patch(`/travels/${id}/cancel`),
};

export const fuelApi = {
  list: () => api.get("/fuel"),
  create: (data: Record<string, unknown>) => api.post("/fuel", data),
  report: (vehicleId?: string) =>
    api.get("/fuel/report", { params: vehicleId ? { vehicleId } : {} }),
};

export const maintenanceApi = {
  list: () => api.get("/maintenance"),
  create: (data: Record<string, unknown>) => api.post("/maintenance", data),
  complete: (id: string) => api.patch(`/maintenance/${id}/complete`),
  alerts: () => api.get("/maintenance/alerts"),
};
