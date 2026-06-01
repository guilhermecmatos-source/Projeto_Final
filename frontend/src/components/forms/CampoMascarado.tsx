"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type TipoMascara = "moeda" | "km" | "litros" | "placa" | "telefone";

interface CampoMascaradoProps {
  label: string;
  name: string;
  tipo: TipoMascara;
  value: string;
  onChange: (valor: string) => void;
  required?: boolean;
  placeholder?: string;
}

export function CampoMascarado({
  label,
  name,
  tipo,
  value,
  onChange,
  required,
  placeholder,
}: CampoMascaradoProps) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        inputMode={tipo === "moeda" || tipo === "km" ? "numeric" : "text"}
      />
    </div>
  );
}
