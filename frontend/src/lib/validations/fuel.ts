import { z } from "zod";

export const abastecimentoSchema = z.object({
  vehicle_id: z.string().min(1, "Selecione o veículo"),
  liters: z.coerce.number().positive("Litros deve ser maior que zero"),
  cost: z.coerce.number().positive("Valor deve ser maior que zero"),
  mileage_at_fill: z.coerce.number().min(0, "Odômetro inválido"),
  station: z.string().min(2, "Informe o posto"),
  filled_at: z.string().min(1, "Data obrigatória"),
  fuel_type: z.string().optional(),
});

export type AbastecimentoInput = z.infer<typeof abastecimentoSchema>;
