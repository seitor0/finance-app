"use client";

export default function WidgetDisponible({ balanceMes }: { balanceMes: number }) {
  
  const color =
    balanceMes >= 0 ? "text-emerald-600" : "text-rose-600";

  return (
    <div className="p-5 rounded-2xl shadow bg-white">
      <h3 className="text-md font-semibold text-slate-700 mb-2">
        Disponible
      </h3>

      <p className={`text-4xl font-bold ${color}`}>
        {balanceMes >= 0 ? "+" : "-"}$
        {Math.abs(balanceMes).toLocaleString("es-AR")}
      </p>

      <p className="text-xs text-slate-400 mt-1">
        (Ingresos – Gastos – Pendientes)
      </p>
    </div>
  );
}
