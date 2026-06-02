"use client";

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
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <div className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2">
        <Icon name="calendar_today" className="text-sm text-primary" />
        <label className="sr-only" htmlFor="date-range-start">
          Data inicial
        </label>
        <input
          id="date-range-start"
          type="date"
          className="border-0 bg-transparent text-label-md outline-none"
          value={value.start}
          max={value.end}
          onChange={(e) => onChange({ ...value, start: e.target.value })}
        />
        <span className="text-on-surface-variant">até</span>
        <label className="sr-only" htmlFor="date-range-end">
          Data final
        </label>
        <input
          id="date-range-end"
          type="date"
          className="border-0 bg-transparent text-label-md outline-none"
          value={value.end}
          min={value.start}
          max={todayISO()}
          onChange={(e) => onChange({ ...value, end: e.target.value })}
        />
      </div>
    </div>
  );
}
