import { z } from "zod";

export const manutencaoSchema = z.object({
  vehicle_id: z.string().min(1, "Selecione ou escaneie o veículo"),
  type: z.enum(["preventive", "corrective"]),
  description: z.string().min(5, "Descrição muito curta"),
  cost: z.coerce.number().min(0),
  scheduled_at: z.string().min(1, "Data de agendamento obrigatória"),
});

export type ManutencaoInput = z.infer<typeof manutencaoSchema>;
