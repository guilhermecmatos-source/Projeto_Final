"use client";

import { useQuery } from "@tanstack/react-query";
import { driversApi } from "@/services/drivers.service";
import type { Driver } from "@/types";

export function useDrivers() {
  const query = useQuery({
    queryKey: ["drivers"],
    queryFn: async () => {
      const res = await driversApi.list();
      return (Array.isArray(res.data) ? res.data : []) as Driver[];
    },
  });
  return { ...query, motoristas: query.data ?? [] };
}
