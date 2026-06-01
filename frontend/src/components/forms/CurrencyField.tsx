"use client";

import { useState } from "react";
import { maskBRLInput, parseBRL } from "@/lib/currency";

interface CurrencyFieldProps {
  label: string;
  name: string;
  required?: boolean;
  className?: string;
  defaultValue?: number;
}

export default function CurrencyField({
  label,
  name,
  required,
  className = "",
  defaultValue = 0,
}: CurrencyFieldProps) {
  const [display, setDisplay] = useState(
    defaultValue > 0 ? maskBRLInput(String(Math.round(defaultValue * 100))) : ""
  );

  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1 block text-label-md text-on-surface-variant">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-on-surface-variant">
          R$
        </span>
        <input
          id={name}
          type="text"
          inputMode="decimal"
          className="input-fleet pl-10"
          placeholder="0,00"
          value={display}
          required={required}
          onChange={(e) => setDisplay(maskBRLInput(e.target.value))}
        />
      </div>
      <input type="hidden" name={name} value={parseBRL(display)} />
    </div>
  );
}
