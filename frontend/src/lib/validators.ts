function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function cpfChecksum(digits: number[], factor: number): number {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) sum += digits[i] * (factor - i);
  const mod = (sum * 10) % 11;
  return mod === 10 ? 0 : mod;
}

export function validateCpf(cpf: string): { valid: boolean; message?: string } {
  const d = onlyDigits(cpf);
  if (d.length !== 11) return { valid: false, message: "CPF deve ter 11 dígitos." };
  if (/^(\d)\1{10}$/.test(d)) return { valid: false, message: "CPF inválido." };
  const nums = d.split("").map(Number);
  if (cpfChecksum(nums.slice(0, 9), 10) !== nums[9] || cpfChecksum(nums.slice(0, 10), 11) !== nums[10]) {
    return { valid: false, message: "CPF inválido." };
  }
  return { valid: true };
}

export function validateCnpj(cnpj: string): { valid: boolean; message?: string } {
  const d = onlyDigits(cnpj);
  if (d.length !== 14) return { valid: false, message: "CNPJ deve ter 14 dígitos." };
  if (/^(\d)\1{13}$/.test(d)) return { valid: false, message: "CNPJ inválido." };
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const nums = d.split("").map(Number);
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += nums[i] * w1[i];
  let r = sum % 11;
  const d1 = r < 2 ? 0 : 11 - r;
  if (d1 !== nums[12]) return { valid: false, message: "CNPJ inválido." };
  sum = 0;
  for (let i = 0; i < 13; i++) sum += nums[i] * w2[i];
  r = sum % 11;
  const d2 = r < 2 ? 0 : 11 - r;
  if (d2 !== nums[13]) return { valid: false, message: "CNPJ inválido." };
  return { valid: true };
}

export function validateRg(rg: string): { valid: boolean; message?: string } {
  const clean = rg.replace(/[^\dA-Za-z]/g, "");
  if (clean.length < 5) return { valid: false, message: "RG inválido." };
  return { valid: true };
}

export function validateCnh(cnh: string): { valid: boolean; message?: string } {
  const d = onlyDigits(cnh);
  if (d.length !== 11) return { valid: false, message: "CNH deve ter 11 dígitos." };
  return { valid: true };
}

export function validateCep(cep: string): { valid: boolean; message?: string } {
  const d = onlyDigits(cep);
  if (d.length !== 8) return { valid: false, message: "CEP inválido." };
  return { valid: true };
}

export function validateEmail(email: string): { valid: boolean; message?: string } {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return { valid: false, message: "E-mail inválido." };
  }
  return { valid: true };
}

export function validatePhone(phone: string): { valid: boolean; message?: string } {
  const d = onlyDigits(phone);
  if (d.length < 10 || d.length > 11) return { valid: false, message: "Telefone inválido." };
  return { valid: true };
}

export function normalizePlate(plate: string): string {
  return plate.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

export function validatePlate(plate: string): { valid: boolean; message?: string } {
  const p = normalizePlate(plate);
  if (!/^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(p) && !/^[A-Z]{3}[0-9]{4}$/.test(p)) {
    return { valid: false, message: "Placa inválida (Mercosul ou antiga)." };
  }
  return { valid: true };
}

export function formatPlateDisplay(plate: string): string {
  const p = normalizePlate(plate);
  if (/^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(p)) return `${p.slice(0, 3)}-${p[3]}${p[4]}${p.slice(5)}`;
  if (/^[A-Z]{3}[0-9]{4}$/.test(p)) return `${p.slice(0, 3)}-${p.slice(3)}`;
  return p;
}

export function validateDate(value: string): { valid: boolean; message?: string } {
  if (!value?.trim()) return { valid: false, message: "Data obrigatória." };
  if (Number.isNaN(new Date(value).getTime())) return { valid: false, message: "Data inválida." };
  return { valid: true };
}

export function validatePositiveNumber(
  value: unknown,
  label: string
): { valid: boolean; message?: string } {
  const n = Number(value);
  if (Number.isNaN(n) || n < 0) return { valid: false, message: `${label} inválido.` };
  return { valid: true };
}
