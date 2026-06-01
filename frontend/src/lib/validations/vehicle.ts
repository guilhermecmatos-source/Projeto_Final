import { z } from "zod";

export const cadastroVeiculoSchema = z.object({
  plate: z.string().min(7, "Placa inválida"),
  brand: z.string().min(2, "Marca obrigatória"),
  model: z.string().min(2, "Modelo obrigatório"),
  year: z.coerce.number().min(1990).max(new Date().getFullYear() + 1),
  mileage: z.coerce.number().min(0, "Quilometragem inválida"),
});

export const atribuicaoVeiculoSchema = z.object({
  vehicle_id: z.string().min(1, "Selecione o veículo"),
  driver_id: z.string().min(1, "Selecione o motorista"),
  origin: z.string().min(2, "Origem obrigatória"),
  destination: z.string().min(2, "Destino obrigatório"),
});

export type CadastroVeiculoInput = z.infer<typeof cadastroVeiculoSchema>;
export type AtribuicaoVeiculoInput = z.infer<typeof atribuicaoVeiculoSchema>;
