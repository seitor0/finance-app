"use client";

import { useApp } from "@/context/AppContext";

export default function WidgetDisponible() {
  const { dineroDisponible } = useApp();

  const bruto = Number(dineroDisponible ?? 0);
  const esPositivo = bruto >= 0;
  const color = esPositivo ? "text-emerald-600" : "text-rose-600";
  const monto = Math.abs(bruto).toLocaleString("es-AR");

  return (
    <div className="p-5 rounded-2xl shadow bg-white">
      <h3 className="text-md font-semibold text-slate-700 mb-2">
        Disponible
      </h3>

      <p className={`text-4xl font-bold ${color}`}>
        {esPositivo ? "+" : "-"}${monto}
      </p>

      <p className="text-xs text-slate-400 mt-1">
        (Ingresos – Gastos)
      </p>
    </div>
  );
}
