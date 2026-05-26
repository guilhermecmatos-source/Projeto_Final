/** Formata número para Real brasileiro (ex: R$ 1.250,90) */
export function formatBRL(value: number): string {
  if (!Number.isFinite(value)) return "R$ 0,00";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Converte string mascarada ou numérica para valor decimal */
export function parseBRL(input: string): number {
  if (!input?.trim()) return 0;
  const digits = input.replace(/\D/g, "");
  if (!digits) return 0;
  return Number(digits) / 100;
}

/** Aplica máscara monetária brasileira durante digitação */
export function maskBRLInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const cents = Number(digits);
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
