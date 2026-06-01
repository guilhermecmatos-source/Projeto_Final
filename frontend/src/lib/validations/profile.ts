import { z } from "zod";

export const perfilUsuarioSchema = z.object({
  name: z.string().min(3, "Nome deve ter ao menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  role: z.enum(["admin", "attendant", "client"]),
});

export type PerfilUsuarioInput = z.infer<typeof perfilUsuarioSchema>;
