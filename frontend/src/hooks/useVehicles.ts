"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vehiclesApi } from "@/services/vehicles.service";
import type { Vehicle } from "@/types";

export function useVehicles() {
  const queryClient = useQueryClient();

  const lista = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const res = await vehiclesApi.list();
      return (Array.isArray(res.data) ? res.data : []) as Vehicle[];
    },
  });

  const criar = useMutation({
    mutationFn: (dados: Record<string, unknown>) => vehiclesApi.create(dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
  });

  return { ...lista, criar, veiculos: lista.data ?? [] };
}
