"use client";

import { useEffect, useId, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import { geocodingApi } from "@/services/api";

interface AddressAutocompleteProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}

export default function AddressAutocomplete({
  label,
  name,
  value,
  onChange,
  required,
  placeholder = "Digite cidade, endereço ou unidade...",
}: AddressAutocompleteProps) {
  const listId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<{ label: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (value.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      setLoading(true);
      geocodingApi
        .places(value)
        .then((res) => setSuggestions(Array.isArray(res.data) ? res.data : []))
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className="mb-1 block text-label-md text-on-surface-variant">{label}</label>
      <div className="relative">
        <Icon
          name="location_on"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant"
        />
        <input
          className="input-fleet pl-10"
          name={name}
          required={required}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          list={listId}
        />
      </div>
      {open && suggestions.length > 0 && (
        <ul
          id={listId}
          className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-outline-variant bg-surface shadow-lg"
        >
          {suggestions.map((s) => (
            <li key={s.label}>
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm hover:bg-surface-container-low"
                onClick={() => {
                  onChange(s.label);
                  setOpen(false);
                }}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      {loading && (
        <p className="mt-1 text-xs text-on-surface-variant">Buscando endereços...</p>
      )}
    </div>
  );
}
