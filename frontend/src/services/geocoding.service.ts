import http from "./http";

export const geocodingApi = {
  distance: (origin: string, destination: string) =>
    http.get("/geocoding/distance", { params: { origin, destination } }),
};
