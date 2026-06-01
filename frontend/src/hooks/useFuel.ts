"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fuelApi } from "@/services/fuel.service";
import type { FuelRecord } from "@/types";

export function useFuel() {
  const queryClient = useQueryClient();

  const lista = useQuery({
    queryKey: ["fuel"],
    queryFn: async () => {
      const res = await fuelApi.list();
      return (Array.isArray(res.data) ? res.data : []) as FuelRecord[];
    },
  });

  const registrar = useMutation({
    mutationFn: (dados: Record<string, unknown>) => fuelApi.create(dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fuel"] }),
  });

  return { ...lista, registrar, registros: lista.data ?? [] };
}
