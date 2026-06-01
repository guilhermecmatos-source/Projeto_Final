import http from "./http";

export const dashboardApi = {
  get: (params?: { dateFrom?: string; dateTo?: string }) =>
    http.get("/dashboard", { params }),
};
