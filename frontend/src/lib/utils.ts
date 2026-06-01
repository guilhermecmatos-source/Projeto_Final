import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formularioParaObjeto(form: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  form.forEach((valor, chave) => {
    obj[chave] = valor;
  });
  return obj;
}

export function dataHoraBr(iso?: string): string {
  return new Date(iso ?? Date.now()).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
