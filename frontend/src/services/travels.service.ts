import http from "./http";

export const travelsApi = {
  list: () => http.get("/travels"),
  create: (data: Record<string, unknown>) => http.post("/travels", data),
};
