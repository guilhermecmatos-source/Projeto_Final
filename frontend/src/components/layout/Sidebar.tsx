"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ITENS_SIDEBAR } from "@/lib/navigation";
import type { User } from "@/types";

interface SidebarProps {
  usuario: User | null;
  aberta: boolean;
  colapsada: boolean;
  onFechar: () => void;
  onAlternarColapso: () => void;
}

export function Sidebar({
  usuario,
  aberta,
  colapsada,
  onFechar,
  onAlternarColapso,
}: SidebarProps) {
  const pathname = usePathname();
  const largura = colapsada ? "w-[72px]" : "w-64";

  return (
    <>
      <AnimatePresence>
        {aberta && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            aria-label="Fechar menu"
            onClick={onFechar}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-outline-variant bg-surface-container-lowest transition-all duration-300",
          largura,
          aberta ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-outline-variant px-3">
          {!colapsada && (
            <div className="px-1">
              <p className="text-lg font-bold tracking-tight text-on-surface">FleetAI</p>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Gestão de Frotas</p>
            </div>
          )}
          <button
            type="button"
            className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low lg:hidden"
            onClick={onFechar}
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="hidden rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low lg:block"
            onClick={onAlternarColapso}
            aria-label={colapsada ? "Expandir" : "Recolher"}
          >
            {colapsada ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          {ITENS_SIDEBAR.map((item) => {
            const ativo = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icone = item.icon;
            return (
              <Link key={item.href} href={item.href} onClick={onFechar}>
                <motion.span
                  whileHover={{ x: colapsada ? 0 : 4 }}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    ativo
                      ? "bg-primary-container/40 text-primary"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                  )}
                >
                  {ativo && (
                    <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                  )}
                  <Icone className={cn("h-5 w-5 shrink-0", ativo && "text-primary")} />
                  {!colapsada && item.label}
                </motion.span>
              </Link>
            );
          })}
        </nav>

        {!colapsada && usuario && (
          <div className="border-t border-outline-variant p-4">
            <p className="truncate text-sm font-semibold text-on-surface">{usuario.name}</p>
            <p className="truncate text-xs capitalize text-on-surface-variant">{usuario.role}</p>
          </div>
        )}
      </aside>
    </>
  );
}
