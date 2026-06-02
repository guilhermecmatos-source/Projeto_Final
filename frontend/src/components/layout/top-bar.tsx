"use client";

import { Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TopBarProps {
  titulo?: string;
  onAbrirMenu: () => void;
  tema: "light" | "dark";
  onAlternarTema: () => void;
  acao?: React.ReactNode;
}

export function TopBar({ titulo, onAbrirMenu, tema, onAlternarTema, acao }: TopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-outline-variant bg-surface-container-lowest/95 px-4 backdrop-blur">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onAbrirMenu}>
        <Menu className="h-5 w-5" />
      </Button>
      <h1 className="flex-1 truncate text-base font-semibold text-on-surface">{titulo ?? "FleetAI"}</h1>
      {acao}
      <Button variant="ghost" size="icon" onClick={onAlternarTema} aria-label="Tema">
        {tema === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    </header>
  );
}

/** Barra de status GPS — fora do container do mapa */
interface MapGpsTopBarProps {
  gpsAoVivo: boolean;
}

export function MapGpsTopBar({ gpsAoVivo }: MapGpsTopBarProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-2 border-b px-4 py-2.5 text-sm font-medium",
        gpsAoVivo
          ? "border-emerald-900/50 bg-emerald-950/50 text-emerald-300"
          : "border-amber-900/50 bg-amber-950/50 text-amber-200"
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          gpsAoVivo ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
        )}
      />
      {gpsAoVivo
        ? "GPS em tempo real · atualizado agora"
        : "GPS indisponível — usando simulação da frota"}
    </div>
  );
}
