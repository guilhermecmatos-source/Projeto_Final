import axios from "axios";
import { clearStoredAuth, getStoredAuth } from "@/lib/auth-storage";

function resolveApiBaseUrl(): string {
  const publicUrl = process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    return publicUrl || "/api";
  }
  if (publicUrl?.startsWith("http")) return publicUrl;
  const backend =
    process.env.BACKEND_URL ||
    process.env.INTERNAL_API_URL ||
    "http://127.0.0.1:3001";
  return `${backend.replace(/\/$/, "")}/api`;
}

/** Browser: /api (rewrite Next → backend). SSR/Docker: BACKEND_URL direto. */
const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const { token } = getStoredAuth();
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
      clearStoredAuth();
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
  analytics: () => api.get("/dashboard/analytics"),
};

export const geocodingApi = {
  distance: (origin: string, destination: string) =>
    api.get("/geocoding/distance", { params: { origin, destination } }),
  places: (q: string) => api.get("/geocoding/places", { params: { q } }),
  routePoints: (origin: string, destination: string) =>
    api.get("/geocoding/routes/points", { params: { origin, destination } }),
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
  generateImage: (id: string) => api.post(`/vehicles/${id}/generate-image`),
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
  carpoolMatches: () => api.get("/travels/carpool/matches"),
  positions: () => api.get("/travels/positions"),
  get: (id: string) => api.get(`/travels/${id}`),
  create: (data: Record<string, unknown>) => api.post("/travels", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/travels/${id}`, data),
  remove: (id: string) => api.delete(`/travels/${id}`),
  cancel: (id: string) => api.patch(`/travels/${id}/cancel`),
};

export const usersApi = {
  list: (params?: { status?: string }) => api.get("/users", { params }),
  get: (id: string) => api.get(`/users/${id}`),
  create: (data: Record<string, unknown>) => api.post("/users", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/users/${id}`, data),
  remove: (id: string) => api.delete(`/users/${id}`),
  approve: (id: string) => api.patch(`/users/${id}/approve`),
  reject: (id: string) => api.patch(`/users/${id}/reject`),
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

export const chatApi = {
  listMessages: (otherUserId: string) => api.get(`/chat/messages/${otherUserId}`),
  sendMessage: (receiverId: string, message: string) =>
    api.post("/chat/messages", { receiverId, message }),
  listPartners: () => api.get("/chat/partners"),
};

export const intelligenceApi = {
  metrics: () => api.get("/intelligence/metrics"),
  discovery: () => api.get("/intelligence/discovery"),
  ceo: () => api.get("/intelligence/ceo"),
  travels: () => api.get("/intelligence/travels"),
  driverScores: () => api.get("/intelligence/driver-scores"),
  predictiveParts: () => api.get("/intelligence/predictive-parts"),
  consumptionByModel: () => api.get("/intelligence/consumption-by-model"),
};

export const reportsApi = {
  summary: (dateFrom?: string, dateTo?: string) =>
    api.get("/reports", { params: { dateFrom, dateTo } }),
};

export const partnersApi = {
  list: () => api.get("/partners"),
  get: (id: string) => api.get(`/partners/${id}`),
  sendMessage: (id: string, message: string) =>
    api.post(`/partners/${id}/messages`, { message }),
  create: (data: Record<string, unknown>) => api.post("/partners", data),
  createTicket: (data: Record<string, unknown>) => api.post("/partners/tickets", data),
};

export const contractsApi = {
  list: () => api.get("/contracts"),
  get: (id: string) => api.get(`/contracts/${id}`),
  templates: (area?: string) =>
    api.get("/contracts/templates", { params: area ? { area } : {} }),
  preview: (data: Record<string, unknown>) => api.post("/contracts/preview", data),
  quote: (data: Record<string, unknown>) => api.post("/contracts/quote", data),
  create: (data: Record<string, unknown>) => api.post("/contracts", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/contracts/${id}`, data),
  send: (id: string) => api.post(`/contracts/${id}/send`),
  sign: (id: string) => api.post(`/contracts/${id}/sign`),
  cancel: (id: string) => api.post(`/contracts/${id}/cancel`),
};

export const fuelApi = {
  list: () => api.get("/fuel"),
  create: (data: Record<string, unknown>) => api.post("/fuel", data),
  report: (vehicleId?: string) =>
    api.get("/fuel/report", { params: vehicleId ? { vehicleId } : {} }),
  monthly: (plate?: string) =>
    api.get("/fuel/monthly", { params: plate ? { plate } : {} }),
};

export const maintenanceApi = {
  list: () => api.get("/maintenance"),
  create: (data: Record<string, unknown>) => api.post("/maintenance", data),
  complete: (id: string) => api.patch(`/maintenance/${id}/complete`),
  alerts: () => api.get("/maintenance/alerts"),
};

export const marketplaceApi = {
  list: () => api.get("/marketplace"),
};

export const telemetryApi = {
  alerts: () => api.get("/telemetry/alerts"),
  history: () => api.get("/telemetry/alerts/history"),
  simulate: (data: { category: string; title: string; message: string; severity: string }) =>
    api.post("/telemetry/alerts/simulate", data),
};

export const copilotApi = {
  chat: (
    messages: { role: string; text: string }[],
    activeModule: string,
    vehicleContext?: Record<string, unknown>
  ) => api.post("/ai-chat", { messages, activeModule, vehicleContext }),
};
