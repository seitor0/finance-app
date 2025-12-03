"use client";

import { useApp } from "@/context/AppContext";

export default function WidgetCosasPorPagar() {
  const { cosasPorPagar } = useApp();

  // Mostramos todo lo que NO está pagado (falta + pospuesto)
  const pendientes = cosasPorPagar.filter(
    (c) => c.status !== "pagado"
  );

  return (
    <div className="p-6 rounded-xl bg-white/10 backdrop-blur shadow">
      <h2 className="text-xl font-semibold mb-2">Cosas por pagar</h2>

      {pendientes.length === 0 && (
        <p className="text-gray-400 text-sm">
          No tenés nada pendiente
        </p>
      )}

      <ul className="text-sm space-y-1">
        {pendientes.slice(0, 3).map((c) => {
          const monto = Number(c.monto ?? 0) || 0;

          return (
            <li key={c.id} className="flex justify-between">
              <span>
                {c.nombre}
                {c.status === "pospuesto" && (
                  <span className="ml-2 text-xs text-amber-500">
                    (pospuesto)
                  </span>
                )}
              </span>
              <span className="text-gray-400">
                ${monto.toLocaleString("es-AR")}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
