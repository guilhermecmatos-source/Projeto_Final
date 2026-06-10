"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface SearchableComboboxProps {
  label: string;
  name: string;
  options: ComboboxOption[];
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  defaultValue?: string;
  allowCustom?: boolean;
  onValueChange?: (value: string, label: string) => void;
}

export default function SearchableCombobox({
  label,
  name,
  options,
  required,
  disabled,
  placeholder = "Digite para buscar...",
  defaultValue = "",
  allowCustom = true,
  onValueChange,
}: SearchableComboboxProps) {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const initial = options.find((o) => o.value === defaultValue);
  const [query, setQuery] = useState(initial?.label ?? "");
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return options.filter((o) => o.value);
    return options.filter(
      (o) => o.value && (o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q))
    );
  }, [options, query]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function selectOption(opt: ComboboxOption) {
    setValue(opt.value);
    setQuery(opt.label);
    setOpen(false);
    onValueChange?.(opt.value, opt.label);
  }

  function handleInputChange(text: string) {
    setQuery(text);
    setOpen(true);
    const exact = options.find(
      (o) => o.label.toLowerCase() === text.toLowerCase() || o.value.toLowerCase() === text.toLowerCase()
    );
    if (exact) {
      setValue(exact.value);
      onValueChange?.(exact.value, exact.label);
    } else if (allowCustom) {
      setValue(text);
      onValueChange?.(text, text);
    } else {
      setValue("");
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={listId} className="mb-1 block text-label-md text-on-surface-variant">
        {label}
      </label>
      <input type="hidden" name={name} value={value} required={required && !value} />
      <div className="relative">
        <Icon
          name="search"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant"
        />
        <input
          id={listId}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          className="input-fleet pl-10"
          placeholder={placeholder}
          value={query}
          disabled={disabled}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setOpen(true)}
          autoComplete="off"
        />
      </div>
      {open && filtered.length > 0 && (
        <ul
          className="absolute z-30 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-outline-variant bg-white shadow-lg"
          role="listbox"
        >
          {filtered.slice(0, 20).map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                className={`w-full px-4 py-2 text-left text-sm hover:bg-primary-container/10 ${
                  opt.value === value ? "bg-black text-white font-semibold" : "text-slate-900"
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectOption(opt);
                }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && query && filtered.length === 0 && allowCustom && (
        <p className="mt-1 text-xs text-on-surface-variant">
          Usando valor digitado: &quot;{query}&quot;
        </p>
      )}
    </div>
  );
}
