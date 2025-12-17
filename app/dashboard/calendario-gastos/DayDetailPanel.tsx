"use client";

import type { DaySummary } from "./types";

interface DayDetailPanelProps {
  day: DaySummary | null;
  formatCurrency: (value: number) => string;
}

const formatLongDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

export default function DayDetailPanel({ day, formatCurrency }: DayDetailPanelProps) {
  return (
    <div className="glass-card flex h-full flex-col p-6">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Detalle</p>
        <h2 className="text-2xl font-semibold text-slate-900">
          {day ? formatLongDate(day.date) : "Seleccioná un día"}
        </h2>
        <p className="text-sm text-slate-500">
          {day ? `Total del día: ${formatCurrency(day.total)}` : "Los gastos aparecerán acá."}
        </p>
        {day?.categoriaPrincipal && (
          <p className="mt-1 text-xs uppercase tracking-wide text-emerald-600">
            Categoría destacada: {day.categoriaPrincipal}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {!day && (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Hacé click en un día del heatmap.
          </div>
        )}

        {day && day.gastos.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No registraste gastos este día.
          </div>
        )}

        {day && day.gastos.length > 0 && (
          <ul className="space-y-3">
            {day.gastos.map((gasto) => (
              <li
                key={gasto.id}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm shadow-sm"
              >
                <div>
                  <p className="font-semibold text-slate-800">{gasto.descripcion || "Gasto"}</p>
                  <p className="text-xs text-slate-500">{gasto.categoria || "Sin categoría"}</p>
                </div>
                <p className="font-semibold text-rose-500">-{formatCurrency(gasto.monto ?? 0)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
