import React from "react";

export function KpiSkeleton() {
  return (
    <div className="raised-card p-4 animate-pulse space-y-3 bg-[#0c132b]/80 border border-outline-variant/20">
      <div className="flex justify-between">
        <div className="h-3 w-24 rounded bg-slate-700/60" />
        <div className="h-6 w-6 rounded-full bg-slate-700/60" />
      </div>
      <div className="h-8 w-36 rounded bg-slate-700/80" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="raised-card p-4 animate-pulse space-y-4 bg-[#0c132b]/80 border border-outline-variant/20">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-4 w-28 rounded bg-slate-700/80" />
          <div className="h-3 w-40 rounded bg-slate-700/60" />
        </div>
        <div className="h-3 w-16 rounded bg-slate-700/60" />
      </div>
      
      <div className="h-8 rounded bg-slate-800/80 border border-slate-700/20" />

      <div className="space-y-2.5 pt-2">
        <div className="h-2.5 w-full rounded bg-slate-700/40" />
        <div className="h-2.5 w-full rounded bg-slate-700/40" />
        <div className="h-2.5 w-2/3 rounded bg-slate-700/40" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse border-b border-outline-variant/10">
      <td className="px-4 py-3"><div className="h-4 w-28 rounded bg-slate-700/60" /></td>
      <td className="px-4 py-3"><div className="h-4 w-12 rounded bg-slate-700/60" /></td>
      <td className="px-4 py-3"><div className="h-4 w-20 rounded bg-slate-700/60" /></td>
      <td className="px-4 py-3"><div className="h-4 w-16 rounded bg-slate-700/60" /></td>
      <td className="px-4 py-3"><div className="h-4 w-8 rounded bg-slate-700/60" /></td>
      <td className="px-4 py-3"><div className="h-4 w-14 rounded bg-slate-700/60" /></td>
    </tr>
  );
}

export function ListRowSkeleton() {
  return (
    <div className="py-3 flex justify-between items-center animate-pulse border-b border-outline-variant/10">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded bg-slate-700/60" />
        <div className="space-y-2">
          <div className="h-3.5 w-32 rounded bg-slate-700/80" />
          <div className="h-2.5 w-48 rounded bg-slate-700/50" />
        </div>
      </div>
      <div className="text-right space-y-1.5">
        <div className="h-3.5 w-16 rounded bg-slate-700/80" />
        <div className="h-2.5 w-12 rounded bg-slate-700/50" />
      </div>
    </div>
  );
}
