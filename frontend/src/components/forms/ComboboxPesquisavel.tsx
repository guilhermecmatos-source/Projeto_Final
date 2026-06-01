"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface OpcaoCombobox {
  value: string;
  label: string;
}

interface ComboboxPesquisavelProps {
  label: string;
  name: string;
  opcoes: OpcaoCombobox[];
  value: string;
  onChange: (value: string, label: string) => void;
  required?: boolean;
  placeholder?: string;
}

export function ComboboxPesquisavel({
  label,
  name,
  opcoes,
  value,
  onChange,
  required,
  placeholder = "Digite para buscar...",
}: ComboboxPesquisavelProps) {
  const listId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const selecionada = opcoes.find((o) => o.value === value);
  const [texto, setTexto] = useState(selecionada?.label ?? "");
  const [aberto, setAberto] = useState(false);

  const filtradas = useMemo(() => {
    const q = texto.toLowerCase().trim();
    if (!q) return opcoes.filter((o) => o.value);
    return opcoes.filter(
      (o) => o.value && (o.label.toLowerCase().includes(q) || o.value.includes(q))
    );
  }, [opcoes, texto]);

  useEffect(() => {
    function clickFora(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", clickFora);
    return () => document.removeEventListener("mousedown", clickFora);
  }, []);

  function selecionar(op: OpcaoCombobox) {
    setTexto(op.label);
    onChange(op.value, op.label);
    setAberto(false);
  }

  return (
    <div ref={ref} className="relative">
      <Label htmlFor={`${name}-input`}>{label}</Label>
      <input type="hidden" name={name} value={value} required={required} />
      <div className="relative">
        <Input
          id={`${name}-input`}
          value={texto}
          placeholder={placeholder}
          onChange={(e) => {
            setTexto(e.target.value);
            setAberto(true);
            const exata = opcoes.find(
              (o) => o.label.toLowerCase() === e.target.value.toLowerCase()
            );
            if (exata) onChange(exata.value, exata.label);
            else onChange("", e.target.value);
          }}
          onFocus={() => setAberto(true)}
          autoComplete="off"
          list={listId}
        />
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      </div>
      {aberto && filtradas.length > 0 && (
        <ul
          className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-gray-700 bg-gray-900 py-1 shadow-xl"
          role="listbox"
        >
          {filtradas.map((op) => (
            <li key={op.value}>
              <button
                type="button"
                className={cn(
                  "w-full px-3 py-2 text-left text-sm hover:bg-gray-800",
                  op.value === value && "bg-cyan-500/10 text-cyan-300"
                )}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selecionar(op);
                }}
              >
                {op.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
