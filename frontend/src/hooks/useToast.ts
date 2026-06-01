"use client";

import { toast as sonner } from "sonner";

export function useToast() {
  return {
    sucesso: (msg: string) => sonner.success(msg),
    erro: (msg: string) => sonner.error(msg),
    info: (msg: string) => sonner.info(msg),
    aviso: (msg: string) => sonner.warning(msg),
    carregando: (msg: string) => sonner.loading(msg),
  };
}
