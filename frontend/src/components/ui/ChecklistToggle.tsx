"use client";

import Icon from "@/components/ui/Icon";

interface ChecklistToggleProps {
  label: string;
  completed: boolean;
  onToggle: () => void;
}

export default function ChecklistToggle({ label, completed, onToggle }: ChecklistToggleProps) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg border p-3 transition ${
        completed
          ? "border-green-300 bg-green-50"
          : "border-red-200 bg-red-50/80"
      }`}
    >
      <span className={`text-body-md font-medium ${completed ? "text-green-900" : "text-red-900"}`}>
        {label}
      </span>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={completed}
        aria-label={completed ? `Marcar ${label} como pendente` : `Marcar ${label} como concluído`}
        className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase transition ${
          completed
            ? "bg-green-600 text-white hover:bg-green-700"
            : "bg-red-600 text-white hover:bg-red-700"
        }`}
      >
        <Icon name={completed ? "check_circle" : "cancel"} className="text-base" filled />
        {completed ? "Concluído" : "Pendente"}
      </button>
    </div>
  );
}
