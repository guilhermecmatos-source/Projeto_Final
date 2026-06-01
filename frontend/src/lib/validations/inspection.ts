import { z } from "zod";

export const inspecaoCadastroSchema = z.object({
  plate: z.string().min(7, "Placa inválida"),
  brand: z.string().min(2),
  model: z.string().min(2),
  year: z.coerce.number().min(1990),
  mileage: z.coerce.number().min(0),
});

export const insRelatorioSchema = z.object({
  email: z.string().email("E-mail inválido"),
  plate: z.string().min(7),
  inspector_name: z.string().min(3),
  mechanical_history: z.string().optional(),
  documentation_notes: z.string().optional(),
});

export type InspecaoCadastroInput = z.infer<typeof inspecaoCadastroSchema>;
export type InsRelatorioInput = z.infer<typeof insRelatorioSchema>;
