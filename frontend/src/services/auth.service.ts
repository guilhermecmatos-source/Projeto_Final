import http from "./http";

export const authApi = {
  login: (email: string, password: string) =>
    http.post("/auth/login", { email, password }),
  register: (name: string, email: string, password: string) =>
    http.post("/auth/register", { name, email, password }),
  logout: () => http.post("/auth/logout"),
  me: () => http.get("/auth/me"),
};
