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
  get: (params?: { dateFrom?: string; dateTo?: string }) =>
    api.get("/dashboard", { params }),
};

export const geocodingApi = {
  distance: (origin: string, destination: string) =>
    api.get("/geocoding/distance", { params: { origin, destination } }),
};

export const uploadsApi = {
  upload: (file: File, entityType: string, entityId?: string) => {
    const form = new FormData();
    form.append("file", file);
    form.append("entityType", entityType);
    if (entityId) form.append("entityId", entityId);
    return api.post("/uploads", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
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
  list: (search?: string) => api.get("/travels", { params: search ? { search } : {} }),
  get: (id: string) => api.get(`/travels/${id}`),
  create: (data: Record<string, unknown>) => api.post("/travels", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/travels/${id}`, data),
  remove: (id: string) => api.delete(`/travels/${id}`),
  cancel: (id: string) => api.patch(`/travels/${id}/cancel`),
};

export const usersApi = {
  list: () => api.get("/users"),
  get: (id: string) => api.get(`/users/${id}`),
  create: (data: Record<string, unknown>) => api.post("/users", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/users/${id}`, data),
  remove: (id: string) => api.delete(`/users/${id}`),
};

export const ruvApi = {
  list: (status?: string) => api.get("/ruv", { params: status ? { status } : {} }),
  get: (id: string) => api.get(`/ruv/${id}`),
  create: (data: Record<string, unknown>) => api.post("/ruv", data),
  approve: (id: string, justification?: string) =>
    api.patch(`/ruv/${id}/approve`, { justification }),
  reject: (id: string, justification: string) =>
    api.patch(`/ruv/${id}/reject`, { justification }),
};

export const intelligenceApi = {
  metrics: () => api.get("/intelligence/metrics"),
  discovery: () => api.get("/intelligence/discovery"),
  ceo: () => api.get("/intelligence/ceo"),
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
