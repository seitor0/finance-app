"use client";

import type { DaySummary } from "./types";

interface TooltipProps {
  day: DaySummary;
  position: { x: number; y: number };
  formatCurrency: (value: number) => string;
}

const formatDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
};

export default function Tooltip({ day, position, formatCurrency }: TooltipProps) {
  const offset = 16;
  const left = position.x + offset;
  const top = position.y + offset;

  return (
    <div
      className="pointer-events-none fixed z-50 min-w-[220px] rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-xs shadow-2xl backdrop-blur"
      style={{ left, top }}
    >
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{formatDate(day.date)}</p>
      <p className="mt-1 text-base font-semibold text-slate-900">{formatCurrency(day.total)}</p>
      <p className="mt-1 text-[11px] text-slate-500">
        Categoría principal: <span className="font-semibold text-slate-700">{day.categoriaPrincipal || "Sin categoría"}</span>
      </p>
    </div>
  );
}
