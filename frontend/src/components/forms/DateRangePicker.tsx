"use client";

import { useRef } from "react";
import Icon from "@/components/ui/Icon";

export interface DateRange {
  start: string;
  end: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function defaultDateRange(days = 30): DateRange {
  return { start: daysAgoISO(days), end: todayISO() };
}

export default function DateRangePicker({ value, onChange, className = "" }: DateRangePickerProps) {
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);

  const openStartPicker = () => {
    try {
      startInputRef.current?.showPicker();
    } catch {
      startInputRef.current?.focus();
    }
  };

  const openEndPicker = () => {
    try {
      endInputRef.current?.showPicker();
    } catch {
      endInputRef.current?.focus();
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <div className="flex items-center gap-2 rounded-lg border border-outline-variant bg-white px-3 py-2">
        <button
          type="button"
          onClick={openStartPicker}
          className="flex items-center gap-1 focus:outline-none"
          title="Selecionar data inicial"
        >
          <Icon name="calendar_today" className="text-sm text-primary" />
        </button>
        <label className="sr-only" htmlFor="date-range-start">
          Data inicial
        </label>
        <input
          ref={startInputRef}
          id="date-range-start"
          type="date"
          className="border-0 bg-transparent text-label-md text-black outline-none cursor-pointer"
          value={value.start}
          max={value.end}
          onChange={(e) => onChange({ ...value, start: e.target.value })}
        />
        <span className="text-black/70">até</span>
        <label className="sr-only" htmlFor="date-range-end">
          Data final
        </label>
        <input
          ref={endInputRef}
          id="date-range-end"
          type="date"
          className="border-0 bg-transparent text-label-md text-black outline-none cursor-pointer"
          value={value.end}
          min={value.start}
          max={todayISO()}
          onChange={(e) => onChange({ ...value, end: e.target.value })}
        />
        <button
          type="button"
          onClick={openEndPicker}
          className="flex items-center gap-1 focus:outline-none"
          title="Selecionar data final"
        >
          <Icon name="date_range" className="text-sm text-primary" />
        </button>
      </div>
    </div>
  );
}
