"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { slideUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface StatCardProps {
  titulo: string;
  valor: string;
  icone: LucideIcon;
  destaque?: "cyan" | "emerald" | "amber" | "red";
  atraso?: number;
}

const CORES = {
  cyan: "text-cyan-400 bg-cyan-500/10",
  emerald: "text-emerald-400 bg-emerald-500/10",
  amber: "text-amber-400 bg-amber-500/10",
  red: "text-red-400 bg-red-500/10",
};

export function StatCard({ titulo, valor, icone: Icone, destaque = "cyan", atraso = 0 }: StatCardProps) {
  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      animate="animate"
      transition={{ delay: atraso }}
      className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/70 p-5"
    >
      <div className={cn("mb-3 inline-flex rounded-xl p-2.5", CORES[destaque])}>
        <Icone className="h-5 w-5" />
      </div>
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{titulo}</p>
      <p className="mt-1 text-2xl font-bold text-gray-50">{valor}</p>
    </motion.div>
  );
}
